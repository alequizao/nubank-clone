<?php
/**
 * Área Pix: chaves, BR Code (copia e cola), cobranças, agendamentos e limites.
 * As operações em si ficam em dados.php; aqui vive a parte específica do Pix.
 */
require_once __DIR__ . '/db.php';

// ── Chaves ────────────────────────────────────────────────────────────────

function pix_chaves() {
    $rows = db()->query('SELECT * FROM pix_chaves ORDER BY principal DESC, id')->fetchAll();
    foreach ($rows as &$r) { $r['principal'] = (bool) $r['principal']; }
    return $rows;
}

function pix_chave_principal() {
    $c = db()->query('SELECT valor FROM pix_chaves ORDER BY principal DESC, id LIMIT 1')->fetchColumn();
    if ($c) { return $c; }
    $p = db()->query('SELECT chave_pix FROM perfil WHERE id = 1')->fetchColumn();
    return $p ?: 'chave-nao-cadastrada';
}

/** Rótulo amigável do tipo da chave. */
function pix_tipo_rotulo($tipo) {
    $mapa = [
        'cpf' => 'CPF', 'cnpj' => 'CNPJ', 'email' => 'E-mail',
        'telefone' => 'Celular', 'aleatoria' => 'Chave aleatória',
    ];
    return isset($mapa[$tipo]) ? $mapa[$tipo] : $tipo;
}

/** Descobre o tipo pelo formato do que foi digitado. */
function pix_detectar_tipo($valor) {
    $so_numeros = preg_replace('/\D/', '', $valor);
    if (filter_var($valor, FILTER_VALIDATE_EMAIL))                 return 'email';
    if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-/i', $valor))        return 'aleatoria';
    if (strlen($so_numeros) === 11 && $valor[0] === '(')           return 'telefone';
    if (strlen($so_numeros) === 11)                                return 'cpf';
    if (strlen($so_numeros) === 14)                                return 'cnpj';
    if (strlen($so_numeros) >= 10 && strlen($so_numeros) <= 13)    return 'telefone';
    return 'aleatoria';
}

function pix_chave_aleatoria() {
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}

// ── BR Code (copia e cola) ────────────────────────────────────────────────

/** Monta um campo no formato EMV: id + tamanho + valor. */
function emv($id, $valor) {
    return $id . str_pad(strlen($valor), 2, '0', STR_PAD_LEFT) . $valor;
}

/** CRC16-CCITT (polinômio 0x1021), como manda o padrão do BR Code. */
function crc16($dados) {
    $crc = 0xFFFF;
    for ($i = 0; $i < strlen($dados); $i++) {
        $crc ^= ord($dados[$i]) << 8;
        for ($b = 0; $b < 8; $b++) {
            $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) : ($crc << 1);
            $crc &= 0xFFFF;
        }
    }
    return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
}

/** Só o que o padrão aceita: maiúsculas sem acento, tamanho limitado. */
function pix_texto($texto, $max) {
    $t = iconv('UTF-8', 'ASCII//TRANSLIT', $texto);
    $t = preg_replace('/[^A-Za-z0-9 ]/', '', $t);
    return strtoupper(substr(trim($t), 0, $max));
}

/**
 * Gera o "copia e cola" do Pix no formato BR Code (EMV MPM).
 * Valor 0 vira cobrança sem valor definido, como no app.
 */
function pix_br_code($chave, $valor, $nome, $cidade = 'MACEIO', $descricao = '') {
    $conta = emv('00', 'br.gov.bcb.pix') . emv('01', $chave);
    if ($descricao !== '') { $conta .= emv('02', pix_texto($descricao, 25)); }

    $payload  = emv('00', '01');
    $payload .= emv('01', '12');                       // uso múltiplo
    $payload .= emv('26', $conta);
    $payload .= emv('52', '0000');                     // categoria do lojista
    $payload .= emv('53', '986');                      // BRL
    if ($valor > 0) { $payload .= emv('54', number_format($valor, 2, '.', '')); }
    $payload .= emv('58', 'BR');
    $payload .= emv('59', pix_texto($nome, 25));
    $payload .= emv('60', pix_texto($cidade, 15));
    $payload .= emv('62', emv('05', '***'));
    $payload .= '6304';

    return $payload . crc16($payload);
}

/** Lê um BR Code colado e devolve chave, nome e valor. */
function pix_ler_br_code($codigo) {
    $codigo = trim(preg_replace('/\s+/', '', $codigo));
    if ($codigo === '') { return null; }

    $campos = [];
    $i = 0;
    $n = strlen($codigo);
    while ($i + 4 <= $n) {
        $id  = substr($codigo, $i, 2);
        $len = (int) substr($codigo, $i + 2, 2);
        $val = substr($codigo, $i + 4, $len);
        $campos[$id] = $val;
        $i += 4 + $len;
    }
    if (!isset($campos['26'])) { return null; }

    $sub = [];
    $j = 0;
    $m = strlen($campos['26']);
    while ($j + 4 <= $m) {
        $id  = substr($campos['26'], $j, 2);
        $len = (int) substr($campos['26'], $j + 2, 2);
        $sub[$id] = substr($campos['26'], $j + 4, $len);
        $j += 4 + $len;
    }

    return [
        'chave'     => isset($sub['01']) ? $sub['01'] : '',
        'descricao' => isset($sub['02']) ? $sub['02'] : '',
        'nome'      => isset($campos['59']) ? $campos['59'] : '',
        'cidade'    => isset($campos['60']) ? $campos['60'] : '',
        'valor'     => isset($campos['54']) ? (float) $campos['54'] : 0.0,
    ];
}

// ── Cobranças e agendamentos ──────────────────────────────────────────────

function pix_cobrancas($limite = 20) {
    $st = db()->prepare('SELECT * FROM pix_cobrancas ORDER BY id DESC LIMIT ?');
    $st->bindValue(1, (int) $limite, PDO::PARAM_INT);
    $st->execute();
    $rows = $st->fetchAll();
    foreach ($rows as &$r) { $r['valor'] = (float) $r['valor']; }
    return $rows;
}

function pix_agendados() {
    $rows = db()->query('SELECT * FROM pix_agendados ORDER BY
        FIELD(status, "agendado", "falhou", "executado", "cancelado"), data_agendada')->fetchAll();
    foreach ($rows as &$r) { $r['valor'] = (float) $r['valor']; }
    return $rows;
}

// ── Limites ───────────────────────────────────────────────────────────────

/** Quanto já saiu de Pix hoje. */
function pix_enviado_hoje() {
    return (float) db()->query("SELECT COALESCE(SUM(valor), 0) FROM transacoes
        WHERE sinal = 'saida' AND origem = 'conta'
          AND tipo IN ('pix_enviado','pix_agendado')
          AND DATE(data) = CURDATE()")->fetchColumn();
}

/** Entre 20h e 6h vale o limite noturno, que costuma ser menor. */
function pix_e_noturno() {
    $h = (int) date('G');
    return $h >= 20 || $h < 6;
}

<?php
/**
 * Camada de dados do app: leitura do estado e as operações simuladas
 * (Pix, transferência, pagamento, depósito, cartão, empréstimo...).
 */
require_once __DIR__ . '/db.php';

function perfil() {
    $p = db()->query('SELECT * FROM perfil WHERE id = 1')->fetch();
    if (!$p) {
        db()->exec('INSERT INTO perfil (id, nome) VALUES (1, "Cliente")');
        $p = db()->query('SELECT * FROM perfil WHERE id = 1')->fetch();
    }
    foreach (['saldo','guardado','rendimento_mes','limite_total','fatura_atual',
              'limite_liberado','emprestimo_disponivel','emprestimo_contratado'] as $c) {
        $p[$c] = (float) $p[$c];
    }
    $p['limite_disponivel'] = round($p['limite_total'] - $p['fatura_atual'], 2);
    return $p;
}

function cartoes() {
    $rows = db()->query('SELECT * FROM cartoes ORDER BY ordem, id')->fetchAll();
    foreach ($rows as &$r) {
        $r['limite']    = (float) $r['limite'];
        $r['bloqueado'] = (bool) $r['bloqueado'];
    }
    return $rows;
}

function contatos() {
    return db()->query('SELECT * FROM contatos ORDER BY nome')->fetchAll();
}

function transacoes($limite = 300) {
    $st = db()->prepare('SELECT * FROM transacoes ORDER BY data DESC, id DESC LIMIT ?');
    $st->bindValue(1, (int) $limite, PDO::PARAM_INT);
    $st->execute();
    $rows = $st->fetchAll();
    foreach ($rows as &$r) { $r['valor'] = (float) $r['valor']; }
    return $rows;
}

function estado() {
    return [
        'perfil'     => perfil(),
        'cartoes'    => cartoes(),
        'contatos'   => contatos(),
        'transacoes' => transacoes(),
    ];
}

function registrar($tipo, $titulo, $valor, $sinal, $opcoes = []) {
    $st = db()->prepare(
        'INSERT INTO transacoes (tipo, titulo, contraparte, descricao, valor, sinal, origem, icone, data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())'
    );
    $st->execute([
        $tipo,
        $titulo,
        isset($opcoes['contraparte']) ? $opcoes['contraparte'] : null,
        isset($opcoes['descricao']) ? $opcoes['descricao'] : null,
        round($valor, 2),
        $sinal,
        isset($opcoes['origem']) ? $opcoes['origem'] : 'conta',
        isset($opcoes['icone']) ? $opcoes['icone'] : 'dollar-sign',
    ]);
    return (int) db()->lastInsertId();
}

function ajustar_perfil($campos) {
    $sets = [];
    $vals = [];
    foreach ($campos as $c => $v) {
        $sets[] = "`$c` = ?";
        $vals[] = $v;
    }
    $vals[] = 1;
    db()->prepare('UPDATE perfil SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($vals);
}

/** Falha de operação com mensagem amigável. */
class OperacaoInvalida extends Exception {}

function exige_valor($valor) {
    $valor = round((float) $valor, 2);
    if ($valor <= 0) {
        throw new OperacaoInvalida('Informe um valor maior que zero.');
    }
    return $valor;
}

function debita_conta($valor) {
    $p = perfil();
    if ($valor > $p['saldo']) {
        throw new OperacaoInvalida('Saldo insuficiente. Disponível: R$ ' . number_format($p['saldo'], 2, ',', '.'));
    }
    ajustar_perfil(['saldo' => $p['saldo'] - $valor]);
}

function credita_conta($valor) {
    $p = perfil();
    ajustar_perfil(['saldo' => $p['saldo'] + $valor]);
}

/**
 * Executa uma operação simulada. Retorna a mensagem de sucesso.
 */
function operar($acao, $in) {
    $valor  = isset($in['valor']) ? $in['valor'] : 0;
    $nome   = trim(isset($in['nome']) ? $in['nome'] : '');
    $desc   = trim(isset($in['descricao']) ? $in['descricao'] : '');
    $pdo    = db();

    $pdo->beginTransaction();
    try {
        switch ($acao) {
            case 'pix_enviar':
                $valor = exige_valor($valor);
                if ($nome === '') { throw new OperacaoInvalida('Informe o destinatário.'); }
                debita_conta($valor);
                registrar('pix_enviado', 'Transferência enviada', $valor, 'saida',
                    ['contraparte' => $nome, 'descricao' => $desc ?: 'Pix', 'icone' => 'arrow-up-right']);
                $msg = 'Pix de R$ ' . number_format($valor, 2, ',', '.') . ' enviado para ' . $nome . '.';
                break;

            case 'pix_receber':
                $valor = exige_valor($valor);
                credita_conta($valor);
                registrar('pix_recebido', 'Transferência recebida', $valor, 'entrada',
                    ['contraparte' => $nome ?: 'Pix recebido', 'descricao' => $desc ?: 'Pix', 'icone' => 'arrow-down-left']);
                $msg = 'Você recebeu R$ ' . number_format($valor, 2, ',', '.') . '.';
                break;

            case 'transferir':
                $valor = exige_valor($valor);
                if ($nome === '') { throw new OperacaoInvalida('Informe o destinatário.'); }
                debita_conta($valor);
                registrar('transferencia', 'Transferência enviada', $valor, 'saida',
                    ['contraparte' => $nome, 'descricao' => $desc ?: 'TED', 'icone' => 'send']);
                $msg = 'Transferência de R$ ' . number_format($valor, 2, ',', '.') . ' concluída.';
                break;

            case 'pagar':
                $valor = exige_valor($valor);
                debita_conta($valor);
                registrar('pagamento', 'Pagamento efetuado', $valor, 'saida',
                    ['contraparte' => $nome ?: 'Boleto', 'descricao' => $desc ?: 'Código de barras', 'icone' => 'file-text']);
                $msg = 'Pagamento de R$ ' . number_format($valor, 2, ',', '.') . ' realizado.';
                break;

            case 'depositar':
                $valor = exige_valor($valor);
                credita_conta($valor);
                registrar('deposito', 'Depósito recebido', $valor, 'entrada',
                    ['contraparte' => $nome ?: 'Boleto de depósito', 'icone' => 'download']);
                $msg = 'Depósito de R$ ' . number_format($valor, 2, ',', '.') . ' confirmado.';
                break;

            case 'recarga':
                $valor = exige_valor($valor);
                debita_conta($valor);
                registrar('recarga', 'Recarga de celular', $valor, 'saida',
                    ['contraparte' => $nome ?: 'Celular', 'icone' => 'smartphone']);
                $msg = 'Recarga de R$ ' . number_format($valor, 2, ',', '.') . ' efetuada.';
                break;

            case 'cobrar':
                $valor = exige_valor($valor);
                registrar('cobranca', 'Cobrança criada', $valor, 'entrada',
                    ['contraparte' => $nome ?: 'Cobrança', 'descricao' => 'Aguardando pagamento', 'icone' => 'inbox']);
                $msg = 'Cobrança de R$ ' . number_format($valor, 2, ',', '.') . ' gerada.';
                break;

            case 'guardar':
                $valor = exige_valor($valor);
                debita_conta($valor);
                $p = perfil();
                ajustar_perfil(['guardado' => $p['guardado'] + $valor]);
                registrar('guardar', 'Dinheiro guardado', $valor, 'saida',
                    ['contraparte' => 'Caixinha', 'icone' => 'lock']);
                $msg = 'R$ ' . number_format($valor, 2, ',', '.') . ' guardados na caixinha.';
                break;

            case 'resgatar':
                $valor = exige_valor($valor);
                $p = perfil();
                if ($valor > $p['guardado']) { throw new OperacaoInvalida('Você não tem esse valor guardado.'); }
                ajustar_perfil(['guardado' => $p['guardado'] - $valor, 'saldo' => $p['saldo'] + $valor]);
                registrar('resgate', 'Resgate da caixinha', $valor, 'entrada',
                    ['contraparte' => 'Caixinha', 'icone' => 'unlock']);
                $msg = 'R$ ' . number_format($valor, 2, ',', '.') . ' resgatados.';
                break;

            case 'compra_credito':
                $valor = exige_valor($valor);
                $p = perfil();
                if ($valor > $p['limite_disponivel']) { throw new OperacaoInvalida('Limite insuficiente.'); }
                ajustar_perfil(['fatura_atual' => $p['fatura_atual'] + $valor]);
                registrar('compra_credito', 'Compra no crédito', $valor, 'saida',
                    ['contraparte' => $nome ?: 'Estabelecimento', 'origem' => 'credito', 'icone' => 'credit-card']);
                $msg = 'Compra de R$ ' . number_format($valor, 2, ',', '.') . ' lançada na fatura.';
                break;

            case 'pagar_fatura':
                $p = perfil();
                $valor = exige_valor($valor ?: $p['fatura_atual']);
                if ($valor > $p['fatura_atual']) { throw new OperacaoInvalida('Valor maior que a fatura atual.'); }
                debita_conta($valor);
                $p = perfil();
                ajustar_perfil(['fatura_atual' => $p['fatura_atual'] - $valor]);
                registrar('pagamento_fatura', 'Pagamento de fatura', $valor, 'saida',
                    ['contraparte' => 'Cartão de crédito', 'icone' => 'credit-card']);
                $msg = 'Fatura paga: R$ ' . number_format($valor, 2, ',', '.') . '.';
                break;

            case 'ajustar_limite':
                $novo = round((float) $valor, 2);
                $p = perfil();
                if ($novo < 0 || $novo > $p['limite_total']) {
                    throw new OperacaoInvalida('O limite liberado deve ficar entre 0 e R$ ' . number_format($p['limite_total'], 2, ',', '.') . '.');
                }
                ajustar_perfil(['limite_liberado' => $novo]);
                $msg = 'Limite ajustado para R$ ' . number_format($novo, 2, ',', '.') . '.';
                break;

            case 'contratar_emprestimo':
                $valor = exige_valor($valor);
                $p = perfil();
                if ($valor > $p['emprestimo_disponivel']) { throw new OperacaoInvalida('Valor acima do disponível para empréstimo.'); }
                ajustar_perfil([
                    'saldo'                 => $p['saldo'] + $valor,
                    'emprestimo_disponivel' => $p['emprestimo_disponivel'] - $valor,
                    'emprestimo_contratado' => $p['emprestimo_contratado'] + $valor,
                ]);
                registrar('emprestimo', 'Empréstimo contratado', $valor, 'entrada',
                    ['contraparte' => 'Nubank', 'icone' => 'trending-up']);
                $msg = 'Empréstimo de R$ ' . number_format($valor, 2, ',', '.') . ' liberado na conta.';
                break;

            default:
                throw new OperacaoInvalida('Operação desconhecida: ' . $acao);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    return $msg;
}

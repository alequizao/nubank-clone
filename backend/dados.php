<?php
/**
 * Camada de dados do app: leitura do estado e as operações simuladas
 * (Pix, transferência, pagamento, depósito, cartão, empréstimo...).
 */
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/pix.php';

function perfil() {
    $p = db()->query('SELECT * FROM perfil WHERE id = 1')->fetch();
    if (!$p) {
        db()->exec('INSERT INTO perfil (id, nome) VALUES (1, "Cliente")');
        $p = db()->query('SELECT * FROM perfil WHERE id = 1')->fetch();
    }
    foreach (['saldo','guardado','rendimento_mes','limite_total','fatura_atual',
              'limite_liberado','emprestimo_disponivel','emprestimo_contratado',
              'limite_pix_diario','limite_pix_noturno'] as $c) {
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

/** Taxa base usada no rendimento das caixinhas (CDI ao ano). */
define('CDI_ANUAL', 0.1490);

function caixinhas() {
    render_caixinhas();
    $rows = db()->query('SELECT * FROM caixinhas ORDER BY ordem, id')->fetchAll();
    foreach ($rows as &$r) {
        foreach (['objetivo', 'saldo', 'rendimento_acumulado', 'percentual_cdi'] as $c) {
            $r[$c] = (float) $r[$c];
        }
        $r['rende']    = (bool) $r['rende'];
        $r['progresso'] = $r['objetivo'] > 0 ? min(1, round($r['saldo'] / $r['objetivo'], 4)) : null;
    }
    return $rows;
}

/**
 * Credita o rendimento acumulado desde a última vez, dia a dia.
 * É idempotente: roda quantas vezes quiser no mesmo dia sem render duas vezes.
 */
function render_caixinhas() {
    static $jaRodou = false;
    if ($jaRodou) return;
    $jaRodou = true;

    $hoje  = new DateTime('today');
    $lista = db()->query('SELECT * FROM caixinhas WHERE rende = 1 AND saldo > 0')->fetchAll();
    if (!$lista) { sincronizar_guardado(); return; }

    $upd = db()->prepare('UPDATE caixinhas SET saldo = ?, rendimento_acumulado = ?, ultimo_rendimento = ? WHERE id = ?');

    foreach ($lista as $c) {
        $desde = $c['ultimo_rendimento']
            ? new DateTime($c['ultimo_rendimento'])
            : new DateTime($c['criado_em']);
        $desde->setTime(0, 0);
        $dias = (int) $desde->diff($hoje)->days;
        if ($dias < 1) continue;
        if ($dias > 730) { $dias = 730; }          // não reconstrói anos de histórico

        $saldo = (float) $c['saldo'];
        $taxa  = CDI_ANUAL * ((float) $c['percentual_cdi'] / 100);
        $fator = pow(1 + $taxa, 1 / 365) - 1;      // taxa equivalente diária
        $juros = round($saldo * (pow(1 + $fator, $dias) - 1), 2);
        if ($juros <= 0) {
            $upd->execute([$saldo, (float) $c['rendimento_acumulado'], $hoje->format('Y-m-d'), $c['id']]);
            continue;
        }

        $upd->execute([
            $saldo + $juros,
            (float) $c['rendimento_acumulado'] + $juros,
            $hoje->format('Y-m-d'),
            $c['id'],
        ]);

        registrar('rendimento_caixinha', 'Rendimento da caixinha', $juros, 'entrada', [
            'contraparte' => $c['nome'],
            'descricao'   => $dias === 1
                ? sprintf('%s%% do CDI · 1 dia', rtrim(rtrim(number_format($c['percentual_cdi'], 2, ',', '.'), '0'), ','))
                : sprintf('%s%% do CDI · %d dias', rtrim(rtrim(number_format($c['percentual_cdi'], 2, ',', '.'), '0'), ','), $dias),
            'origem'      => 'caixinha',
            'icone'       => 'trending-up',
        ]);
    }

    sincronizar_guardado();
}

/** `perfil.guardado` é sempre a soma das caixinhas. */
function sincronizar_guardado() {
    $total = (float) db()->query('SELECT COALESCE(SUM(saldo), 0) FROM caixinhas')->fetchColumn();
    db()->prepare('UPDATE perfil SET guardado = ? WHERE id = 1')->execute([round($total, 2)]);
    return round($total, 2);
}

function caixinha($id) {
    $st = db()->prepare('SELECT * FROM caixinhas WHERE id = ?');
    $st->execute([(int) $id]);
    $c = $st->fetch();
    if (!$c) {
        // Sem id (ou id inválido) cai na primeira caixinha — evita erro bobo
        // em chamadas antigas da API e no atalho genérico.
        $c = db()->query('SELECT * FROM caixinhas ORDER BY ordem, id LIMIT 1')->fetch();
    }
    if (!$c) { throw new OperacaoInvalida('Nenhuma caixinha cadastrada. Crie uma primeiro.'); }
    return $c;
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
    $caixinhas = caixinhas();      // roda o rendimento antes de ler o perfil
    processar_agendados();          // executa os Pix agendados que venceram
    return [
        'perfil'     => perfil(),
        'caixinhas'  => $caixinhas,
        'pix'        => [
            'chaves'        => pix_chaves(),
            'chave_principal' => pix_chave_principal(),
            'cobrancas'     => pix_cobrancas(),
            'agendados'     => pix_agendados(),
            'enviado_hoje'  => pix_enviado_hoje(),
            'noturno'       => pix_e_noturno(),
        ],
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

/** Barra o Pix que estoura o limite diário (ou o noturno, entre 20h e 6h). */
function conferir_limite_pix($valor) {
    $p     = perfil();
    $hoje  = pix_enviado_hoje();
    $noite = pix_e_noturno();
    $limite = $noite ? (float) $p['limite_pix_noturno'] : (float) $p['limite_pix_diario'];

    if ($noite && $valor > $limite) {
        throw new OperacaoInvalida('Entre 20h e 6h o limite por Pix é de R$ '
            . number_format($limite, 2, ',', '.') . '. Ajuste em Limites, na área Pix.');
    }
    if (!$noite && $hoje + $valor > $limite) {
        throw new OperacaoInvalida('Isso passa do seu limite diário de Pix (R$ '
            . number_format($limite, 2, ',', '.') . '). Hoje você já enviou R$ '
            . number_format($hoje, 2, ',', '.') . '.');
    }
}

/**
 * Executa os Pix agendados cujo dia chegou. Roda junto do carregamento do estado
 * e é seguro repetir: só pega os que ainda estão com status "agendado".
 */
function processar_agendados() {
    $vencidos = db()->query("SELECT * FROM pix_agendados
        WHERE status = 'agendado' AND data_agendada <= CURDATE() ORDER BY data_agendada")->fetchAll();
    if (!$vencidos) { return; }

    foreach ($vencidos as $a) {
        $valor = (float) $a['valor'];
        $p     = perfil();
        if ($valor > $p['saldo']) {
            db()->prepare("UPDATE pix_agendados SET status = 'falhou', motivo_falha = ? WHERE id = ?")
                ->execute(['Saldo insuficiente na data agendada.', $a['id']]);
            continue;
        }

        ajustar_perfil(['saldo' => $p['saldo'] - $valor]);
        registrar('pix_agendado', 'Transferência enviada', $valor, 'saida', [
            'contraparte' => $a['nome'],
            'descricao'   => trim('Pix agendado ' . ($a['descricao'] ? '· ' . $a['descricao'] : '')),
            'icone'       => 'clock',
        ]);
        db()->prepare("UPDATE pix_agendados SET status = 'executado', executado_em = NOW() WHERE id = ?")
            ->execute([$a['id']]);

        // Recorrência: já deixa o próximo agendado.
        if ($a['repete'] !== 'nao') {
            $prox = new DateTime($a['data_agendada']);
            $prox->modify($a['repete'] === 'mensal' ? '+1 month' : '+1 week');
            db()->prepare('INSERT INTO pix_agendados (nome, chave, valor, descricao, data_agendada, repete)
                           VALUES (?, ?, ?, ?, ?, ?)')
                ->execute([$a['nome'], $a['chave'], $valor, $a['descricao'],
                           $prox->format('Y-m-d'), $a['repete']]);
        }
    }
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
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $msg = operar_interno($acao, $in);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    return $msg;
}

/** O switch das operações, sem controle de transação (operar() cuida disso). */
function operar_interno($acao, $in) {
    $valor  = isset($in['valor']) ? $in['valor'] : 0;
    $nome   = trim(isset($in['nome']) ? $in['nome'] : '');
    $desc   = trim(isset($in['descricao']) ? $in['descricao'] : '');
    {
        switch ($acao) {
            case 'pix_enviar':
                $valor = exige_valor($valor);
                if ($nome === '') { throw new OperacaoInvalida('Informe o destinatário.'); }
                conferir_limite_pix($valor);
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
                // Mesmo que "pix_cobranca_criar": gera QR e copia e cola na chave principal.
                $msg = operar_interno('pix_cobranca_criar', $in);
                break;

            case 'guardar':
                $valor = exige_valor($valor);
                $c     = caixinha(isset($in['caixinha_id']) ? $in['caixinha_id'] : 0);
                debita_conta($valor);
                db()->prepare('UPDATE caixinhas SET saldo = saldo + ? WHERE id = ?')->execute([$valor, $c['id']]);
                registrar('guardar', 'Dinheiro guardado', $valor, 'saida',
                    ['contraparte' => $c['nome'], 'descricao' => 'Caixinha', 'icone' => 'lock']);
                sincronizar_guardado();
                $msg = 'R$ ' . number_format($valor, 2, ',', '.') . ' guardados na caixinha ' . $c['nome'] . '.';
                break;

            case 'resgatar':
                $valor = exige_valor($valor);
                $c     = caixinha(isset($in['caixinha_id']) ? $in['caixinha_id'] : 0);
                if ($valor > (float) $c['saldo']) {
                    throw new OperacaoInvalida('A caixinha ' . $c['nome'] . ' tem apenas R$ ' . number_format($c['saldo'], 2, ',', '.') . '.');
                }
                db()->prepare('UPDATE caixinhas SET saldo = saldo - ? WHERE id = ?')->execute([$valor, $c['id']]);
                credita_conta($valor);
                registrar('resgate', 'Resgate da caixinha', $valor, 'entrada',
                    ['contraparte' => $c['nome'], 'descricao' => 'Caixinha', 'icone' => 'unlock']);
                sincronizar_guardado();
                $msg = 'R$ ' . number_format($valor, 2, ',', '.') . ' resgatados da caixinha ' . $c['nome'] . '.';
                break;

            case 'caixinha_criar':
                if ($nome === '') { throw new OperacaoInvalida('Dê um nome para a caixinha.'); }
                $objetivo = round((float) (isset($in['objetivo']) ? $in['objetivo'] : 0), 2);
                $pct      = (float) (isset($in['percentual_cdi']) ? $in['percentual_cdi'] : 100);
                if ($pct <= 0 || $pct > 300) { throw new OperacaoInvalida('O percentual do CDI deve ficar entre 1% e 300%.'); }
                $ordem = (int) db()->query('SELECT COALESCE(MAX(ordem), 0) + 1 FROM caixinhas')->fetchColumn();
                db()->prepare('INSERT INTO caixinhas (nome, icone, cor, objetivo, percentual_cdi, rende, ultimo_rendimento, ordem)
                               VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)')
                    ->execute([
                        $nome,
                        isset($in['icone']) && $in['icone'] !== '' ? $in['icone'] : 'box',
                        isset($in['cor']) && $in['cor'] !== '' ? $in['cor'] : '#820AD1',
                        $objetivo,
                        $pct,
                        isset($in['rende']) && !$in['rende'] ? 0 : 1,
                        $ordem,
                    ]);
                $msg = 'Caixinha ' . $nome . ' criada.';
                break;

            case 'caixinha_excluir':
                $c = caixinha(isset($in['caixinha_id']) ? $in['caixinha_id'] : 0);
                if ((float) $c['saldo'] > 0) {
                    credita_conta((float) $c['saldo']);
                    registrar('resgate', 'Resgate da caixinha', (float) $c['saldo'], 'entrada',
                        ['contraparte' => $c['nome'], 'descricao' => 'Caixinha encerrada', 'icone' => 'unlock']);
                }
                db()->prepare('DELETE FROM caixinhas WHERE id = ?')->execute([$c['id']]);
                sincronizar_guardado();
                $msg = 'Caixinha ' . $c['nome'] . ' encerrada'
                     . ((float) $c['saldo'] > 0 ? ' e R$ ' . number_format($c['saldo'], 2, ',', '.') . ' devolvidos para a conta.' : '.');
                break;

            case 'pix_copia_cola':
                $lido = pix_ler_br_code(isset($in['codigo']) ? $in['codigo'] : '');
                if (!$lido) { throw new OperacaoInvalida('Código Pix inválido. Confira e cole de novo.'); }
                $valor = exige_valor($valor > 0 ? $valor : $lido['valor']);
                $destino = $nome !== '' ? $nome : ($lido['nome'] !== '' ? $lido['nome'] : $lido['chave']);
                conferir_limite_pix($valor);
                debita_conta($valor);
                registrar('pix_enviado', 'Transferência enviada', $valor, 'saida', [
                    'contraparte' => $destino,
                    'descricao'   => trim('Pix copia e cola ' . ($lido['descricao'] ? '· ' . $lido['descricao'] : '')),
                    'icone'       => 'arrow-up-right',
                ]);
                $msg = 'Pix de R$ ' . number_format($valor, 2, ',', '.') . ' enviado para ' . $destino . '.';
                break;

            case 'pix_chave_criar':
                $tipo  = isset($in['tipo']) ? $in['tipo'] : '';
                $chave = trim(isset($in['chave']) ? $in['chave'] : '');
                if ($tipo === 'aleatoria' || ($chave === '' && $tipo === '')) {
                    $chave = pix_chave_aleatoria();
                    $tipo  = 'aleatoria';
                }
                if ($chave === '') { throw new OperacaoInvalida('Informe a chave que você quer cadastrar.'); }
                if ($tipo === '') { $tipo = pix_detectar_tipo($chave); }
                $existe = db()->prepare('SELECT id FROM pix_chaves WHERE valor = ?');
                $existe->execute([$chave]);
                if ($existe->fetch()) { throw new OperacaoInvalida('Essa chave já está cadastrada.'); }
                $primeira = !db()->query('SELECT id FROM pix_chaves LIMIT 1')->fetch();
                db()->prepare('INSERT INTO pix_chaves (tipo, valor, principal) VALUES (?, ?, ?)')
                    ->execute([$tipo, $chave, $primeira ? 1 : 0]);
                $msg = pix_tipo_rotulo($tipo) . ' cadastrado como chave Pix.';
                break;

            case 'pix_chave_excluir':
                $st = db()->prepare('SELECT * FROM pix_chaves WHERE id = ?');
                $st->execute([(int) (isset($in['chave_id']) ? $in['chave_id'] : 0)]);
                $ch = $st->fetch();
                if (!$ch) { throw new OperacaoInvalida('Chave não encontrada.'); }
                db()->prepare('DELETE FROM pix_chaves WHERE id = ?')->execute([$ch['id']]);
                if ($ch['principal']) {
                    db()->exec('UPDATE pix_chaves SET principal = 1 ORDER BY id LIMIT 1');
                }
                $msg = 'Chave ' . $ch['valor'] . ' excluída.';
                break;

            case 'pix_chave_principal':
                $id = (int) (isset($in['chave_id']) ? $in['chave_id'] : 0);
                db()->exec('UPDATE pix_chaves SET principal = 0');
                db()->prepare('UPDATE pix_chaves SET principal = 1 WHERE id = ?')->execute([$id]);
                $msg = 'Chave principal atualizada.';
                break;

            case 'pix_cobranca_criar':
                $p      = perfil();
                $chave  = pix_chave_principal();
                $codigo = pix_br_code($chave, round((float) $valor, 2), $p['nome'], 'MACEIO', $desc);
                db()->prepare('INSERT INTO pix_cobrancas (valor, descricao, chave, codigo) VALUES (?, ?, ?, ?)')
                    ->execute([round((float) $valor, 2), $desc, $chave, $codigo]);
                $msg = $valor > 0
                    ? 'Cobrança de R$ ' . number_format($valor, 2, ',', '.') . ' gerada.'
                    : 'Código Pix gerado (sem valor definido).';
                break;

            case 'pix_cobranca_receber':
                $st = db()->prepare("SELECT * FROM pix_cobrancas WHERE id = ? AND status = 'aberta'");
                $st->execute([(int) (isset($in['cobranca_id']) ? $in['cobranca_id'] : 0)]);
                $cob = $st->fetch();
                if (!$cob) { throw new OperacaoInvalida('Cobrança não encontrada ou já paga.'); }
                $valor = exige_valor($valor > 0 ? $valor : (float) $cob['valor']);
                credita_conta($valor);
                registrar('pix_recebido', 'Transferência recebida', $valor, 'entrada', [
                    'contraparte' => $nome !== '' ? $nome : 'Cobrança Pix',
                    'descricao'   => $cob['descricao'] ?: 'Pix',
                    'icone'       => 'arrow-down-left',
                ]);
                db()->prepare("UPDATE pix_cobrancas SET status = 'paga', pago_em = NOW() WHERE id = ?")
                    ->execute([$cob['id']]);
                $msg = 'Cobrança paga: R$ ' . number_format($valor, 2, ',', '.') . ' na sua conta.';
                break;

            case 'pix_cobranca_cancelar':
                db()->prepare("UPDATE pix_cobrancas SET status = 'cancelada' WHERE id = ? AND status = 'aberta'")
                    ->execute([(int) (isset($in['cobranca_id']) ? $in['cobranca_id'] : 0)]);
                $msg = 'Cobrança cancelada.';
                break;

            case 'pix_agendar':
                $valor = exige_valor($valor);
                if ($nome === '') { throw new OperacaoInvalida('Informe o destinatário.'); }
                $data = isset($in['data']) ? trim($in['data']) : '';
                if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) {
                    throw new OperacaoInvalida('Escolha a data do agendamento.');
                }
                if ($data < date('Y-m-d')) { throw new OperacaoInvalida('A data não pode estar no passado.'); }
                $repete = isset($in['repete']) && in_array($in['repete'], ['mensal', 'semanal'], true) ? $in['repete'] : 'nao';
                db()->prepare('INSERT INTO pix_agendados (nome, chave, valor, descricao, data_agendada, repete)
                               VALUES (?, ?, ?, ?, ?, ?)')
                    ->execute([$nome, isset($in['chave']) ? $in['chave'] : null, $valor, $desc, $data, $repete]);
                $msg = 'Pix de R$ ' . number_format($valor, 2, ',', '.') . ' agendado para '
                     . date('d/m/Y', strtotime($data)) . '.';
                break;

            case 'pix_agendado_cancelar':
                db()->prepare("UPDATE pix_agendados SET status = 'cancelado' WHERE id = ? AND status IN ('agendado','falhou')")
                    ->execute([(int) (isset($in['agendado_id']) ? $in['agendado_id'] : 0)]);
                $msg = 'Agendamento cancelado.';
                break;

            case 'pix_limites':
                $diario  = round((float) (isset($in['limite_diario']) ? $in['limite_diario'] : 0), 2);
                $noturno = round((float) (isset($in['limite_noturno']) ? $in['limite_noturno'] : 0), 2);
                if ($diario <= 0 || $noturno <= 0) { throw new OperacaoInvalida('Os limites precisam ser maiores que zero.'); }
                if ($noturno > $diario) { throw new OperacaoInvalida('O limite noturno não pode passar do diário.'); }
                ajustar_perfil(['limite_pix_diario' => $diario, 'limite_pix_noturno' => $noturno]);
                $msg = 'Limites do Pix atualizados.';
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
    }
    return $msg;
}

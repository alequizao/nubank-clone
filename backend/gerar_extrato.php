<?php
/**
 * Gera um extrato completo e coerente: a soma de entradas menos saídas da conta
 * fecha exatamente com o saldo do perfil, e as compras no crédito fecham com a
 * fatura atual (as faturas já fechadas aparecem pagas pela conta).
 *
 * Uso: php backend/gerar_extrato.php
 * Atenção: apaga os lançamentos existentes antes de recriar.
 */
require_once __DIR__ . '/dados.php';

$p         = perfil();
$saldoAlvo = $p['saldo'];
$hoje        = new DateTime('today');

/** Data relativa a hoje, com hora fixa para o extrato ficar estável. */
function em($diasAtras, $hora = '10:00') {
    $d = new DateTime('today');
    $d->modify("-$diasAtras days");
    return $d->format('Y-m-d') . ' ' . $hora . ':00';
}

$lancamentos = [];

function add($dias, $hora, $tipo, $titulo, $contraparte, $descricao, $valor, $sinal, $origem, $icone) {
    global $lancamentos;
    $lancamentos[] = [
        'data' => em($dias, $hora), 'tipo' => $tipo, 'titulo' => $titulo,
        'contraparte' => $contraparte, 'descricao' => $descricao,
        'valor' => round($valor, 2), 'sinal' => $sinal, 'origem' => $origem, 'icone' => $icone,
    ];
}

// ── Entradas recorrentes: salário e serviços prestados ────────────────────
foreach ([5, 35, 66] as $i => $d) {
    add($d, '08:12', 'salario', 'Transferência recebida', 'Publish Digital', 'Salário', 7400.00, 'entrada', 'conta', 'arrow-down-left');
}
add(52, '14:05', 'pix_recebido', 'Transferência recebida', 'J. Brasil Imóveis', 'Pix · site institucional', 3200.00, 'entrada', 'conta', 'arrow-down-left');
add(23, '16:40', 'pix_recebido', 'Transferência recebida', 'Grupo Dona', 'Pix · manutenção do sistema', 1850.00, 'entrada', 'conta', 'arrow-down-left');
add(9,  '11:22', 'pix_recebido', 'Transferência recebida', 'Holanda Barbearia', 'Pix · painel + robô', 950.00, 'entrada', 'conta', 'arrow-down-left');
add(2,  '19:03', 'pix_recebido', 'Transferência recebida', 'Maria Silva', 'Pix', 120.00, 'entrada', 'conta', 'arrow-down-left');

// ── Rendimento da conta ───────────────────────────────────────────────────
$rendimentos = [[62, 812.44], [31, 934.10], [1, 1046.83]];
foreach ($rendimentos as $r) {
    add($r[0], '00:05', 'rendimento', 'Rendimento da conta', 'Nubank', '100% do CDI', $r[1], 'entrada', 'conta', 'activity');
}

// ── Saídas do dia a dia (conta) ───────────────────────────────────────────
$saidas = [
    [3,  '12:31', 'Pagamento efetuado', 'Supermercado Atacadão', 'Débito',              487.63, 'shopping-cart'],
    [4,  '20:10', 'Transferência enviada', 'iFood', 'Pix',                               78.90, 'arrow-up-right'],
    [6,  '09:14', 'Pagamento efetuado', 'Energisa Alagoas', 'Conta de energia',          312.47, 'file-text'],
    [7,  '15:55', 'Pagamento efetuado', 'Posto Petrobras', 'Combustível',                280.00, 'file-text'],
    [8,  '21:02', 'Transferência enviada', 'João Pereira', 'Pix',                        250.00, 'arrow-up-right'],
    [11, '10:47', 'Pagamento efetuado', 'Claro Internet', 'Internet 500 mega',           149.90, 'file-text'],
    [12, '18:20', 'Pagamento efetuado', 'Drogasil', 'Farmácia',                           96.40, 'file-text'],
    [14, '08:30', 'Pagamento efetuado', 'Aluguel — Imobiliária Central', 'Boleto',      2200.00, 'home'],
    [16, '13:12', 'Transferência enviada', 'Maria Silva', 'Pix',                         180.00, 'arrow-up-right'],
    [17, '19:44', 'Pagamento efetuado', 'Netflix', 'Assinatura',                          55.90, 'film'],
    [18, '19:45', 'Pagamento efetuado', 'Spotify', 'Assinatura',                          21.90, 'music'],
    [19, '11:05', 'Recarga de celular', '(82) 98871-7072', 'Recarga',                     50.00, 'smartphone'],
    [21, '12:58', 'Pagamento efetuado', 'Supermercado Atacadão', 'Débito',               392.18, 'shopping-cart'],
    [24, '17:30', 'Pagamento efetuado', 'Academia Smart Fit', 'Mensalidade',             119.90, 'activity'],
    [26, '09:20', 'Pagamento efetuado', 'CASAL — água', 'Conta de água',                  87.55, 'file-text'],
    [28, '14:15', 'Transferência enviada', 'Publish Digital', 'Pix · hospedagem',        340.00, 'arrow-up-right'],
    [33, '20:40', 'Transferência enviada', 'iFood', 'Pix',                               112.35, 'arrow-up-right'],
    [36, '09:02', 'Pagamento efetuado', 'Energisa Alagoas', 'Conta de energia',          298.12, 'file-text'],
    [38, '16:25', 'Pagamento efetuado', 'Posto Petrobras', 'Combustível',                260.00, 'file-text'],
    [41, '10:33', 'Pagamento efetuado', 'Claro Internet', 'Internet 500 mega',           149.90, 'file-text'],
    [44, '08:30', 'Pagamento efetuado', 'Aluguel — Imobiliária Central', 'Boleto',      2200.00, 'home'],
    [47, '13:40', 'Pagamento efetuado', 'Supermercado Atacadão', 'Débito',               521.07, 'shopping-cart'],
    [49, '19:48', 'Pagamento efetuado', 'Netflix', 'Assinatura',                          55.90, 'film'],
    [49, '19:49', 'Pagamento efetuado', 'Spotify', 'Assinatura',                          21.90, 'music'],
    [54, '17:12', 'Pagamento efetuado', 'Academia Smart Fit', 'Mensalidade',             119.90, 'activity'],
    [58, '11:26', 'Transferência enviada', 'João Pereira', 'Pix',                        400.00, 'arrow-up-right'],
    [61, '15:03', 'Pagamento efetuado', 'Óticas Okulos', 'Óculos de grau',               680.00, 'file-text'],
    [64, '09:10', 'Pagamento efetuado', 'Energisa Alagoas', 'Conta de energia',          305.88, 'file-text'],
    [70, '08:30', 'Pagamento efetuado', 'Aluguel — Imobiliária Central', 'Boleto',      2200.00, 'home'],
    [73, '12:44', 'Pagamento efetuado', 'Supermercado Atacadão', 'Débito',               446.29, 'shopping-cart'],
];
foreach ($saidas as $s) {
    $tipo = strpos($s[2], 'Transferência') === 0 ? 'pix_enviado' : (strpos($s[2], 'Recarga') === 0 ? 'recarga' : 'pagamento');
    add($s[0], $s[1], $tipo, $s[2], $s[3], $s[4], $s[5], 'saida', 'conta', $s[6]);
}

// ── Cartão de crédito ─────────────────────────────────────────────────────
// Faturas já fechadas (compras + o pagamento correspondente saindo da conta)
// e a fatura em aberto, que é o que o app mostra como "Fatura atual".

/** Compras de uma fatura fechada: entram como crédito e são quitadas pela conta. */
function faturaFechada($compras, $diaPagamento, $mesRotulo) {
    $total = 0;
    foreach ($compras as $c) {
        add($c[0], $c[1], 'compra_credito', 'Compra no crédito', $c[2], $c[3], $c[4], 'saida', 'credito', 'credit-card');
        $total += $c[4];
    }
    add($diaPagamento, '09:00', 'pagamento_fatura', 'Pagamento de fatura', 'Cartão de crédito',
        'Fatura de ' . $mesRotulo, $total, 'saida', 'conta', 'credit-card');
    return $total;
}

$faturaJunho = faturaFechada([
    [74, '19:26', 'Restaurante Divina Gula', 'Jantar',                        186.40],
    [72, '10:18', 'Posto Ipiranga',          'Combustível',                   270.00],
    [71, '16:02', 'Shopee',                  'Compra',                         88.70],
    [69, '20:41', 'iFood',                   'Pedido',                        104.90],
    [68, '14:20', 'Centauro',                'Tênis de corrida',              459.90],
    [66, '11:55', 'Droga Raia',              'Farmácia',                      132.75],
    [64, '21:10', 'Amazon.com.br',           'Livros técnicos',               217.60],
    [62, '13:33', 'Assaí Atacadista',        'Mercado do mês',                612.44],
    [60, '18:07', 'Uber',                    'Corridas',                       74.30],
], 58, 'junho');

$faturaJulho = faturaFechada([
    [56, '19:15', 'iFood',                   'Pedido',                        132.51],
    [54, '12:40', 'Assaí Atacadista',        'Mercado do mês',                578.19],
    [52, '15:22', 'Posto Ipiranga',          'Combustível',                   300.00],
    [50, '16:02', 'Magazine Luiza',          'Cadeira de escritório · 1/3',   529.99],
    [48, '20:35', 'Restaurante Wanchako',    'Jantar',                        247.60],
    [45, '09:48', 'Apple.com/bill',          'iCloud 2 TB',                    49.90],
    [43, '17:12', 'Amazon.com.br',           'Compra',                        189.90],
    [41, '13:05', 'Uber',                    'Corridas',                       96.80],
    [39, '10:27', 'Google Cloud',            'Servidor de testes',            118.42],
], 28, 'julho');

// Fatura em aberto — é ela que aparece como "Fatura atual" no app.
$comprasEmAberto = [
    [26, '12:44', 'Assaí Atacadista',        'Mercado do mês',                646.83],
    [24, '19:58', 'Restaurante Massarella',  'Jantar',                        198.70],
    [22, '08:31', 'Posto Ipiranga',          'Combustível',                   320.00],
    [20, '16:15', 'Magazine Luiza',          'Cadeira de escritório · 2/3',   529.99],
    [18, '21:04', 'iFood',                   'Pedido',                        118.35],
    [16, '10:12', 'Amazon.com.br',           'Monitor 27"',                 1489.00],
    [15, '09:48', 'Apple.com/bill',          'iCloud 2 TB',                    49.90],
    [13, '14:39', 'Droga Raia',              'Farmácia',                       87.20],
    [11, '18:50', 'Uber',                    'Corridas',                      112.60],
    [9,  '20:22', 'Netflix',                 'Assinatura',                     55.90],
    [8,  '11:07', 'Google Cloud',            'Servidor de testes',            126.75],
    [6,  '13:18', 'Assaí Atacadista',        'Compras da semana',             284.16],
    [4,  '19:31', 'Burger King',             'Lanche',                         62.40],
    [2,  '15:44', 'Kabum',                   'SSD 1 TB',                      479.90],
];
$faturaAberta = 0;
foreach ($comprasEmAberto as $c) {
    add($c[0], $c[1], 'compra_credito', 'Compra no crédito', $c[2], $c[3], $c[4], 'saida', 'credito', 'credit-card');
    $faturaAberta += $c[4];
}
$faturaAberta = round($faturaAberta, 2);

// ── Lançamento de abertura: fecha a conta no saldo exato ──────────────────
$liquido = 0;
foreach ($lancamentos as $l) {
    if ($l['origem'] !== 'conta') continue;
    $liquido += ($l['sinal'] === 'entrada' ? 1 : -1) * $l['valor'];
}
$abertura = round($saldoAlvo - $liquido, 2);
if ($abertura <= 0) {
    fwrite(STDERR, "O saldo do perfil é baixo demais para este histórico (faltam R$ " . number_format(-$abertura, 2, ',', '.') . ").\n");
    exit(1);
}
add(75, '09:00', 'pix_recebido', 'Transferência recebida', 'Publish Digital', 'Pagamento de projeto', $abertura, 'entrada', 'conta', 'arrow-down-left');

// ── Grava ─────────────────────────────────────────────────────────────────
db()->exec('TRUNCATE TABLE transacoes');
$ins = db()->prepare(
    'INSERT INTO transacoes (tipo, titulo, contraparte, descricao, valor, sinal, origem, icone, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
foreach ($lancamentos as $l) {
    $ins->execute([$l['tipo'], $l['titulo'], $l['contraparte'], $l['descricao'],
                   $l['valor'], $l['sinal'], $l['origem'], $l['icone'], $l['data']]);
}

// Perfil acompanha o extrato: fatura em aberto e rendimento do mês.
ajustar_perfil([
    'fatura_atual'   => $faturaAberta,
    'rendimento_mes' => $rendimentos[count($rendimentos) - 1][1],
]);

// ── Conferência ───────────────────────────────────────────────────────────
$conta = db()->query("SELECT
    SUM(CASE WHEN sinal='entrada' THEN valor ELSE -valor END) AS liquido
    FROM transacoes WHERE origem='conta'")->fetch();
$credito = db()->query("SELECT COALESCE(SUM(valor),0) AS total FROM transacoes WHERE origem='credito'")->fetch();

printf("%d lançamentos gerados.\n", count($lancamentos));
printf("Conta  — líquido do extrato: R$ %s | saldo do perfil: R$ %s %s\n",
    number_format($conta['liquido'], 2, ',', '.'),
    number_format($saldoAlvo, 2, ',', '.'),
    abs($conta['liquido'] - $saldoAlvo) < 0.005 ? 'OK' : 'DIVERGENTE');
$aberto = db()->query("SELECT COALESCE(SUM(valor),0) AS t FROM transacoes
    WHERE origem='credito' AND data > (SELECT MAX(data) FROM transacoes WHERE tipo='pagamento_fatura')")->fetch();
printf("Crédito — compras no total: R$ %s (junho R$ %s + julho R$ %s, ambas pagas)\n",
    number_format($credito['total'], 2, ',', '.'),
    number_format($faturaJunho, 2, ',', '.'),
    number_format($faturaJulho, 2, ',', '.'));
printf("Fatura em aberto: R$ %s | perfil: R$ %s %s\n",
    number_format($aberto['t'], 2, ',', '.'),
    number_format(perfil()['fatura_atual'], 2, ',', '.'),
    abs($aberto['t'] - perfil()['fatura_atual']) < 0.005 ? 'OK' : 'DIVERGENTE');

<?php
/**
 * Instalador: cria as tabelas do banco `nubank`, o usuário master e os
 * dados iniciais do perfil. Rodar de novo é seguro (não duplica).
 * Uso: php backend/instalar.php
 */
require_once __DIR__ . '/dados.php';

$sql = file_get_contents(__DIR__ . '/schema.sql');
foreach (array_filter(array_map('trim', explode(';', $sql))) as $stmt) {
    db()->exec($stmt);
}
echo "Tabelas criadas/verificadas.\n";

// ── Usuário master ────────────────────────────────────────────────────────
$st = db()->prepare('SELECT id FROM usuarios WHERE usuario = ?');
$st->execute([MASTER_USER]);
$hash = password_hash(MASTER_PASS, PASSWORD_DEFAULT);
if ($st->fetch()) {
    db()->prepare('UPDATE usuarios SET senha = ?, nivel = "master", ativo = 1 WHERE usuario = ?')
        ->execute([$hash, MASTER_USER]);
    echo "Usuário master '" . MASTER_USER . "' atualizado.\n";
} else {
    db()->prepare('INSERT INTO usuarios (usuario, senha, nome, nivel) VALUES (?, ?, ?, "master")')
        ->execute([MASTER_USER, $hash, 'Alequizão']);
    echo "Usuário master '" . MASTER_USER . "' criado.\n";
}

// ── Perfil ────────────────────────────────────────────────────────────────
if (!db()->query('SELECT id FROM perfil WHERE id = 1')->fetch()) {
    db()->prepare(
        'INSERT INTO perfil (id, nome, agencia, conta, chave_pix, saldo, guardado, rendimento_mes,
                             limite_total, fatura_atual, limite_liberado,
                             emprestimo_disponivel, emprestimo_contratado)
         VALUES (1, ?, "0001", "1234567-8", ?, ?, ?, ?, ?, ?, ?, ?, 0)'
    )->execute(['Alequizão', 'alequizao.dev@gmail.com', 131673.12, 0, 0, 86000.00, 0, 86000.00, 230000.00]);
    echo "Perfil inicial criado (saldo R$ 131.673,12 · limite R$ 86.000,00 · empréstimo R$ 230.000,00).\n";
} else {
    echo "Perfil já existe — mantido como está (edite pelo painel).\n";
}

// ── Cartões ───────────────────────────────────────────────────────────────
if (!db()->query('SELECT id FROM cartoes LIMIT 1')->fetch()) {
    $ins = db()->prepare('INSERT INTO cartoes (apelido, final, bandeira, tipo, limite, ordem) VALUES (?, ?, ?, ?, ?, ?)');
    $ins->execute(['Cartão de crédito', '4821', 'Mastercard', 'fisico', 86000.00, 1]);
    $ins->execute(['Cartão virtual', '7390', 'Mastercard', 'virtual', 5000.00, 2]);
    echo "Cartões iniciais criados.\n";
}

// ── Migração: origem 'caixinha' no extrato ────────────────────────────────
db()->exec("ALTER TABLE transacoes MODIFY origem ENUM('conta','credito','caixinha') NOT NULL DEFAULT 'conta'");

// ── Caixinhas iniciais ────────────────────────────────────────────────────
if (!db()->query('SELECT id FROM caixinhas LIMIT 1')->fetch()) {
    $ins = db()->prepare('INSERT INTO caixinhas (nome, icone, cor, objetivo, saldo, percentual_cdi, rende, ultimo_rendimento, ordem)
                          VALUES (?, ?, ?, ?, ?, ?, 1, CURDATE(), ?)');
    $ins->execute(['Reserva de emergência', 'shield',   '#820AD1', 30000.00, 0, 100.00, 1]);
    $ins->execute(['Viagem',                'map-pin',  '#00A868', 12000.00, 0, 100.00, 2]);
    $ins->execute(['Trocar de carro',       'truck',    '#F5A623', 60000.00, 0, 110.00, 3]);
    echo "Caixinhas iniciais criadas.\n";
}

// ── Contatos para as simulações de Pix ────────────────────────────────────
if (!db()->query('SELECT id FROM contatos LIMIT 1')->fetch()) {
    $ins = db()->prepare('INSERT INTO contatos (nome, chave, banco) VALUES (?, ?, ?)');
    $ins->execute(['Maria Silva', '(82) 99999-1234', 'Nubank']);
    $ins->execute(['João Pereira', 'joao@email.com', 'Itaú']);
    $ins->execute(['Publish Digital', '12.345.678/0001-90', 'Banco do Brasil']);
    echo "Contatos iniciais criados.\n";
}

echo "Instalação concluída.\n";

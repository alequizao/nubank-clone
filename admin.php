<?php
/**
 * Painel de personalização: edita tudo que o app mostra e permite
 * simular qualquer operação. Acesso restrito à sessão logada.
 */
require_once __DIR__ . '/backend/auth.php';
require_once __DIR__ . '/backend/dados.php';
$user = auth_require();

$aba  = isset($_GET['aba']) ? $_GET['aba'] : 'perfil';
$ok   = '';
$erro = '';

function n($v) { return round((float) str_replace([' ', '.', ','], ['', '', '.'], $v), 2); }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $form = isset($_POST['form']) ? $_POST['form'] : '';
    try {
        if ($form === 'perfil') {
            $campos = [
                'nome'                  => trim($_POST['nome']),
                'cpf'                   => trim($_POST['cpf']),
                'agencia'               => trim($_POST['agencia']),
                'conta'                 => trim($_POST['conta']),
                'chave_pix'             => trim($_POST['chave_pix']),
                'cor_tema'              => trim($_POST['cor_tema']),
                'saldo'                 => n($_POST['saldo']),
                'guardado'              => n($_POST['guardado']),
                'rendimento_mes'        => n($_POST['rendimento_mes']),
                'limite_total'          => n($_POST['limite_total']),
                'fatura_atual'          => n($_POST['fatura_atual']),
                'limite_liberado'       => n($_POST['limite_liberado']),
                'emprestimo_disponivel' => n($_POST['emprestimo_disponivel']),
                'emprestimo_contratado' => n($_POST['emprestimo_contratado']),
            ];
            if (!empty($_FILES['foto']['tmp_name']) && is_uploaded_file($_FILES['foto']['tmp_name'])) {
                $tipo = @getimagesize($_FILES['foto']['tmp_name']);
                if (!$tipo) { throw new Exception('O arquivo enviado não é uma imagem.'); }
                $ext = image_type_to_extension($tipo[2], false);
                $dest = 'uploads/perfil.' . $ext;
                if (!is_dir(__DIR__ . '/uploads')) { mkdir(__DIR__ . '/uploads', 0755); }
                move_uploaded_file($_FILES['foto']['tmp_name'], __DIR__ . '/' . $dest);
                $campos['foto'] = $dest . '?v=' . time();
            }
            ajustar_perfil($campos);
            $ok = 'Perfil atualizado.';
            $aba = 'perfil';
        } elseif ($form === 'cartao') {
            if (!empty($_POST['excluir'])) {
                db()->prepare('DELETE FROM cartoes WHERE id = ?')->execute([(int) $_POST['excluir']]);
                $ok = 'Cartão removido.';
            } elseif (!empty($_POST['id'])) {
                db()->prepare('UPDATE cartoes SET apelido=?, final=?, bandeira=?, tipo=?, limite=?, bloqueado=?, ordem=? WHERE id=?')
                    ->execute([$_POST['apelido'], $_POST['final'], $_POST['bandeira'], $_POST['tipo'],
                               n($_POST['limite']), isset($_POST['bloqueado']) ? 1 : 0, (int) $_POST['ordem'], (int) $_POST['id']]);
                $ok = 'Cartão atualizado.';
            } else {
                db()->prepare('INSERT INTO cartoes (apelido, final, bandeira, tipo, limite, bloqueado, ordem) VALUES (?,?,?,?,?,?,?)')
                    ->execute([$_POST['apelido'], $_POST['final'], $_POST['bandeira'], $_POST['tipo'],
                               n($_POST['limite']), isset($_POST['bloqueado']) ? 1 : 0, (int) $_POST['ordem']]);
                $ok = 'Cartão criado.';
            }
            $aba = 'cartoes';
        } elseif ($form === 'contato') {
            if (!empty($_POST['excluir'])) {
                db()->prepare('DELETE FROM contatos WHERE id = ?')->execute([(int) $_POST['excluir']]);
                $ok = 'Contato removido.';
            } else {
                db()->prepare('INSERT INTO contatos (nome, chave, banco) VALUES (?,?,?)')
                    ->execute([$_POST['nome'], $_POST['chave'], $_POST['banco']]);
                $ok = 'Contato criado.';
            }
            $aba = 'contatos';
        } elseif ($form === 'transacao') {
            if (!empty($_POST['excluir'])) {
                db()->prepare('DELETE FROM transacoes WHERE id = ?')->execute([(int) $_POST['excluir']]);
                $ok = 'Lançamento removido.';
            } elseif (!empty($_POST['limpar'])) {
                db()->exec('TRUNCATE TABLE transacoes');
                $ok = 'Extrato limpo.';
            } else {
                db()->prepare('INSERT INTO transacoes (tipo, titulo, contraparte, descricao, valor, sinal, origem, icone, data)
                               VALUES (?,?,?,?,?,?,?,?,?)')
                    ->execute(['manual', $_POST['titulo'], $_POST['contraparte'], $_POST['descricao'],
                               n($_POST['valor']), $_POST['sinal'], $_POST['origem'], $_POST['icone'],
                               $_POST['data'] ? str_replace('T', ' ', $_POST['data']) . ':00' : date('Y-m-d H:i:s')]);
                $ok = 'Lançamento criado (não altera saldo — use a aba Simular para isso).';
            }
            $aba = 'extrato';
        } elseif ($form === 'simular') {
            $ok  = operar($_POST['acao'], ['valor' => n($_POST['valor']), 'nome' => $_POST['nome'], 'descricao' => $_POST['descricao']]);
            $aba = 'simular';
        } elseif ($form === 'senha') {
            if (strlen($_POST['nova']) < 4) { throw new Exception('A senha precisa ter ao menos 4 caracteres.'); }
            db()->prepare('UPDATE usuarios SET senha = ? WHERE id = ?')
                ->execute([password_hash($_POST['nova'], PASSWORD_DEFAULT), $user['id']]);
            $ok  = 'Senha alterada.';
            $aba = 'conta';
        }
    } catch (Throwable $e) {
        $erro = $e->getMessage();
    }
}

$p          = perfil();
$cartoes    = cartoes();
$contatos   = contatos();
$transacoes = transacoes(200);

function h($v) { return htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8'); }
function m($v) { return number_format((float) $v, 2, ',', '.'); }

$abas = [
    'perfil'   => 'Perfil e saldos',
    'cartoes'  => 'Cartões',
    'contatos' => 'Contatos',
    'extrato'  => 'Extrato',
    'simular'  => 'Simular operações',
    'conta'    => 'Conta de acesso',
];
?>
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Painel · Nubank</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{--roxo:#820AD1;--borda:#e6e6ec;--texto:#111827;--suave:#6b7280;--fundo:#f4f5f7}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Inter,-apple-system,'Segoe UI',Roboto,sans-serif;background:var(--fundo);color:var(--texto);display:flex;min-height:100vh}
  aside{width:246px;background:#fff;border-right:1px solid var(--borda);padding:22px 16px;position:sticky;top:0;height:100vh;flex-shrink:0}
  aside h1{font-size:16px;font-weight:700;color:var(--roxo);margin-bottom:2px}
  aside .sub{font-size:12px;color:var(--suave);margin-bottom:22px}
  nav a{display:block;padding:10px 12px;border-radius:9px;text-decoration:none;color:#374151;font-size:14px;font-weight:500;margin-bottom:4px}
  nav a:hover{background:#f5f3ff}
  nav a.on{background:var(--roxo);color:#fff}
  aside .rodape{position:absolute;bottom:20px;left:16px;right:16px;font-size:13px}
  aside .rodape a{color:var(--suave);text-decoration:none;display:block;padding:6px 12px}
  main{flex:1;padding:28px 32px;max-width:1100px}
  h2{font-size:22px;font-weight:700;margin-bottom:4px}
  .desc{color:var(--suave);font-size:14px;margin-bottom:20px}
  .card{background:#fff;border:1px solid var(--borda);border-radius:14px;padding:22px;margin-bottom:20px}
  .card h3{font-size:15px;font-weight:600;margin-bottom:16px}
  .grade{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}
  label{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px}
  input,select,textarea{width:100%;padding:10px 12px;border:1px solid var(--borda);border-radius:9px;font-size:14px;font-family:inherit;background:#fff}
  input:focus,select:focus,textarea:focus{outline:none;border-color:var(--roxo);box-shadow:0 0 0 3px rgba(130,10,209,.12)}
  button{padding:11px 20px;border:0;border-radius:9px;background:var(--roxo);color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}
  button:hover{background:#6d089f}
  button.sec{background:#fff;color:#b42318;border:1px solid #f0c9c9;padding:7px 12px;font-size:13px}
  .acoes{margin-top:18px}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th{text-align:left;font-size:12px;color:var(--suave);text-transform:uppercase;letter-spacing:.04em;padding:8px 10px;border-bottom:1px solid var(--borda)}
  td{padding:10px;border-bottom:1px solid #f1f1f5;vertical-align:middle}
  .aviso{padding:12px 15px;border-radius:10px;font-size:14px;margin-bottom:18px}
  .aviso.ok{background:#ecfdf3;color:#05603a;border:1px solid #c6f0d8}
  .aviso.erro{background:#fdecec;color:#b42318;border:1px solid #f7cfcf}
  .entrada{color:#05934a;font-weight:600}
  .saida{color:#b42318;font-weight:600}
  .foto{width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--borda)}
  .linha{display:flex;align-items:center;gap:16px;margin-bottom:16px}
  .chip{display:inline-block;padding:3px 9px;border-radius:999px;background:#f3f4f6;font-size:12px;color:#4b5563}
  @media(max-width:820px){body{flex-direction:column}aside{width:100%;height:auto;position:static}main{padding:20px}}
</style>
</head>
<body>
<aside>
  <h1>Nubank · Painel</h1>
  <div class="sub">Personalização do app</div>
  <nav>
    <?php foreach ($abas as $k => $rotulo): ?>
      <a class="<?= $aba === $k ? 'on' : '' ?>" href="admin.php?aba=<?= $k ?>"><?= $rotulo ?></a>
    <?php endforeach; ?>
  </nav>
  <div class="rodape">
    <a href="./">← Abrir o app</a>
    <a href="logout.php">Sair</a>
  </div>
</aside>

<main>
  <?php if ($ok): ?><div class="aviso ok"><?= h($ok) ?></div><?php endif; ?>
  <?php if ($erro): ?><div class="aviso erro"><?= h($erro) ?></div><?php endif; ?>

<?php if ($aba === 'perfil'): ?>
  <h2>Perfil e saldos</h2>
  <p class="desc">Tudo o que o app mostra na tela inicial vem daqui.</p>
  <form method="post" enctype="multipart/form-data">
    <input type="hidden" name="form" value="perfil">
    <div class="card">
      <h3>Titular</h3>
      <div class="linha">
        <img class="foto" src="<?= h($p['foto'] ?: 'pwa-icons/icon-192.png') ?>" alt="Foto do perfil">
        <div style="flex:1"><label>Trocar foto</label><input type="file" name="foto" accept="image/*"></div>
      </div>
      <div class="grade">
        <div><label>Nome exibido no app</label><input name="nome" value="<?= h($p['nome']) ?>" required></div>
        <div><label>CPF</label><input name="cpf" value="<?= h($p['cpf']) ?>"></div>
        <div><label>Agência</label><input name="agencia" value="<?= h($p['agencia']) ?>"></div>
        <div><label>Conta</label><input name="conta" value="<?= h($p['conta']) ?>"></div>
        <div><label>Chave Pix</label><input name="chave_pix" value="<?= h($p['chave_pix']) ?>"></div>
        <div><label>Cor do tema</label><input name="cor_tema" type="color" value="<?= h($p['cor_tema']) ?>" style="height:42px;padding:4px"></div>
      </div>
    </div>
    <div class="card">
      <h3>Conta</h3>
      <div class="grade">
        <div><label>Saldo disponível (R$)</label><input name="saldo" value="<?= m($p['saldo']) ?>"></div>
        <div><label>Dinheiro guardado (R$)</label><input name="guardado" value="<?= m($p['guardado']) ?>"></div>
        <div><label>Rendimento do mês (R$)</label><input name="rendimento_mes" value="<?= m($p['rendimento_mes']) ?>"></div>
      </div>
    </div>
    <div class="card">
      <h3>Cartão de crédito</h3>
      <div class="grade">
        <div><label>Limite total (R$)</label><input name="limite_total" value="<?= m($p['limite_total']) ?>"></div>
        <div><label>Fatura atual (R$)</label><input name="fatura_atual" value="<?= m($p['fatura_atual']) ?>"></div>
        <div><label>Limite liberado para uso (R$)</label><input name="limite_liberado" value="<?= m($p['limite_liberado']) ?>"></div>
      </div>
    </div>
    <div class="card">
      <h3>Empréstimo</h3>
      <div class="grade">
        <div><label>Disponível (R$)</label><input name="emprestimo_disponivel" value="<?= m($p['emprestimo_disponivel']) ?>"></div>
        <div><label>Já contratado (R$)</label><input name="emprestimo_contratado" value="<?= m($p['emprestimo_contratado']) ?>"></div>
      </div>
      <div class="acoes"><button type="submit">Salvar tudo</button></div>
    </div>
  </form>

<?php elseif ($aba === 'cartoes'): ?>
  <h2>Cartões</h2>
  <p class="desc">Aparecem em “Meus cartões” dentro do app.</p>
  <div class="card">
    <h3>Cartões cadastrados</h3>
    <table>
      <tr><th>Apelido</th><th>Final</th><th>Bandeira</th><th>Tipo</th><th>Limite</th><th>Status</th><th></th></tr>
      <?php foreach ($cartoes as $c): ?>
      <tr>
        <form method="post">
          <input type="hidden" name="form" value="cartao"><input type="hidden" name="id" value="<?= $c['id'] ?>">
          <input type="hidden" name="ordem" value="<?= $c['ordem'] ?>">
          <td><input name="apelido" value="<?= h($c['apelido']) ?>"></td>
          <td><input name="final" value="<?= h($c['final']) ?>" size="4" maxlength="4"></td>
          <td><input name="bandeira" value="<?= h($c['bandeira']) ?>"></td>
          <td><select name="tipo">
              <option value="fisico" <?= $c['tipo'] === 'fisico' ? 'selected' : '' ?>>Físico</option>
              <option value="virtual" <?= $c['tipo'] === 'virtual' ? 'selected' : '' ?>>Virtual</option>
          </select></td>
          <td><input name="limite" value="<?= m($c['limite']) ?>"></td>
          <td><label style="font-weight:400;font-size:13px"><input type="checkbox" name="bloqueado" style="width:auto" <?= $c['bloqueado'] ? 'checked' : '' ?>> bloqueado</label></td>
          <td style="white-space:nowrap"><button type="submit">Salvar</button></td>
        </form>
        <form method="post" onsubmit="return confirm('Remover este cartão?')">
          <input type="hidden" name="form" value="cartao"><input type="hidden" name="excluir" value="<?= $c['id'] ?>">
          <td><button class="sec" type="submit">Remover</button></td>
        </form>
      </tr>
      <?php endforeach; ?>
    </table>
  </div>
  <div class="card">
    <h3>Novo cartão</h3>
    <form method="post">
      <input type="hidden" name="form" value="cartao">
      <div class="grade">
        <div><label>Apelido</label><input name="apelido" required></div>
        <div><label>4 últimos dígitos</label><input name="final" maxlength="4" value="0000"></div>
        <div><label>Bandeira</label><input name="bandeira" value="Mastercard"></div>
        <div><label>Tipo</label><select name="tipo"><option value="fisico">Físico</option><option value="virtual">Virtual</option></select></div>
        <div><label>Limite (R$)</label><input name="limite" value="0,00"></div>
        <div><label>Ordem</label><input name="ordem" type="number" value="<?= count($cartoes) + 1 ?>"></div>
      </div>
      <div class="acoes"><button type="submit">Adicionar cartão</button></div>
    </form>
  </div>

<?php elseif ($aba === 'contatos'): ?>
  <h2>Contatos</h2>
  <p class="desc">Usados como destinatários rápidos no Pix e nas transferências.</p>
  <div class="card">
    <table>
      <tr><th>Nome</th><th>Chave</th><th>Banco</th><th></th></tr>
      <?php foreach ($contatos as $c): ?>
      <tr>
        <td><?= h($c['nome']) ?></td><td><?= h($c['chave']) ?></td><td><?= h($c['banco']) ?></td>
        <td><form method="post" onsubmit="return confirm('Remover?')">
          <input type="hidden" name="form" value="contato"><input type="hidden" name="excluir" value="<?= $c['id'] ?>">
          <button class="sec" type="submit">Remover</button></form></td>
      </tr>
      <?php endforeach; ?>
    </table>
  </div>
  <div class="card">
    <h3>Novo contato</h3>
    <form method="post">
      <input type="hidden" name="form" value="contato">
      <div class="grade">
        <div><label>Nome</label><input name="nome" required></div>
        <div><label>Chave Pix</label><input name="chave"></div>
        <div><label>Banco</label><input name="banco"></div>
      </div>
      <div class="acoes"><button type="submit">Adicionar</button></div>
    </form>
  </div>

<?php elseif ($aba === 'extrato'): ?>
  <h2>Extrato</h2>
  <p class="desc">Lançamentos exibidos no app. Adicionar aqui não mexe no saldo — para isso use “Simular operações”.</p>
  <div class="card">
    <h3>Novo lançamento manual</h3>
    <form method="post">
      <input type="hidden" name="form" value="transacao">
      <div class="grade">
        <div><label>Título</label><input name="titulo" value="Transferência enviada" required></div>
        <div><label>Contraparte</label><input name="contraparte" placeholder="Nome de quem enviou/recebeu"></div>
        <div><label>Descrição</label><input name="descricao" placeholder="Pix, TED, compra..."></div>
        <div><label>Valor (R$)</label><input name="valor" value="0,00"></div>
        <div><label>Sinal</label><select name="sinal"><option value="saida">Saída</option><option value="entrada">Entrada</option></select></div>
        <div><label>Origem</label><select name="origem"><option value="conta">Conta</option><option value="credito">Cartão de crédito</option></select></div>
        <div><label>Ícone (Feather)</label><input name="icone" value="dollar-sign"></div>
        <div><label>Data e hora</label><input name="data" type="datetime-local" value="<?= date('Y-m-d\TH:i') ?>"></div>
      </div>
      <div class="acoes"><button type="submit">Adicionar lançamento</button></div>
    </form>
  </div>
  <div class="card">
    <h3><?= count($transacoes) ?> lançamento(s)</h3>
    <table>
      <tr><th>Data</th><th>Título</th><th>Contraparte</th><th>Origem</th><th>Valor</th><th></th></tr>
      <?php foreach ($transacoes as $t): ?>
      <tr>
        <td><?= date('d/m/Y H:i', strtotime($t['data'])) ?></td>
        <td><?= h($t['titulo']) ?><br><span class="chip"><?= h($t['tipo']) ?></span></td>
        <td><?= h($t['contraparte']) ?></td>
        <td><?= $t['origem'] === 'credito' ? 'Crédito' : 'Conta' ?></td>
        <td class="<?= $t['sinal'] ?>"><?= $t['sinal'] === 'entrada' ? '+' : '−' ?> R$ <?= m($t['valor']) ?></td>
        <td><form method="post" onsubmit="return confirm('Remover?')">
          <input type="hidden" name="form" value="transacao"><input type="hidden" name="excluir" value="<?= $t['id'] ?>">
          <button class="sec" type="submit">Remover</button></form></td>
      </tr>
      <?php endforeach; ?>
    </table>
    <form method="post" class="acoes" onsubmit="return confirm('Apagar TODOS os lançamentos?')">
      <input type="hidden" name="form" value="transacao"><input type="hidden" name="limpar" value="1">
      <button class="sec" type="submit">Limpar extrato inteiro</button>
    </form>
  </div>

<?php elseif ($aba === 'simular'): ?>
  <h2>Simular operações</h2>
  <p class="desc">As mesmas operações do app — alteram saldo, fatura e extrato de verdade.</p>
  <div class="card">
    <form method="post">
      <input type="hidden" name="form" value="simular">
      <div class="grade">
        <div><label>Operação</label>
          <select name="acao">
            <option value="pix_enviar">Pix — enviar</option>
            <option value="pix_receber">Pix — receber</option>
            <option value="transferir">Transferência</option>
            <option value="pagar">Pagar boleto</option>
            <option value="depositar">Depositar</option>
            <option value="recarga">Recarga de celular</option>
            <option value="cobrar">Cobrar</option>
            <option value="guardar">Guardar dinheiro</option>
            <option value="resgatar">Resgatar da caixinha</option>
            <option value="compra_credito">Compra no crédito</option>
            <option value="pagar_fatura">Pagar fatura</option>
            <option value="ajustar_limite">Ajustar limite liberado</option>
            <option value="contratar_emprestimo">Contratar empréstimo</option>
          </select></div>
        <div><label>Valor (R$)</label><input name="valor" value="0,00"></div>
        <div><label>Nome / destinatário</label><input name="nome"></div>
        <div><label>Descrição</label><input name="descricao"></div>
      </div>
      <div class="acoes"><button type="submit">Executar</button></div>
    </form>
  </div>
  <div class="card">
    <h3>Situação atual</h3>
    <div class="grade">
      <div><label>Saldo</label><div style="font-size:20px;font-weight:700">R$ <?= m($p['saldo']) ?></div></div>
      <div><label>Guardado</label><div style="font-size:20px;font-weight:700">R$ <?= m($p['guardado']) ?></div></div>
      <div><label>Fatura</label><div style="font-size:20px;font-weight:700">R$ <?= m($p['fatura_atual']) ?></div></div>
      <div><label>Limite disponível</label><div style="font-size:20px;font-weight:700">R$ <?= m($p['limite_disponivel']) ?></div></div>
      <div><label>Empréstimo disponível</label><div style="font-size:20px;font-weight:700">R$ <?= m($p['emprestimo_disponivel']) ?></div></div>
    </div>
  </div>

<?php else: ?>
  <h2>Conta de acesso</h2>
  <p class="desc">Usuário logado: <strong><?= h($user['usuario']) ?></strong> (<?= h($user['nivel']) ?>)</p>
  <div class="card">
    <h3>Trocar a senha</h3>
    <form method="post">
      <input type="hidden" name="form" value="senha">
      <div class="grade"><div><label>Nova senha</label><input name="nova" type="password" required></div></div>
      <div class="acoes"><button type="submit">Salvar senha</button></div>
    </form>
  </div>
<?php endif; ?>
</main>
</body>
</html>

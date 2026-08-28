<?php
require_once __DIR__ . '/backend/auth.php';
auth_start();

if (auth_check()) { header('Location: ./'); exit; }

$erro = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = trim($_POST['usuario'] ?? '');
    $senha   = $_POST['senha'] ?? '';
    $ok      = false;
    try {
        $ok = auth_login($usuario, $senha);
        $st = db()->prepare('INSERT INTO acessos (usuario, sucesso, ip, user_agent) VALUES (?, ?, ?, ?)');
        $st->execute([$usuario, $ok ? 1 : 0, $_SERVER['REMOTE_ADDR'] ?? null, substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255)]);
    } catch (Throwable $e) {
        $erro = 'Erro de conexão com o banco. Rode: php backend/instalar.php';
    }
    if ($ok) { header('Location: ./'); exit; }
    if (!$erro) { $erro = 'Usuário ou senha inválidos.'; }
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#820AD1">
<title>Nubank</title>
<link rel="manifest" href="manifest.php">
<link rel="apple-touch-icon" href="pwa-icons/icon-180.png">
<link rel="icon" type="image/png" sizes="192x192" href="pwa-icons/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;overscroll-behavior:none}
  body{min-height:100dvh;background:#820AD1;color:#fff;
       font-family:Inter,-apple-system,'Segoe UI',Roboto,sans-serif;
       display:flex;flex-direction:column;justify-content:space-between;
       padding:calc(38px + env(safe-area-inset-top)) 26px calc(34px + env(safe-area-inset-bottom))}
  .topo{padding-top:26px}
  .marca{font-size:44px;font-weight:800;letter-spacing:-2px;line-height:1}
  .bemvindo{font-size:20px;font-weight:600;margin-top:26px}
  .sub{font-size:15px;opacity:.8;margin-top:6px;max-width:320px;line-height:1.45}
  form{width:100%;max-width:420px;align-self:center}
  label{display:block;font-size:12px;font-weight:600;opacity:.85;margin:18px 0 7px;letter-spacing:.04em}
  input{width:100%;padding:15px 4px;border:0;border-bottom:2px solid rgba(255,255,255,.35);
        background:transparent;color:#fff;font-size:17px;font-family:inherit;outline:none}
  input:focus{border-bottom-color:#fff}
  input::placeholder{color:rgba(255,255,255,.5)}
  button{width:100%;margin-top:30px;padding:16px;border:0;border-radius:999px;background:#fff;
         color:#820AD1;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit}
  button:active{transform:scale(.99)}
  .erro{margin-top:20px;background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.28);
        padding:12px 14px;border-radius:12px;font-size:14px}
  .rodape{font-size:12px;opacity:.65;text-align:center;margin-top:26px}
</style>
</head>
<body>
  <div class="topo">
    <div class="marca">nu</div>
    <div class="bemvindo">Bem-vindo de volta</div>
    <div class="sub">Entre com sua conta para acessar o app.</div>
  </div>

  <form method="post" autocomplete="off">
    <?php if ($erro): ?><div class="erro"><?= htmlspecialchars($erro) ?></div><?php endif; ?>
    <label for="usuario">USUÁRIO</label>
    <input id="usuario" name="usuario" required autofocus placeholder="seu usuário"
           value="<?= htmlspecialchars($_POST['usuario'] ?? '') ?>">
    <label for="senha">SENHA</label>
    <input id="senha" name="senha" type="password" required placeholder="••••••••">
    <button type="submit">Entrar</button>
  </form>

  <div class="rodape">Nubank Clone · uso pessoal e demonstração</div>
<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("service-worker.js"); });
}
</script>
</body>
</html>

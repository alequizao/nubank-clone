<?php
require_once __DIR__ . '/backend/auth.php';
$user = auth_require();

$html = __DIR__ . '/web-build/index.html';
if (!is_file($html)) {
    http_response_code(500);
    echo '<h1>Build do app não encontrado</h1><p>Rode <code>npx expo export:web</code> na pasta do projeto.</p>';
    exit;
}

$conteudo = file_get_contents($html);

// O build do Expo gera caminhos absolutos (/static/...). Reescreve para o caminho
// relativo do build, funcionando tanto em /nubank/ quanto no subdomínio.
$conteudo = str_replace(['href="/', 'src="/'], ['href="web-build/', 'src="web-build/'], $conteudo);

// Troca o manifest do build pelo manifest.php da raiz (escopo e ícones corretos).
$conteudo = preg_replace('#<link[^>]+rel="manifest"[^>]*>#i', '', $conteudo);

$pwa = '<link rel="manifest" href="manifest.php">'
     . '<meta name="theme-color" content="#820AD1">'
     . '<meta name="apple-mobile-web-app-capable" content="yes">'
     . '<meta name="mobile-web-app-capable" content="yes">'
     . '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
     . '<meta name="apple-mobile-web-app-title" content="Nubank">'
     . '<link rel="apple-touch-icon" href="pwa-icons/icon-180.png">'
     . '<link rel="icon" type="image/png" sizes="192x192" href="pwa-icons/icon-192.png">'
     // Tela cheia: ocupa a altura toda, respeita o recorte do topo (notch) e
     // pinta essa faixa de roxo para o header do app encostar na borda.
     . '<style>'
     // O app ocupa exatamente a área visível, já descontando o recorte do topo e a
     // barra de gestos do iPhone — senão o #root fica mais alto que a tela e a barra
     // de navegação (posicionada no rodapé) some por baixo do indicador de home.
     . 'html{height:100%;background:#820AD1}'
     . 'body{box-sizing:border-box;height:100dvh;min-height:100dvh;margin:0;overflow:hidden;'
     .   'overscroll-behavior:none;background:#820AD1;'
     .   'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}'
     . 'body::before{content:"";position:fixed;top:0;left:0;right:0;height:env(safe-area-inset-top);background:#820AD1;z-index:9999}'
     . '#root{height:100%;min-height:0;flex:1;display:flex;background:#fff;overflow:hidden}'
     . '</style>';
$conteudo = str_replace('</head>', $pwa . '</head>', $conteudo);

// Registra o service worker do PWA logo no início do body.
$sw = '<script>if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("service-worker.js")})}</script>'
     . '<script src="pull-refresh.js" defer></script>';

echo str_replace('<body>', '<body>' . $sw, $conteudo);

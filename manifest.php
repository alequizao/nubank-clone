<?php
// Manifest do PWA servido na raiz do app (escopo correto em qualquer caminho).
require_once __DIR__ . '/backend/config.php';
header('Content-Type: application/manifest+json; charset=utf-8');

$base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/';

$icones = [];
foreach ([72, 96, 128, 144, 152, 192, 256, 384, 512] as $s) {
    $icones[] = [
        'src'     => $base . 'pwa-icons/icon-' . $s . '.png',
        'sizes'   => $s . 'x' . $s,
        'type'    => 'image/png',
        'purpose' => 'any maskable',
    ];
}

echo json_encode([
    'name'             => 'Nubank',
    'short_name'       => 'Nubank',
    'description'      => 'Sua conta, seu cartão e seus limites em um só lugar.',
    'lang'             => 'pt-BR',
    'start_url'        => $base,
    'scope'            => $base,
    'display'          => 'fullscreen',
    'display_override' => ['fullscreen', 'standalone', 'minimal-ui'],
    'orientation'      => 'portrait',
    'theme_color'      => '#820AD1',
    'background_color' => '#820AD1',
    'icons'            => $icones,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

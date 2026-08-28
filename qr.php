<?php
/**
 * Gera o QR Code de uma cobrança Pix (ou de um texto qualquer).
 * Uso: qr.php?id=<id da cobrança>  ou  qr.php?texto=<conteúdo>
 * O PNG fica em cache em uploads/qr/ para não gerar de novo a cada abertura.
 */
require_once __DIR__ . '/backend/auth.php';
require_once __DIR__ . '/backend/db.php';
require_once __DIR__ . '/vendor/autoload.php';

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use chillerlan\QRCode\Common\EccLevel;
use chillerlan\QRCode\Output\QRGdImagePNG;

if (!auth_check()) { http_response_code(401); exit; }

$texto = '';
if (!empty($_GET['id'])) {
    $st = db()->prepare('SELECT codigo FROM pix_cobrancas WHERE id = ?');
    $st->execute([(int) $_GET['id']]);
    $texto = (string) $st->fetchColumn();
} elseif (isset($_GET['texto'])) {
    $texto = substr((string) $_GET['texto'], 0, 900);
}

if ($texto === '') { http_response_code(404); exit; }

$dir = __DIR__ . '/uploads/qr';
if (!is_dir($dir)) { mkdir($dir, 0755, true); }
$arquivo = $dir . '/' . sha1($texto) . '.png';

if (!is_file($arquivo)) {
    $opcoes = new QROptions([
        'outputInterface' => QRGdImagePNG::class,
        'eccLevel'     => EccLevel::M,
        'scale'        => 8,
        'quietzoneSize' => 2,
        'outputBase64' => false,
    ]);
    file_put_contents($arquivo, (new QRCode($opcoes))->render($texto));
}

header('Content-Type: image/png');
header('Cache-Control: private, max-age=86400');
readfile($arquivo);

<?php
/**
 * API do app (JSON). Só responde com sessão válida.
 *   GET  api.php?acao=estado
 *   POST api.php?acao=pix_enviar   { valor, nome, descricao }
 */
require_once __DIR__ . '/backend/auth.php';
require_once __DIR__ . '/backend/dados.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if (!auth_check()) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'erro' => 'Sessão expirada.', 'login' => true]);
    exit;
}

$acao = isset($_GET['acao']) ? $_GET['acao'] : 'estado';

$in = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $corpo = file_get_contents('php://input');
    $json  = json_decode($corpo, true);
    $in    = is_array($json) ? $json : $_POST;
}

try {
    if ($acao === 'estado') {
        echo json_encode(['ok' => true, 'estado' => estado()], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'erro' => 'Use POST para esta operação.']);
        exit;
    }

    $mensagem = operar($acao, $in);
    echo json_encode(['ok' => true, 'mensagem' => $mensagem, 'estado' => estado()], JSON_UNESCAPED_UNICODE);
} catch (OperacaoInvalida $e) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Falha interna: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

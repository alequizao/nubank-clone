<?php
require_once __DIR__ . '/db.php';

function auth_start() {
    if (session_status() === PHP_SESSION_NONE) {
        session_name('NUBANKSESS');
        session_start();
    }
}

function auth_user() {
    auth_start();
    return isset($_SESSION['user']) ? $_SESSION['user'] : null;
}

function auth_check() {
    return auth_user() !== null;
}

function auth_login($usuario, $senha) {
    auth_start();
    $st = db()->prepare('SELECT * FROM usuarios WHERE usuario = ? AND ativo = 1 LIMIT 1');
    $st->execute([$usuario]);
    $u = $st->fetch();
    if (!$u || !password_verify($senha, $u['senha'])) {
        return false;
    }
    db()->prepare('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?')->execute([$u['id']]);
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id'      => (int) $u['id'],
        'usuario' => $u['usuario'],
        'nome'    => $u['nome'],
        'nivel'   => $u['nivel'],
    ];
    return true;
}

function auth_logout() {
    auth_start();
    $_SESSION = [];
    session_destroy();
}

function auth_require() {
    if (!auth_check()) {
        header('Location: login.php');
        exit;
    }
    return auth_user();
}

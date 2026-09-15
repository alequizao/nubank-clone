<?php
/*
 * Nubank Clone · Desenvolvido por Alequizao <alequizao.dev@gmail.com>
 * https://github.com/alequizao · © 2026 Alequizao. Todos os direitos reservados.
 */
require_once __DIR__ . '/backend/auth.php';
auth_logout();
header('Location: login.php');

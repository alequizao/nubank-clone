<?php
// Copie para config.php e ajuste. O config.php real NÃO vai para o repositório.
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'nubank');
define('DB_USER', 'nubank');
define('DB_PASS', 'SUA_SENHA');
define('DB_CHARSET', 'utf8mb4');

// Usuário master criado pelo instalador (backend/instalar.php)
define('MASTER_USER', 'seu_usuario');
define('MASTER_PASS', 'sua_senha');

// O PHP do servidor vem com fuso da China; o app é de Maceió.
date_default_timezone_set('America/Maceio');

define('APP_NAME', 'Nubank Clone');
define('APP_VERSION', '1.0.0');

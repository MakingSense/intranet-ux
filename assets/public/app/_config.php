<?php
define('SITE_URL', (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST']);
define('ALLOWED_DOMAIN', 'makingsense.com');
define('COOKIE_LIFE',   60 * 60 * 24 * 30); // 30 days.

define('GOOGLE_CLIENT_ID',    '16264640556-cevvvmpk7u1gucodamlvpghqap25lui4.apps.googleusercontent.com');
define('GOOGLE_SECRET',       'xLEL4M-akJLLOG7-O88bv1g5');
define('GOOGLE_REDIRECT_URI', SITE_URL . '/login.php');

define('CACHE_MANIFEST',      true);
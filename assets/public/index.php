<?php
require_once 'app/_tools.php';

$module = substr($_SERVER['REQUEST_URI'], 1);
$unprotected_modules = array('login', 'logout');

if (!$module) {
  header('location: ./dash');
  exit;
}

if (in_array($module, $unprotected_modules) !== false) {
  require "{$module}.php";
  exit;
}

if (sessionCheck()) {
  $data = fetchData();
  if (preg_match('/[a-z0-9_\-]+/i', $module) && file_exists("static/{$module}.html")) {
    echo loadTemplate($data, "static/{$module}.html");
  } else {
    echo loadTemplate($data, 'static/404.html');
  }
  exit;
} else {
  header('location: ./login');
}
exit;
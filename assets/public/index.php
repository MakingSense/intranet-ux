<?php
require_once '../app/_tools.php';


$module = @$_GET['m'];
if (!$module) {
  header('location: ./dash');
  exit;
}

if (sessionCheck()) {
  $module = @$_GET['m'];
  if (preg_match('/[a-z0-9_\-]+/i', $module) && file_exists("static/{$module}.html")) {
    require("static/{$module}.html");
  } else {
    require("static/404.html");
  }
  exit;
} else {
  header('location: ./login');
}
exit;
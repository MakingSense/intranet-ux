<?php
require_once '../app/_tools.php';

if (!sessionCheck()) {
  header('location: ./login');
  exit;
}

echo "Dash!<br />";
var_dump(getUserInfo()->email);
<?php
require_once '../app/_tools.php';

$code = @$_GET['code'];
if (($code && saveToken($code))) {
  header('location: ./dash');
  exit;
}

$url = getAuthUrl();
?>
<html>
  <head>
    <title>Login!</title>
  </head>
  <body>
    <a class='login' href='<?php echo $url; ?>'>Login to gugel</a>
  </body>
</html>
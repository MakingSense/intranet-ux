<?php
require_once '../app/_tools.php';

if (sessionCheck()) {
  header('location: ./dash');
} else {
  header('location: ./login');
}
exit;
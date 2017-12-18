<?php
define('TIMESTAMP_FILE', 'last-updated.dt');
$GLOBALS['cached_mimes'] = array('jpg', 'png', 'js', 'html', 'eot', 'svg', 'ttf', 'woff', 'woff2', 'ico');

function addFile($fpath) {
  $mt = @filemtime($fpath);
  if ($mt && (!file_exists(TIMESTAMP_FILE) || (int)file_get_contents(TIMESTAMP_FILE) < $mt)) {
    file_put_contents(TIMESTAMP_FILE, $mt);
  }
  echo $fpath . PHP_EOL;
}

function addDir($path, $recursive = false) {
  $list = scandir($path);

  foreach ($list as $filename) {
    $fpath = $path . '/' . $filename;
    if ($fpath === '.' || $fpath === '..') continue;
    $info = pathinfo($fpath);
    if (array_search(@$info['extension'], $GLOBALS['cached_mimes']) !== false) {
      echo $fpath . PHP_EOL;
      $mt = @filemtime($fpath);
      if ($mt && (!file_exists(TIMESTAMP_FILE) || (int)file_get_contents(TIMESTAMP_FILE) < $mt)) {
        file_put_contents(TIMESTAMP_FILE, $mt);
      }
    }
  }
}

function getLastMTime() {
  return file_get_contents(TIMESTAMP_FILE);
}

function touchMTime() {
  file_put_contents(TIMESTAMP_FILE, time());
}
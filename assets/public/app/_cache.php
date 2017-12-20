<?php
$GLOBALS['cached_mimes'] = array('jpg', 'png', 'js', 'html', 'eot', 'svg', 'ttf', 'woff', 'woff2', 'ico', 'css');
$GLOBALS['appcache-lastmtime'] = 0;

function addFile($fpath) {
  $mt = @filemtime($fpath);
  if ($mt && (getLastMTime() < $mt)) {
    updateLastMTime($mt);
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
      $mt = @filemtime($fpath);
      echo $fpath . PHP_EOL;
      if ($mt && (getLastMTime() < $mt)) {
        updateLastMTime($mt);
      }
    }
  }
}

function getLastMTime() {
  return $GLOBALS['appcache-lastmtime'];
}

function updateLastMTime($mtime) {
  $GLOBALS['appcache-lastmtime'] = (int) $mtime;
}

function sendToBrowser($content) {
  header('Content-Description: Cache Manifest');
  header('Content-Type: text/cache-manifest');
  header('Cache-Control: no-store, no-cache');
  header('Expires: 0');
  header('Pragma: public');
  header('Content-Length: ' . strlen($content));
  echo $content;
  exit;
}
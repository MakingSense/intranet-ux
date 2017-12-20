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
      echo $fpath . PHP_EOL;
      $mt = @filemtime($fpath);
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
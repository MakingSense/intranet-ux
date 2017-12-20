<?php
include 'app/_config.php';
include 'app/_cache.php';

if (!defined('CACHE_MANIFEST') || !CACHE_MANIFEST) {
  $output  = 'CACHE MANIFEST' . PHP_EOL;
  $output .= '# Manifest cache disabled' . PHP_EOL;
  $output .= 'NETWORK:' . PHP_EOL;
  $output .= '*' . PHP_EOL;
  sendToBrowser($output);
  exit;
}

ob_start();
addDir('css');
addDir('fonts');
addDir('img');
addDir('js');
$files = ob_get_clean();

$mtime = getLastMTime();
$mtimestr = date('Y-m-d\TH:i:s\Z', $mtime);
$hash = md5($mtime);

$output = <<<EoS
CACHE MANIFEST
# {$mtimestr}

CACHE:
{$files}

NETWORK:
*

# Hash: {$hash}
EoS;

sendToBrowser($output);
exit;
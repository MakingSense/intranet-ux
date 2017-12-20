<?php
include 'app/_config.php';
include 'app/_cache.php';

if (!defined('CACHE_MANIFEST') || !CACHE_MANIFEST) exit;

ob_start();
addDir('css');
addDir('fonts');
addDir('img');
addDir('js');
$files = ob_get_clean();

$mtime = getLastMTime();
$mtimestr = date('Y-m-d\TH:i:s\Z');

$output = <<<EoS
CACHE MANIFEST
# {$mtimestr}

CACHE:
{$files}

NETWORK:
*
EoS;

header('Content-Description: Cache Manifest');
header('Content-Type: text/cache-manifest');
header("Cache-Control: max-age=2592000"); // 30days (60sec * 60min * 24hours * 30days)
header('Pragma: public');
header('Content-Length: ' . strlen($output));
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');
echo $output;
exit;
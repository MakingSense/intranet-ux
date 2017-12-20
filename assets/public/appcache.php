<?php
include 'app/_cache.php';

ob_start();
echo 'CACHE MANIFEST' . PHP_EOL;

echo PHP_EOL;

echo 'CACHE:' . PHP_EOL;
// Individual files or friendly URLs
addFile('dash');
// Full directories
addDir('css');
addDir('fonts');
addDir('img');
addDir('js');

echo PHP_EOL;

echo 'NETWORK:' . PHP_EOL;
echo '*' . PHP_EOL;

$output = ob_get_clean();

header('Content-Description: Cache Manifest');
header('Content-Type: text/cache-manifest');
header("Cache-Control: max-age=2592000"); // 30days (60sec * 60min * 24hours * 30days)
header('Pragma: public');
header('Content-Length: ' . strlen($output));
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', getLastMTime()) . ' GMT');
echo $output;
exit;
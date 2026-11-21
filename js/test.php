
<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
ini_set('html_errors', '1');
error_reporting(E_ALL);

header('Content-Type: text/html; charset=utf-8');

echo '<h2>DEBUG STARTED</h2>';

echo '<pre>';
echo 'PHP VERSION: ' . PHP_VERSION . "\n";
echo 'PHP FILE: ' . __FILE__ . "\n";
echo 'PDO: ' . (extension_loaded('pdo') ? 'YES' : 'NO') . "\n";
echo 'PDO MYSQL: ' . (extension_loaded('pdo_mysql') ? 'YES' : 'NO') . "\n";
echo 'MBSTRING: ' . (extension_loaded('mbstring') ? 'YES' : 'NO') . "\n";
echo '</pre>';

register_shutdown_function(function () {
    $error = error_get_last();

    if ($error !== null) {
        echo '<pre style="background:#300;color:white;padding:20px;">';
        echo "SHUTDOWN ERROR\n";
        echo 'TYPE: ' . $error['type'] . "\n";
        echo 'MESSAGE: ' . htmlspecialchars($error['message']) . "\n";
        echo 'FILE: ' . htmlspecialchars($error['file']) . "\n";
        echo 'LINE: ' . $error['line'];
        echo '</pre>';
    }
});

echo '<h2>PHP EXECUTION SUCCESSFUL</h2>';

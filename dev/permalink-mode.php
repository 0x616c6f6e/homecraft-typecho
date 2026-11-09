<?php
/** Switch only the independent synthetic fixture database. */
if (PHP_SAPI !== 'cli' || !in_array($argv[1] ?? '', ['0','1'], true)) {
    fwrite(STDERR, "Usage: php /dev-tools/permalink-mode.php 0|1\n"); exit(1);
}
$db = new PDO('sqlite:/app/usr/theme-dev.db');
$db->prepare("UPDATE typecho_options SET value=? WHERE name='rewrite' AND user=0")->execute([$argv[1]]);
echo "Development permalink mode updated.\n";

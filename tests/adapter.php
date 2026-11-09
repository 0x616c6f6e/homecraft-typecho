<?php
/** Verify the thin adapter's output boundary with script-breaking input. */
require '/app/config.inc.php';
require '/app/usr/themes/homecraft-typecho/functions.php';

$value = ['title' => '</script><script>globalThis.injected=true</script>', 'text' => '" & < > 中文'];
$json = hcJson($value);
if (stripos($json, '</script') !== false || json_decode($json, true, 512, JSON_THROW_ON_ERROR) !== $value) {
    throw new RuntimeException('Bootstrap JSON is not safe or does not round-trip.');
}
$escaped = hcEscape($value['title']);
if (strpos($escaped, '<script>') !== false || html_entity_decode($escaped, ENT_QUOTES, 'UTF-8') !== $value['title']) {
    throw new RuntimeException('Plain text escaping is not safe or does not round-trip.');
}
try {
    hcJson(['invalid' => "\xB1\x31"]);
    throw new RuntimeException('Invalid UTF-8 silently produced broken JSON.');
} catch (JsonException $expected) {
    // Malformed data must not produce an executable or partial script payload.
}
echo "Adapter output boundary checks passed.\n";

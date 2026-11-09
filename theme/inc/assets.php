<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** A packaged release selects one complete content-addressed asset graph. */
function hcAssetBase(string $themeBase): string
{
    $manifest = dirname(__DIR__) . '/release.json';
    if (!is_file($manifest)) return $themeBase; // Source checkout: development assets.
    $release = json_decode(file_get_contents($manifest), true, 512, JSON_THROW_ON_ERROR);
    $id = $release['assetId'] ?? '';
    if (!is_string($id) || !preg_match('/^[a-f0-9]{64}$/D', $id)
        || !is_file(dirname(__DIR__) . '/static/' . $id . '/js/app.js')) {
        throw new \RuntimeException('Incomplete Homecraft release; restore the previous complete package.');
    }
    return $themeBase . 'static/' . $id . '/';
}

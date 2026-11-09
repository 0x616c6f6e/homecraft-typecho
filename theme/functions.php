<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

function hcEscape($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function hcJson($value): string
{
    return json_encode($value, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);
}

function hcViewKind($archive): string
{
    // Native front archives may not initialize archiveSlug; avoid is(..., slug).
    if ($archive->getThemeFile() === '404.php') return 'notFound';
    if ($archive->is('page') && $archive->template === 'scene.php') return 'home';
    if ($archive->is('post')) return 'post';
    if ($archive->is('page')) return 'page';
    if ($archive->is('search')) return 'search';
    return 'archive';
}

function hcBootstrap($archive): array
{
    $options = \Utils\Helper::options();
    return [
        'schemaVersion' => 1,
        'view' => ['kind' => hcViewKind($archive), 'sceneEnabled' => hcViewKind($archive) === 'home'],
        'site' => ['title' => (string) $options->title, 'description' => (string) $options->description, 'url' => (string) $options->siteUrl, 'language' => 'zh-CN'],
        'urls' => [
            'themeBase' => rtrim($options->themeUrl, '/') . '/',
            'home' => (string) $options->siteUrl,
            'blog' => $options->frontArchive ? \Typecho\Router::url('archive', [], $options->index) : (string) $options->siteUrl,
            'feed' => (string) $options->feedUrl,
        ],
        'scene' => ['name' => (string) $options->title, 'skin' => '', 'languages' => ['zh'], 'weather' => null, 'dock' => ['blog', 'about', 'phone'], 'mailbox' => ['endpoint' => '', 'email' => '', 'turnstileSitekey' => ''], 'badge' => true],
        // Phase 1 intentionally ships no content API or recent-post serializer.
        'posts' => [],
        'pagination' => null,
    ];
}

/** Native routing remains the authority; only assemble presentation metadata. */
function hcPageTitle($archive, array $data): string
{
    if ($data['view']['kind'] === 'home') return $data['site']['title'];
    if ($data['view']['kind'] === 'notFound') return '页面未找到';
    return (string) ($archive->getArchiveTitle() ?: '文章列表');
}

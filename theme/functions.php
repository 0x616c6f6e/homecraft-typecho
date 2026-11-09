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

/** Public summaries use native text rendering/permalinks, never raw rows. */
function hcPublicPosts(): array
{
    static $summaries;
    if (isset($summaries)) return $summaries;
    require_once __DIR__ . '/inc/public-posts.php';
    $posts = HomecraftPublicPosts::alloc(['pageSize' => 10]);
    $summaries = [];
    while ($posts->next()) {
        $summaries[] = [
            'id' => (int) $posts->cid,
            'title' => (string) $posts->title,
            'url' => (string) $posts->permalink,
            'publishedAt' => gmdate('c', (int) $posts->created),
            'excerpt' => html_entity_decode((string) $posts->plainExcerpt, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        ];
    }
    return $summaries;
}

/** Project native navigation URLs rather than rebuilding Typecho routes. */
function hcPagination($archive): ?array
{
    if (!in_array(hcViewKind($archive), ['archive', 'search'], true)) return null;
    $links = [];
    foreach (['prev' => 'previousUrl', 'next' => 'nextUrl'] as $direction => $key) {
        ob_start();
        $archive->pageLink('Page', $direction);
        $html = ob_get_clean();
        $links[$key] = preg_match('/href="([^\"]*)"/', $html, $match)
            ? html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5, 'UTF-8') : null;
    }
    return ['currentPage' => $archive->getCurrentPage(), 'totalPages' => $archive->getTotalPage()] + $links;
}

function hcBootstrap($archive): array
{
    $options = \Utils\Helper::options();
    $kind = hcViewKind($archive);
    return [
        'schemaVersion' => 1,
        'view' => ['kind' => $kind, 'sceneEnabled' => $kind === 'home'],
        'site' => ['title' => (string) $options->title, 'description' => (string) $options->description, 'url' => (string) $options->siteUrl, 'language' => 'zh-CN'],
        'urls' => [
            'themeBase' => rtrim($options->themeUrl, '/') . '/',
            'home' => (string) $options->siteUrl,
            'blog' => $options->frontArchive ? \Typecho\Router::url('archive', [], $options->index) : (string) $options->siteUrl,
            'feed' => (string) $options->feedUrl,
        ],
        'scene' => ['name' => (string) $options->title, 'skin' => '', 'languages' => ['zh'], 'weather' => null, 'dock' => ['blog', 'about', 'phone'], 'mailbox' => ['endpoint' => '', 'email' => '', 'turnstileSitekey' => ''], 'badge' => true],
        'posts' => $kind === 'home' ? hcPublicPosts() : [],
        'pagination' => hcPagination($archive),
    ];
}

/** Native routing remains the authority; only assemble presentation metadata. */
function hcPageTitle($archive, array $data): string
{
    if ($data['view']['kind'] === 'home') return $data['site']['title'];
    if ($data['view']['kind'] === 'notFound') return '页面未找到';
    return (string) ($archive->getArchiveTitle() ?: '文章列表');
}

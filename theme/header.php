<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
require_once __DIR__ . '/functions.php';
$data = hcBootstrap($this);
$base = $data['urls']['assetBase'];
// HTML includes request/user-specific forms; never cache it as a public asset.
$this->response->setHeader('Cache-Control', 'private, no-store');
$isScene = $data['view']['sceneEnabled'];
$pageTitle = hcPageTitle($this, $data);
$documentTitle = $data['view']['kind'] === 'home' ? $pageTitle : $pageTitle . ' · ' . $data['site']['title'];
?>
<!doctype html>
<html lang="<?php echo hcEscape($data['site']['language']); ?>">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title><?php echo hcEscape($documentTitle); ?></title>
<link rel="icon" href="<?php echo hcEscape($data['profile']['favicon'] ?: $base . 'assets/favicon.png'); ?>">
<?php if ($isScene): ?>
<meta name="theme-color" content="#7fb2e8">
<meta name="color-scheme" content="only light">
<meta name="darkreader-lock">
<link rel="stylesheet" href="<?php echo hcEscape($base . 'engine/style.css'); ?>">
<link rel="stylesheet" href="<?php echo hcEscape($base . 'css/scene.css'); ?>">
<?php
$imports = ['imports' => [
    'three' => $base . 'vendor/three/three.module.min.js',
    '@engine/' => $base . 'engine/', '@world/' => $base . 'world/',
    '@world/build.js' => $base . ($data['scene']['preset'] === 'show-home' ? 'js/show-home-build.js' : ($data['scene']['preset'] === 'starter' ? 'world/build.js' : 'js/world-build.js')),
    '@world/layout.js' => $base . ($data['scene']['preset'] === 'show-home' ? 'js/show-home-layout.js' : 'js/world-layout.js'),
    '@config' => $base . 'js/home-config.js',
    $base . 'engine/traveller.js' => $base . 'js/traveller.js',
]];
?>
<script type="importmap"><?php echo hcJson($imports); ?></script>
<?php else: ?>
<link rel="stylesheet" href="<?php echo hcEscape($base . 'css/reading.css'); ?>">
<?php endif; ?>
<script id="homecraft-bootstrap" type="application/json"><?php echo hcJson($data); ?></script>
<?php $this->header(); ?>
</head>
<body class="<?php echo $isScene ? 'scene-view' : 'reading-view'; ?>">
<?php if (!$isScene): ?>
<a class="skip-link" href="#main"><?php echo hcText('跳至正文','Skip to content'); ?></a>
<header class="site-header">
<a class="site-name" href="<?php echo hcEscape($data['urls']['home']); ?>"><?php if ($data['profile']['logo']): ?><img class="brand-logo" src="<?php echo hcEscape($data['profile']['logo']); ?>" alt="" width="32" height="32"><?php endif; ?><?php echo hcEscape($data['profile']['name']); ?></a>
<nav aria-label="网站导航"><a href="<?php echo hcEscape($data['urls']['home']); ?>"><?php echo hcText('首页','Home'); ?></a><a href="<?php echo hcEscape($data['urls']['blog']); ?>"><?php echo hcText('文章列表','Posts'); ?></a>
<?php foreach (['about'=>hcText('关于','About'),'guestbook'=>hcText('留言','Guestbook')] as $key=>$label): ?>
<?php if ($data['pages'][$key]): ?><a class="mapped-<?php echo $key; ?>" href="<?php echo hcEscape($data['pages'][$key]['url']); ?>"><?php echo $label; ?></a><?php endif; ?>
<?php endforeach; ?></nav>
<form class="site-search" method="get" action="<?php echo hcEscape($data['urls']['home']); ?>" role="search">
<label for="search-input"><?php echo hcText('搜索文章','Search posts'); ?></label><input id="search-input" type="search" name="s" value="<?php echo hcEscape($this->is('search') ? $this->request->get('keywords', '') : ''); ?>" required><button type="submit"><?php echo hcText('搜索','Search'); ?></button>
</form>
<details class="category-menu"><summary><?php echo hcText('分类','Categories'); ?></summary><ul>
<?php $categories = \Widget\Metas\Category\Rows::alloc(); ?>
<?php while ($categories->next()): ?><li><a href="<?php echo hcEscape($categories->permalink); ?>"><?php echo hcEscape($categories->name); ?></a></li><?php endwhile; ?>
</ul></details>
</header>
<?php endif; ?>

<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
require_once __DIR__ . '/functions.php';
$data = hcBootstrap($this);
$base = $data['urls']['themeBase'];
$isScene = $data['view']['sceneEnabled'];
$pageTitle = hcPageTitle($this, $data);
$documentTitle = $isScene ? $pageTitle : $pageTitle . ' · ' . $data['site']['title'];
?>
<!doctype html>
<html lang="<?php echo hcEscape($data['site']['language']); ?>">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title><?php echo hcEscape($documentTitle); ?></title>
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
<a class="skip-link" href="#main">跳至正文</a>
<header class="site-header">
<a class="site-name" href="<?php echo hcEscape($data['urls']['home']); ?>"><?php echo hcEscape($data['site']['title']); ?></a>
<nav aria-label="网站导航"><a href="<?php echo hcEscape($data['urls']['home']); ?>">3D 首页</a><a href="<?php echo hcEscape($data['urls']['blog']); ?>">文章列表</a></nav>
<form class="site-search" method="get" action="<?php echo hcEscape($data['urls']['home']); ?>" role="search">
<label for="search-input">搜索文章</label><input id="search-input" type="search" name="s" value="<?php echo hcEscape($this->is('search') ? $this->request->get('keywords', '') : ''); ?>" required><button type="submit">搜索</button>
</form>
<details class="category-menu"><summary>分类</summary><ul>
<?php $categories = \Widget\Metas\Category\Rows::alloc(); ?>
<?php while ($categories->next()): ?><li><a href="<?php echo hcEscape($categories->permalink); ?>"><?php echo hcEscape($categories->name); ?></a></li><?php endwhile; ?>
</ul></details>
</header>
<?php endif; ?>

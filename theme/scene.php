<?php
/**
 * Homecraft 3D homepage. Select this page as the native front page.
 * @package custom
 */
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
require_once __DIR__ . '/functions.php';
$options = \Utils\Helper::options();
if (hcSettings()['homepage'] === 'reading' && $options->frontArchive) {
    $this->response->redirect(\Typecho\Router::url('archive', [], $options->index));
    return;
}
$this->need('header.php');
$data = hcBootstrap($this);
?>
<?php if (!$data['view']['sceneEnabled']): ?>
<main id="main"><h1><?php echo hcText('文章','Posts'); ?></h1><?php $this->need('partials/recent-posts.php'); ?></main>
<?php $this->need('footer.php'); return; endif; ?>
<nav class="reading-entry" aria-label="<?php echo hcText('阅读导航','Reading navigation'); ?>">
<?php if ($data['profile']['logo']): ?><img class="brand-logo" src="<?php echo hcEscape($data['profile']['logo']); ?>" alt="<?php echo hcEscape($data['profile']['name']); ?>" width="24" height="24"><?php endif; ?><a href="<?php echo hcEscape($data['urls']['blog']); ?>"> <?php echo hcText('直接阅读文章','Read articles'); ?></a><span id="scene-status" role="status"> <?php echo hcText('正在加载 3D 场景…','Loading the 3D world…'); ?></span></nav>
<main id="world" aria-label="<?php echo hcEscape($data['site']['title']); ?>"></main>
<div id="loading"><div class="bar"><i></i></div></div>
<section id="pages">
<h1 class="plain-title"><?php echo hcEscape($data['site']['title']); ?></h1>
<article class="page" data-station="blog" data-icon="blog"><h2><?php echo hcText('文章','Posts'); ?></h2><div class="placeholder-card"><?php $this->need('partials/recent-posts.php'); ?><a class="mc-button" href="<?php echo hcEscape($data['urls']['blog']); ?>"> <?php echo hcText('打开文章列表','All posts'); ?></a></div></article>
<article class="page" data-station="about"><h2><?php echo hcText('关于','About'); ?></h2><div class="placeholder-card"><p><?php echo nl2br(hcEscape($data['profile']['introduction'])); ?></p>
<?php if ($data['pages']['about']): ?><a class="mc-button" href="<?php echo hcEscape($data['pages']['about']['url']); ?>"><?php echo hcText('阅读关于页面','Read about page'); ?></a><?php endif; ?></div></article>
<?php if ($data['pages']['guestbook']): ?><article class="page" data-station="mailbox"><h2><?php echo hcText('留言','Guestbook'); ?></h2><div class="placeholder-card"><a class="mc-button" href="<?php echo hcEscape($data['pages']['guestbook']['url']); ?>"><?php echo hcText('打开留言页面','Open guestbook'); ?></a></div></article><?php endif; ?>
<article class="page" data-station="contact"><h2><?php echo hcText('联系','Contact'); ?></h2>
<?php if (!$data['profile']['links']): ?><p><?php echo hcText('联系方式尚未配置。','No contact links configured.'); ?></p><?php endif; ?>
<ul class="contact"><?php foreach ($data['profile']['links'] as $link): ?><li data-app="<?php echo hcEscape($link['id']); ?>"><span><?php echo hcEscape($link['name']); ?></span><a href="<?php echo hcEscape($link['url']); ?>" rel="noopener noreferrer"><?php echo hcEscape($link['url']); ?></a><p></p></li><?php endforeach; ?></ul></article>
</section>
<noscript><style>#world,#hud,#loading{display:none!important}#pages{display:block!important}body{overflow:auto!important}</style></noscript>
<?php $this->need('footer.php'); ?>

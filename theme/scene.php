<?php
/**
 * Homecraft 3D homepage. Select this page as the native front page.
 * @package custom
 */
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
$this->need('header.php');
$data = hcBootstrap($this);
?>
<nav class="reading-entry" aria-label="阅读导航"><a href="<?php echo hcEscape($data['urls']['blog']); ?>">直接阅读文章</a><span id="scene-status" role="status">正在加载 3D 场景…</span></nav>
<main id="world" aria-label="<?php echo hcEscape($data['site']['title']); ?>"></main>
<div id="loading"><div class="bar"><i></i></div></div>
<section id="pages">
<h1 class="plain-title"><?php echo hcEscape($data['site']['title']); ?></h1>
<article class="page" data-station="blog" data-icon="blog"><h2>文章</h2><div class="placeholder-card"><div class="recent-posts" data-recent-posts>
<?php if ($data['posts']): ?><ol>
<?php foreach ($data['posts'] as $post): ?>
<li><a href="<?php echo hcEscape($post['url']); ?>"><?php echo hcEscape($post['title']); ?></a><time datetime="<?php echo hcEscape($post['publishedAt']); ?>"><?php echo hcEscape(substr($post['publishedAt'], 0, 10)); ?></time><p><?php echo hcEscape($post['excerpt']); ?></p></li>
<?php endforeach; ?>
</ol><?php else: ?><p>还没有公开文章。</p><?php endif; ?>
</div><a class="mc-button" href="<?php echo hcEscape($data['urls']['blog']); ?>">打开文章列表</a></div></article>
<article class="page" data-station="about"><h2>关于</h2><p><?php echo hcEscape($data['site']['description']); ?></p><p>这是独立测试环境中的移植验证版。</p></article>
<article class="page" data-station="contact"><h2>联系</h2><p>联系方式尚未配置。</p><ul class="contact"></ul></article>
</section>
<noscript><style>#world,#hud,#loading{display:none!important}#pages{display:block!important}body{overflow:auto!important}</style></noscript>
<?php $this->need('footer.php'); ?>

<?php if (!defined('__TYPECHO_ROOT_DIR__')) exit; ?>
<?php $data = hcBootstrap($this); ?>
<main id="main" tabindex="-1">
<h1><?php echo hcEscape(hcPageTitle($this, $data)); ?></h1>
<?php if ($this->have()): ?>
<?php while ($this->next()): ?>
<article>
<h2><a href="<?php echo hcEscape($this->permalink); ?>"><?php echo hcEscape($this->title); ?></a></h2>
<div class="excerpt"><?php $this->excerpt(150); ?></div>
</article>
<?php endwhile; ?>
<nav class="pagination" aria-label="文章分页"><?php $this->pageNav('上一页', '下一页'); ?></nav>
<?php else: ?>
<p>没有找到内容。</p>
<?php endif; ?>
</main>

<?php if (!defined('__TYPECHO_ROOT_DIR__')) exit; ?>
<?php $data = hcBootstrap($this); ?>
<main id="main" tabindex="-1">
<h1><?php echo hcEscape(hcPageTitle($this, $data)); ?></h1>
<?php if ($this->have()): ?>
<?php while ($this->next()): ?>
<article data-post-id="<?php echo (int) $this->cid; ?>">
<h2><a href="<?php echo hcEscape($this->permalink); ?>"><?php echo hcEscape($this->title); ?></a></h2>
<?php $this->need('partials/post-meta.php'); ?>
<div class="excerpt"><?php $this->excerpt(150); ?></div>
</article>
<?php endwhile; ?>
<p class="page-position" data-page-position aria-live="polite"></p>
<nav class="pagination" aria-label="文章分页"><?php $this->pageNav('上一页', '下一页'); ?></nav>
<?php else: ?>
<p><?php echo $this->is('search') ? '没有找到匹配的文章，请尝试其他关键词。' : '还没有文章。'; ?></p>
<?php endif; ?>
</main>

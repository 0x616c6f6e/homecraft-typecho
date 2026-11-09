<?php if (!defined('__TYPECHO_ROOT_DIR__')) exit; ?>
<main id="main" tabindex="-1">
<article>
<h1><?php echo hcEscape($this->title); ?></h1>
<?php if ($this->is('post')) $this->need('partials/post-meta.php'); ?>
<div class="content"><?php $this->content(); ?></div>
</article>
<?php $this->need('partials/comments.php'); ?>
</main>

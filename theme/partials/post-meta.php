<?php if (!defined('__TYPECHO_ROOT_DIR__')) exit; ?>
<div class="post-meta">
<?php $monthUrl = \Typecho\Router::url('archive_month', ['year' => $this->date->format('Y'), 'month' => $this->date->format('m')], \Utils\Helper::options()->index); ?>
<a class="date-link" href="<?php echo hcEscape($monthUrl); ?>"><time datetime="<?php echo hcEscape(gmdate('c', (int) $this->created)); ?>"><?php $this->date(); ?></time></a>
<a class="author-link" href="<?php echo hcEscape($this->author->permalink); ?>"><?php echo hcEscape($this->author->screenName); ?></a>
<?php foreach ($this->categories as $category): ?><a class="category-link" href="<?php echo hcEscape($category['permalink']); ?>"><?php echo hcEscape($category['name']); ?></a><?php endforeach; ?>
<?php foreach ($this->tags as $tag): ?><a class="tag-link" href="<?php echo hcEscape($tag['permalink']); ?>">#<?php echo hcEscape($tag['name']); ?></a><?php endforeach; ?>
</div>

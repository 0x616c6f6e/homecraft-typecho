<?php if (!defined('__TYPECHO_ROOT_DIR__')) exit; $data = hcBootstrap($this); ?>
<div class="recent-posts" data-recent-posts>
<?php if ($data['posts']): ?><ol>
<?php foreach ($data['posts'] as $post): ?>
<li><a href="<?php echo hcEscape($post['url']); ?>"><?php echo hcEscape($post['title']); ?></a><time datetime="<?php echo hcEscape($post['publishedAt']); ?>"><?php echo hcEscape(substr($post['publishedAt'], 0, 10)); ?></time><p><?php echo hcEscape($post['excerpt']); ?></p></li>
<?php endforeach; ?>
</ol><?php else: ?><p> <?php echo hcText('还没有公开文章。','No public posts yet.'); ?></p><?php endif; ?>
</div>

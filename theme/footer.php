<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
require_once __DIR__ . '/functions.php';
$data = hcBootstrap($this);
?>
<?php if (!$data['view']['sceneEnabled']): ?>
<footer class="site-footer"><a href="<?php echo hcEscape($data['urls']['feed']); ?>"><?php echo hcText('RSS 订阅','RSS feed'); ?></a><span><?php echo hcText('由 Typecho 与 Homecraft 驱动','Powered by Typecho and Homecraft'); ?></span><?php foreach ($data['profile']['links'] as $link): ?><a href="<?php echo hcEscape($link['url']); ?>" rel="noopener noreferrer"><?php echo hcEscape($link['name']); ?></a><?php endforeach; ?></footer>
<?php endif; ?>
<?php $this->footer(); ?>
<script type="module" src="<?php echo hcEscape($data['urls']['assetBase'] . 'js/app.js'); ?>"></script>
</body>
</html>

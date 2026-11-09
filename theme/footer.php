<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
require_once __DIR__ . '/functions.php';
$data = hcBootstrap($this);
?>
<?php if (!$data['view']['sceneEnabled']): ?>
<footer class="site-footer"><a href="<?php echo hcEscape($data['urls']['feed']); ?>">RSS 订阅</a><span>由 Typecho 与 Homecraft 驱动</span></footer>
<?php endif; ?>
<?php $this->footer(); ?>
<script type="module" src="<?php echo hcEscape($data['urls']['themeBase'] . 'js/app.js'); ?>"></script>
</body>
</html>

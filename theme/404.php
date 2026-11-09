<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
$this->need('header.php');
$data = hcBootstrap($this);
?>
<main id="main" tabindex="-1"><h1>页面未找到</h1><p>这个地址没有对应的内容。</p><a href="<?php echo hcEscape($data['urls']['blog']); ?>">返回文章列表</a></main>
<?php $this->need('footer.php'); ?>

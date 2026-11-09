<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
$this->need('header.php');
$data = hcBootstrap($this);
?>
<main id="main" tabindex="-1"><h1><?php echo hcText('页面未找到','Page not found'); ?></h1><p><?php echo hcText('这个地址没有对应的内容。','There is no content at this address.'); ?></p><a href="<?php echo hcEscape($data['urls']['blog']); ?>"><?php echo hcText('返回文章列表','Back to posts'); ?></a></main>
<?php $this->need('footer.php'); ?>

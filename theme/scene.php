<?php
/**
 * Homecraft 3D homepage. Select this page as the native front page.
 * @package custom
 */
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
require_once __DIR__ . '/functions.php';
$options = \Utils\Helper::options();
if (hcSettings()['homepage'] === 'reading' && $options->frontArchive) {
    $this->response->redirect(\Typecho\Router::url('archive', [], $options->index));
    return;
}
$this->need('header.php');
$data = hcBootstrap($this);
?>
<?php if (!$data['view']['sceneEnabled']): ?>
<main id="main"><h1><?php echo hcText('文章','Posts'); ?></h1><?php $this->need('partials/recent-posts.php'); ?></main>
<?php $this->need('footer.php'); return; endif; ?>
<nav class="reading-entry" aria-label="<?php echo hcText('阅读导航','Reading navigation'); ?>">
<?php if ($data['profile']['logo']): ?><img class="brand-logo" src="<?php echo hcEscape($data['profile']['logo']); ?>" alt="<?php echo hcEscape($data['profile']['name']); ?>" width="24" height="24"><?php endif; ?><a href="<?php echo hcEscape($data['urls']['blog']); ?>"> <?php echo hcText('直接阅读文章','Read articles'); ?></a><span id="scene-status" role="status"> <?php echo hcText('正在加载 3D 场景…','Loading the 3D world…'); ?></span></nav>
<main id="world" aria-label="<?php echo hcEscape($data['site']['title']); ?>"></main>
<div id="loading"><div class="bar"><i></i></div></div>
<section id="pages">
<h1 class="plain-title"><?php echo hcEscape($data['site']['title']); ?></h1>
<article class="page" data-station="blog" data-icon="blog"><h2><?php echo hcText('文章','Posts'); ?></h2><div class="placeholder-card"><?php $this->need('partials/recent-posts.php'); ?><a class="mc-button" href="<?php echo hcEscape($data['urls']['blog']); ?>"> <?php echo hcText('打开文章列表','All posts'); ?></a></div></article>
<article class="page" data-station="about"><h2><?php echo hcText('关于','About'); ?></h2><div class="placeholder-card"><p><?php echo nl2br(hcEscape($data['profile']['introduction'])); ?></p>
<?php if ($data['pages']['about']): ?><a class="mc-button" href="<?php echo hcEscape($data['pages']['about']['url']); ?>"><?php echo hcText('阅读关于页面','Read about page'); ?></a><?php endif; ?></div></article>
<?php if ($data['pages']['guestbook']): ?><article class="page" data-station="mailbox"><h2><?php echo hcText('留言','Guestbook'); ?></h2><div class="placeholder-card"><a class="mc-button" href="<?php echo hcEscape($data['pages']['guestbook']['url']); ?>"><?php echo hcText('打开留言页面','Open guestbook'); ?></a></div></article><?php endif; ?>
<?php if ($data['scene']['preset'] === 'show-home'): ?>
<?php foreach ([
    'court'=>[hcText('篮球场','Basketball court'),hcText('在球场上投篮，或走近篮筐练习。','Shoot hoops or approach the basket to practise.')],
    'writing'=>[hcText('阁楼卧室','Loft bedroom'),hcText('沿楼梯到达阁楼；这里也可以打开文章列表。','Take the stairs to the loft, or open the post archive here.')],
    'lab'=>[hcText('车库','Garage'),hcText('示范住宅的车库与模型汽车。','The showcase garage and model car.')],
    'coffee'=>[hcText('咖啡吧','Coffee bar'),hcText('靠近吧台休息，继续浏览博客。','Take a break at the counter and explore the blog.')],
    'pool'=>[hcText('泳池','Pool'),hcText('可以下水游泳，并从泳池扶梯返回露台。','Swim in the pool and return to the terrace using its ladder.')],
    'mountain'=>[hcText('后山','Mountain'),hcText('沿后山步道探索山顶景观。','Explore the mountain paths and viewpoints.')],
] as $station=>$info): ?>
<article class="page" data-station="<?php echo $station; ?>"><h2><?php echo $info[0]; ?></h2><div class="placeholder-card"><p><?php echo $info[1]; ?></p><a class="mc-button" href="<?php echo hcEscape($data['urls']['blog']); ?>"><?php echo hcText('阅读文章','Read posts'); ?></a></div></article>
<?php endforeach; ?>
<?php endif; ?>
<article class="page" data-station="contact"><h2><?php echo hcText('联系','Contact'); ?></h2>
<?php if (!$data['profile']['links']): ?><p><?php echo hcText('联系方式尚未配置。','No contact links configured.'); ?></p><?php endif; ?>
<ul class="contact"><?php foreach ($data['profile']['links'] as $link): ?><li data-app="<?php echo hcEscape($link['id']); ?>"><span><?php echo hcEscape($link['name']); ?></span><a href="<?php echo hcEscape($link['url']); ?>" rel="noopener noreferrer"><?php echo hcEscape($link['url']); ?></a><p></p></li><?php endforeach; ?></ul></article>
</section>
<noscript><style>#world,#hud,#loading{display:none!important}#pages{display:block!important}body{overflow:auto!important}</style></noscript>
<?php $this->need('footer.php'); ?>

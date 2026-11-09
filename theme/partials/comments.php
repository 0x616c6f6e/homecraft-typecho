<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
// Native widgets retain password gates, pending-comment visibility and pagination.
$this->comments()->to($comments);
?>
<section id="comments" aria-labelledby="comments-heading">
<h2 id="comments-heading"><?php echo hcText('评论','Comments'); ?></h2>
<?php if ($comments->have()): ?>
<?php $comments->listComments(['replyWord'=>hcText('回复','Reply'), 'commentStatus'=>hcText('评论正在等待审核。','Your comment is awaiting moderation.')]); ?>
<nav class="pagination" aria-label="<?php echo hcText('评论分页','Comment pages'); ?>"><?php $comments->pageNav(hcText('上一页','Previous'),hcText('下一页','Next')); ?></nav>
<?php else: ?><p><?php echo hcText('暂无评论。','No comments yet.'); ?></p><?php endif; ?>
<?php if ($this->allow('comment')): ?>
<div id="<?php $this->respondId(); ?>" class="respond">
<div class="cancel-comment-reply"><?php $comments->cancelReply(hcText('取消回复','Cancel reply')); ?></div>
<h3><?php echo hcText('发表评论','Leave a comment'); ?></h3>
<p id="comment-help"><?php echo hcText('邮箱不会公开。标为必填的项目必须填写；评论可能需要审核。提交出错时，可用浏览器返回修改。','Your email is not published. Required fields must be completed; comments may require moderation. Use browser Back to correct submission errors.'); ?></p>
<form method="post" action="<?php $this->commentUrl(); ?>" id="comment-form" aria-describedby="comment-help">
<?php if ($this->user->hasLogin()): ?>
<p><?php echo hcText('已登录：','Signed in as: '); ?><a href="<?php $this->options->profileUrl(); ?>"><?php echo hcEscape($this->user->screenName); ?></a></p>
<?php else: ?>
<p><label for="comment-author"><?php echo hcText('称呼（必填）','Name (required)'); ?></label><input id="comment-author" name="author" autocomplete="name" maxlength="150" value="<?php $this->remember('author'); ?>" required></p>
<p><label for="comment-mail"><?php echo hcText('邮箱','Email'); ?><?php if ($this->options->commentsRequireMail) echo hcText('（必填）',' (required)'); ?></label><input id="comment-mail" name="mail" type="email" autocomplete="email" maxlength="150" value="<?php $this->remember('mail'); ?>"<?php if ($this->options->commentsRequireMail) echo ' required'; ?>></p>
<p><label for="comment-url"><?php echo hcText('网站','Website'); ?><?php if ($this->options->commentsRequireUrl) echo hcText('（必填）',' (required)'); ?></label><input id="comment-url" name="url" type="url" autocomplete="url" maxlength="255" value="<?php $this->remember('url'); ?>"<?php if ($this->options->commentsRequireUrl) echo ' required'; ?>></p>
<?php endif; ?>
<p><label for="comment-text"><?php echo hcText('内容（必填）','Comment (required)'); ?></label><textarea id="comment-text" name="text" rows="7" required><?php echo hcEscape(\Typecho\Cookie::get('__typecho_remember_text', '')); ?></textarea></p>
<button type="submit"><?php echo hcText('提交评论','Submit comment'); ?></button>
<p class="comment-submit-status" role="status" aria-live="polite"></p>
</form>
<?php if ($this->options->commentsAntiSpam): ?><noscript><p><?php echo hcText('本站启用了 Typecho 原生反垃圾保护，提交评论需要 JavaScript。','Typecho anti-spam protection is enabled; JavaScript is needed to submit comments.'); ?></p></noscript><?php endif; ?>
</div>
<?php else: ?><p class="comments-closed"><?php echo hcText('评论已关闭。','Comments are closed.'); ?></p><?php endif; ?>
</section>

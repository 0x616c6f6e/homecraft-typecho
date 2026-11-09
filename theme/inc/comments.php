<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** Rendering only: recursion, reply depth, URLs and permissions remain native. */
function threadedComments($comments, $options)
{
?>
<li id="<?php $comments->theId(); ?>" class="comment-body">
<div class="comment-author"><?php $comments->author(); ?></div>
<div class="comment-meta"><a href="<?php $comments->permalink(); ?>"><time datetime="<?php $comments->date('c'); ?>"><?php $comments->date($options->dateFormat); ?></time></a></div>
<?php if ($comments->status !== 'approved'): ?><p class="comment-awaiting-moderation" role="status"><?php echo hcEscape($options->commentStatus); ?></p><?php endif; ?>
<div class="comment-content"><?php $comments->content(); ?></div>
<div class="comment-reply"><?php hcCommentReply($comments, $options->replyWord); ?></div>
<?php if ($comments->children): ?><div class="comment-children"><?php $comments->threadedComments(); ?></div><?php endif; ?>
</li>
<?php
}

/** Typecho 1.3 comment-page canonical redirects discard replyTo query parameters.
 * Keep native permission/depth checks and JS handlers, but target the native content URL.
 */
function hcCommentReply($comments, string $word): void
{
    ob_start();
    $comments->reply($word);
    $html = ob_get_clean();
    echo preg_replace_callback('/href="([^"]*)"/', static function ($match) use ($comments) {
        $original = html_entity_decode($match[1], ENT_QUOTES, 'UTF-8');
        if (!str_contains($original, '?replyTo=')) return $match[0];
        $parts = parse_url($comments->parentContent->permalink);
        $query = [];
        parse_str($parts['query'] ?? '', $query);
        $query['replyTo'] = (int)$comments->coid;
        $parts['query'] = http_build_query($query);
        $parts['fragment'] = parse_url($original, PHP_URL_FRAGMENT) ?? '';
        return 'href="' . hcEscape(\Typecho\Common::buildUrl($parts)) . '"';
    }, $html, 1);
}

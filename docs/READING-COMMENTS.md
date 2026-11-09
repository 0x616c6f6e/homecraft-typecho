# Reading and Native Comments

## Boundaries
Version 0.0.5-dev renders native comments on post/page reading routes. Typecho owns actions, anti-spam/CSRF tokens, permissions, required-field validation, rate limits, moderation, pagination and thread depth. No new endpoint or database schema is introduced. Comments and form tokens remain in native HTML; bootstrap data still excludes them. Scene dialogs only link to canonical reading pages.

`partials/comments.php` renders the native widget/form. `inc/comments.php` provides the standard threaded rendering callback without external avatar requests. Native author/content rendering and recursive traversal remain intact. Pending feedback uses a visible status message; closed comments retain approved discussion and omit the form. Password-locked content has neither comment bodies nor a form, following the native Archive widget.

`header()` retains native reply/anti-spam scripts. The theme does not add a static anti-spam token or disable protection. With native anti-spam enabled, JavaScript is required for submission; noscript guidance explains this while content and reply navigation remain available. Required email/website flags follow native options; the signed-in branch uses the account identity.

## Native reply-link compatibility
In the tested Typecho 1.3.0, CommentPage compares the complete request URL against the canonical comment-page URL and redirects away query parameters. Native reply links on paginated comments therefore lose `replyTo` with JavaScript disabled. The thin rendering adapter retains the native reply helper's permission/depth checks, text, fragment and JavaScript handler, but changes its fallback href to the native parent-content permalink with `replyTo`. Typecho then generates the native submission action with `parent`. This avoids changing core, guessing a route or implementing another reply system. Recheck this adapter on Typecho upgrades; plugin-modified reply output is not a verified compatibility target.

## Validation recovery and duplicate interaction
Submission is a normal native form navigation. HTML field requirements provide immediate browser feedback; bypassing them still reaches Typecho validation. In this tested version, native error responses clear queued remembered cookies. Use browser Back to retain the browser's entered values and correct the error; reloading/opening a new page after an error does not guarantee draft recovery. The form explains that recovery path. No comment draft is stored by the theme in localStorage/sessionStorage.

JavaScript disables the submit button and blocks another submit event once navigation begins. The pageshow handler restores a usable button after browser Back. This is a UI safeguard, not server-side idempotency; network retries and multiple tabs remain native behavior.

## Reading enhancements
CSS constrains long code, wide tables and media to the reading column at 360 CSS pixels. Code/table areas scroll locally without widening the page. Headings, lists, quotations, focus indicators, comment nesting and forms have conventional reading styles. JavaScript adds labeled keyboard-scrollable table regions and code-copy buttons where the Clipboard API exists. Clipboard failure offers manual-copy guidance; raw content remains readable without JavaScript. Syntax highlighting is deferred.

Native navigation is retained; reading pages do not initialize/download the 3D scene. There is no client-side reading router or scene comment form.

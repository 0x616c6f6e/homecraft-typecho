# Typecho Thin Adapter Analysis

Date: 2026-11-09. Scope: Phase 1 analysis, not an implemented theme or production compatibility claim.

## Evidence and observed environment

Read-only inspection used `sudo -n docker ps`, formatted `docker inspect`, `docker image inspect`, and `docker exec` limited to `php -v`, the application version constant and plugin-directory names. No credentials, application configuration, production database contents or user content were read. No running service was changed.

| Item | Observed value |
| --- | --- |
| Production container | `typecho` |
| Image tag | `joyqi/typecho:nightly-php8.2-apache` |
| Running image and repository digest | `joyqi/typecho@sha256:657d44a8b20263095b5136562edfc6e4ec4f48ea1296337d4c16b48fabc12558` |
| Application constant | Typecho `1.3.0` in `/app/var/Typecho/Common.php` |
| PHP | `8.2.30` CLI, NTS |
| Present plugin directories | `Handsome`, `HelloWorld`; existence does not prove activation |
| Permalink mode / enabled plugins | Not inspected; verify in synthetic environment and, separately, admin UI if needed |

Official source was cloned to ignored `work/typecho/upstream`, then checked out at tag `v1.3.0`, commit `e9f23304bf20c0c355ef1df9634d42148cbc53b5`. The initially fetched moving upstream HEAD was `1e53c04e1ef90e61150e78917314adaeb9028bf5` (`1.3.1-rc`) and is **not** this analysis baseline. Matching the production version string does not establish binary/source equality with its nightly image.

All source paths and line references below refer to the pinned v1.3.0 checkout. Browse them through the [immutable official source tree](https://github.com/typecho/typecho/tree/e9f23304bf20c0c355ef1df9634d42148cbc53b5). Source inspection validates APIs, not browser behavior.

## Theme discovery and PHP boundary

- `var/Widget/Themes/Rows.php:38` discovers `usr/themes/<theme>/index.php` and parses its PHPDoc metadata. Put the theme display name in `@package`, plus author/version/link notices as appropriate.
- `var/Typecho/Plugin.php:198` maps `package` to parsed `title`. This distinction matters for custom homepage templates below.
- `var/Widget/Archive.php:1305` implements `$this->need('header.php')`; native template selection/rendering remains Typecho-owned. Use guarded PHP files (`if (!defined('__TYPECHO_ROOT_DIR__')) exit;`).
- `var/Widget/Archive.php:988` and `:1244` expose header/footer hooks. Preserve them on content templates for plugins, feeds and native comment support.
- JavaScript owns the scene, panels, transitions, input/focus, fallback enhancement and runtime state. PHP only selects safe data, renders semantic fallback markup and forms, serializes bootstrap state and supplies native URLs/settings. No new service, database schema, CMS or REST prerequisite is needed.

## Conflict-aware native blog index

Integration update: actual POC testing found that file homepages also skip feed-field initialization, making native `header()` fail. The coordinator selected the native page variant described below: `frontPage=page:<cid>`, page template `scene.php`, and `frontArchive=1`. The following file-homepage discussion is retained as investigation evidence, not the final chosen configuration. See `INTEGRATION.md` for the decision.

**Runtime correction:** integration testing by the coordinator found that the native `file:scene.php` homepage returns before initializing the typed feed properties. Calling `$this->header()` on that object fatals with `Typed property Widget\Archive::$archiveFeedUrl must not be accessed before initialization`. The original source-only inference that this method could be used normally on a file homepage was incorrect. Passing feed overrides into `header($rule)` cannot fix this because the method reads the properties before merging overrides. Do not patch core or mutate private properties.

Recommended native production direction: create/select a normal published scene homepage page, assign a scene custom template, set `frontPage=page:<cid>` and enable the native front archive. The `page:` branch continues through normal archive initialization, loading `functions.php`, `themeInit`, feed properties, single-page handling and standard header/footer behavior. Keep scene layout separate from ordinary page rendering, disable comments on this homepage, and use `is('index')` / the explicit integration view to identify it. Verify its native permalink/canonical redirect behavior in the isolated fixture. This approach requires a content page and should not silently create production content.

For the current POC, a custom-file homepage remains viable **only with the explicit manual scene-head adapter below**. Native archive routing is the same in both approaches; no competing `/blog` route is necessary.

1. Keep theme `index.php` as the conventional native post-list template.
2. Add `scene.php` with metadata `@package index`. The description can be any text; it is the **package value** that matters. `var/Widget/Options/Reading.php:164` identifies custom homepage templates by parsed `title === 'index'`.
3. In the isolated admin Reading settings, select `scene.php` as the custom homepage (`frontPage=file:scene.php`), enable `frontArchive`, and choose an archive path that does not collide with existing pages, posts or plugin routes. The path is configurable; do not assume `/blog` is free.
4. Produce the blog link with `\Typecho\Router::url('archive', [], $this->options->index)`. Generate paginated links through native helpers/routes; never concatenate a guessed `/page/2`.
5. `var/Widget/Archive.php:577–595` returns early for the scene file and maps `archive` / `archive_page` to `indexHandle` when front archive is enabled. `:1524` filters the native index to posts. `var/Widget/Options/Reading.php:64–78` stores the configured archive and archive-page route patterns.

**Important lifecycle detail:** the `file:` branch returns before the later `functions.php` / `themeInit()` initialization (`Archive.php:671`). `scene.php` must explicitly `require_once __DIR__ . '/functions.php'` before calling theme helpers and must not call the ordinary shared header template if that template calls `$this->header()` without a separate scene branch. Do not rely on `themeInit()` to prepare scene data. Do not call `getTotal()` on this early-return scene archive; its normal `countSql` was not initialized.

This uses native routing without adding core routes, but selecting a collision-free archive path still requires fixture/runtime verification. Do not silently change production Reading settings. Theme switching resets a `file:` homepage to `recent` (`var/Widget/Themes/Edit.php:45`), which must be documented for install and rollback. Preserve/record prior reading options in the isolated environment.

### Minimal file-homepage head adapter

The following is a concrete thin-template proposal; coordinator runtime validation is required. Use it **only for the `file:` scene homepage**, retaining the normal `$this->header()` on posts, pages, search and native archives. No comments are rendered on this file homepage, so native comment-reply/anti-spam scripts are not required there.

```php
<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
require_once __DIR__ . '/functions.php';
$escape = static fn($v) => htmlspecialchars(
    (string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'
);
$options = $this->options;
?>
<title><?= $escape($options->title) ?></title>
<meta name="description" content="<?= $escape($options->description) ?>">
<link rel="canonical" href="<?= $escape($options->siteUrl) ?>">
<link rel="alternate" type="application/rss+xml" title="RSS 2.0"
      href="<?= $escape($options->feedUrl) ?>">
<link rel="alternate" type="application/rdf+xml" title="RSS 1.0"
      href="<?= $escape($options->feedRssUrl) ?>">
<link rel="alternate" type="application/atom+xml" title="Atom"
      href="<?= $escape($options->feedAtomUrl) ?>">
<?php
// Same public hook call as the end of Archive::header(), without reading its
// uninitialized private feed properties. Existing markup was already emitted.
$header = '';
\Widget\Archive::pluginHandle()->call('header', $header, $this);
?>
```

Place charset/viewport/module/import-map metadata around this as normal scene HTML. The native `$this->footer()` remains safe from the inspected source because it only invokes the footer hook. `beforeRender` and `afterRender` are still invoked by normal `Archive::render()`. This manual scene head does **not** reproduce `headerOptions`, social metadata or XML-RPC discovery, and some third-party header plugins may access the same incomplete archive properties. Record this compatibility limitation; do not claim all native/plugin header behavior is preserved. For the normal-page homepage route, prefer the complete native header instead.

Fallback alternative for evaluation: keep the native homepage index and show a conventional list for an explicit query switch. It avoids changing Reading settings, but pagination must preserve the switch and canonical semantics need care. It is not the recommended separate native blog-index route.

## Public summary filtering

`var/Widget/Contents/Post/Recent.php:27–54` selects native post metadata with `status=publish`, `created < options->time` and `type=post`. It deliberately omits body text, includes the password field internally, and does **not** exclude password-protected rows.

Consequences:

- Never serialize widget/raw database rows or password values.
- A dedicated theme-local widget extending the native contents base can narrow the native query to published, already released posts with empty/null password **before** applying the limit. Keep this PHP narrowly scoped to data retrieval, not UI logic. This avoids underfilling a ten-post list by filtering ten fetched rows after the query.
- For Phase 1 POC, `posts: []` is valid and preferable to pretending content integration exists. Later summaries must use `{id,title,url,publishedAt,excerpt}` only, with plain-text excerpt output and native permalink derivation.
- Do not use `hidden === false` alone to decide public exposure: authors, editors and visitors with the protection cookie can unlock protected posts. Always exclude any nonempty password for the shared public bootstrap policy.
- Native archives may include the logged-in author's private posts (`Archive.php:617–646`). Preserve Typecho's normal server-rendered behavior, but do not copy those rows into a public scene contract or shared cache.
- Native `Base/Contents.php:550–610` replaces protected titles/text and implements the password gate. Render individual bodies via `$this->content()`; never read the raw text field to bypass it. Native single routes can intentionally serve `hidden` status posts by direct URL; do not invent different permission logic.
- Public bootstrap filtering is deliberately stricter than what a logged-in SSR archive can display. Future scheduled content uses the native time reference, not browser time.

## Proposed bootstrap v1 and safe serialization

Integration contract to be finalized by the coordinator:

```js
{
  schemaVersion: 1,
  view: { kind: 'home', sceneEnabled: true },
  site: { title: '', description: '', url: '', language: 'zh-CN' },
  urls: { themeBase: '', home: '', blog: '', feed: '' },
  scene: {
    name: '', skin: '', languages: ['zh'], weather: null,
    dock: ['blog', 'about', 'phone'],
    mailbox: { endpoint: '', email: '', turnstileSitekey: '' },
    badge: true
  },
  posts: [],
  pagination: null
}
```

Allowed view kinds: `home`, `post`, `page`, `archive`, `search`, `notFound`. `themeBase` is absolute and ends in `/`. Use `$this->options->themeUrl` as a returned property, not the echo-style template method. Native `options->index` already accounts for rewrite mode (`var/Widget/Options.php:547`), and `options->themeUrl` accounts for theme placement (`:558`). Preserve native feed links.

Comments, tokens, email addresses, admin URLs, raw content fields, password values and private runtime configuration do not enter bootstrap. `pagination` is either null or `{currentPage,totalPages,previousUrl,nextUrl}`. Native `getCurrentPage()`, `getTotalPage()` and `pageNav()` should determine pagination, not browser guesses.

Minimal **illustrative**, unexecuted PHP serialization (not a complete theme):

```php
<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
require_once __DIR__ . '/functions.php';
// $bootstrap is assembled by a theme-local thin adapter using public fields only.
$json = json_encode(
    $bootstrap,
    JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
    | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
);
?>
<script id="homecraft-bootstrap" type="application/json"><?= $json ?></script>
```

Do not HTML-escape JSON inside this raw-text script element: HEX flags protect HTML boundaries while keeping the JSON parseable. Escape separate text/attribute outputs with `htmlspecialchars(..., ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')`; allowlist URL protocols independently. JavaScript uses `JSON.parse(element.textContent)`, validates the version/shape and assigns text with `textContent`. Preserve Typecho-rendered body HTML through normal server templates.

## Comments, settings and pages

- `usr/themes/default/comments.php` is the reference for `$this->comments()->to($comments)`, `listComments()`, `pageNav()`, `respondId()`, `cancelReply()`, `remember()` and `$this->allow('comment')`.
- Native forms use POST to `$this->commentUrl()` and native `author`, `mail`, `url`, `text` fields. Preserve configured required fields and stable form/respond IDs. `Archive.php:1448` supports native non-JS reply parameter handling.
- `Archive.php:1190` inserts native anti-spam token behavior from `header()`, and `Widget/Feedback.php:153–154` enables/protects it server-side. Do not clone comment forms into multiple panels or replace submission validation with browser code. No-JS comment capability when anti-spam is enabled requires explicit testing; basic no-JS reading is independent of comment submission.
- `Widget/Comments/Archive.php:96–113` implements approved comments plus the visitor's cookie-identified awaiting-approval comment. Preserve native widget visibility; do not export all comments to JSON.
- `usr/themes/default/functions.php:4` defines `themeConfig($form)` and `:66` demonstrates `themeFields($layout)`. `Widget/Themes/Config.php:31` requires administrator access; `:67` builds the native settings form.
- Add server-side form validation for finite enums, bounded post counts and URL protocols, with rendering-time defaults for old/invalid stored options. `themeConfigHandle()` overrides native persistence when declared (`Widget/Themes/Edit.php:86`); avoid it unless custom persistence is necessary, because declaring it transfers responsibility to theme code.
- About/guestbook targets should be selected published pages resolved by native URLs. `Contents/Page/Rows.php` excludes the configured front page and selects published pages; validate selected IDs and do not expose a stale/private target. Guestbook means optional native page comments, not the upstream email service.

## Traveller discovery metadata constraint

The frontend agent identified Homecraft traveller discovery fetching a site-root `homecraft.json`. A theme static JSON asset alone cannot satisfy a site-root URL in every install.

Source inspection confirms a `themeInit` exact-path responder can run after `error404Handle` because the 404 handler sets `hasPushed`, then theme initialization runs before the early return (`Archive.php:671–685`, `:1550–1574`). Such a responder must explicitly replace 404 with 200 and emit JSON with the correct content type. However, root static-file 404s may never reach PHP in non-rewrite server configurations, and a subdirectory site may not own the origin root at all. Treat this as an optional deployment-specific adaptation, **not** a general solution. Prefer documenting the POC limitation or a reviewed small configurable URL change in the upstream integration. Never rewrite every 404 into JSON.

## Required isolated validation before claiming support

1. Theme discovery; native file homepage; archive pattern and page 2; no colliding synthetic page slug.
2. Both rewrite modes and a subdirectory install; absolute assets, links, native search and comment actions.
3. Anonymous, author and editor requests against published, draft, private, hidden, scheduled and protected synthetic fixtures; inspect HTML and bootstrap separately.
4. JSON payloads containing `</script>`, quotes, Unicode and unsafe-looking titles; invalid settings and malformed URLs.
5. Native comments with required fields, anti-spam, reply/cancel, moderation, closed comments and no-JS reading.
6. Direct article/page URLs, native 404 statuses and plugin header/footer hooks.
7. Theme switch/rollback with recorded prior Reading options; production remains untouched.

No browser or application fixture checks were performed by this analysis task. The coordinator subsequently reproduced the file-homepage native-header fatal, which is incorporated above; successful operation of either corrected approach must be recorded separately. The test-environment agent owns runtime evidence. POC code snippets above are proposals, not executed or deployed code.

## Coordinator integration outcome
The POC ultimately uses `frontPage=page:<cid>` with `scene.php` registered using `@package custom`, preserving native header initialization. Public metadata routing remains a future cross-site feature; the current site's own title lookup no longer needs it because an exact-URL import-map adapter uses safe bootstrap data. See `INTEGRATION.md` and `PHASE1-REPORT.md` for actual browser results beyond this source analysis.

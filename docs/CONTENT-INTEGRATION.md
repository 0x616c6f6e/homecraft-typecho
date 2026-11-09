# Phase 3 Content Integration

## Public summaries
The scene receives the ten newest public post summaries through bootstrap v1. `inc/public-posts.php` is a small native Typecho content widget, not a separate API service. It filters before limiting:

- `type = post` and `status = publish`;
- publication time strictly before Typecho's current server time;
- password null or empty, regardless of visitor login or unlock cookies.

Native content filtering/rendering produces the plain excerpt, and native permalink generation supplies the URL. The adapter projects only `id`, `title`, `url`, `publishedAt` (UTC ISO-8601) and `excerpt`. It never serializes rows, passwords, user emails or raw bodies. Public summary selection is stricter than normal authenticated native archives, which may legitimately show an author's private posts.

The request-local summary cache is shared by header, scene and footer rendering. No cross-request/user cache is introduced. Ordinary Typecho publishing changes appear on the next uncached request without a theme rebuild. A just-published post may need the next server second because native selection uses a strict publication-time cutoff.

## JavaScript presentation and fallback
`js/content.js` renders the summary list using created DOM elements and `textContent`, never `innerHTML` from JSON. Dates use the interface locale and browser timezone. The engine can safely clone this already-generated markup into its dialog. Links remain ordinary native article URLs. The same list is server-rendered and escaped for no-JavaScript/failure fallback. No comment forms are cloned into scene cards.

The summary list has its own constrained scroll region so long titles and ten entries remain usable on phones. Empty sites retain a server-rendered empty state and the native blog link.

## Reading and native discovery
Thin templates preserve native article/page body rendering and password forms. Post metadata exposes date/month archive, author, category and tag links through native Typecho APIs. The reading header provides a native `s` search form and category navigation. Search input preserves native keywords; no client-side search implementation is introduced.

Lists use the existing native query order, result set and `pageNav()` output. Bootstrap `posts` remains empty on reading views, avoiding a second serialization of authenticated or protected content. `pagination` is populated only on list/search views using native totals/current page and links projected from `pageLink()` output; the adapter buffers the native helper and extracts its generated href. It does not access private routing state or guess paths. Empty results expose totalPages zero and null adjacent links. The JavaScript reading layer adds page-position text while leaving native links and server content intact.

## Development fixtures and tests
`dev/seed-content.php` creates idempotent synthetic fixtures inside the independent SQLite database only: thirteen public posts, twelve newer password-protected posts, draft/private/hidden/waiting/future cases, a published post scheduled in the future, public/protected categories, and a tag. It sets a five-post archive page size, makes the original demonstration post older, and marks prior native lifecycle-test posts private before another run. The script does not read the production database or delete real content.

```sh
./dev/run.sh exec -T typecho php /dev-tools/seed-content.php
./dev/run-subdirectory.sh exec -T typecho php /dev-tools/seed-content.php
HC_TEST_AUTH=1 ./dev/browser.sh tests/phase3.cjs query
```

The fixture command prints only synthetic IDs. `HC_TEST_AUTH=1` opts into mounting the generated synthetic development administrator password read-only in the disposable browser container. Tests use it for native login and a real draft → publish → private cycle; it is not included in reports, screenshots or Git. The normal browser wrapper does not mount this secret.

To test rewritten permalinks, change only the independent fixture databases:

```sh
./dev/run.sh exec -T typecho php /dev-tools/permalink-mode.php 1
./dev/run-subdirectory.sh exec -T typecho php /dev-tools/permalink-mode.php 1
HC_TEST_AUTH=1 ./dev/browser.sh tests/phase3.cjs rewritten
# Restore the default query-string test mode afterwards:
./dev/run.sh exec -T typecho php /dev-tools/permalink-mode.php 0
./dev/run-subdirectory.sh exec -T typecho php /dev-tools/permalink-mode.php 0
```

The isolated Apache configurations already route root/subdirectory requests; the mode helper changes only Typecho's rewrite option. It is not a production server configuration tool. Phase 1/2 smoke tests expect query-string mode; use the mode helper to restore it before running them. Their original demonstration post is opened through its fixture permalink so richer optional fixture lists do not change the tested article.

Full settings, configurable summary counts, guestbook mapping, comments and public cross-site portal metadata remain later phases. See the phase report for actual verification rather than inferring all product acceptance from this design.

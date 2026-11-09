# Phase 2: Theme Skeleton Verification

## Outcome and scope
The minimum proof of concept is now organized as a reusable Typecho theme skeleton (`0.0.2-dev`). JavaScript remains the primary frontend stack. PHP files are thin native templates/adapters; no Typecho core, upstream engine, world or vendor files were changed.

Completed Phase 2 work:
- Shared `header.php` / `footer.php` provide document metadata, bootstrap output, native hooks and a single JavaScript entry.
- Explicit `index.php`, `archive.php`, `post.php`, `page.php`, `404.php` and custom `scene.php` templates use small reusable list/single partials.
- Native public view metadata selects home/post/page/archive/search/notFound. Per-view titles are server-rendered. Native canonical/feed/header/footer behavior is preserved.
- `js/app.js` validates bootstrap v1 and dispatches to reading or scene modules. Reading pages do not import the engine; a module-local startup guard prevents repeated scene initialization.
- `js/bootstrap.js` validates version, view, URL protocols, required structures and public data shapes. `js/fallback.js` provides shared graceful fallback; reading navigation is progressively enhanced without an SPA router.
- The development environment now includes a second isolated Typecho installation served under `/journal/` with its own volume/network and loopback port.

This is skeleton delivery, not completion of Phase 3 content integration, Phase 4 settings or Phase 5 comments. Recent-post bootstrap entries remain empty. The conventional templates currently provide basic native content rendering only.

## Actual validation
Command: `./dev/browser.sh tests/phase2.cjs`.

| Check | Result |
| --- | --- |
| root: scene starts with native theme URLs and one renderer | Passed |
| root: shared post/page/list shell, canonical URL and scene-free reading | Passed |
| root: native 404 response and usable fallback template | Passed |
| root: bootstrap rejects unsupported versions, unsafe URLs and malformed data | Passed |
| subdirectory: scene starts with native theme URLs and one renderer | Passed |
| subdirectory: shared post/page/list shell, canonical URL and scene-free reading | Passed |
| subdirectory: native 404 response and usable fallback template | Passed |
| subdirectory: bootstrap rejects unsupported versions, unsafe URLs and malformed data | Passed |
| explicit plain mode skips engine JavaScript through shared app entry | Passed |
| subdirectory no-JavaScript navigation and server-rendered content | Passed |
| blocked engine module keeps shared fallback usable | Passed |
| invalid bootstrap fails safely before loading scene code | Passed |

Additional checks passed:
- PHP syntax on all 11 theme PHP files.
- `./dev/run.sh exec -T typecho php < tests/adapter.php`: script-breaking strings round-trip safely in JSON and escaped text; invalid UTF-8 fails explicitly.
- `bash -n dev/*.sh`.
- SHA-256 inventory: all 64 imported upstream files unchanged.
- `git diff --check`.
- Both isolated instances healthy. Screenshot of the 360-pixel subdirectory reading layout inspected.

Browser evidence: ignored `work/testenv/browser-results/phase2.json`, `phase2-root-scene.png`, `phase2-subdirectory-scene.png` and matching reading screenshots. Chromium uses software WebGL; the mobile viewport is emulated, not a physical phone.

## Compatibility issue found
Typecho's native front archive does not always initialize `archiveSlug`. Calling `is('archive', '404')` during view selection caused a typed-property error. The adapter now identifies the already-selected native `404.php` template through the public `getThemeFile()` method. No private-field mutation or core changes were used. Temporary debug mode in the isolated root instance was removed before final browser checks.

## Environment and operations
- Root: `http://127.0.0.1:18094/`, managed by `./dev/run.sh`.
- Subdirectory: `http://127.0.0.1:18095/journal/`, managed by `./dev/run-subdirectory.sh`.
- Both: Typecho 1.3.0 / PHP 8.2.30, the existing digest-pinned image, native `rewrite=0` permalink mode and independent SQLite data.
- The subdirectory instance uses an Apache Alias and prefix-aware rewrite target inside its disposable container. No files, routes, firewall rules or configuration on the live site were changed.

## Remaining verification
The skeleton acceptance for theme discovery/rendering and root/subdirectory asset paths is satisfied in the tested environment. Rewritten permalink mode, Firefox/WebKit, physical-device performance, plugin compatibility, complete archive/search/pagination semantics, protected/public-summary fixtures, theme settings and comments remain future checks. Do not infer full AC-01–AC-13 completion or production readiness from this report.

No commit, push or production activation was performed. Continue with Phase 3: native public article summaries, taxonomy/search/pagination data and their visibility tests.

This report records validation before the subsequent batched local commits. See `STATUS.md` for current commit organization; no remote push or production activation was added.

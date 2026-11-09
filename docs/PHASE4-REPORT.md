# Phase 4 Verification Report

## Scope and implementation
Version 0.0.4-dev adds native Typecho theme configuration and public native-page mappings. JavaScript remains the scene/presentation layer; PHP only projects normalized settings, public metadata, native forms and routes. No Typecho core, production service or upstream runtime files were modified. Changes are recorded in separate local implementation, test and documentation commits; no remote push was performed.

Native options cover display name/introduction, logo/favicon, 64×64 skin, Chinese/English interface, recent-post count, scene/reading homepage, social links and opt-in weather. About and guestbook destinations are native published unprotected pages; a guestbook also requires comments enabled. This phase links to that page and does not yet implement comment submission/replies.

Bootstrap v1 gains optional validated profile/pages projections. Import-map adapters preserve the upstream engine/world and omit the physical mailbox when no valid guestbook is selected. Skin validation runs only in the browser with dimension/CORS checks and timeout fallback. Native validation rejects invalid settings atomically, and normalized rendering tolerates corrupt stored values. See SETTINGS.md and INTEGRATION.md.

## Environment
Isolated Typecho 1.3.0 / PHP 8.2.30, existing pinned development images and SQLite fixtures. Root is http://127.0.0.1:18094/ and subdirectory is http://127.0.0.1:18095/journal/. Browser testing uses Chromium/SwiftShader, desktop and emulated mobile viewports. Native administrative tests read an opt-in read-only development secret mount; no password is included in source or reports.

## Verified checks
- Phase 4 query-string and rewritten modes: 18 passed in each mode (36 total; nine per root/subdirectory per mode).
- Native settings discover only eligible pages; invalid count/URL/page/weather submissions are rejected without partially saving, and anonymous submissions cannot change settings.
- Recent count boundaries 1/20, configured plain text/branding/social links, English scene labels and native destination URLs work.
- Valid skin reaches the scene; wrong dimensions and missing images return the default. Aborted weather requests do not prevent startup.
- Reading mode uses the native archive without engine assets. Hiding/deleting a page or closing guestbook comments removes stale public entries.
- Phase 1 regression: seven passed, including desktop/mobile startup, direct reading, no-JavaScript and failure/plain fallback.
- Phase 2 regression: 12 passed at root/subdirectory, including shared templates, 404, invalid bootstrap and fallback.
- Phase 3 query-mode regression: 19 passed, including public filtering, taxonomy/search pagination, password gate and native publishing lifecycle.
- Settings normalization and adapter output-boundary PHP checks passed. All 16 theme PHP files and the new fixture passed PHP syntax checks. Development shell syntax, diff whitespace and all 64 unchanged upstream SHA-256 entries passed.

Commands: `HC_TEST_AUTH=1 ./dev/browser.sh tests/phase4.cjs` and `HC_TEST_AUTH=1 ./dev/browser.sh tests/phase4.cjs rewritten` (after switching both isolated sites), `./dev/browser.sh tests/phase1.cjs`, `./dev/browser.sh tests/phase2.cjs`, `HC_TEST_AUTH=1 ./dev/browser.sh tests/phase3.cjs query`, and the PHP checks in TEST-ENVIRONMENT.md. Browser JSON and screenshots are ignored under work/testenv/browser-results; phase4-root-scene.png and phase4-subdirectory-scene.png capture the configured guestbook. The root screenshot was inspected. Original theme options were restored by each suite, and both sites were restored to query-string permalinks after verification. Total browser checks in this pass: 74 (36 settings + 38 regressions).

## Limitations
The reading fallback with native front archive disabled has not received a dedicated browser case. Comment submission/moderation/replies, cross-site portal metadata, Firefox/WebKit, physical mobile devices, plugin/version compatibility, release packaging and cache/upgrade behavior remain unverified. Software-rendered browser startup is functional evidence, not a hardware performance claim; observed frame times exceed the target budget. Skin MIME/byte size is not enforced. Interface language does not translate article bodies or native administration. This is a development theme, not a production release.

# Project Status

## Current state
- Repository: `/home/ubuntu/homecraft-typecho`.
- Initial documentation commit: `e2dec7a`, previously pushed to `origin/master`.
- Requirements, upstream runtime, development environments, theme skeleton and validation reports are recorded in separate local commits.
- Three parallel analysis tracks completed: `FRONTEND-ANALYSIS.md`, `TYPECHO-ANALYSIS.md`, `TEST-ENVIRONMENT.md`.
- Imported 64 upstream starter/runtime files unchanged at `df8033aab87569d2779e1c2f74564183527282f7`; licenses and a SHA-256 inventory are retained.
- Phase 2 theme skeleton (`0.0.2-dev`) now includes shared header/footer, explicit content/404 templates, validated bootstrap and a JavaScript entry that separates scene and reading modules.
- Root development URL: `http://127.0.0.1:18094/`; subdirectory URL: `http://127.0.0.1:18095/journal/`. Both are loopback-only isolated instances with separate data volumes.
- Changes are committed locally in reviewable batches. No production changes or remote pushes were made for this phase. This is not a release-ready theme.

## Confirmed architecture and POC choices
- JavaScript owns scene integration and frontend interaction; PHP is a thin Typecho adapter.
- Bootstrap v1 is defined in `INTEGRATION.md`; comments and sensitive data stay out of serialized configuration.
- Starter island is selected for this POC; final scene design remains undecided.
- Use a native page with custom `scene.php` template as the homepage plus native front archive. The earlier direct-file homepage approach failed real header initialization checks and was rejected.
- Reading routes render without downloading the scene. POC settings are fixed defaults and bootstrap posts are empty; content/settings integration follows later.

## Verified environment and checks
- Typecho 1.3.0 / PHP 8.2.30; development image and Playwright image pinned by digest.
- Isolated SQLite and synthetic fixtures, no production credentials/data mounted.
- Phase 1 `./dev/browser.sh tests/phase1.cjs`: seven checks passed for desktop/mobile startup and native reading, no-JavaScript fallback, blocked-module fallback and explicit plain mode.
- Phase 2 `./dev/browser.sh tests/phase2.cjs`: 12 checks passed, including root/subdirectory scene/reading/404, malformed contracts, blocked modules and no-JavaScript fallback.
- All 11 theme PHP files, shell scripts, PHP output-boundary tests, unchanged upstream inventory and diff whitespace passed.
- See `PHASE1-REPORT.md` and `PHASE2-REPORT.md` for results, compatibility findings and exact untested scope.

## Outstanding decisions and blockers
- The initial site-root metadata 404/timeout is resolved for local startup through a shared JavaScript traveller adapter. Final scene tests have no HTTP/request failures. A public metadata endpoint and cross-site portal behavior remain later integration work.
- Final scene preset, configurable guestbook behavior, supported version/plugin matrix and full content integration remain to be implemented or confirmed.
- Comments, theme settings, public-summary visibility tests, rewritten permalink mode, Firefox/WebKit and physical-device performance remain unverified. Root/subdirectory paths are validated in query-string mode.

## Next step
Continue Phase 3 with native public article summaries, taxonomy/search/pagination data and visibility tests under new implementation scope. Plan public metadata routing before cross-site portal support. Keep work confined to the isolated test instance until production activation is explicitly requested.

## Commit organization
- `00e47b0`: migration requirements, shared AI rules and integration analysis.
- `ef6739c`: pinned upstream runtime and license/inventory records.
- `ab5d8d9`: isolated root/subdirectory development environments.
- `b34e77a`: JavaScript-first theme skeleton and behavior/security tests.
- The documentation commit containing this status records migration progress and Phase 1/2 validation reports.

Commit-time verification checked each staged diff and confirmed that ignored runtime data and local secrets are not tracked. One extra trailing blank line in `theme/js/scene.js` was removed; no application behavior changed after the recorded Phase 2 checks.

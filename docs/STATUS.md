# Project Status

## Current state
- Repository: `/home/ubuntu/homecraft-typecho`.
- Initial documentation commit: `e2dec7a`, previously pushed to `origin/master`.
- Requirements, upstream runtime, development environments, theme skeleton and validation reports are recorded in separate local commits.
- Three parallel analysis tracks completed: `FRONTEND-ANALYSIS.md`, `TYPECHO-ANALYSIS.md`, `TEST-ENVIRONMENT.md`.
- Imported 64 upstream starter/runtime files unchanged at `df8033aab87569d2779e1c2f74564183527282f7`; licenses and a SHA-256 inventory are retained.
- Phase 3 (`0.0.3-dev`) adds public post summaries, JavaScript content enhancement, native post metadata and taxonomy/search/pagination integration. Phase 3 is recorded in separate local implementation, test and documentation commits.
- Phase 4 (`0.0.4-dev`) adds native validated theme settings, identity/language/weather/skin configuration, reading-mode selection and public about/guestbook mappings. Phase 4 is recorded in local implementation, test and documentation commits. See `SETTINGS.md` and `PHASE4-REPORT.md`.
- Phase 5 (`0.0.5-dev`) implements responsive reading, native comments/replies, moderation states and a paginated native reply-link compatibility adapter. Phase 5 is recorded in separate local implementation, test and documentation commits. See `READING-COMMENTS.md` and `PHASE5-REPORT.md`.
- Phase 6 (`0.0.6-dev`) adds deterministic development packaging, content-addressed assets, HTML/static cache boundaries and a disposable native lifecycle matrix. Phase 6 is recorded in separate local runtime, build, test and documentation commits. See `INSTALLATION.md` and `PHASE6-REPORT.md`; full production release acceptance is still incomplete.
- Village scenery (`0.0.7-dev`) adds an enterable cottage, library and watchtower with connected paths through a separate `@world/build.js` adapter. The source starter/engine remain unchanged. This scenery pass is recorded in local commits. See `BUILDINGS.md`.
- Source show-home (`0.0.8-dev`) is now the default, following the explicit request to reproduce the reference architecture. The prior village and starter remain native settings choices. The imported example is pinned and attributed; this scene work is recorded in local commits. See `SHOW-HOME.md`.
- Root development URL: `http://127.0.0.1:18094/`; subdirectory URL: `http://127.0.0.1:18095/journal/`. Both are loopback-only isolated instances with separate data volumes.
- Phase 1/2 were committed in reviewable batches. Phase 3 is committed locally in batches; no production changes or remote pushes were made. This is not a release-ready theme.

## Confirmed architecture and POC choices
- JavaScript owns scene integration and frontend interaction; PHP is a thin Typecho adapter.
- Bootstrap v1 is defined in `INTEGRATION.md`; comments and sensitive data stay out of serialized configuration.
- The starter island was the POC baseline. The requested source show-home is now the default; village and starter presets remain available.
- Use a native page with custom `scene.php` template as the homepage plus native front archive. The earlier direct-file homepage approach failed real header initialization checks and was rejected.
- Reading routes render without downloading the scene. Scene bootstrap contains configurable strictly public summaries (1–20, default 10); reading bootstrap keeps posts empty. List/search pagination projects native totals and adjacent links. Settings now come from normalized native theme options.

## Verified environment and checks
- Typecho 1.3.0 / PHP 8.2.30; development image and Playwright image pinned by digest.
- Isolated SQLite and synthetic fixtures, no production credentials/data mounted.
- Phase 1 `./dev/browser.sh tests/phase1.cjs`: seven checks passed for desktop/mobile startup and native reading, no-JavaScript fallback, blocked-module fallback and explicit plain mode.
- Phase 2 `./dev/browser.sh tests/phase2.cjs`: 12 checks passed, including root/subdirectory scene/reading/404, malformed contracts, blocked modules and no-JavaScript fallback.
- All 11 theme PHP files, shell scripts, PHP output-boundary tests, unchanged upstream inventory and diff whitespace passed.
- Phase 3 query/rewritten suites: 19 cases each passed at both root and subdirectory sites (38 checks). Phase 1/2 regressions also passed again (19 checks).
- All thirteen theme PHP files, fixture helpers, output-boundary tests and unchanged-runtime inventory passed.
- Phase 4 native settings suites passed 18 cases in query mode and 18 in rewritten mode at root/subdirectory. Phase 1/2 and Phase 3 query regressions passed 38 cases, for 74 browser checks in this pass. Settings normalization, output boundaries, all 16 theme PHP syntax checks, shell syntax and 64 unchanged upstream file hashes passed. Original theme options and query-string permalink mode were restored.
- Phase 5 native reading/comment suites passed 20 cases per permalink mode (40 total), with root/subdirectory and 360-pixel mobile coverage. All 18 theme PHP files, fixture syntax, settings/output-boundary tests, shell syntax and 64 upstream hashes passed. Phase 2 skeleton and Phase 3 query-mode content regressions passed 31 more checks, totaling 71 browser checks. Comment options and query-string permalink mode were restored.
- Phase 6 passed four packaging verification groups and ten complete packaged lifecycle checks (root/query plus subdirectory/rewritten), plus 20 Phase 5 query-mode comment regressions after the cache-header change. All 19 PHP files, settings/adapter checks, shell syntax and diff whitespace passed. The final detached runner exited zero and removed its two temporary containers, volumes and network. A development ZIP/checksum is available under ignored `dist/`; source changes are committed locally in focused batches.
- Village scenery checks passed in desktop/root and mobile-sized/subdirectory Chromium: all three building entrances, native wall collisions, spawn-to-interior paths, roof standing surfaces and blog-panel links work. Samples used 17 calls / 14,584 triangles / zero point lights. All 64 upstream hashes remain unchanged; 0.0.7-dev ZIP integrity and static checksums passed. See `BUILDINGS.md`.
- Source show-home verification passed desktop/root and mobile-sized/subdirectory Chromium with real F events at nine stations each (18 interactions), plus native preset save/reject/restore checks. Main runtime hashes remain unchanged. Geometry/light budgets pass, but software frame time is above target; the lighter village remains available. See `SHOW-HOME.md`.
- See `PHASE6-REPORT.md`, `PHASE5-REPORT.md`, `PHASE4-REPORT.md`, `PHASE1-REPORT.md`, `PHASE2-REPORT.md` and `PHASE3-REPORT.md` for results and exact untested scope.

## Outstanding decisions and blockers
- The initial site-root metadata 404/timeout is resolved for local startup through a shared JavaScript traveller adapter. Final scene tests have no HTTP/request failures. A public metadata endpoint and cross-site portal behavior remain later integration work.
- The source show-home is the selected default. Supported version/plugin matrix and release compatibility remain to be implemented or confirmed. Guestbook now means a mapped native page with comments enabled.
- Firefox/WebKit and physical-device performance remain unverified. Phase 5 covers native submission, replies, moderation and closure in the isolated browser matrix. Theme settings are covered by Phase 4 native administration/browser checks. Root/subdirectory paths, native content visibility and both permalink modes are now validated. Both test instances have been restored to query-string mode.

## Next step
Complete remaining release acceptance under new implementation scope: Firefox/WebKit/physical-device checks, measured transfer/performance budgets, target reverse-proxy/OPcache validation and supported plugin/version matrix. Plan public metadata routing before cross-site portal support. Keep work confined to the isolated test instance until production activation is explicitly requested.

## Commit organization
- `00e47b0`: migration requirements, shared AI rules and integration analysis.
- `ef6739c`: pinned upstream runtime and license/inventory records.
- `ab5d8d9`: isolated root/subdirectory development environments.
- `b34e77a`: JavaScript-first theme skeleton and behavior/security tests.
- The documentation commit containing this status records migration progress and Phase 1/2 validation reports.

Commit-time verification checked each staged diff and confirmed that ignored runtime data and local secrets are not tracked. One extra trailing blank line in `theme/js/scene.js` was removed; no application behavior changed after the recorded Phase 2 checks.

## Phase 3 commits
- `cdb5bf7`: public summaries, native content discovery and JavaScript presentation.
- `5d3c5db`: synthetic fixtures, native authoring/visibility tests and permalink-mode coverage.
- The documentation commit containing this section records Phase 3 integration decisions and verification results.

No application behavior changed during this commit pass. Each staged diff passed whitespace checks; ignored runtime data and local secrets remain untracked. No remote push was requested or performed.

## Phase 4 commits
- `c4acb64`: native settings, normalized public configuration and scene/page mappings.
- `20f7eb8`: settings fixtures, native validation and page lifecycle browser coverage.
- The documentation commit containing this section records Phase 4 administration guidance and the 74-check verification report.

Each staged batch passed whitespace checks. No application behavior changed during this commit pass; the previously recorded browser results remain applicable. Runtime data and local secrets remain ignored and untracked. No remote push or production modification was performed.

## Phase 5 commits
- `707fa58`: responsive reading enhancements and native comment/reply rendering.
- `09f45bf`: isolated reading fixtures and native feedback tests across permalink modes.
- The documentation commit containing this section records Phase 5 integration behavior and the 71-check verification report.

Each staged batch passed whitespace checks. The final saved browser reports were checked again: 20 query-mode comment checks, 20 rewritten-mode comment checks, 12 skeleton regressions and 19 query-mode content regressions passed. No application behavior changed during this commit pass. Runtime data and local secrets remain untracked. No remote push or production changes were performed.

## Phase 6 commits
- `c34dad1`: content-addressed runtime assets and private/no-store HTML.
- `5120398`: deterministic package builder, asset retention and installation guide.
- `c84f450`: isolated package/lifecycle environment, integrity checks and native upgrade/rollback tests.
- The documentation commit containing this section records Phase 6 architecture, results and remaining acceptance work.

Each staged batch passed whitespace checks. The saved final reports were checked again: ten lifecycle checks, 20 comment regressions and four packaging groups passed; the development ZIP checksum still matches. No runtime, bundled installation guide or archive bytes changed during this commit pass. Ignored runtime data, credentials and ZIP artifacts remain untracked. No remote push or production modification was performed.

## Village and show-home commits
- `6dcfc71`: voxel village buildings, paths and roof standing surfaces.
- `5d39bcb`: the unchanged pinned upstream example and baseline provenance inventory.
- `bba61ee`: selectable show-home scene, neutralized decorative identity and native F-key stations.
- `a0049e3`: building/F-key/preset tests, current-version package fixture and bundled scenery guides.
- The documentation commit containing this section records integration, settings, provenance and the final handoff.

Saved reports were checked again: village root/mobile scenarios passed; show-home scenarios passed 18 real F-key interactions; native preset save/reject/restore checks passed. All 64 original runtime hashes and 12 adapted example hashes match their inventories. The 0.0.8-dev ZIP checksum and CRC match. The original vendor import retains paint.js's upstream extra trailing blank line; other staged diffs passed whitespace checks. No runtime or archive bytes changed during this commit pass; guide commit-state wording was updated. Credentials, runtime data and ZIP outputs remain untracked. No production change or remote push was performed.

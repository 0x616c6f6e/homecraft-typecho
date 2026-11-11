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
- Pool exit fix (`0.0.9-dev`) moves the native ladder landing clear of its navigation footprint. One engine modification is recorded separately in `UPSTREAM-PATCHES.json`; the original inventory/engine manifest remain intact. This fix is recorded in local commits and was deployed to the user-specified theme directory on 2026-11-10; see the deployment record below.
- In-scene article browser (`0.0.10-dev`) implements the user's explicitly requested native-page reader with navigation controls, real Typecho forms and render/lifecycle handling. This work and the subsequent stability mitigations are recorded in local commits; see SCENE-BROWSER.md and the verification/deployment records below.
- Browser stability mitigation (`0.0.11-dev`) reduces pixel/shadow budgets, caps the single loop at 30 Hz, pauses scene calculations during embedded reading and exposes native reading after running-page WebGL context loss. Three recorded engine patches now have enforced hashes. Browser-process exit root cause remains unconfirmed.
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

## Administration diagnostic (2026-11-10)
- Read-only inspection of the reported production blank page found HTTP 200 editor responses with nonempty bodies; the filtered recent container log contained no PHP fatal errors. This does not prove that the returned page renders correctly.
- The active Handsome companion plugin (9.2.1, origin editor) still owns both native rich-editor hooks. Its source resolves OwO assets relative to the active theme, producing missing Homecraft paths. This is a confirmed integration problem, not yet proof of the reported whole-page blank screen's complete cause. No production plugin, file or setting was changed.
- `HC_TEST_AUTH=1 ./dev/browser.sh work/testenv/admin-readonly.cjs` passed four isolated checks: native page/post editors at root and subdirectory, visible title/body/publish controls, native scene-template choice, no JavaScript exceptions or HTTP errors. Content writes were blocked after test login. The diagnostic script/report remain ignored under `work/`.
- Authenticated production DOM/console inspection remains unavailable: the current tools report no connected document session for the user's in-app browser. An unauthenticated request reaches the normal login page and cannot validate the logged-in editor.

## Pool-ladder fix (2026-11-10)
- Reproduced the supplied screenshot's trap with real show-home navigation: the old ladder landing at z=23.1 fails `nav.canStand()`, so pressing toward the edge leaves the player swimming at z=24.62. The ladder obstacle is rounded outward to 25 cm cells and the body radius overlaps it.
- Moved only the ladder landing to z=22.8 (1.2 m onto the deck instead of 0.9 m). Native swimming, climb animation, collision checks and geometry remain in use. The one modified runtime module has an explicit original/local digest record, and packaging rejects both unrecorded runtime edits and edits to the recorded patch.
- `./dev/browser.sh tests/pool.cjs` passed 20 checks across root/desktop and subdirectory/mobile-sized Chromium: normal coping, three ladder approaches, west/east sides, deck destination from surface/bottom, sea-edge blocking/retreat and a real W key through the native input reader. Physics is advanced at fixed timesteps on native players using the rendered world's grid/nav/ground; this does not claim a physical touchscreen test or real-time traversal speed. Real-avatar ladder-climb screenshots were inspected.
- New pool-facing view samples: desktop 65 calls / 64,792 triangles / two lights; mobile-sized 53 calls / 60,194 triangles / two lights. Desktop draw calls exceed the 60-call target, and software frame times remain above the frame-time target. No geometry or rendering cost is added by the landing fix; performance acceptance remains incomplete.
- `python3 tests/package.py` passed deterministic ZIP/CRC/license/static-hash checks, retained-graph upgrade/rollback checks and negative input checks including a modified player patch. All 63 other runtime hashes, 12 adapted example hashes, the player patch digest, PHP index syntax and diff whitespace passed. The distributable is `0.0.9-dev`.
- `./dev/browser.sh tests/pool.cjs --baseline` restored the original landing value through a browser-only response override: it reproduced the rejected ladder exit, then verified the temporary workaround of swimming left before approaching the normal north edge. The isolated source/deployed files were not reverted for this comparison.
- No production files/settings, remote Git state or content were changed. The prior administration diagnostic documentation edits are included in this documentation batch.

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

## Pool fix commits
- `3fae298`: corrected pool-ladder landing, version 0.0.9-dev and explicit engine-patch hash enforcement in the package builder.
- `3b588af`: native pool movement/input regression coverage, original-failure control and recorded-patch packaging checks.
- This documentation commit records the fix, verification, remaining performance limitations and the Handsome editor migration diagnostic.

Commit-time verification rechecked the saved 20 pool checks, original-failure control and four packaging groups; all runtime/example hashes and the final ZIP CRC/static hashes/checksum passed. Staged diffs passed whitespace checks; credentials, runtime data and ZIPs remain untracked. No runtime or archive bytes changed during this commit pass. The previously supplied ZIP retains its build-time documentation; this commit only updates the source guides' commit-state wording. No production modification or remote push was performed.

## Authorized theme deployment (2026-11-10)
The user explicitly requested placement of the modified theme at `/opt/1panel/docker/compose/typecho/typecho/usr/themes/homecraft-typecho`. The existing 0.0.8-dev package matched its original archive and all 93 static checksums; no additional local adapter changes were found.

- At 17:49 CST (09:49 UTC), staged the verified 0.0.9-dev archive and retained every previous immutable static asset. The deployed manifest contains 186 static files across the old and new asset graphs. An atomic Linux directory exchange replaced the active theme without an absent-path interval; directory ownership/read permissions were preserved.
- Verified complete pre-deployment theme backup: `/opt/1panel/docker/compose/typecho/theme-backups/homecraft-typecho-20261110T094926Z/before.tar.gz`. The prior directory is also retained at `previous-theme` within that backup directory, outside the public site tree. No credentials, content/database backups or production settings were copied into the repository.
- PHP index syntax and Apache configuration checks passed. Performed a graceful Apache/PHP worker reload to clear path/opcode caches. No container restart, database/settings edit, plugin change or remote Git push was performed.
- Public HTTPS checks returned 200 for the scene homepage, release manifest, patched player and retained original player. Fresh homepage bootstrap selects asset graph `abf2ac026ef92a032ce1af97842fd748fd7c8edd3e7b846c0fddf75ab161bce4`; the served player SHA-256 matches the recorded fix. Release version is 0.0.9-dev and homepage cache policy remains `private, no-store`. The configured blog URL also returned 200; no Reading settings were changed.
- This deployment was verified through public HTTP/resource checks; the earlier 20 movement checks remain isolated browser evidence, not an authenticated production-browser traversal. Deployment receipts stay ignored under `work/testenv/`. The supplied archive remains unchanged (SHA-256 `1b87a8f5c0bb8f8e3b1b1caa36f75e8282f9c29c9d3823a09d7249fe643022d0`); its build-time documentation predates this deployment record.

## Native article archive correction (2026-11-10)
The user reported that the “All posts” button only refreshed the scene. Public bootstrap confirmed that both the home/blog URLs pointed to the site root. Read-only configuration inspection found `frontPage=page:3`, `frontArchive=0`, `rewrite=0`, and already-defined native `/blog/` plus `/blog/page/[page:digital]/` archive routes. No existing content used the `blog` slug.

- At 17:59 CST (09:59 UTC), backed up the relevant Reading values outside the public tree at `/opt/1panel/docker/compose/typecho/theme-backups/homecraft-reading-20261110T095913Z/options-before.json`. Enabled only `frontArchive` using Typecho's native `Utils\Helper::setOption()` maintenance API. Homepage selection, route patterns, permalink mode, theme files and content remain unchanged.
- The fresh public scene bootstrap now points blog links to `https://0x616c6f6e.icu/index.php/blog/`. That URL returns HTTP 200, native archive mode, a public post list and no scene import map. A direct public article also returns HTTP 200 in post mode; the site root remains the 3D homepage.
- `./dev/browser.sh work/testenv/archive-production-browser.cjs` passed two anonymous production Chromium checks with JavaScript disabled: clicking the actual server-rendered “All posts” button and clicking the top direct-reading link both reach the native reading archive. This checks navigation independently of the heavy scene; it does not claim a new 3D modal traversal. Reports remain ignored under `work/testenv/`.
- No theme rebuild/version change, service reload, content/plugin mutation or Git commit/push was needed. The source installation guide now documents this missing-archive configuration case.

## In-scene article browser verification (2026-11-10)
- Added JavaScript-only integration around the native scene modal/embed. Summary/article-list card links and a new top launcher open actual native reading pages in a compact window with Back, Forward, Reload, All posts and current-URL/new-tab controls. The top direct-reading link and ordinary fallback links remain normal page navigation.
- Native modal guards clear input/cancel movement; a wrapper around the existing WebGL renderer skips main and offscreen-TV drawing while the reader is active, without per-frame allocation or another loop/context. Closing removes the frame/listeners/timer/history and restores focus/drawing. A Home link closes the frame instead of nesting another scene. Page-hide cleanup also resets the rendering guard.
- No PHP endpoint/schema, custom content renderer or authorization/comment implementation was added. Native forms remain in their original document. Native form error documents stay visible, and Back uses native iframe history to restore editable fields. Safe entry checks exclude foreign-origin, credentialed, script, admin/action and upload URLs; external web links leave through a new tab. Same-origin document scripts retain the site's existing trust boundary.
- `./dev/browser.sh tests/scene-browser.cjs query` passed 26 checks across root/desktop and subdirectory/mobile-sized Chromium. The rewritten run passed 28, including explicit plain/blocked-engine fallbacks (54 total). Verified native articles, lists/history/reload, pagination/search, real keyboard input, suspended/resumed renderer frame counts, comment validation-error recovery and submission, password gate/unlock, child Escape/focus, disposal/reopen/station/Home behavior, URL guards, failed-frame escape, responsive dimensions and no-JavaScript full-page navigation. Native protected-page 403 and deliberately invalid-comment 500 responses were expected; no other HTTP/page errors or iframe engine downloads were recorded.
- Both isolated test instances were restored to query-string permalink mode. Desktop/mobile screenshots were inspected, with a final CSS adjustment hiding scene HUD/navigation/portal controls behind the reader to avoid compact-screen header overlap. Physical touch and Firefox/WebKit remain unverified; no new source-house performance compliance claim is made.
- All original/example inventory entries still match, except the previously recorded pool-player patch. The engine-generated manifest is untouched. Packaging checks cover deterministic ZIP/CRC/licenses/hashes, retained graph upgrade/rollback and rejection of unexpected runtime/private inputs. No Git commit or remote push is part of this feature request.

## In-scene browser deployment (2026-11-10)
- Continuing the user's instruction to place modified themes in the production theme directory, deployed 0.0.10-dev there at 18:29 CST (10:29 UTC) through the verified staged-directory/atomic-exchange procedure. Complete prior-theme backup and directory: `/opt/1panel/docker/compose/typecho/theme-backups/homecraft-typecho-20261110T102932Z/` (`before.tar.gz` and `previous-theme`).
- The active graph is `4e6a37a190544da2c58320960be1002de206484194e51f6a111feab44e6d2de0`. All 280 deployed static files were hash-verified, including both retained old graphs. PHP index syntax and Apache configuration checks passed, followed by a graceful worker reload. Public homepage/new reader assets return 200 with matching hashes; the configured blog URL remains `/index.php/blog/`.
- `./dev/browser.sh work/testenv/scene-browser-production.cjs` passed four anonymous read-only checks: desktop native article embedding and renderer suspension, child Escape/frame disposal/render resumption, mobile-sized launcher/list with no header overlap, and simulated page-hide cleanup without leaving rendering suspended. Desktop/mobile production screenshots were inspected. These checks did not submit production forms or use administrator credentials; native form submission/error/password checks above used only synthetic isolated data. No page exceptions or same-site HTTP errors were recorded.
- Production content, homepage/archive options and plugins were not changed by this feature deployment; only theme files were replaced. Source/deployment receipts and browser reports stay ignored under `work/testenv/`. No Git commit or remote push was made.
- Final development archive: `dist/homecraft-typecho-0.0.10-dev.zip`, SHA-256 `921f2956c25605b5010979cdcf0c7d002e888528cd20db95739e0d7fbf417368`. The archive's single current graph is complete; the deployed directory additionally retains older graphs for open visits. This status-only deployment record does not change the archive bytes.

## Intermittent browser-exit investigation and mitigation (2026-11-10)
The user reported occasional whole-browser exits without an error code, in both the desktop app's browser and standalone Chrome/Edge. This is distinct from an iframe closing or a PHP error. Production Typecho had no OOM-kill flag or restarts when inspected; that does not prove client health. No connected document-control session or user-computer crash log was available. The cause remains unconfirmed.

- An isolated Chromium/SwiftShader baseline before changes opened/closed the reader 30 times without a page crash, context loss or page exception. Eight post-GC samples showed used JS heap 15,124,760 to 15,895,712 bytes; textures stayed 24, geometries 81 and programs 64. After initial reader setup, DOM/listener counts stayed at 587 nodes / 124 listeners (two document objects), with zero mounted iframes after closing. This limited test found no accumulating reader resources; it cannot exclude native/GPU memory pressure or reproduce the user's hardware/driver. The opening camera sample was 76 draw calls, above the 60-call target.
- Confirmed gaps: the native loop kept updating world/TV/minimap/weather during article reading; normal scene work had no frame-rate ceiling; a running-page WebGL context loss had no native reading recovery. Version 0.0.11-dev addresses these with recorded main/stage patches. Default DPR is at most 1, drawing pixels at most 1.5 million desktop / 0.8 million mobile, shadow sides 1024 / 512, and one scene loop at at most 30 Hz. Reader display skips scene calculations as well as GPU drawing. A context-loss event stops that loop, closes/disposes the frame/renderer and exposes native reading links, without automatic renderer recreation.
- `./dev/browser.sh tests/scene-stability.cjs` passed eight checks at root/2560x1440 DPR 2 and subdirectory/390x844 touch-enabled DPR 2: reduced drawing/shadow budgets; at most 31 updates over one second of simulated 144 Hz callbacks; five reader cycles per installation with no movement updates or GPU frames while reading and successful resumption/disposal; and actual WEBGL_lose_context recovery to a working native article archive. No page exceptions or page-process crashes occurred. The simulated clock tests the limiter, not physical display FPS; synthetic context loss tests recovery, not a cure for a killed browser process.
- `python3 tests/package.py` passed all four packaging groups after the change. All three recorded engine hashes, 61 unchanged original modules and 12 unchanged adapted example modules are enforced. The index PHP syntax and whitespace checks passed. The query-mode native reader regression passed 28 checks (including explicit plain/blocked-engine cases), bringing this change to 36 isolated browser checks. Both existing test installations remain in query-string permalink mode. No Git commit or remote push was requested.

## Stability mitigation deployment (2026-11-10)
- Continuing the authorized theme-directory updates, deployed 0.0.11-dev at 18:54 CST (10:54 UTC) with a verified full backup and atomic directory exchange. Backup: `/opt/1panel/docker/compose/typecho/theme-backups/homecraft-typecho-20261110T105415Z/` (`before.tar.gz`, `previous-theme`, `deployment.json`). The prior theme matched the 0.0.10 archive before replacement.
- PHP index syntax and Apache configuration checks passed; the worker reload was graceful. All 374 static files, including three retained older graphs, match their manifest hashes. The fresh public homepage returns 200 and selects graph `c3be4ea1acdcf40797a6189be36255632bc55bfdbc0ea4386a3f60e7218ede6f`. No production content, native options, plugins or other services were changed; no Git commit or push was made.
- Development archive: `dist/homecraft-typecho-0.0.11-dev.zip`, SHA-256 `74ef884b9c812a8b6fb93e73da64338fbe168fe4943f4a277a317fff785109d6`. This is a workload/recovery mitigation; browser-process exit root cause and physical-device stability remain unverified. Anonymous read-only production Chromium checks passed eight more cases at 2560x1440 and 390x844, both at the public root installation (the reused test labels the second viewport mobile-subdirectory, but its explicit URL was replaced with the production root). Verified actual reduced rendering/shadow budgets, the simulated high-refresh limiter, five native reader open/close cycles per viewport with CPU/GPU suspension/resumption, and real WebGL context-loss recovery to the public native archive. No production forms or administrator credentials were used; no page exceptions or page-process crashes occurred in this run. These 44 isolated/public browser checks validate the mitigation behavior, not resolution of the user's intermittent browser-process exit.

## Article reader and stability commits (2026-11-11)
- `e49a10e`: native in-scene article browser, navigation/lifecycle integration, rendering workload safeguards, graphics-loss fallback and recorded patch hashes; the reader guide is bundled in packages.
- `6de69d3`: native article/search/comment/password/reader lifecycle tests and rendering-budget/context-loss recovery tests.
- The documentation commit containing this section records the authorized archive correction, deployment receipts, requirements and verification evidence.

Commit-time verification rechecked the saved final reports: 28 query-mode reader checks, eight isolated stability checks and eight anonymous public checks (44 total), plus successful packaging-check exit status. All 64 original/recorded runtime hashes, 12 adapted show-home hashes and the 0.0.11 archive checksum/CRC/static hashes match. Each staged batch passed whitespace checks. No browser suites were rerun for this commit-only task; runtime bytes and the previously supplied archive remain unchanged. Status/table documentation was updated for the committed state. Ignored credentials, runtime data, receipts and ZIPs remain untracked. This commit pass did not modify production or push to a remote.

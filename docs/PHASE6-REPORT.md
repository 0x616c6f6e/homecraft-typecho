# Phase 6 Development Release Preparation

## Scope
Version 0.0.6-dev adds deterministic theme packaging, whole-graph content-addressed static paths, HTTP cache boundaries and a disposable native install/upgrade/rollback test workflow. This is a development candidate, not full production release acceptance. No production service, content or credentials were changed; no remote push or publication was performed. Changes are recorded in separate local runtime, build, test and documentation commits.

## Design
`tools/package.mjs` builds a ZIP using Node standard libraries without npm dependencies. The pinned existing Playwright container supplies the build runtime. Sorted paths, fixed ZIP timestamps and file modes yield repeatable archive bytes within that runtime. Packages contain only theme PHP adapters, notices/docs, release.json and static graphs. The 64 imported upstream files remain byte-identical (MIT LICENSE at package root; runtime assets under static/<assetId>/ with the Three.js notice preserved).

`urls.themeBase` remains the installed theme directory; additive `urls.assetBase` selects the complete packaged graph. Header/footer entries, import maps, relative module imports and bundled media share this path. Source checkouts retain their ordinary development asset paths. Invalid/incomplete release metadata fails instead of falling back to a potentially mixed graph. HTML is private/no-store; packaged static trees include an Apache immutable-cache rule. Nginx/CDN configuration remains the operator's responsibility.

The retain option verifies/copies previous static graphs. Upgrades and rollback stage complete directories and atomically select them, then reload PHP workers to clear OPcache/realpath state. In this environment, a symlink switch alone left old PHP paths observable; the final workflow explicitly performs and acknowledges worker reloads. Test startup assertions use foreground tabs. No server-control endpoint or Docker socket is exposed to browser code.

## Packaging checks
`python3 tests/package.py` exercises the actual pinned JavaScript builder in four groups:
- Two builds of unchanged input are byte-identical; an independent Python ZIP reader checks CRC, paths, timestamps, excluded runtime/private filenames, licenses and upstream SHA-256 entries.
- A synthetic JavaScript change produces a different graph ID, while previous graph bytes remain available.
- A rollback build selects the original graph while retaining the newer graph.
- Modified upstream files and an accidental .env input are rejected.

The synthetic upgrade fixture is not the distributable. The distributable is rebuilt from current source and verified separately. ZIP SHA-256 is an integrity check, not a publisher signature.

## Native lifecycle matrix
`./dev/release-test.sh` provisions only the independent homecraft-release-test project: root/query on 127.0.0.1:18096 and /journal/rewritten on 127.0.0.1:18097. Runtime remains pinned Typecho 1.3.0 / PHP 8.2.30, no third-party plugins. Chromium uses desktop 1280×844 and mobile 360×844 viewports with SwiftShader.

The clean installer exposes the stock theme from the same pinned image; the normal development seed is skipped. Native administrative workflows enable the packaged theme, publish the custom scene page, set Reading options, submit an account-owned comment, restore the recent-post homepage and switch back to the stock theme. The test verifies target theme presence and actual native activation, not only a redirect status.

Final lifecycle result: ten checks passed (five per installation). Both sites verified native activation/direct reading, packaged scene/page setup, warm-cache upgrade with retained old assets, rollback with retained newer assets, and restoring Reading/switching to the stock theme while preserving content/comments. Startup and upgraded reading pages had no page exceptions or HTTP errors in the final run. The initial scene screenshots were inspected. Full output is ignored under work/testenv/browser-results/phase6.json; the runner's final exit status was zero.

Earlier runs exposed the native publication-time boundary, required PHP worker reload and the test image's theme-copy behavior; these were corrected in the test workflow. The full runner also exceeded a terminal session lifetime, so the final complete run used a detached process with a captured exit status. The final report, rather than partial logs, is the acceptance evidence.

## Development artifact
- Archive: `homecraft-typecho-0.0.6-dev.zip`.
- Files: 102; bytes: 634532.
- SHA-256: `91c83698fe51e39aa47c4c7225d5b15f1b87b157b8b7802cf39bd6d4072d4edb`.
- No credentials, databases, test/development scripts or synthetic upgrade fixtures are included.

## Regression and integrity
The Phase 5 query suite passed 20 reading/comment checks again after the new no-store header, including native validation/back recovery. All 19 theme PHP files, settings normalization, adapter output boundaries, development shell syntax and diff whitespace passed. Synthetic comment settings were restored in the existing development sites. Upstream inventory validation is included in the package checks. Release-test containers and their own volumes are removed by the runner; existing development and production Compose projects are outside its scope.

## Remaining acceptance work
This matrix does not establish all four packaged path/permalink combinations, Firefox/WebKit or physical-device compatibility, reverse-proxy/CDN behavior, every PHP OPcache deployment configuration, arbitrary plugin output or additional Typecho/PHP versions. The retained-asset upgrade fixture changes static JavaScript, not database schemas or every possible incompatible PHP contract. Reload/worker management must match the target host. A production database restore is not a rollback strategy for newly published content.

Scene transfer-size/FPS targets, long-term cache retention/pruning and production installation acceptance remain unverified; ZIP size is not initial compressed scene transfer size. Public cross-site portal metadata remains deferred. No production installation, public publishing or universal release-readiness claim is made. See INSTALLATION.md for the required backup/cache/worker procedures.

# Phase 1 Verification Report

Date: 2026-11-09. Scope: isolated environment, source analysis and minimum scene/Typecho integration. This is not a production release or full product acceptance.

## Summary
Three parallel analysis tracks covered Homecraft frontend integration, Typecho adapter APIs and a disposable test environment. The coordinator imported the starter runtime unchanged, defined bootstrap v1 and implemented a minimal JavaScript integration plus thin PHP templates. The core Phase 1 POC is validated, including required resource loading without the earlier site-metadata request failure. Public cross-site portal metadata is deferred and is not claimed by this local proof of concept.

## Actual checks
| Check | Result |
| --- | --- |
| desktop: scene startup and blog card | Passed |
| desktop: native blog and direct post without scene assets | Passed |
| mobile: scene startup and blog card | Passed |
| mobile: native blog and direct post without scene assets | Passed |
| JavaScript disabled: readable fallback and navigation | Passed |
| Blocked engine module: fallback exposed | Passed |
| Explicit plain mode: no 3D JavaScript modules | Passed |
| PHP syntax: index.php, functions.php, scene.php and dev seed | Passed |
| Shell syntax: development wrappers and startup script | Passed |
| Scene metadata parsed as native custom page template | Passed |
| Imported source SHA-256 inventory | Passed: all 64 imported files unchanged |
| Git diff whitespace | Passed |

Browser command: `./dev/browser.sh tests/phase1.cjs`. Results: ignored `work/testenv/browser-results/phase1.json`, `desktop-scene.png`, `mobile-scene.png`. The coordinator inspected scene screenshots. Tests verified `window.__home.player`, absence of startup exceptions and page errors, removal of loading UI, the blog dialog and native reading navigation. Tests do not equate an HTTP 200 or an existing canvas with successful startup. Normal scene runs reject all HTTP failures and failed requests. They additionally assert that the shared traveller adapter is loaded and no self `homecraft.json` request occurs. There are no ignored metadata-request exceptions in the final test.

Environment: Typecho 1.3.0, PHP 8.2.30, digest-pinned SQLite development container, root install and `rewrite=0` permalink mode. Playwright 1.56.1 uses Chromium with SwiftShader. Mobile is 390×844 touch emulation, not a physical phone.

The captured scene snapshot reports 11 draw calls, 6,948 triangles and zero realtime point lights in both views. Software-rendered frame times were approximately 227 ms desktop and 126 ms mobile emulation, exceeding the upstream frame-time target. This is functionality validation, not proof of smooth rendering on actual hardware. Compressed first-load transfer was not measured; no performance-release approval is claimed.

## Problems found and handled
1. `file:scene.php` skips native Archive initialization; `header()` fails on uninitialized feed fields. Replaced with a synthetic native page using the custom scene template, selected as `page:<cid>` with native front archive. No core or private-field changes.
2. PHP helper functions outside Archive template scope cannot read protected `$archive->options` through a magic property; the thin helper uses `Utils\Helper::options()` instead.
3. The upstream engine requires `<meta name="theme-color">`; added this required shell metadata after browser validation exposed a startup failure.
4. Initial bare blog-card markup did not use the upstream framed-card style. Reused the upstream `placeholder-card` wrapper; the final mobile screenshot was inspected.
5. The initial self-metadata request returned 404/timed out. An exact-URL import-map override now supplies a shared thin traveller adapter that preserves upstream travel-session behavior and reads the site title from bootstrap. Final tests show no self-metadata requests or runtime request failures.
6. Temporary debug mode used only in the isolated synthetic instance was removed before final browser validation.

## Open limitations and release gates
- External worlds still need a public `homecraft.json` endpoint to discover this site. Local startup no longer needs that endpoint because of the JavaScript adapter. Cross-site portal behavior, metadata routing and directory listing remain unimplemented and untested.
- Bootstrap posts are intentionally empty; the current scene links to a native index rather than providing the final recent-post list. Theme settings and native comment UI are not implemented.
- Firefox, WebKit/Safari, physical phones, true WebGL-disabled startup, subdirectory installations, rewritten URLs, plugin compatibility, protected-content fixtures and cache upgrades were not validated in this POC.
- Full acceptance matrix AC-01 through AC-13 is not complete. Several isolated steps above provide partial evidence, not blanket passage.

## Operational boundary
The new service listens only on `127.0.0.1:18094`. It uses its own Compose project, network, application volume, SQLite data and synthetic account/content. Existing production services, database contents, theme activation and Reading settings were not changed. No commits or pushes were made for this work.

See `INTEGRATION.md` for the selected architecture and data contract; `TEST-ENVIRONMENT.md` for starting/stopping/recreating the development instance. Next: implement the complete theme skeleton, public content summaries, settings and comments in the planned later phases; resolve public metadata routing before cross-site portal support.

This report records validation before the subsequent batched local commits. See `STATUS.md` for current commit organization; no remote push or production activation was added.

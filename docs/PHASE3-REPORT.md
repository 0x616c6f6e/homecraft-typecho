# Phase 3: Native Blog Content Verification

## Outcome
Phase 3 adds strictly public recent-post summaries, safe JavaScript scene-card presentation, native content metadata, category/tag/author/month discovery, native search and pagination. The theme version is `0.0.3-dev`. JavaScript owns frontend enhancement; PHP remains a thin Typecho adapter. No core or imported runtime source changes were made.

The scene and no-JavaScript fallback show the newest ten published, already released, unprotected posts. Reading pages preserve native permissions/password gates. Bootstrap on reading views does not serialize article bodies or authenticated archive rows. Publishing through the native administration UI updates summary visibility without rebuilding.

## Matrix results
Both root (`18094`) and `/journal/` (`18095`) installations were tested with query-string and rewritten permalinks. The following 19 cases passed in each mode, totaling 38 business checks:

| Case | Query mode | Rewritten mode |
| --- | --- | --- |
| root: public summaries fill limit after filtering all protected/non-public/future fixtures | Passed | Passed |
| root: scene summary card and script-like title remain safe | Passed | Passed |
| root: native category/tag pagination returns all 13 rows once in order | Passed | Passed |
| root: native search preserves keywords across pages and handles empty results | Passed | Passed |
| root: native author and month archives retain public posts and routing | Passed | Passed |
| root: native password gate works; unlocked cookie still cannot expose protected summaries | Passed | Passed |
| root: content discovery/reading stays scene-free with no page exceptions | Passed | Passed |
| root: server-rendered summary navigation works without JavaScript | Passed | Passed |
| root: authenticated author receives the same strictly public scene summaries | Passed | Passed |
| subdirectory: public summaries fill limit after filtering all protected/non-public/future fixtures | Passed | Passed |
| subdirectory: scene summary card and script-like title remain safe | Passed | Passed |
| subdirectory: native category/tag pagination returns all 13 rows once in order | Passed | Passed |
| subdirectory: native search preserves keywords across pages and handles empty results | Passed | Passed |
| subdirectory: native author and month archives retain public posts and routing | Passed | Passed |
| subdirectory: native password gate works; unlocked cookie still cannot expose protected summaries | Passed | Passed |
| subdirectory: content discovery/reading stays scene-free with no page exceptions | Passed | Passed |
| subdirectory: server-rendered summary navigation works without JavaScript | Passed | Passed |
| subdirectory: authenticated author receives the same strictly public scene summaries | Passed | Passed |
| native admin draft → publish → private changes summary visibility without rebuilding | Passed | Passed |

The category and tag fixtures contain thirteen public posts with five-per-page pagination. Traversal checks all rows appear once, verifies tag/search ordering against the category archive and matches serialized adjacent links to native navigation. Author/month archives retain those public posts. Empty search results expose a useful message, zero total pages and null adjacent links.

Visibility fixtures include twelve newer password-protected posts (to catch limiting before filtering), draft/private/hidden/waiting/future records, a published future-dated record, and a script-like title. Tests verify a full ten-post public list, the exact summary field allowlist, no secret/password fields in bootstrap, safe dialog text rendering, native password unlock behavior and unchanged strict summary filtering even for unlocked-cookie visitors and logged-in authors.

A real native-admin cycle saves a new draft, publishes it, observes its appearance on the next uncached homepage request, then changes it to private and observes removal. The first lifecycle attempt stopped because publication redirects to the management list rather than the edit page; the test now follows the native published CID to its edit page. No application workaround was needed.

## Regression and other checks
- Phase 2 browser suite: all 12 cases passed.
- Phase 1 browser suite: all seven cases passed, no HTTP/request failure exceptions.
- Earlier smoke selectors now distinguish the summary links from the More posts link and do not assume the old demonstration article is first after richer fixtures are loaded. The no-JavaScript regression initially exposed that outdated first-page assertion, which was corrected without weakening direct-article or fallback checks.
- All thirteen theme PHP files passed syntax checks; new fixture/mode helpers passed PHP syntax checks.
- Adapter JSON/plain-text output-boundary tests and shell syntax passed.
- All 64 imported upstream file hashes remain unchanged; diff whitespace passed.
- The query-mode mobile scene screenshot was inspected. Tests use Chromium/SwiftShader and emulation, not physical-device performance measurements.

Overall: 57 browser checks passed across new matrix cases and regression suites. Raw results and screenshots are ignored local files under `work/testenv/browser-results/`, including `phase3-query.json` and `phase3-rewritten.json`. See `CONTENT-INTEGRATION.md` for reproducible commands and data boundaries.

## Operational state and limitations
Both isolated services are healthy and restored to `rewrite=0`. All content/accounts are synthetic. Native lifecycle articles end private. The optional browser secret mount is used only for the synthetic administrator login; credentials/cookies are not written into reports or tracked source.

Theme settings, configurable summary limits, station/page mapping, guestbook/comments, public cross-site metadata, Firefox/WebKit, hardware performance, complete accessibility and cache-upgrade verification remain later work. This phase does not claim full release acceptance. No production services/settings/data were changed, and no commit or push was performed for this phase.

This report records verification before the subsequent batched local commits. Current commit organization is documented in `STATUS.md`; no production activation or remote push was added.

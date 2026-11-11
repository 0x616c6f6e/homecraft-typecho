# Product Requirements: Homecraft Typecho Theme

Status: product baseline; Phase 6 development packaging and lifecycle validation are implemented in isolated environments. Full release acceptance is not complete; see `PHASE6-REPORT.md`.

## 1. Purpose and authority
Deliver an installable Typecho theme that combines Homecraft's explorable 3D homepage with a complete, maintainable personal blog. Authors publish and moderate through the existing Typecho administration interface.

Confirmed user requirements:
- The project is a Homecraft-to-Typecho theme migration.
- JavaScript is the primary stack; PHP only integrates with Typecho.
- A small in-scene article browser is explicitly requested: reuse native article/archive pages inside the existing scene modal, with Back, Forward, Reload, All posts, a new-tab link and close/Escape. Preserve the player's position and native Typecho forms/permissions.

The detailed first-release scope below is a proposed implementation baseline derived from the migration discussion. Defaults are explicitly labeled; they are not additional user approvals. Implementation, production activation, remote pushes and optional features remain subject to the current task authorization. This document defines product behavior; `AGENTS.md` defines development rules and `MIGRATION.md` defines sequencing. Resolve conflicts explicitly rather than silently expanding scope.

## 2. Users and core journeys
| User | Journey | Successful outcome |
| --- | --- | --- |
| Visitor | Open homepage, explore, select blog station | Find and open a published article without learning movement controls |
| Reader | Open an article URL directly | Read and comment without first downloading or entering the 3D scene |
| Mobile visitor | Use touch controls or switch to reading mode | Navigate and read without keyboard-only actions |
| Author | Publish or edit in Typecho | Content updates appear without editing theme source or rebuilding an image |
| Administrator | Change theme settings, enable or disable theme | Adjust identity and presentation without changing Typecho core or content |

## 3. Release boundaries
P0 means required for the first usable release. P1 means a subsequent enhancement and must not block P0. A scene-enabled proof of concept is a milestone, not a complete release.

P0: installable theme, working 3D homepage, recent-post entry, conventional post/page/archive/search views, native comments, theme settings, responsive reading, fallback navigation, metadata and reproducible installation.

P1: in-scene article lists with enhanced filtering, richer transitions, configurable scene entry mappings beyond the initial fixed slots, optional syntax highlighting and additional scene presets.

The explicitly requested in-scene browser embeds native reading pages, including their normal comments/password forms. Deferred: a custom SPA article/comment renderer with synchronized top-level history, visual world editor, generated per-post buildings, separate admin application, custom authentication, private messaging, email forwarding service and universal plugin compatibility.

## 4. Functional requirements
### 4.1 Homepage and scene
- FR-01 [P0]: Load a recognizable Homecraft scene with the chosen upstream movement, camera and supported interaction controls. Confirm scene preset during the proof of concept; default proposal is the starter island.
- FR-02 [P0]: Provide visible Blog, About and Contact entries that work independently of walking to a station. A guestbook entry is shown only when its destination has been configured.
- FR-03 [P0]: The blog entry exposes published recent posts with title, date, excerpt and native permalink. Default proposal: ten entries, configurable from 1 to 20. A More posts link opens a conventional archive view.
- FR-04 [P0]: Provide a visible conventional reading entry during scene loading. It must remain usable when loading stalls, JavaScript fails or WebGL is unavailable; it must not depend on successful scene initialization.
- FR-05 [P0]: Show loading progress or a loading state, a recoverable failure message and a reading fallback. Do not leave a permanent blocking overlay after failure.
- FR-06 [P0]: Preserve supported day/night behavior. Weather is optional, disabled by default, and must fail without preventing scene startup.
- FR-07 [P0]: Recent posts reflect Typecho publication state; drafts, unpublished scheduled content and private content are not exposed through scene data. Password-protected posts may expose only metadata that Typecho normally makes public.

### 4.2 Posts, pages and discovery
- FR-08 [P0]: Posts display title, publication date, author, categories/tags where present, rendered body and comment availability. Independent pages display their title, rendered content and permitted comments.
- FR-09 [P0]: Render headings, links, images, lists, quotations, code blocks and tables without breaking reading layout. Wide content scrolls locally rather than widening the page. Syntax highlighting is P1.
- FR-10 [P0]: Category, tag, date and author archives use native Typecho filtering and permalinks. Search uses native Typecho semantics and preserves the query during pagination.
- FR-11 [P0]: Paginated lists provide usable previous/next or numbered links, an empty state and a path back to the homepage. Pagination must not duplicate or omit posts relative to Typecho's native result order.
- FR-12 [P0]: Existing post/page links remain valid. Direct visits, refresh and browser back/forward work through ordinary navigation; an SPA router is not required for P0.
- FR-13 [P0]: Missing content returns an appropriate 404 page and status. Password-protected content uses Typecho's native access workflow and does not leak protected body text into markup or serialized data.
- FR-14 [P0]: A conventional paginated blog index remains directly accessible while the homepage shows the scene. Choose and verify a conflict-free native route or page-template approach in Phase 1; do not hardcode a route that can collide with existing content.

### 4.3 Comments and guestbook
- FR-15 [P0]: Use native Typecho comment submission, field requirements, moderation and reply behavior. Display closed-comment and awaiting-moderation states consistently with Typecho.
- FR-16 [P0]: Preserve entered fields when a recoverable validation error occurs where native behavior permits. Submission errors must be visible; avoid duplicate submissions from repeated interaction.
- FR-17 [P0]: Respect native visibility rules for comments, including moderation and logged-in viewers. Do not expose pending comments to unrelated visitors.
- FR-18 [P0]: Default guestbook proposal: an optional selected Typecho page using native comments. An unset destination hides the scene entry. Homecraft's email mailbox is not silently repurposed or enabled.

### 4.4 Theme administration
- FR-19 [P0]: Configure supported options in Typecho's theme-settings UI; do not add a separate admin application.
- FR-20 [P0]: Validate settings on the server and provide defaults for missing or invalid values. Re-enabling the theme must not delete posts, pages, comments or uploads.
- FR-21 [P0]: Routine content edits and theme-setting changes appear on subsequent uncached requests without a Node.js runtime or a build on the production server. Explain any required cache invalidation.

### 4.5 In-scene article browser (explicit additional scope)
- FR-22: Open scene-summary articles and the All posts action in the existing native modal, preserving the scene/player and lazy-loading a same-site native reading document only on demand. Keep the top-level direct-reading link and no-JavaScript fallback as ordinary navigation.
- FR-23: Provide Back, Forward, Reload, All posts and a current-page new-tab link. Native pagination, search, comments, replies and password gates remain server-controlled; do not clone forms or introduce a content API.
- FR-24: Suspend scene rendering and movement while the browser is open. Close/Escape from the outer window or embedded document must remove the frame, restore focus and resume rendering. A link to the scene homepage closes the reader instead of loading another scene inside it.
- FR-25: Limit browser entry points to the site's reading URLs. Keep a visible new-tab route when a page is slow, unavailable or refuses embedding. Fit desktop and narrow viewports; do not claim arbitrary external-site browser support.

Proposed settings:
| Setting | Source/default | Behavior |
| --- | --- | --- |
| Site title and description | Native Typecho options | Avoid duplicate conflicting site identity fields |
| Display name and introduction | Theme option; site title/empty | Render as text; no arbitrary script or PHP input |
| Avatar skin | Optional supported image URL | Validate URL and document upstream image constraints; invalid skin uses default |
| Logo and favicon | Optional supported image URL | Missing values use documented neutral defaults |
| Interface language | Proposal: Chinese default; optional English | Controls theme UI labels, not automatic translation of posts |
| Recent-post count | Proposal: 10, range 1–20 | Applies to the scene entry, not native archive page size |
| About and guestbook | Optional existing published page | Empty or removed targets hide or safely disable entry |
| Contact/social links | Optional supported URLs | Hide empty items; reject unsafe protocols |
| Weather | Off; optional city/coordinates/timezone | Provider failure does not affect reading or startup |
| Homepage mode | Proposal: 3D or conventional list | Provides administrator-controlled fallback |

Arbitrary HTML, executable code, custom upload handling and secrets embedded in frontend settings are outside the initial configuration scope. Use native uploads and attachment URLs for images.

## 5. Architecture and data boundaries
- JavaScript owns scene integration, UI enhancement, interaction and frontend state. Prefer native ES modules and a separate integration layer; no frontend framework is selected yet.
- PHP owns only Typecho adapter concerns: theme metadata/templates, native data access, initial markup/data, settings and native route/comment integration. It does not duplicate scene or frontend state logic.
- Thin server-rendered templates provide meaningful initial content and native form behavior; JavaScript enhances it. Reading pages must not require the 3D engine.
- Use native widgets and rendering first. A REST plugin is not a prerequisite. Define any additional endpoint only after demonstrating a user interaction that needs one.
- Define a versioned bootstrap data contract before parallel implementation. Minimum concepts: site and theme base URLs, public UI settings, current view, permitted post summaries, native links and pagination. Choose exact field names and shapes in the implementation design.
- Public summaries contain only necessary public fields. Never serialize credentials, user email addresses, raw database rows, admin URLs with tokens or protected content. Comment forms use native server-generated actions and required tokens.
- Encode bootstrap JSON safely for HTML context. Escape plain text, attributes and URLs; article bodies follow Typecho's rendered-content and trust model rather than being blindly escaped or injected from untrusted strings.
- Resolve assets and navigation through Typecho URLs, including subdirectory installs and native permalink modes. Preserve supported theme/plugin header and footer hooks and test declared integrations.
- Runtime dependencies consist of Typecho/PHP and static browser assets. Node.js may be used for development and packaging; a new database schema or standalone Node service is not planned.

## 6. Non-functional requirements
### Performance and reliability
- Retain the imported Homecraft performance budget for scene changes: common-view draw calls at most 60, triangles at most 200,000 and at most two real-time point lights. Record baseline and regressions on the selected preset; do not silently rewrite thresholds.
- Treat upstream's compressed initial scene-load target of 500 KB as a measurement target, excluding explicitly identified optional user media. Report measured transfer and exceptions; do not claim compliance without browser evidence.
- Article, archive and search pages must not fetch scene modules, textures or models unless the user explicitly enters the scene.
- Pause rendering for hidden documents and unnecessary scene states; returning must not create duplicate render loops. Dispose resources when a scene is explicitly destroyed.
- UI remains usable at a 360 CSS-pixel viewport; test desktop and mobile layouts and record actual devices/emulation. Do not claim a universal FPS guarantee.
- Document a cache/version strategy that prevents incompatible old/new ES modules after upgrades, including when deployed behind a reverse proxy.

### Accessibility and metadata
- Conventional navigation and content use semantic headings, links, labeled forms and visible focus. Keyboard users can open and close overlays without focus traps.
- Opening a scene panel suspends player shortcuts while typing, including search and comment fields. Closing it restores usable focus and input behavior.
- Honor reduced-motion preferences for nonessential transitions; keep a visible reading alternative to 3D navigation.
- Render per-view titles, descriptions and canonical links before JavaScript. Article sharing URLs use native permalinks. Keep native feeds discoverable through Typecho facilities.

### Security and compatibility
- Preserve native authentication, access control, password gates, comment validation and moderation. Settings do not permit executable URLs or server-side code.
- Do not assume every installed plugin is compatible. Record the tested plugin list and known limitations.
- Phase 1 must pin and document an exact Typecho version, PHP version and test image digest. The observed production nightly tag is context, not a supported-version guarantee.
- Test desktop Chromium and Firefox plus mobile WebKit/Safari behavior where tooling or devices permit; explicitly mark untested targets. Validate root/subdirectory installs and rewritten/query-string permalink modes.

## 7. Acceptance matrix
| ID | Scenario | Pass condition |
| --- | --- | --- |
| AC-01 | Install on isolated Typecho | Theme is discovered, activated and renders without PHP errors |
| AC-02 | Create/edit/publish/unpublish a synthetic post | Public lists and article views match native publication rules without rebuilding |
| AC-03 | Enter from scene or direct URL | Same canonical article is readable; direct access does not load scene assets |
| AC-04 | Empty site, empty search and missing article | Useful empty/404 states, working navigation and appropriate HTTP status |
| AC-05 | Pagination, taxonomy and search | Native filtering/order, usable links and preserved query |
| AC-06 | Submit/reply/moderate/close comments | Native validation and visibility rules hold; feedback is visible |
| AC-07 | Draft/private/password-protected fixtures | No unauthorized content in HTML, bootstrap data or optional responses |
| AC-08 | Update and clear theme options | Valid defaults, safe links and no broken scene startup |
| AC-09 | Disable JS/WebGL or fail scene resource | Basic navigation and readable content remain reachable |
| AC-10 | 360-pixel touch view and keyboard view | Reading and core navigation work without walking or keyboard-only scene actions |
| AC-11 | Root/subdirectory and both permalink modes | Assets, article links, forms and pagination resolve correctly |
| AC-12 | Upgrade cached asset set and revisit scene | No module mismatch or duplicate render loops; baseline performance recorded |
| AC-13 | Switch back to previous theme | Content remains intact; documented rollback works |

Use synthetic fixtures including long titles, Chinese/English text, unsafe-looking plain text, long code lines, tables, large images, no results, multiple pages, moderated comments and protected content. Record commands, browser evidence and unresolved failures; document-only checks do not establish application compliance.

## 8. Delivery and milestones
1. Proof of concept: pinned upstream, documented environment, functioning scene and a native blog-index route decision.
2. Content loop: publish in Typecho, find through homepage, open a direct article and submit a native comment.
3. Usable release: all P0 requirements and acceptance scenarios validated or remaining limitations explicitly accepted.

Deliver an installable theme archive, source, upstream revision and license notices, settings reference, installation/upgrade/rollback guide and verification report. Include required static dependencies; exclude credentials, databases, local runtime data and development dependencies. Production deployment is a separate authorized action.

## 9. Open decisions
| Decision | Proposed baseline | Resolution point |
| --- | --- | --- |
| Scene preset | Starter island, personalized later | Before source integration |
| Reading behavior | Independent server-rendered pages with JS enhancement | Before template implementation |
| Guestbook | Optional Typecho page comments | Before station integration |
| Frontend tooling | Native JS modules; add build tooling only when justified | Before build setup |
| Language | Chinese UI default, optional English labels | Before UI settings implementation |
| Exact supported versions and plugin list | Verify test environment first | Phase 1 |
| Blog-index route with 3D homepage | Conflict-free native mechanism | Phase 1 |

Do not silently turn these proposals into user-approved product decisions. Routine reversible implementation choices may follow the baseline when authorized implementation starts; material scope changes require explicit resolution and an updated estimate.

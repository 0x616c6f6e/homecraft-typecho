# Migration Plan

## Target
Product scope and release acceptance are defined in `REQUIREMENTS.md`. Follow its P0/P1 boundaries and keep proposed defaults distinguishable from confirmed requirements.

An installable Typecho theme with Homecraft's 3D homepage, native blog content and a conventional reading experience. Initial estimate: 8–12 developer-days for a usable release, subject to environment validation and agreed scope. This is an estimate, not a delivery commitment.

## Technology boundary
JavaScript is the primary stack, using native ES modules for the scene, UI, frontend state and interaction. PHP is limited to the Typecho adapter: theme discovery, data access, settings, route integration, initial markup/data and native comments. No separate PHP business application is planned.

Use thin server-rendered templates for canonical URLs and readable fallback content. Keep authorization, private-content filtering and comment validation in Typecho. Define the JavaScript/PHP data contract before adding custom endpoints; prefer existing native capabilities and do not assume an installed REST plugin.

## Phase 1: Environment and proof of concept
Current evidence: see `PHASE1-REPORT.md`. Core POC and local scene resource loading are validated. Public cross-site portal metadata remains later integration work. `INTEGRATION.md` records the native-page homepage decision and bootstrap contract.

- Confirm the installed Typecho version, PHP version, plugins, permalink mode and image digest.
- Create an isolated test environment with synthetic posts and comments.
- Decide starter island versus adapted showcase, and document the choice.
- Import a pinned upstream revision with notices; verify 3D startup from theme URLs.
Acceptance: a test-only theme renders the scene without missing resources or changes to the live blog.

## Phase 2: Theme skeleton
Completed in the isolated tested environment; see `PHASE2-REPORT.md`. Shared templates and validated JavaScript entry work at the root and `/journal/` prefix with native query-string permalinks.

- Implement Typecho theme metadata and thin reusable PHP adapter templates.
- Define the frontend data contract and JavaScript modules for UI, content presentation and interactions.
- Organize assets and integration code; support absolute resource URLs and safely encoded settings.
- Keep the upstream scene and engine identifiable.
Acceptance: Typecho recognizes and enables the theme in the test instance; root and subdirectory resource paths work.

## Phase 3: Blog content
Completed in the isolated root/subdirectory environments for query-string and rewritten permalinks; see `PHASE3-REPORT.md` and `CONTENT-INTEGRATION.md`. Native publication/visibility changes and public-summary filtering were exercised through real authoring/password workflows.

- Connect Typecho-native post, page, taxonomy, search and pagination data through the thin PHP adapter.
- Implement frontend presentation, state and enhanced navigation in JavaScript; preserve native URLs and fallback content.
- Keep stable native permalinks and server-rendered content.
Acceptance: content published through Typecho appears correctly and is directly accessible without the scene.

## Phase 4: Scene integration and configuration
Native settings and public page mappings are implemented in the isolated environment; see `SETTINGS.md` and `PHASE4-REPORT.md`. Guestbook submission remains Phase 5; cross-site portal metadata remains deferred.

- Map scene stations to posts, about, contact and an explicitly chosen guestbook destination.
- Add validated theme settings for identity, skin, weather, language and links.
- Preserve upstream branding and remove inappropriate showcase identity references.
Acceptance: routine personal settings can be changed in Typecho without editing source.

## Phase 5: Reading and comments
- Style headings, images, code, tables and long content for desktop and mobile.
- Integrate native comments, moderation states and replies.
- Provide a visible conventional reading path and JavaScript/WebGL fallback.
- Suspend scene work during reading where applicable.
Acceptance: mobile users can read, search and comment; native validation and moderation continue to work.

## Phase 6: Validation and release preparation
- Verify the relevant integration matrix in AGENTS.md and document known plugin limitations.
- Check startup/network failures, caching and performance; package an installable theme with license notices.
- Prepare installation, upgrade and rollback instructions.
Acceptance: validated release artifact and a concrete deployment plan ready for user review. Production activation requires authorization.

## Deferred features
In-scene full article navigation and comment submission, synchronized browser history, a visual building editor, per-post 3D objects, and large scene redesigns require separate scope and estimates.

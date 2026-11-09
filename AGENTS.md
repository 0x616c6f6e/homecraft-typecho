# Homecraft Typecho Migration

## Purpose
Build an installable Typecho theme that preserves Homecraft's 3D homepage and uses Typecho for publishing, archives, pages and comments. This repository is independent of the running Homecraft deployment.

## Read first
Read `docs/REQUIREMENTS.md`, `docs/MIGRATION.md` and `docs/STATUS.md` before implementation. Treat this file as the shared instruction source for all AI assistants. Tool-specific files point here; keep project rules here to avoid divergence.

## Communication and scope
- Communicate with the user in Chinese by default. Write code identifiers and technical documentation in English.
- Complete the requested scope; do not treat the roadmap as authorization to implement every phase.
- Do not enable this theme on the production blog, modify production data, change existing services, push to a remote, or publish without user authorization.
- Use an isolated test instance and synthetic data. Never copy production credentials, database exports or personal data into this repository.
- Do not spawn agents unless the user explicitly requests delegation or parallel agents.

## Architecture
- JavaScript is the primary implementation language. Implement the UI, scene interactions, reading interactions, frontend state and presentation logic in JavaScript, using native ES modules by default.
- PHP is a thin Typecho adapter only: theme registration, native data access, initial HTML/data output, settings, routes and integration with native comment handling. Do not build a parallel PHP application or duplicate frontend business logic in PHP.
- Use Typecho-native facilities first. Add a narrowly scoped data endpoint only when a frontend interaction requires it; do not assume a REST API is already installed. Enforce permissions and output boundaries on the server.
- Keep directly addressable article URLs and meaningful server-rendered fallback content through thin PHP templates. JavaScript enhancement must not require moving Typecho authorization, private-content checks or comment validation into the browser.
- Start with a 3D homepage and server-rendered article pages. In-scene full article reading is a later feature.
- Use native Typecho widgets, routes, theme settings, comment handling and authentication. Do not introduce a second CMS or modify Typecho core.
- Keep `engine/`, `world/` and `vendor/three/` as recognizable upstream assets within the theme. Confirm the final directory layout before importing source.
- Prefer theme templates and a separate integration layer over engine modifications. Explain necessary engine changes before implementing them.
- Generate absolute theme resource URLs through Typecho. Import maps, module imports, textures and media must work from article routes and subdirectory installations.
- Serialize runtime settings with safe JSON encoding. Escape text, URLs and attributes for their output context; preserve Typecho's intended rendered article HTML.
- Use native permalink pages as canonical article URLs. Keep content readable with JavaScript disabled or WebGL unavailable.
- Pause or dispose scene rendering when it is not needed; avoid duplicate animation loops, event handlers and WebGL contexts.

## Feature boundaries
- Theme settings: identity, skin, language, weather, navigation and social links.
- Posts, pages, categories, tags, archives, search and comments: Typecho-managed.
- Do not equate Homecraft's email mailbox with Typecho comments. Define the chosen guestbook behavior explicitly.
- A visual world editor, automatic per-article 3D buildings and a separate admin dashboard are out of the initial scope.
- Do not present the upstream author's identity, links or showcase content as the user's own.

## Upstream and licensing
- Source: https://github.com/terryHu7/homecraft
- Review upstream instructions and record the exact imported revision in `docs/UPSTREAM.md` when importing.
- Preserve the MIT copyright and license, plus third-party license notices.
- Keep upstream imports separate from integration edits. Do not apply automatic upstream upgrades over local changes.
- Do not hand-edit an upstream-generated engine manifest.

## Validation
- Record the actual Typecho version, PHP version and container image digest in the test environment. Do not assume a nightly tag is stable.
- Run PHP syntax checks on changed PHP files and validate JavaScript with tooling appropriate to its module/import-map structure.
- Test homepage startup, article and page rendering, archives, pagination, search, comment submission/reply and theme settings as those features are added.
- Test root and subdirectory installs, rewritten and query-string permalinks, desktop and mobile, JavaScript/WebGL fallback, and browser back/forward where applicable.
- Inspect network and console errors. Check headers and caching so old and new modules cannot silently mix.
- Use meaningful tests for integration and behavior. Do not add tests that only mirror configuration text.
- Follow applicable upstream checks for imported or changed engine code; report unavailable checks honestly.

## Handoff
Update `docs/STATUS.md` after material work: completed changes, commands actually run, results, blockers and next steps. Never claim deployment, browser checks or compatibility that were not verified. Keep secrets out of logs and commits. Commit only when requested, using focused English conventional commit messages.

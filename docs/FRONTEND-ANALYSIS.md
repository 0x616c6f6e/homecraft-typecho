# Phase 1: Homecraft frontend integration analysis

Status: source analysis, 2026-11-09. No theme implementation or browser validation was performed by this analysis task. Proposed integration decisions below are reversible implementation recommendations, not additional product approvals.

## Source and evidence

- Source: https://github.com/terryHu7/homecraft
- Cloned HEAD: `df8033aab87569d2779e1c2f74564183527282f7`.
- Commit: `docs(contributing): align listing merge instructions`; committed `2026-11-08T07:54:18-08:00`.
- Disposable checkout: `work/frontend/upstream/`, excluded by the repository's existing `work/` ignore rule. This is not the distributable upstream import.
- Read upstream `AGENTS.md`, `index.html`, `home.config.js`, starter `world/`, engine entry/config/input/HUD/loading/metadata/traveller sources, package scripts and licenses. Production deployment was not changed.
- Homecraft: MIT, copyright 2026 Terry. Bundled Three.js: MIT, copyright 2010–2025 three.js authors. Preserve both notices in the packaged theme.

Useful pinned evidence links:

| Concern | Upstream file at pinned revision | Finding |
| --- | --- | --- |
| Import map and content shell | [index.html](https://github.com/terryHu7/homecraft/blob/df8033aab87569d2779e1c2f74564183527282f7/index.html) | `three`, `@engine/`, `@world/`, `@config`; article cards selected by `data-station` |
| Configuration | [engine/config.js](https://github.com/terryHu7/homecraft/blob/df8033aab87569d2779e1c2f74564183527282f7/engine/config.js) | Imports `@config`; shallow top-level merge plus nested merge of `start`, `mailbox`, `portal` |
| Boot/cards/render loop | [engine/main.js](https://github.com/terryHu7/homecraft/blob/df8033aab87569d2779e1c2f74564183527282f7/engine/main.js) | Self-starting module, internal boot fallback, `innerHTML` card copy, hidden-document render skip |
| Dynamic HUD | [engine/hud.js](https://github.com/terryHu7/homecraft/blob/df8033aab87569d2779e1c2f74564183527282f7/engine/hud.js) | Mounts radar, phone, dialog, startup notice; images resolve against module URL |
| Input | [engine/input.js](https://github.com/terryHu7/homecraft/blob/df8033aab87569d2779e1c2f74564183527282f7/engine/input.js) | Already excludes inputs, textarea, select and contenteditable from player shortcuts |
| Starter station layout | [world/layout.js](https://github.com/terryHu7/homecraft/blob/df8033aab87569d2779e1c2f74564183527282f7/world/layout.js) | Only mailbox and portal have physical stations; blog/about work through Dock without placed world objects |
| Metadata lookup | [engine/traveller.js](https://github.com/terryHu7/homecraft/blob/df8033aab87569d2779e1c2f74564183527282f7/engine/traveller.js), [engine/door-metadata.js](https://github.com/terryHu7/homecraft/blob/df8033aab87569d2779e1c2f74564183527282f7/engine/door-metadata.js) | Requests `homecraft.json` relative to the document, not the theme directory; catches failure and returns null |

## Recommended runtime layout

Use `theme/` as the installable Typecho theme root:

```text
theme/
  index.php, post.php, page.php, archive.php, functions.php, ...
  engine/                 # complete pinned runtime tree, unchanged
  world/                  # starter layout/build, recognizable upstream content
  vendor/three/           # complete vendor tree and license, including relative dependencies
  assets/                 # retained assets actually referenced by chosen shell/content
  js/
    bootstrap.js          # parse/validate the public contract
    home-config.js        # map approved theme options to upstream @config export
    scene.js              # homepage entry, dynamic import and fallback supervision
    traveller.js          # bootstrap-backed local title; preserves upstream travel session
  css/theme.css           # theme overrides, fallback and reading layout
  LICENSE.homecraft
```

Do not copy only `three.module.min.js`: preserve its relative module dependencies. Import the engine runtime atomically with its assets and manifest. Do not rewrite `engine/manifest.json`. Keep clone tools/examples out of the installable archive unless used deliberately. Record the eventual imported revision and notices in `docs/UPSTREAM.md`.

## Thin integration design

1. Thin PHP emits valid initial HTML, native navigation and permitted recent-post summaries. It also emits safely encoded versioned JSON before the scene entry module. No custom endpoint is required for the POC.
2. Import-map values are absolute Typecho-generated theme URLs, with directory aliases ending in `/`. `@config` points to `theme/js/home-config.js`, not a dynamic PHP-generated JavaScript file. The static adapter reads bootstrap data before `engine/config.js` evaluates.
3. `scene.js` runs on the scene homepage only and dynamically imports `../engine/main.js`. Import-map installation must precede all imports. Article/archive/search templates do not include the engine stylesheet or entry module; global engine selectors and scene requests should stay off reading pages.
4. PHP supplies `#world`, `#loading` containing `.bar > i`, and `#pages`. The latter contains a heading and `.page[data-station]` cards, each with an `h2`. Do not pre-render duplicate `#hud`, `#panel`, `#phone` or `#startupNotice`: upstream `mountHud()` owns those IDs.
5. Blog card contains plain SSR summaries and native article links; normal anchors navigate in the same tab. Do not use `data-link` for canonical blog navigation: upstream opens it in a new tab. Do not use `data-embed`: native reading pages should not be hidden in an iframe.
6. About/contact summaries may use upstream markup conventions, with settings treated as plain text/validated URLs. Do not insert comment forms, script-dependent widgets or repeated element IDs into copied cards: `openPage()` sets the panel body using `page.innerHTML`; existing listeners/state are not transferred and original IDs remain in the source card.
7. Leave the upstream mailbox submission form out of POC cards and `dock`. A native guestbook, if configured later, is an ordinary page link. The mailbox Worker is not Typecho comments.
8. Keep a reading link outside hidden scene cards, visible above the loading overlay and available without JavaScript. Initial HTML and theme override CSS must handle JS-module download failure; upstream `#pages` defaults to `display:none`.

### Required PHP → JavaScript contract concepts

The root agent should freeze exact names in the shared contract before implementation. Frontend requires:

- `schemaVersion` and `view` to reject unsupported bootstrap data and gate scene startup.
- Typecho-generated `siteUrl`, absolute trailing-slash `themeUrl`, and native `blogUrl`/home/about/guestbook links.
- Approved public UI settings: name, languages, optional supported skin URL, supported start time/weather, weather disabled by default, supported Dock IDs.
- Only public recent-post fields: title, native permalink, publication date and plain-text excerpt; preserve the SSR card as the source of accessible content rather than building a second inconsistent list.
- No comment tokens, private content, admin credentials or raw database rows in public JSON. Native forms live on native pages.

Suggested config adapter defaults: `languages:['zh']`, `weather:null`, starter `start:{weather:'clear',time:'day'}`, `dock:['blog','about','phone']`, blank mailbox fields. Treat these as POC proposals. Built-in config defaults already cover missing fields; pass only validated options and do not blindly spread all bootstrap data.

## Failure and lifecycle boundaries

- `engine/main.js` calls `boot()` internally and catches its failure, disposes the provisional renderer, sets `window.__homeStartupError`, and enters plain mode. Resolving `import()` therefore does not prove scene readiness. Success is `window.__home?.player`; failure is the startup error signal or an explicit bounded loading deadline.
- A missing static dependency fails before the engine's catch can run. `scene.js` needs an import rejection path that makes SSR content readable and removes/hides blocking loading UI. A bounded timer must also preserve access when a dependency stalls; late completion must not start a second instance. Never retry by repeatedly importing the same failed module in-place; use full-page navigation/reload.
- Upstream `?plain` enters plain mode but still evaluates the static dependency graph. It is not a no-scene-download mode. The theme should decide conventional mode on the server or before importing the engine.
- The render loop already returns early when `document.hidden`; sound/weather also have visibility handling. Do not report visibility support as absent. The loop continues scheduling animation frames while hidden, but skips simulation/render.
- An open card pauses movement, not rendering. For P0 independent article pages, ordinary document navigation naturally ends the old scene. Pausing rendering underneath in-scene reading or explicitly destroying/recreating a scene needs further engine lifecycle design.
- `window.__home` is a debug/integration convenience, not a stable versioned public API. There is no complete scene `destroy()`/unsubscribe facility; input and resize handlers have no aggregate cleanup.
- Input typing guards exist. Still verify focus return and keyboard navigation of theme-added controls in browser tests.
- Starter includes an external portal station and module-level local-site metadata request. `readSiteInfo(location.href)` resolves `<site-base>/homecraft.json`, even if the runtime resides in `/usr/themes/...`. Merely copying JSON into the theme does not satisfy it. Failure is caught/nonfatal, but can create a network 404 or parse fallback. Do not modify the production web root to hide this during the POC. A native metadata route, static test-only metadata response, or a documented later portal feature flag can resolve it. Setting `portal.directory:[]` alone does not suppress local-site metadata lookup.

### Selected POC metadata adapter

During integration review, select an exact-URL import-map override from the absolute theme `engine/traveller.js` URL to `theme/js/traveller.js`. The adapter imports the named `{ config }` export from `../engine/config.js`, imports `createTravelSession` from `../engine/door-protocol.js`, and exports the same `traveller` and `wornSkin` names. Create one session using `createTravelSession(config.skin, '', async () => readBootstrap().site.title)`; `wornSkin` delegates to that same session. This replaces only the local site-title source with public bootstrap data, removing the local `homecraft.json` lookup without changing pinned upstream files.

Verified call sites: `engine/main.js` imports `wornSkin`; `engine/portal.js` imports `traveller` and calls `link()`/`arrive()`. No other upstream runtime consumer imports this module. Both call sites must resolve to the identical adapter URL and session instance; use one normalized absolute import-map key before any module loads. `createTravelSession` already accepts an asynchronous title provider and validates the carried title through its internal `siteName` function. Keep the original session implementation, preserving arrival checks, session/history restoration, skin handling and public-link sanitization. Do not duplicate that protocol in theme code.

Risks: the exact import-map key must match URL normalization, deployment path and asset-version strategy; an upstream import signature change requires review. A wrong key silently leaves the metadata request in place. Browser verification must confirm the original traveller module is not fetched, only one session instance is used, normal avatar startup succeeds, and back/forward behavior remains valid. `bootstrap.site.title` is a string under the shared contract; missing/invalid bootstrap must fall through theme startup supervision. This adapter does not publish metadata for external worlds. A public metadata route remains a separate future portal decision. This source review supports the adapter design; it does not establish a browser pass.

## Engine changes: required versus deferred

No engine edit is required for a starter homepage POC with SSR blog cards and direct article navigation. Resource relocation is handled by absolute import maps, module-relative engine assets, and absolute user-media URLs. The selected exact-URL traveller override removes the unwanted local metadata lookup while preserving the imported engine bytes.

If later acceptance requires pausing under reading overlays, explicit scene teardown, or disabling all portal protocol behavior when portal is disabled, propose a focused engine patch first. Likely boundaries are a lifecycle controller with pause/resume/destroy and a portal/traveller enable switch; include listener/timer/resource cleanup, not only cancelling one animation frame. Do not add these changes during source analysis.

## Executable POC sequence

1. Pin this revision; copy runtime trees and license notices into the agreed `theme/` layout, recording checksums/import provenance. Keep upstream imports separate from adapters.
2. Implement the thin Typecho home shell and public bootstrap using the shared contract; choose a conflict-free native conventional-list URL with the Typecho agent.
3. Emit absolute import-map paths, add the static config adapter, and map the exact upstream traveller URL to the bootstrap-backed session adapter. Preserve upstream starter world unchanged for this milestone.
4. Render a synthetic recent-post card and an always-visible ordinary reading link; omit mailbox form. Keep normal post permalinks independent of the scene.
5. Add one guarded dynamic-import entry with loading/error handling. Style the SSR fallback before loading the engine so failed imports cannot hide all navigation.
6. Run on the isolated Typecho instance. Confirm `__home` readiness, no missing runtime resources, blog card opening and native link navigation. Confirm the local metadata request is absent under the exact-URL traveller mapping; distinguish future public portal metadata support from missing runtime files.
7. Validate root and subdirectory install URLs, then native query-string/rewrite routes. Browser checks: desktop plus 360-pixel touch view, JS disabled, WebGL rejection, blocked main/dependency request, stalled request, back/forward, hidden-tab return.
8. Record `__home.stats()` against the upstream budget (60 draw calls, 200k triangles, two real-time point lights), network transfer with compression, and actual screenshots. Article pages must not request engine or world assets.

## Checks actually performed and remaining evidence

Performed: upstream Git clone/revision/log verification, targeted source inspection, license inspection and runtime-directory size inspection. Checkout remained unchanged. Raw filesystem directory sizes are not compressed transfer measurements and are not performance evidence.

Attempted `node --version` and `node tools/check-site.mjs`; both could not execute because `node` was absent from the shell PATH. No npm dependencies were installed in this analysis task. Upstream declares Node >=22 and Playwright 1.64.1; its browser checker accepts a supplied URL but assumes upstream content conventions. Adapt it deliberately rather than claiming it verifies all Typecho behavior.

Not verified here: actual browser startup, WebGL availability, compressed bytes, draw budget, Typecho integration, mobile Safari/Firefox, permalink combinations, caching, plugin behavior and semantic/accessibility quality of the resulting theme. This report must not be used as an application pass report.

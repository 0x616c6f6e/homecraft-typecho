# Reference Show-home Scene (0.0.9-dev)

The default scene now reuses the official Homecraft `examples/terry-home/world/` implementation at revision df8033aab87569d2779e1c2f74564183527282f7. It includes the glass-fronted house, loft/stairs, basketball court, gym furnishings, desk/lounge, garage/car, kitchen/coffee counter, pool/ladder, roof access, forest, mountain paths, pier and sailboat. This is the pinned source example, not a guarantee of pixel identity with a subsequently updated live website.

Twelve example modules live under world/show-home. SHOW-HOME-FILES.json records original/adapted SHA-256 values. The original starter/vendor files remain unchanged; the pool-ladder fix in the main player module is separately recorded in UPSTREAM-PATCHES.json. MIT attribution is preserved in LICENSE and UPSTREAM.md. Personal skin, biography, contacts, mailbox backend and project promotions are not imported. Name/initials in decorative art are neutralized; certificate imagery becomes generic symbols. The architectural positions, furniture and construction logic remain the example's own.

## Use
Reload the development homepage (Ctrl+F5 if necessary). Approach a station until the bottom-right prompt appears, then press F. Esc closes the panel; while reading a panel, world shortcuts remain guarded by the native engine. Movement, jumping, flight and touch controls remain the original engine's, with the corrected ladder landing. Swim toward the ladder/land-backed pool edges at the surface to climb out, or click a deck destination to use native exit navigation. The sea-facing edge has no deck. The prompt can also be tapped/clicked; physical mobile touch was not tested in this pass.

| Place | F interaction |
| --- | --- |
| Work desk | Public recent posts and native article/archive links |
| Lounge | Site introduction and optional native About link |
| Loft bedroom | Room card and native archive link; correct upper-floor proximity |
| Basketball court | Court information card |
| Garage | Garage information card |
| Coffee counter | Coffee-area card and reading link |
| Pool | Pool information card |
| Mountain entrance | Mountain card; native navigation/showcase remains available |
| Portal | Native portal panel; public directory/travel integration remains intentionally disabled |
| Mailbox | Native guestbook link only when a public comment-enabled page is selected |

Native room activities and animations are imported with the scene; F cards are informational, not a new driving, shopping or game-record backend. Do not put comment forms inside cloned scene panels. Native page comments remain the guestbook destination.

## Presets
In Typecho Appearance → Configure theme → 场景建筑, select the source show-home (default), the previous cottage/library/watchtower village, or the original starter island. Reload the homepage after saving. Invalid stored/input values are normalized/rejected using the existing native settings machinery. Older village modules and the previous work are retained rather than removed.

## Verification
`./dev/browser.sh tests/show-home.cjs` passed root/desktop (1280×844) and subdirectory/mobile-sized (390×844) Chromium. Both use real keyboard F events at all nine listed unconditional stations: 18 successful proximity interactions. Blog links, native modal shortcut guard, Esc closure, loft-floor handling and scene initialization passed with no page exceptions or HTTP failures. External/mountain/roof-access objects and the mapped desk hotspot were checked; screenshots were produced and the desktop front/pool view was inspected. These tests position the player through the native teleport API before sending keys; they do not claim a complete manual walking/swimming/gym traversal.

`HC_TEST_AUTH=1 ./dev/browser.sh tests/presets.cjs` passed native village save/render, starter selection and invalid-choice rejection; original show-home selection was restored. Pure settings/adapter checks and all 19 theme PHP syntax checks passed. All 64 original runtime SHA-256 entries remain unchanged. The final package is checked independently for ZIP CRC and every bundled static digest.

Samples were 49 calls / 60,028 triangles / two lights on desktop and 38 calls / 59,934 triangles / two lights at the mobile-sized viewport. These fit the 60-call/200,000-triangle/two-light limits; software-rendered frame samples (~868/686 ms) do not meet the frame-time target. This scene is substantially heavier than the village. No physical-device FPS or universal browser guarantee is made; the lightweight presets remain available. Firefox/WebKit, actual touch interactions, guestbook F at a configured mailbox and every interior/roof edge were not retested in this pass. Live portal discovery and mail delivery are not enabled.

No production site, Typecho content or remote Git state was modified. The changes and preceding village scenery are recorded in focused local Git commits.

## Pool-ladder correction (0.0.9-dev, committed locally)
The reported trap was reproduced: the old ladder landing overlaps its rounded navigation footprint, preventing `exitAt()` from accepting it. The landing is now 0.3 m farther onto the deck. This is the sole modified engine module, documented and hash-checked in UPSTREAM-PATCHES.json; the engine-generated manifest stays unchanged.

`./dev/browser.sh tests/pool.cjs` passed ten native movement/input checks at each of the root/desktop and subdirectory/mobile-sized sites (20 total). These cover the ordinary north edge, three ladder approaches, west/east coping, native deck-destination exits from surface/bottom, sea-edge blocking/retreat, and a real W event consumed by the native input reader. Native physics is advanced at fixed timesteps against the rendered show-home's navigation and collision data. The real rendered avatar also climbs onto the deck. There were no page exceptions or HTTP errors. Actual touchscreen operation and physical-device frame rate remain unverified.

The new pool-facing camera sample is 65 calls / 64,792 triangles / two lights on desktop and 53 calls / 60,194 triangles / two lights at the mobile-sized viewport. Desktop calls exceed the target of 60; software frame times also remain over target. This fix changes only the landing coordinate and does not optimize the source house. Original 0.0.8 scene/F-station verification above remains historical evidence; its claim of 64 unchanged runtime files predates this single recorded patch.

`./dev/browser.sh tests/pool.cjs --baseline` uses a browser-only override to restore the original landing value. It reproduces the ladder rejection and verifies a temporary workaround for older releases: swim left away from the ladder, then approach the normal north coping. No source/deployment rollback is performed by this negative control.

The user-authorized deployment of 0.0.9-dev on 2026-11-10 is recorded in STATUS.md, including the prior-theme backup and public HTTP verification. This source guide update does not rebuild or change the previously supplied ZIP.

## In-scene reading (0.0.10-dev)
The top “场景内阅读” action and article/list links inside scene cards open a compact browser using native Typecho documents. It includes Back, Forward, Reload, All posts, a new-tab link and the existing close control. Search, comments and password forms remain native; Escape works from the child document. The scene image stays in the background with drawing/movement suspended until the window closes. The ordinary direct-reading link remains available. See SCENE-BROWSER.md and STATUS.md for implementation and verification.

## Browser stability follow-up (0.0.11-dev)
The full architecture stays available with lower default DPR/pixel/shadow budgets and a 30 Hz scene cap. Native in-scene reading suspends scene calculations as well as drawing. A running-page WebGL context loss now stops the scene and leaves native text/archive navigation. These changes are recorded engine patches; the earlier pool section's sole-patch description is historical. See UPSTREAM.md and STATUS.md for evidence and limitations. Reduced resource budgets do not establish draw-call/FPS compliance or a cure for an unreproduced browser process exit.

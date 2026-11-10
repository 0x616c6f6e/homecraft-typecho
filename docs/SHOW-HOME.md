# Reference Show-home Scene (0.0.8-dev)

The default scene now reuses the official Homecraft `examples/terry-home/world/` implementation at revision df8033aab87569d2779e1c2f74564183527282f7. It includes the glass-fronted house, loft/stairs, basketball court, gym furnishings, desk/lounge, garage/car, kitchen/coffee counter, pool/ladder, roof access, forest, mountain paths, pier and sailboat. This is the pinned source example, not a guarantee of pixel identity with a subsequently updated live website.

Twelve example modules live under world/show-home. SHOW-HOME-FILES.json records original/adapted SHA-256 values. The main engine, original starter and vendor inventory remain unchanged. MIT attribution is preserved in LICENSE and UPSTREAM.md. Personal skin, biography, contacts, mailbox backend and project promotions are not imported. Name/initials in decorative art are neutralized; certificate imagery becomes generic symbols. The architectural positions, furniture and construction logic remain the example's own.

## Use
Reload the development homepage (Ctrl+F5 if necessary). Approach a station until the bottom-right prompt appears, then press F. Esc closes the panel; while reading a panel, world shortcuts remain guarded by the native engine. Movement, jumping, flight and touch controls remain the original engine's. The prompt can also be tapped/clicked; physical mobile touch was not tested in this pass.

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

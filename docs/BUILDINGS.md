# Starter Village Scenery (0.0.7-dev)

The selectable village preset includes three permanent voxel buildings: a timber cottage with a stepped roof/chimney, a stone-and-timber library with bookshelves/desk, and a small crenellated watchtower. Paved paths connect the ground-floor entrances to the central spawn area. Doors are open two-block-wide, three-block-high passages; glazing and walls remain collidable. Tower upper levels have no staircase; flight can land on roof standing surfaces.

`js/world-build.js` wraps the unchanged starter build through the exact `@world/build.js` import-map entry. `js/village.js` places blocks in the engine's native VoxelGrid using the existing texture atlas and meshing. A native ground source supplies roof surfaces. No external models, textures, point lights, CMS routes or upstream runtime edits are added. The original spawn, tree and southern portal/mailbox positions remain clear. Reading routes do not import this module.

## Verified
Select the village preset in native theme settings before running `./dev/browser.sh tests/buildings.cjs`. This suite previously passed desktop root (1280×844) and mobile-sized subdirectory (390×844) Chromium scenarios in the isolated sites. For all three buildings it checks actual native wall collision movement, clear entrances, interior/entrance standing positions and paths from spawn. Spawn/portal access, tower roof standing height, scene blog-panel links, startup and absence of HTTP/page errors passed. Desktop and mobile-sized screenshots were generated; the desktop view was inspected.

Both overview and street samples reported 17 draw calls, 14,584 triangles and zero real-time point lights, below the existing 60-call/200,000-triangle/two-light limits. Software-rendered frame timing is not a physical-device FPS guarantee. Firefox/WebKit, physical touch controls, every interior camera angle and all roof edges were not tested in this pass. There is no dynamic building editor, room-specific UI or interior cutaway feature.

Header PHP syntax, diff whitespace and all 64 pinned upstream hashes passed. A 0.0.7-dev ZIP was built; ZIP CRC, the packaged build alias, both new modules and every packaged static checksum were independently verified. Package tests now derive the synthetic upgrade version from the current version instead of fixing it to 0.0.6.

The existing loopback development sites preview these buildings without rebuilding Docker. Reload the page to fetch the updated import map/modules. The earlier 0.0.6 ZIP does not contain the buildings; use the new 0.0.7 development package when installing elsewhere. No production site, native content, remote Git state or existing theme settings was changed. This scenery pass is recorded in local Git commits.

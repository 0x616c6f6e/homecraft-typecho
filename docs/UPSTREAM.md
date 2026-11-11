# Imported Upstream

- Repository: https://github.com/terryHu7/homecraft
- Revision: `df8033aab87569d2779e1c2f74564183527282f7`
- Engine manifest version: `0.1.1`
- Preset: upstream starter island, selected for the isolated Phase 1 proof of concept. This does not decide the final visual design.
- Imported unchanged: `theme/engine/`, `theme/world/`, `theme/vendor/`, `theme/assets/` and `theme/LICENSE`.
- SHA-256 inventory: `UPSTREAM-FILES.json` (paths relative to `theme/`).
- Three.js license retained at `theme/vendor/three/LICENSE`; Homecraft MIT notice retained at `theme/LICENSE`.

No upstream engine, world or vendor source modifications were made for this proof of concept. Typecho templates, CSS overrides and JavaScript integration live alongside them. The upstream `index.html` is reference markup, adapted through the new PHP scene template. The static `home.config.js` is replaced by an import-map adapter to safe per-request configuration. Author showcase content is not used as this site's identity. Engine-distributed credits remain intact.

The local upstream clone under ignored `work/frontend/upstream/` is only an analysis reference. Future upgrades must compare this recorded revision and inventory, preserve notices and isolate integration changes.

Packaged development releases relocate static runtime directories together under `static/<assetId>/`. Source checkout paths above remain unchanged. The packaging test verifies original hashes except for explicitly recorded local patches, whose local hashes are also enforced (the MIT LICENSE stays at package root). Retained older graphs are verified against their release manifests.

## Show-home architecture
The owner's request to reproduce the reference architecture selects the upstream `examples/terry-home/world/` scene at the same pinned revision `df8033aab87569d2779e1c2f74564183527282f7`. Twelve modules are imported under `theme/world/show-home/`; original and adapted hashes are in SHOW-HOME-FILES.json. Homecraft's MIT notice and author attribution remain. The original inventory is retained; the subsequent pool fix below is recorded separately.

The building shell, pool, court, loft/stairs, garage, furniture, exterior stairs, mountain and pier reuse the example implementation. paint.js substitutes neutral HOME/HC labels; furnish.js substitutes generic symbol art for certificate imagery. The original person's skin, biography, contacts, mailbox service and project links are not copied. Thin JS wrappers map the work desk to native post summaries and keep mailbox visibility conditional on a Typecho guestbook. See SHOW-HOME.md for tested interaction scope.

## Recorded engine fix (0.0.9-dev)
The reported pool-ladder trap requires one local change in `engine/world/player.js`: move the ladder's landing from 0.9 to 1.2 metres north of the pool. The original 25 cm navigation grid rounds the ladder footprint outward, and the 0.28 m player radius overlaps that footprint at the former landing. Native `exitAt()` therefore rejects it and swimming never transitions into the climb. Moving the landing clears the footprint without removing collision checks or changing geometry.

`UPSTREAM-FILES.json` and the engine-generated `engine/manifest.json` remain the unedited pinned baseline. `UPSTREAM-PATCHES.json` records the original/local SHA-256 and reason for the single engine patch. The builder checks the baseline revision and original hash before enforcing the local hash; unrecorded changes and edits to the recorded patch are still rejected. The other 63 inventoried files and all 12 adapted example hashes remain unchanged.

## Recorded stability mitigation (0.0.11-dev)
A visitor reported intermittent browser process exits in the desktop app's browser and standalone Chrome/Edge, without an error code. The local software-GPU browser did not reproduce a process exit in 30 reader cycles; stable post-GC heap/texture/geometry counts do not prove physical-device stability or exclude driver/process memory faults.

Two further runtime patches address confirmed workload/recovery gaps. They live in the engine because renderer quality is selected before world creation and the animation-loop state is private; a wrapper cannot stop physics/weather/TV/minimap updates or reliably stop the native loop after context loss.
- `engine/world/stage.js`: cap DPR at 1, drawing pixels at 1.5 million desktop / 0.8 million mobile, and shadow-map sides at 1024 / 512. Compared with the old maximum 3.2 million / 1.2 million pixels and 2048 / 1024 shadows, these reduce allocation/work while retaining the house and interactions.
- `engine/main.js`: limit the existing single scene loop to at most 30 Hz; skip all world work during native article-reader display. On WebGL context loss, stop the loop, close the reader, dispose the renderer, remove the public live-scene handle and signal the integration to expose native reading links. Do not automatically recreate a renderer or reload into repeated failure.

This is a mitigation, not an established explanation of the user's whole-browser exit. A killed browser process cannot execute the fallback; the handler covers context loss only while the JavaScript process remains alive. The original inventory and generated manifest are unchanged. Three patches (player/main/stage) now have enforced original/local hashes; 61 other inventoried modules and all 12 adapted example files are unchanged.

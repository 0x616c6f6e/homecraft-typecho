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

Packaged development releases relocate static runtime directories together under `static/<assetId>/`. Source checkout paths above remain unchanged, and the packaging test verifies every upstream inventoried byte at its packaged location (the MIT LICENSE stays at package root). The separate immutable graph includes integration modules without rewriting engine/world/vendor source. Retained older graphs are verified against their release manifests.

## Show-home architecture
The owner's request to reproduce the reference architecture selects the upstream `examples/terry-home/world/` scene at the same pinned revision `df8033aab87569d2779e1c2f74564183527282f7`. Twelve modules are imported under `theme/world/show-home/`; original and adapted hashes are in SHOW-HOME-FILES.json. Homecraft's MIT notice and author attribution remain. Main engine/starter/vendor files and their original inventory are unchanged.

The building shell, pool, court, loft/stairs, garage, furniture, exterior stairs, mountain and pier reuse the example implementation. paint.js substitutes neutral HOME/HC labels; furnish.js substitutes generic symbol art for certificate imagery. The original person's skin, biography, contacts, mailbox service and project links are not copied. Thin JS wrappers map the work desk to native post summaries and keep mailbox visibility conditional on a Typecho guestbook. See SHOW-HOME.md for tested interaction scope.

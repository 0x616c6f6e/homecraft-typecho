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

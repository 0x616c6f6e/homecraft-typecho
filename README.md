# Homecraft Typecho Theme

A development Typecho theme migration of [Homecraft](https://github.com/terryHu7/homecraft), combining a 3D homepage with Typecho-managed blog content.

JavaScript is the primary stack. PHP is limited to Typecho integration, including theme templates, native data access, settings and comments.

The development theme under `theme/` includes a 3D homepage, public recent-post cards, native blog discovery/comments and responsive reading. Native settings configure identity, skin, language, weather, links and page mappings. Phase 6 adds deterministic packaging and content-addressed assets with isolated lifecycle tests. Full production release acceptance remains incomplete.

- Shared AI instructions: `AGENTS.md`
- Product requirements and acceptance matrix: `docs/REQUIREMENTS.md`
- Migration scope and acceptance criteria: `docs/MIGRATION.md`
- Selected integration and bootstrap contract: `docs/INTEGRATION.md`
- Native content design and test commands: `docs/CONTENT-INTEGRATION.md`
- Installation, upgrades and rollback: `docs/INSTALLATION.md`
- Phase 6 package/lifecycle validation: `docs/PHASE6-REPORT.md`
- Reading and comments: `docs/READING-COMMENTS.md`
- Phase 5 validation: `docs/PHASE5-REPORT.md`
- Theme configuration: `docs/SETTINGS.md`
- Phase 4 settings verification: `docs/PHASE4-REPORT.md`
- Phase 3 content/visibility verification: `docs/PHASE3-REPORT.md`
- Phase 2 skeleton verification: `docs/PHASE2-REPORT.md`
- Phase 1 verification and known gaps: `docs/PHASE1-REPORT.md`
- Local test environment: `docs/TEST-ENVIRONMENT.md`
- Verified progress and handoff: `docs/STATUS.md`
- AI entry points: `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/homecraft-typecho.mdc`

Upstream code and license notices are imported together at the revision recorded in `docs/UPSTREAM.md`.

## Local proof of concept

```sh
./dev/run.sh up -d
./dev/run.sh ps
./dev/browser.sh tests/phase1.cjs
./dev/run.sh down
```

The test instance binds only to `http://127.0.0.1:18094/`. When accessing this remote server from your computer, use an SSH tunnel such as `ssh -L 18094:127.0.0.1:18094 ubuntu@SERVER`, then open that local address. Read the environment guide before recreating volumes. Synthetic development credentials and browser outputs live under ignored `work/`.

For subdirectory verification, start `./dev/run-subdirectory.sh up -d` alongside the root instance and run `./dev/browser.sh tests/phase2.cjs`. The subdirectory URL is `http://127.0.0.1:18095/journal/`. See the environment guide for isolation and teardown details.

## Development package
Run `./dev/package.sh` to create a reproducible theme ZIP and SHA-256 sidecar under ignored `dist/`. Read `docs/INSTALLATION.md` before installing it. `./dev/release-test.sh` verifies packaging and native lifecycle behavior on two additional disposable loopback sites, then removes its own test containers/volumes. It does not deploy to an existing blog.

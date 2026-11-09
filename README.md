# Homecraft Typecho Theme

A planned Typecho theme migration of [Homecraft](https://github.com/terryHu7/homecraft), combining a 3D homepage with Typecho-managed blog content.

JavaScript is the primary stack. PHP is limited to Typecho integration, including theme templates, native data access, settings and comments.

Phase 2 provides a reusable theme skeleton under `theme/`, a validated JavaScript integration layer, and isolated root/subdirectory Typecho environments. Full blog features, settings and comments are still in development; this is not a production-ready release.

- Shared AI instructions: `AGENTS.md`
- Product requirements and acceptance matrix: `docs/REQUIREMENTS.md`
- Migration scope and acceptance criteria: `docs/MIGRATION.md`
- Selected integration and bootstrap contract: `docs/INTEGRATION.md`
- Phase 2 skeleton verification: `docs/PHASE2-REPORT.md`
- Phase 1 verification and known gaps: `docs/PHASE1-REPORT.md`
- Local test environment: `docs/TEST-ENVIRONMENT.md`
- Verified progress and handoff: `docs/STATUS.md`
- AI entry points: `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/homecraft-typecho.mdc`

Upstream code and license notices will be imported together at a recorded revision during implementation.

## Local proof of concept

```sh
./dev/run.sh up -d
./dev/run.sh ps
./dev/browser.sh tests/phase1.cjs
./dev/run.sh down
```

The test instance binds only to `http://127.0.0.1:18094/`. When accessing this remote server from your computer, use an SSH tunnel such as `ssh -L 18094:127.0.0.1:18094 ubuntu@SERVER`, then open that local address. Read the environment guide before recreating volumes. Synthetic development credentials and browser outputs live under ignored `work/`.

For subdirectory verification, start `./dev/run-subdirectory.sh up -d` alongside the root instance and run `./dev/browser.sh tests/phase2.cjs`. The subdirectory URL is `http://127.0.0.1:18095/journal/`. See the environment guide for isolation and teardown details.

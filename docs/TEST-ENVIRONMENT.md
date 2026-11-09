# Isolated Typecho development environment

This environment is exclusively for migration development. It does not mount, inspect or modify production databases, credentials, themes or container configuration. Its SQLite database contains installer demonstration data replaced with synthetic fixtures. Starting the environment reselects the development theme and resets the two fixture texts; do not use it for real publishing.

## Start and stop

Run from the repository root:

```sh
./dev/run.sh up -d
./dev/run.sh ps
curl -I http://127.0.0.1:18094/admin/login.php
./dev/run.sh down
```

The theme must exist at `theme/index.php` for the homepage to render. It is mounted read-only at `/app/usr/themes/homecraft-typecho`; edits on the host are visible immediately. `dev/run.sh` uses noninteractive sudo only if ordinary Docker access is unavailable. It creates a random test administrator password in ignored `work/testenv/admin-password` with restrictive permissions. The test username is `theme-dev`. Read the password locally only when needed; never add it to documentation, screenshots or Git.

- Local URL: `http://127.0.0.1:18094/`
- Compose project: `homecraft-theme-dev`
- Container: `homecraft-theme-dev-typecho-1`
- Independent network: `homecraft-theme-dev_theme-dev`
- Independent application/SQLite volume: `homecraft-theme-dev_app`
- No automatic restart policy and no public interface binding.
- No host Docker socket, production mounts or external database connection inside the container.

To discard only this environment's synthetic data, run `./dev/run.sh down -v`. This deletes the development volume. A subsequent `up -d` installs from scratch. Retain or remove the ignored password file according to whether test login reuse is desired.

## Reproducibility and recorded versions

Verified on 2026-11-09:

| Component | Recorded value |
| --- | --- |
| Typecho | `1.3.0` from `Typecho\Common::VERSION` inside the isolated instance |
| PHP | `8.2.30` |
| Image | `joyqi/typecho@sha256:657d44a8b20263095b5136562edfc6e4ec4f48ea1296337d4c16b48fabc12558` |
| Source image tag, reference only | `nightly-php8.2-apache`; Compose uses the digest, not this moving tag |
| Database | PHP PDO SQLite; `/app/usr/theme-dev.db` in the independent volume |
| Permalinks | Native query-string mode, `rewrite=0` |
| Plugins | No third-party plugins installed in the test instance |

`dev/start.sh` invokes the image's native CLI installer, whose potentially sensitive output stays in private `/tmp/theme-dev-install.log` inside the container. `dev/seed.php` selects the theme and replaces installer demonstration content with synthetic text. It does not modify Typecho core. The server timezone is explicitly Asia/Shanghai.

Recheck versions:

```sh
./dev/run.sh exec -T typecho php -r 'require "/app/config.inc.php"; echo "Typecho ",Typecho\Common::VERSION,"; PHP ",PHP_VERSION,"\n";'
```

## Browser validation

The host has no Node.js or Chromium installation. `dev/browser.sh` runs a disposable official Playwright container with host networking, without publishing any port. It mounts only the supplied test script read-only and `work/testenv/browser-results` at `/results` for outputs; by default it does not mount the entire repository or password file. Phase 3 authenticated tests can explicitly opt into a read-only mount of the synthetic development password using `HC_TEST_AUTH=1`. The pinned image is `mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a` (v1.56.1-noble), with the matching `playwright@1.56.1` npm package installed inside the disposable container. npm access is required for each invocation.

```sh
./dev/browser.sh tests/phase1.cjs
```

The CommonJS test can `require('playwright')`, visit `http://127.0.0.1:18094/` and write screenshots/reports to `/results`. Software-rendered headless Chromium works with launch arguments `--no-sandbox`, `--use-gl=angle`, `--use-angle=swiftshader`, and `--enable-unsafe-swiftshader`. This validates functionality with software WebGL; it does not establish hardware GPU performance. A smoke run actually returned HTTP 200 for the native administrator login page and created a WebGL2 context.

Browser tests must record page errors, failed requests, HTTP errors and whether WebGL actually created a context. A canvas by itself is insufficient evidence of scene startup. Desktop and mobile, non-WebGL behavior, subdirectory and rewritten URL coverage remain separate checks, not implied by a successful homepage response.

## Initial checks

- Query-string reading index configured through native `frontPage=page:<synthetic CID>`, `frontArchive=1`, `archivePattern=/blog` options.
- Native installer succeeded with independent SQLite data.
- Administrator login route returned HTTP 200.
- Actual Typecho/PHP versions were read from the isolated instance.
- A native synthetic page with slug `scene-home` and template `scene.php` is created idempotently; it does not replace the installer About page. The native page is selected as the front page. The earlier `file:scene.php` approach was rejected because Typecho returns before normal Archive/feed initialization, causing `header()` to fail. Homepage/browser acceptance is recorded by the integration coordinator after the native-page fix.
- Production compatibility, production plugin inventory and deployment are not part of these checks.

Final integration results are recorded in `PHASE1-REPORT.md`; the initial smoke check above is not the complete acceptance report.

## Subdirectory instance (Phase 2)

```sh
./dev/run-subdirectory.sh up -d
./dev/run-subdirectory.sh ps
./dev/browser.sh tests/phase2.cjs
./dev/run-subdirectory.sh down
```

This independent Compose project (`homecraft-theme-subdir`) serves `http://127.0.0.1:18095/journal/` using the same pinned Typecho image and separate SQLite/application volume/network. It uses only synthetic data and a read-only theme mount. The disposable container configures an Apache Alias and prefix-aware rewrite target; it does not change the host reverse proxy or production site. Both instances must be running for the Phase 2 test. An SSH tunnel uses `-L 18095:127.0.0.1:18095` to access this instance from another computer.

Theme skeleton tests are in `PHASE2-REPORT.md`. For adapter output safety checks run `./dev/run.sh exec -T typecho php < tests/adapter.php`. To discard this instance's synthetic data only, use `./dev/run-subdirectory.sh down -v`.

## Phase 3 native-content fixtures

See `CONTENT-INTEGRATION.md` for the complete fixture and query/rewritten-mode test commands. `dev/seed-content.php` creates richer synthetic content and sets five-post pagination; it leaves normal Typecho authoring and access control in place. `tests/phase3.cjs` uses real login, password-unlock and draft/publish/private actions. Authenticated tests explicitly opt in to a transient read-only mount of the generated test administrator password; no cookies or passwords are stored in versioned reports.

Both instances are restored to `rewrite=0` after the Phase 3 matrix. Native lifecycle-test articles end private. The original demonstration post remains present but is older than fixture articles; Phase 1/2 smoke tests use its known native fixture permalink rather than assuming it is the first list entry.

## Phase 4 settings fixtures
Run `./dev/run.sh exec -T typecho php /dev-tools/seed-settings.php` and the equivalent `run-subdirectory.sh` command to create synthetic eligible/ineligible pages. Then run `HC_TEST_AUTH=1 ./dev/browser.sh tests/phase4.cjs query` (or `rewritten` after switching both isolated sites with the permalink helper). The mode argument labels the report; it does not change the sites. The suite edits native settings and page visibility/comment flags and deletes its synthetic about page. It restores original theme options in finally; reseed settings pages before another run. It uses the existing opt-in read-only credential mount and must never target production. Results are ignored under work/testenv/browser-results. Pure settings validation runs with `./dev/run.sh exec -T typecho php < tests/settings.php`.

## Phase 5 reading and comments
`dev/seed-reading.php` creates only synthetic reading/protected pages and synthetic comment rows in the isolated SQLite sites. It removes comments only on those fixture pages before a rerun. It temporarily enables moderation, threading, anti-spam, required email and small comment pages, while disabling rate limiting/automatic closure for deterministic tests. Original values are retained in `/tmp/homecraft-phase5-options.json` in each disposable container until `--restore` runs. Restore before restarting/removing the container; do not use this helper against a real blog.

```sh
./dev/run.sh exec -T typecho php /dev-tools/seed-reading.php
./dev/run-subdirectory.sh exec -T typecho php /dev-tools/seed-reading.php
HC_TEST_AUTH=1 ./dev/browser.sh tests/phase5.cjs query
# For rewritten coverage, reseed fixtures and switch both sites with permalink-mode.php 1 first.
HC_TEST_AUTH=1 ./dev/browser.sh tests/phase5.cjs rewritten
./dev/run.sh exec -T typecho php /dev-tools/seed-reading.php --restore
./dev/run-subdirectory.sh exec -T typecho php /dev-tools/seed-reading.php --restore
./dev/run.sh exec -T typecho php /dev-tools/permalink-mode.php 0
./dev/run-subdirectory.sh exec -T typecho php /dev-tools/permalink-mode.php 0
```

The mode argument labels/asserts the current mode; it does not switch it. Tests use native administrative moderation and page edits, temporarily close/reopen a synthetic page, submit synthetic visitor replies and signed-in comments to synthetic posts, and verify anonymous isolation. Account credentials use the existing opt-in secret mount and are redacted from test errors. Only loopback test sites are targeted. A failed run also needs the restore commands above. Synthetic approved/pending comments remain in the development database, never in Git.

## Phase 6 packaged lifecycle
Run `./dev/release-test.sh` for a fresh disposable installation matrix. It runs `python3 tests/package.py`, creates only the `homecraft-release-test` Compose project with loopback ports 18096 (root/query) and 18097 (journal/rewritten), and runs `tests/phase6.cjs` against actual extracted packages. Native administrator workflows activate the theme, publish/configure a scene page, submit a comment, restore Reading settings and switch to the default theme. A changed JavaScript fixture represents an upgrade; old/new asset graphs are retained across atomic symlink switches. These fixtures are not distributable releases. A host-side watcher reloads only the two test Apache/PHP services after each switch and acknowledges completion through the ignored workspace; no Docker socket or server-control API is mounted into the browser. Foreground tabs are used for startup assertions because hidden-document rendering may pause.

The runner resets and removes only its own synthetic containers/volumes on start/exit; existing Phase 1–5 sites and production services are outside that project. It temporarily enables Apache mod_headers only inside these release-test containers. `HC_TEST_RELEASE=1` opts the browser runner into a read/write mount of ignored work/release-test for switching the active fixture symlink. Credentials retain the existing opt-in secret mount. Package fixtures, reports and all databases stay ignored. Final browser JSON/screenshots are under work/testenv/browser-results/phase6*. For manual debugging, use `HC_DEV_COMPOSE_FILE=dev/release.compose.yaml ./dev/run.sh ...`; those services intentionally do not run the normal development seed.

Run `./dev/package.sh` independently to build the current development ZIP and checksum into ignored dist/. The builder and archive checks require Docker plus Python 3 for the host-side test; there are no npm build dependencies. See INSTALLATION.md for cache and retention requirements. Never run the release-test reset commands against another Compose project.

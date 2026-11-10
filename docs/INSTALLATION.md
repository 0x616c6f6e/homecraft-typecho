# Installation, Upgrade and Rollback

## Development release scope
The current package is a development candidate, not a production-approved release. Verified runtime: Typecho 1.3.0 / PHP 8.2.30, no additional plugins. Test in a separate Typecho instance first. Back up the database, uploads, existing theme directory and Reading/theme settings before deployment. Do not include those backups in this repository or theme ZIP.

## Build and verify
Run `./dev/package.sh` from the repository; it uses the pinned existing development container and requires no npm dependencies. Output is under ignored `dist/`: a ZIP and SHA-256 sidecar. Run `sha256sum -c homecraft-typecho-<version>.zip.sha256` in that directory, then extract the ZIP outside the live theme directory. The single top-level directory is `homecraft-typecho/`; it contains PHP adapters, licenses/docs, release.json and a complete static/<assetId>/ tree. Verify archive checksums before changing the server. SHA-256 establishes integrity against the supplied file, not publisher authentication.

Source checkouts use ordinary asset paths for development. Packages use an additive bootstrap `urls.assetBase` pointing to a content-addressed directory. All ES modules, relative imports, import-map targets, CSS and bundled media use that graph. The engine/world/vendor files are copied unchanged into it with original license notices. The builder preserves stable ZIP order, timestamps and file modes for reproducibility within the pinned build runtime.

## Native activation
1. Copy the extracted `homecraft-typecho/` into Typecho `usr/themes/`, preserving readable file permissions. Keep the theme directory name unchanged. Never copy `dev/`, tests, credentials or databases into the web theme.
2. In native Appearance, enable Homecraft Typecho. Ordinary blog/reading routes work before a scene page is configured.
3. Create and publish a page, select the custom Homecraft 3D homepage (`scene.php`) template, and disable comments on that scene page.
4. In native Settings → Reading select that published page as the front page, enable the independent article archive, and choose a collision-free archive slug (the tests use `/blog`). Use a page homepage, not a direct file homepage.
5. Configure identity, optional public page mappings and media through native Appearance → Configure theme. See SETTINGS.md. Guestbook comments use a normal native page with comments enabled. Discussion settings, moderation and anti-spam remain native Typecho settings.
6. Check scene startup, direct article access, search, comments, protected content and subdirectory URLs before accepting the installation. An unset scene page leaves a conventional blog rather than enabling 3D automatically.

When migrating from Handsome, review its companion plugin before using the native editors. The inspected 9.2.1 plugin registers both page/post rich-editor hooks and builds some editor asset URLs from the currently active theme URL. With Homecraft active, those requests point to absent Handsome assets. Homecraft does not bundle those assets or disable other plugins automatically. Use native plugin management to disable an obsolete theme companion when appropriate; preserve its files/settings for rollback. This resource-path conflict is confirmed, but a reported completely blank editor page still requires authenticated browser diagnostics to establish its full cause.

## Cache policy
Theme-generated HTML sends `Cache-Control: private, no-store` because it contains request-specific configuration and native form tokens. Exclude all Typecho HTML, feedback/action/admin routes and authenticated traffic from reverse-proxy full-page caching; do not override this header. Purge any previously cached HTML when installing/upgrading. No service worker is installed.

Each packaged immutable tree contains an Apache `.htaccess` header rule (`public, max-age=31536000, immutable`) guarded by mod_headers. Apache must permit the directive and enable mod_headers. Without that module the file remains readable but the header is not applied. Configure Nginx/CDN equivalents yourself: apply long caching only to `/usr/themes/homecraft-typecho/static/<64-hex>/...`, retain correct JavaScript/CSS MIME types, and preserve query strings. HTML must stay uncached. Server/cache settings outside the isolated test instances are not changed by these tools.

## Upgrade and rollback
Stage complete releases outside the active directory. Preserve every immutable asset directory still referenced by an open page or browser cache; do not overwrite files within an existing hash directory. The builder supports `--retain /path/to/previous/homecraft-typecho` (paths inside `/repo` when using dev/package.sh). It verifies retained static files against the previous manifest and copies them into the new ZIP. This also works for a rollback package built from the previous source with the newer extracted package retained. Check free disk space; retaining history increases package size.

Switch the complete theme directory atomically (for example, a symlink to a fully extracted staged release when supported by the host). Avoid extracting over a live tree. Keep prior PHP/templates, release.json and the matching asset graph together; reload the PHP worker processes after the switch to clear OPcache and realpath caches. The tested Apache/PHP environment continued resolving old PHP paths without that reload; an atomic filesystem switch alone was insufficient. Use the appropriate PHP-FPM/Apache reload procedure for your host. Reload and verify a fresh page, then navigate from a page opened before the switch. Changes to dynamic PHP behavior may require additional compatibility testing; retaining assets alone is not database migration support.

For rollback, stage the previous complete theme with all still-needed newer static directories retained, then atomically select it. Restore previous theme settings only when required, using the recorded backup; do not blindly restore an old database over new comments/posts. No schema migrations are introduced by this theme. Keep backups until verification is complete. Asset pruning requires a separately chosen retention window; do not remove retained trees during an active upgrade.

## Switching to another theme
Record the prior Reading choices and export/record theme configuration: Typecho 1.3 deletes the old theme option row when switching themes. Before disabling this theme, restore a native recent-post homepage or a valid page supported by the replacement theme, and restore/remove the front archive route as appropriate. Then activate the replacement through native Appearance. Keep posts/pages/comments and uploads; do not delete content to switch themes. Verify the normal homepage and direct content links. Re-enabling Homecraft requires selecting the scene template/page again if the replacement changed it.

## Evidence and remaining scope
See PHASE6-REPORT.md for actual package/install/upgrade/rollback checks. Cross-browser/physical-device performance, plugin compatibility and production infrastructure acceptance remain separate. Public cross-site portal metadata remains deferred. Production activation and remote publication require explicit authorization.

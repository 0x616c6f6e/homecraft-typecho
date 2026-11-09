# Phase 5 Verification Report

## Scope
Version 0.0.5-dev adds responsive conventional reading styles and native Typecho comments on posts/pages. Typecho retains authentication, permissions, password gates, validation, anti-spam, moderation, pagination and thread relationships. JavaScript supplies code-copy controls, keyboard-scrollable table regions and submission UI recovery. No upstream runtime/core file, production site, database schema or custom API was changed. Phase 5 is recorded in separate local implementation, test and documentation commits; no remote push was performed.

See READING-COMMENTS.md for native behavior and the Typecho 1.3 paginated reply-link adapter. Native comment-page redirects discard replyTo query parameters; the adapter retains native reply checks/handlers while sending fallback links to the native parent-content permalink. Browser tests confirmed server-generated parent selection without JavaScript. No guessed reading route or core patch is used.

## Test environment
Existing isolated Typecho 1.3.0 / PHP 8.2.30 and pinned container images; SQLite synthetic content only. Root: http://127.0.0.1:18094/. Subdirectory: http://127.0.0.1:18095/journal/. Chromium desktop 1280×844 and emulated mobile 360×844. The new test suite uses native login/moderation/page edits through the opt-in read-only development credential mount; credentials are not included in reports or source.

## New browser coverage
`HC_TEST_AUTH=1 ./dev/browser.sh tests/phase5.cjs query` and `... rewritten`: 20 checks each passed (40 total), ten per root/subdirectory per mode:

- Native approved-comment pagination and scene-free reading; wide code/tables scroll locally, images load, viewport does not overflow. Code-copy content is checked with an instrumented Clipboard API.
- Native reply/cancel preserves the draft and keyboard focus.
- Bypassed browser validation still shows the native server error. Browser Back restores fields and an enabled submission button.
- A visitor can submit a pending comment, see moderation feedback, and keep that comment hidden from an unrelated browser context.
- Native administrative approval makes the same comment public.
- Native reply submission appears under the correct parent with pending feedback.
- Password-locked content exposes neither comment bodies nor a comment form.
- Closing through native authoring removes the form, preserves approved comments and rejects submission of the previously opened form with HTTP 403; the test reopens the page afterward.
- No-JavaScript content/reply navigation remains usable with a native parent action and explicit anti-spam guidance.
- Signed-in article comments use native account identity and owner approval without visitor fields.

Successful runs had no page exceptions. Expected native validation failure (HTTP 500 in this Typecho version) and closed-submission HTTP 403 are intentional test cases, not silent network success claims. The theme does not intercept those native error pages. Root/subdirectory query screenshots under ignored work/testenv/browser-results were inspected, including the 360-pixel layout. Final JSON and screenshots use phase5-query / phase5-rewritten filenames.

## Other checks
Phase 2 skeleton regression passed 12 checks and Phase 3 query-mode content regression passed 19 checks. Combined with 40 new reading/comment checks, the final browser reports contain 71 passing checks. The content regression was rerun after a runner/output interruption; the final complete report passed. No failures remain in the final reports.

All 18 theme PHP files and the new fixture passed PHP syntax checks. Settings normalization and adapter output-boundary checks passed. Development shell syntax, diff whitespace and all 64 pinned upstream SHA-256 entries passed. Native comment options were restored from the disposable-container snapshots after testing, and both instances were restored to query-string permalinks. Synthetic comments remain only in the isolated databases.

## Limits
Firefox/WebKit, physical devices, plugin-modified comment/reply output, additional Typecho/PHP versions, automatic comment expiry and every optional native discussion setting are not verified. With native anti-spam enabled, no-JavaScript comment submission requires JavaScript; protection is not bypassed. Error recovery relies on browser Back, not persistent draft storage, and does not promise recovery after reload/browser closure. The submission safeguard prevents repeated UI events, not network-level duplicate writes. Clipboard permission/system integration is not claimed from the instrumented test. No highlighting, AJAX comments, in-scene forms or full scene lifecycle redesign is added. Release/cache/upgrade/rollback validation and packaging remain Phase 6 work. This is a development theme, not a production-ready release.

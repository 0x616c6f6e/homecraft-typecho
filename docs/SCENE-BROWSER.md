# In-scene Article Browser (0.0.10-dev)

## Behavior
After the scene is ready, use “场景内阅读” in the top navigation, or open the desk's article card and select an article/“打开文章列表”. A compact browser window displays the site's actual Typecho reading page while retaining the scene and player position. The original “直接阅读文章” link still exits to ordinary full-page reading. Ctrl/Cmd-click and JavaScript/WebGL fallback preserve native links.

The toolbar offers Back, Forward, Reload and All posts. Its address link and the native header's ↗ open the current reading URL in a new tab. The address is read-only: this is a same-site reader, not an arbitrary external-site browser. External HTTP links from embedded content open in a separate tab. A Home link closes the reader rather than booting another 3D scene in a frame.

Close with the native × button, backdrop or Escape, including Escape while focused in an embedded form. Closing removes the frame and its document listeners/loading timer, resets the window's navigation stack, restores focus and resumes drawing the scene. Switching to another scene card also disposes the reader. Opening another article starts a fresh window history.

## Native data and forms
The frame requests existing article/page/archive/search URLs. Comments/replies, password forms, cookies, authorization, moderation, anti-spam and validation all remain Typecho's. No article HTML is fetched and re-rendered by a parallel API; no PHP route, database schema, authentication mechanism or public bootstrap contract is added. Embedded reading documents use their ordinary theme assets and do not load the engine.

If a native form returns an error document, the window keeps that document visible and its Back control uses native iframe history, allowing the browser to restore editable form fields. Ordinary article navigation uses the reader's URL stack. No password, form token or draft is copied into the parent history state.

Entry points reject cross-origin URLs, credentials, non-HTTP schemes, out-of-installation paths, admin/action/theme/upload routes and common binary assets. Native form actions are deliberately not rewritten or intercepted. The frame retains the engine's existing sandbox. Same-origin scripts are the site's trusted native document scripts; this is not a security boundary against the site's own author scripts. A visible new-tab link and a loading/error status remain available if embedding is blocked or slow; browsers cannot universally diagnose frame-policy failures.

## Integration
`js/scene-browser.js` registers a hidden reader page before the engine discovers its stations. It delegates opening to the engine's public `openPage()` and uses the existing modal iframe, styles, close button and new-tab control. A toolbar, document navigation handlers and a per-window URL stack live entirely in JavaScript. Native search/password/comment form navigation commits into the same window history after load.

The modal's existing guards clear keyboard input and cancel movement. While the reader is active, a wrapper around the public WebGL renderer's `render()` retains the last scene image and skips the TV's offscreen drawing as well. From 0.0.11-dev, the existing loop also skips physics, particles, the minimap and TV updates while this reader is open. No new render loop or WebGL context is created, and the wrapper adds no per-frame allocation. After closure, rendering resumes through that same function on the next frame. Scene readiness monitoring continues after the slow-load notice so that late-starting scenes can still enable the reader.

The reader originally needed no engine source change. The 0.0.11-dev stability pass records two additional patches in UPSTREAM-PATCHES.json: the main loop now suspends reader work, caps updates at 30 Hz and stops on WebGL context loss, and the stage uses conservative pixel/shadow budgets. The 0.0.9 player patch remains intact; all other runtime/example hashes are preserved.

## Validation
Run `./dev/browser.sh tests/scene-browser.cjs query` and the same command with `rewritten` after selecting the corresponding isolated permalink mode with the existing dev helper. Restore query mode afterward. The suite uses synthetic content at the root and subdirectory sites; it exercises real links/keys and actual framed Typecho documents, including native forms. Test outcomes and any production deployment are recorded in STATUS.md. Physical touch and additional browser engines remain separate validation.

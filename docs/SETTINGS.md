# Native Theme Settings

Open Typecho Administration → Appearance → Configure theme. Settings use the native authenticated form, CSRF handling and validation; no separate dashboard or configuration endpoint is introduced.

| Setting | Behavior |
| --- | --- |
| Display name / introduction | Plain text, maximum 80 / 2000 characters; blank uses native site title / description. |
| Skin | Optional absolute HTTP(S) URL. Browser checks CORS and 64×64 dimensions with a five-second timeout; invalid/unavailable images use the default skin. PNG, at most 18 KB, is recommended; byte size and MIME are not enforced. |
| Logo / favicon | Optional absolute HTTP(S) image URLs. |
| Language | Chinese (default) or English interface labels; does not translate content or the native administrator UI. |
| Recent posts | Integer 1–20, default 10; the public-content filter applies before the limit. |
| Homepage | Scene (default), or reading. Reading redirects to the native front archive when enabled; otherwise renders the public summaries without loading the engine. |
| About page | Optional published, released, unprotected native page, excluding the scene template. |
| Guestbook page | Same eligibility, plus comments enabled. The scene opens the native page; it is not the upstream email mailbox. Comment submission UI remains Phase 5 work. |
| Social links | Optional GitHub, website and X HTTP(S) URLs. |
| Weather | Disabled by default. When enabled, requires city, valid latitude/longitude and IANA timezone; English city label is optional. Weather requests run in the browser; failure does not block the scene. |

URLs reject credentials, control characters, whitespace and non-HTTP(S) schemes. PHP does not fetch remote settings URLs. Invalid native saves are rejected atomically; corrupt stored values fall back to normalized defaults. Output uses escaped text/attributes and safely encoded JSON.

Page visibility is checked on each request. Hiding, protecting, scheduling or deleting a selected page removes its public entry; closing guestbook comments removes its station. Page bodies, comment tokens, account emails and passwords are never copied into the scene configuration. Weather coordinates and configured public links are deliberately public.

The Typecho Reading settings must still select the published custom scene page and enable a native archive as described in INTEGRATION.md. These theme options do not rewrite global Reading settings.

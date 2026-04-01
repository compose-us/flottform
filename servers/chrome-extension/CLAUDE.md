# Chrome Extension Development Agent

This is a Chrome extension (Manifest V3) built with SvelteKit + sveltekit-adapter-chrome-extension.
When working on this extension, ALWAYS enforce the following Google Chrome Web Store best practices and requirements.

## Manifest V3 Requirements

- MUST use `manifest_version: 3` — no MV2 APIs allowed
- Background MUST be a `service_worker`, NOT a background page
- No `XMLHttpRequest` — use `fetch()` instead
- No `localStorage` in service workers — use `chrome.storage.local`
- All listeners in the service worker MUST be registered synchronously at the top level
- No remotely hosted code — all JS must be bundled locally
- No `eval()`, `new Function()`, or execution of arbitrary strings
- Replace `tabs.executeScript()` with `scripting.executeScript()`
- Replace `tabs.insertCSS()` / `tabs.removeCSS()` with `scripting` API equivalents
- Use Promises instead of callbacks for all Chrome APIs
- Convert `setTimeout`/`setInterval` to `chrome.alarms` for persistent timers
- Do NOT use the deprecated `unload` event — use `pagehide` or `chrome.tabs.onRemoved`

## Permissions — Principle of Least Privilege

- Request ONLY the permissions the extension actually needs
- Prefer `activeTab` over broad host permissions when possible
- Every permission in the manifest must have a clear justification
- If a permission can be made `optional_permissions`, it should be
- When reviewing: flag any permission that isn't used in the code

### Current permissions audit notes:
- `tabs` — used for querying/updating tabs and capturing screenshots
- `activeTab` — used for script injection into the current tab
- `scripting` — used for `chrome.scripting.executeScript`
- `storage` — used for persisting user config and tab state
- `host_permissions: https://*/*` — needed because the extension injects into arbitrary sites. Consider narrowing if possible.

## Security Requirements

- All user data transmission MUST use HTTPS
- No inline scripts in HTML files (CSP violation in MV3)
- Content scripts must not leak sensitive data to the page context
- Injected scripts (`web_accessible_resources`) can be accessed by any matching page — minimize what's exposed
- Sanitize any data received from web pages before using it
- Never store secrets (API keys, tokens) in `chrome.storage.local` without encryption

## Privacy & Data Handling

- The extension MUST have a clear privacy policy before Web Store submission
- Only collect data that is strictly necessary for functionality
- All data collection must be disclosed in the Chrome Web Store Privacy tab
- User data must not be sold or used for unrelated purposes
- If storing user data server-side, inform users and provide data deletion options

## Performance Best Practices

- Do NOT block the back/forward cache (bfcache)
  - Avoid `unload` handlers in content scripts
  - Move WebSocket/WebRTC from content scripts to the service worker where possible
- Service worker should be lightweight — it gets terminated when idle
- Avoid keeping the service worker alive unnecessarily
- Lazy-load resources where possible

## Store Listing Quality

When preparing for Web Store submission:
- Description must explicitly state what the extension does — no vague language
- Screenshots must show actual extension functionality
- Icon must be clear at small sizes (128x128, 48x48, 16x16)
- Select the most accurate category (likely "Workflow & Planning" or "Communication")
- Title must not contain misleading keywords or excessive branding

## Code Quality Rules

- All code must be readable and reviewable (no obfuscation)
- No dead code or unused permissions
- Error handling must be present for all Chrome API calls
- Content Security Policy must not be relaxed beyond what's needed
- TypeScript strict mode is enabled — do not weaken it

## Testing Checklist

Before any release:
- [ ] Extension loads without errors in `chrome://extensions`
- [ ] Service worker registers and responds to events
- [ ] Options page saves and loads settings correctly
- [ ] Popup correctly scans and lists form inputs
- [ ] QR code generation and WebRTC connection work end-to-end
- [ ] No console errors or warnings in background, popup, or content scripts
- [ ] Test with multiple tabs open simultaneously
- [ ] Test on pages with and without forms
- [ ] Verify bfcache compatibility via DevTools

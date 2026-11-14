# Original Webapp Viewer and Embed Plugin — source migration

## Immutable source

- Reference: codersachin99/legacy-win7 pinned revision 4e63290d783009e1293433c6ccf252abba9c1187.
- src/modules/apps/webapp.js, blob 3cda3df47565e774bc07eb5ef04b3d3d2e8280f8, webpack 99c7. Source WindowMain is-webapp-viewer uses the supplied app's title/icon, app.target.path as iframe URL, and network-error message when offline. Width priority w, width, window.width; similarly for height; resizable false hides Maximize.
- src/modules/apps/plugin-embed.js, blob 0cf1d9501703b3d8cf527144fef2a3c5ab51fd26, webpack bcdb. Source VUE_APP_EMBED_ORIGINS is a comma-separated exact origin allowlist, empty disables plugin; outgoing ready version 4.8.0, opened, closed; incoming open with URL/title and close with web_ app ID.
- Exact original Win7 internet.b27ef7d7.webp blob 3624a2f7f9994f56a32579db8c5e49bb611cef6a copied via GitHub Base64; target Git SHA matches source.

## Reconstructed functionality

- packages/sdk/src/embed.ts: source prefix, strict origin allowlist, URL/label validation, 4.8.0 version, original shorthand/nested geometry fallback.
- packages/ui/src/SourceEmbedBridge.tsx: verifies true parent source and allowlisted exact origin; opens/focuses dynamic web_ windows in DesktopShell; emits ready, opened and closed by source app id.
- packages/apps/webapp/src/WebAppViewer.tsx: source-style iframe and offline/invalid-address message with OK close, original icon, shared WindowFrame.
- tests/e2e/embed.spec.ts and packages/sdk/src/embed.test.ts: default-disabled, validated messages, close lifecycle, unsafe command and source window controls. Playwright Vite origin allowance is test-only.

## Parity gaps and deliberate security boundaries

The original source URL regex and iframe permit more behaviors. React rejects credentials and executable schemes; close commands may only close web_ windows, not arbitrary system windows. The iframe is sandboxed without allow-same-origin. External site CSP, X-Frame-Options and these security differences can inhibit site loading. The original URL slug utility 4caf, multiple window behavior, dynamic geometry, native online probe, localization and pixel-level Win7 screenshot comparison are still pending. Original first-party Contacts remains its specialized React UI.

**Implemented-slice CI PASS**: [run #43586350903](https://github.com/codersachin99/windows-os/actions/runs/43586350903), 303 unit cases (61 files), 314 browser cases, 53 byte-exact source art audits, TypeScript and Vite build. Complete source and pixel parity still unverified; two modules in-progress, PR #1 draft, main untouched, no release.

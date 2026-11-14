# Google Chrome — pinned source migration

## Reference

- `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`, original `src/modules/apps/chrome.js` (webpack main `7839a`, settings module `90b3`).
- Source manifest program `chrome`: Chrome, Internet, installed executable `Program Files/Google/Chrome/Application/chrome.exe`.
- Imported original source art byte-identically: `chrome-base.d802dcaf.svg` Git blob `aa8a432ff68e4a2d7f1953b6e44222230fcdb206`, `google.d3503fb1.svg` Git blob `a971e1d7a9dbfc34674b15dadd401769d6dffd97`, and `google-mic.2a2ca1d4.svg` Git blob `05068f863ff6234e467561c0fdb5c6163439a7e6`.
- Original Win7-specific icon `chrome.0eddc17a.webp` Git blob `6134df93f5f9037bc2ed99e3fb0ee78ebf79e145` is not yet copied through available text-only source connector.

## Implementation

| Source | React |
| --- | --- |
| One blank tab with empty history | `initialChromeState` |
| Google new tab logo/mic and search form | Exact original SVG assets and functional form |
| Add, activate, close tab; last tab closes window | `ChromeState` pure model, tab strip and shell callback |
| Per-tab Back/Next history, forward truncation | `stepChromeHistory`/`pushChromeHistory` |
| Address, selected-provider search, Google iframe patch | `resolveChromeInput` validates HTTP(S), exact configured provider URLs and source internal routes |
| Reload, Home to blank tab, active title | React tab controls, iframe with load lifecycle |
| Original Chrome menu ten commands, six disabled | Ten ordered menu items, New Tab/Settings/Help/Exit enabled |
| `chrome://chrome/settings` with six providers | Internal Settings panel with source startup/appearance controls and Guest-scoped search engine persistence |
| `chrome://chrome` and `chrome://dino` | Recognized internal routes; original full About content and T-Rex game still **unported** |

## Verification and limits

- Pure unit tests cover source provider list/URLs, internal routing, unsafe schemes, tab closure, history movement, branch truncation and menu enabled/disabled state.
- Playwright desktop/mobile regressions verify blank tab, tab add/close, source menu, address navigation, reload/Home, Settings search-engine change, Guest preference persistence, and unsafe scheme rejection.
- Source URL helpers and Google search patch have been reconstructed, but their exact compiled runtime helper semantics remain to compare.
- Source local virtual PDF/HTML browser, fullscreen/browser-native integration, plugin `xframe` events, the offline T-Rex JavaScript game, exact website embedding behavior, complete error page, all themes and true pixel parity remain unimplemented or unverified.
- This is not a native Chrome installation. Browser iframe CSP and `X-Frame-Options` can prohibit remote website display. No bypass is attempted.
- **Full opt-in CI #43577115840 SUCCESS** at commit `ac1bc402`: 289/289 Vitest across 57 files, 294/294 desktop/mobile Playwright, 43/43 source-art audits, TypeScript, Contacts and Vite production build. This verifies implemented Chrome features, **not** complete original feature/pixel parity. Draft PR #1 remains unmerged, `main` unchanged, no product release.

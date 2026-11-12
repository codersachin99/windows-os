# Original Windows 7 About dialog — source-to-React migration

**Pinned source:** codersachin99/legacy-win7 commit 4e63290d783009e1293433c6ccf252abba9c1187. Source files src/modules/apps/about.js (webpack component 52fa) and c170 program manifest in src/modules/system/testmode.js. The brand image is the existing byte-identical start-button-classic.ec7b0b9f.webp.

## Original window and text

WindowMain id window-about is width 520, height 400, resizable=false, centered=true. Its titlebar hides both Minimize and Maximize, has no icon, and retains Close. The dialog displays a 44x44 Windows logo, Windows registered 7 at 48px, a thin 30px Simulator suffix, an 83% horizontal divider, 16px body copy, a lower row of three links and the Credits button at lower right.

Source text preserved: WindowsOS; Version; Windows 7 Copyright © Microsoft Corporation.; Legacy Windows OS is a windows web platform to showcase and experience the legacy operating systems with core functionalities.; Privacy Policy; Changelog; Report bugs; Credits.

The source reads link destinations from window.APP_CONFIG.getUrl for five exact keys: url, privacyUrl, changelogUrl, reportIssue, creditsUrl. The original uses a "#" fallback when no URL is configured, not a valid external destination. The React adapter leaves missing/insecure destinations visibly disabled instead of inventing links. Configured HTTPS destinations use new-tab links with noopener/noreferrer; Credits uses a permissionless window.open for its configured HTTPS URL.

The original About version is imported from external webpack module 9224, not defined in the included About bundle. The target displays its own package.json version, currently 0.0.1, and does not claim this is the pinned original build version. Resolving the exact historical webpack exporter remains a fidelity task.

## Target architecture

- packages/apps/about/src/model.ts: pure APP_CONFIG link resolution with exact source keys and HTTPS validation.
- packages/apps/about/src/AboutApp.tsx / AboutApp.css: source brand, copy, links, Credits and responsive layout.
- Shared AppRegistry includes system program id about and centered 520x400 close-only window; original app is not inserted into default top-level Start programs. Source Run resolves winver, winver.exe and the installed C-drive Windows/System32/winver.exe path from the pinned c170 manifest.
- Shared window contract adds optional titlebarIcon=false while leaving the original brand icon on taskbar and retaining icons on other programs. Engine restores the same About window on repeated Run launches rather than duplicating original fixed program ID.

## Regression coverage and gaps

Model tests verify five source keys, valid configured HTTPS URLs, missing config, protocol/credential rejection, and per-link read failure. Engine unit tests verify desktop/mobile centered 520x400 geometry and singleton behavior. Chromium desktop/mobile tests verify branding/copy/brand art, close-only titlebar, link fallbacks, configured links and Credits, installed Run alias resolution, no horizontal scroll and one taskbar entry.

Visual screenshot pixel comparison remains pending; version exporter 9224 is not yet recovered; the full legacy app/theme matrix is incomplete. No product merge/release or claim of complete simulator parity.

**Status: CI VERIFIED.** [Deliberate GitHub Actions run 43273716820](https://github.com/codersachin99/windows-os/actions/runs/43273716820) passed **179 Vitest tests in 32 files**, **194 desktop/mobile Chromium browser tests**, TypeScript, pinned source/Contacts checks and production Vite build. All five new About browser scenarios passed. Original webpack 9224 version string remains unresolved (the target truthfully displays its current 0.0.1 package version), and pixel-level/themed screenshot comparison remains open.

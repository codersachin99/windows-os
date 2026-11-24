# Source WinL / WinLP shared Guest logon slice — 24 November 2026

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. React candidate: `codersachin99/windows-os` branch `feat/0001-faithful-react-foundation`.

## Source evidence

The original `app.config.json` maps both `winLS` and `winLP` to the same `winLS` boot and logon family. `src/modules/themes/logon-winl.js` (webpack module `c17d`) mounts `logon-base.is-winl` with `accountIcon="guest-win10"`, `guestIcon="guest-win10"`, `avatarSize=100`, `mainClass` for the branded 512px container, a 50×50 `start-button-winxp` brand, and original `login-winL` background. Restart/Shutdown emit source `changeView` actions; the shared source `spinner-ring` exists for delayed authentication, not the immediate Guest bridge.

`src/styles/themes/logon-winl.css` defines a **512×320** main panel with **1px** dark frame, **6px** rounding, **16px 32px 10px** inset, interior white pane, and horizontal `#4e4e4f → #a2a3a3 → #4e4e4f` gradient (reversed for RTL). The Guest image is 100px in a 4px-rounded frame, with 4px dark hover/keyboard box shadow. The source bottom power buttons use white text and a 1px dark text shadow.

## Exact original asset import

The immutable `legacy-win7/assets/images/login-winL.d27b081a.webp` has Git blob SHA **`fd22904131ad5ddb4ab5c316edbe9eb19aa01376`**. Fetched its base64 bytes from the pinned source, wrote a binary blob to the WindowsOS Git object store, and independently verified **the resulting Git SHA is identical** before referencing it in a new commit. Target: `apps/web/public/assets/images/login-winL.d27b081a.webp`. `scripts/import-source-theme-assets.py` verifies this exact SHA via group `winLS`; no guessed image or generated lookalike.

Existing byte-identical assets are reused as intended by source: `guest-win10.a110df5a.webp` and `start-button-winxp.a3485adf.webp`. Public mapping in `packages/assets/src/index.ts` now describes all three.

## React implementation / bounded coverage

`packages/ui/src/SourceWinLLogon.tsx`, `sourceWinLLogon.css` and `LogonScreen.tsx` route both variants through one shared family and preserve Guest, Restart, Shutdown, and the existing safe unavailable-authentication dialog without faking a password service. The original source 512px frame and 100px avatar are retained for desktop and **clamped only on small mobile viewports** to avoid off-screen controls. `sourceThemeShellStatus("winLS")` and `sourceThemeShellStatus("winLP")` deliberately remain `pending`, despite working logon views.

Tests: `sourceWinLLogon.test.tsx` validates source aliases, artwork mappings, screen marker and pending scope. `tests/e2e/source-winl-logon.spec.ts` exercises each alias in both desktop/mobile Chromium, checks the actual background HTTP asset, original frame dimensions/color, avatar bytes/path, available power buttons, Guest lifecycle and disabled account-auth path. The focused opt-in CI suite includes those cases. `tests/e2e/source-final-theme-catalog.spec.ts` now expects the real `winLS` renderer for both theme IDs rather than the historical Win7 fallback.

## Remaining differences

The frozen source `logon-base` account form, account selection/errors and loading spinner are not yet fully migrated. Exact screenshot-equivalent positions, typography, source responsive behavior, all shell skins and apps for WinL/WinLP, and 37-theme paired reference visual comparisons remain outstanding. No full theme completeness or pixel-perfect claim. An exact-head `[run-ci]` verification is required before accepting this slice; do not merge draft PR #1 or release until all required acceptance and visuals succeed.

# Original Windows 11 Dark source-backed shell — 20 November 2026

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. **Target:** `codersachin99/windows-os`, draft PR #1 on `feat/0001-faithful-react-foundation`.

## Exact source and asset evidence

The final source `app.config.json defaults.themeScreens.win11dark` has `{boot:"win11",logon:"win11"}`. Dark is a **distinct desktop theme**, not a new boot/login family. `src/modules/themes/theme-win11-scss.js` implements the `.win11dark` palette:

- `--theme-surface: #1c1c1c`, `--theme-surface--bright: #242424`, `--theme-surface--hover: #fff1`
- `--startmenu-bg: #242424`, `--startmenu-item--hover: #fff1`, `--text-color: #fff`
- `--border-color: #fff3`, `--border-color--bright: #fff1`, `--border-color--dim: #fff6`

The source `src/config/icons.registry.json` points `win11dark.start` to the distinct original Start button. The two source assets were retrieved as immutable Git blobs and copied to the React target with **identical Git blob SHA**:

| Source and target path under `assets/images/` | SHA1 (Git blob) | Bytes |
| --- | --- | ---: |
| `start-button-win11dark.d417814c.webp` | `13187c97beb8af8f2b0b3a7ccda25b0925868a42` | 272 |
| `win11dark.af52a1ca.webp` | `18ec99e80efb302bcdd01e86d31954daaa706b8d` | 117600 |

`scripts/import-source-theme-assets.py` now verifies both original assets in clean CI, including the exact original names and bytes.

## React migration implemented

- `packages/assets/src/index.ts` maps source Win11-dark wallpaper, Start art and shared Win11 icon family; no emoji or generated replacements. The source wallpaper is available in the explicitly verified System backgrounds gallery.
- `packages/contracts/src/sourceThemeCatalog.ts` still maps `win11dark` to the original `win11` boot/logon family. Its status is **partial**, not pixel-perfect or fully completed.
- `LogonScreen.tsx` reuses the source-backed Win11 Guest screen, power actions and original avatar, with its separate source dark background.
- `StartMenu.tsx` shares Win11's existing 12-per-page pinned tiles, all-apps, recent list, account/power, search and installed-program actions. `sourceStartMenuThemes.css` adds the exact dark source palette for search, tile hover, footer, context popup and Start surface.
- `sourceShellTheme.css` reuses the same Win11 taskbar, window and desktop geometry for the dark variant, with source `#1c1c1c`/`#242424`/`#fff` overrides.
- `sourceDesktopContextThemes.css` and `sourceExplorerContextTheme.css` give desktop, taskbar and Explorer menus the original dark family surface/text/hover palette without changing interactions.
- `PersonalizeApp` exposes a separately selectable and persisted **Windows 11 Dark** tile using the real original wallpaper.

## Verification and incomplete parity

- Updated Vitest contracts for the recognized theme, original card order and 13 distinct source wallpapers.
- Updated original-family browser contracts for `win11dark` Guest logon and exact wallpaper.
- New browser acceptance in `source-personalize-theme.spec.ts` switches from Personalize, verifies exact background/Start art, source dark taskbar/Start/window surfaces, real Notepad/Computer opening, desktop context menu, and reload/Guest persistence.
- Verify all of the above on an opt-in exact-head `[run-ci]` commit; **these changes are not verified green until that workflow completes**. Original-to-React viewport-matched screenshots are still required for pixel parity. This slice does not complete all Win11dark Explorer internals, program-specific dark palettes, or all 37 original themes.

## Related CI regression being corrected

Earlier exact-head [CI #44590124670](https://github.com/codersachin99/windows-os/actions/runs/44590124670) failed 1 Win7 mobile Explorer Send-to click after 443 focused passes; source-stacked submenu hover traversal was repaired separately. Follow-up [CI #44667190114](https://github.com/codersachin99/windows-os/actions/runs/44667190114) then passed TS, unit, source, artwork and build with 443 focused passes, but failed on a **new Win95 narrow-screen Shutdown submenu placement assertion** (expected `above`, attr empty). Diagnosis: pointer-enter already opened the submenu, subsequent clicking the same trigger reset placement to null without changing the branch, so layout-effect measurement did not rerun. `SourceWin9xStartMenu` now skips redundant reopening and never clears position merely because a hovered trigger is clicked. Revalidate the exact updated branch; do not relax or skip the tests.

**Never edit the pinned original, merge draft PR #1 or publish a release on source-incomplete and unverified pixel parity.**

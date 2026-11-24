# Source Aero Noir Guest logon — 24 November 2026 bounded port

**Frozen source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. Candidate: `codersachin99/windows-os` on `feat/0001-faithful-react-foundation`, draft PR #1, unmerged.

## Immutable source evidence

- `app.config.json` selects `defaults.themeScreens.aeroNoir.logon="aeroNoir"`, not Win7. The source entry is a separately registered logon screen and theme.
- `src/modules/themes/logon-aeronoir.js`, webpack module `089e`, mounts `logon-base.is-aeronoir` with `accountIcon="guest-win10"`, `guestIcon="guest-win10"`, `avatarSize=150`, circular avatar and original dark `aeroNoir` background. Its overlay slot mounts `background-overlay` (`bg-black/50`), its spinner slot uses `spinner-ring` at 20px, and its power footer contains **two real source image buttons**, not the Win7 shutdown dropdown. Source asset keys are `restart-kubuntu` and `shutdown-kubuntu`, with 36px graphic sizes. Restart/Shutdown emit the standard lifecycle `changeView` events.
- `src/styles/themes/logon-aeronoir.css` sets **`background-size:300%`**, `backdrop-filter:blur(10px)` on the overlay, black overlay at 50%, white text, a 150px circular Guest avatar, a muted Guest photo (opacity 0.8), a six-pixel white translucent hover ring, and 4px rounded dark gray gradient form controls. Power items are at least 90px wide and hover with a gray vertical gradient and translucent border.

## Binary imports — identical to pinned Git blobs

Three original image files were imported by fetching base64 content from the frozen repository and creating binary Git blobs in the React repository. Their resulting Git blob SHA values matched the source's exact SHA **before** committing, without image generation or remastering:

| Exact original asset path | Git blob SHA |
| --- | --- |
| `assets/images/aeroNoir.237e6377.webp` | `6ae97abb795a245c647df7f2747eba01c2d46f75` |
| `assets/images/restart-kubuntu.5c766c73.svg` | `e689418c3ff37bab7eab8605e98ae4472a6da1ad` |
| `assets/images/shutdown-kubuntu.146c3ea3.svg` | `26b83d0f3c1f88aebb691fd363544c57f1fc50af` |

Existing source-verified `guest-win10.a110df5a.webp` is reused. All three new blobs live at `apps/web/public/assets/images`, register under `sourceThemeLogonArtwork.aeroNoir` and were added to `scripts/import-source-theme-assets.py` for future checksum audits.

## Current React scope and tests

`SourceAeroNoirLogon.tsx`, `sourceAeroNoirLogon.css` and `LogonScreen.tsx` now route `aeroNoir` through its source-specific Guest and iconified power screen instead of the Win7 fallback. The source Guest sign-in launches the already supported local Guest desktop, power actions call the existing restart/shutdown lifecycle, and Other user shows an honest unavailable-authentication dialog. The source backdrop, art and button styles are transcribed and limited to this family. `sourceThemeShellStatus("aeroNoir")` deliberately remains **pending**: authentic screen geometry and the desktop/taskbar/Start/Explorer/Bin themes are not complete.

`sourceAeroNoirLogon.test.tsx` checks the correct renderer, SHA-backed art paths and pending status. `tests/e2e/source-aeronoir-logon.spec.ts` checks desktop and mobile: image HTTP availability, 300% wallpaper, black 50% overlay, 10px blur, circular 150px avatar, 36px original KDE power icons, viewport bounds, account fallback and real Guest entry. The suite is included in opt-in focused and full Playwright acceptance; `source-final-theme-catalog.spec.ts` expects an actual `aeroNoir` renderer without declaring full shell success.

## Remaining work and release gate

Original account/password/captcha backend, active error and spinner treatments, exact 37-theme pixel-parity screenshots, remaining Aero Noir desktop art/Start/context/window/Explorer/Bin controls, and responsive original positioning are not yet verified. The module tracker remains **in-progress**. Do not label entire theme complete, merge draft PR #1, touch `main`, advance pinned legacy source or release documentation-only milestones. Exact-head opt-in `[run-ci]` must pass TS/units/hash audit/Vite/focused/full browser tests before this slice is accepted. Paired original runtime screenshots still need `LEGACY_SOURCE_READ_TOKEN`.

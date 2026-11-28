# WinW original Whistler logon — 24 November 2026 bounded source port

**Immutable reference** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. Candidate `codersachin99/windows-os` draft PR #1, feature branch `feat/0001-faithful-react-foundation`.

## Frozen source evidence

The exact `app.config.json` maps the singular `winW` logon and boot family to `winW`. Source `src/modules/themes/logon-winw.js` webpack module `994d` mounts `logon-base.is-winw` with `mainClass="flex flex-col gap-6 mx-auto mt-48 w-128 h-full"`, `avatarSize=60`, `errorInPane`, `groupGuestName` and `groupLoginName`. Its main header contains the source `logowhistler` asset, "Welcome", and the instruction "To log on as a guest, click the Guest icon". The left source brand/overlay writes "Windows" vertically. A spinner-ring is available for pending auth; React's immediate Guest adapter does not invent a backend or loading state. Footer commands emit `changeView` with `Restart` and `Shutdown`; the other footer column says "To manage or change user accounts, go to Control Panel".

`src/styles/themes/logon-winw.css` establishes distinct source colors: logon background **white**, brand rail **`#295da8`**, welcome heading **orange**, instruction/account name **navy**, and muted `logowhistler` image (source opacity 30%). Source rail uses `writing-mode:sideways-lr`. Source power actions are plain underlined buttons instead of a generic Win7 circular shutdown menu. React adapts source dimensions to small browser viewports; these are bounded source-backed approximations and not yet screenshot-verified.

## Original artwork copied, not regenerated

Pinned `legacy-win7/assets/images/logowhistler.73c9045c.webp` has Git blob **`c0528d4a30f97f83400939ae891bc2ae54d863bb`**. Fetch its base64 bytes at immutable source SHA, create a binary Git blob in the target, **verify identical resulting SHA**, then commit unchanged to `apps/web/public/assets/images/logowhistler.73c9045c.webp`. `packages/assets/src/index.ts` registers the exact path; `scripts/import-source-theme-assets.py` now includes the blob in `winW` SHA verification. Existing original Guest art remains the bounded fallback (avatar hierarchy/form still unported).

## React code and regression gate

`packages/ui/src/SourceWinWLogon.tsx` and `sourceWinWLogon.css` render a real separate screen through `LogonScreen.tsx` (not Win7 fallback), with Guest session action, active Restart/Shutdown, safe unavailable-account dialog and the exact source Whistler logo path. The `sourceThemeShellStatus("winW")` contract remains **`pending`**. The source inventory and module tracker must remain **in-progress**, not implemented.

`packages/ui/src/sourceWinWLogon.test.tsx` protects the source route, art and Guest/power controls. `tests/e2e/source-winw-logon.spec.ts` checks actual desktop/mobile Chromium white canvas, blue sideways brand, original Whistler image requested over HTTP, Welcome orange, instruction navy, viewport bounds, power buttons, unavailable account dialog and Guest login. This file joins the existing opt-in focused CI suite and the full desktop/mobile browser suite; `tests/e2e/source-final-theme-catalog.spec.ts` records the new renderer while retaining pending shell scope.

## Not yet complete

Original `logon-base` password form, captcha/account errors, loading spinner exact animation, all input focus treatments, pixel-perfect size/alignment, source paired image comparison and WinW desktop/taskbar/Start/Explorer/Bin themes are **not** completed by this screen. Exact-head `[run-ci]` acceptance is still required. No merge/release or 37-theme completion claim.

# Original Windows 7 Magnifier — source-to-React migration

Pinned original repository: codersachin99/legacy-win7 at 4e63290d783009e1293433c6ccf252abba9c1187. Source files: src/modules/apps/magnifier.js (module 7682), src/styles/apps/magnifier.css, and program manifest c170 in src/modules/system/testmode.js.

## Original functional contract

- WindowMain id window-magnifier, width 260, height "auto", non-resizable. Titlebar disables Maximize but retains Minimize. Original white horizontal toolbar uses two 32px +/- command buttons, percent display, disabled Views, disabled Settings and disabled Help.
- Source scale starts at 1. Each click adds/subtracts 0.5 and clamps the result between 1 and 16. The display is Math.round(100*scale) + "%". At 1, transform and transformOrigin are cleared; above 1, scale(value) is applied with transformOrigin following cursorX/window.innerWidth*100, cursorY/window.innerHeight*100. Touch devices use the source default origin at 0% 0%. Mounted component listens for document mousemove; destroyed component unsubscribes and resets transform.
- Identical original asset Git blobs: magnifier.66b65661.webp — 59096a4827ae21e31470ac5e185721be423d5186; help.a34353ca.webp — 370310e69cbe2cce67a8a34a737b9262f1593d44.

## Modular architecture and differences

- packages/apps/magnifier/src/model.ts holds pure source range/step, percentage label, pointer/touch origin and reset transform calculations; MagnifierApp.tsx and MagnifierApp.css render the original control semantics and register a zoom callback with DesktopShell.
- SDK registers magnifier with the original fixed 260px non-resizable program ID and exact icon, explicit source executable Magnify.exe already in the c170 registry. The engine reuses one active Magnifier window for repeated Start/Run launches. The shared window contract exposes minimizable=true independently of resizable to preserve source Minimize without Maximize.
- DesktopShell transforms a shared canvas containing wallpaper, desktop icons, ordinary app windows, Sticky Notes and Start menu; it uses document mousemove to adjust the zoom origin and clears scale on component unmount or session end. Magnifier control window and taskbar stay outside that transformed canvas so users can always zoom out at 16x.

The original getDesktopContainer() DOM target is not directly reusable inside React. The canvas is an explicit source-behavior adapter: unlike full-screen host zoom it leaves the toolbar and taskbar unscaled. Original h="auto" is approximated as 86px within the common Win7 WindowFrame. These are documented fidelity gaps; pixel-by-pixel screenshots and non-default legacy themes need further acceptance work.

## Acceptance and status

Unit tests cover scale in 0.5 increments from 100% to 1600%, clamping, cursor-origin percentages, touch origin and clearing transform at 1x; the engine tests source width and Minimize/Maximize/singleton window behavior. Playwright desktop and mobile Chromium tests cover exact source assets and controls, scaling of ordinary windows and icons while taskbar remains reachable, pointer/touch origin, 16x cap, minimize/restore, close/reset and Run Magnify.exe entry.

**Status: CI verified.** Deliberate [GitHub Actions run 43268254941](https://github.com/codersachin99/windows-os/actions/runs/43268254941) passed **173 Vitest unit tests in 31 files**, **184 desktop/mobile Chromium browser tests**, TypeScript, original source/Contacts checks and production Vite build. All five new Magnifier browser scenarios passed: source icon/toolbar, zooming desktop and other windows, 16x/pointer origin, minimize/restore/reset, and Run Magnify.exe. The target desktop zoom adapter and 86px auto-height approximation are documented differences from the original. Keep main unchanged and the migration PR draft; no product release/full parity claim.

# Original Windows 10 Computer / Recycle Bin toolbar — 18 November 2026

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.

## Original source audit: NOT a full ribbon

The pinned source at `src/modules/apps/computer.js` renders **`window-menubar` with `asToolbar`**, a computed `toolbar()` whose first entry is **Organize**, and a trailing, icon-only `winui-menuitem` with a nested `winui-menu.is-view` for changing view modes. `bin.js` inherits the same Computer controls.

The original theme's generic `.ribbon__*` CSS in `src/modules/themes/theme-win10-scss.js` styles *other ribbon applications*; it is **not evidence** that Computer displays a full File/Home/Share/View ribbon. Do not introduce fake ribbon tabs. The original Organize action icon identifiers like `ribbon-cut` are icon asset names, not a ribbon container.

Source styles used by the bounded React migration:
- `theme-win10-scss.js`: `.win10 .winui-menubar` **white `#fff` background**, transparent button border, source accent hover/focus with **`#89caff`** focus border, toolbar nested menu hover **`#90c8f6`**.
- `.win10 .winui-menu`: solid **`#eee`**, 1px **`#a0a0a0`** border, flat corners, **`4px 4px 3px -2px rgba(0,0,0,.5333333333)`** shadow.
- `.win10 .window__addressbar`: horizontal **`0 6px`** padding; `window__statusbar` has black text and a **1px `rgba(0,0,0,.1333333333)`** top border.
- `.win10 .listview__header`: no border; details rows have **1px `rgba(0,0,0,.1333333333)`** dividers, and selection focus has **`#89caff`** border.
- `src/styles/apps/computer.css`: source **192px** vertical view slider; eight modes in the source's order: Extra large icons, Large icons, Medium icons, Small icons, List, Details, Tiles, Content.

## Implemented React source slices

- `packages/apps/explorer/src/ExplorerApp.tsx`: the existing **actual source View menu** `SourceViewMenu` is now used for **Win10** as well as Win7, in both Computer and Recycle Bin (no Win10 native `select` fallback). The menu has real source-mapped eight view modes, icon assets and a 0..7 vertical slider. WinXP/other themes are unchanged.
- `packages/apps/explorer/src/sourceWin10ComputerToolbar.css`: scoped original Win10 style for Computer and Bin: white Organize/toolbar background, source accent button hover/focus, original `#eee` popup skins and **`#90c8f6`** hover for toolbar menu actions, actual shared Guest navigation/selection/menu action handlers, white navigation tree, relevant details-list separators and source address/status colors.
- The implementation does **not** duplicate the Guest VFS, window lifecycle, Organize command routing, Recycle Bin safety gates, SourceViewMenu keyboard support or shared state. Selected mode still updates `ExplorerSession`, and all existing Organize buttons remain real or explicitly disabled.
- `tests/e2e/source-win10-explorer-toolbar.spec.ts`, registered in the opt-in focused Chromium desktop/mobile gate: tests actual Computer **and Bin**, absence of Win10 native View select, white toolbar, source `#eee` Organize and View panel, exact `#90c8f6` hover, eight view modes, 0..7 range slider, real Details layout, keyboard Escape and intact disabled Bin actions. Confirms WinXP retains its existing select control.

Commits: [`738934c`](https://github.com/codersachin99/windows-os/commit/738934c4afa775f66673fc9ffc030e2323073af0) (source toolbar/Explorer View) · [`4eec318`](https://github.com/codersachin99/windows-os/commit/4eec31840adfd4e1e28a7ebca7ac653a8b84cd0c) (focused desktop/mobile browser tests) · [`aa2fd1b`](https://github.com/codersachin99/windows-os/commit/aa2fd1b73f0e5dcdfa24bc1570dbae8bf254c308) (Playwright helper type fix).

## Tests and remaining work

The preceding exact-head [CI #44346504203](https://github.com/codersachin99/windows-os/actions/runs/44346504203) **passed all gates** for XP/10/11 context menus and original Win10 Bin/file lifecycle at `ee92f99`, before these toolbar commits.

This new toolbar/Explorer work **requires a new opt-in `[run-ci]` exact-head check** before claiming TypeScript, unit, browser or visual parity. No pixel-perfect claim: correct menu/window markup geometry, detailed original address breadcrumb presentation, tooltip timing, exact original theme accent personalization, remaining family screens, source screenshots, status bar content, drag interactions and whole-app parity are still pending. The existing 86 React screenshots are target-only; original private source was not available in that capture runner.

Maintain pinned source SHA, `windows-os/main` unchanged, PR #1 draft, and no release/merge until original parity verification.

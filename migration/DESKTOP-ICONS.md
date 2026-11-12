# Desktop icon movement, layout and Guest preference persistence

Source revision: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

Original source: `src/modules/system/main.js` webpack modules `c5f4` (desktop icon), `743b` (desktop settings Vuex), drag mixin at source ~42k and desktop component at source ~92k.

## Exact original behaviors traced

- Source shortcut icons use **small 50px, medium 80px, large 120px** dimensions; normal mode permits explicit, persisted `item.x`/`item.y` coordinates, and Auto Arrange displays a column-first layout instead.
- Automatic positions are computed by dividing available display height by icon height, reserving one lower row, assigning row with `index % rows`, and advancing to the next column when rows are filled. `autoIcons=false` means dragged positions take priority; the default desktop still shows the source Bin and Computer at the top of the column.
- Source `pressIcon` retains multi-selection; Ctrl/Meta toggles selection, Shift supports ranges. Dragging begins after a **4px pointer distance** and renders an `icon-ghost` offset over the original icon. The source move is clamped to the available icon area; on release, `ShortcutMove` commits the changed `x`/`y` for all selected icons. Auto Arrange disables free drag.
- Original desktop View context menu offers **Large icons, Medium icons, Small icons, Auto arrange icons, Show desktop icons** and **Refresh**. Vuex module `743b` persists icon appearance and auto-arrange settings by user.

## React migration components

- `packages/ui/src/desktopPositions.ts` is a standalone, reusable typed layout/persistence model with exactly the source `50/80/120` size map, 4px gesture threshold, column-first placement, bounding rectangle checks, group drag and non-destructive Auto Arrange. Storage is Guest-scoped browser storage under `windows-os:desktop-layout:guest:v1`, version 1, not a disguised native host file.
- `packages/ui/src/DesktopIcons.tsx` replaces the old fixed-width flex-column shell placeholder with source-shaped absolute icon coordinates. It supplies multi-select, native pointer drag and ghost feedback, group moves, source View menu controls, keyboard Select All, right-click Open/Properties (Properties explicitly disabled) and persistent updates at drag release.
- `packages/ui/src/DesktopIcons.css` adapts Win7 desktop classes and selection/drag visuals to the new component; it is imported after `windows7.css`, while the existing desktop wallpaper, orb, Start Menu, windows and taskbar stay unchanged.
- Persisted icon coordinates are not overwritten when viewport size shrinks. Only visible positions are bounded to the current viewport. Expanding the viewport restores the original user-set x/y position.
- User-selected free coordinates, icon size, Auto Arrange and visibility survive Guest reloads. The component still routes double-click through the source-derived app registry and shared window manager.

## Tests and remaining gaps

Unit tests validate exact source icon dimensions, default column fill, 4px threshold, single and grouped move, bounds, settings persistence, Auto Arrange restore, viewport shrink/expand and corrupt storage/write failure. Browser tests validate actual pointer drag and ghost, Ctrl+selection group drag, Auto Arrange, three sizes/visibility toggles, reload persistence, responsive clamping and Computer double-click launch.

**Limitations:** the legacy source supports additional desktop features including background rubber-band selection, built-in file/shortcut icon rename, file-backed user shortcuts and icon context-menu actions, desktop file drops from Explorer/host, desktop icon drag-to-Recycle-Bin, full right-click Properties, icon clipping/RTL, per-user source-shaped filesystem position persistence, exact theme family icon sizes and animation. Those need later source mapping and tests.

**Verified bounded desktop positioning slice:** [GitHub Actions 43184057406](https://github.com/codersachin99/windows-os/actions/runs/43184057406) passed TypeScript, 94 unit tests across 16 test files, source inventory and Contacts checks, production Vite build, and **66 Chromium desktop/mobile browser tests**. The original `src/modules/system/main.js` tracker stays `in-progress` because full desktop/theme parity is not reached.

## Bounded source desktop band-selection slice

The original desktop rendered `desktop__icon-band` on background drag and routed background pointer-down through `pressIcon || startBand`. React now has a separate pure viewport-safe `desktopSelection.ts` for intersection geometry and replace/Ctrl-toggle/Shift-add selection and a band gesture in `DesktopIcons.tsx`. Group drag follows selection without modifying saved coordinates until an actual icon move. See [DESKTOP-BAND.md](DESKTOP-BAND.md). Browser/unit tests added; verification pending.

## Guest Desktop files and source .lnk shortcuts

Original `main.js` webpack `6271` merges default desktop icons with user `shortcuts`, whose paths refer to source desktop files. The React `desktopFiles.ts` bridge now reads real entries from mounted `desktopPath` and the same shared VFS used by Explorer, Notepad and Recycle Bin; file changes immediately refresh the icon list. Folders open an Explorer window at the path, TXT files open Notepad, supported source JSON shortcuts launch the React app registry and unknown file types show a clear error. Right-click file Delete moves to the source-mounted Bin. See [DESKTOP-FILES.md](DESKTOP-FILES.md). User-created shortcut wizard/rename and broader file types remain pending.

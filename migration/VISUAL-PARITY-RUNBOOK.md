# Visual parity runbook — original WindowsOS versus React

Source of truth: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.
Target: `codersachin99/windows-os`, feature branch `feat/0001-faithful-react-foundation`.

## Purpose and acceptance

Functional parity is necessary but not sufficient. A passing browser test only establishes its asserted behavior. Original visual appearance must also be compared for the same viewport, theme, user, window placement and application state. Until source and destination screenshots have been captured in the same environment, **do not claim pixel equality**, even for the source-backed View/Organize menus.

A visual checkpoint becomes verified only when:
1. Both applications render their respective screenshots using a **matched** viewport and device scale factor; source revision, target commit, timing, fixture, fonts and locale are recorded.
2. All expected controls are present and functional. Do not delete or hide implemented functionality simply to force a superficial pixel match.
3. Paired source/React screenshots and a difference analysis are preserved as traceable artifacts. Record any known gaps and any excluded dynamic regions.
4. Browser interaction tests for each altered feature pass, including desktop/mobile when relevant. Release readiness additionally requires accepted product-wide functional coverage, not just these snapshots.

## Source server: local source-backed baseline

The original repository contains `start.py`, a Python HTTP server that integrates static UI assets and backend APIs; `index.html` references packaged runtime JS/CSS from the source tree. On a *separate temporary checkout* at the pinned commit, the source launch command is:

```sh
python start.py --host 127.0.0.1 --port 8099 --no-browser
```

The server initializes a local database according to `db.config.json` and may access the original app's network-backed services or cache. Do not modify the source revision or point it at production data. Confirm boot/logon, mapped assets, backend requests and Guest access in the isolated environment *before* treating a captured image as authoritative. No claim is made here that this command was exercised in CI.

For the React migration, start the Vite development server using `npm run dev` from `windows-os` (Playwright currently expects `127.0.0.1:1420`). Both apps should be opened using the same Chromium version and fixed browser profile.

## Ordered capture matrix

Use the same browser width/height (initially 1920×1080 desktop and the repository's Pixel 7 Playwright profile) and Win7 theme for both sides:

| Scene | Original location | React counterpart | What must match |
| --- | --- | --- | --- |
| Guest desktop | Win7 Guest session | Guest desktop | Wallpaper, source icons, taskbar and initial window state |
| Computer root | Computer | Computer | Address bar, toolbar, navigation pane, content area, footer |
| Computer disk | System disk | System (C:) | Breadcrumbs, icons, history and file listing |
| Organize menu | Computer Organize open | Computer Organize open | Menu order, dividers, disabled states, hover and geometry |
| View popup | Computer View open | SourceViewMenu open | Exact eight labels/icons/order, 0–7 slider, current value, popup geometry |
| Recycle Bin | Bin (empty and populated) | Bin | Hoisted Computer chrome, deleted file metadata, confirmation and Restore |
| Search results | Scoped Computer/Bin search | Instant search | Placeholder, results breadcrumb, disabled Save search, file layout |
| New folder | Writable folder | Writable folder | Toolbar, creation/rename interaction and resulting listing |

Capture with *deterministic file names and folder fixtures* in both applications, and do not compare incidental network data or clock-dependent values as though they are layout bugs.

## Current source-backed facts

- `computer.js` renders the Win7 address bar with Back/Forward, non-classic instant search, and toolbar entries driven by `toolbar()`.
- `bin.js` delegates to the Computer component with `id="bin"` and the source `trashPath`.
- `computer.js#toolbar()` includes Organize, non-classic disabled Save search when searching, New folder on a non-null non-search active path, and a right-aligned View control.
- Shared webpack module `cb81` defines exactly eight modes in this order: XL/LG/MD/SM icons, List, Details, Tiles, Content; default is Tiles.
- All **36** current imported `apps/web/public/assets/images` files were compared against the pinned source tree and had matching Git blob SHA values. The source inventory audit has an automated recheck verified by [CI 43484632290](https://github.com/codersachin99/windows-os/actions/runs/43484632290): all 36 imported images passed byte verification.

## Important known differences

The React writable filesystem root `"/"` is not identical to original Computer's null root sentinel. `New folder` therefore remains usable at React root to preserve existing document, clipboard and search workflows. The Win7 toolbar still has migration-era file operation controls. The View popup uses source exact icons and source order/default but has not been screenshot-matched for pixels or all theme variants. Do not enable destructive or metadata-corrupting Bin clipboard operations simply to satisfy visual parity.

## Next executable step

Introduce an **explicitly invoked, non-default** Playwright capture workflow for this matrix, retaining source and React screenshots as CI artifacts. Before building automated source screenshots, verify the pinned source server can run isolated, resolve bundled runtime scripts and boot Guest on the CI runner. Keep ordinary commits CI-skipped unless the head commit contains `[run-ci]`; a visual capture should likewise be opt-in rather than running on every push.

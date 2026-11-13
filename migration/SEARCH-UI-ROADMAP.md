# Legacy Windows Search surfaces — source-traced parity queue

Pinned source revision: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

The original Computer app chooses **three distinct search UI presentations** by its active theme's `explorerSearch` style. They are not interchangeable:

| Source component | Original behavior | Migration state |
| --- | --- | --- |
| `src/modules/apps/find.js` module `709f` | Separate `window-find`, width **480**, source height **auto**, non-resizable with Maximize hidden; Name & Location / Date Modified / Advanced tabs, Find Now opens `computer` at a virtual search `file.path` | First React slice at `packages/apps/find`. Fixed 350px is temporary instead of source auto height. Query path and kind taxonomy are adapters, not byte-identical |
| `src/modules/apps/search-dialog.js` module `fbbb` | Child modal on Computer, **360px** and **auto height**, close-only controls; Search For input initial `*.*`, Start From dropdown, Search all subdirectories checkbox, OK/Cancel. Search emitted to parent, which closes dialog and calls `session.open(path)` | **Implemented** in `packages/apps/search-dialog` with parent-owned overlay, source controls and CSS auto height. Exact skin/focus screenshot still pending |
| `src/modules/apps/search-companion.js` module `7a5f` | Search side pane inside Computer. Name pattern, Look in, date collapse (week/month/year/between), size collapse (small/medium/large/custom), advanced file type/subfolders, Back/Search controls | **Implemented** in `packages/apps/search-companion` with source presets and separate collapsible pane; source theme mapping now governs exposure |
| `src/modules/apps/computer.js` | `classicSearchItem()` dispatches `style === "companion"` to pane, `style === "find"` to separate Find, otherwise shows child Search Dialog. `searchFromDialog(path)` closes dialog and uses `session.open(path)` | Exact original `f3ad` theme dispatch is implemented; Win7's prior **Advanced Find...** shortcut remains an interim migration convenience, not original default-menu parity |

## Implementation sequence

1. **DONE** — pinned `src/modules/runtime/vue-app.js` `f3ad` maps WinXP/win2k to Companion, Win95/98 to Find, Win31 to child Dialog, and default Win7 to null; source-grounded tests in `packages/apps/explorer/src/searchStyle.test.ts`.
2. **DONE first slice** — port the source **Search Dialog** separately with its 360px auto-height parent relationship, initial `*.*` name, focus, cancel, and per-theme entry point. Results should be shown **inside the parent Computer session**, unlike standalone Find's separate Computer window.
3. **DONE first slice** — port the source **Search Companion** independently as a Computer side pane, including collapse/expansion and date/size presets and source Back/Close semantics. Retain original per-theme conditional rendering.
4. **DONE first source slice** — source `2e2c` kind names and exact `0e9a`/`de73` file extension suffix predicates are now implemented; `5985`/`2e2c` relevance ranking, filter parser and highlights migrated with real Guest VFS integration and verified in earlier CI. Preserve source virtual query serialization/filter semantics without giving access to the host filesystem.
5. **TODO** — capture actual source and React screenshots for Win7 default and each implemented alternate theme at desktop/mobile sizes, and resolve `h=auto`, Chrome frame, spacing, icon and keyboard/locale differences.

## Guardrails

- New Search Dialog/Companion first slices are implemented and tested, but **do not claim full source skin/focus or multi-theme pixel parity**.
- Reuse `packages/filesystem`'s single Guest virtual-file search implementation, existing Computer session, and shared SDK/WindowFrame. Do not introduce a second file store or external/native host search.
- Keep PR #1 **draft**, main untouched, no release; only opt-in `[run-ci]` commits or manual dispatch run the expensive CI.
- Screenshot parity, original query formatting and dynamic theme rules remain explicit unverified items.

## Verified checkpoint

- [GitHub Actions 43357788138](https://github.com/codersachin99/windows-os/actions/runs/43357788138) succeeded after theme integration: 205 Vitest tests (40 files), production Vite build, 218 desktop/mobile Chromium tests.
- The actual f3ad theme dispatch is pinned. Remaining visual, source query serialization/relevance scoring, original file predicates and unported WinXP/Win31 complete themes remain explicit tasks.

## Source search closing checkpoint — verified

- [CI 43364173206](https://github.com/codersachin99/windows-os/actions/runs/43364173206) — 223 unit tests / 44 files and 222 desktop/mobile Chromium browser tests passed. Exact `shell:search` URI and pinned `0e9a`/`de73` file predicates are now implemented.
- **Next targeted parity gap:** source `computer.js listSearch` searches `getStats().map(disk => disk.path)` when query `in=` is empty. React currently scans the mounted Guest Computer root instead, which can include non-drive nodes. Implement scoped multi-root traversal from actual mounted Guest disk metadata, with rejection of unmounted disks and no host access.
- Then screenshot-compare default Win7 source/React Computer and Find at desktop/mobile breakpoints; exact child modal focus/chrome and alternate legacy skins remain pending. Many other applications/games are not yet migrated.

## Mounted disk root fidelity (2026-11-13)

- First slice implemented: actual Guest runtime `getStats` mount roots replace the previous Computer-container fallback for original empty `in=` queries. See [mounted disk search source trace](SEARCH-DISK-ROOTS.md). Tests for multiple mounts, zero mounts, stale roots, no root-node leakage and global ranking have been committed.
- **Verified:** [opt-in CI 43366050095 — PASS](https://github.com/codersachin99/windows-os/actions/runs/43366050095), **228 unit tests across 45 files and 224 desktop/mobile Chromium browser tests**. **Subsequent work:** original cached search index, full multi-drive progress semantics, screenshot comparisons and unported legacy applications.

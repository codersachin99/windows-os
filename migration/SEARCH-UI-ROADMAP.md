# Legacy Windows Search surfaces — source-traced parity queue

Pinned source revision: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

The original Computer app chooses **three distinct search UI presentations** by its active theme's `explorerSearch` style. They are not interchangeable:

| Source component | Original behavior | Migration state |
| --- | --- | --- |
| `src/modules/apps/find.js` module `709f` | Separate `window-find`, width **480**, source height **auto**, non-resizable with Maximize hidden; Name & Location / Date Modified / Advanced tabs, Find Now opens `computer` at a virtual search `file.path` | First React slice at `packages/apps/find`. Fixed 350px is temporary instead of source auto height. Query path and kind taxonomy are adapters, not byte-identical |
| `src/modules/apps/search-dialog.js` module `fbbb` | Child modal on Computer, **360px** and **auto height**, close-only controls; Search For input initial `*.*`, Start From dropdown, Search all subdirectories checkbox, OK/Cancel. Search emitted to parent, which closes dialog and calls `session.open(path)` | **Not yet implemented**. Do not replace with Find or assert modal parity |
| `src/modules/apps/search-companion.js` module `7a5f` | Search side pane inside Computer. Name pattern, Look in, date collapse (week/month/year/between), size collapse (small/medium/large/custom), advanced file type/subfolders, Back/Search controls | **Not yet implemented**. Should reuse query model/search engine but retain its source-specific structure |
| `src/modules/apps/computer.js` | `classicSearchItem()` dispatches `style === "companion"` to pane, `style === "find"` to separate Find, otherwise shows child Search Dialog. `searchFromDialog(path)` closes dialog and uses `session.open(path)` | Explorer's current **Advanced Find...** launch is a bounded navigation link, not the original theme-driven menu/child dialog |

## Implementation sequence

1. Confirm which `explorerSearch` style is configured by the original **default Win7 theme** and how it changes with alternate original themes. Add source-grounded tests for the mapping; do not guess based on Windows marketing/UI conventions.
2. Port the source **Search Dialog** separately with its 360px auto-height parent relationship, initial `*.*` name, focus, cancel, and per-theme entry point. Results should be shown **inside the parent Computer session**, unlike standalone Find's separate Computer window.
3. Port the source **Search Companion** independently as a Computer side pane, including collapse/expansion and date/size presets and source Back/Close semantics. Retain original per-theme conditional rendering.
4. Replace interim file-kind extension taxonomy with the exact pinned `2e2c` map. Preserve source virtual query serialization/filter semantics without giving access to the host filesystem.
5. Capture actual source and React screenshots for Win7 default and each implemented alternate theme at desktop/mobile sizes, and resolve `h=auto`, Chrome frame, spacing, icon and keyboard/locale differences.

## Guardrails

- **Never** treat the existence of `search-dialog.js` or `search-companion.js` source as proof that their functionality has been migrated.
- Reuse `packages/filesystem`'s single Guest virtual-file search implementation, existing Computer session, and shared SDK/WindowFrame. Do not introduce a second file store or external/native host search.
- Keep PR #1 **draft**, main untouched, no release; only opt-in `[run-ci]` commits or manual dispatch run the expensive CI.
- Screenshot parity, original query formatting and dynamic theme rules remain explicit unverified items.

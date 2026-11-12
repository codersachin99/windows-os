# Source Guest desktop files and shortcut execution

**Pinned legacy reference:** `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`, `src/modules/system/main.js`, webpack module `6271` (shortcut list/open), `c5f4` (file/shortcut icon renderer) and `743b` (desktop layout).

## Recovered contract

The original desktop is not only a list of program registry icons. Its `defaultShortcuts` contains Bin, Computer and dynamically configured shortcuts; `items` combines these with the persisted per-user `shortcuts` array. A file-backed shortcut contains a real source filesystem path, and the original `openItem` reads the `.lnk` JSON to resolve `exe` and optional target. Directories use Computer; other file types need an association. The configured `desktopPath` is user/session-provided and must not be replaced with an invented drive.

## Ported slice

- `packages/ui/src/desktopFiles.ts` reads the mounted Guest Desktop directory through the shared `VirtualFileStore`, returning original relative file metadata, stable `file:<uri>` UI keys and source JSON `.lnk` exe identifiers. Shortcut validation uses the pinned source `parseSourceShortcut` and will not treat arbitrary JSON input or binary host shortcuts as executable code. Host-imported UTF-8 source JSON links are supported without altering original stored bytes.
- `DesktopIcons.tsx` merges these file items with the already ported native Bin/Computer/dynamic app icons. It subscribes to both source runtime changes and VFS updates, preserving the same original icon placement, selection and drag model. Files added via Explorer to the Guest Desktop folder appear on the desktop; removal and Recycle Bin restore refresh automatically.
- Double-clicking a folder creates a Computer window with `OPEN_APP.file.path` set to that real folder. `ExplorerApp.initialPath` reads that path. TXT opens the actual React Notepad, validated original `.lnk` programs launch through the same app registry (Calculator and Notepad currently supported), and other unported file types return a visible error. A file-backed icon context menu includes Delete, moving the item into the currently mounted source Recycle Bin.
- The user desktop remains scoped to the configured Guest session. The feature does not access real user host files except explicitly uploaded browser Files through Explorer.

## Verification

`desktopFiles.test.ts` covers live VFS listing, sorting, directory vs file, exact shortcut JSON, imported UTF-8 binary link content, malformed/unrecognized shortcuts and absent mounts. `tests/e2e/desktop-files.spec.ts` covers dynamic folder icon and initial-path navigation, uploading TXT and reload persistence, source Calculator.lnk execution, Recycle Bin deletion and rejecting unknown executable references.

**Pending:** full original desktop icons/association maps, shortcut wizard and editing, shortcut `path` targets, Windows special file types, metadata persistence exactly as source Vuex `shortcuts`, drag-to-folder/Bin, icon visuals, original source menu and screenshot parity. Source `main.js` is still `in-progress`.

**CI:** pending this slice's opt-in run. Rubber band functionality already verified by [run 43186461842](https://github.com/codersachin99/windows-os/actions/runs/43186461842).

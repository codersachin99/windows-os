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

**CI verified:** [GitHub Actions run 43188802257](https://github.com/codersachin99/windows-os/actions/runs/43188802257) passed TypeScript, 103 Vitest unit tests across 18 files, original source checks, Vite build and **84 Chromium desktop/mobile tests** including all new Guest Desktop file-backed cases. The initial run 43187940651 exposed a real context-menu z-index issue underneath Explorer; this was fixed in commit 871b5e48. Rubber-band selection was previously verified in [run 43186461842](https://github.com/codersachin99/windows-os/actions/runs/43186461842).

## Desktop file rename (F2 and context menu)

Source `c5f4` binds a 30-character inline editor to `FileRename` and keeps file extensions separately. React now supports F2/right-click Rename for actual mounted Guest Desktop files only. TXT and .lnk extensions, file bytes and folder descendants are retained; collision/invalid names are refused, and saved icon coordinates are rekeyed to the renamed path. See [DESKTOP-RENAME.md](DESKTOP-RENAME.md). Source full shortcut context menu and wizard remain pending.

## Verified source desktop file rename milestone

[CI 43191657508](https://github.com/codersachin99/windows-os/actions/runs/43191657508) passed all automated checks (110 unit tests and 92 Chromium tests) after F2 and context Rename were integrated. This covers only bounded FileRename semantics, not original shortcut editor/wizard or full desktop parity. See [DESKTOP-RENAME.md](DESKTOP-RENAME.md).

## Shared source icon artwork: desktop file-backed rows — 15 November 2026

- Original Win7 icon key resolution 4cca + 0f35 has one shared safe, byte-imported art lookup in `@windows-os/assets`: `legacySourceIconArtwork`. Explorer now delegates to it instead of maintaining a second independent map.
- Desktop file icons use original source extension types, actual Guest .lnk JSON icon overrides and original imported images. Existing `DesktopIcons` previously overrode the JSON icon with the app target icon; this migration removes that override. Shortcut exe permission and launch remain separately checked through `parseSourceShortcut`.
- Added per-file icon type, icon override and original/custom/fallback test attributes, pure VFS tests and real desktop/browser case verifying PNG/photo and shortcut with calc icon launching Notepad. Images not present in the source byte-import inventory explicitly fall back to byte-exact generic file icon; no invented source art.
- This feature commit is intentionally **without [run-ci]** while the previous Explorer shortcut run #43638958982 remains in progress. After other related source icon changes, trigger only one opt-in acceptance batch. Last fully verified source icon classifier [CI #43626932843](https://github.com/codersachin99/windows-os/actions/runs/43626932843) succeeded.
- PR #1 draft, main untouched, no release. Original tracker 290 modules: 255 pending, 27 in progress, 8 implemented, 0 full visual parity.


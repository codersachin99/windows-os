# Desktop file rename — source FileRename behavior

Source: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`, `src/modules/system/main.js` icon component `c5f4`, item menu and desktop module.

The source icon view uses `renaming` state and a `nameInput` with `maxlength=30`. A rename on Enter or blur dispatches `FileRename` with original file path and updated name. The original separates `itemName` and `itemExt`; unchanged extensions remain attached to the renamed source item. The desktop item context menu also exposes Rename; UI errors are surfaced rather than replacing the original file.

## React contract

`packages/ui/src/desktopRename.ts` exposes pure basename/extension selectors and `renameSourceDesktopFile()`. It validates the edit as an actual filename (no path traversal, slashes, Windows reserved names, control characters, extension-changing abuse or case-insensitive name conflicts) and asks the existing shared Guest VFS to move the original URI to the new path. The filesystem preserves text and binary contents and directory descendants. A stale or colliding source is rejected without touching another file.

`DesktopIcons.tsx` binds this to F2 on a file-backed desktop icon and the source-style right-click Rename action. The editor selects the basename, Enter and blur commit, and Escape discards the edit. Source system shortcuts Bin/Computer are intentionally not renameable, because they have no real Guest Desktop file URI.

`DesktopPositionStore.rekey(oldId,newId)` transfers any separately persisted free-icon coordinates after a successful rename, preserving the user's layout; it does not create arbitrary coordinates for previously unplaced shortcuts. Rename changes are published through existing VFS file change subscriptions, updating the desktop and open Explorer without a second path catalog.

Tests: `desktopRename.test.ts`, `desktopPositions.test.ts`, and `tests/e2e/desktop-rename.spec.ts`. These verify extensions, contents, directories, invalid/colliding names, case-only updates, persistence, saved coordinates, F2, context menu, Escape and live Explorer updates.

**Scope limitation:** the original full shortcut metadata, filename extension hide/show choices, custom shortcut wizard, desktop New menu, rename across mounted user accounts, full UI/source screenshot comparisons and all other desktop actions remain incomplete. `system/main.js` is `in-progress`, not `verified`.

**Verification:** pending opt-in CI run.

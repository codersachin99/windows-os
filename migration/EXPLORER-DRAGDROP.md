# Explorer drag-and-drop and host File import

Reference: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

## Original behavior traced

- `src/modules/apps/computer.js` initializes its shared drop parser in `mounted()` with `q()(this.$el, { onDrop: (e) => this.activePath && !isVirtual(this.activePath) && this._parse(e,this.activePath) })`. This allows dragging host/browser File data into the actively opened virtual directory.
- Explorer's source file actions are shell FileCopy/FileMove operations using its session selection and virtual URI entries, not arbitrary host-disk writes.
- The original computer entry/list supports folder nesting, shared file updates, multi-selection, clipboard actions and source Bin paths. The full drag source wrapper, native desktop bridge, replacement names and UI error dialogs remain pending.

## React changes

- `packages/filesystem/src/transfer.ts` provides one preflight-validated FileCopy/FileMove implementation used by both the shared shell clipboard and drag state. It checks source existence, destination, collisions, duplicate target names, self/nested-folder moves and multi-selection before writes. Neither operation silently overwrites a file. Copy preserves source; move updates the shared persisted VFS.
- `packages/filesystem/src/drag.ts` implements a same-document `FileDragSession` with a short-lived, validated session token for native HTML drag. It does not accept untrusted serialized file paths from a host drop. Ctrl/Meta switches to copy; ordinary drag moves files within the virtual disk.
- The original `mounted() -> onDrop -> _parse` path is mapped to `importDroppedFiles`. Only explicit browser File objects from the user are processed. Case-insensitive duplicate filenames and existing destination paths are rejected before any file is written. UTF-8 `.txt` files are stored as text for Notepad; other file types are stored as binary via the existing VFS `writeBytes`.
- `packages/sdk/src/files.ts` exposes the singleton shell drag session. `packages/apps/explorer/src/ExplorerApp.tsx` binds drag source, folder-item targets, folder-background target, visible drop indication, and a file chooser Upload button. The original Win7 stylesheet remains unchanged and the React adapter CSS adds drag feedback.
- The source Recycle Bin view remains non-draggable and does not permit direct host file drops; Delete/Restore/Permanent Delete already route through the source-configured trashPath. File movement never writes to an actual host path.

## Verification and remaining gaps

Unit tests cover internal copy/move, malicious/expired session tokens, recursive and collision cases, binary/text import, duplicate filenames and multi-item preflight. Chromium tests cover file/folder drag, modifier-copy, Upload text/binary, and browser File drop into a child directory with overwrite refusal, including cross-app Notepad reading.

**Limitations:** No complete source-equivalent folder-file paste/replace prompt, same-directory copy naming, multi-file atomic rollback on storage-quota failure, host directory upload traversal, native file system API/Capacitor bridge, Recycle Bin drag target, drag from Desktop/Start Menu, icon reordering or exact source hover drag visuals. Generic HTML drag is a React implementation adapter of the source action contract, not evidence of pixel-perfect UI parity.

**Verification passed for this bounded slice:** [opt-in CI 43177091763](https://github.com/codersachin99/windows-os/actions/runs/43177091763) passed TypeScript, unit tests, source checks, build and **56 Chromium browser tests**, including drag-move, Ctrl+drag copy, File Upload, host File drop and conflict handling. The original full `src/modules/apps/computer.js` remains `in-progress`.

# Source-mapped filesystem: implementation checkpoint

Pinned source revision: 4e63290d783009e1293433c6ccf252abba9c1187.

Observed source behavior:
- src/modules/apps/notepad.js calls read(path, true), write(content, path), getParentDirectory(path).
- src/modules/apps/computer.js represents files with uri, name, type, mtime, size and distinguishes directory vs file navigation.
- src/modules/apps/cmd.js expects fs.list, fs.read, fs.stat and a separate Windows drive-letter to URI path adapter.

Current real implementation: packages/filesystem/src/index.ts.
- Shared source-style absolute slash URI paths, file/directory metadata, list/stat/read/write, mkdir, remove, copy, move and isExisting.
- Text files only. Single Guest-session browser-localStorage persistence wired at packages/sdk/src/files.ts; injectable adapter for tests.
- No fake host drives or source files. Existing Computer and Recycle Bin mocks remain incomplete.

NEXT: map original disk mounts, seeded source folders, actual user identity/session isolation and binary media; implement native Explorer, file dialogs, Notepad, CMD, Recycle Bin and test cross-app persistence. Original source contains more operations, special folders, permission checks and search behavior; do not mark these source modules verified from file-store unit tests alone.

Run npm test for filesystem unit coverage. Green tests do not imply full source parity.

## CMD drive-path adapter checkpoint

The original src/modules/apps/cmd.js drive-path functions m/g/y/w/v/x/k/E are mapped in packages/filesystem/src/drivePaths.ts. It converts Windows drive-letter input (including current-drive relative path resolution and Guest profile-name translation) into the common slash-URI store contract. Mount metadata is supplied through drivesFromLegacyStats; no default drives have been invented. The tested path adapter does not yet mount any source disks or populate an Explorer.

## Source-configured volume/session checkpoint

`packages/filesystem/src/volumeSession.ts` adds `LegacyVolumeSession` and `createProfileFileStore`. Legacy Vue stores `systemPath`, `desktopPath`, and `trashPath` dynamically and calls `getStats()` for drives. The new adapter receives these values from an upstream source-equivalent runtime bootstrap and only mounts directories explicitly provided by it; *none are fabricated*. It maps Windows paths with the CMD drive adapter.

Separate user-id keyed browser stores avoid mixing users; the original first-slice Guest key is retained. The file store now emits change events after a successfully persisted mutation, so future Explorer and Notepad instances can refresh against the same data. Observer errors cannot roll back a completed mutation.

Still pending: source startup/session runtime wiring, real source mount metadata, per-user storage backend parity, binary files, folder/shortcut metadata, recycle semantics, file dialogs, and app UIs.

## Explicit source-driven Recycle Bin

The original bin.js renders Computer hoisted to its runtime `trashPath`. The React port now has trash/restore/empty operations with original-location metadata atomically stored in the virtual filesystem snapshot. `SourceFilesystemRuntime` can mount and persist only source-supplied root/disks/Desktop/trash metadata. A missing source runtime leaves the Bin **unmounted**; no fake C: drive or empty Trash is manufactured. See [RECYCLE-BIN.md](RECYCLE-BIN.md). This atomic metadata implementation is functionally motivated, not byte-for-byte compatible with the original internal storage.

## Recycle/restore atomic snapshot and source mount cache

The in-progress Recycle Bin port now supports `VirtualFileStore.trash/restore/emptyTrash/removeTree` using the *supplied* `trashPath`, with original-path metadata persisted inside the same VFS snapshot as the file move to prevent loss on failed writes. Source mount metadata can be provided and cached through `SourceFilesystemRuntime.configure` and reloaded on Guest login; no runtime-derived drive list is invented. [CI 43157555063](https://github.com/codersachin99/windows-os/actions/runs/43157555063) passed.

## Exact first-run source directory bootstrap

The original source webpack files were traced to functions and constants `5401`, `4cca`, `757f`, `760d` and the filesystem service's `init()`/`ensureUser()`. Instead of relying solely on supplied fixtures, the Guest login now seeds the **actual original** `EXTERNAL/computer/drive0` / `Users/Guest` special-folder tree. It preserves prior user data and provided custom source mounts. See [SOURCE-BOOTSTRAP.md](SOURCE-BOOTSTRAP.md) and its explicit limitations.

## Binary bytes and source program installation

`VirtualFileStore.readBytes/writeBytes` now supports binary files via validated base64 snapshots. This reproduces the original installer-generated 1,024-byte MZ stubs for the 34 installed original programs, and preserves existing VFS text semantics. `sourcePrograms.ts` installs source-defined executable and Start Menu paths idempotently without overwriting data; see [PROGRAM-INSTALLER.md](PROGRAM-INSTALLER.md).

## Shared FileMove/FileCopy and host-browser file drops

`transferFiles` applies one common collision/nesting/duplicate-source check to both clipboard and Explorer drag, preserving source files on copy and source folder trees on move. `importDroppedFiles` accepts explicit browser File objects only, converts TXT into editable text and retains other file bytes as stored binary. No host-disk write or read of arbitrary host paths is exposed. See [EXPLORER-DRAGDROP.md](EXPLORER-DRAGDROP.md).

## Verified shared file transfer checkpoint

The reusable FileCopy/FileMove transfer is used by both Clipboard Paste and Explorer Drag, while the external File importer stores text or unchanged binary bytes. [CI 43177091763](https://github.com/codersachin99/windows-os/actions/runs/43177091763) passed source tests, TypeScript, unit tests, build and **56 Chromium browser tests**. Future work: multi-item transactions with rollback and original replace-conflict dialogs.

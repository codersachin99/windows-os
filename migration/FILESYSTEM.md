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

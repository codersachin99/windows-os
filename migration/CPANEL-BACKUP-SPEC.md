# Original Control Panel Backup and Restore — implementation contract

Pinned: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`
`src/modules/apps/cpanel.js`, source `ue/Te` view and
`Pe/Ie/je` archive functions (lines ~2138–2878).

## Source operations

The source **really implements backup and restore**, not a static
settings page. `Ie` lists every `backupFolders` special folder in
the current user profile, recursively archives each file, tracks the
file count and byte count, and creates `win7simu-backup-<timestamp>.zip`.
It adds root `manifest.json` containing:
`{createdAt:<ISO time>,target:"all",folders:<source backupFolders>,
fileCount:<number>,source:"win7-simu"}`. Browser builds download the
ZIP to the client device. The `lastBackup` summary is saved in the
source user's shell settings. Progress events are `start`,
`processing`, `done`.

`je` reads a user-selected `.zip`, requires a parseable manifest,
then restores files ONLY under source `backupFolders` to the current
`%USERPROFILE%`, creates parent directories, skips already existing
files, and reports `restored` / `skipped` counts. A missing
manifest throws `Invalid backup file (missing manifest).`.
The original UI shows `No backup created`, `Back up now`,
`Restore my files`, operation progress, results and last-backup data.
The source disabled side-pane actions `Create a system image` and
`Create a system repair disc` must stay disabled.

## Implemented working slice — 15 November 2026

- Verified pinned webpack f106.backupFolders as **Desktop, Downloads, Documents,
  Music, Pictures, Videos, AppData** (exact source order).
  Original 0e9a text/shortcut extensions: txt,text,readme,md,json,xml,rtf,wpl,lnk.
- packages/filesystem/src/sourceBackup.ts provides standard ZIP export via
  fflate, original manifest.json, progress events and strict file-size bounds.
  ZIP import preflights central/local headers, CRC, path traversal, symlinks,
  duplicate/case-colliding names, file count and manifest before Guest writes.
- Restore targets only SOURCE_GUEST_PROFILE in these seven folders, skips
  preexisting files, creates profile-only directories and stages new content
  through VirtualFileStore.createFilesAtomic. No host-disk access.
- packages/apps/cpanel/src/BackupRestorePanel.tsx provides browser Download,
  ZIP Upload, progress/result state, last-backup metadata and disabled system
  image/system repair controls. This is the sixth navigable Control Panel view.
- Unit and desktop/mobile browser tests cover file download/upload, source
  manifest, binary/text restoration, skip existing, malformed and unsafe ZIP.

**Verification:** committed but no new CI result yet. Archive limits are
5,000 files and 25 MiB expanded data; screenshots and full visual parity
remain pending. Native ZIP writer, account profiles beyond Guest, and source
Android behavior remain outside this browser slice. Browser download
initiation is not a guarantee the user retained the file.

## Next implementation and security gates

1. Resolve the pinned `f106` filesystem module's **exact**
   `backupFolders` list. Do not infer a collection from Guest folder
   names or include app binaries / another user's data.
2. Provide a reusable streaming browser ZIP codec compatible with the
   source manifest. Prefer a vetted library to invented archive formats;
   if adding dependencies, commit the lockfile and test it.
3. Implement ZIP export by reading `VirtualFileStore.list()` and
   `readBytes()` under the current `SOURCE_GUEST_PROFILE`. Persist
   lastBackup only after the archive has successfully downloaded.
4. Implement safe import with checks for absolute paths, `..`,
   duplicate/case-colliding destinations, symlink-like archive records,
   size/entry limits and invalid/missing manifest. Validate all
   destinations remain within the **current Guest profile** before
   writing; use existing create-only file helpers so restored entries
   cannot overwrite source files.
5. Unit-test archive interoperability and malicious ZIP inputs,
   count/progress, no overwrite, binary roundtrip and persist/reload.
   Exercise browser download, upload and error states in Playwright at
   desktop and mobile sizes, before claiming feature parity.
6. Keep Backup & Restore **pending**, not a fake interactive
   placeholder, until these gates pass. No host OS backup or disk
   write authority.

The current `ControlPanelApp` has five real page routes—Display,
Programs and Features, Guest Accounts, Notification Area Icons and
Action Center. Backup/Restore remains the sixth missing page, and full
source category/search registry and screenshot parity are separately
pending.

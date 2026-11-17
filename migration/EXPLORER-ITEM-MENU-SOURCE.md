# Original ExplorerItemMenu source contract — 17 November 2026

## Pinned reference

`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`,
`src/modules/system/main.js`, component `G.items()` /
`ExplorerItemMenu`. Original translations from
`assets/locales/en-US.json` verified for `compressed-folder`,
`desktop-create-shortcut`, `extract-here`, `send-to`.

**Normal Computer file/folder item order:**

1. Open, hidden for multiple selection.
2. Extract here for a supported archive item (requires actual archive engine).
3. Send to → Compressed (zipped) folder; Desktop (create shortcut).
4. Download, only when a selected file has a downloadable extension.
5. Cut, Copy, Delete.
6. Rename, hidden for multi-selection or an archive container.
7. Properties, always disabled in the pinned source.

**Recycle Bin item order remains separate:** Restore, Delete, disabled
Properties. Never add ordinary Computer Open/Cut/Copy/Send to commands to
Bin entries.

## Migration checkpoint

- `sourceExplorerItemMenu.ts` preserves normal file/folder ordering,
  selection-dependent hiding, download eligibility, known disabled source
  actions and the two original Send to labels. Pure unit tests exercise
  TXT, folder, archive, .lnk and multiple-selection cases.
- `ExplorerApp` now maps source item-menu IDs to real existing open,
  clipboard, recycle-confirmation and rename session methods, with a
  keyboard/pointer-expandable Send to submenu. The archive child remains
  disabled; the Desktop child now creates real path-backed Guest shortcuts.
- **Download** operates on actual Guest `VirtualFileStore.readBytes`
  data and emits browser Blob downloads. It uses the filename from
  `FileEntry`, never arbitrary host paths, and revokes temporary
  Blob URLs. A directory cannot download as if it were a file.
- Browser tests exercise text-file source order, Send to child labels,
  disabled archive actions, real downloaded bytes, multi-select and
  the no-download rule for directories, on desktop and mobile Chromium.
  Existing separate Bin context tests remain in the integrated suite.
- CI is opt-in using `[run-ci]` and includes the new spec in the
  focused shell browser gate.

## Remaining discrepancies

- Source BaseMenu displays a **nested side-flipping popup**; React's
  compatibility menu presently displays child items inline below the
  opened parent, as with the existing Explorer View/New menu. The
  submenu geometry and original hover transition are not pixel-verified.
- **Extract here** and **Compressed (zipped) folder** require an
  archive engine. Do not enable them until a validated Guest filesystem
  archive adapter is available and tested. `Send to Desktop` now writes
  atomic source-style text-backed `{exe,icon,path}` shortcuts for live
  canonical Guest files and folders, resolves the actual target at open,
  and never executes `exe` as an arbitrary host program. The currently
  generated `exe` and `icon` use the pinned file-type contract; exact
  legacy executable mapping and original shortcut graphics still need
  source-paired parity verification.
- Android document-provider URLs, live archive-container paths, remote
  mounts, multi-item download scheduling, and the exact eligibility
  predicates for all special file types remain unported.
- As with all WindowsOS milestones, original-vs-React paired pixel
  screenshot parity is still not available; draft PR #1 is not a release.

Original source binaries/images must be preserved unchanged. Main
remains untouched until source-level feature and visual parity gates
actually pass.

## Path-backed Send to Desktop sub-milestone

- Pinned `main.js` `sendToDesktop` creates `.lnk` source records
  `{exe, icon, path}`, basename `<name> - Shortcut.lnk`, one per
  selected item. It is distinct from the source installed-program
  `{exe, icon}` shortcut used by Start Menu and Shortcut Wizard.
- `packages/filesystem/src/sourcePathShortcuts.ts` validates original
  EXTERNAL/computer Guest paths, rejects traversal/host paths, shortcut
  loops and deleted/missing entries, then atomically writes collision-safe
  filename suffixes for multi-selection. `parseSourceShortcut` rejects
  records with any `path` field, preventing the wrong executable launch.
- `DesktopIcons` and `ExplorerApp` resolve the actual VFS target of a
  path shortcut, dispatching only registered Guest-compatible file/folder
  associations; nonexistent or invalid targets fail visibly and safely.
- Pure filesystem and desktop tests cover safe contents, security and
  Guest Desktop persistence; browser tests cover the active submenu,
  TXT/folder double-click and reload plus Win11 multi-selection.
- Still unsupported: original source path shortcut icon/executable
  variants beyond the migrated file-kind mapping; shortcut-to-shortcut
  recursion; archive extraction/compression; exact nested popup geometry.

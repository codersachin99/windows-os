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
  keyboard/pointer-expandable Send to submenu. The original two children
  are **disabled**, not fake archive/shortcut actions.
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
  archive adapter is available and tested. Original `Send to Desktop`
  creates path-backed shortcuts whose `path` fields must be opened
  safely and faithfully; source `.lnk` parser currently supports
  installed program shortcuts only, so the child stays disabled.
- Android document-provider URLs, live archive-container paths, remote
  mounts, multi-item download scheduling, and the exact eligibility
  predicates for all special file types remain unported.
- As with all WindowsOS milestones, original-vs-React paired pixel
  screenshot parity is still not available; draft PR #1 is not a release.

Original source binaries/images must be preserved unchanged. Main
remains untouched until source-level feature and visual parity gates
actually pass.

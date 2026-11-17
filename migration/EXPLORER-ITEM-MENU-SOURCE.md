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

- Pinned Source BaseMenu displays a **nested side-flipping popup**.
  The Explorer item **Send to** submenu now uses an actual separately
  positioned popup that leaves the parent row heights unchanged, flips
  horizontally at the viewport edge, clamps vertically near the bottom,
  and supports Arrow Right / Arrow Left keyboard traversal. Win7/XP/11
  original screenshot parity is still **unverified**, and the separate
  Explorer background View/New menus retain their earlier inline form.
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

## Source Explorer item submenu geometry checkpoint

- `sourceExplorerSubmenuPlacement.ts` implements side-flipped coordinates
  from the original menu/row geometry without mutating the primary menu's
  layout. The returned local-space top/left values clamp to the actual
  viewport on phone, tablet or desktop.
- `ExplorerApp` places the **Send to** child in a separately measured
  absolute popup, tracks mouse hover for the parent, and gives child rows
  their own Up/Down focus cycle. Right Arrow expands and focuses the
  first available child; Left Arrow collapses and restores parent focus.
  Escape still dismisses the whole menu through the shared handler.
- `ExplorerApp.css` changes overflow only for the **item** menu;
  Recycle Bin and empty-space Computer context behavior remains separate.
- Pure tests cover opening right, flipping left, lower-edge clipping and
  narrow mobile screens. Playwright verifies the popup does not increase
  the outer menu height, stays within the actual viewport and supports
  keyboard navigation on desktop and mobile Chromium.
- Remaining: true source submenu geometry for the **background View/New**
  menus, original shader/border metrics under all themes, paired visual
  captures and behavior differences under external filesystem providers.

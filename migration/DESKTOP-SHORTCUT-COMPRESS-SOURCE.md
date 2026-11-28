# Desktop shortcut Send to → compressed ZIP: pinned-source target paths

**Date:** 22 November 2026
**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`
**Target:** `codersachin99/windows-os@feat/0001-faithful-react-foundation`, draft PR #1.

## Actual legacy contract

`src/modules/system/main.js` component `DesktopItemMenu` builds
`this.paths` from the selected `ids.map(this.getShortcut)` filtered to
real `shortcut.path`, excluding `computer` and `bin`.
The **Send to** submenu is hidden when `!this.paths.length` or a parent
is mapped. The **compressed folder** action invokes
`this.compress(this.paths)`. It does not pass the on-Desktop
`.lnk` JSON URI for an Explorer-created file shortcut whose
`shortcut.path` points into Documents.

The earlier React menu only computed `canCompressGuest` against
`desktopSelectedFilePaths` and the Desktop parent, so it ZIPped a
file shortcut's `.lnk` JSON instead of its original target, and showed
Send to for program-only links without a backing `shortcut.path`.

## Implemented bounded Guest adapter

- `packages/ui/src/desktopFileActions.ts` adds
  `desktopSourceArchiveSelection`. It reuses the already-audited
  `desktopSourceClipboardPaths` from the original source's selected
  `shortcut.path` model, then delegates to
  `sourceCanCompressSelection` for one canonical mounted Guest
  parent directory. This is an explicit *target safety restriction*
  when a selection spans multiple Guest parents; it is not a claim
  that the original had the same restriction.
- `DesktopIcons.tsx` uses that selection to gate **Send to → Compressed
  (zipped) folder** and passes `request.folder, request.paths` to
  the existing bounded `createSourceGuestArchive` shared with Explorer.
  Result appears beside the source target (e.g. Documents for a shortcut
  to Documents). Desktop selection is updated only when the new ZIP is
  actually created in Desktop. The shortcut file is retained and
  never packed as a replacement for its target.
- `sourceDesktopItemMenu.ts` hides Send to for a program-only `.lnk`
  when no selected `shortcut.path` exists. It keeps menu ordering and
  retains a disabled submenu for otherwise selected paths that the
  current safe ZIP implementation cannot combine.
- Security remains on the Guest VFS, not the host filesystem. The shared
  ZIP adapter retains its conservative entry/depth/byte limits,
  collision-safe output names and atomic file creation, with no
  overwrite or partial archive.

## Tests and acceptance

- `desktopFileActions.test.ts`: target-backed `.lnk` ZIP request
  points to Documents/real file; same-parent selection succeeds;
  mixed-parent, host-path, program-only and invalid entries reject.
- `sourceDesktopItemMenu.test.ts`: original absent-path Send to hidden;
  genuine target-enabled submenu; pending adapter disabled.
- `source-desktop-send-to-compressed.spec.ts`: existing direct
  Desktop ZIP binary and multiple-file tests retained, plus actual
  Explorer-created path-backed `.lnk` on Desktop → ZIP of original
  binary in Documents (byte-identical archive and target retained);
  program-only `.lnk` has no compressed Send to.
- Existing `[run-ci]` focused browser workflow already includes this
  spec, on desktop and mobile. Exact-head acceptance requires all
  TypeScript, units, source inventory, artwork/Contacts audits, Vite,
  focused and full desktop/mobile Playwright.
- Previous checkpoint [CI #44931334630](https://github.com/codersachin99/windows-os/actions/runs/44931334630)
  completed **SUCCESS** at `7af9b85` for the preceding
  clipboard migration, *not* this later compression slice.
  Paired legacy-vs-React visual comparison of all 37 theme IDs remains
  unverified without `LEGACY_SOURCE_READ_TOKEN` in the separate
  `[capture-visual]` workflow.

**Next:** Desktop Delete semantics for source path-backed `.lnk`
and remaining drag parity, with explicit tests for the data loss
boundary; then Computer, Recycle Bin, Start and original theme families.
Do not mutate pinned source, merge PR #1 or release before acceptance.

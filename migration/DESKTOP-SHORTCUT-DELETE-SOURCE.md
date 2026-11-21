# Desktop shortcut Delete → real Guest target and Recycle Bin

**Date:** 22 November 2026
**Immutable legacy source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`
**Working target:** `codersachin99/windows-os@feat/0001-faithful-react-foundation`, draft PR #1.

## Exact source behavior

In frozen `src/modules/system/main.js` component `DesktopItemMenu`:
`this.paths` is computed by mapping selected shortcut keys through
`this.getShortcut(key).path` and excludes system Computer/Bin. The original
`deleteShortcut()` is exactly `return this.deleteItems(this.paths)`.
The menu shows Delete for actual shortcuts, but disables it for
`!this.paths.length`. The frozen Desktop keyboard
`deleteSelectedIcons()` collects the same selected shortcut paths and
calls `this.deleteItems(paths)`.

A file-backed Desktop `.lnk` created by Explorer's **Send to Desktop**
therefore deletes/moves **the original file path referenced by that link**,
not its `.lnk` JSON backing file on Desktop. The user-facing result can
be surprising, but it is source behavior rather than new functionality.
This slice does not claim fully identical native deletion prompts.

## Changes and safety

- `DesktopIcons.tsx` `requestDesktopDelete` and keyboard Delete now
  use already-validated `desktopSourceClipboardPaths(items,selectedKeys)`.
  Link targets must be canonical and mounted in the Guest computer root;
  program-only links without paths, system icons and untrusted paths are
  excluded. The existing explicit confirmation remains mandatory.
- The shared `fileStore.trashMany(paths,trashPath)` does the actual
  Guest VFS transaction. It never silently deletes the host file. The
  source `.lnk` stays on Desktop when its target was in Documents; if
  that document is later restored from Bin, its original bytes return.
  The code intentionally does not rewrite/break/retarget the shortcut.
  Direct Guest files and directories retain their existing Bin behavior.
- `sourceDesktopItemMenu.ts` disables (but keeps visible) **Delete**
  if there are no source shortcut paths, matching the source's
  `disabled:!this.paths.length` rather than allowing program-only
  `.lnk` JSON deletion.
- Drag-to-Bin remains a separate source parity slice. Do not assume
  drag gestures always imply target deletion without checking original
  drag implementation and confirming destination.

## Acceptance contract

- `sourceDesktopItemMenu.test.ts` checks Delete disabled for a
  program-only link and enabled with a path-backed Guest link.
- `source-desktop-shortcut-delete.spec.ts` tests actual
  Explorer-created Desktop `.lnk` to binary file in Documents:
  real Desktop context Delete confirmation, source file absent,
  `.lnk` retained, Bin contains the original binary filename,
  Bin Restore returns the exact bytes to Documents; also confirms a
  program-only `.lnk` has disabled Delete and keyboard Delete makes no
  confirmation or content change.
- That spec is in the deliberate opt-in focused browser workflow on
  desktop and mobile. Existing direct Desktop deletion, multi-selection,
  Explorer and Bin tests are preserved.
- Exact-head `[run-ci]` must pass TypeScript, units, pinned source
  inventory, artwork and Contacts audits, Vite, focused and full
  desktop/mobile browser tests. Do not claim this slice accepted until
  the corresponding run succeeds.

**Prior baseline:** [CI #44931334630](https://github.com/codersachin99/windows-os/actions/runs/44931334630)
completed SUCCESS at `7af9b85` for earlier clipboard work.
**Compression-only run:** [CI #44937841704](https://github.com/codersachin99/windows-os/actions/runs/44937841704)
was running at `34904c3` when this separate deletion change began.
Neither run verifies this later Delete slice. The paired frozen
source versus React visual capture across all **37 themes** remains
unverified without `LEGACY_SOURCE_READ_TOKEN`. Do not merge PR #1,
change `main`, mutate pinned legacy source, or release before parity.

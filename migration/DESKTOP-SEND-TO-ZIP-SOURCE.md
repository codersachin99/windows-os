# Frozen Desktop Send to → Compressed (zipped) folder — 21 November 2026

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**React branch:** `feat/0001-faithful-react-foundation`, draft PR #1. Do not change original, `main`, or release.

## Original behavior and source proof

Frozen `src/modules/system/main.js` component `DesktopItemMenu`, `items()`
at approximately lines 297–305 exposes `send-to` when `this.paths.length`
is nonzero and the selection is not a mapped directory; its **single**
child `compressed-folder` calls `this.compress(this.paths)`. The Desktop
item's Send to submenu is **not** Explorer's two-entry Send to submenu:
the latter also includes `Desktop (create shortcut)`. Keep these two
menus distinct rather than redesigning either one.

The React Desktop previously rendered `Send to ▸` as a **permanently
disabled** item, despite already having the bounded Guest ZIP operation in
`packages/filesystem/src/sourceArchive.ts` for real Explorer files.

## Implementation

- `packages/ui/src/sourceDesktopItemMenu.ts`: source item-menu order unchanged;
  `canCompressGuest` enables the parent only for supported mounted Guest
  paths, with the default kept disabled for unknown callers. No fake
  compression or host filesystem operation.
- `packages/ui/src/DesktopIcons.tsx`: resolve multi-selection into **real**
  file-backed Desktop paths; filter synthetic system icons, check the Guest
  Desktop mount and `sourceCanCompressSelection`, and call the exact same
  `createSourceGuestArchive` engine as Explorer. Select the created ZIP;
  display a real error when any input or operation fails.
- One authentic child `Compressed (zipped) folder` in a separate
  keyboard-accessible `role=menu`, with ArrowRight to open, ArrowLeft
  to return and Escape dismissal. Preserve the original existing Desktop
  action ordering, submenu hover, edge positioning, focus and theme styling.
  The separate popup avoids root menu scroll clipping on mobile.
- The shared archive engine reads only virtual Guest files/directories,
  writes the ZIP atomically inside the Desktop directory, preserves binary
  contents and nested/empty folders, and never overwrites a name. It has
  **32 MiB / 2048 entry / 64 depth** safety bounds; these are **not**
  claims about the original legacy app. No host directory mapping,
  archive extraction or Properties action is being invented.

## Regression tests and verification

- `packages/ui/src/sourceDesktopItemMenu.test.ts`: default disabled vs
  mounted-Guest-enabled, multi-select and system-item gate.
- `tests/e2e/desktop-item-source-menu.spec.ts`: genuine Guest TXT file
  shows enabled Send to while Bin/Computer Properties remain unavailable.
- `tests/e2e/source-desktop-send-to-compressed.spec.ts`: desktop/mobile
  browser scenarios for original submenu focus, ArrowRight/ArrowLeft, real
  downloaded ZIP **binary bytes**, preservation of originals and multi-file
  `Archive.zip` / `Archive (2).zip` collision safety.
- New suite added to the existing **opt-in** `.github/workflows/react-checks.yml`
  targeted browser job. Request one exact-HEAD `[run-ci]` checkpoint only
  after the full change set. At writing, these changes have **not yet passed**
  their own acceptance job: do not infer success from old ZIP run
  [#44889309855](https://github.com/codersachin99/windows-os/actions/runs/44889309855),
  or the separate Win2k Search run [#44895908763](https://github.com/codersachin99/windows-os/actions/runs/44895908763).

**Still pending:** paired original/React screenshot comparison across all
source themes, source ZIP filename/runtime edge cases and later extraction,
and remaining deep Desktop/Explorer functionality. The paired visual job
requires access to the pinned private original in CI. PR #1 stays draft; no
merge/release is authorized by this functional slice.

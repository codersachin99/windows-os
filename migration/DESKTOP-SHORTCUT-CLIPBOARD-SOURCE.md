# Desktop shortcut Copy/Cut → real Guest target — 21 November 2026

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation` (draft PR #1). `main`, frozen source, CI policy and releases unchanged.

## Source evidence

`src/modules/system/main.js` `DesktopItemMenu` watcher receives `id`
plus selected `ids`; it maps `ids` through `this.getShortcut(id)`,
filters out system icons and shortcuts **without a `shortcut.path`**, and
saves `this.paths = shortcuts.map(shortcut => shortcut.path)`.

Its `cutShortcut()` and `copyShortcut()` dispatch the `SetClipboard`
action with **those `this.paths`** and the corresponding `cut`/`copy`
operation. The menu hides Cut/Copy when `!this.paths.length`. Desktop
keyboard `Ctrl+C` and `Ctrl+X` similarly use selected shortcuts'
`getShortcut(id).path`.

Before this slice React put the selected Desktop `.lnk` file URI on
the clipboard, even if it was an Explorer-created file shortcut pointing
to a different document. It also offered a file clipboard for a
program-only `.lnk` without an actual Guest target path.

## Implementation

- `packages/ui/src/desktopFileActions.ts`:
  `desktopSourceClipboardPaths(items,selectedKeys)` converts each selected
  real Desktop icon to the **source target path** when a validated
  path-backed shortcut is present. Direct non-`.lnk` file and directory
  icons retain their own Guest VFS path. Program-only and malformed
  `.lnk` entries, system icons and stale IDs are skipped. Duplicate target
  paths are deduplicated. All target paths must be canonical and under the
  mounted `/EXTERNAL/computer/` root, protecting against arbitrary host
  paths, traversal and unmounted adapters.
- `packages/ui/src/DesktopIcons.tsx`: both **context Copy/Cut** and
  **keyboard Ctrl+C/Ctrl+X** route through that helper and the existing
  shared `fileClipboard`; paste continues through the same atomic
  Guest `transferFiles` adapter used by Explorer. It does not silently
  rewrite the `.lnk` JSON. A **cut of the target** can make its original
  Desktop shortcut stale, which is a consequence of the frozen source's
  path-based action rather than a new link-move or rebind feature.
- `packages/ui/src/sourceDesktopItemMenu.ts`: hide Cut/Copy when no
  selected real shortcut paths exist; preserve their existing menu order
  when present. Unsupported host operations remain disabled.
- This slice intentionally does **not** mutate Desktop Delete, drag or
  Send to compressed-folder behavior. Those are separate source- and
  data-safety-sensitive parity tasks, not consequences of Copy/Cut.

## Regression / acceptance

- `desktopFileActions.test.ts`: mixed direct file, directory, program
  shortcut, target-backed shortcut, system, duplicate, stale, host and
  traversal selections; assert target URI, not `.lnk` path.
- `sourceDesktopItemMenu.test.ts`: original Hide Cut/Copy when a
  program-only shortcut has no `shortcut.path`; show for valid Guest path.
- `source-desktop-shortcut-clipboard.spec.ts`: for Win7 Desktop/mobile,
  Explorer Send to Desktop creates path-backed `.lnk`; Desktop context
  **Copy** + Ctrl+V copies its real document and keeps source/shortcut;
  keyboard **Ctrl+X** + Ctrl+V moves the real document without moving
  the shortcut; program-only `.lnk` cannot be copied or cut. Verify
  Notepad content and Explorer source existence; not merely a menu toast.
- New spec added to deliberate, focused GitHub Actions shell gate. A new
  exact-head `[run-ci]` run must verify all TypeScript, units, original
  source/artwork/Contacts audits, Vite, focused and full browser suites.
  No unverified local execution, pixel-parity or release assertion.

## Existing accepted checkpoint

[CI #44913862521](https://github.com/codersachin99/windows-os/actions/runs/44913862521)
at `e0dde5bdc39b0a3023e4a3307c62fd3bd414ce52` completed **SUCCESS**
for preceding Desktop ZIP and Download slices; this earlier snapshot does
**not** verify the new clipboard code. Original screenshot comparison for
all 37 theme IDs requires `LEGACY_SOURCE_READ_TOKEN` in visual-capture;
the normal `[run-ci]` gate intentionally skips it. Keep PR #1 draft.

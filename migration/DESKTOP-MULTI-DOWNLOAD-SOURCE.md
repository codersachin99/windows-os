# Desktop selection → Download, frozen source parity — 21 November 2026

**Immutable reference:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation`, draft PR #1; no source/main/release changes.

## Source contract and previous gap

Pinned `src/modules/system/main.js` `DesktopItemMenu` has
`downloadablePaths()` filtering **all** `this.paths` by an extension
other than `.lnk`. Its Download menu's original callback is
`this.download(this.downloadablePaths)`, and its visibility is
`hidden: !this.downloadablePaths.length`. This **is not** a command
on only the clicked desktop icon.

React previously implemented `downloadSourceFile(item)` and computed
visibility using only the right-clicked item, so a multi-selection
Downloaded just one file, and a selected `.lnk` could incorrectly hide
Download even when another selected real file was eligible.

## Implementation

- `packages/ui/src/desktopFileActions.ts` exports
  `desktopDownloadableFiles(items,selectedKeys)`. It selects each unique
  actual Guest VFS file with an extension except `.lnk` (not synthetic
  app icons, directory icons, duplicate keys or stale selections).
- `sourceDesktopItemMenu.ts` receives a new optional
  `downloadableCount`, preserving prior use in tests/callers while
  allowing the exact selected-path visibility of the original menu.
- `DesktopIcons.tsx` calls `downloadDesktopSelection(contextKeys)`.
  It reads the exact binary bytes of **all** eligible Guest files before
  emitting browser downloads; if an entry is missing, it surfaces an
  error instead of a partial batch. It creates ephemeral Blob URLs only,
  never opening host paths, modifying original files or storing them in
  another backend. URL revocation is deferred briefly to allow the browser
  download click to consume the URL.
- Explicit source proof for the original Desktop **Properties** handler:
  `main.js` calls `launchSetting(this.type)`, which is
  `Launcher.launchMiscellaneous({target:type})` in pinned
  `shared~device~plugin-embed~sandbox~system-cache~vue-app~vue-store.js`.
  It launches an external host setting and is not an internal React
  System Properties page. Keep it disabled in browser-only React until
  a permissioned native platform adapter exists; do not invent one.

## Verification contract

- `desktopFileActions.test.ts`: selected real TXT + binary file, excludes
  system icons, directories, .lnk, repeated/stale IDs.
- `sourceDesktopItemMenu.test.ts`: selected file count controls Download
  even when context-clicked item is a .lnk, while system item actions remain
  hidden.
- `source-desktop-multi-download.spec.ts`: desktop/mobile two-file actual
  download events with exact bytes; a separate case verifies the clicked
  .lnk does not download while the other selected TXT does.
- Suite is included in the intentional opt-in focused browser step. Full
  TypeScript, unit, original-source/artwork/Contacts audits, Vite, focused
  and complete desktop/mobile Playwright still require a new exact-head
  `[run-ci]` run. No local execution is claimed.

**Open gaps:** exact original multi-download browser permission prompts,
long-running large batches, source-vs-React paired screenshots across all
37 original theme IDs, complete native host settings and remaining app
parity. `LEGACY_SOURCE_READ_TOKEN` remains necessary for original source
image capture; the absence of that token does not imply screenshot parity.
PR #1 remains draft; no merge or release.

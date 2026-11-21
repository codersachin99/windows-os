# Frozen Explorer Send to → Compressed (zipped) folder — 21 November 2026

**Frozen original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `codersachin99/windows-os` branch `feat/0001-faithful-react-foundation`, draft PR #1. Do not modify original or target `main`.

## Original source and missing behavior

The pinned original `src/modules/system/main.js` **ExplorerItemMenu**
contains a `send-to` parent with **two enabled source children** in
this exact order:
1. `this.$t("compressed-folder")` with `click:()=>this.compress(this.paths)`;
2. `this.$t("desktop-create-shortcut")` with `click:this.sendToDesktop`.

This source submenu is hidden in archives/mapped directories, not a
generic decorative popup. The target had ported
`Desktop (create shortcut)` for real Guest disk paths, while
`Compressed (zipped) folder` was hard-coded disabled—even for a
normal Guest Documents file. The original compression helper is part
of the legacy runtime and is not identical to the target implementation.

## Bounded functional implementation

- `packages/filesystem/src/sourceArchive.ts`: create a valid ZIP
  with existing `fflate` from selected virtual `FileEntry`
  bytes (UTF-8 text or binary), retaining selected directory
  structure including empty folders, and writing the ZIP to the
  same selected item's parent Guest folder. Single item uses a
  file stem / directory name; multi-selection uses `Archive.zip`.
  Existing filenames get a ` (2)`, ` (3)` suffix, never silently
  overwrite. The ZIP is built before one
  `VirtualFileStore.createFilesAtomic` operation; a missing item,
  collision, invalid path or storage/quota error cannot leave an
  incomplete destination ZIP. No browser host file picker,
  native compression API, or host filesystem paths are involved.
- The Guest archive adapter checks every selected path is a direct
  child of one real directory underneath
  `SOURCE_COMPUTER_ROOT` (`/EXTERNAL/computer`) and exists in
  the Guest virtual volume. It rejects the synthetic Computer
  root, deleted Bin items, foreign/escape paths, and any
  missing source. File contents/metadata come only from the
  Guest `VirtualFileStore`. To avoid synchronous compression
  freezes and browser quota exhaustion, max uncompressed payload
  is **32 MiB**, max **2048 entries**, max nesting depth **64**.
  These are deliberate safety bounds **not claimed as original
  source limits**, and should be revisited if the VFS gains
  streaming/worker compression.
- `packages/apps/explorer/src/sourceExplorerItemMenu.ts` now
  receives **independent** availability flags for `compress`
  and `desktop`. The previous default remains unavailable so
  callers without a Guest mounted path cannot accidentally enable
  ZIP creation.
- `packages/apps/explorer/src/ExplorerApp.tsx` checks mounted
  Guest selection, enables actual ZIP command, uses the shared
  operation error path, closes the context menu and selects
  the new ZIP. Archive extraction/Extract Here remains disabled:
  this change **does not** invent an extraction service.
- `packages/filesystem/src/index.ts` exposes only the
  source compression adapter and its explicit bounds.

## Regression coverage

- `packages/filesystem/src/sourceArchive.test.ts`:
  **6 unit cases** for UTF-8, binary bytes, nested/empty directories,
  multi-selection, archive filename collisions and originals
  unmodified, root/foreign/traversal rejection, missing Guest
  items and no partial archive.
- `packages/apps/explorer/src/sourceExplorerItemMenu.test.ts`:
  independent source order and ZIP/Desktop enabled/disabled checks.
- `tests/e2e/source-explorer-send-to-compressed.spec.ts`:
  **2 actual Playwright cases × desktop/mobile**:
  upload binary Guest file, invoke real context Send to ZIP, download
  archive through existing Download action and inspect unzipped
  exact binary bytes; plus multi-select two Guest TXT files,
  archive both, repeat into collision-safe `Archive (2).zip`
  and verify neither original nor first archive is lost.
- Existing Explorer keyboard, item-menu and Classic theme tests
  are adjusted to require **enabled** compressed child and
  first enabled keyboard focus when using Documents; source
  virtual Computer `/` remains disabled; existing High Contrast
  text tests now check compressed is genuinely enabled for
  a supported path. New e2e suite added to the focused
  **opt-in** GitHub Actions gate, with opt-in `[run-ci]`
  policy unchanged.

## Acceptance boundary

This is a **real bounded source action**, not full original
compression/extraction parity: output filename details, giant archives,
hidden metadata, source folder permission behavior, and
archive extraction/opening require source-paired functional
comparison and additional work. All 37 themes and the complete
source-to-React screenshot matrix remain unverified. The
`LEGACY_SOURCE_READ_TOKEN` visual job remains skipped without
approved read-only private reference access.

At time of writing, preceding Classic
[CI #44884377212](https://github.com/codersachin99/windows-os/actions/runs/44884377212) and
[#44884540994](https://github.com/codersachin99/windows-os/actions/runs/44884540994)
**SUCCESS** exact-head browser suites; newer Classic
Computer/Bin [CI #44887093277](https://github.com/codersachin99/windows-os/actions/runs/44887093277)
had passed focused Chromium and was running the full suite.
None of these older SHAs covers this ZIP work.
A fresh exact-head `[run-ci]` must pass source audits, TypeScript,
units, build, focused and full Chromium desktop/mobile before
calling ZIP source parity verified. Keep PR draft, no main merge
or release.

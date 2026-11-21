# Explorer item → Extract here, mounted Guest ZIP slice — 21 November 2026

**Frozen reference:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`
**Target:** `feat/0001-faithful-react-foundation`, draft PR #1. Original, target main and releases unchanged.

## Source trace and behavior

The pinned `src/modules/system/main.js` ExplorerItemMenu source exposes
`extract-here` only for one selected archive outside an archive view; its
handler calls `extractHere(this.data.path)`. The original source recognises
multiple archive extensions. Until this change the React item menu displayed
the label but disabled it for *all* formats even though compressed Guest ZIP
creation was already implemented. This slice enables actual `.zip`
extraction only when the ZIP is a direct mounted-Guest folder child.
Other original archive types (`.rar`, `.7z`, `.tar`, `.gz`) remain
visibly disabled; do not label them supported.

## Implemented

- `packages/filesystem/src/sourceExtract.ts` validates Guest mount, source
  ZIP, member paths and decoded member size/count/depth. Uses existing
  `fflate.unzipSync`, with a metadata filter to bound expansion before
  decompression. Bounds: 32 MiB archive/uncompressed data, 2,048 member
  entries, 64 directory components; these are target safety restrictions,
  **not** claimed original source archive limits.
- Rejects absolute/drive/parent traversal, backslashes, control characters,
  ambiguous case aliases, malicious object-key path segments, duplicate
  entries, file/directory conflicts and existing file collisions. No host
  files or native arbitrary disk paths. No partial output.
- `VirtualFileStore.createTreeAtomic` validates all target folders/files
  in one staged map and persists **one** transaction. Failed checks,
  storage/quota errors and existing items leave Guest data unchanged.
  Empty folders and nested binary file bytes are retained. Valid UTF-8
  text extensions remain Notepad-readable and are round-trip checked
  byte-exactly before being stored as text.
- `sourceExplorerItemMenu` keeps the original item action order and
  enables `Extract here` only for one eligible `.zip`; `ExplorerApp`
  calls the real extractor, selects its first extracted root, and surfaces
  failure through the existing Explorer error notice.
- The source DesktopItemMenu **also** has its own `extract-here` entry
  for path-backed archives. This release slice covers **Explorer only**;
  Desktop extraction and complete source archive UI are separate pending work.

## Verification and outstanding parity

- Unit tests: `packages/filesystem/src/sourceExtract.test.ts` (nested
  binary/text/empty folder, compression roundtrip, no-overwrite, traversal,
  case collisions, bad/unsupported ZIP, quota rollback), plus
  `packages/apps/explorer/src/sourceExplorerItemMenu.test.ts` action gates.
- Browser: `tests/e2e/source-explorer-extract-here.spec.ts` exercises real
  desktop/mobile Guest ZIP upload, context menu action, extracted subfolder,
  downloaded binary bytes and error/rollback; unsupported RAR stays disabled.
- Focused opt-in CI: `.github/workflows/react-checks.yml` includes the
  browser suite, and the full desktop/mobile Chromium suite runs with
  TypeScript, unit tests, source/artwork/Contacts audits and Vite build
  whenever a commit explicitly contains `[run-ci]`.
- The source-vs-React paired screenshot gate remains unavailable until the
  private `LEGACY_SOURCE_READ_TOKEN` is configured. Therefore **no pixel
  parity** is claimed for any of the original 37 themes. Archive filenames,
  source confirmation/overwrite prompts and non-ZIP formats are still
  incomplete. PR #1 stays **draft**, with **no merge or release**.

The existing Desktop Send-to-ZIP exact-head [CI #44898625505](https://github.com/codersachin99/windows-os/actions/runs/44898625505) is **SUCCESS**, but was run
**before** these extraction commits and does not verify them.

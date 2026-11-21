# Source Windows 2000 Start → Search entry — 21 November 2026

**Immutable original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `codersachin99/windows-os` branch `feat/0001-faithful-react-foundation`, draft PR #1. No original or target-main changes.

## Frozen source truth

`src/modules/shell/startmenu-win9x.js` (webpack module `015b`), method
`openSearch()`, explicitly dispatches `OpenWindow({id:"computer",file:{path:null,search:true}})`
when `this.isWin2k`; otherwise it calls `this.open("find")`.
The Start menu then closes. The original 2000 entry opens an **empty
Computer Search mode**, not the default Computer folder or the separate
Windows 95/98 Find app. This is a functional Start/Computer gap, not a
request to approximate the original classic visuals.

## Target port

- `packages/filesystem/src/sourceSearchPath.ts`: distinct internal
  `SOURCE_WIN2K_START_SEARCH_PATH="shell:win2k-start-search"` transport.
  It is **not** a `shell:search?...` results query, nor a physical VFS
  path. This is an internal representation of the original structured
  `file.search=true` launch flag, not a URI claimed to exist in source.
- `packages/ui/src/StartMenu.tsx`: Win2k Search now opens Computer with
  that search-mode signal and closes Start; Win95/Win98 retain the real
  standalone Find action.
- `packages/apps/explorer/src/ExplorerApp.tsx`: resolve the signal to
  mounted Computer root and initialize the existing functional
  `SearchCompanion` pane. Do not auto-run a blank file query.
  Companion's original location/name/type/date/size form and shared
  Guest-only search remain the single implementation; no native file
  or host filesystem permissions introduced.

## Regression

- `packages/filesystem/src/sourceSearchPath.test.ts` ensures the internal
  Start signal cannot be mistaken for source search results or a VFS path.
- `tests/e2e/source-win9x-shell.spec.ts`, already included in the
  opt-in focused Actions suite, checks 2000 Start opens the real
  Computer Search Companion with an editable focused filename and
  enabled Search command, while 95/98 still open Find.
  Runs on configured desktop/mobile projects.

## Limitations and acceptance

A dedicated source-versus-React screenshot/interaction comparison for
this state is **not yet verified**. The original `file.search=true`
window descriptor isn't fully represented as a typed cross-app shell
window capability yet; the distinct internal route is a bounded adapter.
Remaining 37-theme visual matrices, Help service, source backend,
other applications and complete shell parity are not claimed complete.

These edits must pass one deliberate exact-head `[run-ci]` gate
covering TypeScript, units, pinned source/artwork/Contacts, build,
focused and complete desktop/mobile Chromium; do not label them
verified before the actual result. No merge/release until full source
acceptance, and do not change the frozen original.

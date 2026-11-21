# Desktop item Extract here — frozen source parity slice, 21 November 2026

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`
**Target:** `codersachin99/windows-os@feat/0001-faithful-react-foundation`, draft PR #1.
Source, target `main`, releases and CI opt-in policy unchanged.

## Original source contract

Pinned `src/modules/system/main.js` component `DesktopItemMenu`,
`items()` exposes **Extract here** after taskbar Pin/Unpin and before
**Send to Desktop**, only for one archive-backed `this.shortcut.path`.
The source action is `this.extractHere(this.shortcut.path)`; it is not an
Explorer-only command and must not be omitted for Desktop ZIPs or
source path-backed `.lnk` shortcuts. The original archive-type predicate
is shared with Explorer. Source allows additional archive formats which the
current target ZIP extraction engine does not decode.

## React implementation

- `packages/ui/src/sourceDesktopItemMenu.ts`: preserve original action
  order; show **Extract here** only for a single ZIP/RAR/7z/TAR/GZ archive
  (direct file or source `.lnk` with an archive target). Enable it only
  for a genuine supported ZIP in a mounted Guest folder; leave unsupported
  formats visibly disabled, not simulated. System Computer, Bin, ordinary
  files, folders and multi-select never receive an extract action.
- `packages/ui/src/DesktopIcons.tsx`: route direct Desktop `.zip` files
  and validated `.lnk` Guest targets to the **same**
  `extractSourceGuestZip` adapter used by Explorer. Extraction happens
  inside the archive's actual parent directory; for a Desktop shortcut to
  a ZIP in Documents, the output remains in Documents, not Desktop.
  Desktop results are selected when they live on the Desktop; other
  results update the already shared Guest filesystem. Errors surface in
  the existing Desktop alert, without fake success or host operations.
- No second unzip algorithm is added. Existing
  `VirtualFileStore.createTreeAtomic` handles nested file/folder creation
  in one persisted VFS transaction and rejects existing-target collisions,
  unsafe ZIP entry names and over-expansion. Limits 32 MiB / 2048 entries /
  64 path components are conservative target safety caps, not claimed
  original-source behavior.
- `Properties`, other archive formats and original overwrite-prompt
  interaction remain unimplemented. This does not imply full Desktop,
  app, theme, or source screenshot parity.

## Regression/acceptance contract

- `sourceDesktopItemMenu.test.ts` tests exact action ordering, enabled
  ZIP gate, disabled unsupported formats, source `.lnk` target names and
  hidden system/multiple action.
- `source-desktop-extract-here.spec.ts` covers Win7 desktop/mobile actual
  binary bytes, a valid text file opened in Notepad, empty folders, ZIP
  preserved, no-overwrite/error rollback, unsupported format gating, and
  Explorer-created source `.lnk` targeting an archive in Documents.
- The focused browser workflow includes the new spec. A deliberate
  `[run-ci]` commit must verify TypeScript, all units, original inventory,
  artwork and Contacts audits, Vite, focused source browser suites and
  complete desktop/mobile browser suite.
- Previous **Explorer extraction exact-head**
  [CI #44905733445](https://github.com/codersachin99/windows-os/actions/runs/44905733445)
  completed **SUCCESS** at `d143ba3`, but is an earlier snapshot and
  **does not** verify Desktop changes. Paired original React visual
  screenshots still lack `LEGACY_SOURCE_READ_TOKEN`, so all 37 themes'
  full visual parity remains **unverified**.
- Keep draft PR #1 open, no merge, no release and no source/pinned commit
  mutation until actual full parity gates are satisfied.

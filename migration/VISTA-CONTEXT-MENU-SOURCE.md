# Windows Vista Desktop / taskbar / Explorer / Bin context source menu — 21 November 2026

**Pinned reference:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**React target:** draft PR #1, `feat/0001-faithful-react-foundation`.
Source and target `main` unchanged.

## Original source verification

The exact `src/modules/themes/theme-winvista-scss.js`
`.winvista .winui-menu` paints a **#f1f1f1** surface,
**#979797** border, `4px 4px 3px -2px rgba(0,0,0,.50196)`
directional shadow plus `inset 0 0 0 2px #f5f5f5`.
It adds a 2px vertical icon/check gutter offset by source
`--menu-offset` and `--menu-padding` and highlights a row
with `#aaddfa` border and a white/pale-blue gradient.
For RTL the directional shadow and gutter are mirrored.
The corresponding `theme-win7-scss.js` has the **same**
menu contract. These are source values, not a new skin.

The React port had already implemented Vista `StartMenu.tsx`
recent programs, configured power button, and the portaled
Start program menu through `sourceStartContextThemes.css`.
But `sourceThemeShellStatus("winvista")` still reported
`pending`, and the Desktop/taskbar/Computer/Bin shared
context menus did **not** match source Vista WinUI paint.

## Narrow implementation

- `packages/contracts/src/sourceThemeCatalog.ts` now returns
  `partial` for `winvista`. Its catalog entry's original
  `boot/logon="winvista"` mapping is unchanged. The source
  Vista login renderer still uses the **documented Win7
  fallback**, not an invented Vista screen. This does NOT
  mark whole-theme source parity or a complete original login.
  The count of partial source shell themes changes from
  25 to 26; other 11 theme IDs still remain pending.
- `packages/apps/explorer/src/sourceExplorerContextTheme.css`
  includes Vista in the exact existing Win7-source menu
  surface/gutter/row-gradient selectors, for root and nested
  Computer / Recycle Bin menu surfaces.
- `packages/ui/src/sourceDesktopContextThemes.css` maps the
  same original Vista menu to real Desktop and taskbar popup
  components, including original 2px gutter, shadow, border,
  hover gradient and RTL directional variants. It does not
  alter the Start menu implementation, commands or app engine.
- `packages/contracts/src/sourceThemeCatalog.test.ts` asserts
  `partial` Vista and existing mapping. The source login
  catalog browser suite asserts Vista's exact source-screen
  ID with honestly-labeled fallback.
- New `tests/e2e/source-vista-context-themes.spec.ts`
  executes **3 scenarios × desktop/mobile Chromium**:
  Desktop and Computer icon context paint and real Open;
  taskbar background context menu and real Task Manager;
  Computer and Recycle Bin background menus plus nested
  View, requiring original source colors, bevel, gutter,
  gradient and actual command items. The suite is included
  in the focused opt-in Actions gate.

## Acceptance / known limits

Previous corrected [CI #44828332062](https://github.com/codersachin99/windows-os/actions/runs/44828332062)
**passed** full TypeScript/unit, source/artwork, Contacts,
Vite, focused and full desktop/mobile tests at `5112f35`,
BEFORE this Vista change. A new exact-head `[run-ci]`
must complete before this Vista slice is verified.
Source-and-target matched pixel screenshots remain pending
the locked private reference checkout; this is source-css
token verification only, not complete visual parity.
`main` stays intact, PR stays draft and no release is ready.

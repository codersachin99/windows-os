# Win7 / Aero 1–4 / Basic 1 Desktop and taskbar source menus — 21 November 2026

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**React target:** `codersachin99/windows-os`, branch `feat/0001-faithful-react-foundation`, draft PR #1. Original source and target `main` unchanged.

## Pinned source comparison

`src/modules/themes/theme-win7-scss.js` styles `.win7 .winui-menu`
as a **#f1f1f1** surface, **#979797** border,
`4px 4px 3px -2px rgba(0,0,0,.50196)` drop shadow plus
`inset 0 0 0 2px #f5f5f5` bevel; its separator/gutter is
a 2px vertical `::before` bar under `--menu-offset` and
`--menu-padding`. Menu rows highlight with a `#aaddfa`
border and three-stop white/pale-blue gradient; RTL mirrors
the horizontal shadow/gutter. Original Aero 1–4 and Basic 1
share the Win7 base UI-family theme rather than the Win9x or
Win7-classic (Basic 2/3/4 high-contrast) menu classes.

React Computer/Bin `sourceExplorerContextTheme.css` had
already transcribed this Win7-family root and child menu skin.
The actual Desktop `[data-test-desktop-menu]` and taskbar
`[data-test-taskbar-context]` still inherited generic React
blue-gradient popup styles from `DesktopIcons.css` and
`windows7.css` for Win7/Aero/Basic1.

## Bounded implementation

- `packages/ui/src/sourceDesktopContextThemes.css` now maps
  the above original Win7-family surface, gutter, bevel,
  hover, border and RTL to Desktop and taskbar context menus
  for six exact source IDs:
  `win7`, `aero-1`, `aero-2`, `aero-3`, `aero-4`,
  `basic-1`. Real action handlers and ordering are unchanged.
  The existing Vista dedicated rules remain intact.
  Classic `basic-2`, `basic-3` and `basic-4` retain their
  separate source contrast menus and are intentionally excluded.
- `packages/ui/src/sourceWin7BasicVariants.css` previously
  applied the original `.basic-1 .taskbar__tray .taskbar-popup`
  color/border/no-shadow override to *all*
  `.windows-taskbar__context` surfaces. That was too broad:
  the right-click background/launcher menus inherit
  `.win7 .winui-menu`; the tray popup is a different source
  component. Removed the leaking selector and documented the
  still-pending isolated tray-popup mapping. This is **not**
  removal of Basic 1's 40px taskbar, opacity or caption styling.
- `tests/e2e/source-win7-aero-context-themes.spec.ts` adds
  **15 real Playwright cases × desktop/mobile**: Win7, all
  four Aero IDs and Basic1 Desktop background menu/Computer
  action; same families' taskbar Task Manager action; and
  Aero2/Aero4/Basic1 Computer View child menu. All cases assert
  source computed menu background/border/inset bevel/pseudo
  gutter and real hover gradient/commands, not CSS text.
  Added the suite to the opt-in focused CI browser gate.

## Verification status / no completion claim

Previous [Vista CI #44836963645](https://github.com/codersachin99/windows-os/actions/runs/44836963645)
at `ed6012a` **SUCCESS** with TypeScript, unit, source/artwork
and Contacts audits, Vite build, focused and full desktop/mobile
Chromium; source/target paired capture SKIPPED.
**These Win7-family changes are newer than that CI** and need
their own exact-head `[run-ci]`. Even if it passes, the entire
desktop shell, all source themes and pixel-by-pixel source
captures remain unverified. Do not merge draft PR #1 or
publish a release based on these bounded CSS checks alone.

# Vista Start menu and program context migration — 20 November 2026

**Frozen original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `codersachin99/windows-os` draft PR #1 on
`feat/0001-faithful-react-foundation`. `main` untouched.

## Source proof and found regression

Original `src/modules/shell/startmenu-base.js` explicitly supports
Vista through `isVista() { return "winvista" === this.theme; }` and
`searchStyle() { return this.isVista ? "vista" : "win7"; }`.
It uses shared `recentPrograms` and configurable `powerButtonAction`
surfaces. React's existing `isWin7StartFamily` predicate included
`win7`, four Aero and four Basic IDs, but not `winvista`.
Consequently the React Vista Start menu silently omitted real
recent history and the configured shared power action even though
the original uses the same base Start engine.

Original `src/modules/themes/theme-winvista-scss.js` uses a
Win7-like `.winui-menu` system popup: `#f1f1f1` panel, `#979797`
border, original inset 2px highlight, 2px icon gutter and light
gradient hover with `#aaddfa` outline. The target program context
was still generic because its `createPortal` mount is outside
the desktop theme tree.

## Bounded implementation

- `packages/ui/src/StartMenu.tsx`: include `winvista` in shared
  Start family recent list, layout and configurable power button.
  Keep actual source recent-history store, Guest launch, All Programs
  and existing power dispatch; do not introduce fake host programs.
- `packages/ui/src/sourceStartContextThemes.css`: the Vista popup
  gets an independent data-theme scoped original style including RTL
  icon gutter and shadow. Explorer/Desktop menus are unchanged.
- `tests/e2e/source-vista-start.spec.ts`: 3 browser scenarios on
  desktop and mobile validating initial/persisting real recent
  program appearance, All Programs separation, configured Switch user,
  source computed popup/hover styling, and real Pin to taskbar.
  Added to the opt-in focused browser test job.

## Explicit remaining gaps

The original Vista-only `searchStyle:"vista"` and `searchPlaces`
UI details are **not** fully transcribed merely by including Vista
in the family predicate. Original Vista wallpaper/boot/logon, taskbar,
Start content layout, source account behavior, installed shortcut
catalog and source-paired screenshot fidelity all remain unaccepted.
No whole theme is called implemented. New Vista tests require
exact-head opt-in CI and original image comparison.

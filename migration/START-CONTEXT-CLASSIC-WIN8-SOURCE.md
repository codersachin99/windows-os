# Original Win31 / Win9x / Win8 Start-program context popups — 20 November 2026

**Source pinned:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `codersachin99/windows-os` draft PR #1,
`feat/0001-faithful-react-foundation`. Original files and `main` untouched.

## Original source paint and the migration gap

The React Start menu in the existing Windows 3.1 Program Manager, Windows
95/98/2000 cascading Start menus, and Windows 8/8.1 tile screen correctly
uses `StartMenu.onContext` to show the same program-action popup. That
popup uses `createPortal(document.body)` and has no theme-context
ancestor, so earlier `.windows-desktop[data-theme]` CSS could not style
the actual popup. This is separate from Desktop and Explorer context
menu skins that were already adapted.

| Original frozen theme module | React variant | Original menu appearance |
| --- | --- | --- |
| `src/modules/themes/theme-win31-scss.js` | `win31` | white, black 1px border, grey 1px right/down shadow; bold menu text, hovered white-on-`#080abd` |
| `src/modules/themes/theme-win9x-scss.js` | `win95` | `#bdbebd` beveled surface, white-on-`#00007b` selection |
| same shared Win9x module | `win98` | `#c0c7c8` surface, white-on-`#0608a6` selection |
| same shared Win9x module | `win2k` | `#d4d0c8` surface, white-on-`#082767` selection |
| `src/modules/themes/theme-win8-scss.js` | `win8`, `win81` | `#f0f0f0` theme surface, black 40% border, 1px grey icon gutter, 4px-right shadow, hover `rgba(146,200,253,.2)` + `#8acfff` outline |

Win9x/Win8 directional shadows and menu gutter mirror the source
LTR/RTL declarations. This is styling for the already-existing program
context action engine, not a replacement of the pinned Start layout.

## Changes and evidence

- Added bounded family selectors to
  `packages/ui/src/sourceStartContextThemes.css`, using the
  original theme ID already present on the detached menu.
- Added `tests/e2e/source-start-context-classic-win8.spec.ts`:
  six Playwright cases running in desktop and mobile Chromium,
  verifying the actual Program Manager icon context, Win9x Programs
  submenu icon context, and Win8 installed tile context.
  Each checks the portaled menu theme, computed paint, hovered active
  action and a real successful Pin to taskbar.
- Added this test file to the focused opt-in GitHub Actions regression
  step, in addition to the existing complete e2e test command.
- Fixed one earlier assertion typo for XP Royale `winxpR`:
  `#335ea8` is `rgb(51,94,168)`, **not**
  `rgb(51,90,168)`. The actual CSS was correct; previous opt-in
  [CI #44765901335](https://github.com/codersachin99/windows-os/actions/runs/44765901335)
  had 578 passed, 2 failed, 2 skipped from that same test on two
  profiles, preventing the full suite from running.

## Acceptance limits

At writing, the extended Win31/Win9x/Win8 and corrected XP Royale
browser tests still require **one exact-head `[run-ci]`**.
Do not claim them passed until GitHub Actions confirms it.
The original Vue menu-item DOM structure, exact icon/check glyphs,
all source families, theme sound effects, source-vs-target screenshot
matching and native host boundaries remain incomplete. Preserve
draft status until objective parity gates are available.

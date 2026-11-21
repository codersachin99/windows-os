# Source window chrome and titlebar controls

Checkpoint: 17 November 2026. Reference:
`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

This is a **source-pinned CSS/behavior migration**, not a claim of
pixel-perfect original paired screenshots. The React WindowFrame already
hosts actual Guest apps and their minimize, maximize, drag, focus and
close lifecycle; the original Vue `.window__main` geometry needed
translation to that frame's class names.

## Original source contracts

| Theme | Frame and titlebar | Caption controls |
| --- | --- | --- |
| Windows 7 | Inactive 6px corner, active 7px, black 1px border, 6px inset padding, layered 140°/225° translucent white gradients; active shadow and glass blur | 20px high; red close is 48px wide; bottom-left/bottom-right control group rounding; maximized frame removes its border and padding |
| Windows XP | 8px upper corner, four layered side and top gloss gradients, 1px colored border, blue active background; white bold title and dark text shadow | 24×24px, 3px gap and 3px rounding; glossy blue buttons and red close; maximized frame loses corner rounding |
| Windows 11 | Neutral #f0f0f0 frame, 8px corners, 1px #0003 border, 0px padding; active shadow grows to 24px and can use the dynamic `--theme-color` | 44×30px, neutral background, 50% idle opacity, #0001 hover, red #c42b1c close hover; maximized frame loses border and rounding |

Source files:
`src/modules/themes/theme-win7-scss.js`,
`src/modules/themes/theme-winxp-scss.js`, and
`src/modules/themes/theme-win11-scss.js`, specifically their
`.window__main`, `.window__titlebar`,
`.window__control-list`, `.window__control-item` declarations.

## Implementation

- `packages/ui/src/sourceWindowChrome.css` adapts the actual original
  frame gradients, border geometry, titlebar text styling, button sizes,
  active/inactive shadows, Win11 hover treatment and maximized resets
  to the shared `.windows-window` markup. Loaded **after**
  `windows7.css` and `sourceShellTheme.css`.
- `WindowFrame` now explicitly receives `active`, emits
  `is-active` and `data-source-window-active`. This is derived from
  the highest nonminimized Guest desktop window `z` in
  `DesktopShell`, instead of accidentally painting every open window
  as selected. Minimized programs remain mounted but never active.
- `DesktopShell` taskbar button handling now focuses a visible **background**
  window instead of minimizing it. Clicking the already-active visible
  window minimizes it, and clicking a minimized button restores/focuses
  it. This prevents taskbar focus indicators from conflicting with the
  source active-window frame. The source chrome browser test exercises
  Computer/Bin z-order through this real taskbar behavior.
- A maximized `WindowFrame` now reserves
  `var(--taskbar-height, 40px)`. This preserves Windows 7/XP's 40px
  and Windows 11's 48px taskbar and avoids swallowing the last 8px of
  maximized content.
- `tests/e2e/source-window-chrome.spec.ts` uses computed browser
  styles and real window controls to verify each theme's radii,
  borders, caption sizes and colors, original maximized bottom inset,
  restore, close, and focus transfer between Computer and Bin.
- The test is in the opt-in **focused** CI gate. Previous source
  VFS, taskbar, theme/start tests remain in the full suite.

## Additional full-suite regression correction

Earlier icon-geometry [CI #44135610739](https://github.com/codersachin99/windows-os/actions/runs/44135610739)
failed **one** full browser test in
`explorer-context-source.spec.ts` although 619 unit and 124 focused
browser tests passed: keyboard Right opening **View** could
unexpectedly flip to **New** from a pointer-entry event while the
menu was repositioning. Explorer background menus now use
`onPointerMove` instead of `onPointerEnter`/`onPointerOver`
for hover switching, so keyboard focus cannot be overridden by
pointer-entry events caused by layout change. Real mouse movement
still switches submenus.

## Remaining gaps

The next milestone ports the pinned original compiled `ControlItem`
SVG paths (rather than Unicode glyphs) for Aero/WinXP/Win11, including
restored-window state. See `migration/WINDOW-CONTROL-GLYPHS-SOURCE.md`.
Source-vs-React pixel rendering of those glyphs remains unverified. Win7 and Win11 source
`--theme-color` is configurable, so the style uses a fallback tint
until the complete original theme token service is migrated.
Window resizing, RTL theme behavior, source shadow effect preferences
and screenshot pixel comparison still need independent parity tests.
Do not merge PR #1 or create a release until verified.

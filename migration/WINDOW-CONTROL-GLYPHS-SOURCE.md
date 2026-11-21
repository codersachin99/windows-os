# Original titlebar SVG controls — source-paired code audit

Checkpoint 17 November 2026, reference commit
`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

## Exact source

Original compiled Vue `ControlItem` / `WindowControl` lives in
`src/modules/chunks/shared~about~bin~bsod~calc~camera~chess~chrome~cmd~computer~cpanel~find~gadgets~games~ie~installer~i~40bd2819.js`,
Webpack module `e863`.

Its original `isVariant1` checks `/^aero|basic-1|winvista/`,
`isVariant2` checks `/^winxp|^winL|winW/`, and the fallback
covers Win11. React's `win7` theme corresponds to original Aero
and uses variant 1. The source chooses one of `minimize`,
`maximize`, `restore` and `close`; while maximized, the
second control changes from `maximize` to `restore`.

| Theme | Minimize SVG | Maximize SVG | Restore SVG | Close SVG |
| --- | --- | --- | --- | --- |
| Windows 7 Aero | 12×12, viewBox `0 -3 12 5` | 12×12, `0 0 17 15` | 12×12, `0 0 21 21` | 13×12, `0 0 13 12` |
| Windows XP | 14×14, `1 -5 7 7` | 14×14, `0 0 9 9` | 14×14, `0 0 11 12` | 14×14, `0 0 11 11` |
| Windows 11 | 12×12, `0 -3 10 1` | 12×12, `0 0 10 10` | 12×12, `0 0 12 12` | 14×14, `0 0 10 11` |

Prior React `WindowFrame` drew three Unicode text characters
(`─`, `□`, `×`) for every theme and continued to show maximize
even after the state was maximized. Fonts differ across browsers;
these marks cannot be source-pixel faithful.

## Implementation and coverage

- `packages/ui/src/SourceWindowControlGlyph.tsx` transcribes the
  original compiled SVG `path` / `rect` data, exact viewBoxes,
  dimensions, XP's two-path outlines, and the Win7 Aero white-to-gray
  gradient stop sets for all four control types. Stable React
  `useId` gradient IDs avoid collisions among multiple windows.
  Non-target themes safely keep the original fallback SVG instead
  of the earlier browser Unicode glyph.
- `WindowFrame` receives the current Guest theme and renders SVG
  controls with `aria-hidden` while keeping the original, tested
  button accessible names and minimize/restore/close handlers.
  The original `restore` SVG and `data-source-window-control` state
  now replace maximize when the window is maximized.
- `sourceWindowChrome.css` centers glyphs using inline flex and
  zero line height, preserving the CSS caption-button dimensions
  from the previous source window-chrome milestone.
- `tests/e2e/source-window-control-glyphs.spec.ts` checks actual
  SVG `viewBox`, `d` path data, gradient stops, state swap,
  accessible keyboard close, and restoration in each theme on
  desktop/mobile. Included in opt-in `[run-ci]` focused browser gate.
- This change does not introduce a new asset download, modify
  Guest VFS permissions, alter the host OS, or affect app lifecycle.

## Outstanding

Although SVG source geometry now comes directly from the pinned
code, exact titlebar screenshots remain unverified. Original image
buttons for other themes beyond Aero/XP/11, high-DPI pixel rendering,
user-configurable glass/shadow/accent options and RTL positioning
still require separately verified source-to-React parity. Maintain
draft PR #1, no main merge and no release until tested runnable parity.

# Explorer source theme menu skins — 17 November 2026

## Pinned original implementation

Original repository `codersachin99/legacy-win7` at
`4e63290d783009e1293433c6ccf252abba9c1187`:

- `src/modules/themes/theme-win7-scss.js` original `.win7 .winui-menu`.
- `src/modules/themes/theme-winxp-scss.js` original `.winxp .winui-menu`.
- `src/modules/themes/theme-win11-scss.js` original `.win11 .winui-menu`.
- Shared menu base: `src/styles/system/vue-app.css` `.winui-menu`.

The React Computer/Bin context menu previously reused one blue-gray,
gradient-styled surface across **all** themes. This was an observable
look-and-feel mismatch even when exact source wallpaper and program
artwork were present. The original styles differ:

| Theme | Parent and child menu surface | Border | Shadow | Hover |
| --- | --- | --- | --- | --- |
| Win7 | `#f1f1f1`, white inset stroke | `#979797` | `4px 4px 3px -2px #0008` plus inset `2px #f5f5f5` | `#aaddfa` stroke with pale translucent white/blue gradient |
| WinXP | inherited source base `#fff` | disabled text `#aca899` | `4px 4px 2px -2px #0009` | accent `#316ac5` and white text |
| Win11 | bright `#f9f9f9` with `6px` radius/padding | `#0001` | `0 4px 6px #0003` | `#f0f0f0` |

The Win7 original has a thin inset separator at its icon gutter.
This adapter positions the separator 27px from the left inside the
React menu, preserving foreground hit testing. Its position should be
rechecked once paired original screenshots are available.

## Implemented

- `packages/apps/explorer/src/sourceExplorerContextTheme.css`
  is loaded after `ExplorerApp.css`. All declarations are scoped to
  the active `data-theme` and to Explorer's root and `Send to`/
  `View`/`New` submenus; no theme bleeds into another.
- Context actions and child commands remain the same VFS-backed,
  source-order handlers. Menu geometry, pointer-out, keyboard focus,
  disabled-archive actions and responsive edge-flip are untouched.
- Win7, XP and Win11 browser tests in
  `tests/e2e/source-explorer-context-themes.spec.ts` inspect computed
  colors/borders/radii, selected-row hover colors and nested menu
  styles on both Chromium desktop and mobile. Opt-in focused CI includes
  these tests. No mock CSS-only string matching is counted as acceptance.

## Important remaining differences

The parent/submenu React DOM differs structurally from original Vue
`winui-menu > [role=menuitem] > button`; this changes exact gutter,
checkmark and submenu-arrow styling, despite source palette equality.
Exact original theme-specific font assets, window chrome/button glyphs,
pixel-level screenshot comparisons, and additional theme IDs are
**not** verified. A green style test means only the listed computed
properties matched. Keep draft PR #1 and no release until source
screenshots are available and reviewed.

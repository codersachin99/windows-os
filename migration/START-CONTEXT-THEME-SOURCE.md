# Source Start-program context menu skin parity — 20 Nov 2026

**Frozen original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`  
**Target:** `codersachin99/windows-os` draft PR #1 / `feat/0001-faithful-react-foundation`

## Observed original contracts

The original webpack theme CSS provides distinct shared `.winui-menu`
skins in the immutable source. Unlike the React Explorer popup, the
React `StartMenu` program-action menu is `createPortal`-rendered
directly to `document.body` for safe viewport placement. Therefore
it has no `.windows-desktop[data-theme]` ancestor and cannot inherit
the active wallpaper/theme palette variables.

| Source module | Theme family | Exact source paint |
| --- | --- | --- |
| `src/modules/themes/theme-win7-scss.js` | `win7`, `aero-1..4`, `basic-1` | `#f1f1f1` surface, `#979797` border, 2px inset highlight, 2px bevelled icon gutter, `#aaddfa` hover border + pale gradient |
| `src/modules/themes/theme-win7-classic-scss.js` | `basic-2..4` | opaque `--theme-surface` panel, Win7 Classic inset bevel using `--border-color` and `--border-color--contrast`, white on accent hover |
| `src/modules/themes/theme-winxp-scss.js` | `winxp`, `winxpE/G/N/R/S/Z` | Tahoma, white popup, `#aca899` border, 4px×4px shadow, white on per-variant `--theme-accent` hover |

Basic 2 is original Windows Classic beige/blue; Basic 3 is black/
white/purple; Basic 4 is white/black/black. The XP variant highlight
palette is already source-audited in `sourceShellTheme.css`:

```text
winxp  #316ac5      winxpE #3e9de8   winxpG #93a070
winxpN #5e81bc      winxpR #335ea8   winxpS #bbb7c7
winxpZ #bebebe
```

## Implementation

- `packages/ui/src/sourceStartContextThemes.css` scopes source family
  colors and hover surfaces via `data-source-start-context-theme`,
  independently of the Desktop CSS tree and the browser/host OS theme.
- `packages/ui/src/StartMenu.tsx` imports the new isolated popup
  adapter after the existing Start theme stylesheet. The original
  `createPortal`, Guest pin/action engine, keyboard focus return, measured
  viewport placement and disabled Properties handling are unchanged.
- `tests/e2e/source-start-context-theme-families.spec.ts` opens real
  Start tiles, right-clicks Notepad, verifies the detached portal,
  checks original family panel/gutter/hover paints and clicks the
  working Pin action for every one of the 16 inspected variants on
  desktop and mobile Chromium. The focused opt-in Actions gate includes
  this test suite.

## Limitations / acceptance

These tests are **pending first exact-head CI**; do not describe
their success until GitHub Actions completes. A verified CSS palette
and functional popup are not the same as original pixel-perfect
screenshot parity. The source uses Vue menuitem wrappers and
per-action icons/checkmarks while React still uses a simple button
list; precise icon/label offsets, keyboard focus render, all remaining
theme families, submenu structure, latency and original-vs-React
paired images remain out of scope. The pinned source, main, draft PR
and releases must not be changed as part of this bounded fix.

# Windows 10/11 Start-program context menu source parity — 20 November 2026

**Frozen source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** draft PR #1 on `feat/0001-faithful-react-foundation`.
No source files or target main altered.

## Original source contract and identified deviation

The original Windows 10 Start menu's *panel* is dark, but its system
`.winui-menu` popup is **NOT dark**. The target portaled Start context
had erroneously adapted the dark Start panel to its program actions.

| Original source | Popup component | Original paint |
| --- | --- | --- |
| `src/modules/themes/theme-win10-scss.js` / `.win10 .winui-menu` | Win10 Start program context | `#eee` background, black text, `#a0a0a0` 1px border, square corners, 4px right/down black 53% shadow, `#fff` hover |
| `src/modules/themes/theme-win11-scss.js` / `.win11 .winui-menu` and `.win11` variables | Win11 light context | `#f9f9f9` background, `#1a1a1a` text, `#0001` border, 6px popup radius, 6px panel padding, 3px item radius, 32px left item indent, `#f0f0f0` item hover |
| same source / `.win11dark` variable overrides | Win11 dark context | `#242424` background, white text, `#fff1` border and item hover; identical geometry and `#0003` shadow |

The original Win11 **menu-item hover uses `--item-bg--hover`**,
not the separate `--theme-surface--hover` (`#e5f3ff`) that the
React popup previously used. Windows 11 dark's menu border and shadow
likewise follow pinned tokens, not a generic elevated dark card.

## Implementation

`packages/ui/src/sourceStartContextThemes.css` is already loaded
AFTER `sourceStartMenuThemes.css` by `StartMenu.tsx`.
Added direct `data-source-start-context-theme` overrides there for
Win10 light popup and Win11 light/dark original tokens, item padding,
hover and RTL direction. The popup remains in `document.body` via
React `createPortal`, independent of `.windows-desktop` theme vars.
The actual Win10 dark Start, Win11 Start, program list and Guest
`sourceStartProgramContext` Pin/Unpin/Send to Desktop action engine
are unchanged.

New Playwright `tests/e2e/source-start-context-modern.spec.ts` runs
**three tests per browser project (desktop and mobile)**. It verifies
real Notepad right-click in the Start menu, portal placement, computed
source border/surface/shadow-relevant geometry, hover and working Pin
to taskbar. For Win10 it checks simultaneously that Start remains
dark. The opt-in focused Actions gate includes this new file.

## Verification and limitations

Previous exact-head [CI #44782599216](https://github.com/codersachin99/windows-os/actions/runs/44782599216)
**passed** all TypeScript, unit, source/artwork audit, build, targeted
and full browser tests at `c2a7afd` (before these new changes).
The modern-popup change is **not verified** until the subsequent
exact-head opt-in `[run-ci]` completes. No original vs React paired
screenshots were obtained; this slice does NOT prove pixel parity,
icon/checkmark glyph parity, all Windows 10/11 Start layout states or
full original app behavior.

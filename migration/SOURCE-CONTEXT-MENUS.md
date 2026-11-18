# Original Windows XP / 10 / 11 context-menu source parity — 18 November 2026

**Immutable source reference:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. This work uses only source-matched colors, border sizes and popup behaviors. It is **not** an assertion of complete screenshot parity, final icon/checkmark geometry or that the many other source theme families are finished.

## Source evidence

- `src/modules/themes/theme-win10-scss.js` original `.win10 .winui-menu`: solid light **`#eee`** background, **`#a0a0a0`** 1px border, black text and **`4px 4px 3px -2px rgba(0,0,0,.5333333333)`** left-to-right shadow. The direct `role=menuitem` `button`/link/label **hover and focus background is white `#fff`**. This is intentionally **not** the dark `#2c2c2c` Start-menu sidebar styling from `src/styles/shell/startmenu-win10.css`.
- `src/modules/themes/theme-win11-scss.js` original `.win11 .winui-menu`: **6px** panel radius and padding, bright surface `#f9f9f9`, bright border `rgba(0,0,0,.0666666667)`, shadow `0 4px 6px rgba(0,0,0,.2)`, 3px item rounding and neutral `#f0f0f0` item hover.
- Original XP `.winui-menu` inherits white panel and **`#aca899`** border from source base style; selected enabled items use XP **`#316ac5`** blue with white text and classic Tahoma.
- `src/styles/system/vue-app.css` provides the underlying shared popup structure; these source adapters map style to React popup components without inventing a second menu registry or replacing keyboard/focus/action logic.

## Implemented and checked surfaces

| Actual React popup | XP | Win10 | Win11 |
| --- | --- | --- | --- |
| Desktop background **View / Sort / Refresh / New / Personalize** menu | source white/blue/Tahoma | source `#eee` / white hover | bright surface, rounded hover |
| Desktop **Computer / Bin / file** context actions | same scoped menu skin | same scoped menu skin | same scoped menu skin |
| Taskbar background and running-program context | source XP border/hover | source `#eee` panel and white hover | original 6px surface |
| Explorer Computer background and nested **View** menu | existing source adapter | **new source Win10 adapter** | existing source adapter |
| Explorer file item and **Send To** popup | existing source adapter | **new source Win10 adapter** | existing source adapter |
| Start program context | existing separate Start adapter | **retains original dark Start panel** | existing separate Start adapter |

- `packages/ui/src/sourceDesktopContextThemes.css`, imported after Win7 baseline styles in `apps/web/src/main.tsx`, provides theme-scoped XP/10/11 desktop and taskbar context styling; no changes to the canonical Win7 style.
- `packages/apps/explorer/src/sourceExplorerContextTheme.css` adds the pinned original Win10 colors for actual Explorer root and submenu surfaces while retaining existing Win7/XP/11 contracts.
- `tests/e2e/source-desktop-context-theme.spec.ts` uses actual Playwright computed CSS and Guest click/keyboard interaction for XP/10/11 Desktop background context, active Computer item context, plus taskbar menu actions.
- `tests/e2e/source-explorer-context-themes.spec.ts` now includes original Win10 root/child color, radius, item context, and Send To submenus. Both test files are included in the **focused desktop/mobile CI gate**. Tests preserve the source action list, disabled controls, Escape handling and real Guest application launches.

## Exact changes

- [`6f190c5`](https://github.com/codersachin99/windows-os/commit/6f190c52559a66663b49521874126564aa48a93f) original XP/10/11 Desktop/Taskbar menu skins
- [`de4fc44`](https://github.com/codersachin99/windows-os/commit/de4fc44595f9e245799b57af898bb43336282261) original Win10 Explorer menu/sublayer style and test case
- [`3da1c8f`](https://github.com/codersachin99/windows-os/commit/3da1c8f5d6697969de19bc00d31f048fd2186779) browser contracts for Desktop/Taskbar menus, registered in focused regression gate
- [`dfa7934`](https://github.com/codersachin99/windows-os/commit/dfa79346eac04816e5cf13483bd71e497555bf4e) exact XP source border and hover for taskbar context, not just desktop

## Verification and outstanding work

- Previous exact-head [CI #44327673276](https://github.com/codersachin99/windows-os/actions/runs/44327673276) **SUCCESS**, full TypeScript/unit/source inventory/image SHA/Vite/focused + full desktop/mobile browser suites, for boot changes on `c61ed7d`; it does **not** verify the new menu work.
- [Visual capture #44328456992](https://github.com/codersachin99/windows-os/actions/runs/44328456992) **SUCCESS** on `b5006e5`: **86 React desktop/mobile screenshots**, zero capture errors, **sourceCaptured:0**, `parityStatus:"not-assessed"`, because `LEGACY_SOURCE_READ_TOKEN` was not available to the GitHub runner. These are valuable reproducible React snapshots, *not* pixel-perfect source comparison.
- Run new deliberate `[run-ci]` checkpoint to validate these menu changes on the **exact branch head**. Full original-vs-React paired screenshots, submenu/checkmark/icon indentation, animation timings, other 16 family theme skins, Boot/Logon/Start/Computer/Bin parity and accessibility remain open tasks.
- Preserve PR #1 **draft**, original SHA, `windows-os/main`, CI opt-in policy and release restraint; no merge/release until faithful baseline is proven.

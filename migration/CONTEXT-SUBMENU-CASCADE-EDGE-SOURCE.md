# Desktop + Explorer + Bin cascading context menus — edge-flipping source parity

Date: 22 November 2026. Source locked: `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. Candidate: `codersachin99/windows-os` feature `feat/0001-faithful-react-foundation` (draft PR #1).

## User-reported functional defect

Background Desktop View / Sort by / New previously rendered their child menu items **inline in the root menu**, changing its height, obscuring actions, and never opening a flyout to the right or flipping to the left when it would cross the desktop's edge. Desktop item `Send to` used a fixed 194px width and `itemIndex * 27px` y-coordinate, which drifted for variable original theme row heights. This was visually and interactively unlike the source WinUI BaseMenu cascade and the already tested Explorer submenu model.

## Original source and geometry decision

The frozen legacy `src/modules/system/main.js` defines separate Desktop and Explorer context/cascading menu components. Existing `sourceExplorerSubmenuPlacement.ts` had source-derived geometry: measure parent, trigger row and child; choose right if it fits, otherwise left if it fits; clamp vertically; on tiny viewports where neither side fits, stack above/below the parent when possible without intercepting its button. Its unit tests and real Computer/Bin item/background menu regressions were green at prior CI.

## Cross-app migration

`packages/ui/src/sourceCascadingSubmenuPlacement.ts` is now the single pure common geometry function for Desktop and Explorer/Bin menus, exposing side ('right'|'left'), x/y offsets and narrow-screen stacking. `@windows-os/ui/menu-cascade` is mapped in TypeScript and Vite. `packages/apps/explorer/src/sourceExplorerSubmenuPlacement.ts` retains its old exported function/types as a re-export adapter of the same implementation; no Explorer consumer API change.

`packages/ui/src/DesktopIcons.tsx` renders Desktop View, Sort by and New options in a separate sibling popup with its own menu semantics/ref, not inside the root `overflow-y:auto` menu. The parent item rows keep their original order and dimensions. `useLayoutEffect` measures the root, its specific invoking row and the actual child dimensions in desktop-local CSS coordinates, uses shared side/vertical viewport positioning, and marks the resolved side/stack mode. Desktop `Send to > Compressed (zipped) folder` uses the same measured placement instead of a fixed row index. The sibling's keyboard ArrowUp/Down focus is constrained to its own actions; ArrowLeft returns focus to the invoking View/Sort/New row; Escape keeps existing Desktop focus restoration; right-click, drag and outside-click guards include the new popup. When no side fits on mobile, a stacked popup is not dismissed merely because the pointer crosses another root row.

`packages/ui/src/DesktopIcons.css` ensures a sibling submenu paints above the parent and stays inside narrow Desktop workspace bounds. All original theme-specific popup skins still apply via `.windows-desktop__menu`. Win95/98/2k Start menus already have `sourceWin9xSubmenuPlacement` for their independent narrow-screen cascade, so this slice does not replace that different Start source implementation.

## Acceptance tests

- `packages/ui/src/sourceCascadingSubmenuPlacement.test.ts`: pure shared right, left, narrow mobile stack and vertical clamp; former Explorer helper tests still use backward-compatible re-export.
- `tests/e2e/source-menu-cascade-edge-placement.spec.ts`: Win7, WinXP, Win11 dark, on Chromium desktop/mobile; open Desktop background near both screen sides; open View, Sort and New, assert right/left on desktop and on-screen child bounds, and assert root height does not expand. ArrowLeft returns focus to invoking row. Real Computer and Recycle Bin View submenus keep bounded geometry and source root dimensions.
- Prior `tests/e2e/desktop-context-source.spec.ts`, `source-desktop-context-keyboard.spec.ts` and `source-desktop-context-theme.spec.ts` now query the sibling submenu directly instead of the former inline children. Existing user-visible source action labels and keyboard behavior remain tested, not removed.
- `.github/workflows/react-checks.yml` adds new edge regression to focused opt-in suite. Full browser acceptance still runs desktop and mobile.

## Unverified scope / release gate

Previous [CI #45038369243](https://github.com/codersachin99/windows-os/actions/runs/45038369243) was still in the full browser stage when this new submenu implementation started and predates the code; it **cannot** validate this new slice. Run new exact-head `[run-ci]` for TypeScript, all unit tests, byte-identical source artwork and inventory/Contacts audits, production Vite build, focused and full desktop/mobile browser. Fix any failures honestly. Target/original 37-theme paired screenshots still require `LEGACY_SOURCE_READ_TOKEN`; this slice is geometry/interaction parity, not a pixel-perfect completeness claim. `main`, pinned source and releases remain untouched; PR #1 stays draft.
## Follow-up: Explorer narrow-screen cascade pointer traversal

An additional interaction gap remained for **Computer and Recycle Bin background View/New** when neither lateral side fits on small viewports. The existing Explorer Item Send-to cascade already marks its stacked orientation and ignores incidental parent-row pointer crossings, but background View/New did not. When the pointer traversed Refresh, View or New between an above/below child and its trigger, the root `onPointerMove` could dismiss or replace the child before the user selected it. `ExplorerApp.tsx` now marks `data-cascade="stacked"` from the shared measured placement and suppresses incidental root hover closure or switching **only while stacked**. Intentional clicks continue working, and the normal full-width desktop right/left hover and flip remain unchanged. Mobile Chromium regression added to `source-menu-cascade-edge-placement.spec.ts` for Computer View/New and Bin View, with real pointer movement onto intervening parent rows; exact-head CI acceptance still required.


## Follow-up: Win95/98/2000 classic Start nested popup pointer corridor

The classic Start menu uses its **own source-size and taskbar-constrained** `sourceWin9xSubmenuPlacement` (distinct from BaseMenu Desktop/Explorer geometry). At phone widths, Programs stacks **below** its row and Shutdown power options stack **above** theirs. The corresponding `SourceWin9xStartMenu.tsx` had already measured and avoided blocking the source trigger, but ordinary parent menu rows still cleared the active `branch` on every `onPointerEnter`. The user could lose the child while moving across the root to its vertically stacked location; incidental hover over the other branch could switch it.

The classic Start now preserves the active flyout on incidental root-row pointer travel only when the measured placement is `below` or `above`. Normal desktop adjacent hover behavior is unchanged; direct click on commands and on the alternate branch remains active; keyboard ArrowLeft/Escape still returns focus to the exact source parent. Browser regressions extend `source-win9x-shell.spec.ts` across **Win95/Win98/Win2k** in actual narrow CSS layouts, checking Programs survives hovering Documents before Notepad launch, and Shutdown survives hovering Find/Search before Log off. This is an adaptive narrow-screen interaction repair, not a change to original colors, assets, dimensions or source command semantics. Must pass fresh opt-in CI (focused and full desktop/mobile) before acceptance; paired screenshot parity still unverified.

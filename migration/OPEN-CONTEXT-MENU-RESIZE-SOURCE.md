# Open Desktop, Computer and Recycle Bin context menus — responsive cascade remeasurement

**Date:** 24 November 2026. **Source lock:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. **Candidate:** `codersachin99/windows-os`, draft PR #1, `feat/0001-faithful-react-foundation`.

## Original source and the observed gap

The frozen `src/modules/system/main.js` registers the original Desktop and Explorer menu actions using the WinUI/BaseMenu model, where child menus display beside an invoking parent row and must stay inside the visible display. React's shared source-derived `sourceCascadingSubmenuPlacement.ts` already preserved source **right-side by default, left when the right edge is exceeded**, and only stacked above/below on ultra-narrow viewports. `sourceExplorerSubmenuPlacement.ts` is the compatible Explorer/Bin re-export; independent classic Win95/98/2k Start keeps its own original placement implementation.

The actual remaining responsive gap was **after a context menu was already open**. `ExplorerApp.tsx` read `window.innerWidth/innerHeight` in the initial `useLayoutEffect` for root/View/New/Send to, but those effects did not depend on viewport changes. Browser resize or mobile rotation could leave the same open Computer/Bin popup at its old geometry and its child in the wrong direction or offscreen, even though opening a **new** menu after resize worked.

## Bounded implementation

`packages/apps/explorer/src/ExplorerApp.tsx` now tracks the current viewport only while an Explorer/Bin context menu is open, subscribing to the browser's native `resize` event and removing that listener on context close/unmount. State updates only when width or height actually changes. The root menu's existing source anchor/clamp helper and both child cascade effects depend on current viewport size, so the open View/New/Send to changes from adjacent side-flip on roomy screens to above/below stacking on a narrow screen and back again **without reopening the menu**.

Crucially, no `context` identity, original invoking DOM target, file selection, Guest action or menu visual styling is recreated on resize. The separate root-menu focus-entry effect still depends only on original clicked row/anchor, not viewport, so a focused submenu or keyboard-triggered action does not lose focus as geometry changes. The desktop popup already used `ResizeObserver` and `area` dependencies; that implementation is unchanged.

## Browser acceptance added

`tests/e2e/source-explorer-open-menu-resize.spec.ts` now covers desktop and mobile Chromium, using **real rendered interactions** rather than testing only the pure placement function:

1. Open Computer View and Recycle Bin View background cascades on a 1100px desktop viewport; shrink to 320px while menus are open; verify adjacent → stacked and both root and child remain within the viewport, source parent height unchanged, ArrowLeft returns to View; expand to 1100px and verify stacked → adjacent without a new context click.
2. Open a real source-mounted Guest Documents text file, right-click its **Send to** action and repeat adjacent → stacked → adjacent resize; verify the original Compressed (zipped) folder item remains enabled and ArrowLeft returns to the actual invocation row without losing selection.
3. Open Desktop background **View** (already supported by its ResizeObserver), repeat adjacent → stacked → adjacent after live resize and verify its original keyboard focus return, root height and bounded submenu positions.

The file was added to the **focused opt-in** GitHub Actions browser gate and is naturally picked up by the full desktop/mobile Playwright suite. Existing source submenu edge-flipping tests remain intact. No original artwork, source title/layout, theme palette, filesystem policy or Start behavior has changed.

## Remaining acceptance

This change is a concrete responsive interaction parity slice, **not** full source-equivalent 37-theme screenshot acceptance. The original-vs-React paired screenshot Action requires the absent `LEGACY_SOURCE_READ_TOKEN`. Run one exact-head `[run-ci]` (TypeScript, all units, source inventory, source artwork bytes/Contacts, production Vite, focused and full desktop/mobile Playwright); fix failures rather than marking them skipped. Leave original `legacy-win7` source, candidate `main`, draft PR #1 and releases untouched.

# Desktop rubber-band selection: source-mapped React gesture

**Legacy source:** `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`, `src/modules/system/main.js` desktop component, source band selection mixin `03f3`.

## Original implementation

- The source desktop's icon layer attaches `pointerdown: handlePointerDown` and `click: handleBackgroundClick`. `handlePointerDown` first calls `pressIcon(event)`; only background events fall through to `startBand(event)`.
- The original desktop template displays a translucent, pointer-events-none `desktop__icon-band` using `bandStyle` while a selection is in progress.
- The desktop mixin exposes `getBandArea() => iconList`, `bandItemSelector() => icon-selector`, `getBandSelection() => selectedKeys`, and `setBandSelection(keys)`, with a separate click to clear selection.
- The existing pinned source also has a `4px` icon-drag threshold and selection modifier logic. Full module `03f3` has not yet been independently reconstructed, so this is a bounded browser adapter, not an unsupported claim of identical internal library mechanics.

## Port

`packages/ui/src/desktopSelection.ts` uses desktop-local CSS coordinates, clamped geometry and the existing source-derived icon positions to select rectangles that intersect any icon, including saved free-position icons. It handles selection replacement, additive Shift and symmetric Ctrl/Meta toggles, without modifying persisted icon coordinates.

`DesktopIcons.tsx` starts the band only on empty desktop background, uses the original four-pixel threshold, updates selection live, draws the original-named translucent rectangle, preserves the result on mouse release and avoids blocking icon clicks, window launches and context menus. It also supports dragging the newly selected group with existing `ShortcutMove` logic.

Tests: `desktopSelection.test.ts` (pure geometry, saved/auto positions, additive/toggle selection, hidden icons) and `tests/e2e/desktop-band.spec.ts` (live rectangles, Ctrl/Shift selection, group drag, menu and Computer opening in Chromium desktop/mobile).

**Not covered:** complete source `03f3` library, touch-specific long press and band behavior, selection of file-backed desktop shortcuts, touch/RTL, auto-scroll and exact source CSS screenshots. Source `main.js` remains `in-progress`; no full parity claim.

**CI:** pending explicit opt-in verification.

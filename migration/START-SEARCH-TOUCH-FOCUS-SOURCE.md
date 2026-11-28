# Win7/Vista/Basic Start search focus — frozen source touch guard

Date: 22 November 2026. Immutable legacy reference: codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776. Target: codersachin99/windows-os feature branch feat/0001-faithful-react-foundation, draft PR #1.

## Original source behavior

Frozen src/modules/shell/startmenu-base.js contains Win7 Start menu watcher isOpen(t): on opening, it calls nextTick(focusSearch) only if NOT isTouchDevice(). Its search box should be focused for keyboard-based desktop interaction but not force the software keyboard on touch devices when Start opens. This component underpins the Win7/Vista/Aero/Basic Start family; other Start menu families have their own focus rules.

React packages/ui/src/StartMenu.tsx previously put unconditional autoFocus on the shared Search input for all non-XP themes, causing the Win7-family touch case to receive focus immediately. This is not source behavior.

## Implementation

StartMenu.tsx adds a search input ref and Win7-family-only useLayoutEffect. The effect focuses Search once on mount for a non-touch pointer (navigator.maxTouchPoints===0 and pointer media query not coarse), after the input exists, with preventScroll. The Win7-family input has autoFocus=false so touch presentation is not forced into focus. Existing autoFocus remains unchanged for Win10 and Win11 families, which must be assessed under their separate original implementations; WinXP continues to have no inline Search as before. Actual user click/tap always focuses the input. This touch heuristic is browser-level approximation of original isTouchDevice() and is not a claim of identical detection code.

## Tests / acceptance

New tests/e2e/source-start-search-touch-focus.spec.ts verifies for win7, winvista and basic-1 in both desktop and mobile Chromium projects: Start visible, desktop search focused immediately, touch-mobile search not focused until explicit tap; search text remains editable afterwards. This spec was included in the opt-in focused browser command. Existing Start Escape, all-programs, theme/power and context-menu tests stay in the full suite.

The previous exact-head mixed Desktop menu CI #44994511592 was still running its full browser interaction step when this separate Start focus change began. It does not verify the subsequent Start commits. New deliberate [run-ci] exact-head acceptance must pass TypeScript, all units, pinned source inventory/artwork/Contacts audits, Vite, focused and full desktop/mobile Playwright. Original side-by-side screenshots across all 37 themes still require LEGACY_SOURCE_READ_TOKEN and remain unverified; don't merge/release.
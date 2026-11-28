# Start program context menu keyboard and focus reconciliation — 21 November 2026

**Locked reference:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `codersachin99/windows-os`, draft PR #1 / `feat/0001-faithful-react-foundation`.

## Concrete React regression

All migrated Start implementations reuse `StartMenu.tsx`'s
`createPortal(..., document.body)` for program right-click actions.
The context has real `role="menu"` and `role="menuitem"` semantics and
already delegates ArrowUp/Down to the shared `sourceMenuArrowFocus`
roving-focus helper, which skips disabled items.

Previously, opening the popup did **not** move keyboard focus to any of
its actions. Right-click left focus on an unrelated program tile or
document/body; consequently arrow navigation in the detached popup
could not receive keyboard events. Escape attempted to restore focus
by searching `[data-test-program]` or `[data-test-source-program]`
inside Start, but these selectors cannot find source Win31 Program
Manager icons (`data-test-win31-program`), source Win95/98/2k cascading
Programs items (`data-test-win9x-program`), or Win10 recent tiles
(`data-test-win10-start-tile`). It also cannot reliably select an
alternate layout's actual triggering button when identifiers repeat.

## Bounded change

- Keep a `useRef<HTMLButtonElement|null>` to the actual
  `event.currentTarget` for every program-menu invocation, independently
  of which original Start family renders it.
- After the portal mounts, focus its first enabled menuitem
  (`preventScroll:true`) before starting source window-viewport
  positioning. Existing pinned-style CSS and menu geometry unchanged.
- On Escape, close only the popup; on the following animation frame,
  return focus to the real invoking button when still connected. The
  original program-ID selector remains a safe fallback if a source
  tile unmounts before focus can return.
- Keep the source shared `sourceMenuArrowFocus` helper and disabled
  Properties boundary unchanged; this fixes its previously unreachable
  interaction from mouse-opened popup menus.

`tests/e2e/source-start-context-keyboard-themes.spec.ts` covers
**11 source theme IDs × desktop/mobile Chromium**: Win7, XP, Vista,
Win10, Win11dark, Win8, Win81, Win31 and Win95/98/2000.
Each actually logs in as Guest, opens Start, right-clicks Notepad in
that theme's own program structure, verifies initial menu focus,
ArrowDown/ArrowUp navigation and disabled Properties skip, then
Escape closes the context and focuses its exact invoking button while
Start stays open. The suite is in the **opt-in** focused GitHub Actions
regression command.

## Acceptance

The preceding exact-head [CI #44788112053](https://github.com/codersachin99/windows-os/actions/runs/44788112053)
passed full TypeScript/unit/source-artwork audits, Vite and browser
tests at `b8dc340`. This new keyboard change is **not verified**
until its own `[run-ci]` completes. No claim of full
keyboard/accessibility certification, paired source screenshot
pixel parity or entire-theme completion is made. Existing
original `legacy-win7` and target `main` remain untouched.

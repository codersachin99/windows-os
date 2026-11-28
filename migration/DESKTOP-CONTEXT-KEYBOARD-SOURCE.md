# Desktop and Recycle Bin context keyboard focus — 21 November 2026

**Immutable original reference:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `codersachin99/windows-os`, draft PR #1, branch `feat/0001-faithful-react-foundation`.
Neither target `main` nor the reference source changed.

## Source-backed Desktop menu and migrated focus defect

The source `src/modules/system/main.js` defines the `DesktopMenu`
and `DesktopItemMenu` attached to Desktop background and icons.
React `packages/ui/src/DesktopIcons.tsx` already transcribed their
actual item actions, View/Sort/New submenus, disabled actions and
`sourceMenuArrowFocus` arrow navigation. A right-click, however,
mounted `[data-test-desktop-menu]` without moving focus into it.
The menu's arrow handling therefore did not receive keyboard events
from the opened pointer context. Escape dismissed the popup but left
focus on the removed menu or unrelated document element.

This was a *shared focus integration gap*, not new source behavior
being invented. No source menu items, ordering, theme skin, original
program association, clipboard or Recycle Bin effects were modified.

## Bounded implementation

- On context open, record the **actual invoking Desktop icon button**
  or the focusable Desktop background in `menuReturnFocus`.
- In a `useLayoutEffect` scoped to the source menu anchor/identity,
  focus the first enabled `role=menuitem` when the popup mounts.
  Do not rerun the effect on submenu toggles or repositioning.
- On Escape, prevent default, close the menu and restore focus
  in an animation frame to the original connected element;
  fall back to Desktop background if it was unmounted. This keeps
  Desktop and Recycle Bin in the same keyboard focus model.
- Keep `sourceMenuArrowFocus` disabled-item filtering, WinUI
  Enter semantics and View/Sort/New right/left submenu handling
  unchanged; no host OS access or hidden feature approximation.

`tests/e2e/source-desktop-context-keyboard.spec.ts` contains
**11 real Playwright scenarios × desktop/mobile**: background menu
View/Sort/ArrowRight/ArrowLeft/Escape focus and Computer item
Open/Pin/disabled Properties roving in Win7, XP, Win31, Win8
and Win11dark; plus a Recycle Bin menu that skips a disabled
Empty Recycle Bin and disabled Properties, then opens the
actual Guest Bin with Enter.

The suite is included in the focused opt-in
`.github/workflows/react-checks.yml` command, besides the full
browser run.

## Acceptance limits

Prior [CI #44794377379](https://github.com/codersachin99/windows-os/actions/runs/44794377379)
was green on the immediately preceding shared Start popup
keyboard milestone at `d157ca5`, **not this new Desktop fix**.
Run one exact-head `[run-ci]` and inspect desktop/mobile focused
results before calling these tests verified. The source-vs-candidate
pixel screenshots are still absent until the private source checkout
is authorized and paired. All other Desktop/File Explorer/Bin
functionality and theme families remain in-progress, not accepted.

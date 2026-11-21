# Taskbar context menu keyboard entry and Escape focus — 21 November 2026

**Pinned original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `codersachin99/windows-os`, `feat/0001-faithful-react-foundation`, draft PR #1.

## Frozen source mapping and actual gap

The source `src/modules/shell/taskbar-base.js` defines the
`taskbar-menu` / `base-menu` background commands and the
`taskbar__main-popup` item menu; its `contextmenu` event
opens the taskbar background or item menu. The pinned shell
preserves enabled commands and disabled Toolbars / arrangement
rows. The React implementation already has the corresponding
`SourceTaskbarMenu.tsx` action lists, actual Guest
`SourceTaskbarPins`, window open/close, desktop minimization
and Task Manager launch.

**Keyboard defect:** the React popup had
`sourceMenuArrowFocus` wired to `onKeyDown` but
a genuine right-click did **not** focus any menuitem.
Consequently keyboard roving could not start, and Escape
closed the popup without putting focus back on the original
taskbar launcher or taskbar surface. This is the same bounded
menu keyboard gap previously fixed for the source Start,
Desktop and Explorer menu families.

## Bounded source-respecting implementation

- `packages/ui/src/SourceTaskbarMenu.tsx` focuses the
  **first enabled, direct** root `role="menuitem"` on context
  menu open/change of anchor, not on every state/geometry
  rerender. The original menu order and disabled entries
  remain untouched. The shared arrow helper provides
  ArrowUp/Down skip and wrap.
- The popup receives `returnFocusTarget`, the **actual**
  right-click origin stored in `DesktopShell.tsx`, not a
  theme- or coordinate-guessed control: either the background
  `footer.windows-taskbar`, a pinned button or an unpinned
  running app group. On Escape only, the popup dismisses
  then returns focus on the next animation frame to the
  still-connected origin. If it unmounted, fall back to
  the taskbar. The footer receives `tabIndex={-1}` to
  enable programmatic focus without entering tab order.
- Outside click and action-based menu close keep the
  original behavior and do **not** force focus back,
  which could steal focus from a newly opened application.
- `tests/e2e/source-taskbar-context-keyboard.spec.ts`
  contains **7 real Playwright cases × desktop/mobile**:
  Win7, XP, Win11dark and Basic1 taskbar background,
  skipping the first 4 disabled commands, arrow wrap,
  Escape restoring the actual footer and no inadvertent
  Task Manager launch (4); Win7/XP actual Desktop-initiated
  pinned Computer launcher menu with Open/Unpin roving,
  Escape restoring the exact pin without launching it (2);
  real Win7 running unpinned Computer group with Pin/Close
  roving, Escape returning to that group without
  terminating the Computer window (1).
- Added this suite to the **opt-in** targeted browser CI,
  never enabling always-on GitHub Actions.

## Acceptance constraints

Previous [Win7/Aero/Basic1 CI #44870350897](https://github.com/codersachin99/windows-os/actions/runs/44870350897)
at `46883af` **PASSED** TypeScript, units, source and
artwork audits, build, focused and full desktop/mobile
Playwright. **This taskbar keyboard change is newer than
that run** and requires a new exact-head `[run-ci]`
before acceptance. Original-versus-React visual screenshot
pairing remains unperformed; neither all source taskbar
functionalities nor all theme variants are fully migrated.
Source frozen, target `main` unchanged, PR remains draft,
no release.

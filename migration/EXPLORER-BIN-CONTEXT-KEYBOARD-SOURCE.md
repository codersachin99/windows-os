# Computer and Recycle Bin context keyboard focus — 21 November 2026

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `codersachin99/windows-os` draft PR #1 on
`feat/0001-faithful-react-foundation`. No source or `main` edits.

## Source relationship and actual React gap

Original `src/modules/system/main.js` registers `ExplorerMenu` and
`ExplorerItemMenu` as shared WinUI menu components; the original
`bin` application has related `Restore`, `Delete` and disabled
`Properties` commands. The React port had already implemented
these actions and a focus-aware `sourceMenuArrowFocus` helper,
including nested View/New/Send to menus, disabled commands and
viewport-flipping positions.

However, right-clicking a folder background or file/item row
mounted `[data-test-explorer-context]` **without focusing any of
its menu actions**. Consequently the existing ArrowUp/Down handler
could not receive keyboard events. Escape discarded the menu
without restoring focus to the original background or item.
Both Computer and Recycle Bin use the same `ExplorerApp.tsx`
implementation, so the regression affected both applications.

## Bounded implementation

- Track `event.currentTarget` from the real right-click event:
  source `SourceListViewItem` is a real button; the background
  is the `.explorer-content` section.
- Make the content section programmatically focusable with
  `tabIndex={-1}`, without adding it to normal tab sequence.
- On original root menu mount/anchor identity change, focus
  the first enabled **direct** `role="menuitem"` button.
  This selector does not pull focus from View, New or Send to
  submenus during their existing directional keyboard navigation,
  or when the popup flips its viewport position.
- On Escape, close the menu and return focus to the original
  connected file button or background; if that element
  unmounts, focus the current Explorer content section.
  All original file effects, delete confirmation, source
  palette, clipboard, drag/drop and host OS permissions remain
  unchanged.

`tests/e2e/source-explorer-context-keyboard.spec.ts` contains
**8 Playwright cases × desktop/mobile**:
1. Computer background View→Refresh ArrowDown/Up, ArrowRight
   nested View, ArrowLeft root, Escape back to original content
   across Win7, XP, Win8 and Win11 Dark (4).
2. Empty Bin background disabled Empty/Upload bypass and focus
   return in Win7 and XP (2).
3. Real Computer uploaded Guest text-file right-click Open→Send to,
   disabled Compressed folder, working Desktop submenu focus and
   ArrowLeft/Escape exact row return (1).
4. Real Computer folder creation, delete-to-Guest-Bin, open Bin,
   right-click recycled folder, disabled Properties bypass and
   Escape focus to the original Bin list item (1).

Added this file to opt-in focused GitHub Actions without making
Actions run on every normal commit.

## Verification limits

Previous [Desktop context CI #44805818122](https://github.com/codersachin99/windows-os/actions/runs/44805818122)
was **in progress** at the time this Explorer slice was authored
and covers the prior `7c194be` commit, not this new work.
These Explorer changes must be checked under a **new exact-head
`[run-ci]`** before calling browser acceptance complete.
The paired source-vs-React screenshots remain absent and neither
all Explorer/Computer/Bin source modules nor all original theme
variants are certified. Main stays unchanged and PR remains draft.

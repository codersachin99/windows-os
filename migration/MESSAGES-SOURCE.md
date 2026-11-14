# Pinned source messages.js — reusable confirmation/message dialog

## Original immutable source

- Revision: codersachin99/legacy-win7 at 4e63290d783009e1293433c6ccf252abba9c1187.
- src/modules/apps/messages.js Git blob e5150261d7868071ed3c02aa9ab31ea82fe50b9e, webpack modules 7680 (dispatch), 3780 (error), confirm and progress variants.
- Original message dispatcher recognizes exactly error, confirm and progress. Unknown message types render no content.
- Error: base-message type=error; footer default OK; optional Asterisk ProgramEvent.
- Confirm: base-message type=warning; title from header; source exact data-test-confirm-answer=yes/no markers; Yes triggers answer(true), No/close triggers answer(false). No is the default button.
- Progress: source title/header/body, winui-progress with indeterminate default, Stop disabled; progress body renders source parseInline-generated HTML.
- Source message state looks up a message by window ID, closes the corresponding WindowMain and removes message state on close or answer, optionally calling an onAnswer callback.

## React boundary

- packages/ui/src/sourceMessage.tsx exports a shared SourceMessageDialog supporting the three original types, including warning/error icon styling, real Yes/No answers and disabled Stop. Its CSS sits in packages/ui/src/sourceMessage.css.
- Explorer and Recycle Bin confirmation now reuse SourceMessageDialog instead of custom ad hoc confirmation markup. The same Guest VFS delete/restore logic remains in Explorer. It preserves role alertdialog and label Confirm file operation for existing automation; focus goes to the default No button, and Escape rejects the operation.
- packages/ui is a shared module. Explorer imports the direct @windows-os/ui/message alias to avoid a circular import of the full DesktopShell barrel.
- Source progress message content is rendered as escaped text rather than parseInline HTML, an intentional security boundary against arbitrary files/program strings injecting executable markup. Numeric progress is bounded to 0..100.
- The original notification message state bus/window IDs, Asterisk audio event, exact Win7 message window geometry and original/source screenshot parity remain unported. A current message is a nested Explorer modal, not yet its independent source WindowMain. Therefore status remains in-progress.

## Tests and verification

- sourceMessage.test.tsx renders Error/Confirm/Progress server-side, checks exact original Yes/No markers, disabled Stop and HTML-escaped untrusted input.
- tests/e2e/source-message.spec.ts uses desktop and mobile Chromium: creates a real Guest folder, confirms No, Escape, original yes/no selectors, Yes deletion, and an actual Recycle Bin entry.
- Existing Explorer delete, bin and file safety regression tests also run in opt-in CI.

Full CI pending, source completeness and pixel parity not asserted; draft PR #1 stays open, main unchanged, no release.

# Source Run dialog — original Windows 7 shell command entry

**Pinned reference:** legacy-win7 commit 4e63290d783009e1293433c6ccf252abba9c1187, src/modules/apps/run.js (9756-byte webpack module), source program registry from src/modules/system/testmode.js (module c170; variant non-clean).

## Source behavior

The original Run component uses a non-resizable WindowMain with id window-run, width 450, height 220, location bottom left; icon themeData.icon.run, information text, the focused Open field, an OK button disabled when no input, Cancel, and a MessageError view if the command does not resolve. The Run action calls source program lookup (webpack module 2636), opens the resolved shell program and closes Run. The custom program registry and icon are **not** substituted with native host process execution. The imported run.cf7c0332.webp in the target has the **identical Git blob SHA** 6f669cbb5865e3c342d2f8b16c86051acd63e861 as the pinned source asset.

## Migration

- apps/run: separate React RunApp.tsx, Win7-style RunApp.css and source program lookup model.ts, integrated via the shared AppRegistry and WindowFrame. Window placement contract adds location bottom-left without changing default desktop cascade or centered Shortcut Wizard. WindowFrame naturally hides maximize/minimize for non-resizable Run and handles Alt+F4/close.
- Apps are identified only from the pinned sourceProgramManifest.json (original c170), with original program IDs, explicit aliases, installed executable names and manifest-matched C: executable paths. No arbitrary host command, path, URL, arguments, PATH scan or OS process launch. Unported original app commands are recognized but shown as migration-pending instead of fabricated functional windows; unknown programs use a retryable source-style error.
- Start menu exposes Run and the shell handles Windows+R for Guest sessions, with input autofocus, Enter/OK, Escape, Cancel and error-dismiss focus recovery.

## Verification

model.test.ts covers IDs, aliases, installed executable names and drive/path guards; engine index.test.ts verifies Win7 450×220 bottom-left anchoring including narrow-screen limits. tests/e2e/run.spec.ts verifies exact source icon/size/placement/control configuration, alias launch, full executable path, unknown command and retry, unported Paint behavior, Windows+R and Escape. Browser suite is repeated on desktop and mobile Chromium.

The Run command-entry flow is intentionally limited to **already implemented** programs. This is a source-bounded vertical slice; it does not constitute porting the unimplemented original Paint, Command Prompt, WordPad or other programs. No release or merge before full parity.

**Status:** implementation committed; opt-in CI pending.

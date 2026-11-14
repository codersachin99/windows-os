# Command Prompt original source migration — first runnable slice

Pinned original: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`, `src/modules/apps/cmd.js` blob `d3e991b9604d8b0986676381de532f09b83ab958` and `src/styles/apps/cmd.css` blob `53f680686fbd147330ef15e8eb309b5508b3253b`.

## What this source-backed slice actually ports

- Original b894 window: black monospace container, banner `Microsoft Windows [Version 6.1.7600]`, per-command source `data-test-cmd-entry`/line/output and prompt/input classes, retained output history, Up/Down history recall and input focus.
- Original Tt shell: prompt equals Windows current directory + `>`, Guest starts at mounted `C:\Users\Guest`. Uses the **actual** `LegacyVolumeSession.toUri/toWindowsPath` and the existing shared `resolveWindowsPath` helpers; no native host shell or fake C: drive mount.
- Source te/Te/ot commands `CLS`, `ECHO` (including on/off and `ECHO.`), `TITLE` (updates shared window title), `CD/CHDIR` (mounted dir check, `..` and `/D`), `DIR` listing Guest filesystem with sorted output and working `/B`, `HELP` for implemented commands, `VER`, `EXIT`. Unsupported commands return original not-recognized structure; unsupported DIR flags explicitly report pending behavior rather than pretending parity.
- Added a real source command app in `packages/apps/cmd`, wired through shared `AppRegistry` and `DesktopShell`, installed Start Menu shortcut now enabled. Added pure filesystem/session unit tests and a browser source program path through All Programs, ECHO, DIR, CD, TITLE, CLS and EXIT.
- The original CMD icon `assets/images/cmd.*` has **not** been imported byte-for-byte; app registry uses explicit original generic file artwork fallback. Other source commands, pipes, environment variables, redirection, batch files, styles/colors, mounted drive variety, exact screenshot parity remain in-progress. **Do not call this module complete.**

## Verification

Commit is deliberately without CI opt-in while the previous combined icon regression CI remains in progress. Trigger `[run-ci]` only when an acceptance batch is needed. Tracker changes **one** original source module from pending to in-progress: 290 total, 254 pending / 28 in progress / 8 implemented / 0 fully verified.

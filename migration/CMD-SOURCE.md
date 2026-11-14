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

## Module resolution

The new `@windows-os/apps/cmd` package is registered in both `tsconfig.json` and `vite.config.ts` aliases, matching the existing per-app package architecture. This follow-up is intentionally without `[run-ci]`; batch with next opt-in CI once the earlier icon run conclusion is known. The initial first-run CMD slice does **not** yet implement the special unspaced `ECHO.` syntax was subsequently added via the pinned Tt.unglue helper, alongside `CD..` and `DIR/B`.

## Original Tt.unglue command tokens

Original `cmd.js` uses `kt=/^([a-z]+)(\.\.?|\/.*)$/i` and `unglue` to normalize DOS forms `CD..`, `ECHO.` and `DIR/B` only when the prefix is a recognized command, before executing. The React model now exposes `sourceCmdUnglue` with exact supported-subset semantics and regression tests; unsupported words such as `invalid.exe` remain unknown rather than being silently split.

## CMD first runnable source slice opt-in CI — 2026-11-15 (running once)

- [Previous shared icon CI #43640201034](https://github.com/codersachin99/windows-os/actions/runs/43640201034) **SUCCESS**: TypeScript, units, source inventory/Contacts audits, Vite build, complete Playwright browser suite. This covers Explorer/Desktop/Start Menu source shortcut icon JSON and shared binary reader at commit 715be7375.
- New [CMD source app commit 3f8b92d](https://github.com/codersachin99/windows-os/commit/3f8b92d46a199996c2ea263a7bd68a1012cebc66) has actual interactive prompt, C: Guest live VFS CD/DIR, ECHO/CLS/TITLE/VER/HELP/EXIT; modular Vite/TS aliases [77471e2](https://github.com/codersachin99/windows-os/commit/77471e2347092fcf6abc764e02002ef79a27f85d); pinned source DOS syntax CD../ECHO./DIR/B [4a73bb0](https://github.com/codersachin99/windows-os/commit/4a73bb0bfba56bd691809cca4a8a9758d1889b85).
- This docs/handoff commit opts in once with **[run-ci]** to validate the new app/test suite. Do not claim the CMD slice passes until workflow completion; missing CMD commands, original icon asset and side-by-side pixel parity remain explicit.
- Source migration tracker: 290 original source modules, 254 pending, 28 in progress, 8 implemented, 0 full accepted source pixel parity. Draft PR #1, main untouched, no release.


## Source Te file inspection, directory creation, directory stack — 15 November 2026

Original `src/modules/apps/cmd.js` Te list (source blob `d3e991b9604d8b0986676381de532f09b83ab958`) supplies `TYPE`, `MD`/`MKDIR` alias, `PUSHD` and `POPD`. Extended `SourceCmdSession` by only `VirtualFileStore.read` and `mkdir` in addition to existing stat/list, using mounted drive mapping and source error message texts. `TYPE` splits text on CRLF and reports `Access is denied.` for binary-only or directory entries; `MD` validates existing paths and creates the actual Guest VFS folder; `PUSHD`/`POPD` preserve source working-directory stack and reject invalid targets without stacking. New unit contracts cover missing drive/folder, quote paths, duplicate folders, file read, binary access, and working-directory stack. Browser verifies `MD`, `DIR/B`, `PUSHD`, `POPD` in a mounted Guest directory.

### Regression from first CMD browser run
[CI #43641366954](https://github.com/codersachin99/windows-os/actions/runs/43641366954) **FAILED exactly 2 Playwright cases**, desktop and mobile, because the prior `source-programs.spec.ts` still asserted that opening `Command Prompt.lnk` should display a not-migrated alert. The actual CMD app now launches. Updated that assertion to verify the CMD input becomes visible; the negative association test now uses `WordPad.lnk` (genuinely unported) and checks the no-execution alert. All earlier TypeScript, unit, source audits, Vite build passed. Original CMD remains in progress; pipes/redirection/batches, full CMD command set, original icon/WebP and source screenshot parity remain pending.

## Source CMD Te REN/RD/DEL aliases and safe destructive operations — 15 November 2026

Pinned `src/modules/apps/cmd.js` Te commands `ren`, `rd`, `del` and alias table `at` (`rename`/`rmdir`/`erase`) use the shared filesystem. This slice extends `SourceCmdSession` with `VirtualFileStore.move`, `remove`, `getParentDirectory` and existing source drive mapping. `REN` restricts the replacement to a single filename in the same directory and refuses collisions; `RD` removes only empty directories and retains source errors `DirNotEmpty` and `NotDirectory`; `DEL` removes a single explicitly named file. All operations affect **only Guest VFS**, never the host OS.

The original `RD /S`, wildcard/whole-directory `DEL` require interactive source `host.waitForKey` confirmation, not yet ported. They **return a visible unsupported warning without deleting anything**. The original CMD module remains in-progress; this is not equivalence for every variation of command grammar. Unit tests validate rename collisions, exact file deletion, preserved nonempty directories and blocked recursive/wildcard removal. Browser test verifies create -> rename -> list -> remove against live Guest filesystem.

Previous opt-in [CI #43642780902](https://github.com/codersachin99/windows-os/actions/runs/43642780902) remained running Chromium at the start of this slice. This commit intentionally does not contain `[run-ci]`; next source acceptance verification should be batched once the earlier run completes.

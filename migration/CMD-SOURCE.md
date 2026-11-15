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

## Browser CMD overlay regression diagnosis — 2026-11-15

- Source CMD [CI #43642780902](https://github.com/codersachin99/windows-os/actions/runs/43642780902) **FAILED 2 Playwright cases** (desktop/mobile) only in the Explorer open-shortcuts test: `locator.dblclick` timed out after CMD was successfully launched. The running CMD window overlaps Explorer, so the next `WordPad.lnk` row isn't clickable until the CMD window is closed.
- Updated `tests/e2e/source-programs.spec.ts` to verify CMD input, execute original `EXIT`, assert the CMD window disappears, then double-click the still-unported WordPad shortcut and check its expected rejection. This checks actual source window lifecycle rather than forcing clicks through an overlapping window.
- Prior [CI #43642780902](https://github.com/codersachin99/windows-os/actions/runs/43642780902) passed TS, unit, source audits and production build. Recent [source command commit 7b0f6c8](https://github.com/codersachin99/windows-os/commit/7b0f6c87123130b2a628c00f0622911cd714ca4f) adds Guest VFS REN/RD/exact DEL with non-destructive confirmation-required paths. This commit opts in **once** with `[run-ci]` to verify both the browser focus fix and these source commands.
- Draft PR #1, main untouched, no release. CMD in progress, full screenshot parity not verified.


## Original cmd.js Pe COPY/MOVE exact-file source transfer — 2026-11-15

Source `src/modules/apps/cmd.js` original `Pe(e,t)` handles `COPY` and `MOVE`: it resolves a source path to files (excluding directories), resolves the target directory/filename, calls source filesystem copy/rename and prints a nine-column right-aligned count such as `        1 file(s) copied.`. New React `SourceCmdSession` ports this exact **single concrete-file subset** through `VirtualFileStore.copy`/`move`, preserving uploaded binary content and the original file-versus-directory distinctions. Tests prove original remains after COPY, source removed after MOVE, destination collisions refused, bad/unmounted source rejected, and wildcard attempts non-destructive.

This is not a full port of `Pe`: original wildcard/multiple-file transfer behavior and source confirmation/overwrite semantics are explicitly deferred rather than approximated. This commit carries **no `[run-ci]`**, preserving the user's on-demand-only CI rule while the previous CMD browser run #43643944920 completes. Source tracker unchanged: CMD in progress, full original screenshot parity still unverified.

## Original source CMD environment and console appearance — 15 November 2026

Pinned `legacy-win7/src/modules/apps/cmd.js` source modules `te` and `re` implement `COLOR`, `SET`, and `PATH`, while `bt` maintains case-insensitive environment variables with preserved first-entry spelling and `Dt` seeds source Windows values from the mounted Guest profile. The React CMD model now faithfully stores session-local `SET` keys, prefix-query listings, deletion via empty assignment, and `PATH` query/update/clear. Known source environment variables derive from the actual mounted profile (e.g. `USERPROFILE=C:\Users\Guest`); host-dependent source fields `COMPUTERNAME` and `USERDOMAIN` are **not fabricated**.

`COLOR` ports the original 16-entry Win7 `F` palette, background/foreground two-hex-digit encoding, reset without argument, errorlevel 1 for same colors, and source help on malformed input. The React console renders these styles across the black monospace container and retains them between commands. Added pure unit contracts for source palette, case-insensitive SET/PATH and source-derived defaults, plus browser acceptance for simulated environment and real CSS color transitions.

This is an additional in-progress **source CMD command slice**, not full CMD feature parity. This commit intentionally omits `[run-ci]` while previous browser run #43643944920 is unresolved; new commands require next on-demand acceptance.

## Source CMD percent-variable parsing Ct() — 15 November 2026

Original `legacy-win7/src/modules/apps/cmd.js` `Ct(e,t)` expands `%([^%\\s]+)%` using the case-insensitive source `bt` environment before source `Tt.run()` command dispatch. The original `getEnv()` clones user env and appends dynamic `ERRORLEVEL` and `CD`. The React `sourceCmdExpandVariables` now ports that exact nonrecursive known-variable-only expansion behavior; unknown/invalid tokens remain untouched, while prompt/history continue displaying the user's **raw** typed input. New Vitest covers nonrecursive expansion, unknown keys and dynamic CD/ERRORLEVEL; browser test performs `SET` then `ECHO %SOURCE% from %CD%`.

Do not mistake this for full `Tt.run` pipeline/redirect/batch parity: only environment expansion of a *single command* is supported. This follow-up intentionally has no `[run-ci]` until the previous CMD browser result is checked. Scope stays in-progress.

## Source CMD TREE VOL DATE TIME — 15 November 2026

Pinned legacy `src/modules/apps/cmd.js` `Te.tree` displays mounted VFS directory hierarchy with original `ge` Unicode branch characters (`├───`, `└───`, `│`), case-insensitive alphabetical order, `/F` file inclusion, and the original depth 12/entry 5000 recursion limits. The implementation now reads **actual Guest VFS directories** using the existing file store and source `LegacyVolumeSession.pathConfig` metadata. `VOL` and `TREE` calculate the original simulator serial via pinned `ue` polynomial hash of drive letter/label rather than fabricating a physical disk identifier. Added unit checks for TREE structure, file inclusion, unsupported options, missing mount and VOL.

Pinned `ot.date`/`ot.time` format date as `Sun MM/DD/YYYY` and time as `HH:mm:ss.CS` (hundredths), with `/T` suppressing leading text. The CMD session supports an injected clock for deterministic tests without setting host time. Date and time displayed by the browser will be local to the browser's current date/time, as in source. The CMD module remains in-progress, full source command and screenshot parity still unverified.

## CMD cross-surface source acceptance — 2026-11-15

- [Earlier CMD browser suite #43643944920](https://github.com/codersachin99/windows-os/actions/runs/43643944920) **SUCCESS** after the overlapping CMD/Explorer test sequence was corrected, including TS, units, source audits, Vite build, and desktop+mobile Playwright.
- New CMD source slices since that verified commit: [COPY/MOVE 2cd3716](https://github.com/codersachin99/windows-os/commit/2cd3716d59e265dd35f07b77347d300e6c3e0977), [COLOR/SET/PATH 30396d6](https://github.com/codersachin99/windows-os/commit/30396d61327e8451e267023fc028b7f815735e3e), [percent expansion de8222c](https://github.com/codersachin99/windows-os/commit/de8222c17c7d35d8feeeba7f86b4e23f4d8fb2e8), [TREE/VOL/DATE/TIME d3c88b1](https://github.com/codersachin99/windows-os/commit/d3c88b178755766e7a2fd20c94d9aee22457dadc).
- New `tests/e2e/cmd-source-files.spec.ts` drives **actual** Guest CMD UI: copies original installed Notepad shortcut into Desktop, moves it to Documents, verifies exact source JSON contents with TYPE, traverses with TREE, verifies virtual volume serial and moved-file directory listings; separate browser test checks date/time formatting, COLOR palette and dynamic %ERRORLEVEL%. Original icon bytes and full screenshot parity remain pending.
- This commit deliberately opts in **once** with `[run-ci]` to validate those substantive source slices together; do not call it green before Github Actions conclusion. Source tracker still 290 = 254 pending / 28 in progress / 8 implemented / 0 full pixel-verified.
- Draft PR #1, main untouched, no release.


## CMD SET PATH prefix/casing test correction — 2026-11-15

- [Combined CMD CI #43645135418](https://github.com/codersachin99/windows-os/actions/runs/43645135418) **FAILED exactly 1 unit assertion** out of 368 tests; TypeScript was green, later steps (audit/build/browser) were skipped. The new original environment model correctly deletes the original `Path` key on `PATH ;`, re-adds it with uppercase `PATH` on `PATH C:\Tools;C:\Bin` and returns both `PATH` and `PATHEXT` for source `SET path` prefix lookup. The initial test incorrectly expected one `Path=` item. There is no evidence of a production-code failure; fix the test expectation to match the pinned `bt` map and `SET` source command.
- This commit requests **one opt-in [run-ci]** rerun for the full cumulative original CMD COPY/MOVE, COLOR, SET/PATH, % expansion, TREE/VOL/DATE/TIME and browser source contracts. No green claim until full run finishes.
- Draft PR #1, main untouched, no release. CMD module still in progress; source screenshot parity unverified.



## Source b894 keyboard Tab completion and Escape — 2026-11-15

Pinned original CMD src/modules/apps/cmd.js b894 a/c/l and Ht complete/applyCompletion: Tab extracts the last unquoted path argument, resolves its directory from the active Windows working directory, filters actual Guest VFS entry names with case-insensitive starts-with, and sorts with the source base-sensitivity comparator. A single Tab inserts the first candidate; successive Tab presses cycle matches while retaining command prefix. Candidates containing whitespace receive double quotes. Escape clears input, and non-Tab input or history navigation cancels cycling. Unknown/unmounted paths leave input unchanged, never trigger a host lookup.

Added pure splitting/rendering + mounted filesystem unit contracts and a desktop/mobile browser interaction case for cycling Desktop/Documents, escaping, creating and completing a quoted folder, and missing drive. This is a **keyboard interaction slice**, not full Command Prompt parity: pipes, redirects, batch behavior, interrupt/confirmation flows, original CMD icon and pixel comparison remain outstanding. One opt-in CI run is requested with this change; verify results before calling it green. PR #1 remains draft; main untouched, no release.


## Exact original Win7 Command Prompt icon — 2026-11-15

Imported pinned legacy-win7 assets/images/cmd.a2c1d19b.webp (536 bytes) to the same public asset name as a Git blob. The source and target blob SHA are both bcec3ad17a595cc2eb99686b084773b7bb171d9c. Added the shared CMD key to legacyArt and legacySourceIconArtwork, so Start Menu installed CMD shortcuts, app registry, and Win7 shell surfaces resolve the original image instead of an explicit generic-file fallback. Asset test checks exact path and source classification; the live Guest Start Menu browser contract checks the image and installed .lnk artwork status. No invented artwork and no host access.

The earlier Tab keyboard CI run was started before this artwork commit. This separate artwork commit intentionally omits [run-ci]; it remains browser/CI-unverified until a subsequent opt-in batch. CMD is still in progress and pixel comparison remains pending.


## Original CMD Ht transcript memory bound — 2026-11-15

Source cmd.js b894 Ht sets Ft=300 for retained visible entries while separate Tt shell sets xt=100 for command history. The migrated React console already retained 100 history commands but previously allowed unbounded output DOM entries. It now uses a tested generic sourceCmdTrimEntries helper for both normal results and error entries, preserving only the newest 300 lines and leaving the editable active input outside the transcript. No output text or command processing changes. This incremental commit intentionally omits [run-ci] while the earlier Tab completion run is still being checked.


## Original CMD Tt.run conditional chains — 2026-11-15

Pinned source cmd.js mt/gt/Ct/Tt.run: parses &&, || and & outside quoted spans; annotates each segment with the immediately preceding operator; only executes && on prior success or || on prior failure, while & executes unconditionally. Original Ct percent-variable expansion occurs **once before** splitting, not after individual SET/CD operations. Added a pure sourceCmdChainSegments helper, retained command execution against real Guest VFS, single-history input/output result, combined output, last error level, and sequential title/color/CLS/EXIT propagation. Blank commands now retain previous errorlevel, matching the pinned Tt.execute behavior. This does not enable pipes, redirects, batch files or native host shell execution.

Unit tests verify quoted syntax, conditional skip/recovery, VFS directory effects and single-expansion. Browser test verifies real shell conditions, quoted operator and mounted working-directory update. These are staged without [run-ci] until batched with the next source command slice.
false

## Original Te.echo retains space before source operators — 15 November 2026

Combined [CI #43678975812](https://github.com/codersachin99/windows-os/actions/runs/43678975812) failed four unit fixtures that stripped source-preserved whitespace (echo Alpha > file writes "Alpha " plus CRLF). The pinned Te.echo strips only its first separating space; it does not trim trailing whitespace. Corrected the expected transcript, file bytes and browser assertions without changing production code. The follow-up [run-ci] checks the cumulative source chain, redirect, exact icon and transcript cap.

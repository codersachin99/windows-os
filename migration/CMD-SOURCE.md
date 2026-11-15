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


## Source yt() pipes and ie FIND/SORT/MORE — 15 November 2026

Pinned original cmd.js yt() splits only unquoted vertical bars into pipeline stages. Original Tt.runPipeline buffers intermediate stage output and passes it as piped input to the next command, with only final output displayed (or written to Guest VFS through wt redirection). The original ie commands FIND (V/C/I flags, case-sensitive by default, "---------- : N" count), SORT (base-insensitive order and /R reverse) and MORE (pass-through for simulator) read files or piped input using se(). Ported source-backed counterparts with a reusable quote-aware splitter and real mounted Guest file reads. No native process pipelines. Added pure model and browser integration contracts including real Guest Documents piping and redirection. In-progress implementation; this commit deliberately skips CI while the previous corrected chain/redirect acceptance batch runs. Original visual/screenshot parity remains pending.


## Original vt() ECHO interior spacing — 15 November 2026

Source cmd.js vt() retains the literal whitespace separator between the command and rest, while Te.echo trims only to classify ON/OFF/"." and displays e.rest.replace(/^ /,"") for other text. The prior React parser collapsed multiple spaces between ECHO and its text. Added sourceCmdRawRest and directed only ECHO rendering/classification through it, preserving multiple leading spaces, tabs and trailing spaces, without changing other command parsing. Added unit tests including a chained ECHO regression. This commit intentionally skips CI while the prior combined browser suite is active; verify with the subsequent pipeline batch. This is source compatibility, not native host shell access.


## Original CMD Ht.interrupt Ctrl+C and pending transcript — 15 November 2026

Pinned legacy b894 Ht.submit immediately appends a pending row, then Ht.interrupt increments runId, appends ^C to in-flight row output or inserts a new idle prompt/input^C entry, clears the input, and leaves the shell command-history recall unchanged. The React CMD UI now stages the pending command row before awaiting SourceCmdSession.run; a monotonic runId suppresses late stale-result rendering, source busy state resets and Tab completion is invalidated. Ctrl/Meta+C preserves noncollapsed window text selections. An interrupted idle command is not executed and is not inserted into Up/Down recall. Existing 300-entry transcript retention remains active for both paths.

Important limitation: the original source interrupts UI output by invalidating runId; it does not atomically cancel underlying explorer filesystem work. This migration likewise does not claim to cancel or reverse already-started Guest VFS mutations; stale effects may finish. It never executes a host command. Added pure state tests for idle/busy/retention and a desktop/mobile browser test for idle Ctrl+C, history and filesystem non-mutation. This commit opts in to one full [run-ci] acceptance batch; verify its conclusion before claiming this behavior passes.


## Original CMD PAUSE with host.waitForKey — 15 November 2026

Pinned legacy cmd.js ze.pause writes "Press any key to continue . . ." and suspends until b894 host.waitForKey resolves. The source UI routes the next key press to a keyResolver instead of treating it as a typed command. React SourceCmdSession now accepts an injected key reader; PAUSE displays its text immediately in the pending row, waits for any key, and resumes the same Guest session, including chained commands. Ctrl+C during PAUSE releases the wait and marks the in-flight row ^C through the runId guard. Unmount also releases an active resolver.

The model and browser tests cover blocking, keyboard acknowledgement, chained commands, interrupt, and an explicit error when no interactive host is available. No host OS command execution. The Ctrl+C CI was running when this code was staged; PAUSE will receive a later combined opt-in CI batch. Confirmation-based recursive Guest deletion and full screenshot parity remain pending.


## Source RD /S confirmation and atomic Guest subtree removal — 15 November 2026

Pinned Te.rd checks that a target exists and is a directory, rejects nonempty removal without /S, prompts for nonempty /S using ke(host.waitForKey) with the source message "C:\\...\\path, Are you sure (Y/N)? ", and only accepts a single Y/y. A refusal returns source status 0 with the directory intact; an empty folder does not prompt. The migration uses the actual mounted Guest VFS removeTree method for approved recursive removal, so nested entries are deleted atomically in a single persisted VFS change, never from the host OS. Without a key reader, nonempty /S fails visibly without deleting data. Added unit tests for N/Y, empty, lack of host, and desktop/mobile browser tests for original interactive confirmation. This commit is staged without [run-ci] while prior Ctrl+C run executes; batch it with the PAUSE interaction acceptance.


## Original Te.del file-pattern and all-files confirmation — 15 November 2026

Pinned original cmd.js De() treats an existing directory as pattern *, uses its final name as a case-insensitive wildcard expression otherwise, and ke(waitForKey) confirms only a pattern equal to exactly * before any removal. Files are removed from the current directory selection, while subdirectories are preserved. Rebuilt this on real Guest VFS list/stat/remove with original ascending name matching and source Y/N response (a single Y only). Declining confirmation leaves every file byte untouched; absent key reader returns a visible error and does not mutate. Added unit and real browser contract testing safe '*.txt' matching, directory-only removal, and both N and Y paths. No host filesystem access. This slice is staged without [run-ci] until the prior Ctrl+C run finishes, for a combined PAUSE/RD/DEL source acceptance batch.


## CMD DEL original wildcard existing-test contract repair — 15 November 2026

Combined [CI #43682005351](https://github.com/codersachin99/windows-os/actions/runs/43682005351) failed one stale Vitest assertion out of 398 tests after source DEL *.txt was intentionally made functional. The earlier test assumed all wildcard deletes are rejected and used the only remaining .txt file as a sentinel, so the newly supported pattern properly deleted it and returned status zero. Corrected that old safeguard test to attempt a nonexistent *.log pattern instead. Separate new tests already verify actual wildcard deletion and Y/N confirmation. This is a test-only change; source DEL implementation remains unchanged. One follow-up [run-ci] requested for the combined interaction acceptance and browser suite. Do not claim green until that run completes.


## Original ze.cmd nested interpreter banner — 15 November 2026

Source cmd.js ze.cmd does not start a host subprocess or another simulator CMD window; it invokes host.getBanner and writes those lines into the same console. Ported the exact original Win7 banner through existing SOURCE_CMD_BANNER for the CMD command, with HELP metadata and real model/browser regression tests. Kept simulator permissions and window lifecycle unchanged. This commit deliberately omits [run-ci] while the previous PAUSE/RD/DEL full CI runs; batch later. Screenshot parity remains pending.


## Ctrl+C while PAUSE waits and RD /S browser verification — 15 November 2026

[CI #43682097876](https://github.com/codersachin99/windows-os/actions/runs/43682097876) finished with 398 unit passes and 372 browser passes, but four browser failures (the same two scenarios on desktop and mobile). Ctrl+C while PAUSE is busy was blocked by the noncollapsed browser text-selection guard; the updated handler always treats Ctrl+C as interrupt when a source command is running, while retaining text-copy behavior at the idle prompt. The RD /S test checked the last *output row* after deleting the only listed folder and running bare DIR: an empty DIR /B emits no output, leaving the previous Y/N prompt as that locator. It now creates a safe DirAnchor.txt sentinel, verifies its listing after confirmed deletion, and verifies the removed directory no longer appears. The simulated filesystem deletion behavior did not require a change. Opt-in test run is held until bundled with the original DIR feature.


## Original CMD Te.dir /B /S /W, detail layout and bounded source recursion — 2026-11-15

Pinned legacy cmd.js Te.dir uses De() to treat a known directory as an all-entries pattern and a file path as parent+filename; xe() filters/sorts names using the source case-insensitive pattern grammar. Source /B emits names (full Windows paths for /S); /S recursively traverses every subdirectory even if its name doesn't match the filter, to depth Se=12; and /W renders V(j(list,5)) into five column-first dynamically spaced columns, enclosing folders in brackets. Source pe() formats timestamps (MM/DD/YYYY HH:mm AM/PM), fourteen-width size or <DIR>, and names. Source de()/me() render mounted disk label, deterministic serial, file and directory totals and free capacity. Source Ce=5000 caps printed items.

Ported these into the modular SourceCmdSession and isolated pure sourceCmdDirDetailLine, sourceCmdDirSummary, sourceCmdDirWideLines utilities and limits. Directory selection and recursively printed files originate only from the actual shared Guest VFS; free/used metadata come only from source runtime mount stats. Added pure, mounted VFS and desktop/mobile acceptance tests for wildcard recursion, full paths, wide columns, volume headers, concrete file targets and depth. These do not invoke a native shell or touch the host filesystem. Prior PAUSE Ctrl+C and empty DIR /B browser fixes are batched with this commit for one opt-in CI. Do not claim the batch green until full browser verification concludes.


## Source CMD WHERE using pinned c170 app installation paths — 2026-11-15

Original ze.where resolves a program through the source program resolver and writes its c170 install pathname prefixed with C:\\; unknown programs return INFO: Could not find files for the given pattern(s). with errorlevel 1; an empty query prints help and errorlevel 1. Added sourceCmdWhereInstallPath backed by the existing shared source program manifest; it recognizes canonical IDs, aliases, and installed executable basenames. The result reports registered simulator installation metadata rather than querying host PATH or executing any host program. Added direct model and desktop/mobile browser tests for notepad, calculator/mspaint aliases, cmd, unknown entries and missing arguments. This commit intentionally omits [run-ci] while the earlier DIR/interactive-fix browser suite remains active.


## Original CMD ze.start launches registered source Guest apps — 2026-11-15

Pinned source ze.start parses the first program token, resolves it through the legacy app resolver, and calls the simulated window host openWindow / launchApp. It does not run operating-system executables. Added shared sourceCmdResolveProgramId against the c170 source manifest (IDs, aliases and installed .exe basenames), reused by ze.where. Injected a permissioned launch callback into SourceCmdSession; the existing DesktopShell appRegistry dispatches OPEN_APP, exactly as the already-migrated Run dialog does. Unknown or not-yet-migrated applications return the original "The system cannot find the file NAME." text and errorlevel 1, rather than fabricating a window. START with no arguments succeeds without an action. Unit tests cover canonical/alias resolution, refused launch and no host execution; browser acceptance opens the actual Notepad Guest window and checks missing-app errors. This commit omits [run-ci] while the previous DIR/interactive browser suite runs.


## Source contract clarification: no BAT/CMD script interpreter in pinned Tt.execute — 2026-11-15

Pinned legacy-win7 cmd.js Tt.execute calls ht(name) to resolve a fixed internal command list; an unrecognized name returns the standard internal/external command error rather than loading Guest VFS BAT/CMD script content or invoking the native host shell. The PATHEXT environment value is present but is not a general executable evaluator in the source. Therefore this migration must NOT invent BAT script execution, cmd /c native command handling or host process spawning as an apparent missing feature. Only source-reachable built-ins and installed-app host adapters should be implemented. Added a mounted Guest .bat negative-regression test to preserve this security and source-fidelity boundary. The previously written handoff shorthand "batch pending" is superseded by this pinned-source evidence.


## Original simulated CMD TASKLIST and TASKKILL — 2026-11-15

Pinned source cmd.js Re filters open simulated app windows, derives task images from app IDs and assigns PIDs starting at 1000 in increments of four. je renders aligned Image Name, PID, Session Name, Session# and Mem Usage columns; the original simulated memory value is 8,192 K. Ne resolves a taskkill /PID or /IM to a simulated app window; taskkill reports the source signal message and asks the UI host to close that window. This does NOT query or terminate actual operating-system processes. Added sourceCmdTasks and sourceCmdTasklistOutput as pure helpers and injected read-only open-window and permissioned close-window callbacks through the already-established CMD host adapter. DesktopShell supplies current actual windows and delegates closure through its existing onRequestCloseWindow pathway (including any existing app closing protections). Unit tests verify PIDs, source formatting, error/confirmation text and simulated termination; desktop/mobile acceptance lists CMD and requests that it close itself with TASKKILL. CI is intentionally batched later, after the current original WHERE/START acceptance run.

## Pinned CMD IPCONFIG virtual Ethernet adapter — 15 November 2026

Original `legacy-win7/src/modules/apps/cmd.js` Ze.ipconfig uses constant `qe` with IPv4 192.168.1.42, mask 255.255.255.0 and gateway 192.168.1.1. It prints a WindowsOS IP Configuration heading and the simulated Ethernet adapter (via source V column alignment); `/ALL` does not add fields in the pinned source. Ported this one self-contained command to the existing CMD model with a pure output helper, HELP metadata, unit assertions and desktop/mobile Playwright regression. No network adapter, DNS lookup, web ping or native host networking is queried. This is not yet HOSTNAME/PING/SYSTEMINFO or full CMD pixel parity. The change intentionally omits `[run-ci]` while the earlier cumulative TASKLIST/TASKKILL opt-in workflow is unresolved; CI must be requested only when a meaningful new batch needs validation.

## Source CMD WINVER opens the original About Windows window — 15 November 2026

Original pinned cmd.js `ze.winver` declares `program: "about"` and delegates to the simulator host's `openWindow("about")`. The React CMD now delegates `WINVER` through the existing permissioned `launchProgram("about")` callback, which is already backed by DesktopShell AppRegistry and the faithful About Windows package. There is no native `winver.exe` execution. If no launcher is connected, it returns an explicit failure rather than pretending success. Added command HELP metadata, pure adapter coverage and desktop/mobile Playwright verification that the real About dialog opens and closes. This commit deliberately does not include `[run-ci]`; combine with other substantive source commands once previously running CMD browser acceptance concludes. The larger CMD and screenshot parity remain unfinished.

## CMD repeated PAUSE Ctrl+C synchronous in-flight guard — 15 November 2026

GitHub Actions `#43684413314` finished **failure**, with 384 passing Playwright browser cases and the same two desktop/mobile `PAUSE` Ctrl+C tests failing (expected pending row + `^C`, actual only pending row). TypeScript, units, original migration audits, Contacts source checks, Vite build, Chromium install succeeded. The earlier runs `#43684125612` (382 browser passes) and `#43683710914` (378 browser passes) also had the same browser failures. The implementation was relying on render-time `busy` in the interrupt/copy-selection handler even though the pending row and `pendingEntry.current` are set synchronously. Use the in-flight ref as the authoritative running state in submit/interrupt/selection gate, retaining React busy for UI readOnly. Add a second-pause readonly and transcript-entry-count browser regression; keep the original Ctrl+C semantics. This is a targeted hypothesis-backed repair, **not yet CI-verified**, so do not claim the failures are fixed before an opt-in CI succeeds. No host execution or guest file operation rollback is introduced.

## Original CMD ot.LOGOFF / ot.SHUTDOWN simulator view transitions — 15 November 2026

Pinned `legacy-win7/src/modules/apps/cmd.js` `ot.logoff` delegates to `host.changeView({view:"Logon"})`; `ot.shutdown` to `host.changeView({view:"Shutdown"})`. The existing React engine already exposes `LOG_OFF` and `SHUTDOWN` and corresponding real screens. CMD now delegates solely through its own optional, permissioned `changeView` callback, wired from `DesktopShell` to the matching engine dispatch. No native host logoff, OS shutdown, navigation, process execution or destructive storage change occurs. The existing shell reducer owns window cleanup and Guest session logoff; the original CMD view change triggers the existing logon/shutdown surfaces. Added source command HELP metadata, pure callback/permission tests and independent Playwright desktop/mobile lifecycle acceptance. The source `BSOD` view remains a different unported command and has **not** been fabricated. CI acceptance for this batch is pending.

## Original CMD Ze.HOSTNAME web-adapter behavior — 15 November 2026

Pinned source CMD `Ze.hostname` writes `(await host.getDeviceInfo()).host`. The pinned browser `src/modules/runtime/capacitor-plugin-device2.js` `Device2Web.getInfo()` returns `host:""`, overriding the generic device info. Therefore the original **web** simulator prints exactly one blank line for `HOSTNAME` with exit status 0; it does not display the user's actual computer hostname, IP address, or an invented machine name. Ported that exact web behavior and source HELP description to CMD, with pure and desktop/mobile browser assertions. This does not claim native Capacitor/Tauri device-info parity; those would require a distinct permissioned host adapter. The prior opt-in CI `#43689829426` covers commits through `a3ff1b3`, **not** this newer HOSTNAME slice, which deliberately omits `[run-ci]` while the existing batch runs.

## Root-caused source PAUSE Ctrl+C modifier key regression — 15 November 2026

CI [#43689829426](https://github.com/codersachin99/windows-os/actions/runs/43689829426) finished **failure** with 392 Playwright passes and exactly two desktop/mobile failures in the same `PAUSE` Ctrl+C test. The new expectation saw **four** entries where **three** were expected. This uncovered the cause: `ControlOrMeta+c` emits a **modifier keydown first**, and our `keyResolver` treated that Control/Meta key as `PAUSE`'s any-key acknowledgement, prematurely completing the command before the `c` keydown. Subsequent Ctrl+C then appended a separate idle `^C` entry instead of interrupting the pending PAUSE output. An earlier failed test had observed the same underlying issue as a missing `^C` in the expected pending row.

The repair explicitly ignores standalone Control/Meta keydowns while `PAUSE`'s keyResolver is pending; the next Ctrl+C chord keydown reaches `interrupt()` and annotates the existing row, while ordinary `x`/Enter/other keys still acknowledge PAUSE. The real on-screen keyboard regression now presses Control alone first and checks the prompt remains pending, then Control+C and checks the same entry receives `^C` with no additional entry. These are simulator-only UI changes: no native process, host shell or disk modification. The fix is committed with a single **[run-ci]** opt-in acceptance; no acceptance may be claimed until browser suites finish.


## Original CMD SYSTEMINFO web-device adapter and IPCONFIG heading correction — 15 November 2026

Pinned legacy `src/modules/apps/cmd.js` `ot.systeminfo` reads `host.getDeviceInfo()`, formats the eight static Windows 7 simulator `st` values and `it(device)` fields with `V(rows,2)` aligned columns. `getDeviceInfo` merges `DeviceWeb.getInfo()` (browser user-agent model, actual OS string and manufacturer) with `Device2Web.getInfo()` (blank host, boot time zero, browser locale/timezone, 16GiB simulated total/available memory, viewport height x width, no cameras) and browser battery fraction when supported, default 100%. The React CMD uses an injected read-only browser adapter, original user-agent parser and pure formatter. No native OS/device/driver inquiry, network access or fake computer name. Disconnected unit model fails visibly instead of inventing details. Added unit contracts for browser UA parsing, source metadata, memory, camera, locale and battery, plus desktop/mobile browser acceptance.

Pinned source module `15ca` `$["e"]="Windows"` in the base variant. Consequently original `Ze.ipconfig` outputs **Windows IP Configuration**, not the previous assumed `WindowsOS IP Configuration`. Corrected command, unit test and both browser assertions. This follow-up intentionally has no `[run-ci]` while CMD Ctrl+C acceptance #43711921734 is running. That workflow cannot verify this newer change. Other source CMD host integrations and full screenshot parity remain pending.

## Source CMD BSOD simulator-only Win7 blue-screen view — 15 November 2026

Pinned `ot.bsod` delegates `host.changeView({view:"Bsod",error:"DUMMY_BSOD"})` to the legacy simulator, not a real system crash. Pinned `src/modules/shell/bsod.js` module `6812` renders the Windows 7 blue background `#0100ad`, Lucida Console white text, `ERROR_DUMMY_BSOD`, troubleshooting paragraphs, the original stop number and click-to-restart. `src/styles/shell/bsod.css` sets source padding `0 5vmax`. Added typed `BSOD` engine transition (desktop only), source-faithful `SourceBsodScreen` UI, `CMD bsod` permissioned changeView dispatch, a11y keyboard restart and responsive typography, along with reducer, model, and desktop/mobile browser acceptance. This **does not** implement the separate interactive BSOD generator app or theme-specific Win8/Win10/Win31 blue-screen styles. It does not crash or reboot the host computer. Earlier opt-in CI run #43711921734 is on commit `182ba8a` and cannot accept the later systeminfo/IPCONFIG/BSOD work; do not claim tested until a subsequent combined run.

## Original CMD Ze.PING browser probe with deterministic packet contracts — 15 November 2026

Pinned `cmd.js` Ze.ping uses original `Je` parsing (4 packets default, `-n` 1..20), a first `host.ping(target)` reachability probe, then 32-byte request lines, timeout messages and `Qe` packet loss/min/max/average summary. Its target parser deliberately uses the **first argument not beginning with '-'**, even though `-n` is counted separately; this is a source behavior, not a native system command grammar. Added model command branch, source count/statistics pure helpers, HELP metadata and deterministic injected browser `pingTarget` tests including partial packet loss and invalid/missing targets.

The source host binds `Wt.ping` to a browser Ping.js-style transport with 4-second timeout. The React browser adapter uses a read-only HTTP(S) public icon image request and that same timeout; success and millisecond measurements come only from the actual browser probe, never fabricated. A remote site lacking a public icon or blocking image access may yield a failed probe, which is **not proof of ICMP reachability**. The browser regression exercises missing/invalid targets without depending on the external network. No native ICMP, child process, OS command, system network configuration change or shell execution. Remaining source PING.js transport byte parity, end-to-end live remote reachability and full CMD visual parity are **not** asserted. This change omits `[run-ci]` while the prior Ctrl+C acceptance workflow remains pending.

## Original CMD 41-command name inventory; on-demand acceptance request — 15 November 2026

Pinned `legacy-win7/src/modules/apps/cmd.js` contains 41 `key:` built-in commands. Original name inventory regression now checks all 41 migrated `SOURCE_CMD_HELP` entrypoints, covering source `PING` and `BSOD` additions; this does **not** imply every flag/edge case, dynamically reachable browser host operation, source-specific screen, or visual pixel is accepted. The previous source interactive-keyboard CI [#43711921734](https://github.com/codersachin99/windows-os/actions/runs/43711921734) finished **SUCCESS** on commit `182ba8a`, including all TypeScript, unit, source audits, Vite build and desktop/mobile browser checks. That run predates `SYSTEMINFO`, the corrected `Windows IP Configuration` heading, the Win7 BSOD view, and the browser-only PING probe. This commit requests a **single** `[run-ci]` acceptance batch for those changes, new source-unit contracts and browser coverage. Never claim passing before the exact batch finishes. Keep draft PR #1 open, main untouched and no release; overall source screenshot parity remains zero formally accepted.

## Exact legacy Ping.js favicon probe and CMD utility CSS corrections — 15 November 2026

Source `legacy-win7/src/modules/apps/cmd.js` includes inline module `a3be` / `3b61` with original Ping.js implementation: it creates a browser `Image`, assigns `src = targetOrigin + "/favicon.ico?" + Date.now()`, uses a 4000 ms timeout, and returns elapsed **Date** milliseconds; success is solely from `onload` (not ICMP). Updated the React browser-only probe to that source URL/cache-buster shape and Date-based timing. An isolated pure `sourceCmdPingImageUrl(target,nonce)` guards HTTP(S) origins; no arbitrary JavaScript/data URL or native OS operation is permitted. A unit test covers source URL formation and unsafe URL rejection, without live network dependence.

Source `b894` CMD template uses utility `p-0.5` (2px), `break-all` command rows, `break-words` output rows, and `center-flex-x` input-row alignment. Corrected React CMD styling from its previous 3x4px padding and overly aggressive `overflow-wrap:anywhere` to those source utility semantics; preserved 20px `mt-5` entry spacing and the shared window/titlebar. Exact screenshot/pixel visual parity remains unverified; font size and all themes still require paired source comparisons. These follow-ups intentionally do **not** trigger another CI while the prior command acceptance batch #43713451078 is running.

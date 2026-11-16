## Pinned 5985 generic source search + combined full acceptance (16 November 2026)

[Prior opt-in CI #43731878736](https://github.com/codersachin99/windows-os/actions/runs/43731878736)
completed **FAILURE**: TypeScript, all 469 Vitest tests, source audits
and Vite build passed; **428 / 430** desktop/mobile Playwright tests passed.
Both failures were the same new Control Panel Defender results test:
Playwright strict mode rejected `[data-test-cpanel-result="defender"] button`
because it matched **two** correctly disabled controls. Commit e6b1ae6
had already fixed the ambiguous locator by asserting each separately,
but was after the run's source snapshot. Do not attribute the failure
to actual host settings or the original source registry.

Implemented original `cpanel.js` webpack **5985** parsing/scoring as
reusable `packages/engine/src/sourceSearch.ts` and exported its typed
helpers through `@windows-os/engine`. Source behavior includes NFD accent
removal, case normalization, complete quoted phrase and `key:value`
filter grammar, punctuation/Thai/Myanmar/Khmer/CJK word boundaries,
per-term name 10 / keyword 1 relevance, exact +1000, prefix +100 and
ordered words +5. `sourceRegistry.ts` now shares this engine instead of
duplicating a partial whitespace splitter. As in original `a682`,
filters are recorded but not applied to Control Panel task matching,
and filter-only searches display the root tiles. Added standalone Vitest,
Control Panel search tests and paired desktop/mobile Playwright coverage.
The original `SourceListView variant="tiles"` remains reused from the
existing engine, with all 24 pinned source icons.

This deliberately opted-in **[run-ci]** acceptance commit covers both
the known strict-selector correction and the new shared source search,
all regression tests, Vite build, and desktop/mobile browser suite.
**Do not claim success until the exact new run completes.** Original
visual screenshot comparison, native setting/program adapters, source
search debounce timing, alternate-theme skins and deeper per-app
functionality are still pending. PR #1 draft; main unchanged.

## Source ListView reuse and CI acceptance state (15 November 2026)

The source Control Panel 24-tile root now renders using the already
shared `SourceListView variant="tiles"` engine rather than a bespoke
list container. Added an explicit desktop/mobile Playwright marker test.
The pinned 21 new image blobs and 24-item registry remain intact.
Also tightened the new unsupported Defender search-result assertions to
target the heading and task buttons individually (Playwright strict
locators reject two matched buttons).

[CI #43731878736](https://github.com/codersachin99/windows-os/actions/runs/43731878736)
on 08a43b3 has **passed** TypeScript, all Vitest tests, source audits
and Vite build; the desktop/mobile browser stage was still executing at
this handoff edit. The follow-up test locator and SourceListView reuse
were committed **after** that CI snapshot, so they must not be claimed
as CI-accepted. If that browser stage fails on the old ambiguous
Defender selector, do not treat it as production UI failure; the
selector correction is already in branch. Trigger the next full batch
only when actually necessary with the requested [run-ci] commit.
Keep PR #1 draft, no main merge and no release.

## Source registry unit assertion correction (15 November 2026)

[CI #43731769836](https://github.com/codersachin99/windows-os/actions/runs/43731769836)
passed strict TypeScript, then failed **one newly authored unit assertion**;
**468 of 469 Vitest tests passed**. The test incorrectly used
`toMatchObject({tasks:[{label:"Back up your computer"}]})` on the pinned
Backup entry, but the exact source correctly defines **two tasks**, backup
and restore. Commit 80c481d now explicitly checks both labels without
changing production registry code. This is the single new deliberate
**[run-ci]** full gate after the two acceptance-test-only corrections.
Do not claim the target passed until its exact run completes. Main remains
untouched; draft PR #1 stays open.

## Source registry CI TypeScript correction — 15 November 2026

[Opt-in run #43731673649](https://github.com/codersachin99/windows-os/actions/runs/43731673649)
failed early in strict TypeScript (`TS6133`): unused callback parameter
`field` in `sourceRegistry.ts` search scoring. No production or browser
logic failure was reached. Commit b03bffe replaced the unused parameter
with `_`; the predicate uses the source word-start matcher as intended.
This deliberate follow-up **[run-ci]** checkpoint reruns all gates on the
corrected code plus earlier ZIP correction and 24 original tile icons.
Do not claim tests passed until the exact new run finishes. PR #1 stays
draft; main remains untouched.

## Full pinned Control Panel registry + backup acceptance recheck (15 November 2026)

Source original 3097/a97a/a682 defines **24** root items, ordered tiles and
**66** en-US tasks (5985 keyword/word-start ranking). Imported typed
`packages/apps/cpanel/src/sourceRegistry.ts`, rendered all 24 root items and
search tasks, preserved source-supported redirects, and kept host-native
settings/unmigrated program launchers visibly disabled instead of faking
host operations. Imported **21** byte-identical Win7 source icon files,
including original Backup/Restore, completing exact artwork for all 24 items.
The three previously imported images were Display, Programs and Accounts.
See `migration/CPANEL-REGISTRY-SOURCE.md`. All six original page routes
have working React slices but full visual/source parity is not accepted.

[Run #43724080733](https://github.com/codersachin99/windows-os/actions/runs/43724080733)
ended **FAILURE** only in the desktop and mobile Backup ZIP browser test:
**424 of 426 passed**; each failed on a stale expected string
"1 restored, 0 skipped" because the source Guest snapshot contains
34 already-existing AppData Start Menu shortcuts. The actual restore
succeeded ("1 restored, 34 skipped"). Commit d97996c corrected the
assertion to accommodate source shortcuts without weakening the one-file
restore/no-overwrite contract. Added unit/E2E checks for source registry,
redirects, exact image paths and browser/mobile behavior, plus a preflight
file-vs-folder ZIP collision guard and its regression test. TypeScript,
Vitest, source audits and build passed in the earlier failed run, but it
did not include these subsequent changes.

This **single deliberately opted-in [run-ci] checkpoint** covers the
corrected ZIP/browser regression, 24-entry root registry, task search,
source-exact icons, and all existing suites. Do not claim it passed until
its exact Actions run completes. Keep feature PR #1 draft and
`main` unchanged. Next after CI: original-vs-React screenshot parity,
then theme/host adapter parity and any remaining source gaps.

## Sixth Control Panel page — real source ZIP Backup & Restore (15 November 2026)

The previous combined notification/tray run #43719078159 finished SUCCESS.
Resolved the exact seven original f106 backupFolders and 0e9a text formats.
Implemented sourceBackup.ts (fflate, original manifest, ZIP hardening, safe
profile-only create-only restore), BackupRestorePanel.tsx (browser download,
upload, progress, results, lastBackup), sixth Control Panel route, and
source-pinned Vitest/Playwright regression coverage. CI acceptance is
requested in this deliberate [run-ci] checkpoint; do not claim the new
feature passed until that run completes. All six navigable original pages
exist but category UI, theme skins, original screenshots, native adapters
and pixel/function parity remain pending. PR #1 stays draft; main untouched.


## Original Backup/Restore contract and remaining gate — 15 November 2026

Source-traced original `cpanel.js` `Pe/Ie/je` ZIP
backup/restore and page `ue/Te`. Documented exact manifest,
progress states, lastBackup, browser download, profile-only restore,
existing-file skip, and source folder list discovery still needed.
Added `migration/CPANEL-BACKUP-SPEC.md` with a security and test
acceptance plan. No ZIP export or restore UI has been claimed,
and current source program binaries are not exposed as native OS files.
Five navigable Control Panel routes remain in-progress, final
Backup/Restore page and full source visual parity pending.
Current CI #43719078159 checks earlier tray work and does not include
the newer Action Center source route or this documentation checkpoint.


## Action Center read-only source Guest notification history — 15 November 2026

Source `src/modules/apps/cpanel.js` `te/oe` Action Center panel
reads Vuex `notifications.history`, calls `MarkAllRead` on mount,
displays the `review-messages-title` header, and shows either
`no-messages` or actual history cards. Pinned
`assets/locales/en-US.json` provides **exact** strings:
"Review recent messages and resolve problems",
"Action Center has nothing to report.", "No messages",
"Change Action Center settings" and "View archived messages".
The latter two source side links are **disabled**.

The fifth Control Panel location `action-center` now renders this
source Guest empty-state because no real notification-history provider
is mounted in the React shell; it does **not** invent alerts, security
diagnoses, a backend history, or mark nonexistent messages read.
The component accepts an optional typed `messages` list for eventual
Vuex-notification history parity; until then the Guest source history
is truthfully empty. A source-specific search, Back/Forward navigation,
and desktop/mobile browser test verify exact translated copy, blocked
links, no invented message entries, and route reopening. The full
notification-history provider, read tracking and safe parsed inline
links remain pending. The sixth original Control Panel page,
Backup/Restore, is still outstanding. This follow-up does not
trigger CI while the previous combined acceptance batch is active.


## CI root cause and combined Control Panel acceptance — 15 November 2026

[Run #43717661924](https://github.com/codersachin99/windows-os/actions/runs/43717661924)
completed **FAILURE**: TypeScript, unit, audits and build passed;
**414 desktop/mobile browser tests passed**, exactly **two** failed on
`tests/e2e/cpanel.spec.ts` Display test. The test incorrectly
used Playwright `expect(fieldset).toBeDisabled()` even though its
browser locator resolved to `<fieldset disabled ...>` with the
disabled attribute present. Playwright's disabled check covers the
inherited *form controls*, not the fieldset element itself; the test
therefore checks `toHaveAttribute("disabled","")` and keeps the
independent disabled select assertions. No production UI code changed
for that correction.

This combined **[run-ci]** checkpoint checks Display/Programs,
the Guest-only User Accounts screen + original Switch semantics, the
source bc55 notification preferences and real taskbar tray wiring,
and all existing regressions. Do not report success until the exact
run completes. PR stays draft, main untouched, and all remaining
source CPANEL pages and pixel visual parity remain pending.


## Notification Area Icons — source bc55 + cpanel.js qe responsive tray behavior

Original `src/modules/shell/taskbar-base.js` module `bc55`
defines **four** default tray items in order: Action Center, Network,
Battery, Volume, each state `"shown"`; `showClockIcon=true`,
`alwaysShowIcons=false`. Its selectors `visibleItems`, `hiddenItems`
and `enabledItems` differentiate `shown`, `hidden`,
`notifications-only` and `off`. The source `cpanel.js` `qe`
panel provides the notification-area dropdowns, system icon on/off
subpage, Restore defaults, Always show checkbox, and OK/Cancel footer.

React now has a typed pure tray preference model, original initial values,
source selector functions and deterministic unit tests. The fourth
Control Panel page `notification` renders both `qe` subviews.
Preferences are lifted to `App` so they survive source
`Alt+L` Switch/resume; visible tray icons, clock visibility and
hidden-icons flyout update immediately on selection. Restore default
behaviors resets only `trayItems` exactly as the source action; it
does not implicitly change the independent clock/always-show options.
Desktop/mobile browser tests exercise visible/hidden flags, flyout,
always-show, system clock off/on and restoring defaults.

Imported five byte-identical pinned Win7 assets: volume 100, network,
action-center, datetime-s and battery 90. Tray images are simulator UI;
their presence **does not assert real host battery level or internet
connectivity**, and clicking icons does not control native speakers or
OS notifications. Full Vuex persisted settings, tray popup contents,
notification counts/actions, source mobile skin and pixel screenshots
remain pending. The page and shell tray wiring intentionally have no
`[run-ci]` while CI #43717661924 from the previous Display/Programs
batch is running. The new code cannot be called CI-accepted yet.


## User Accounts — source Guest-only Kt/Xt page

Pinned `src/modules/apps/cpanel.js` `Kt` handles original
account panel `accounts` and `pageLinks`. With `user=null`
(the pinned browser Guest desktop), `Change password`, `Change picture`,
`Change name`, `Link account`, and `Delete account` are disabled;
the Guest card from `G` displays `Guest account`; the
`logoff()` action emits `changeView({view:"Switch"})`, **not** a
destructive `LOG_OFF`. React now renders that source Guest card and
blocked actions, and invokes the existing permissioned `SWITCH_USER`
phase to preserve running windows and files. This was verified from
the source; authenticated account management and backend changes are
not faked. The source's "View other accounts" action relies on the
original account backend and is explicitly disabled pending that
integration.

Added narrow account search, Back/Forward navigation, source file-art
`accounts.2f4d5075.webp` imported byte-identically (blob SHA
`9b11bc4dd87a06e76db474967deaeda6d45c9def`), unit contracts
and desktop/mobile browser acceptance for Guest switch/resume. All
other original Control Panel account pages and screenshot parity
remain pending. This commit intentionally avoids `[run-ci]` while
the earlier Display+Programs acceptance run #43717661924 is active.


## Control Panel Display + Programs combined opt-in acceptance — 15 November 2026

The previous [desktop original hotkeys CI #43716174491](https://github.com/codersachin99/windows-os/actions/runs/43716174491) finished **SUCCESS** on commit `942f594`. The feature branch subsequently added the source Alt+L Switch/Guest-session-preserving view (`df0babf`), first Control Panel Display navigation/disabled-web-controls/source binary assets (`c6b0bf5`), and Control Panel Programs list/search/selection with source-installed executable manifest (`f9304c7`). This checkpoint requests **one deliberate `[run-ci]`** batch to verify those commits in TypeScript, Vitest, source inventory/build and desktop/mobile Chromium. Do not claim it passed before the workflow completes. Keep PR #1 draft and main untouched; Control Panel's other four internal pages, true source category registry and exact screenshots remain pending.


## Programs and Features — source-list/selection follow-up

The original `src/modules/apps/cpanel.js` `ra` programs panel renders
a two-pane list with heading `uninstall-change-program`, source instruction,
disabled Organize menu, name/date/version/type table and click-selectable
rows sorted by lower-case label. The React Control Panel now exposes a
second real navigation location `programs`; its rows come from the
already source-pinned c170 manifest `sourcePrograms`, filtered to actual
Guest-installed executable paths and excluding source-hidden entries.
The module does **not** invent host machine installed packages or device
version metadata: version is `--`, date explicitly unknown, type
`Simulation`. The original split between `appItems` (device metadata)
and `programItems` (simulator data) is still pending. Row selection,
Back/Forward history, search discovery and no-uninstall-without-permissions
are covered by model and desktop/mobile browser tests.

Imported source exact `programs.610e703b.webp` with verified Git blob
SHA `20787fca64de67b1b40ba3c16baf2f3362d84e6a`. The original
installer launch side pane and uninstall flows are not implemented;
do not substitute deleting Guest binaries. Other internal Control Panel
screens, full category/search index and screenshot fidelity are pending.


## First real source Control Panel Display slice — 15 November 2026

Registered `cpanel` in the shared app registry and Start Menu right-side action, built
`packages/apps/cpanel` as a separate React package. Source `cpanel.js`
a259/pa location history (root null, back/forward, truncate forward)
and original Display resolution/zoom choices are implemented, and web-only
Display controls remain disabled per original source rather than writing
host display settings. Imported original cpanel, display and resolution
WebP binary artwork using exact legacy blob SHA verification.
Added model and desktop/mobile Playwright contracts and a detailed
`migration/CPANEL-SOURCE.md`. The Control Panel source tracker moves
pending → in-progress; other five panels, root category registry,
search index, layout pixel parity and native adapters remain pending.
No full app acceptance is claimed. CI next opt-in batch when previous hotkey
run #43716174491 concludes.


## Original Alt+L separate Switch phase — 15 November 2026

Traced `src/modules/runtime/vue-app.js` source logon view function
`d(view): ["Logon","Switch"].includes(view)` and changeView event,
confirming that Alt+L **must preserve session/windows** instead of LOG_OFF.
Added a typed `switch` desktop phase with `SWITCH_USER` and
`RESUME_SESSION` reducers and reused the existing Guest logon UI.
Reentering Guest resumes the same open windows and filesystem session;
actual Start-menu LOG_OFF still clears session/windows. Added unit and
desktop/mobile Playwright regression plus source handoff. Unsupported
authenticated multi-user switch remains explicit; full hotkey library
and Control Panel source navigation are still pending.
No redundant CI trigger while prior opt-in workflow #43716174491 runs.


## Original desktop shell Alt hotkeys — 15 November 2026

Read `legacy-win7/src/modules/system/main.js` source we.mounted hook and `src/modules/shell/hotkey.js` filter. Ported original **Alt+D** (MinimizeAll), **Alt+W** (Start toggle), **Alt+E** (Computer), **Alt+R** (Run) to the React DesktopShell using a pure typed action mapper with editable field guard. Added unit and desktop/mobile Playwright tests and source audit notes; updated `src/modules/shell/hotkey.js` module-tracker from pending to **in-progress**. Other source shortcuts **Alt+L** (Switch user, not LOG_OFF) and Shift+Tab (source no-op) intentionally remain unported rather than faked. CI has not run for these newer changes; previous CMD acceptance #43713451078 succeeded at commit a6487d8. Branch and PR remain draft, main untouched.

## Exact legacy Ping.js favicon probe and CMD utility CSS corrections — 15 November 2026

Source `legacy-win7/src/modules/apps/cmd.js` includes inline module `a3be` / `3b61` with original Ping.js implementation: it creates a browser `Image`, assigns `src = targetOrigin + "/favicon.ico?" + Date.now()`, uses a 4000 ms timeout, and returns elapsed **Date** milliseconds; success is solely from `onload` (not ICMP). Updated the React browser-only probe to that source URL/cache-buster shape and Date-based timing. An isolated pure `sourceCmdPingImageUrl(target,nonce)` guards HTTP(S) origins; no arbitrary JavaScript/data URL or native OS operation is permitted. A unit test covers source URL formation and unsafe URL rejection, without live network dependence.

Source `b894` CMD template uses utility `p-0.5` (2px), `break-all` command rows, `break-words` output rows, and `center-flex-x` input-row alignment. Corrected React CMD styling from its previous 3x4px padding and overly aggressive `overflow-wrap:anywhere` to those source utility semantics; preserved 20px `mt-5` entry spacing and the shared window/titlebar. Exact screenshot/pixel visual parity remains unverified; font size and all themes still require paired source comparisons. These follow-ups intentionally do **not** trigger another CI while the prior command acceptance batch #43713451078 is running.


## Original CMD 41-command name inventory; on-demand acceptance request — 15 November 2026

Pinned `legacy-win7/src/modules/apps/cmd.js` contains 41 `key:` built-in commands. Original name inventory regression now checks all 41 migrated `SOURCE_CMD_HELP` entrypoints, covering source `PING` and `BSOD` additions; this does **not** imply every flag/edge case, dynamically reachable browser host operation, source-specific screen, or visual pixel is accepted. The previous source interactive-keyboard CI [#43711921734](https://github.com/codersachin99/windows-os/actions/runs/43711921734) finished **SUCCESS** on commit `182ba8a`, including all TypeScript, unit, source audits, Vite build and desktop/mobile browser checks. That run predates `SYSTEMINFO`, the corrected `Windows IP Configuration` heading, the Win7 BSOD view, and the browser-only PING probe. This commit requests a **single** `[run-ci]` acceptance batch for those changes, new source-unit contracts and browser coverage. Never claim passing before the exact batch finishes. Keep draft PR #1 open, main untouched and no release; overall source screenshot parity remains zero formally accepted.


## Original CMD Ze.PING browser probe with deterministic packet contracts — 15 November 2026

Pinned `cmd.js` Ze.ping uses original `Je` parsing (4 packets default, `-n` 1..20), a first `host.ping(target)` reachability probe, then 32-byte request lines, timeout messages and `Qe` packet loss/min/max/average summary. Its target parser deliberately uses the **first argument not beginning with '-'**, even though `-n` is counted separately; this is a source behavior, not a native system command grammar. Added model command branch, source count/statistics pure helpers, HELP metadata and deterministic injected browser `pingTarget` tests including partial packet loss and invalid/missing targets.

The source host binds `Wt.ping` to a browser Ping.js-style transport with 4-second timeout. The React browser adapter uses a read-only HTTP(S) public icon image request and that same timeout; success and millisecond measurements come only from the actual browser probe, never fabricated. A remote site lacking a public icon or blocking image access may yield a failed probe, which is **not proof of ICMP reachability**. The browser regression exercises missing/invalid targets without depending on the external network. No native ICMP, child process, OS command, system network configuration change or shell execution. Remaining source PING.js transport byte parity, end-to-end live remote reachability and full CMD visual parity are **not** asserted. This change omits `[run-ci]` while the prior Ctrl+C acceptance workflow remains pending.


## Source CMD BSOD simulator-only Win7 blue-screen view — 15 November 2026

Pinned `ot.bsod` delegates `host.changeView({view:"Bsod",error:"DUMMY_BSOD"})` to the legacy simulator, not a real system crash. Pinned `src/modules/shell/bsod.js` module `6812` renders the Windows 7 blue background `#0100ad`, Lucida Console white text, `ERROR_DUMMY_BSOD`, troubleshooting paragraphs, the original stop number and click-to-restart. `src/styles/shell/bsod.css` sets source padding `0 5vmax`. Added typed `BSOD` engine transition (desktop only), source-faithful `SourceBsodScreen` UI, `CMD bsod` permissioned changeView dispatch, a11y keyboard restart and responsive typography, along with reducer, model, and desktop/mobile browser acceptance. This **does not** implement the separate interactive BSOD generator app or theme-specific Win8/Win10/Win31 blue-screen styles. It does not crash or reboot the host computer. Earlier opt-in CI run #43711921734 is on commit `182ba8a` and cannot accept the later systeminfo/IPCONFIG/BSOD work; do not claim tested until a subsequent combined run.


## Original CMD SYSTEMINFO web-device adapter and IPCONFIG heading correction — 15 November 2026

Pinned legacy `src/modules/apps/cmd.js` `ot.systeminfo` reads `host.getDeviceInfo()`, formats the eight static Windows 7 simulator `st` values and `it(device)` fields with `V(rows,2)` aligned columns. `getDeviceInfo` merges `DeviceWeb.getInfo()` (browser user-agent model, actual OS string and manufacturer) with `Device2Web.getInfo()` (blank host, boot time zero, browser locale/timezone, 16GiB simulated total/available memory, viewport height x width, no cameras) and browser battery fraction when supported, default 100%. The React CMD uses an injected read-only browser adapter, original user-agent parser and pure formatter. No native OS/device/driver inquiry, network access or fake computer name. Disconnected unit model fails visibly instead of inventing details. Added unit contracts for browser UA parsing, source metadata, memory, camera, locale and battery, plus desktop/mobile browser acceptance.

Pinned source module `15ca` `$["e"]="Windows"` in the base variant. Consequently original `Ze.ipconfig` outputs **Windows IP Configuration**, not the previous assumed `WindowsOS IP Configuration`. Corrected command, unit test and both browser assertions. This follow-up intentionally has no `[run-ci]` while CMD Ctrl+C acceptance #43711921734 is running. That workflow cannot verify this newer change. Other source CMD host integrations and full screenshot parity remain pending.


## Root-caused source PAUSE Ctrl+C modifier key regression — 15 November 2026

CI [#43689829426](https://github.com/codersachin99/windows-os/actions/runs/43689829426) finished **failure** with 392 Playwright passes and exactly two desktop/mobile failures in the same `PAUSE` Ctrl+C test. The new expectation saw **four** entries where **three** were expected. This uncovered the cause: `ControlOrMeta+c` emits a **modifier keydown first**, and our `keyResolver` treated that Control/Meta key as `PAUSE`'s any-key acknowledgement, prematurely completing the command before the `c` keydown. Subsequent Ctrl+C then appended a separate idle `^C` entry instead of interrupting the pending PAUSE output. An earlier failed test had observed the same underlying issue as a missing `^C` in the expected pending row.

The repair explicitly ignores standalone Control/Meta keydowns while `PAUSE`'s keyResolver is pending; the next Ctrl+C chord keydown reaches `interrupt()` and annotates the existing row, while ordinary `x`/Enter/other keys still acknowledge PAUSE. The real on-screen keyboard regression now presses Control alone first and checks the prompt remains pending, then Control+C and checks the same entry receives `^C` with no additional entry. These are simulator-only UI changes: no native process, host shell or disk modification. The fix is committed with a single **[run-ci]** opt-in acceptance; no acceptance may be claimed until browser suites finish.



## Original CMD Ze.HOSTNAME web-adapter behavior — 15 November 2026

Pinned source CMD `Ze.hostname` writes `(await host.getDeviceInfo()).host`. The pinned browser `src/modules/runtime/capacitor-plugin-device2.js` `Device2Web.getInfo()` returns `host:""`, overriding the generic device info. Therefore the original **web** simulator prints exactly one blank line for `HOSTNAME` with exit status 0; it does not display the user's actual computer hostname, IP address, or an invented machine name. Ported that exact web behavior and source HELP description to CMD, with pure and desktop/mobile browser assertions. This does not claim native Capacitor/Tauri device-info parity; those would require a distinct permissioned host adapter. The prior opt-in CI `#43689829426` covers commits through `a3ff1b3`, **not** this newer HOSTNAME slice, which deliberately omits `[run-ci]` while the existing batch runs.

## On-demand acceptance checkpoint — 15 November 2026

An opt-in `[run-ci]` acceptance batch is requested for source CMD `IPCONFIG` (commit `280d534`), source `WINVER` adapter (`098fe59`), repeated `PAUSE` Ctrl+C in-flight guard (`f7e80d2`), and simulator-only `LOGOFF`/`SHUTDOWN` view bridges (`9c29c02`). Previous CI `#43684413314` failed only the two existing desktop/mobile PAUSE/interrupt browser cases; TypeScript, unit, build and 384 other browser tests passed. The new test run must validate the changed pause behavior and four source commands across desktop/mobile before any claim of acceptance. PR #1 stays draft, main untouched; no visual pixel-parity acceptance or product release is implied.


## Original CMD ot.LOGOFF / ot.SHUTDOWN simulator view transitions — 15 November 2026

Pinned `legacy-win7/src/modules/apps/cmd.js` `ot.logoff` delegates to `host.changeView({view:"Logon"})`; `ot.shutdown` to `host.changeView({view:"Shutdown"})`. The existing React engine already exposes `LOG_OFF` and `SHUTDOWN` and corresponding real screens. CMD now delegates solely through its own optional, permissioned `changeView` callback, wired from `DesktopShell` to the matching engine dispatch. No native host logoff, OS shutdown, navigation, process execution or destructive storage change occurs. The existing shell reducer owns window cleanup and Guest session logoff; the original CMD view change triggers the existing logon/shutdown surfaces. Added source command HELP metadata, pure callback/permission tests and independent Playwright desktop/mobile lifecycle acceptance. The source `BSOD` view remains a different unported command and has **not** been fabricated. CI acceptance for this batch is pending.


## CMD repeated PAUSE Ctrl+C synchronous in-flight guard — 15 November 2026

GitHub Actions `#43684413314` finished **failure**, with 384 passing Playwright browser cases and the same two desktop/mobile `PAUSE` Ctrl+C tests failing (expected pending row + `^C`, actual only pending row). TypeScript, units, original migration audits, Contacts source checks, Vite build, Chromium install succeeded. The earlier runs `#43684125612` (382 browser passes) and `#43683710914` (378 browser passes) also had the same browser failures. The implementation was relying on render-time `busy` in the interrupt/copy-selection handler even though the pending row and `pendingEntry.current` are set synchronously. Use the in-flight ref as the authoritative running state in submit/interrupt/selection gate, retaining React busy for UI readOnly. Add a second-pause readonly and transcript-entry-count browser regression; keep the original Ctrl+C semantics. This is a targeted hypothesis-backed repair, **not yet CI-verified**, so do not claim the failures are fixed before an opt-in CI succeeds. No host execution or guest file operation rollback is introduced.


## Source CMD WINVER opens the original About Windows window — 15 November 2026

Original pinned cmd.js `ze.winver` declares `program: "about"` and delegates to the simulator host's `openWindow("about")`. The React CMD now delegates `WINVER` through the existing permissioned `launchProgram("about")` callback, which is already backed by DesktopShell AppRegistry and the faithful About Windows package. There is no native `winver.exe` execution. If no launcher is connected, it returns an explicit failure rather than pretending success. Added command HELP metadata, pure adapter coverage and desktop/mobile Playwright verification that the real About dialog opens and closes. This commit deliberately does not include `[run-ci]`; combine with other substantive source commands once previously running CMD browser acceptance concludes. The larger CMD and screenshot parity remain unfinished.


## Pinned CMD IPCONFIG virtual Ethernet adapter — 15 November 2026

Original `legacy-win7/src/modules/apps/cmd.js` Ze.ipconfig uses constant `qe` with IPv4 192.168.1.42, mask 255.255.255.0 and gateway 192.168.1.1. It prints a WindowsOS IP Configuration heading and the simulated Ethernet adapter (via source V column alignment); `/ALL` does not add fields in the pinned source. Ported this one self-contained command to the existing CMD model with a pure output helper, HELP metadata, unit assertions and desktop/mobile Playwright regression. No network adapter, DNS lookup, web ping or native host networking is queried. This is not yet HOSTNAME/PING/SYSTEMINFO or full CMD pixel parity. The change intentionally omits `[run-ci]` while the earlier cumulative TASKLIST/TASKKILL opt-in workflow is unresolved; CI must be requested only when a meaningful new batch needs validation.

## CMD SET PATH prefix/casing test correction — 2026-11-15

- [Combined CMD CI #43645135418](https://github.com/codersachin99/windows-os/actions/runs/43645135418) **FAILED exactly 1 unit assertion** out of 368 tests; TypeScript was green, later steps (audit/build/browser) were skipped. The new original environment model correctly deletes the original `Path` key on `PATH ;`, re-adds it with uppercase `PATH` on `PATH C:\Tools;C:\Bin` and returns both `PATH` and `PATHEXT` for source `SET path` prefix lookup. The initial test incorrectly expected one `Path=` item. There is no evidence of a production-code failure; fix the test expectation to match the pinned `bt` map and `SET` source command.
- This commit requests **one opt-in [run-ci]** rerun for the full cumulative original CMD COPY/MOVE, COLOR, SET/PATH, % expansion, TREE/VOL/DATE/TIME and browser source contracts. No green claim until full run finishes.
- Draft PR #1, main untouched, no release. CMD module still in progress; source screenshot parity unverified.

## CMD cross-surface source acceptance — 2026-11-15

- [Earlier CMD browser suite #43643944920](https://github.com/codersachin99/windows-os/actions/runs/43643944920) **SUCCESS** after the overlapping CMD/Explorer test sequence was corrected, including TS, units, source audits, Vite build, and desktop+mobile Playwright.
- New CMD source slices since that verified commit: [COPY/MOVE 2cd3716](https://github.com/codersachin99/windows-os/commit/2cd3716d59e265dd35f07b77347d300e6c3e0977), [COLOR/SET/PATH 30396d6](https://github.com/codersachin99/windows-os/commit/30396d61327e8451e267023fc028b7f815735e3e), [percent expansion de8222c](https://github.com/codersachin99/windows-os/commit/de8222c17c7d35d8feeeba7f86b4e23f4d8fb2e8), [TREE/VOL/DATE/TIME d3c88b1](https://github.com/codersachin99/windows-os/commit/d3c88b178755766e7a2fd20c94d9aee22457dadc).
- New `tests/e2e/cmd-source-files.spec.ts` drives **actual** Guest CMD UI: copies original installed Notepad shortcut into Desktop, moves it to Documents, verifies exact source JSON contents with TYPE, traverses with TREE, verifies virtual volume serial and moved-file directory listings; separate browser test checks date/time formatting, COLOR palette and dynamic %ERRORLEVEL%. Original icon bytes and full screenshot parity remain pending.
- This commit deliberately opts in **once** with `[run-ci]` to validate those substantive source slices together; do not call it green before Github Actions conclusion. Source tracker still 290 = 254 pending / 28 in progress / 8 implemented / 0 full pixel-verified.
- Draft PR #1, main untouched, no release.

## Source CMD TREE VOL DATE TIME — 2026-11-15 (CI deferred)

- Added original `TREE` directory traversal and `/F` read-only real Guest VFS listings, source Unicode tree branch layout, 12-level/5000-entry caps; `VOL` with source `ue` deterministic virtual volume serial; `DATE`/`TIME` source local formatting and `/T`, deterministic injected test clock. No host disk or time modification.
- Prior source CMD run #43643944920 remained in Chromium when this slice was implemented; no `[run-ci]` on this change, so new file transfer/environment/tree commands require next combined on-demand CI.
- CMD still in-progress. No main merge, no release, no visual pixel-parity claim.

## CMD original Ct percent variable expansion — 2026-11-15 (CI deferred)

- Source `Ct()` expands known `%NAME%` tokens nonrecursively before command parsing; `Tt.getEnv()` adds dynamic `%CD%`/`%ERRORLEVEL%`. Ported pure helper and session integration with case-insensitive source `bt` environment from prior slice. Unknown variables remain literal; raw prompt history preserved. Vitest and real Guest CMD Playwright tests added.
- Do not claim pipelines, redirects, batch handling or other commands are implemented. Previous [browser CI #43643944920](https://github.com/codersachin99/windows-os/actions/runs/43643944920) remained in progress at check. This commit does not auto-run CI.
- Draft PR #1, main untouched, no release; 290 tracked original modules = 254 pending / 28 in progress / 8 implemented / 0 full screenshot-verified.

## CMD original SET PATH COLOR source slice — 2026-11-15 (CI deferred)

- Ported pinned original cmd.js `bt` case-insensitive environment map, `Dt` known Guest variables, `SET`/prefix filtering/removal, `PATH` query/update/clear, `COLOR` original sixteen-hex Win7 palette. Colors are wired to actual CMD component CSS. Host-specific source env (hostname etc.) are intentionally not invented.
- New Vitest and Playwright source contracts cover case-insensitive variables and COLOR styling/reset. Commit intentionally has **no `[run-ci]`**; previous CMD acceptance run #43643944920 was still in browser checks at last inspection. Request one on-demand CI after meaningful batch.
- CMD remains in-progress; original batch processing, redirection, other commands, icon asset and screenshot pixel parity remain incomplete. PR #1 draft, main untouched, no release.

## Source CMD COPY/MOVE exact-file slice — 2026-11-15 (CI not triggered)

- Traced original `cmd.js Pe` and added single-file Guest VFS `COPY`/`MOVE` (target directory or filename; binary fidelity; original nine-position success messages) plus pure tests for source retention/move, unsupported wildcard/no-overwrite/missing mount. No native host filesystem calls; wildcard/multi-file source behavior pending.
- Previous [CMD on-demand CI #43643944920](https://github.com/codersachin99/windows-os/actions/runs/43643944920) was still in Chromium when this additional command slice was built. This commit does **not** request CI; next batch can opt in via `[run-ci]`.
- Draft PR #1, main untouched, no release; 290=254 pending / 28 in-progress / 8 implemented / 0 full source-visual verified.

## Browser CMD overlay regression diagnosis — 2026-11-15

- Source CMD [CI #43642780902](https://github.com/codersachin99/windows-os/actions/runs/43642780902) **FAILED 2 Playwright cases** (desktop/mobile) only in the Explorer open-shortcuts test: `locator.dblclick` timed out after CMD was successfully launched. The running CMD window overlaps Explorer, so the next `WordPad.lnk` row isn't clickable until the CMD window is closed.
- Updated `tests/e2e/source-programs.spec.ts` to verify CMD input, execute original `EXIT`, assert the CMD window disappears, then double-click the still-unported WordPad shortcut and check its expected rejection. This checks actual source window lifecycle rather than forcing clicks through an overlapping window.
- Prior [CI #43642780902](https://github.com/codersachin99/windows-os/actions/runs/43642780902) passed TS, unit, source audits and production build. Recent [source command commit 7b0f6c8](https://github.com/codersachin99/windows-os/commit/7b0f6c87123130b2a628c00f0622911cd714ca4f) adds Guest VFS REN/RD/exact DEL with non-destructive confirmation-required paths. This commit opts in **once** with `[run-ci]` to verify both the browser focus fix and these source commands.
- Draft PR #1, main untouched, no release. CMD in progress, full screenshot parity not verified.

## Source CMD safe REN RD DEL command slice — 2026-11-15 (CI deferred)

- Added original cmd.js Te `REN`/`RENAME`, `RD`/`RMDIR` and exact-file `DEL`/`ERASE` to mounted Guest VFS, with strict same-directory rename and source error strings. Source confirmation-required recursive `RD /S` and wildcard/directory `DEL` remain non-destructive unsupported paths until the original `waitForKey` interaction is reproduced. Vitest and Playwright acceptance added.
- [Earlier CMD CI #43642780902](https://github.com/codersachin99/windows-os/actions/runs/43642780902) was still running browser acceptance when this new source slice started; no green claims. This commit intentionally does not trigger CI, honoring on-demand-only condition.
- `migration/CMD-SOURCE.md` traces source command behavior. Tracker unchanged 290=254 pending / 28 in progress / 8 implemented / 0 full source-visual verified. PR #1 draft, main untouched, no release.

## CMD source regression fix and Te commands — 2026-11-15 (on-demand CI requested)

- [Original CMD CI #43641366954](https://github.com/codersachin99/windows-os/actions/runs/43641366954) **FAILED 2 browser cases** desktop/mobile solely from stale existing browser assertion `Command Prompt.lnk` must be unimplemented, while the app was now correctly running. Source TypeScript, unit tests, migration audit, Contacts, Vite build all succeeded.
- Updated Explorer shortcut regression to assert actual CMD window launches, then use genuinely unported `WordPad.lnk` for negative unported-program validation. Kept Notepad .lnk launch contract.
- Ported original CMD Te `TYPE`, `MD`/`MKDIR`, `PUSHD`, `POPD` backed by mounted Guest C: filesystem and source error strings. New units and live browser tests verify real virtual folder creation, directory listing and navigation stack. `TYPE` is read-only text and will not coerce corrupt binary to text. No native shell commands.
- **Single opt-in [run-ci]** requested on this commit for repair + next source command slice. Don't mark accepted until browser suite finishes. Inventory unchanged: 290 total / 254 pending / 28 in progress / 8 implemented / 0 full source screenshot parity. PR #1 draft, main untouched, no release.

## CMD first runnable source slice opt-in CI — 2026-11-15 (running once)

- [Previous shared icon CI #43640201034](https://github.com/codersachin99/windows-os/actions/runs/43640201034) **SUCCESS**: TypeScript, units, source inventory/Contacts audits, Vite build, complete Playwright browser suite. This covers Explorer/Desktop/Start Menu source shortcut icon JSON and shared binary reader at commit 715be7375.
- New [CMD source app commit 3f8b92d](https://github.com/codersachin99/windows-os/commit/3f8b92d46a199996c2ea263a7bd68a1012cebc66) has actual interactive prompt, C: Guest live VFS CD/DIR, ECHO/CLS/TITLE/VER/HELP/EXIT; modular Vite/TS aliases [77471e2](https://github.com/codersachin99/windows-os/commit/77471e2347092fcf6abc764e02002ef79a27f85d); pinned source DOS syntax CD../ECHO./DIR/B [4a73bb0](https://github.com/codersachin99/windows-os/commit/4a73bb0bfba56bd691809cca4a8a9758d1889b85).
- This docs/handoff commit opts in once with **[run-ci]** to validate the new app/test suite. Do not claim the CMD slice passes until workflow completion; missing CMD commands, original icon asset and side-by-side pixel parity remain explicit.
- Source migration tracker: 290 original source modules, 254 pending, 28 in progress, 8 implemented, 0 full accepted source pixel parity. Draft PR #1, main untouched, no release.

## Original CMD token unglue — 2026-11-15 (not separately CI triggered)

- Added the exact supported subset of source `Tt.unglue` / `kt` for `CD..`, `ECHO.`, `DIR/B`. Parsing transforms only known source commands, preserving full text/prompt display; unknown EXE-like commands remain unknown. Pure tests exercise parser + live Guest shell behavior.
- CMD module remains in-progress, not complete. This tiny follow-up has no `[run-ci]`; keep browser acceptance as a single on-demand batch. Last combined shell art CI #43640201034 was still in Chromium at check.

## CMD package build path and scope clarification — 2026-11-15

- Follow-up to CMD first source slice: added `@windows-os/apps/cmd` to **both** TypeScript and Vite aliases (required by `DesktopShell`). Explicitly documented that no-space `ECHO.` source parser is not yet implemented (spaced `ECHO .` works), avoiding an overstated parity claim.
- Still no CI opt-in on CMD; the last shell-art batch [#43640201034](https://github.com/codersachin99/windows-os/actions/runs/43640201034) was executing browser acceptance at prior check. Next verification should include new Command Prompt command model and Start Menu browser test once scheduled as on-demand.

## CMD first source command-engine/UI slice — 2026-11-15 (CI not yet requested)

- Implemented actual original Command Prompt startup, Windows-mounted Guest CWD, source black monospace shell/banner/history/input, source `CLS`, `ECHO`, `TITLE`, `CD`, `DIR`/`B`, `VER`, `HELP`, `EXIT` against live Guest VFS. Registered `cmd` program and enabled its installed Accessories .lnk with real application launch.
- Original CMD source `cmd.js` (blob d3e991b9604d8b0986676381de532f09b83ab958) and CSS (53f680686fbd147330ef15e8eb309b5508b3253b) are documented in `migration/CMD-SOURCE.md`. Detailed pure unit and browser acceptance added. Does not run host commands. Unsupported original commands remain explicitly pending; exact CMD art bytes and screenshots missing.
- Tracker modified **cmd** from pending to in-progress; count 290 = 254 pending / 28 in-progress / 8 implemented / 0 fully source-parity verified.
- Earlier combined shell icon [CI #43640201034](https://github.com/codersachin99/windows-os/actions/runs/43640201034) was still **in progress** when CMD branch work started; no inference of green. This CMD commit is without `[run-ci]`, respecting requested on-demand batch behavior. Review CI before next opt-in test.
- Keep draft PR #1, main untouched and no release.

## Shared original shortcut icon art in Start Menu — 2026-11-15 (CI requested)

- All Programs now resolves installed .lnk JSON `icon` through the same byte-imported original Win7 artwork as Explorer and Desktop; it no longer assumes the executable target's registry icon is identical. A shortcut with `{"exe":"notepad","icon":"calc"}` shows Calculator artwork but still launches Notepad. Unported executables remain disabled.
- The new source shortcut reader `readSourceShortcutText` handles both text-backed installer shortcuts and binary-backed browser imports. Metadata attributes expose source icon key and original/custom/fallback art explicitly. Added a desktop/mobile browser case uploading a real .lnk into Accessories and validating All Programs icon and launch behavior.
- [Prior browser run #43638958982](https://github.com/codersachin99/windows-os/actions/runs/43638958982) had 2 failing binary .lnk icon tests; this batch includes their repair, the Desktop icon integration b258d11 and this Start Menu source icon change.
- **One opt-in full CI [run-ci] requested** on this commit; do not claim the new batch green until run conclusion is checked. PR #1 draft, main untouched, no release. Original 290 modules = 255 pending / 27 in progress / 8 implemented / 0 fully screenshot parity verified.

## Fixed binary-uploaded .lnk icon decoding — 2026-11-15 (CI batched)

- [Explorer shortcut icon CI #43638958982](https://github.com/codersachin99/windows-os/actions/runs/43638958982) **failed desktop+mobile browser cases**: original .lnk JSON `icon="calc"` rendered as `file` for browser-imported binary VFS uploads, because Explorer called text-only `fileStore.read`. All TypeScript, units, source audits, and production build passed.
- Added pure shared `readSourceShortcutText`: read original text-backed files normally, or decode UTF-8 bytes from uploaded binary-backed files with fatal TextDecoder. Both Explorer and Desktop use the same helper and preserve strict `parseSourceShortcut` executable validation. New units cover both formats and invalid binary rejection.
- This commit intentionally avoids `[run-ci]`; combined on-demand CI will run after remaining All Programs icon update. Current feature branch is not yet browser green. Keep draft PR #1, main untouched and no release.

## Shared source icon artwork: desktop file-backed rows — 15 November 2026

- Original Win7 icon key resolution 4cca + 0f35 has one shared safe, byte-imported art lookup in `@windows-os/assets`: `legacySourceIconArtwork`. Explorer now delegates to it instead of maintaining a second independent map.
- Desktop file icons use original source extension types, actual Guest .lnk JSON icon overrides and original imported images. Existing `DesktopIcons` previously overrode the JSON icon with the app target icon; this migration removes that override. Shortcut exe permission and launch remain separately checked through `parseSourceShortcut`.
- Added per-file icon type, icon override and original/custom/fallback test attributes, pure VFS tests and real desktop/browser case verifying PNG/photo and shortcut with calc icon launching Notepad. Images not present in the source byte-import inventory explicitly fall back to byte-exact generic file icon; no invented source art.
- This feature commit is intentionally **without [run-ci]** while the previous Explorer shortcut run #43638958982 remains in progress. After other related source icon changes, trigger only one opt-in acceptance batch. Last fully verified source icon classifier [CI #43626932843](https://github.com/codersachin99/windows-os/actions/runs/43626932843) succeeded.
- PR #1 draft, main untouched, no release. Original tracker 290 modules: 255 pending, 27 in progress, 8 implemented, 0 full visual parity.

## Pinned Computer shortcut icon JSON — 15 November 2026 (CI pending)

- Original computer.js.describe detects 0e9a.m shortcut extension suffix and asynchronously parses the actual .lnk file JSON; its icon property controls artwork independent of exe, and the source list item has type shortcut. Malformed JSON falls back to icon=file. The original iconType from 4cca is retained separately.
- Implemented sourceIsShortcutEntry and sourceShortcutIconValue in reusable filesystem helpers, then connected Win7 Explorer to real Guest VFS shortcut reads. A stable URI/mtime/size signature plus effect cleanup prevents stale async icon reads. Source data-test-listview-item="shortcut" and icon override attributes are preserved; existing strict parseSourceShortcut launcher remains unchanged.
- Added source verified artwork/icon resolution, HTTP(S) and image data URL overrides (script schemes blocked), unit tests and live Guest shortcut upload tests across Tiles/List/Content. Missing exact file-type images still explicitly use the original generic file artwork.
- Last full green [file icons #43626932843](https://github.com/codersachin99/windows-os/actions/runs/43626932843). New shortcut behavior not yet verified. Draft PR #1, main untouched, no release. Original inventory 290 total, 255 pending / 27 in progress / 8 implemented / 0 full pixel parity verified.

## Original icon matcher excess-property TypeScript repair — 2026-11-14 (CI requested)

- [Follow-up icon CI #43626775200](https://github.com/codersachin99/windows-os/actions/runs/43626775200) **FAILED TypeScript** (unit/browser not run): four existing callers pass fresh complete `FileEntry` literals containing `uri`, which TypeScript rejects when the matcher signature names only `Pick<FileEntry,"name"|"type">` due to excess-property checks.
- Changed `matchesSourceKind` to the constrained generic `<T extends Pick<FileEntry,"name"|"type">>`. It still reads exactly source `name`/`type` and accepts minimal classifiers **and** complete file literal objects without casts, duplicate overloads or runtime changes. Source icon input/precedence unchanged.
- This commit triggers the next **single opt-in [run-ci]** to verify both existing search contracts and the new icon cases. Neither icon CI #43626662452 nor #43626775200 is a pass. Last full green is [Details #43624645917](https://github.com/codersachin99/windows-os/actions/runs/43624645917).
- PR #1 stays draft, main untouched, no release. Original inventory: 290 = 255 pending / 27 in progress / 8 implemented / 0 full pixel-parity.

## Source icon CI type-contract repair — 2026-11-14 (retest requested)

- Original icon selection [CI #43626662452](https://github.com/codersachin99/windows-os/actions/runs/43626662452) **failed in TypeScript**, before units/browser: six TS2345 mismatches because `sourceFileIconType` passes exactly `{name,type}` to `matchesSourceKind`, whose declared parameter unnecessarily required the whole `FileEntry`. The original 0e9a name/type predicate and the existing implementation access only these two properties.
- Corrected the reusable matcher parameter to `Pick<FileEntry,"name"|"type">`, preserving every matching branch and compatibility with full `FileEntry` search callers. No unsafe casts and no invented metadata. This commit opts in once to full `[run-ci]` for the source icon slice.
- Source picture artwork was already byte-imported; missing media/text/WPL/ZIP source artwork still falls back to original generic `file` image, with explicit source type and fallback metadata. `.lnk` content/icon overrides await a separately traced slice.
- Last green overall checkpoint remains [Details #43624645917](https://github.com/codersachin99/windows-os/actions/runs/43624645917). Keep draft PR, unchanged main, no releases; 290 tracked original modules (255 pending / 27 in-progress / 8 implemented / 0 fully source parity).

## Source 4cca Explorer icon selection — 2026-11-14 (CI pending)

- Pinned source `computer.js.describe()` -> webpack 4cca.getIconType / 0e9a / 8c25. Added pure reusable `sourceFileIconType` to shared filesystem with exact extension precedence, including installed 8c25 executable names from already-pinned c170 manifest. Added Win7-only Explorer adapter with exact photo/folder/file and available installed-program image URLs, preserving source icon type and visibly marking missing original artwork as generic fallback.
- Added filesystem / Explorer Vitest and live Guest PNG/TXT desktop/mobile Playwright assertions, including stable icon selection across Tiles/List/Content. Original missing image bytes (media, text, richtext, zip, wpl, executable) still need byte-exact import; source .lnk JSON icon override is not yet in this slice. No invented artwork or external runtime dependency.
- Previous [Details alignment CI #43624645917](https://github.com/codersachin99/windows-os/actions/runs/43624645917) **SUCCESS** (fixed 6px inherited gap). This newest icon slice is **not yet CI verified**; use one opt-in `[run-ci]` when needed. Tracker unchanged 290 original = 255 pending / 27 in progress / 8 implemented / 0 fully original parity verified.
- Draft PR #1 stays unmerged; main untouched; no release.

## Details source alignment regression repair — 2026-11-14 (retest pending)

- [Run #43619748436](https://github.com/codersachin99/windows-os/actions/runs/43619748436) **FAILED** after 345 of 346 browser tests passed. One desktop Details geometry check measured first-extra/header position offset 6px vs <=2px; TypeScript, units, source audit, Contacts contracts and Vite build passed.
- Original pinned `listview-details.css` provides no row gap. Generic Explorer button styling inherited `gap:5px` plus 1px row border, causing precisely the 6px offset. Scoped Win7 Details `.explorer-item {gap:0}` restores source geometry without altering non-Win7 theme spacing.
- Browser acceptance asserts exact computed `column-gap:0px` in addition to unchanged strict <=2px alignment tolerance. New opt-in **`[run-ci]`** verifies repair; do not claim green until Actions finishes.
- Original parity inventory still 290 modules = 255 pending / 27 in progress / 8 implemented / zero fully source-pixel-verified. Keep draft PR #1, `main` untouched and no release.

## Pinned original Computer Details column layout — 2026-11-14 (CI pending)

- Pinned `computer.js` source constants `se=16, ae=220, ne=204, re=24` and `src/styles/shell/listview-details.css` blob `2aedda59802d5a36ea0e106ddcdf4a16be4aca52`. Implemented original Win7 Details fixed 220px source header cells and VFS item extras within shared `0616` info wrapper, 16px icon, 204px regular or 180px touch-checkbox label width, and source 2px row/4px text padding. Other themes unaffected; narrow mobile uses a documented two-visible-column adaptation.
- Added Vitest measurements and desktop/mobile browser computed-geometry, horizontal alignment, selection and source extra contracts. Current commit opts into full `[run-ci]` once. **Verification pending; do not claim success before checking Actions.**
- Prior [Actions #43617699223](https://github.com/codersachin99/windows-os/actions/runs/43617699223) **SUCCESS** for the last search, List/Content and Tiles batch; earlier #43611997970 also succeeded.
- Tracker unchanged: original 290 modules = 255 pending, 27 in progress, 8 implemented, 0 fully original pixel-parity verified. Draft PR #1, `main` untouched, no release.

## Combined source fidelity acceptance — 2026-11-14 (CI requested)

- Feature source commits `5ee37c0`, `83efb94` and `881a205`: mounted-drive C: Content search locations; pinned original Win7 List/Content styling; and original Tiles `0616` item-info + 48px / 256px geometry. All have unit and/or desktop/mobile browser assertions but prior pushes intentionally skipped CI.
- The immediately preceding source formatter `6ce1129` passed full [Actions #43611997970](https://github.com/codersachin99/windows-os/actions/runs/43611997970). This *documentation-only commit* includes `[run-ci]` to opt in **once** to the combined TypeScript, unit, source audit, build and Chromium E2E suite on the feature branch. Do not claim success until the run completes.
- Original 290-module tracking remains: 255 pending, 27 in progress, 8 implemented and none fully original pixel-parity verified. Maintain draft PR #1; do not merge `main` or publish a release.

## Pinned source 7662 Win7 Tiles markup and CSS — 2026-11-14 (CI pending)

- Source `listview-tiles.css` blob `792221cf9f42cfe1579f5860fec0332e727f5381` and modules 7662/0616: restored Win7 Tiles' 48px icon, 256px min row, flex icon+info hierarchy and 2px stacked info gap. Extra fields now live in `.listview__item-info`, preserving existing VFS interactions and other themes.
- New desktop/mobile Playwright computed-style acceptance. This Tiles change and prior search-location + List/Content CSS changes still need a combined opt-in `[run-ci]` run; source formatter [#43611997970](https://github.com/codersachin99/windows-os/actions/runs/43611997970) succeeded.
- Status 290 original: 255 pending, 27 in progress, 8 implemented, 0 fully source/pixel parity verified. Draft PR #1, untouched main, no release.

## Win7 source List/Content CSS geometry — 2026-11-14 (CI pending)

- Imported the original **rules** from pinned source `src/styles/shell/listview-list.css` (blob `4a7dc019cc68fbca6b7429d2dafca100dfffd1c9`) and `listview-content.css` (blob `08151a47ee1c05bff6db72c0c38016b91eb88deb`) as Win7-only selectors in `ExplorerApp.css`. List items now have 300px minimum, 25% preferred width and 16px icons; Content uses the original 6px metadata gap, two-column auto flow and 48px icons. Narrow browsers have an explicit one-column responsive fallback.
- One new desktop/mobile browser scenario checks computed List/Content geometry. Both original modules remain **in progress**: user gestures, CSS and the source snapshots are not fully proved equivalent. Staged without CI while #43611997970 is executing. No claim of test pass for this new feature.
- Keep existing architecture, VFS and other themes intact. 290 original modules = 255 pending, 27 in progress, 8 implemented, 0 fully parity verified. Draft PR #1 stays unmerged; main unchanged; no release.

## Source mounted C: path in Content search results — 2026-11-14 (CI pending)

- Added pure `sourceComputerSearchLocation` to shared filesystem search locations: original pinned `computer.js.getSearchExtras` + `4cca.getPathFromDisk` shows the parent as a Windows drive path when backed by runtime mounted disks, else the source raw parent URI. Used existing validated `LegacyVolumeSession.toWindowsPath` to avoid matching unrelated `drive01` and other unmounted paths.
- Wired Explorer Content search to actual volume; added filesystem and Explorer unit checks plus one desktop/mobile real C: upload/search browser case. Does not change ordinary Content or other view modes. **CI not yet run for this new slice**; preceding `[run-ci]` for formatter commit 6ce1129 is independent and must finish first.
- Full pixel-level original parity and alternate-locale search labels remain pending. Inventory unchanged (290 = 255 Pending / 27 In Progress / 8 Implemented / 0 full source parity). Keep PR #1 draft, `main` untouched, no release.

## Exact shared 4cca.getSizeFrom source formatter — 2026-11-14 (CI pending)

- Pinned original module `4cca` (Git blob `a3edd490a0f4e23052f2a3a74a694c8991911c56`) exports byte-size formatting as `0 bytes`, `N bytes`, and binary KB/MB/GB/TB with one decimal. Ported **without altering source rounding or units** into reusable `@windows-os/filesystem` helper `sourceSizeFromBytes`; Explorer and Bin metadata use it in Details, Tiles, Content and search extras.
- Three new Vitest cases test source thresholds and formatting. Updated previous Explorer metadata expectations, and desktop/mobile browser acceptance uploads real 9-byte and 2048-byte VFS files to verify `9 bytes`/`2.0 KB` UI. Opt-in `[run-ci]` requested once; results must be checked before claiming green.
- Previous [full CI #43608849980](https://github.com/codersachin99/windows-os/actions/runs/43608849980) **SUCCESS** at 9e764a7 for TypeScript, unit/browser checks, original source-art audit and production build. It verified List/Content and source contentItems, before this formatter change.
- Inventory remains 290 source modules: 255 pending, 27 in progress, 8 implemented and 0 fully parity verified. Friendly search disk locations, localized labels, source CSS themes and original screenshots remain open. Draft PR #1, unchanged main and no release.

## Computer contentItems shared source-metadata correction — 2026-11-14 (CI pending)

- Ported source Computer `contentItems` variant selection and last-extension `getFileType` into `packages/apps/explorer/src/sourceComputerExtras.ts`. Corrected Content (folder date-only, files Date → Type → Size), Tiles and Details ordering and original extension-derived labels; Content search gets date/location/size source-specific extras.
- Four pure contract cases and a desktop/mobile real TXT upload case added; earlier Content folder assertion updated. Existing List/Content source module change at 02aca4c was not CI-verified. This **one combined** `[run-ci]` commit tests both; do not claim success before Actions result.
- 290 original modules: 255 pending / 27 in-progress / 8 implemented / 0 fully parity verified. Original source byte-size formatter and exact screenshots remain gaps. PR #1 stays draft, main unchanged, no release.

## Source shell 00d7 List and 27b9 Content views — 2026-11-14 (CI pending)

- Ported src/modules/shell/listview-list.js (SHA 7218186c4db75d10802a6b5e61cb6210f80250d3) and listview-content.js (SHA 6a0b4416a2b8cca5dce9a31046920828ea955c34) into reusable SourceListView variants plus original CSS. Both source modules marked In Progress.
- Computer and Recycle Bin now delegate List/Content source view classes and real Content metadata to shared UI components, retaining all VFS interactions. Source list displays no extras; Content displays type/date/size via c162.
- Added one Playwright scenario per desktop/mobile for View transitions, source metadata, selected state and folder navigation, plus shared UI unit assertions. The preceding source rename/checkbox [CI #43606684920](https://github.com/codersachin99/windows-os/actions/runs/43606684920) remains under verification; this new List/Content slice has not yet run CI.
- Source inventory now 290 = 255 Pending / 27 In Progress / 8 Implemented / 0 completely source parity verified. Draft PR #1 unmerged, main unchanged and no release.

## Source 0e9a filename extension and checkbox TypeScript repair — 2026-11-14 (CI pending)

- [Combined run #43606204510](https://github.com/codersachin99/windows-os/actions/runs/43606204510) failed **before unit/browser tests** at TypeScript: packages/ui/src/sourceItemCheckbox.tsx supplied String(checked) to React's typed aria-checked. Replaced with boolean checked, retaining rendered true/false source semantics. This run must not be counted as a pass.
- Pinned webpack 0e9a in original src/modules/chunks/shared~plugin-embed~sandbox~system-cache~vue-app~vue-store.js, blob a3edd490a0f4e23052f2a3a74a694c8991911c56, exports O to split a filename into greedy stem + last extension. Original computer.js (blob 47aa521237c10f5e6763df37a1d8dcd73330f84f) reattaches the extension on FileRename. Added sourceRenameParts/sourceRenameFileName so F2 on Before.txt edits Before and saving as After writes After.txt, retaining Guest VFS contents.
- Original filename splitting for multi-dot names, dotfiles and empty ext is unit tested; E2E uploads a real Before.txt, renames it via source inline field and reopens it in Notepad to verify contents. The original second URI decode is intentionally omitted because Guest VFS entries are already decoded and a second decode could fail on user-provided filename percent characters.
- Next single [run-ci] commit combines checkbox TypeScript fix, updated old Rename browser expectations, source touch checkboxes and extension-preserving rename. Modules remain in progress; no main merge or release.

## Rename regression expectations and checkbox combined verification — 2026-11-14

- Source inline-rename/clickout [CI #43604884502](https://github.com/codersachin99/windows-os/actions/runs/43604884502) **FAILURE**: **315/315 unit in 65 files**, original **55 source-art audits**, TypeScript and production build passed. Chromium **326/330** passed; 4 desktop/mobile cases in explorer-organize.spec.ts and source-guest.spec.ts waited for the old modal Rename dialog. The actual Win7 0616 source now uses the inline text field, so the test contract—not the source behavior—needed updating. Both specs now assert the inline source field, type a real Guest folder rename and press Enter. Do not treat run #43604884502 as a pass.
- The source fa65 touch-only multi-select checkboxes were committed on 89d659c without [run-ci] specifically to avoid overlapping CI. This next combined [run-ci] commit verifies both updated rename integration and touch checkbox source contract on desktop/mobile, including the prior source-message modal focus regression.
- Inventory remains 257 pending, 25 in-progress, 8 implemented, 0 complete source parity / 290. Keep PR #1 draft, main unchanged, no release.

## Source fa65 touchscreen selection checkbox — 2026-11-14 (CI pending)

- Found source fa65 in pinned shared~bsod~games~main.js blob `ecca9d786763c6be07df543e94701fe057e545ad`; source Computer blob `47aa521237c10f5e6763df37a1d8dcd73330f84f` shows checkboxes only on touch when selection nonempty.
- Shared `SourceItemCheckbox` renders exact source aria/data-test markers and stops bubbling to outer list item; Explorer uses the existing Guest session `select(uri,true)` for real multi-selection, no invented files. Responsive Tiles/Details grid rules account for the additional leading checkbox. Unit and desktop/mobile e2e tests staged.
- This increment is not yet CI-tested; previous inline rename/clickout run [#43604884502](https://github.com/codersachin99/windows-os/actions/runs/43604884502) is still active. Source inventory unchanged: 290 total, 257 pending / 25 in-progress / 8 implemented / 0 completely parity-verified. Draft PR #1 unmerged; main unchanged, no release.

## Source 0616 inline rename / clickout and modal safety repair — 2026-11-14 (combined CI pending)

- Previous [CI #43603371340](https://github.com/codersachin99/windows-os/actions/runs/43603371340) **FAILURE** limited to two source-message desktop/mobile E2E cases: 313/313 unit tests passed, 324/326 browser cases passed. On quick re-click after No, the item double-click timer erroneously carried across the Delete modal and opened the folder, disabling Delete.
- Repaired SourceListViewItem by resetting pending double-tap state when focus leaves the item. Retained 400ms consecutive-click semantics. Added optional source 252b clickout/registered popup exclusions for Explorer's item context menus; background menu behavior unchanged.
- Ported original 0616 inline rename (maxLength 30, input is-input, autofocus+select, Enter/blur commit) into SourceListItemRename. Win7 Explorer uses it for F2, toolbar and context Rename, committing through the existing Guest VFS. Escape safely cancels; other themes retain their previous modal fallback.
- New unit tests and desktop/mobile Playwright cases cover F2, rename/commit/cancel, real filesystem update, clickout menu exclusions. Source src/modules/plugins/plugin-clickout.js and runtime/vue-click-helper.js moved Pending to In Progress because their core relevant item behavior is now represented but general directives are not completely ported.
- Source counts **290 total: 257 pending, 25 in-progress, 8 implemented, 0 fully source-parity verified**. Exact source and remaining feature gaps documented in migration/LISTITEM-INTERACTIONS-SOURCE.md. Run CI only with explicit [run-ci]. Draft PR #1 unmerged, main unchanged, no release.

## Original listview-item 0616 / 400ms click-helper — 2026-11-14 (CI pending)

- Source source chunk 49e2ebd6.js blob ed3b984138eed7c830b5fbe4a8be08d58328cb35 contains webpack 0616. Exact vue-click-helper.js blob 71db7989b3f01b4a6841c5346d6d88ede6cc5169 defines v-tap:400 second click detection.
- Extracted shared SourceListViewItem with root source button class and source data attributes, is-active, and explicit double-click 400ms adapter. This keeps Explorer click/selection, drag/drop, context menu and source-highlight search while working with real Guest VFS.
- Browser tests listview-source-item.spec.ts and listview-source-tap.spec.ts cover source classes, highlighted names, selected rows, native dblclick and two rapid synthetic clicks. Pure source unit tests cover button and exact 400ms threshold; intended desktop and mobile. Full CI for this new increment pending.
- Earlier source a321 width/column-header [CI #43602218473](https://github.com/codersachin99/windows-os/actions/runs/43602218473) **SUCCESS** after .tsx suffix repair: **310 unit** in 63 files, **322 Chromium browser**, **55 byte-exact source-art audits**, TS/build. The initial failed [#43602081330](https://github.com/codersachin99/windows-os/actions/runs/43602081330) was TypeScript JSX-in-.ts only.
- Tracker: 290 total, 259 pending / 23 in-progress / 8 implemented / 0 complete source parity. Original clickout, checkbox, inline rename, source screenshot comparison are still incomplete. Draft PR #1 unmerged, main unchanged, no release.

## a321 source width CI parser fix — 2026-11-14

- Initial opt-in run [#43602081330](https://github.com/codersachin99/windows-os/actions/runs/43602081330) failed only during TypeScript parse: JSX in packages/ui/src/sourceListView.test.ts requires the .tsx extension. The new source code and browser cases were not executed in this run. Renamed the unit file to .test.tsx; new full CI required. No feature pass is claimed from the failed run.

## Original a321 listview width and header — 2026-11-14 (CI pending)

- Discovered exact original a321 source in shared webpack chunk with blob ed3b984138eed7c830b5fbe4a8be08d58328cb35. normalizeWidth(width,count,details) is width ? (typeof width === "number" ? width+"px" : width.toString()) : 100/(count+(details?1:0))+"%"; isFixedWidth(width) uses typeof "number" even if width is 0. Details reserves one additional label column.
- Ported pure sourceNormalizeListWidth and sourceListColumnIsFixedWidth with unit tests for zero width, negative/positive widths, string CSS and Details offset. Added original listview__header button implementation SourceListViewHeader in packages/ui; Explorer Details header delegates to it, retaining existing responsive CSS grid, selection and VFS.
- Existing combined CI #43591033519 **SUCCESS**: 308 Vitest (63 files), 322 Chromium browser, 55 exact source images and 40 target-only screenshots. No original read token; parityStatus:not-assessed. New a321 work has not yet run CI and remains unverified until next opt-in run.
- Keep the original chunk's full 49e2ebd6 module tracker entry Pending (many unrelated shared modules), but source listview-details.js and listview-tiles.js remain In Progress with a321 trace. No merge/release; draft PR #1 and main unchanged.

## Expanded target-only visual capture SUCCESS — 2026-11-14

- [Run #43591033519 visual-capture job](https://github.com/codersachin99/windows-os/actions/runs/43591033519) **SUCCESS** at e1697bb: **40/40 target screenshots** (20 desktop + 20 mobile), including source shared Details metadata, Tiles metadata and Message Confirm. 0 screenshot errors. Artifact [14112935185](https://github.com/codersachin99/windows-os/actions/runs/43591033519/artifacts/14112935185).
- Manifest **sourceConfigured:false, sourceCaptured:0, targetOnlyCaptured:30, parityStatus:not-assessed**. No legacy source token. Actual paired original screenshot comparison remains blocked and no source module is fully parity verified. The other full CI job within this same run is separate and was still in progress at this checkpoint.

## Source messages.js green functional CI — 2026-11-14

- [Run #43590165232](https://github.com/codersachin99/windows-os/actions/runs/43590165232) **SUCCESS** at commit 4d87b13: 308 unit tests (63 files), 322 desktop/mobile browser cases, 53 original-image audits, TypeScript and Vite build. Original confirm identifiers/default No/Escape and real VFS Delete/Recycle Bin behavior passed. Source messages.js remains In Progress because global Vuex messages registry, Asterisk audio, source window chrome and paired screenshot parity are not migrated.
- Original warning/error Win7 WebP files imported byte-exact and three additional target-only visual scenes staged/pushed as commit e1697bb with both required opt-in markers; combined run [#43591033519](https://github.com/codersachin99/windows-os/actions/runs/43591033519) verifying source-asset bytes and screenshot rendering. Do not claim success or pixel parity before that run finishes.

## Exact source Win7 dialog art and expanded capture — 2026-11-14 (combined verification pending)

- Retrieved original warning.cce1fd36.webp (SHA 6bd336aa3a9ba01a4ab2879180a0ba8f5b0301aa) and error.026cae2a.webp (SHA 2a64837b8281a49be0cf491f18727f8978fd0323) through Base64, recreating target Git blobs with identical original hashes. The shared source messages dialog now uses them; source E2E and source-win7-art browser tests also assert the originals. No arbitrary CSS-generated stand-in glyphs for source Win7 warning/error.
- New visual target-only scenes prepare Details metadata, Tiles metadata, and source Delete confirmation; expected new target screenshot total 40 (20 scenes × desktop/mobile), **not yet captured**. Original paired Vue screenshot token still unavailable. Combined one commit with [run-ci] and [capture-visual] will intentionally verify both code and the visual-capture script only when needed.

## Source messages.js reusable UI — 2026-11-14 (CI pending)

- Pinned source messages.js (Git blob e5150261d7868071ed3c02aa9ab31ea82fe50b9e) provides error, confirm, progress via webpack 7680. Built shared SourceMessageDialog with original Yes/No data-test-confirm-answer attributes, default No focus, Escape cancellation, Progress disabled Stop and safe escaped text. Explorer/Recycle Bin Delete confirmation now reuses the component, retaining real VFS effects, existing alertdialog accessible label and shared CSS.
- Added server-side markup unit tests and desktop/mobile Playwright source-message.spec.ts to prove real new-folder, No, Escape, Yes and Recycle Bin entry. Original Vue messages Vuex registry, Asterisk sound, parseInline rich HTML and screenshot parity not implemented; this remains in-progress pending CI. The direct ui/message alias is prioritized before ui root to prevent circular shell imports.
- Correct inventory after this slice: 290 total = 259 pending / 23 in-progress / 8 implemented / 0 fully source-parity-verified. Draft PR #1 unmerged, main unchanged, no release.

## Webapp/Embed successful CI; source inventory correction — 2026-11-14

- [Full CI #43586350903](https://github.com/codersachin99/windows-os/actions/runs/43586350903) **SUCCESS**: 303 unit tests (61 files), 314 desktop/mobile Chromium, 53 byte-exact image audits, TypeScript and Vite build. Original parent-origin message flow now CI-tested. Webapp and Embed source tracker entries had erroneously stayed Pending in older status despite code/CI; now set In Progress.
- New Details and Tiles shared UI source modules are also in progress, CI pending. Source inventory now **290 total: 260 pending, 22 in-progress, 8 implemented, 0 fully parity-verified**; prior 262/20 handoff count was premature. PR #1 remains draft, main untouched, no release.

## Desktop/mobile visual evidence — 2026-11-14

- [Visual workflow #43586693913](https://github.com/codersachin99/windows-os/actions/runs/43586693913) **SUCCESS**: 34/34 React target screenshots (17 scenes × desktop/mobile), 0 capture errors. Manifest: sourceConfigured:false, sourceCaptured:0, targetOnlyCaptured:24, parityStatus:not-assessed. Exact source read-token not configured; no paired original screenshots. Artifact [14110837735](https://github.com/codersachin99/windows-os/actions/runs/43586693913/artifacts/14110837735). Do NOT mark source parity verified. Explicit app source fixture comparison remains next visual prerequisite.

## Target-only visual baselines for seven migrated apps — 2026-11-14

- scripts/capture-visual-parity.mjs extended with seven React-only stable initial-window scenes: calc-initial, notepad-initial, chrome-new-tab, ie-home, player-initial, snipping-initial, recorder-initial. Captures use both desktop 1920x1080 and Pixel 7 browser profiles, a fixed 2026-11-11 clock and the actual WindowsOS Start Menu. This produces 14 additional React baseline screenshots on top of 20 prior target scenes.
- The source/target comparable scenes are NOT expanded: source browser navigation for these seven apps has not been proven against the pinned original. Manifest marks these as targetOnly and sourceComparisonEligible:false, never a source-equivalence claim.
- Intentionally run the gated visual-capture workflow using [capture-visual] only (not a full CI marker), preserving screenshot artifacts. GitHub Actions compares actual pinned original only if the existing optional LEGACY_SOURCE_READ_TOKEN is supplied; otherwise it reports target-only evidence with parityStatus:not-assessed.

## Original Media Player & Windows 7 WebP verification — 2026-11-14

- [Combined full opt-in CI #43585262479](https://github.com/codersachin99/windows-os/actions/runs/43585262479) **SUCCESS** on commit 08a5e8e: 298/298 Vitest across 60 files, 308/308 desktop/mobile Chromium cases, 52 original byte-exact asset checks, TypeScript, Contacts audit and Vite production build. The Media Player initial E2E name/slider selectors were fixed before this run. Source Player remains **in-progress**, because the single-file view, source playlist, media filters and original pixel-parity are not fully ported.
- The seven Win7 WebP source icon blobs, including Media Player and Snipping Tool, are now browser-served and audited by their exact original Git hashes; source full application screenshots remain unverified.
- The earlier source-art-only CI #43584985504 did not pass solely because it used Player's unrepaired E2E assertions. The combined later commit was green; no need for another rerun until implementation work changes.

## Media Player first CI regression repair — 2026-11-14

- [Run #43584290348](https://github.com/codersachin99/windows-os/actions/runs/43584290348) **FAILURE** only in newly introduced Player Playwright expectations: 297/297 unit tests passed, 300/306 Chromium browser cases passed. Five failures were non-exact Play button selectors matching the containing Windows Media Player dialog/title and row; one mobile case incorrectly expected the source extended Volume slider that is intentionally hidden when source `showAllControls` sees a window width below 400px.
- Player `.png` loaded from Guest VFS and rendered 4×3 pixels, and real `.wav` source file loaded from the original Explorer file association. The corrected test matches the exact Play button accessible name and branches the slider assertion on the original 400px source threshold, retaining audio mute/play/pause/stop assertions across desktop/mobile.
- Media Player remains **in-progress**. Full opt-in rerun needed before declaring this source slice CI-tested. Original seven Win7 icon recovery is separately in run #43584985504 and will be verified in the next combined run after the test repair. Draft PR #1 remains unmerged, main unchanged, no release.

## Exact Windows 7 application artwork recovery — 2026-11-14

- The GitHub connector supports `fetch_file({encoding:"base64"})` for binary original assets. Each Base64 payload was used in `create_blob({encoding:"base64"})`, and the resulting target Git blob SHA **exactly equaled** the pinned original SHA. Seven original Windows 7 WebP icons are now staged as immutable native Git blobs, not manually reconstructed artwork: `player.d45d301d.webp`, `snipping.2c25345c.webp`, `chrome.0eddc17a.webp`, `ie.66b8418d.webp`, `camera.5e0b513d.webp`, `recorder.519283f8.webp`, `photo.db6c5f81.webp`.
- The shared `legacyArt` registry now selects the original Win7 WebP paths for those seven apps; their source base-theme SVG files remain available. Original exact SHA checks must be repeated in the full opt-in CI source-art audit after commit. **This restores original icon bytes but does not imply pixel parity for entire app windows or all original themes.**
- Prior notes claiming binary asset transfer was impossible are superseded by this discovery. Source tracker evidence and each app source trace updated. Player source CI #43584290348 (on pre-art commit `0eda86c`) remains a separate check; only a new art commit can verify these seven source WebPs.

## Snipping Tool completed CI checkpoint — 2026-11-14

- [Run #43583547737](https://github.com/codersachin99/windows-os/actions/runs/43583547737) **SUCCESS** on commit `5c1de35`: 293/293 unit tests (58 files), 300/300 Chromium desktop/mobile E2E cases, 44 byte-identical original image audits, TypeScript and production Vite build. Full-screen and rectangular capture previews and real PNG/JPEG save flow passed; advanced original source pixel/window parity still pending.
- Source module `src/modules/apps/snipping.js` remains **in-progress**, not source-verified. Media Player source package `0eda86c` pushed with CI #43584290348 underway. No release, PR #1 stays draft, main remains unchanged.

## Source Windows Media Player migration — 2026-11-14 (full CI pending)

- Pinned `src/modules/apps/player.js` webpack `9b15` core: source initial Music library and Stop/Play/Pause constants; implemented bounded React package `packages/apps/player` with source view/menu controls, Music/Videos/Pictures source library mode, original controls (seek, play/pause/stop, next/prev, shuffle/repeat toggles, mute, 0–100 volume), file info, image/audio/video DOM media and Guest VFS-backed byte-exact Blob/object URLs. Explorer double-click .mp3/.wav/.ogg/.mp4/.webm routes to Media Player while pictures still open original Photo Viewer.
- Source base SVG imported exact blob; original Win7 WebP cannot transfer via text-only connector. First source-slice does not reproduce GoogleAds in-feed, system volume integration, original codec/media format filters, multi-entry playlist/library scanning, audio metadata inference or full screenshot pixel parity. Unit/e2e tests added. Player is **in-progress** pending CI, not source-verified.
- Snipping Tool prior CI #43582665339 completed **296/300 browser passes**, 293/293 unit tests, four failures limited to the preview toolbar Save accessible name (captured image already visible and painted-pixel assertion passed). Fix `5c1de35` adds accessible Save label; opt-in CI #43583547737 pending final result. Do not mark Snipping verified until green. Source inventory 290 total now 264 pending / 18 in-progress / 8 implemented / 0 fully source-verified.

## Snipping capture verification — 2026-11-14, opt-in CI checkpoint

- [First Snipping CI #43581746681](https://github.com/codersachin99/windows-os/actions/runs/43581746681) completed **FAILURE**: all source inventory/typecheck/unit tests and build passed; 296/300 browser cases passed, exactly four failures were rectangular PNG and fullscreen JPEG tests on desktop/mobile. The image preview never appeared because the initial SVG foreignObject screenshot path produced Chromium-tainted Canvas2D exports (independently reproduced with a headless browser).
- [Repair e444b79](https://github.com/codersachin99/windows-os/commit/e444b790d36199c3eb951fc726722f0c4659c1b6) replaces SVG serialization with direct Canvas2D painting of source DOM layout and same-origin images, and adds positive pixel coverage in the rectangle regression. Side effects are scoped to Snipping Tool; CSS advanced effects, cross-origin iframes and video still have documented parity gaps.
- [Second full CI #43582665339](https://github.com/codersachin99/windows-os/actions/runs/43582665339) triggered on the repair, TypeScript/unit/source audits/build passed; **browser suite in progress at last check**. Do not claim Snipping verified until it finishes green. All other app/source inventory remain unchanged. This docs-only update has no `[run-ci]` marker and should skip full checks.

## Source Snipping Tool migration — 2026-11-14 (full CI pending)

- From pinned `src/modules/apps/snipping.js` webpack `331a`, added modular `packages/apps/snipping` with original New mode dropdown (Free-form remains disabled), Cancel, rectangle drag with source min 5px retry, Window hover/click, Full-screen capture, result stage, and PNG/JPG Save As via shared `VirtualFileDialog` and Guest `fileStore` binary bytes. A local Chromium reproduction exposed that SVG `foreignObject` screenshots are canvas-tainted and cannot be exported. The initial version was rejected before marking Snipping verified. The replacement draws the live WindowsOS DOM directly into Canvas2D (computed backgrounds/gradients, text, borders, same-origin images/canvases) with no external service, host disk, or screen-share permission. Accurate CSS effects, pseudo-elements, cross-origin iframes and video remain known capture-parity gaps.
- Source module tracker `snipping` is in-progress. Snipping supports Esc cancel and capture cleanup, and requestClose guard while Save As is visible. Source base theme icon is a byte-exact SVG; Win7-specific art still missing. New 4 pure contract tests and desktop/mobile browser tests exercise captured PNG/JPG bytes, rectangles, modes, cancel and virtual-file save. Full opt-in CI needs verification. No merge or release.
- Pinned source total 290: 265 pending, 17 in-progress, 8 implemented, 0 fully source-parity-verified.

## Chrome final integrated CI — 2026-11-14

- [Run #43577115840](https://github.com/codersachin99/windows-os/actions/runs/43577115840) **SUCCESS** at `ac1bc402`: 289/289 unit cases (57 files), 294/294 desktop/mobile Chromium cases, 43 source art audits, Contacts/source tests, TypeScript and production build. The prior `288 passed / 6 failed` run was resolved by source-program expectation and precise New Tab selectors. Chrome still in-progress for original dinosaur, local file preview, plugin integration, source Win7 art and screenshot parity.

## Chrome browser regression repair — 2026-11-14 (final CI running)

- Source-backed Chrome code commit [c609b78](https://github.com/codersachin99/windows-os/commit/c609b78d0c98a769ae1258ae4150760838ccb5a5) added 5 model tests and 8 desktop/mobile browser cases. Initial [CI #43576157230](https://github.com/codersachin99/windows-os/actions/runs/43576157230) passed TypeScript but found a URL-credential fallback bug in one unit assertion. [Fix 11b5067](https://github.com/codersachin99/windows-os/commit/11b50673b84b897c3136f8e9e07de4223f696795) rejects credentialed HTTP(S) URLs before they can be interpreted as search text.
- [CI #43576242002](https://github.com/codersachin99/windows-os/actions/runs/43576242002) then passed **289/289 unit tests** in 57 files, source assets, Contacts audit, TypeScript and Vite build. The Chromium suite finished **288 passed / 6 failed** out of 294. Failures were solely outdated tests: four Chrome cases located both the current tab label and Add Tab button by non-exact "New tab" name, and two old installed-program cases still expected original Chrome to be unavailable.
- [Repair ac1bc40](https://github.com/codersachin99/windows-os/commit/ac1bc4023cbf3719436d7c84a963acaa734cad32) switches to explicit Add Tab data locator and updates the original installed .lnk regression to expect the now-migrated Chrome program to be enabled. No application behavior was weakened to make the test pass.
- New [full CI #43577115840](https://github.com/codersachin99/windows-os/actions/runs/43577115840) is running. Its outcome must be checked before changing status to "integrated CI verified"; no claim of a final green run yet. Ordinary docs-only commits correctly skip both heavy CI and capture.
- Original source Chrome remains in-progress pending T-Rex, local file preview, browser plugin, Win7-specific WebP icon and original-vs-React paired screenshots. Draft PR #1 remains unmerged, main unchanged, no release.

## Chrome source-backed migration — 2026-11-14 (CI pending)

- Pinned original Chrome main `7839a`, tab code and settings `90b3` migrated to independent `packages/apps/chrome`. Source one-blank-tab lifecycle, tab controls, per-tab navigation, original six search engines and menu options, new tab Google branding and Settings UI are present. User search engine choice saved per Guest browser storage.
- Four desktop/mobile browser regressions plus pure model tests added; exact original Chrome base SVG/Google logo/mic imported. Tests, source audit, TypeScript, build and Chrome browser scenarios need deliberate full `[run-ci]` confirmation. Chrome is **in-progress** until actual source visual/functional parity.
- Outstanding source behaviors: local PDF/HTML viewer, original T-Rex game, native browser plugin xframe errors, full error page, browser shortcuts beyond scoped Alt+T, exact Win7 WebP and side-by-side screenshots. No merge/release; draft PR stays open. Inventory 266 pending / 16 in-progress / 8 implemented / 0 source-verified of 290.

## Internet Explorer integrated CI — 2026-11-14

- [Opt-in CI #43574037011](https://github.com/codersachin99/windows-os/actions/runs/43574037011) PASSED at `8eaf3fa`: 284 Vitest cases (56 files), 286 desktop/mobile browser cases, source assets (40/40 exact blobs), Contacts audit, TypeScript and production build. Source IE remains **in-progress** pending actual original iframe/URL-helper/Win7 art and screenshot comparison.

## Source Internet Explorer migration — 2026-11-14 (CI pending)

- Original legacy-win7/src/modules/apps/ie.js (Git blob 9cf202d89...) is rebuilt in modular packages/apps/ie. The pinned app.config.json supplies MSN home and Bing search. Source IE ID, iframe, address entry, Back/Next history, disabled Favorites/Bookmarks, 500ms progress, Internet status and exact onebit fallback SVG are mapped.
- Unit and browser tests cover source endpoints, navigation, history and blocked unsafe URL schemes. Window geometry, true source URL helper equivalence, browser warning, external website embedding and Win7-specific WebP icon remain unverified. Full opt-in CI not yet verified.
- Tracker: 267 pending, 15 in-progress, 8 implemented, 0 fully verified of 290. PR #1 draft, main unchanged, no release. Full CI only via [run-ci].

## Source Camera migration — 2026-11-14 (INTEGRATED CI VERIFIED)

- **Pinned original**: `src/modules/apps/camera.js` (Git blob `c87c1df95...`) requests front camera on mount (`1280×720`), switches to rear via `facingMode:environment`, captures track-resolution JPEG at 100% quality and opens JPEG-only Save As. Information modal shows fixed source resolution/format/quality.
- **React port**: modular `packages/apps/camera` component/model with browser-permissioned video preview, facing switch, stale-request and stream-track cleanup, real canvas-to-JPEG conversion, signed JPEG-header check and virtual-file persistence. Source Save As type shared dialog reused without modifying Recorder/Notepad. Camera is an Accessories Start Menu program. Added exact original `camera-base.3c876d62.svg` fallback (source Git blob `23ce3c1e...`); unavailable Win7 WebP still a known gap. [Source trace](CAMERA-SOURCE.md).
- **New tests**: 3 unit cases (constraints, JPEG config, source capture dimensions) plus desktop/mobile Chromium scenarios using canvas-backed simulated camera, switching and track cleanup, settings, JPEG Save As and opening in Photo Viewer, and denied camera permission. Physical camera hardware and full visual parity intentionally remain unverified.
- **Status**: `camera.js` moved pending → **in-progress**, keeping immutable source SHA and concrete evidence. **268 pending / 14 in-progress / 8 implemented / 0 fully verified** of 290 pinned source modules. No merge, release, or main modification. Full CI only on explicit `[run-ci]` commit.
- **Verified CI**: [Feature `e94d616`](https://github.com/codersachin99/windows-os/commit/e94d6169eea52651377992dc5b413b5a0b9f3e3f) initially passed TypeScript, 280 unit tests, Vite build, source inventory and 39 image audits; [CI #43570514062](https://github.com/codersachin99/windows-os/actions/runs/43570514062) then reported **278 passed and 2 failed browser cases**, both Camera cases because React StrictMode replay caused an extra initial `getUserMedia` request. [Fix `cda8932`](https://github.com/codersachin99/windows-os/commit/cda8932896850ce412d005262be2e22150f84c63) defers the hardware request by one task so discarded effects cancel before asking the browser permission. **[Full CI #43571392317 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43571392317)**: **280 unit tests (55 files), 280 desktop/mobile Chromium browser cases**, TypeScript, Contacts source verification, Vite build and **39/39 original source-image SHA audits**. All Camera cases are green. This proves real VFS JPEG export using a simulated camera stream; live camera hardware and source pixel parity remain **pending**.

## Sound Recorder source migration — 2026-11-14 (INTEGRATED CI VERIFIED)

- **Original**: pinned `src/modules/apps/recorder.js` (blob `449ee114...`) records microphone `audio/webm`, draws an analyser frequency meter (FFT 32), counts seconds, then converts audio to WAV and shows a WAV-only Save As dialog.
- **New React slice**: modular `packages/apps/recorder` captures permissioned audio, converts it to a standards-compliant signed 16-bit PCM WAV using real browser audio decoding and persists bytes using the shared VFS; no host audio/disk access. Original shared `VirtualFileDialog` is extended with optional app-specific formats without altering Notepad TXT/HTML defaults. Hidden/foreground app registration reuses source `recorder` (Accessories, Start Menu).
- **Tests**: pure RIFF/WAVE byte and duration model tests plus desktop/mobile Chromium tests with deterministic mocked microphone/MediaRecorder but *real* browser WAV decoding/conversion, file dialog, persistence, and denied-permission UI. One exact original `recorder-onebit.110a9439.svg` copied as fallback artwork (original blob `c50b4787...`); original Win7 WebP icon is a declared gap. [Full source trace](RECORDER-SOURCE.md).
- **Honest scope**: moved `recorder.js` from pending to **in-progress**; now **269 pending / 13 in-progress / 8 implemented / 0 fully verified** of 290 source modules. Exact visual parity, real microphone hardware behavior and audio source conversion fidelity remain unverified. Draft PR #1, no merge/release.
- **Verified CI**: First [run #43567599509](https://github.com/codersachin99/windows-os/actions/runs/43567599509) exposed one strict TS issue when a readonly Blob array was used in the recording encoder; fixed in [commit 2d91d7a](https://github.com/codersachin99/windows-os/commit/2d91d7a79b9c35f9059472552dd6850d96ba656c). **[Full opt-in CI #43567671473 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43567671473)** on that repair passed **277 Vitest unit tests (54 files), 276 desktop/mobile Chromium browser tests**, TS typecheck, Contacts source audit, Vite build and **38/38 exact source-art image checks**. The new Recorder tests cover WAV encoding and controlled fake-microphone Save As/permission denial in both browser profiles. Browser tests deliberately mock the microphone: live device permission and source pixel parity remain **unverified**. Ordinary documentation changes must not trigger full CI.

## Windows Photo Viewer source migration — 2026-11-14 (INTEGRATED CI VERIFIED)

- **Pinned origin**: `legacy-win7@4e63290/src/modules/apps/photo.js` (`9df69903`) renders hidden photo viewer with disabled File/Print/E-mail/Burn/Open actions, source picture-kind sibling listing, wrapped Prev/Next, fit/actual size, zoom (100–800 × 20), 90° rotation, save-before-navigation/close, and 3-second slideshow.
- **React implementation**: new modular `packages/apps/photo/src` viewer/controller and source-backed pure model. It reads real binary files from the shared VFS, creates/revokes local object URLs, uses only the existing shell/window lifecycle, saves supported PNG/JPEG/WebP rotations safely to the original virtual file, and shows errors rather than silently corrupting unsupported formats.
- **Integration**: hidden source `photo` registry entry and window, Explorer source `picture` double-click association, real uploaded-picture browser test covering PNG dimensions, wrap/navigation, rotation save, zoom, disabled source menu and close. `apps/web/public/assets/images/photo-base.b5f2d859.svg` copied **byte-identically** from original source (source Git SHA `0567f7ac...`). **Win7-specific WebP icon remains missing**, so appearance parity is not claimed. [Source trace](PHOTO-SOURCE.md).
- **Inventory**: `photo.js` changes from pending to **in-progress**, with concrete implementation/test links. **270 pending / 12 in-progress / 8 implemented / 0 fully verified** of 290 original modules. Original legacy source and React have not been screenshot-compared.
- **Verification passed**: Initial [CI #43560852744](https://github.com/codersachin99/windows-os/actions/runs/43560852744) failed on a missing TypeScript alias; [repair commit `3196055`](https://github.com/codersachin99/windows-os/commit/3196055d0844c3f0b9c7094a6a58d0deb58c9143) added the alias and re-ran full checks. **[CI #43560941513 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43560941513)** verified **274 Vitest unit tests / 53 files**, **272 Chromium desktop/mobile browser tests** (including two real PNG Photo Viewer scenarios), **37/37 byte-exact imported legacy images**, TypeScript, Contacts source audit and Vite production build. This proves the current implemented slice only; original photo.js screenshot/visual equality and unsupported image-format rotation parity remain pending. Draft PR #1, `main` unchanged, no release.

## Module inventory corrected to reflect implemented React slices — 2026-11-14 (METADATA ONLY)

- **Source reference unchanged**: pinned `legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`, all 290 tracked original `src/modules/` paths retained with exact original Git SHAs.
- **Status correction**: eight original modules previously marked `pending` despite their existing React components, unit tests, browser tests and source traces are now `implemented`: About, Magnifier, Run, Sticky Notes, Task Manager, Find, Search Dialog, Search Companion. Each entry now points to concrete existing implementation/test files. `implemented` **does not** claim complete visual or functional legacy parity, and no original module is prematurely marked `verified`.
- **Honest counts**: **271 pending, 11 in-progress, 8 implemented, 0 fully verified** among 290 source modules. Contacts remains one implemented external app out of three; its stale "tests have not run" note is corrected to reflect integrated green CRUD/browser/contract tests, while noting real source-backend end-to-end and visual checks are outstanding.
- **Validation**: all new evidence paths were checked against the current repository Git tree. This bookkeeping change needs no `[run-ci]` test run; the next opt-in source inventory audit will enforce valid status/evidence fields. [Source inventory](module-tracker.json). Draft PR #1, `main` unchanged.

## Extended Win7 visual capture to drive/search/folder/Bin states — 2026-11-14 (TARGET-ONLY CI VERIFIED)

- **Source-grounded target scenes**: previous [CI 43490774615](https://github.com/codersachin99/windows-os/actions/runs/43490774615) verified 10/10 React PNGs over five scenes (desktop and Pixel 7). This follow-up adds System (C:) listing, scoped Computer search with one result/disabled Save search, a new folder in Guest Documents, a truly populated Recycle Bin after confirmed deletion, and Bin search with no results/disabled Save search. The source-backed React behavior and expected UI state are already covered by passing browser regression tests.
- **Scope**: screenshot runner now records **ten React scenes × two profiles = 20 target PNGs**. Its manifest explicitly marks the five extra scenes `sourceComparisonEligible:false` and retains only the original five for future paired source checks. The comparison report lists `targetOnlyNotCompared`; no source-pixel equality or new original screenshot claim is possible.
- **Files**: `scripts/capture-visual-parity.mjs`, `scripts/compare-visual-parity.py`, and [visual runbook](VISUAL-PARITY-RUNBOOK.md). Changes stay exclusively on `feat/0001-faithful-react-foundation`. A one-time opt-in `[capture-visual]` run is required to validate the extra screenshots, without triggering the full `[run-ci]` browser suite.
- **Verified result**: [opt-in GitHub Actions #43556921716 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43556921716) at feature commit `8189d5718bacc4b8b2ea1d668b25174c93ca0b58`. **20/20 React screenshots** (10 scenes × desktop/mobile); `targetOnlyCaptured:10`, `errors:0`, `sourceConfigured:false`, `sourceCaptured:0`, `parityStatus:"not-assessed"`. The imported asset audit passed **36/36**. The full browser-and-contracts CI job was correctly **skipped**. Visual artifact ID **14097794398**, `visual-parity-8189d5718bacc4b8b2ea1d668b25174c93ca0b58` (~10 MB). Source-side equivalent fixtures and paired screenshots are not captured or verified.
- **Next**: implement original-source fixture steps after arranging read-only checkout access; review true pixel differences before calling any scene visually equivalent. No main merge or release.

## Opt-in Win7 screenshot capture — 2026-11-13 (TARGET-ONLY CI VERIFIED)

- **Commit**: [0e1ea575](https://github.com/codersachin99/windows-os/commit/0e1ea5752982b84905e8381b5e41ff2158988f41) adds a deterministic Playwright capture CLI, human-review-only Python difference script and separate `[capture-visual]` workflow gated independently from the existing `[run-ci]` path. Changes remain on `feat/0001-faithful-react-foundation`; `main` unchanged.
- **Actual result**: [GitHub Actions 43490774615 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43490774615) completed on the visual-only job. The regular browser-and-contracts job was **skipped**, as intended. Source image audit passed all **36/36**, JS syntax check and Chromium setup passed. **10/10** React screenshots were captured (Guest desktop, Computer, Organize, View, Recycle Bin × desktop/mobile); **0 capture errors**. The ignored artifact is `visual-parity-0e1ea5752982b84905e8381b5e41ff2158988f41` (artifact ID `14067939886`, ~5.1 MB) and includes the explicit manifest.
- **Critical limitation**: the run logged `No legacy read token: target-only screenshot evidence, not paired parity`. Its manifest reports `sourceConfigured:false`, `sourceCaptured:0`, `successes:10`, `errors:0`, `parityStatus:"not-assessed"`. No original-vs-React screenshots or pixel difference report exist yet. Source-specific selectors and isolated Python server setup are code-backed hypotheses, **not verified CI behavior**.
- **Next**: add GitHub Actions secret `LEGACY_SOURCE_READ_TOKEN` with *read-only Contents access to the original `codersachin99/legacy-win7` repository* (do not paste or commit token), rerun `[capture-visual]` only when needed, then repair any source boot/selector mismatches and review true paired overlays. Extend matrix to disk breadcrumb, search, populated Bin, New Folder. [Runbook](VISUAL-PARITY-RUNBOOK.md). Draft PR #1, no merge/release.

## Opt-in, isolated visual evidence capture — 2026-11-13 (TARGET-ONLY CI VERIFIED; paired source pending)

- **Goal**: move visual fidelity evaluation beyond unverified screenshots. The pinned source still controls UI/behavior; a React screenshot by itself is **not** proof of parity.
- **Implementation**: `scripts/capture-visual-parity.mjs` records five deterministic scenes at desktop 1920×1080 and Playwright Pixel 7 sizes, fixed clock, Chromium version, screenshot paths/hashes, and explicit errors into ignored `artifacts/visual-parity/manifest.json`. The `scripts/compare-visual-parity.py` creates human-review overlays and difference metrics **only if** paired source and target images exist. A missing source or failed scene cannot be reported as a pixel match.
- **Workflow**: `.github/workflows/react-checks.yml` retains `[run-ci]` as the normal opt-in gate and adds a separate visual-only trigger `[capture-visual]` (or deliberate manual `capture_visual=true`). It uploads visual artifacts on success or failure. Optional `LEGACY_SOURCE_READ_TOKEN` allows checkout of exact pinned private source into `legacy-reference`, SHA verification, and local Python server; if missing, the first run is **target-only**, explicitly marked as such.
- **Scope**: initial scenes are Guest desktop, Computer root, Organize, View, and Recycle Bin. Expanded disk/search/fixtures/screenshots remain unported acceptance tasks. No screenshot difference has yet been measured, no source-server CI execution is claimed. [Runbook](VISUAL-PARITY-RUNBOOK.md).
- **Next**: use `[capture-visual]` once to check the actual browser capture/zip path without running full CI unnecessarily; document results and fix failures. PR #1 stays draft, `main` unchanged, no release.

## Integrated View / Bin Save search / original-image audit verification — 2026-11-13 (CI VERIFIED)

- **Green prerequisite**: [CI 43482880673](https://github.com/codersachin99/windows-os/actions/runs/43482880673) passed **269 unit tests / 266 browser tests** after the New Folder and View URL-regex fixes.
- **Additional source changes**: `7b48256` adds disabled non-classic **Save search** in the shared Computer/Bin toolbar; `b957c31` adds image byte checks to the existing source inventory audit. The Git repository tree confirmed **36 of 36** imported images match original Git blob hashes before adding the automated check.
- **Verification passed**: [opt-in GitHub Actions 43484632290 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43484632290) at code SHA `340beee5c3573ddc1adc99459ecff30cf19063f4`: **269 Vitest tests (52 files)**, **270 Chromium desktop/mobile browser tests**, TypeScript, pinned source inventory, Contacts source audit, Vite production build all green. Automated imported-image audit reports `byteCheckedImportedImages:36` and `failures:[]`. This verifies the Save search regression cases and 36 byte-identical source images; no screenshot/pixel equality claim. [Source view trace](EXPLORER-VIEW-SOURCE.md), [visual parity runbook](VISUAL-PARITY-RUNBOOK.md). PR #1 remains draft; `main` unchanged.

## Imported source image byte-fidelity audit — 2026-11-13 (CI VERIFIED)

- **Actual Git tree evidence**: comparing pinned `legacy-win7@4e63290` and current `windows-os` repository trees, all **36** imported `apps/web/public/assets/images/*` files match the original `assets/images/*` Git blob SHA exactly, including eight source View icons.
- **Code change**: `scripts/audit-legacy.mjs` now checks each imported image filename against the source migration inventory, reads the bytes and computes the Git-compatible `sha1("blob " + size + "\\0" + bytes)`. Changed bytes, non-source images, or mismatched lengths fail the existing `npm run audit:legacy` step; no separate always-running workflow is introduced.
- **Verification passed**: direct Git tree comparison and [opt-in CI 43484632290 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43484632290) confirmed all 36 imported assets checksum-match the pinned source; the source audit reported `byteCheckedImportedImages:36` with no failures. PR #1 draft, main unchanged.

## Original non-classic Computer/Bin Save search toolbar — 2026-11-13 (CI VERIFIED)

- **Pinned proof**: `legacy-win7@4e63290/src/modules/apps/computer.js#toolbar()` conditionally appends `this.isSearch && !this.classicSearch && {label:this.$t("save-search"),disabled:true}`. Win7 has non-classic search and `bin.js` inherits the Computer toolbar. The source en-US text is "Save search".
- **Code**: [7b48256](https://github.com/codersachin99/windows-os/commit/7b48256cc73ce87855f9aafc15e9d3430ea7c75d) adds the source-disabled entry to Win7 Computer/Bin only while the React search-results route is active. It provides no fake Save implementation and retains all existing file/restore actions. Two browser scenarios (desktop/mobile = four cases) check appearance, disabled state and clearing results. [Detailed trace](EXPLORER-VIEW-SOURCE.md).
- **Verification passed**: [integrated opt-in CI 43484632290 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43484632290) covers this Save search change and image audit, with 269 units and 270 browser cases passing. Previous [repair CI 43482880673 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43482880673) remains the base verified checkpoint for New Folder and View regex repair.
- **Next**: verify repair run and commit with Save search tests; continue source screenshot/toolbar parity. Draft PR #1, main unchanged, no release.

## Win7 View menu browser regression repair — 2026-11-13 (CI PENDING)

- **Failed checks and root cause**: [CI 43476860362](https://github.com/codersachin99/windows-os/actions/runs/43476860362) failed 36/266 Chromium tests (230 passed). [CI 43479294892](https://github.com/codersachin99/windows-os/actions/runs/43479294892) failed 38/266 Chromium tests (228 passed). In both runs, the source-inspired Win7 New folder visibility condition hid the previously working action at React's writable root `"/"`, producing 30-second locator timeouts across desktop/mobile Explorer and search tests. The integrated check additionally had 2 failing new View-icon assertions because a regexp was double-escaped; the DOM did contain the correct original `view-tiles.c4008351.webp` source path. All TypeScript/unit/source audit/build checks passed in the integrated run.
- **Fix**: Keep `New folder` visible for non-Bin Computer, including the writable React root; original source `activePath` nonnull gating is not directly equivalent to this React path. Bin still does not expose folder creation. Correct the two icon-URL regexp assertions to match literal dots, not backslashes.
- **Verification passed**: [corrected opt-in CI 43482880673 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43482880673), implementation SHA `fa1c823389822270cadb99c303719364a2e6ba48`. **269 Vitest unit tests (52 files)**, **266 desktop/mobile Chromium browser cases**, TypeScript, original source inventory, Contacts source audit and Vite build all passed. This run verifies the View popup/source icon URL fixes and preserves all existing Explorer workflows. It does not include the subsequent Save search or image byte-audit code.
- **Next**: verify subsequent source Save search + image audit changes with one separate opt-in CI run; investigate screenshot parity. [View source trace](EXPLORER-VIEW-SOURCE.md). No full pixel parity or release claim.

## Original Win7 Computer/Bin View popup and 8-mode slider — 2026-11-13 (FINAL VERIFICATION PENDING)

- **Original source**: pinned `legacy-win7/computer.js` renders the same right-side View popup for Computer and `bin.js` (a Computer wrapper), eight entries, a `winui-slider` with 0..7 value and icon lookup `view-${viewMode}`. Source `computer.css` specifies a 192px slider; `en-US.json` supplies `xl/lg/md/sm-icons`, List, Details, Tiles, Content labels.
- **Implementation**: [5c6fee5](https://github.com/codersachin99/windows-os/commit/5c6fee5e7f9e40ef689721ad2243ea2a6ce53b6e) adds reusable `SourceViewMenu`, 8-mode typed model, new extra-large icon VFS layout and desktop/mobile browser tests. Eight original WebP images are staged with **byte-matching Git blob SHA** to source, used by the popup and source-style icon-only trigger; see [source asset trace](EXPLORER-VIEW-SOURCE.md).
- **Verification still pending**: initial View-only [CI 43476860362](https://github.com/codersachin99/windows-os/actions/runs/43476860362) remains in progress. Deliberate final integrated [CI 43479294892](https://github.com/codersachin99/windows-os/actions/runs/43479294892) was triggered by marker commit `d0fab3268d3127778d2efcccbcdc3b3433cf5c36` to verify byte-exact source artwork, source `cb81` Tiles default, unit regression tests and desktop/mobile Chromium. TypeScript/unit/build stages of the final run have passed; browser stage is in progress. Do not claim successful final verification until GitHub confirms it.
- **Source correction**: `src/modules/chunks/shared~bsod~games~main.js#cb81` defines the exact eight-item order used by React and **initial viewMode="tiles"**, replacing React's prior inaccurate Details default. The initial View slider therefore starts at index 6. No unproven item ordering remains.
- **Boundaries**: source pixel comparison remains outstanding; source Win7 toolbar still includes retained migration-era file-operation controls to prevent functionality regression. Unsafe Bin New Folder/Cut/Copy/Paste/Rename remain blocked. PR #1 draft, main unchanged, no release.

## Win7 Bin instant search source inheritance — 2026-11-13 (CI VERIFIED)

- **Source proof**: `legacy-win7/bin.js` wraps Computer; Computer always supplies the non-classic `window-addressbar-search instant` slot, including for `id="bin"`. Original webpack `1902` uses **300ms** debounce (React previously used 250ms).
- **Implementation**: [1931776](https://github.com/codersachin99/windows-os/commit/193177650b69b3004728f92cee684e9070cf5b11) enables Win7 Bin instant search, source-style placeholder/search-results label, and shared trash-scoped search without changing Restore/Empty or destructive confirmation. Browser test covers searching, no-results, clearing, and restore.
- **Verification passed**: [opt-in CI 43470482517 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43470482517), implementation SHA `193177650b69b3004728f92cee684e9070cf5b11`: **267 Vitest unit tests (51 files)**, **260 Chromium desktop/mobile browser tests**, TypeScript, pinned source inventory, Contacts fidelity and production Vite build. No full pixel parity claim.
- **Next**: source-accurate Win7 Computer/Bin New Folder + View popup/slider toolbar, source search index differences and screenshots; do not strip functional file operations or enable unsafe Bin clipboard paths. [Detailed source trace](BIN-SEARCH-SOURCE.md). PR #1 draft, main unchanged, no release.

## Source bin.js inherits Computer Organize toolbar and shell Close — 2026-11-13 (CI VERIFIED)

- **Pinned source**: `legacy-win7@4e63290/src/modules/apps/bin.js` renders `<computer id="bin" hoistedPath={trashPath} />`; the Computer component supplies identical `window-menubar` Organize items in the same order, dividers and source-disabled states. The original `computer.js#toolbar()` shows selection-dependent Cut/Copy/Paste/Delete/Rename but does not attach click actions to those entries; the React migration wires only safe, actually implemented operations.
- **Implementation**: `RecycleBinApp` now passes the theme and shell Close action through to shared `ExplorerApp`. `SourceOrganizeMenu` renders the same Computer menu in Bin, in place of the React-only disabled placeholder. With no selection, only Close is available. With selected actual trash descendants, Delete routes exclusively through existing **permanent-delete confirmation**, with No still canceling; Cut, Copy, Paste and Rename remain visibly disabled to avoid corrupting Recycle Bin restore metadata. Root/bin-root, unmounted or out-of-trash selections never permit destructive Delete. Source selections are not claimed as byte-identical here: these are explicit safety constraints until source trash transfer semantics can be verified. Existing Restore, Empty and standalone context actions are unchanged.
- **Verification passed**: [corrected opt-in CI 43466520866 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43466520866) at code-equivalent verification SHA `c6e2adfd470198fdbfea388b12b585ae83c55dd4`: **266 Vitest unit tests (51 files)**, **258 Chromium desktop/mobile browser tests**, TypeScript, pinned source inventory, Contacts source audit and Vite production build all passed. Added two pure unit tests for Bin selection/root and four desktop/mobile browser cases for menu order, disabled actions, shell Close, cancel/permanent Delete. The first [CI 43464620188](https://github.com/codersachin99/windows-os/actions/runs/43464620188) passed all 266 units and 256 browser tests; the two failing new Bin browser cases were foreground Computer covering the Bin item, not an implementation failure. The browser test fixed window interaction order in `febb7ff`, and the final run passed. No screenshot/pixel equality or full product parity claim.
- **Next source-backed milestone**: `legacy-win7/bin.js` inherits the same non-classic Computer `window-addressbar-search instant` slot, while React still excludes Bin from `sourceWin7InstantSearch(theme,isBin)`. Port original Bin search behavior without breaking trash restore/empty, then examine source `toolbar()` New folder/View and original screenshot chrome. These remain unverified gaps, not completed work.

## Original Win7 Computer instant addressbar search — 2026-11-13 (CI VERIFIED)

- **Pinned proof**: `legacy-win7@4e63290/src/modules/apps/computer.js` passes `instant` to `window-addressbar-search` unless `classicSearch` is active; `search(e)` sets `searchText` and calls `delayedSearch.type(e)`. Shared source chunk `d65e` passes `instant` to `winui-searchbox` and builds `Search {currentLocation}` placeholder from final `getLocation(searchScope)` label. Source Computer has no separate Find or Clear-results button in Win7. `openSearch("")` returns from search to the previous folder.
- **Port**: Win7 Computer starts a debounced query from input text (250ms bounded reconstruction, not claimed as an exact source debounce interval) and recomputes if name/subfolder filters change. An empty query cancels pending work, restores real folder entries and clickable breadcrumbs. Placeholder uses original Computer/folder/disk label; Win7's extra Find/Clear-results buttons are hidden while other theme-specific legacy search surfaces are preserved. Existing `searchFiles` index, cancellation and folder-change invalidation remain intact.
- **Verified**: [deliberately gated CI 43461209456 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43461209456) at code commit `fde26c8fbc96d2b72b50b152c8afbbe8311dd161`: **264 Vitest unit tests (51 files), 254 Chromium desktop/mobile tests**, TypeScript, source inventory, Contacts source fidelity and production Vite build passed. Two new desktop/mobile instant-search scenarios (scope, source placeholder, typing, clearing) and existing searches reworked to assert automatic results without Find. No screenshot/pixel match or full parity claim.
- **Next**: faithfully reuse Computer menu/toolbar for Recycle Bin (pinned `bin.js` wrapper); investigate exact source search debounce utility and source result navigation; compare original/React screenshots.
- **Next source-backed work**: `legacy-win7/src/modules/apps/bin.js` renders the Computer component with `id="bin"` and hoisted trashPath; the current React Bin toolbar should inherit Computer's `Organize` structure and source-disabled command states rather than a disabled placeholder. Preserve safe restore/delete semantics and wire shell Close through a shared window action. Also reconcile unsupported extra Win7 File Pattern/Subfolder controls, source instant debounce exact timing and source-vs-target screenshots in subsequent bounded checkpoints.

## Original Computer Win7 addressbar: remove migration-era Up button — 2026-11-13 (CI VERIFIED)

- **Pinned source proof**: original `legacy-win7@4e63290/src/modules/apps/computer.js` renders `window-addressbar` with one `window-addressbar-nav` child providing only `activeBack`/`activeNext` and `navigate`; next to it the `location` and optionally `search` slot. No standalone **Up** element exists. The original `getLocation` crumbs provide parent navigation through clickable Computer/disk/folder segments. The current Win7 React `ExplorerApp` erroneously rendered an extra Up button between the exact 27px sprites and the 25px breadcrumb field.
- **Code**: `showExplorerUpControl(theme)` is an explicit source-layout predicate. Win7 hides the extra button; other themes keep their migration-era Up until separately proven/ported. `ExplorerSession.up()` remains intact and clickable source breadcrumbs and Back/Forward work unchanged. Removed no source-available functionality.
- **Verification passed**: [deliberately gated CI 43454842022 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43454842022) at source/layout commit `7e76881922202f618606ac80028c52ff3d264b76`: **262 Vitest unit tests (51 files)**, **250 Chromium desktop/mobile browser tests**, TypeScript, source inventory, Contacts source-audit and Vite production build. This adds 1 unit test and 4 desktop/mobile browser cases, confirming Win7 has only the paired history buttons and clickable breadcrumb parent navigation while WinXP retains working Up. No source-vs-React screenshot pixel comparison was performed.
- **Next**: original `window-addressbar-search` is `instant` and Computer `search(e)` feeds `delayedSearch.type(e)`, while React still exposes an extra Find button and manually triggered results; port the source search behavior and visibility with tests before claiming parity. Also port the source Recycle Bin wrapper/menu reuse (see correction below) and compare source/React chrome screenshots.
- **Correction based on original Bin source**: `legacy-win7@4e63290/src/modules/apps/bin.js` renders `<computer id="bin" hoistedPath={trashPath} />`: Recycle Bin is **not an independent source menu implementation**. It inherits Computer's address bar and Organize toolbar. The current React `RecycleBinApp` mounts Explorer at `recycleBinPath` but leaves Organize disabled; this is a documented parity gap and next separate task. Do not enable unsafe file operations on trash items without checking their source semantics.


## Source Computer Organize menu and shell Close action — 2026-11-13 (CI VERIFIED)

- **Pinned source**: `legacy-win7@4e63290/src/modules/apps/computer.js#toolbar()` supplies `Organize` with **13 ordered entries**: Cut, Copy, Paste, Undo, Redo, Select all, Layout, Folder and search options, Delete, Rename, Remove properties, Properties, Close. Source `hasDivider` after Redo, Folder and search options, Properties. `hasItemSelected` excludes root disks and mixed root selections; source disables Undo/Redo/Select all/Layout/Options/Remove properties/Properties. English labels checked against `assets/locales/en-US.json`. Source declares no click handlers for Cut/Copy/Paste/Delete/Rename; port intentionally **wires those to already-migrated Explorer file operations** rather than leaving misleading enabled no-ops. The React port additionally guards Paste by real clipboard state, Delete by mounted trash, and Rename by single selection; these safeguards are intentional, documented differences from source predicates.
- **Code**: `sourceOrganizeMenu.ts` is a reusable menu command model, `SourceOrganizeMenu.tsx` renders accessible keyboard navigable menu, Escape/Tab/outside-click dismiss and source disabled items. `ExplorerApp` delegates existing clipboard, deletion confirmation and rename handlers; `DesktopShell` passes the existing request-close protocol through optional `onClose` for source Close. The React Bin's disabled Organize placeholder is a bounded safety limitation. The source Bin is actually a Computer wrapper (`bin.js`), so inheriting the original menu is a remaining parity gap (see source correction above). No new host filesystem or unsupported Windows OS behavior is invented.
- **Verified**: [corrected opt-in CI 43445863504 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43445863504) at code-equivalent commit `c768e85b1e75a6e2039d123ea3e9969a29c3b2e5`: **261 Vitest unit tests (51 files)** and **246 desktop/mobile Chromium browser tests** passed, alongside TypeScript, legacy source audit, Contacts fidelity checks and Vite build. Eight new pure/markup tests and three new Playwright scenarios (six desktop/mobile cases) cover source menu order/separators, selection and clipboard, Rename, confirmation-backed Delete, shell Close, keyboard and pointer dismissal. Earlier CI `43444060338` stopped at TypeScript due to a root-path regexp typo; CI `43444321954` passed 261 unit and 242 of 246 browser cases, failing only four new cases due to nonexact button locator matching `SourceOrganizeProbe`; fixed in `65b888e` and `12fe721` respectively. Only the final corrected run is a verified checkpoint.
- **Still pending**: Bin inheritance fidelity, original Organize popup exact pixels, screenshot comparison, source instant search and full legacy parity. The source Win7 Up-button mismatch was fixed in commit `7e76881`.
- **Follow-up completed**: Win7's standalone Up-button mismatch has been fixed and verified (CI `43454842022`). Remaining priorities are the original instant search workflow, Bin's Computer inheritance and visual screenshots.


## Original Vue addressbar item structure and refresh artwork — 2026-11-13 (CI VERIFIED)

- **New source evidence**: `legacy-win7@4e63290/src/modules/chunks/shared~bin~bsod~camera~chrome~computer~cpanel~games~ie~notepad~paint~personalize~player~recorder~sni~17da8929.js` module `3b99` renders icon **button (24px)**, a list of `bd65` AddressbarItem widgets (each with a clickable breadcrumb + independent **16px sibling-folder disclosure**), and `base-icon(themeData.icon["fileexplorer-refresh"])`. Source location is a div, **not an editable input**. Source disclosure and refresh icon buttons have **no click handlers**; creating an edit state or a sibling-menu implementation here would invent behavior. Original `assets/images/fileexplorer-refresh.7f376545.webp` (16×16) is used unmodified in React. For pragmatic compatibility the port retains its existing functional session.refresh, but does not call it byte-identical source behavior.
- **Implementation**: `SourceWin7Breadcrumbs` mirrors icon button, `AddressbarItem` grouped breadcrumb/disclosure controls and static Search Results display; `ExplorerApp` uses original WebP refresh art. Hidden read-only Folder address input remains *only* for migration test/inspection, removed from keyboard tab order, and is not an editor. All other theme address UI is unaffected.
- **Verified**: [opt-in CI 43390383028 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43390383028) at implementation SHA `bf3e18806af3938e7676d49183f2e613a6e695ed`. All **253 Vitest unit tests (50 files)** and **240 desktop/mobile Chromium browser tests** passed; TypeScript, original source inventory, Contacts source-fidelity audit and Vite build passed. Includes the new per-item 16px disclosure/source WebP delivery/no address editing browser test and updated source Search Results assertions. Original legacy image blob SHA `1e3aee0bcc2d8502c317779f32784c7fdcd59305` equals destination blob SHA; bytes are exact. No source-versus-target screenshot comparison or full app parity claim.

## Original Computer search-results address location — 2026-11-13 (CI VERIFIED)

- **Pinned behavior**: `legacy-win7/src/modules/apps/computer.js` computed `location()` renders `[this.$t("search-results")]` for classic Find, otherwise `[this.$t("search-results-in",[this.searchLocation])]`; `searchLocation()` uses the last label in source `getLocation(searchScope)`. Original `assets/locales/en-US.json` strings are **Search Results** and **Search Results in {0}**. Search labels are plain strings, unlike navigable breadcrumb objects.
- **Port**: `sourceExplorerAddress.ts` maps mounted VFS scopes to static source search location text without forging a `shell:search` filesystem path. `ExplorerApp` presents the search icon during an active or completed search and preserves the existing readonly address input, clickable breadcrumb paths outside search, progress overlay, navigation/history, and all other themes. `SourceWin7Breadcrumbs` now renders non-clickable source string locations.
- **Coverage added**: five unit/component checks (scoped paths, classic Find, root/Bin fallback, static accessibility), and desktop/mobile Chromium tests for standard and classic Find navigation and Clear results. Visual screenshot comparison and actual source address editing remain out of scope.
- **Verified**: [corrected opt-in CI 43388194580 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43388194580) at `1c231e5d8733631f73461d2cd8bb71de26b62ad2` with **253 Vitest tests (50 files), 238 Chromium desktop/mobile browser tests**, TypeScript, source audits and production Vite build green. Source behavior implementation at `958ad1bedf23d35e390fbfd017db907662092b04`; test matcher corrected at `f32718a699cdde13e9ff203ceb6f26a5844d684b` after the first [CI 43387619553](https://github.com/codersachin99/windows-os/actions/runs/43387619553) failed only the four new browser cases due to a double-escaped regular expression (234 other browser cases, all 253 unit tests passed). Corrected CI verifies the exact fixed tip. No pixel/screenshot comparison has been run; full original app parity remains pending.

- **Next source-backed task**: the pinned `src/modules/apps/computer.js#toolbar()` defines a real **Organize** menu (selection-gated Cut/Copy/Delete/Rename, explicitly disabled Undo/Redo/Select All/Layout/Options/Properties, and working Close), but the React Explorer currently renders a disabled Organize placeholder. Port its exact menu structure and enabled rules without inventing unsupported actions; review the extra Win7 Up button against `window-addressbar-nav`, then perform source/target screenshots. Avoid treating an editable address input as pending: source module `3b99` has none.

## Win7 Computer clickable breadcrumbs and address refresh — 2026-11-13 (CI VERIFIED)

- **Source**: `legacy-win7/src/modules/apps/computer.js#getLocation` produces clickable `Computer → disk → directory` pieces from runtime drive metadata. Source single-crumb special handling covers Bin and unknown/Computer roots. `theme-win7-scss.js` gives the 18px address icon, 22px breadcrumb line, 25px address field, and refresh hover/pressed gradient. `vue-app.css` gives the 25px refresh width.
- **Port**: `SourceWin7Breadcrumbs.tsx` builds mounted-URI-only breadcrumbs (not host paths), retains original percent-decoded display labels with unchanged raw URI navigation targets, and uses `ExplorerSession.open()` to preserve history. Refresh action calls existing `session.refresh()`. The existing read-only Folder address field is retained for accessibility and current test/contracts; on keyboard focus, it appears instead of the crumbs. Original 27px navigation sprites and search progress remain untouched. Other themes keep their previous address presentation. The refresh glyph is a functional SVG reconstruction, not a claimed byte-identical source icon.
- **Verification passed**: [opt-in CI 43381251702 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43381251702) at code SHA `bb7bf6c658ce07cc239b18d91bfdf51ded1bbf51`: **248 Vitest tests (49 files), 234 Chromium desktop/mobile tests**, TypeScript, original source/Contacts checks and Vite production build all passed. This includes five new breadcrumb unit/component checks and four new desktop/mobile browser cases. Screenshot/pixel comparison, editable address path, source search-results location labels, exact original refresh glyph asset, folder drop-downs and other apps remain pending. PR #1 remains draft, main unchanged, CI opt-in only.

## Win7 original Explorer navigation sprites — 2026-11-13 (CI VERIFIED)

- **Pinned original**: `legacy-win7@4e63290/src/modules/themes/theme-win7-scss.js`; extracted both original inline WebP data URLs unmodified (nav background and 27px four-row button sprite). Original source uses 27px normal (0), hover (-27px), active (-54px), disabled (-81px), and `scaleX(-1)` for Forward.
- **Port**: new `packages/apps/explorer/src/SourceWin7Navigation.tsx`, with the source graphics in Explorer CSS. Reuses `ExplorerSession.back()/forward()` and their existing history state, no rewritten navigation logic. Other themes continue to use their existing controls; keyboard focus remains visible. Up, the breadcrumb/path editing presentation, toolbar visuals and source-vs-React screenshot comparisons are still pending — this checkpoint does **not** certify entire Computer pixel parity.
- **Verified**: [opt-in CI 43377093491 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43377093491) at code commit `a6dc00a52da948cae3e24c5528ad33423a0f1437`. All **243 Vitest tests (48 files)** and **230 Chromium desktop/mobile tests** passed; TypeScript, source inventory audit, original Contacts source checks and Vite production build passed. The new unit tests and source sprite history browser test were included. Normal documentation updates skip CI; do not mistake this bounded navigation checkpoint for full pixel parity. PR #1 stays draft, `main` unchanged.

## Win7 addressbar progress + TSX test discovery — 2026-11-13, CI VERIFIED

- **Pinned original**: `computer.js` `window-addressbar(progress=searchProgress)` with null-on-finish; Win7 theme 25px location field and exact green progress gradient.
- **Code**: `SourceAddressProgress.tsx` renders ARIA 0–100 progress *inside* Explorer address field; full source gradient/geometry in `ExplorerApp.css`, separate search option-row progress removed. Four `SourceAddressProgress.test.tsx` tests cover null, clamp, percentage and SSR markup.
- **Verified coverage correction:** initial [CI 43373230742](https://github.com/codersachin99/windows-os/actions/runs/43373230742) passed 237 existing unit and 228 Chromium tests but silently excluded `.test.tsx`. After expanding the `vite.config.ts` glob to `.test.{ts,tsx}`, **[final opt-in CI 43374274437 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43374274437)** ran all **241 Vitest unit tests across 47 files**, including the four new TSX component tests, and **228 desktop/mobile Chromium browser tests**, plus TypeScript, source checks and Vite production build. Verified code SHA `f5e5cbd27c45eef52ea736d43a3e80e374b334a6`.
- **Remaining**: original decorated breadcrumb/navigation sprite states, source toolbar skin and actual source-vs-React screenshots. Keep PR #1 draft, main untouched, CI only on `[run-ci]` commits.

## Pinned Win7 addressbar search progress — 2026-11-13, CI pending

- **Source**: legacy `computer.js` binds fractional searchProgress to `window-addressbar` (0 on start, null on end), while `theme-win7-scss.js` defines 25px location height and exact green gradient `#e6fbe8 → #bbf9ca → #7ade96 → #89f097`.
- **Implementation**: moved status paint into Explorer address location control, preserved file search semantics; reusable `SourceAddressProgress` with safe 0–100 ARIA values, rounded/clamped numeric fraction and null disappearance. Source visual CSS matches original progress gradient; existing separate toolbar progress removed.
- **Tests**: four new component/unit tests plus desktop/mobile browser check for address wrapper and cleanup, existing full search regression preserved. **CI pending**, deliberate `[run-ci]` only.
- **Source trace**: `migration/SEARCH-ADDRESSBAR-SOURCE.md`. **Next**: verify tests, original breadcrumb/back-forward/refresh visual fidelity, screenshot comparison, then missing legacy apps. Draft PR, main untouched, no release.

## Source Computer cached search index and progress — 2026-11-13, CI VERIFIED

- **Pinned**: webpack `2e2c.b` caches `Map<uri, Promise<directoryList>>`, ignores `.meta`, invalidates keys matching changed directory/subtree and reports `scanned/discovered` fractional progress across roots. Source `computer.js` refreshes active searches on relevant invalidations.
- **Implemented**: `packages/filesystem/src/sourceSearchIndex.ts` per-Computer window, `searchFiles` optional `fraction` progress, Explorer cache lifecycle and automatic active-result refresh. The Guest VFS event bridge additionally invalidates containing folders when a single file changes; moves/trash/restore invalidate both old/new parents and subtree caches.
- **Tests**: nine new unit cases (including React StrictMode cleanup/reconnect), two Playwright scenarios exercised on desktop and mobile. **[Opt-in CI 43370515230 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43370515230)** at code SHA `2b17780fe2cf0a5c6a9dcb66d275828f25b5dfb6`: TypeScript, **237 Vitest tests across 46 files**, original source/Contacts checks, Vite production build and **228 Chromium desktop/mobile browser tests passed**. The live-refresh regression now passes on both devices.
- **Source trace**: `migration/SEARCH-INDEX-SOURCE.md`. **Next**: source original-window search controls/screenshot parity, broader Win7 skin fidelity and unported app/game modules. Two earlier CI attempts found stale test assumptions and a real StrictMode event listener defect; both were corrected and the final browser suite is fully green. PR draft, main untouched, no release.

## Original multi-disk Computer search — 2026-11-13, CI VERIFIED

- **Source:** Pinned `computer.js listSearch` / `2e2c.b` seeds `searchIndex.walk` with `in ? [in] : getStats().map(d => d.path)`. `in=` searches only mounted disks, *not* every child of `/EXTERNAL/computer`.
- **Implementation:** `sourceMountedSearchRoots(LegacyVolumeSession)` maps validated runtime metadata to Guest VFS mount roots, and `searchFiles({rootScopes})` scans disjoint roots, retains global source relevance ranking/progress/cancellation/trash skipping, rejects invalid/unmounted paths, returns empty for no mounts. `ExplorerApp` uses this for Find `shell:search?in=` and classic Search Dialog/Companion Computer scope, with explicit folder searches unchanged.
- **Tests:** new 5-case Vitest module covering real two-drive metadata, stray shell node exclusion, `sub=0`, zero/removed/missing drives, overlapping roots, cross-disk result ranking and cancellation; new desktop/mobile browser test exercises Find Now with Computer scope and ensures virtual shell siblings never appear.
- **Verified:** [deliberate opt-in CI 43366050095 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43366050095) on code SHA `b6cc1273d8b39648c908dd9c18a4d407d89da0cd`: TypeScript, **228 Vitest unit tests in 45 files**, source/Contacts checks, Vite production build and **224 Chromium desktop/mobile browser tests passed**. The new end-to-end scenario opens Find with Computer scope, finds a real mounted System C: folder and excludes a sibling virtual Computer node.
- **Previous verified:** [CI 43364173206 SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43364173206), **223 unit / 222 browser** tests.
- **Next:** original search listing cache and invalidation semantics (2e2c.b), source progress ratio and changed-file refresh, screenshot-level Windows 7 visual fidelity, then remaining original programs/games. Draft PR only, main untouched, no release.

## Original 5401 shell:search path and 0e9a/de73 type keys — 2026-11-13, CI VERIFIED

- **Newly located pinned source:** `src/modules/chunks/shared~plugin-embed~sandbox~system-cache~vue-app~vue-store.js` modules `5401`, `0e9a` and `de73`. The original search prefix is **`shell:search`**, not the provisional `win7-find:`; the exact query params are `q`, `in`, optional `name`, and `sub=0`.
- **Implementation:** `sourceSearchPath.ts` exact original prefix/query serializer/parser with canonical Guest-scope validation; `findQuery.ts` now writes original kind/size/dated tokens to `shell:search?`; Computer detects it, extracts scope and text filters and performs a source-ranked Guest VFS search. Existing migration-era `win7-find:` decode remains backward-compatible only. Exact `0e9a` + `de73` image/audio/video/document/playlist/program/link/webpage extension predicates replace provisional classifications. Specific source model tests added.
- **Prior verified checkpoint:** [CI 43362502506 SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43362502506) at `14ece9c5`: TypeScript, **215 Vitest tests across 42 files**, source checks/build and **220 desktop/mobile Chromium tests passed** for query grammar, relevance, highlights.
- **Verified:** [deliberate opt-in CI 43364173206 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43364173206), code SHA `2ca87d51db829b33fb74a189c5fe4c7a6e6785d0`: TypeScript, **223 Vitest unit tests in 44 files**, source inventory/Contacts checks, production Vite build and **222 desktop/mobile Chromium browser tests passed**. Browser verifies standalone Find's source `shell:search` result route and original folder-kind filtering. Initial source-path CI 43363988969 failed two outdated tests; repaired by asserting `.mhtml` webpage suffix and parsing `shell:search` instead of legacy JSON.
- **Next:** exact blank-scope `in=` multi-mounted-drive `searchIndex.walk(disks.map(path))` behavior, visual screenshots/skin comparisons and further unmigrated source apps. No CI needed for docs-only checkpoint; `main` unchanged, PR draft, no release.
- **No merge or release:** `main` untouched, PR #1 draft, CI opt-in.

## Source query lexer, metadata filters, relevance and highlighting — 2026-11-13, pending CI

- **Pinned source**: webpack `5985` and `2e2c` in shared search chunk, plus Computer `listSearch`. Lexer supports exact/quoted/typed filters, accent normalization and word starts; relevance exact > prefix > ordered match, with mtime tiebreak. Date, size, type and kind predicates are evaluated on Guest VFS only; results are ranked before the cap and highlight matches as escaped React text.
- **Implementation**: `packages/filesystem/src/sourceTextSearch.ts`, `search.ts` VFS integration, `findQuery.ts` ordering, Explorer name-highlights; source-specific unit/integration tests and desktop/mobile `search-relevance.spec.ts`.
- **Source guardrails**: no verified `5401.k` virtual search URI prefix, 0e9a original file extension helpers not yet pinned, no source full disk walker, screenshot comparisons pending. Preserve safe internal `win7-find:` URI and do not claim original URI exactness.
- **Verification**: **pending deliberate opt-in CI** on next `[run-ci]` commit. Prior source-theme search checkpoint remains green: [205 unit and 218 browser tests](https://github.com/codersachin99/windows-os/actions/runs/43357788138).
- **Next**: check CI, correct failures, update PR and source trace with verified results. Keep `main` unchanged, PR draft, no release.

## Source Search Dialog, Companion and theme dispatch — 2026-11-13, CI verified

- **Source:** `legacy-win7/src/modules/apps/search-dialog.js` module `fbbb` (parent-owned 360px, auto-height, close-only, initial `*.*`, start-from and subdirectories with OK/Cancel); `src/modules/apps/search-companion.js` module `7a5f` (inside Computer replacing navigation, filename/look-in, date/size/advanced collapse, Back/Search, original date/size presets). Pin `2e2c` file-kind keys `folder/document/picture/music/video/playlist/program/link/webpage`; `movie` exists in engine but is excluded from companion options.
- **Code:** distinct packages `apps/search-dialog` and `apps/search-companion`, shared `sourceSearchLocations` helper. Existing `ExplorerApp` owns both surfaces, searches the **same parent Computer session** using existing Guest virtual-file search/abort/status/progress, and navigates scope before displaying results. Standalone Find still opens a separate Computer results window. Source query kinds are mapped to virtual file extensions without host filesystem access.
- **Theme dispatch now source-pinned:** legacy `src/modules/runtime/vue-app.js` module `f3ad` maps XP/win2k to Companion, Win95/98 to standalone Find, Win31 to child Search Dialog, and default Win7 to **none of these classic surfaces**. `sourceExplorerSearchStyle` uses that mapping; DesktopShell passes theme through. Legacy `testmode.js`-style validated `?theme=winxp/win31/win95` overrides enable real browser coverage of those search layouts without implying full alternate theme skin parity. The pre-existing Win7 Advanced Find shortcut is still interim.
- **Prior verified checkpoint:** [opt-in CI 43356504452 SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43356504452) on earlier source UI integration commit `b850ab41`: TypeScript, **201 Vitest tests (38 files)**, source/Contacts checks, Vite build, **212 desktop/mobile Chromium tests passed**. Then the source theme map and source test-mode search scenarios were verified by [CI 43357788138 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43357788138) at code SHA `e7d50c74`: TypeScript, **205 Vitest unit tests in 40 files**, source/Contacts checks, Vite production build, **218 desktop/mobile Chromium browser tests passed**. The initial opt-in run failed TypeScript on two omitted Explorer theme imports; fixed in `e7d50c74` before this green run.
- **Remaining:** actual original file-type extension predicates from `0e9a`, source query URL format and relevance ranking, exact titlebar/auto-height screenshots, WinXP/Win31 full skins. Child dialog preserves CSS auto height; no host filesystem access.
- **Next:** original virtual search URL/weighted ranking and 0e9a file-type predicates, theme skin screenshot baselines, then unported original apps. PR remains draft, `main` unchanged, no release. Documentation-only commits skip CI.

## Windows 7 Find migration — 2026-11-13, CI verified

- **Source:** pinned `src/modules/apps/find.js` 709f, shared `16d5` filename/search grammar, `cf89` scope options. Separate Find window `window-find` **480px wide**, non-resizable, **Minimize allowed / Maximize hidden**, exact legacy search image SHA `c19ea92cfd1e71f1eb5aab87b003330d999dd3b4`. Standalone original `h=auto` is currently approximated with 350px; image/skin screenshot parity remains open.
- **Implemented:** independent `packages/apps/find` three-tab Name & Location / Date Modified / Advanced React app, source date/size/name/subfolder defaults, disabled original Stop, Find Now and New Search. `packages/filesystem` source wildcard, comma/semicolon list, substrings, `name.*`, date, size and file-kind filters work on genuine Guest VFS; `win7-find:` is a safe internal query path and is **not passed to host storage**. Source Find Now opens a **separate Computer search results window**, with original scope preserved, while regular Explorer search remains unchanged. Explorer advanced link and Windows+F shell entry are present. Source-dialog/companion and theme-driven selection were implemented in the later milestone above; remaining screenshot/theme skin details still pending.
- **Regression:** four new source query tests, two Find form tests, two desktop/mobile Chromium e2e scenarios (4 browser checks), including actual search results in Computer, 3-tab source controls/reset, and original 480px desktop window.
- **Verified:** [deliberate opt-in CI 43297733943 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43297733943), code commit `c14738f0`: TypeScript, **194 Vitest unit tests in 35 files**, pinned source/Contacts checks, production Vite build, **208 Chromium desktop/mobile tests passed**. Prior [CI 43296396579](https://github.com/codersachin99/windows-os/actions/runs/43296396579) passed all but two new tests with ambiguous `All files` locator; corrected by exact source radio label before final green run.
- **Next:** source-dispatch differences between Find, `search-dialog.js` and `search-companion.js`, then source-based screenshots/theme-by-theme parity. See [Find trace](migration/FIND-SOURCE.md) and [search surface roadmap](migration/SEARCH-UI-ROADMAP.md). Original auto-height, precise source file-kind taxonomy, source virtual query encoding, locale, and pixel parity remain unverified. Keep PR #1 **draft**, `main` unchanged, no release; opt-in CI on `[run-ci]` only.

## Original Windows 7 Task Manager — 2026-11-12, CI verified

- **Pinned source:** `legacy-win7/src/modules/apps/taskmgr.js` module d64a, `src/styles/system/taskmgr.css`, source `c170.d` program list = original non-hidden source IDs. Source window id `window-taskmgr`, height 450 and inherited default width, Minimize allowed but **Maximize hidden**. [Source trace](migration/TASKMGR-SOURCE.md).
- **Implemented:** independent `packages/apps/taskmgr/src` model/React/CSS and tests. SDK registers source hidden ID `taskmgr` with original byte-identical icon `taskmgr.af82f08f.webp` SHA `283ae31c9bed33c50621b822aef65f8ee01d4a79`. Engine restores one singleton on repeated Run command `taskmgr.exe` or `C:\Windows\System32\taskmgr.exe`. Source only specifies height, so current 560px shared-shell default width is explicitly a **visual parity assumption**.
- **Behavior:** original Applications/Processes/Services tabs and columns, source simulator window list with 16px icons/Running status and selected **End Task**; Processes list from pinned non-hidden c170 program set with source ID.exe, username Guest, Running/Stopped, source fixed `0 MB`, selected Start/End Process; Services shows None and disabled Services button. Existing but unported source programs are shown as Stopped but cannot be fake-launched; no host process/PID/memory access.
- **Safety:** every application closure routes through existing `requestClose`; Notepad with unsaved work must present its normal Save/Cancel dialog. With multiple windows of one app, End Task targets selected window ID, End Process closes one matching instance. Source paths stay inside app registry and simulator.
- **Regression:** seven source-model tests (source columns, non-hidden process ordering, duplicate/minimized windows, controls), two engine window/singleton tests, five desktop/mobile Chromium scenarios including actual Calculator start/end and dirty-Notepad protection. **Verified:** deliberate opt-in [GitHub Actions 43278169231](https://github.com/codersachin99/windows-os/actions/runs/43278169231) **SUCCESS**: TypeScript, **188 Vitest unit tests across 33 files**, pinned original-source/Contacts checks, production Vite build, and **204 desktop/mobile Chromium browser tests passed**. All five new Task Manager e2e scenarios passed, including protected unsaved Notepad and real Calculator process start/stop. **Next priority:** source-faithful file search dialogs and visual baseline comparison, followed by remaining original apps/games/themes.
- **Remaining:** original inherited width, CSS screenshot fidelity, non-English/theme variants, large Paint/WordPad/Command Prompt and other source applications. Keep PR #1 draft and main unchanged, no release. CI only on `[run-ci]` or workflow_dispatch.

## Original Windows 7 About dialog — 2026-11-12, CI verified

- **Pinned source:** legacy-win7 `src/modules/apps/about.js` component 52fa: `window-about` 520×400, centered, non-resizable, **no Minimize or Maximize**, **no titlebar icon**. Exact source Windows® 7 Simulator heading, 44px classic brand image, version/legal/description text, link row Privacy Policy / Changelog / Report bugs and Credits button. [Detailed source map](migration/ABOUT-SOURCE.md).
- **Implemented:** independent `packages/apps/about/src` React module, APP_CONFIG link model and CSS. SDK appRegistry registers source ID `about`, 520×400 centered close-only and original taskbar brand; shared WindowFrame handles `titlebarIcon:false` without changing other app chrome. Engine reuses one original fixed-ID About window. Original c170 source Run commands `winver`, `winver.exe`, full `C:\Windows\System32\winver.exe` path open the migrated module.
- **Link/security fidelity:** read exactly five source `window.APP_CONFIG.getUrl()` keys (`url`, `privacyUrl`, `changelogUrl`, `reportIssue`, `creditsUrl`). Only explicitly configured HTTPS destinations are navigable; missing values appear as unavailable rather than fabricated URLs. Credits launches configured URL in a separate, noopener/noreferrer window. Historical version exporter webpack 9224 unresolved; show **current target package version** (0.0.1) and record the difference rather than guessing source version.
- **Regression:** `packages/apps/about/src/model.test.ts` validates source config keys, HTTPS/unsafe-scheme rules and missing/throwing key cases; two engine tests check original geometry/center and singleton; `tests/e2e/about.spec.ts` has five desktop/mobile cases for source layout/content/titlebar, missing links, configured URLs and Credits, full Run alias and singleton. **CI verified:** deliberate opt-in [GitHub Actions 43273716820](https://github.com/codersachin99/windows-os/actions/runs/43273716820) **SUCCESS**: TypeScript, **179 Vitest unit tests across 32 files**, pinned original-source/Contacts checks, Vite production build, and **194 desktop/mobile Chromium browser tests passed**. All five new About e2e scenarios passed. Next: source-audit additional Win7 programs and continue visual screenshot/theme parity; historical webpack 9224 version and some CSS pixel differences remain open.
- **Boundary:** source artwork already matched pinned Git blob; visual screenshot/pixel parity, historical version and large remaining legacy programs/themes are not complete. Keep feature PR #1 draft and `main` unchanged, no release.

## Original Windows 7 Magnifier — 2026-11-12, CI verified

- **Source:** original pinned legacy-win7 `src/modules/apps/magnifier.js` + `src/styles/apps/magnifier.css`; WindowMain `window-magnifier`, 260px wide and source `h="auto"`, resizable=false but **Minimize allowed**. Two 32px +/- buttons change scale by 0.5 with 1–16 clamp; 100% to 1600% percent label; Views, Settings and Help disabled. Transform origin tracks document mouse on non-touch, remains 0% 0% on touch, and resets on close. [Detailed source trace](migration/MAGNIFIER-SOURCE.md).
- **Implemented:** isolated `packages/apps/magnifier` model, React toolbar/CSS; source registered in SDK appRegistry (also `Magnify.exe` through Run), engine singleton source ID, and shared WindowFrame `minimizable` property independent of resizability. Exact source `magnifier.66b65661.webp` Git SHA `59096a4827ae21e31470ac5e185721be423d5186` and `help.a34353ca.webp` SHA `370310e69cbe2cce67a8a34a737b9262f1593d44`.
- **Zoom adapter:** shared desktop canvas contains wallpaper, icons, regular windows and Start menu; zoom origin matches source pointer/viewport percentage on desktop, 0/0 on touch. The unzoomed Magnifier toolbar and taskbar stay reachable at source max 16x; close/unmount clears scale and unhooks mousemove. This intentionally differs from original's direct getDesktopContainer DOM target; original h=auto currently approximated as 86px, so pixel-parity remains incomplete.
- **Coverage:** five new pure unit tests, two engine window tests, five desktop/mobile Playwright browser tests for source controls, actual window/icon scaling, 1x/16x, pointer/touch origin, minimize/restore/close/reset and `Magnify.exe` launch.
- **Verified:** deliberate opt-in [CI 43268254941](https://github.com/codersachin99/windows-os/actions/runs/43268254941) **SUCCESS**: TypeScript, **173 Vitest unit tests in 31 files**, source/Contacts checks, production Vite build and **184 Chromium desktop/mobile browser tests passed**, including all five new Magnifier e2e scenarios. Previous Sticky Notes [CI 43249454264](https://github.com/codersachin99/windows-os/actions/runs/43249454264) was 166 unit + 174 browser. **Next:** source-trace the original About window (`src/modules/apps/about.js`) and continue exact screenshot/theme parity and remaining applications. Magnifier zoom canvas intentionally leaves taskbar/toolbar unscaled and source h=auto is approximated; do not call the entire product pixel-identical. PR #1 remains draft, `main` untouched; no release.

## Original Win7 Sticky Notes (2026-11-12) — CI verified

- **Source:** pinned `src/modules/apps/stickynotes.js` (source Vuex key `sticky`, fragment `window-sticky`, 200×200 default centered yellow, 6-color random add, 8-way drag/resize min 150×100, focus-last, close-last app), `src/styles/apps/stickynotes.css`, source `src/modules/system/testmode.js` webpack 2299 exact palette export `b`. [Detailed source map](migration/STICKY-NOTES-SOURCE.md).
- **Implementation:** new `packages/apps/sticky/src` isolated React app, model, CSS, tests. Shell registers one taskbar/Start menu `sticky` app with exact source `sticky.e63cea5a.webp` and `stickynotes-add.bfbefc41.webp`/`stickynotes-close.80b2c95a.webp` (three exact matching source Git blobs); renders standalone notes **outside** generic WindowFrame, preserving independent desktop drag/focus/resizing and minimized lifecycle. Engine deduplicates OPEN_APP into one existing app window. Run command `StikyNot.exe` now launches actual migrated Sticky Notes.
- **Data:** Guest storage `windows-os:legacy-sticky:guest:v1` retains source `{notes:[{x,y,w,h,color,content}]}` fields, transient ids excluded. Initial yellow note, source palette `#c3f3fa/#c8fec0/#f9ccf8/#d2d7fc/#eaeaea/#fffeb3`; 600ms text debounce, add/remove and completed gestures persisted immediately, corrupt saved data surfaced. Responsive viewport guards prevent offscreen desktop scrolling.
- **Tests committed:** nine Sticky note model tests, shell singleton test and five new desktop/mobile Chromium Sticky Notes tests for original icons/color/layout, add/text/reload, pointer drag/resize persistence, minimize/restore/last-close and Run launch. Exact original CSS shadow/Segoe Print styling mapped. **Verified:** first opt-in [run 43249169205](https://github.com/codersachin99/windows-os/actions/runs/43249169205) caught a browser timer-vs-NodeJS type mismatch; fixed in `3f3b9301`. Deliberate [CI rerun 43249454264](https://github.com/codersachin99/windows-os/actions/runs/43249454264) **SUCCESS**: TypeScript, **166 Vitest unit tests in 30 files**, original-source/Contacts checks, Vite production build, and **174 desktop/mobile Chromium browser tests passed**, including all five new Sticky Notes scenarios. Next original source vertical slice: Magnifier (`src/modules/apps/magnifier.js`, source 260px non-resizable controls, 1×–16× scale) or source About dialog, followed by broader theme/screenshot parity.
- **Remaining:** precise original per-pixel screenshots, source RTL behavior, additional missing Win7 apps (notably Paint/WordPad), and complete theme parity. Keep draft PR, no release/merge, CI only via `[run-ci]`.

## Original Win7 Run dialog, command resolution and shell keybinding (2026-11-12) — CI verified

- **Source anchors:** pinned `legacy-win7/src/modules/apps/run.js` 9756-byte webpack bundle: WindowMain id `window-run`, `resizable: false`, `w: 450`, `h: 220`, `location: "bottom left"`, Run icon, Open text field auto-focus, Return/OK, Cancel, source `Object(b["d"])(input)` program resolution and retryable error. Manifest c170 extracted from original source `src/modules/system/testmode.js`, non-clean variant. [Run implementation/source trace](migration/RUN-SOURCE.md).
- **Code:** new independent `packages/apps/run/src/` React app: `RunApp.tsx`, `RunApp.css`, `model.ts`, `index.ts`, separate tests. SDK appRegistry entry `run` with original Win7 **450×220 bottom-left non-resizable** contract; shared engine placement extended with optional `location:"bottom-left"` preserving ordinary cascade and centered Wizard. App imported into DesktopShell, Start menu launch, Windows+R keyboard shortcut, Enter/OK, Escape/Cancel, focus recovery and error state. Pinned original `run.cf7c0332.webp` copied byte-identically from source **blob 6f669cbb5865e3c342d2f8b16c86051acd63e861** and mapped in legacyArt.
- **Resolution:** source `sourceProgramManifest.json` IDs, aliases and installed executable stems, plus explicitly manifest-matching drive-C paths; no unapproved shell command or arbitrary local paths. Only already-registered migrated apps actually open. Recognized unported apps (e.g. Paint/Command Prompt) display an explicit migration-pending state rather than a fake window; unknown commands display the original-style retryable error.
- **Regression:** `packages/apps/run/src/model.test.ts` source aliases, exe/cpl filename cases, C-drive executable path and host-command/path rejection. `packages/engine/src/index.test.ts` original bottom-left placement and viewport clamping. `tests/e2e/run.spec.ts` covers Run size/asset/control/focus, calculator and Notepad launches, unknown retry, unported Paint error and Windows+R/Escape on desktop/mobile Chromium.
- **Verified:** opt-in [GitHub Actions 43242039487](https://github.com/codersachin99/windows-os/actions/runs/43242039487) **SUCCESS**: TypeScript, **156 unit tests in 29 Vitest files**, original-source/Contacts checks, Vite production build, **164 desktop/mobile Chromium browser tests passed**. All six new Run browser scenarios passed. **Next:** rebuild original source `src/modules/apps/stickynotes.js` persistent note model, colors, positioning, add/remove, source note drag/resize; continue screenshot-perfect Run and theme styling. This dialog is not Paint, CMD or WordPad parity, and original theme/layout screenshot comparisons are still incomplete. PR #1 must remain draft, `main` unchanged and no product release.

## Atomic browser File imports — Guest Explorer + Desktop (2026-11-12) — CI verified

- **Original source:** pinned `legacy-win7/src/modules/apps/computer.js` File drop parsing and `src/modules/system/main.js` Desktop `_parse(...,desktopPath)` UI behavior. This is a source-behavior-preserving filesystem correctness milestone, not a redesign.
- **Implementation:** `packages/filesystem/src/drag.ts` retains host File name, target folder and duplicate preflight but now decodes all text/binary File payloads **before any write**. `VirtualFileStore.createFilesAtomic` then revalidates each target against the current Guest store to avoid overwriting concurrent creations, stages complete contents with original bytes, commits **one** persisted VFS snapshot, and only then notifies per-file subscribers. Quota failure or File decode failure leaves every destination absent and existing files unchanged, without partial notifications. The function is create-only. Production Explorer Upload, Explorer folder-row drop, Desktop background drop and Desktop folder icon drop all use this path.
- **Tests:** new `packages/filesystem/src/importAtomic.test.ts` covers UTF-8 and binary round trip, one-write transaction and reload persistence, injected quota failure and retry, browser File decode interruption, collisions, filename validation, concurrent target creation and bad direct API data. New `tests/e2e/atomic-import.spec.ts` asserts one persisted write for mixed selections, failed upload creates no partial file and retries successfully, and Desktop external File drop saves complete mixed payload. Desktop/mobile Chromium projects. [Implementation map](migration/ATOMIC-HOST-IMPORT.md).
- **Boundaries:** adapters without `createFilesAtomic` still use sequential fallback; production mounted VFS is atomic. Source apps/themes, visual screenshot checks and touch accessibility still pending. **Verified:** deliberate opt-in [CI 43231526749](https://github.com/codersachin99/windows-os/actions/runs/43231526749) passed TypeScript, **150 Vitest unit tests across 28 files**, original-source/Contacts checks, Vite production build and **152 Chromium desktop/mobile browser tests**. Every new external-File import regression passed. Keep PR draft; main unchanged.
- **Next source vertical slice:** original `src/modules/apps/run.js` 450×220 non-resizable Run dialog, source command/alias resolution and error message. Source `stickynotes.js` persistent note positions/content/colors is another bounded target. Paint `paint.js` (~818 KB bundled source) is substantially larger; do not substitute generic drawing/iframe and declare parity. Full product appearance/functionality is not yet migrated. See source and PR scope before work.
- **Previous checkpoint:** [CI 43221928672](https://github.com/codersachin99/windows-os/actions/runs/43221928672) passed 143 unit and 146 browser tests for atomic Guest-to-Guest moves/copies and native Desktop folder/Bin drops.

## Atomic shell transfer and native Desktop folder/Bin icon drop checkpoint (2026-11-12) — CI verified

- **Source:** pinned `src/modules/apps/computer.js` FileCopy/FileMove, `src/modules/system/main.js` Desktop icon drop, Recycle Bin `trashMany`. Extend the existing VFS instead of inventing another filesystem or replacing the Windows 7 visuals.
- **Implemented:** `VirtualFileStore.transferMany` stages all selected root and child copy/move mutations into one new VFS map and makes exactly one persisted snapshot write. Failed storage persistence leaves *every* source and target unchanged, without notifying subscribers; success publishes all affected root notifications after commit. `transferFiles` delegates to batch API for mounted store (generic non-batch adapter fallback remains legacy/non-atomic). Explorer, Desktop pointer/native drag, and clipboard cut/copy all reuse this. TXT, binary, nested directories and case-preserving metadata maintained.
- **Tests:** `transferAtomic.test.ts` verifies one storage write for multi-root copy/move, byte-for-byte data, fail-closed simulated quota exceptions, no notifications/partial targets on failure, retry, clipboard cut remains prepared; `desktopNativeDrop.test.ts` verifies allowed source-backed folder icons, trusted-only Bin and rejection of invalid MIME/system icons.
- **Desktop icon drops:** `DesktopIcons.tsx` adds native HTML dragover/drop on *real file-backed directory icons* via `fileDragSession.drop` (move/Ctrl-copy) or existing host File import parser; on builtin Bin icon uses in-process drag token + source `trashMany` only, never a host-uploaded File. Folder/Bin hover states do not interfere with pointer repositioning, Desktop background drop or selected source files. `tests/e2e/explorer-desktop-icons.spec.ts` covers folder move, copy/collision, group Bin recycle/restore, host File import/rejected bin payload across desktop/mobile.
- **Source/limitations:** [Detailed implementation map](migration/ATOMIC-TRANSFER-DESKTOP-ICONS.md). Multi-File host uploads are not yet atomic under quota failure, but existing Guest-to-Guest transfers are. Missing source apps, visual screenshots and mobile touch remain pending. **Next:** atomic multi-File external upload and original Win7 UI screenshot/asset parity; avoid implying whole legacy application migration is complete. **First opt-in [CI 43221750218](https://github.com/codersachin99/windows-os/actions/runs/43221750218) stopped at TypeScript**: optional Bin token expression could evaluate to an empty string. Fixed in `43d3ed51` with explicit null fallback. **Verified:** the deliberate [CI rerun 43221928672](https://github.com/codersachin99/windows-os/actions/runs/43221928672) passed TypeScript, **143 Vitest tests in 27 files**, source/Contacts checks, production Vite build, and **146 desktop/mobile Chromium browser tests**. The original typed guard was fixed; no filesystem assertions were weakened. Keep PR #1 draft and `main` unchanged.

## Guest Desktop ↔ Explorer folder/file drag/drop checkpoint (2026-11-12) — CI verified

- **Original source:** pinned `src/modules/system/main.js` desktop pointer selection/drag and `src/modules/apps/computer.js` Explorer folder/drop workflows. The React cross-window pointer bridge is a bounded shell feature reconstructed from those original primitives, not a fabricated host filesystem integration.
- **Implemented:** topmost-Explorer-directory hit testing in `packages/ui/src/desktopExplorerDrop.ts`, pointer-controlled Guest Desktop group drag into current Computer contents or a visible directory row, destination highlighting, and a shared `fileDragSession` token. Ctrl/Meta-drop copies, normal release moves; desktop selection and file clipboard remain independent. Windows overlaid on target folders, Recycle Bin windows and system icons cannot act as ordinary file transfer targets.
- **Safety:** existing source `transferFiles` preflights full selection and rejects missing files, same directory/nested folders and collisions without overwriting VFS entries. Cancel/blur cleans pointer session/highlight; no local host file access. Multi-item storage quota failure can still result in partial copy/move and remains separate filesystem work.
- **Code:** `b0636814` hit detector + unit tests, `7979c931` Desktop/Explorer integration, `53914003` browser tests and docs. `tests/e2e/desktop-explorer-drop.spec.ts` covers move, Ctrl-copy/collision, multi-selection folder-row drop and same-directory guard on desktop/mobile Chromium. **Verified:** opt-in [CI 43213708078](https://github.com/codersachin99/windows-os/actions/runs/43213708078) passed TypeScript, **134 Vitest tests (25 files)**, source/Contacts checks, production Vite build and **138 desktop/mobile Chromium browser tests**; the full product is not parity-complete. [Detailed map](migration/DESKTOP-EXPLORER-DROP.md).
- **Reverse transfer:** `098f8869` mounts Explorer native `SHELL_DRAG_TYPE` and host File drops on empty Desktop background, using the same mounted Guest `desktopPath`. Default move, Ctrl/Meta copy, group selection, no overwrite; host dropped files preserve .txt text and binary payloads with `importDroppedFiles`. Browser tests `explorer-desktop-drop.spec.ts` cover move/copy/collision/group and external File drop. [Reverse mapping](migration/EXPLORER-DESKTOP-DROP.md).
- **First opt-in CI:** [43210729342](https://github.com/codersachin99/windows-os/actions/runs/43210729342) passed TypeScript, 131 Vitest unit tests (25 files), source checks and Vite build; **128/130 Chromium desktop/mobile browser tests** passed. Two new mobile tests failed while using a fixed geometric drop point on the responsive Explorer contents pane; group-folder row and all desktop tests succeeded. The browser helper was changed in `d307bee3` to select an unobscured hit cell. **Second opt-in [CI 43211904291](https://github.com/codersachin99/windows-os/actions/runs/43211904291):** TypeScript, 131 unit tests and **136/138 browser tests** passed; the same two mobile cases failed, while all reverse-direction drags passed. Playwright trace screenshots pinpointed the root cause: tapping the right-side Documents navigation horizontally panned the whole mobile page, leaving the desktop icon at **x = −63** (test pointer start **x = −44**). A verified target point cannot help when the source press starts outside the viewport. `sourceWindowPlacement` now clamps non-resizable/cascaded windows to the actual viewport and prevents dragging a window beyond its right edge; mobile shell CSS allows a narrower window width. Three new geometry unit tests and an e2e `window.scrollX===0` assertion protect the fix. **Final opt-in [CI 43213708078 — PASS](https://github.com/codersachin99/windows-os/actions/runs/43213708078):** 134 unit tests and all 138 Chromium desktop/mobile tests passed. The responsive fix was the actual resolution; no file transfer guards or assertions were weakened.
- **Next priorities:** atomic multi-item transfer under storage quota failures; native Explorer → desktop folder/Bin icon drops, source screenshot matching, mobile touch and keyboard accessibility. This bidirectional slice is verified, but the original full desktop/Computer modules are **still in-progress**. Original `main.js` and `computer.js` remain in-progress, PR draft; do not merge/release.

## Original Shortcut Wizard Browse/Finish React checkpoint (2026-11-12) — CI verified

- **Pinned source:** `legacy-win7/src/modules/shell/shortcutwiz.js` webpack module `a8a1` (window-main 550×400; browse second window; allProgramItems selection; Finish/Cancel; JSON `{exe,icon}` shortcut), and `src/modules/system/main.js` desktop New→Shortcut dispatch.
- **React implementation:** registers hidden-from-Start `shortcut` in shared SDK app registry with a **centered non-resizable 550×400** window. `DesktopShell` mounts reusable `ShortcutWizard`; `DesktopIcons` dispatches OPEN_APP instead of rendering the earlier HTML-select placeholder. The wizard has a separate accessible Win7-style Browse portal window, source program row selection/double-click, disabled OK/Finish before selection, Escape/Cancel, editable final label, and mounted Guest Desktop file creation. WindowFrame/engine honor source disabled maximize/minimize for non-resizable windows.
- **Source data/safety:** source-pinned `sourceProgramManifest.json` installed programs (including not-yet-ported apps, visibly marked pending) are valid selection targets. User-supplied host executable paths are never accepted. `createSourceDesktopShortcut` reuses original `.lnk` JSON and now generates collision-free ` (2)`/higher suffixes, using create-only VFS writes without overwriting existing files. The prior strict collision behavior remains opt-in for API consumers.
- **Tests:** `packages/ui/src/shortcutWizardModel.test.ts`, extended `desktopCreate.test.ts`, and `tests/e2e/shortcut-wizard.spec.ts` for Browse, disabled actions, program selection, double-click, Cancel/Escape, persisted Calculator shortcut, duplicate suffix, and unported Paint fallback; old temporary chooser e2e cases removed. **Verified:** the deliberate opt-in [CI 43207440829](https://github.com/codersachin99/windows-os/actions/runs/43207440829) passed TypeScript, **127 Vitest tests in 24 files**, original-source/Contacts checks, Vite build and **122 Chromium desktop/mobile browser tests**. First CI 43207251092 exposed a TypeScript local `window` shadow; resolved in `ae986191` and fully reverified. Exact screenshot/theme parity remains outstanding.
- **Source assets:** commit `f85ce131` restored the original **Shortcut, Calculator, Notepad, File, Folder, Paint** icon blobs with byte-identical pinned Git SHAs. Wizard titlebar, pending Paint option and desktop file icons now reference tracked images instead of missing URLs. [Asset inventory](SHORTCUT-ICON-ASSETS.md). This asset-only follow-up was not accompanied by a redundant new CI run; source and target blob hashes were directly compared.
- **Next:** desktop ↔ Explorer drag/drop of real Guest VFS files, original window/menu visual parity screenshots, wizard source runtime list ordering and localized labels.
- **Remaining exact-source gaps:** source uses runtime `allProgramItems` ordering/icons/localization; current browser list uses pinned installed manifest and fallback generic icons, and pending apps remain unported. Native original browse window exact screenshot/theme matching and Control Panel legacy special-case need follow-up. Original `shortcutwiz.js` and overall `system/main.js` remain `in-progress`, not `verified`. Preserve draft PR, no merge/release. See [SHORTCUT-WIZARD-SOURCE.md](SHORTCUT-WIZARD-SOURCE.md).

## Desktop file clipboard and confirmed Delete checkpoint (2026-11-12) — CI verified

- **Pinned source:** original `src/modules/system/main.js` desktop item Cut/Copy menu, background Paste, Ctrl+A/Delete selection behavior and `getShortcut(path)` mapping. The app's actual Guest Desktop path, file selections, Recycle Bin and shared Explorer clipboard are reused.
- **Implemented:** `packages/ui/src/desktopFileActions.ts` turns selected desktop IDs into real VFS paths, excluding system icons. `DesktopIcons.tsx` offers context Cut/Copy, background Paste, Ctrl/Meta+C/X/V, and confirmation-based Delete for one or multiple items. `FileClipboard` is shared with Explorer; `VirtualFileStore.trashMany` atomically recycles a selected group. The clipboard does not touch host files or override rename/Notepad/Explorer input.
- **Tests:** `desktopFileActions.test.ts` validates paths and cross-directory copy/cut/no-overwrite; `tests/e2e/desktop-clipboard.spec.ts` checks source-style Desktop→Explorer and Explorer→Desktop flows, context menu copy, filename collisions, Delete cancellation/confirmation and protection of builtin icons in Chromium desktop/mobile configurations.
- **Commits:** `6b3c062e`, `a338d222`, `15b0dea0`, and `90166c46`. **Initial opt-in CI 43201772163:** 124 unit tests passed; two desktop/mobile browser failures were the pre-existing right-click Delete test's immediate-deletion expectation. The behavior now correctly confirms deletion; legacy browser fixture updated in `afc53ef1`. **Verified:** the deliberate [CI rerun 43202578182](https://github.com/codersachin99/windows-os/actions/runs/43202578182) passed TypeScript, **124 unit tests in 23 Vitest files**, source inventory and Contacts checks, Vite build, and **116 desktop/mobile Chromium tests**. Previous completed CI [43198433398](https://github.com/codersachin99/windows-os/actions/runs/43198433398) passed 121 unit / 106 browser tests. [Detailed source mapping](migration/DESKTOP-CLIPBOARD.md).
- **Next source-traced feature:** implement original [Shortcut Wizard Browse/Finish UI](SHORTCUT-WIZARD-SOURCE.md), then cross-window desktop/Explorer drag/drop and source visual screenshots.
- **Still pending:** source's exact same-folder file duplication suffix policy; selected-item properties, comprehensive keyboard scopes/themes, original shortcut wizard and source visual acceptance. Keep `system/main.js` in-progress and PR draft; do not merge/release.

# WindowsOS conversion — implementation handoff

**Canonical source:** `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`  
**Target:** `codersachin99/windows-os`, `feat/0001-faithful-react-foundation`  
**PR:** https://github.com/codersachin99/windows-os/pull/1 (draft; not merged)  
**Status:** the first React application slice is working and CI-tested; **the full product is not migrated or release-ready**.

## Desktop file/group drag to Recycle Bin checkpoint (2026-11-12) — CI verified

- **Source:** pinned `legacy-win7/src/modules/system/main.js` desktop shortcut drag gestures and Bin drop/TrashAdd flows, reusing the active session `trashPath` and native Explorer-backed Bin (not moving files in host OS).
- **VFS:** `VirtualFileStore.trashMany` performs multi-item preflight (duplicate, missing, nested ancestors, root/trash guards) and moves selected files/directories, descendants and original-path metadata in **one persisted snapshot**. A failed save leaves every source unchanged, avoiding partially recycled multi-selection. Existing `trash` delegates to the same core, and subscribers get source-path notifications after commit.
- **Desktop UI:** pointer release over the unobscured Bin shortcut recycles selected Guest VFS files. The original 4px gesture threshold and existing icon movement remain in use; Bin highlights as a drop target. System icons cannot be recycled and drop over an app window is rejected. Bin and Explorer see live file changes and restored items reappear on the desktop.
- **Code:** `4cc1f46d` (atomic source filesystem batch + unit tests) and `3016fd28` (desktop hit detection/interaction + desktop/mobile browser cases). **Verified:** opt-in [CI 43198433398](https://github.com/codersachin99/windows-os/actions/runs/43198433398) passed TypeScript, **121 unit tests in 22 files**, original-source/Contacts checks, production Vite build, and **106 desktop/mobile Chromium tests**, including individual and group Bin drops. Tests: `desktopTrash.test.ts`, `desktopDrop.test.ts`, `desktop-bin-drop.spec.ts`.
- **Remaining:** native drag from desktop into arbitrary Explorer folder, drag-out, shortcut wizard parity, complete source drag behavior on touch and visual screenshot matching. The original `system/main.js` is still `in-progress`. See [DESKTOP-BIN-DROP.md](DESKTOP-BIN-DROP.md).

## Desktop New submenu checkpoint (2026-11-12) — CI verified

- Source-traced original `legacy-win7/src/modules/system/main.js` background New submenu: Folder, Shortcut, Rich Text Document, Text Document. Source Shortcut opens a dedicated application wizard (not yet ported), so React currently uses a limited inline chooser for installed and already migrated apps; full original wizard and all program choices are **not** claimed complete.
- New `packages/ui/src/desktopCreate.ts` uses the active Guest `desktopPath`, source JSON `{exe,icon}` .lnk serialization, collision-safe default names and strict target/filename validation. Shared `VirtualFileStore.createFile` is create-only, never overwriting another user's item when competing with a file creation. Folders, UTF-8 TXT and minimal valid RTF persist as real VFS items. Rich-text editing/WordPad remains unported.
- UI `DesktopIcons.tsx` exposes the source menu, quick item creation with automatic F2-like rename, and a shortcut selector limited to source-installed programs already registered as working React apps. No host executable or arbitrary path is launched. Tests in `desktopCreate.test.ts` and `tests/e2e/desktop-create.spec.ts` cover persistence, Notepad/Calculator integration, duplicate names and invalid shortcuts.
- **Code commits:** `a9c6b368` (file contracts/tests) and `84620792` (menu/wizard/browser cases). **Verified:** opt-in CI [43197537081](https://github.com/codersachin99/windows-os/actions/runs/43197537081) passed TypeScript, unit tests, source audit, Contacts fidelity, Vite build and Chromium desktop/mobile browser tests. Previous bounded rename checkpoint passed [43191657508](https://github.com/codersachin99/windows-os/actions/runs/43191657508).
- **Next:** fix any CI findings, then implement source-aligned dragging Desktop file(s) onto the Recycle Bin icon, further shortcut wizard and original legacy visual/theme parity. Do not mark `system/main.js` fully verified, merge this draft PR, or release yet. See [DESKTOP-CREATE.md](DESKTOP-CREATE.md).

## Checkpoint: shared filesystem substrate (2026-11-12)

- **Commit:** [8f09f912](https://github.com/codersachin99/windows-os/commit/8f09f912011c042cfc80298ebc297c5809f47071); **PR Chromium/TypeScript/unit/build CI:** [43089881176](https://github.com/codersachin99/windows-os/actions/runs/43089881176), passed.
- **Implemented:** `packages/filesystem` source-style absolute URI paths; typed `list`, `stat`, `read`, `write`, `mkdir`, `remove`, `copy`, `move`, `isExisting`; metadata including UTF-8 text byte size; persistent Guest browser store; SDK singleton `packages/sdk/src/files.ts`. Seven new unit cases cover paths, nesting, errors, copy/move, storage recovery and write failure.
- **Limitations:** only text files/directories; source disks, binary/media, permissions, account-specific volumes, shortcut metadata, trash, search and file-dialog behavior are **not** implemented. This core is not yet connected to an authentic Computer/Explorer or Notepad UI.
- **Source references:** original `src/modules/apps/notepad.js` uses `read(path,true)`/`write(content,path)`/`getParentDirectory(path)`; `computer.js` uses `uri`, `type`, `mtime`, `size`; `cmd.js` uses `fs.list/read/stat` with drive-letter mapping. See [FILESYSTEM.md](FILESYSTEM.md).
- **Drive-path follow-up:** commit [909a4f13](https://github.com/codersachin99/windows-os/commit/909a4f13a24e48c534d6c4a16fc21bd65cb8aab2) ports the source CMD drive-letter parsing, working-directory resolution, drive stats and Guest user-name-to-URI mount translation in `packages/filesystem/src/drivePaths.ts`; tests cover D: and C: volumes, cross-drive paths and unknown disks. [PR CI 43090752469](https://github.com/codersachin99/windows-os/actions/runs/43090752469) passed. This is a path adapter, **not** a mounted or seeded source volume.
- **Next:** map source disk mounts + folders into one source-compatible volume/session adapter, then wire native Explorer and the full CodeMirror-based Notepad to the shared filesystem with comparable interactions. Do not replace the source editor with a basic textarea or declare the files/apps migrated.

## Update: opt-in CI and source-configured volumes (2026-11-12)

- **CI workflow:** routine commits no longer run tests; the job only executes when the latest push commit message contains the literal `[run-ci]` marker or the workflow is manually dispatched. `pull_request` auto-run was removed. Working branch and `main` are supported. Source: `.github/workflows/react-checks.yml`.
- **File store:** added change-event subscribers for File Explorer/Notepad/Recycle Bin to observe writes, moves, copies and removal after successful persistence; observers cannot undo a committed write. Added separate persistent user-scoped stores with a backwards-compatible Guest key.
- **Runtime mounts:** `LegacyVolumeSession` accepts actual source `systemPath`-based root, `desktopPath`, `trashPath`, and disk `getStats()` entries. Only source-provided directories are created, rather than a fabricated C: drive or default document tree. Validation and idempotency are tested. These are integration contracts, **not** a completed Explorer/Notepad implementation.
- **Dependency reliability:** one accidental CI run on the workflow-change commit failed during `npm install` because a newer Babel dependency requested unavailable `@babel/types@^7.29.14`. Transitive Babel parser/types are pinned through npm overrides to published compatible v7 releases pending a full generated lockfile.
- **Next coding:** provide source mount metadata at session startup, then plug native Explorer/file dialogs and CodeMirror Notepad into this SDK; verify complete behavior and visuals against pinned original. Do not claim module parity prematurely.

## Update: Notepad source-model port (2026-11-12)

- **Commit:** [399e8b742](https://github.com/codersachin99/windows-os/commit/399e8b742a5e9b96d4252613251a24541f8f871e) implements `packages/apps/notepad/src/document.ts` with the original Notepad's New/Open/Save/Save As behavior, dirty title indicator, close confirmation, font defaults, wrap/status settings, cursor position and date/time formatting. Uses the shared file store rather than separate mock documents.
- **Source quirk retained:** original New resets its label/content without clearing the previous path; this unusual behavior has an explicit unit test instead of being silently redesigned.
- **Verification:** the Notepad document model, CodeMirror adapter, source contracts, TypeScript and existing Chromium tests **passed** opt-in [CI run 43094398373](https://github.com/codersachin99/windows-os/actions/runs/43094398373). The preceding filesystem/profile and Babel checkpoint also **passed** [run 43092981085](https://github.com/codersachin99/windows-os/actions/runs/43092981085). These checks do not test a mounted React Notepad window, visual parity or file-dialog interactions; those integrations remain pending.
- **CodeMirror follow-up:** [ce06a6dc](https://github.com/codersachin99/windows-os/commit/ce06a6dc194b8cbf49f86933095aef8eded85d3b) implements a reusable native CodeMirror 6 editor adapter with source-oriented set/insert/focus/select-all/shortcut, cursor, wrapping and font behavior. The Notepad stylesheet is verified byte-for-byte against the source Git blob SHA `d8ac17121e7d28106d6986d4adccd795c69d1066`. It is not yet wired into the shell UI; no visual parity claim. Package versions for CodeMirror 6 are pinned.
- **Next:** integrate the CodeMirror editor into the native Notepad window, implement full menu/shortcut handling, open/save/font/overwrite dialogs and legacy appearance as native React modules; connect the original session-generated volumes, then add browser behavior comparisons. No source Notepad module is marked verified; the original app's full UI is not yet implemented. See [NOTEPAD.md](NOTEPAD.md).

## Native Notepad integration checkpoint (2026-11-12)

- Source-mapped Notepad now mounts as a native React Start menu app (not an iframe) using the original CodeMirror 6 adapter and source CSS. Dirty titles flow through the window manager and show in the taskbar.
- Source File/Edit/Format/View menus, keyboard bindings, font, word-wrap, status bar, date insertion and confirmation on close have React implementations. A reusable simulated filesystem file picker supports opening, saving, overwrite prompts, and folder navigation.
- App state is retained during minimize/restore; Windows titlebar close and Alt+F4 both use application-specific close requests. See `packages/ui/src/WindowFrame.tsx`, `DesktopShell.tsx`, `packages/apps/notepad`, `packages/apps/shared`.
- Desktop/mobile Playwright tests were added for document persistence, save and open, minimize, and Yes/No/Cancel close. **Verified:** opt-in [CI run 43145958318](https://github.com/codersachin99/windows-os/actions/runs/43145958318) passed TypeScript, unit tests, build and desktop/mobile Chromium tests for Notepad.
- Known source gaps: final Win7 Notepad icon `/assets/images/notepad.90e3ce4c.webp` must be copied through the pinned importer, active source disk/bootstrap metadata is not yet supplied, and shared file/font dialog CSS and all keyboard/touch states remain unverified against source. This is an in-progress port, not full Notepad parity.
- **Next:** Run source-parity screenshot comparisons, move the shared file dialogs closer to original source behavior, initialize verified guest volume metadata, and wire Computer/Explorer to the same filesystem.

## Native Computer / Explorer checkpoint (2026-11-12)

- The original Computer placeholder was replaced by `packages/apps/explorer` with source-following navigation history, current-folder filtering, selection, view modes, create-folder/rename and live updates from the same simulated filesystem used by Notepad.
- `.txt` association opens a separate native Notepad window with file path passed through the shared window contract. React StrictMode subscription lifecycle avoids leaked file listeners and maintains window state on minimize/restore.
- Original `src/styles/apps/computer.css` was copied byte-for-byte, SHA `f0cd08ab11f0c38a69cfacf602566059003afd99`. Exact source icons are referenced but require the pinned importer to render all original files.
- Browser tests now cover Computer/Notepad shared files, text-file association, creating a folder and back/forward navigation. **Verified:** opt-in [CI run 43147045676](https://github.com/codersachin99/windows-os/actions/runs/43147045676) passed TypeScript, unit, source inventory checks, production build and the existing/new desktop/mobile Chromium tests.
- Module tracker `computer.js` is `in-progress`. Source disk initialization/drive lists, deep search, devices, clipboard, drag/drop, Recycle Bin delete/restore, full list rendering and context menu parity remain pending. See [EXPLORER.md](EXPLORER.md).

## Explorer clipboard and scoped search (2026-11-12)

- **Source reference:** original `src/modules/apps/computer.js` dispatches shell `FileCopy` and `FileMove` and searches using scope, name pattern and `subfolders`; these are now implemented as reusable source-mapped contracts rather than browser/host file operations.
- **Shared clipboard:** `packages/filesystem/src/clipboard.ts` and `packages/sdk/src/files.ts` implement shared cut/copy/paste with collision validation (including different source folders containing the same target name), nested-folder protection and unit tests. Explorer has toolbar controls and Ctrl+C/X/V/A support; `tests/e2e/clipboard.spec.ts` exercises copy, cut and error behavior.
- **Scoped filename search:** `packages/filesystem/src/search.ts` supports filename wildcards `*` and `?`, scope, optional subfolders, excluded paths, progress, cancellation and limits. Explorer exposes Find, Search subfolders and file pattern controls; `tests/e2e/search.spec.ts` exercises finding a Notepad-saved file inside a nested folder.
- **Still pending:** source disk mounts and `trashPath` runtime initialization, original search index/ranking/full query operators, Recycle Bin operations and visual parity. Original `bin.js` wraps Computer Explorer at the runtime `trashPath` and is **not** implemented by these clipboard/search changes. Do not claim more.
- **Verification:** this code has been pushed but the new tests have not yet completed the deliberate opt-in CI checkpoint.

## Source-configured Recycle Bin + shared file actions (2026-11-12)

- **Clipboard and search:** source-oriented shell Cut/Copy/Paste with collision protection and multi-select, including Ctrl+C/X/V and Ctrl+A, and recursive scoped filename search with wildcards, exclusions and cancellation. Original Computer `FileCopy/FileMove` and `listSearch/searchIndex.walk` are mapped to `packages/filesystem/src/clipboard.ts` and `search.ts` and wired into native Explorer.
- **Recycle Bin:** original `src/modules/apps/bin.js` is an Explorer instance hoisted to dynamic `trashPath`; React now reuses native Explorer at that path with Confirm Delete, Restore, Empty, permanent deletion and original-path metadata in the same atomic VFS snapshot. `LegacyVolumeSession` enforces source-supplied disk/profile metadata, and `SourceFilesystemRuntime` persists only explicit source mounts. No default disk/trash/user tree is generated.
- **Verification design:** unit tests cover recursive tree removal, trash persistence/restore/collisions and runtime mounts. Desktop/mobile Chromium tests cover shared clipboard, wildcard recursive search and a **test-only source-shaped mount fixture** for Computer -> Bin -> Restore -> reload. Default Bin displays "not mounted" rather than falsely claiming empty.
- **CI:** previous run [43155884899](https://github.com/codersachin99/windows-os/actions/runs/43155884899) passed TypeScript, unit tests, source audit and Vite build, but had one browser timeout: the search test clicked Explorer behind a foreground Notepad window. The test now closes Notepad first (commit `c3b8d0eb`). **Verified:** opt-in [CI 43157555063](https://github.com/codersachin99/windows-os/actions/runs/43157555063) passed TypeScript, unit tests, source inventory/CSS checks, production build, and desktop/mobile Chromium tests for Recycle Bin, clipboard and scoped search.
- **Follow-up validation:** opt-in run [43157356640](https://github.com/codersachin99/windows-os/actions/runs/43157356640) failed before any tests due a missing JSX closing brace in the new Bin controls (`ExplorerApp.tsx`). Commit `185fd1d2` fixes it; the subsequent [CI 43157555063](https://github.com/codersachin99/windows-os/actions/runs/43157555063) **passed** all steps.
- **Still pending:** actual legacy `getStats()` and user/session mount data producer, exact source trash metadata format, file dialogs, permission/shortcut services, binary media, full Explorer search-index behavior, original theme/layout/asset parity. `computer.js` and `bin.js` remain in-progress, not verified. See [EXPLORER.md](EXPLORER.md) and [RECYCLE-BIN.md](RECYCLE-BIN.md).

## Verified milestone: source-backed virtual file operations (2026-11-12)

- **CI run:** [43157555063](https://github.com/codersachin99/windows-os/actions/runs/43157555063), succeeded with all workflow checks (TypeScript, Vitest, source auditing and original Contacts checks, Vite build, desktop/mobile Chromium browser suite).
- **Native Explorer:** source-style clipboard Cut/Copy/Paste and keyboard commands across windows, wildcard/recursive filename search, original-source trash exclusions when mounted and validation of conflicting operations.
- **Recycle Bin:** original `bin.js` -> Computer at runtime `trashPath` mapping with native UI for recycle, restore, permanent removal and empty; single-snapshot metadata persistence and source-runtime mount validation/restore after Guest login.
- **Verification caveats:** source disk/Guest metadata is not yet discovered automatically from the original installed runtime; the Bin browser test supplies **explicit source-shaped fixture data**. No C: drive, trash path, source asset or account is fabricated for normal users. Original binary/media, permissions, file association table, complete Computer/Bin UI and many more apps remain incomplete. Module status remains `in-progress`.
- **Source art requirement:** `apps/web/public/assets/images` currently has only the previously imported shell artwork. Original `notepad.*`, `file.*`, and `folder.*` image files must be imported from the pinned original checkout via `npm run import:legacy -- --from <source-path>`. The runtime references original filenames but unimported images will not display correctly.
- **Next:** capture source `getStats()`, `systemPath`, `desktopPath`, `trashPath` initialization/session data and tie into the source filesystem adapter; then improve Explorer context menus, search index and drag/drop, and compare visual snapshots against original.

## Source-derived first-run Guest disk initialization (2026-11-12)

- **Source recovered:** Original webpack modules `5401`, `4cca`, `757f`, `760d` and the filesystem service in `shared~plugin-embed~sandbox~system-cache~vue-app~vue-store.js` define the first-run `computer/drive0` System C: disk, `Users/Guest` profile, `AppData/Roaming/WindowsOS/Windows/RecycleBin` and special folders. See [SOURCE-BOOTSTRAP.md](SOURCE-BOOTSTRAP.md) for exact source mapping.
- **Implemented:** `packages/filesystem/src/sourceGuest.ts` seeds source-defined system and Guest directories idempotently in the existing persistent guest VFS. `SourceFilesystemRuntime.startGuest` is called during Guest login, preserves explicitly supplied prior mount snapshots, and does not overwrite existing files. Computer shows System (C:), Desktop and Guest Documents/Downloads/Pictures/Music/Videos; Z: DVD is displayed as unavailable rather than falsely writable.
- **Explorer menus:** native right-click file and background context menus use the shared operations and source-based item/background distinction; unsupported Properties remains disabled. Browser tests added for source first-run mounts, context-menu create/rename/Escape behavior and reload persistence.
- **Verification PASSED:** [GitHub Actions run 43164294440](https://github.com/codersachin99/windows-os/actions/runs/43164294440) successfully completed TypeScript, Vitest, migration inventory audit, original Contacts CSS/shortcut checks, Vite production build and **36 desktop/mobile Chromium browser tests**. New tests cover source Guest C: initialization, special folders, Bin auto-mount, right-click item/background commands and persistence. Existing [43157555063](https://github.com/codersachin99/windows-os/actions/runs/43157555063) verifies the *previous* clipboard/search/Bin slice only.
- **Remaining:** actual platform Capacitor URI support, dynamic quota/disk enumeration, original installers and program shortcut files, original desktop profile integration, rich Explorer menu behavior, missing original artwork, screenshots and full application parity.

## Source program installer and real All Programs shortcuts (2026-11-12)

- Source discovery: `legacy-win7/src/modules/system/testmode.js` webpack `c170` contains exactly 42 base-variant apps (34 installed); webpack `757f`/`760d` provide executable MZ stubs, install parent paths, special menu categories and JSON `.lnk` serialization. Exact locale labels come from pinned `assets/locales/en-US.json`. See [PROGRAM-INSTALLER.md](PROGRAM-INSTALLER.md).
- Ported complete source program metadata to `packages/filesystem/src/sourceProgramManifest.json`, plus shared `sourcePrograms.ts` installer, paths, shortcut parser and unit tests. New `VirtualFileStore.readBytes/writeBytes` preserves binary MZ files alongside text through existing persistent copy, move and Bin semantics.
- Guest login installs all 34 original 1,024-byte MZ program placeholders plus 34 original JSON shortcuts **once per pinned source revision**; existing user-edited files and intentionally removed shortcut entries remain intact. Custom source-runtime mounts are not seeded.
- Native Explorer now resolves installed `.lnk`/known executable paths through the React app registry, so `Notepad.lnk` and `notepad.exe` launch real React Notepad, while source programs not yet migrated show an explicit pending message. Start Menu's `All Programs` hierarchy reads the real installed shortcut files and marks unsupported apps as unavailable rather than claiming implementation.
- Unit and Chromium browser tests were added for manifest count, source MZ and shortcut bytes, idempotent installation, upgrade and reload persistence, All Programs grouping, Notepad shortcut launching, and unmigrated program behavior. Initial opt-in [CI 43167307049](https://github.com/codersachin99/windows-os/actions/runs/43167307049) failed at TypeScript because TS incorrectly narrowed `this.session` after awaited restore; fixed in commit `43ac2877` using the typed snapshot getter. **Verified:** opt-in [CI 43167441493](https://github.com/codersachin99/windows-os/actions/runs/43167441493) passed TypeScript, Vitest, migration/source audit, original Contacts fidelity checks, Vite production build and **42 Chromium desktop/mobile tests** including new source installer/Start Menu/shortcut coverage.
- Remaining: port each original program engine/UI, native executable routing beyond metadata, dynamic Build-version installer upgrades, desktop shortcut placements and locale/theme parity, visual screenshot parity and bundled licensed source artwork.

## Native Calculator: source Standard mode (2026-11-12)

- Recovered original `src/modules/apps/calc.js` Standard button array (28 labels), `Vt.methods` digit/decimal/evaluate/clear/memory/unary semantics, `3b1d` default config, the 5x6 grid, and original Calc source CSS SHA `e4a76c147d6f10c7153c6448a67a2802da0767c5`.
- Implemented reusable `StandardCalculator` model in `packages/apps/calculator/src/standard.ts`, native `CalculatorApp.tsx`, original unmodified `source.css`, React-specific layout, source-menu controls, history/grouping and keyboard/clipboard. Wired registered `calc` program through Start menu and `Calculator.lnk`/.exe association. Original source icon referenced by exact path, not substituted.
- Added unit and browser tests for left-to-right arithmetic, source key order, errors, memory, history, grouping, keyboard and launch from original installed shortcut. Existing source-program browser tests now expect Calculator to be functional; another unported app is still explicitly disabled.
- **Scope:** only original **Standard** mode, not Scientific, Programmer, Statistics, worksheets, unit/date conversion or full extended expression implementation. Tracker `calc.js` remains `in-progress`, not verified. See [CALCULATOR.md](CALCULATOR.md).
- **Verified bounded Standard-mode slice:** opt-in [CI run 43171852845](https://github.com/codersachin99/windows-os/actions/runs/43171852845) **passed** TypeScript, 13 Vitest test files, original source inventory/Contacts fidelity checks, Vite production build, and **48 desktop/mobile Chromium browser tests** including Calculator controls, history, grouping, keyboard and Calculator.lnk execution. Full Calc app remains `in-progress` because Scientific, Programmer, Statistics, conversions and worksheets are not implemented.

## Explorer drag/drop and safe host File import (2026-11-12)

- Pinned source `src/modules/apps/computer.js` calls shared drop-parser `_parse(event, activePath)` from the `mounted()` onDrop handler. Source FileCopy/FileMove behavior was mapped to reusable `packages/filesystem/src/transfer.ts`; shared `FileClipboard` now delegates to the same preflight transaction used by Explorer drag/drop.
- `packages/filesystem/src/drag.ts` adds a tokenized, same-document `FileDragSession`, copy modifier and an external browser `File` importer. The importer refuses existing/duplicate filenames, retains Unicode text for Notepad and binary bytes for non-TXT files; no host filesystem writes.
- `ExplorerApp.tsx` now has draggable virtual files and folders, native folder and folder-background drop targets, visual drop feedback, and explicit Upload selection. Recycle Bin drag is disabled until original Bin drag protocols are mapped. Drag does not overwrite Cut/Copy clipboard state.
- New Vitest and Chromium tests: copy/move, nested folder and collisions, expired token rejection, text/binary import, host File event drop into a child folder and opening imported TXT in native Notepad. See [EXPLORER-DRAGDROP.md](EXPLORER-DRAGDROP.md). Full desktop/icon drag, host directory recursion and exact source visuals remain incomplete.
- **Verification passed for this bounded slice:** opt-in [CI 43177091763](https://github.com/codersachin99/windows-os/actions/runs/43177091763) completed TypeScript, Vitest, original source inventory and Contacts fidelity checks, Vite build and **56 desktop/mobile Chromium browser tests**. New cases cover internal drag-move, Ctrl+drag copy, text/binary Upload, browser File drop into a child directory and overwrite refusal. Source `computer.js` remains **in-progress**, not fully verified.

## Source desktop shortcut coordinates and drag (2026-11-12)

- **Source evidence:** `legacy-win7/src/modules/system/main.js` original `c5f4` item renderer, `743b` desktop preferences and pointer drag mixin define small/medium/large 50/80/120px icons, default column-first placement, pixel `item.x/y` positions, 4px drag threshold, multi-selection, clamped ghost motion, `ShortcutMove` commit and View menu Auto Arrange/Show Desktop Icons toggles. See [DESKTOP-ICONS.md](DESKTOP-ICONS.md).
- **Implemented:** `packages/ui/src/desktopPositions.ts` independent typed Guest-scoped persistent source layout; `DesktopIcons.tsx` replaces the placeholder flex-column layout and integrates original app windows/Start menu, pointer drag and source View context settings. User positions survive reloads and screen resize without rewriting the saved coordinates; group drag and Ctrl selection supported.
- **Tests:** source-dimension, column order, group bounds, persistence, auto mode, corrupted store plus Playwright single/group drag, ghost, context View toggles and mobile viewport; added without inventing source filesystem positions. Initial opt-in [CI 43183034223](https://github.com/codersachin99/windows-os/actions/runs/43183034223) stopped at a public SDK export TypeScript error; fixed by commit `7dd9983a`. Second [CI 43183278318](https://github.com/codersachin99/windows-os/actions/runs/43183278318) then ran 94 unit tests (93 passed) and revealed a short-viewport test expectation error; source column-first correctly puts the second icon in the next column when only one row fits. Fixed in `608d0f0c`. Third [CI 43183499259](https://github.com/codersachin99/windows-os/actions/runs/43183499259) passed all unit/source/build steps and **65/66 browser tests**; the remaining responsive test tried to move an icon 430px while still in a mobile viewport, so the correct clamping rejected that test expectation. Fixed in `b5737c8f` by first setting a desktop viewport in both Playwright projects. **Verified at opt-in [CI 43184057406](https://github.com/codersachin99/windows-os/actions/runs/43184057406): TypeScript, 16 Vitest files / 94 unit tests, source inventory and Contacts fidelity checks, production Vite build, and 66 Chromium desktop/mobile browser tests all passed.** The tested source desktop coordinates/layout slice is accepted; the whole desktop shell and full legacy source parity remain incomplete.
- **Not full shell parity:** desktop rubber-band selection, source backed file shortcuts, rename, drag from Explorer/host/Recycle Bin, RTL and original visual screenshot comparison still pending. Source `src/modules/system/main.js` remains `in-progress`.

## Desktop rubber-band icon selection (2026-11-12)

- **Pinned source:** `legacy-win7/src/modules/system/main.js` desktop render calls `handlePointerDown -> pressIcon(event) || startBand(event)`; renders `desktop__icon-band` with `bandStyle` and exposes `getBandArea`, `bandItemSelector`, `getBandSelection`, `setBandSelection` to its band mixin. Native icons also support Ctrl/Meta toggles, Shift ranges, and the source 4px drag threshold.
- **Implementation:** `packages/ui/src/desktopSelection.ts` adds viewport-clamped rectangular hit testing against the saved/source auto-arranged 50/80/120px icon bounds; helper supports replace, Ctrl-toggle and Shift-add selections without moving or persisting any icons. `DesktopIcons.tsx` handles background-only PointerEvents, translucent `desktop__icon-band`, selection persistence after release, cleanup, menu priority and subsequent group drag. Existing icon move/save/UI contracts unchanged.
- **Coverage:** five new pure geometry/selection unit tests and four desktop/mobile Chromium interaction tests including reverse-direction rectangle, Ctrl and Shift modifiers, drag-after-select, deselection, right-click menu and double-click launch.
- **Remaining:** exact original external `03f3` mixin edge cases, touch band handling, file-backed user desktop shortcuts, marquee auto-scroll, icon file renaming, drag to Recycle Bin and theme screenshot parity are not yet migrated. Source `system/main.js` stays `in-progress`.
- **Verification:** first opt-in [CI 43185870524](https://github.com/codersachin99/windows-os/actions/runs/43185870524) passed TypeScript, unit/source checks and Vite build, but only **72/74 browser tests**: the reverse-direction test incorrectly started its pointer on the Bin icon, invoking source icon drag instead of the background band. Corrected the fixture to start in empty background in commit `52efdeea`. **This commit requests a new opt-in verification; do not claim tests passed until results are confirmed.** See [DESKTOP-BAND.md](DESKTOP-BAND.md).

## Source Guest Desktop file-backed shortcuts and files (2026-11-12)

- **Original source:** `legacy-win7/src/modules/system/main.js` webpack module `6271` computes desktop `items` as `defaultShortcuts` (Bin, Computer, dynamic shortcuts) plus persisted user `shortcuts`. `openItem` uses original file `type` (`folder`, `shortcut`), reads shortcut file JSON and resolves its original `exe`/target. The underlying source filesystem stores user items in the configured `desktopPath`.
- **Implementation:** `packages/ui/src/desktopFiles.ts` lists real VFS entries from `sourceFilesystemRuntime.snapshot().desktopPath`; no new fabricated desktop drive paths or duplicate catalog. JSON `.lnk` is parsed only with the validated source executable manifest, including binary host-imported JSON bytes. `DesktopIcons.tsx` observes shared file and runtime events, combines source app icons with real Guest user files, and opens folders in Explorer, TXT in Notepad, installed Calculator/Notepad shortcuts through app registry, or explicitly reports unmigrated files. Item right-click Delete calls source-mounted `fileStore.trash`; positions are shared with the already tested movable desktop.
- **Explorer:** `ExplorerApp` now accepts a source VFS initial path and `DesktopShell` forwards it through the existing OPEN_APP file contract for folder icons.
- **Coverage:** four isolated source desktop file tests plus Chromium browser tests for file/folder creation and live icons, Guest reload persistence, TXT in Notepad, imported Calculator.lnk, Recycle Bin delete and safe unknown .lnk handling. See [DESKTOP-FILES.md](DESKTOP-FILES.md).
- **Open gaps:** full original file-type associations, shortcut rename/create wizard and context-menu actions, exact per-user shortcut metadata/icon mapping, binary image previews, desktop folder dragging into other apps, source `03f3` band library and screenshot parity. Main desktop module tracker remains `in-progress`.
- **Verification passed:** initial [CI 43187940651](https://github.com/codersachin99/windows-os/actions/runs/43187940651) passed source/type/build and 103 unit tests but found desktop context-menu stacking behind an open Explorer window (82/84 browser tests). Fixed the actual UI stacking in commit `871b5e48`, then **[CI 43188802257](https://github.com/codersachin99/windows-os/actions/runs/43188802257) passed TypeScript, 18 Vitest files / 103 unit tests, source inventory and Contacts checks, production Vite build and all 84 Chromium desktop/mobile tests**. File-backed icon creation, TXT and source .lnk execution, folder navigation, Bin deletion and invalid link handling are now verified as a bounded slice. The full source desktop app remains `in-progress`.

## Source Desktop FileRename / F2 (2026-11-12)

- **Source:** `legacy-win7/src/modules/system/main.js` `c5f4` icon editor enables `renaming` with an input `maxlength=30`, calls `FileRename({path,name})` on blur/Enter, and keeps file extension separately; `toggleRenaming` is invoked from the original desktop item context menu.
- **Port:** `packages/ui/src/desktopRename.ts` validates the editable base name and collision-safe destination before `VirtualFileStore.move`, preserves source file extensions/content and directory descendants; rejects Windows reserved names, path separators and collisions. `DesktopIcons.tsx` adds F2, context Rename, inline editor, Enter/blur commit and Escape cancel. `DesktopPositionStore.rekey` carries saved free-placement coordinates from the old URI key to the new URI key.
- **Tests:** unit checks for file/shortcut extension integrity, descendant moves, duplicate names, invalid names, stale entry, no-op and case-only rename, stored icon coordinate migration. Browser checks for F2 TXT and Notepad content, folder rename with descendants and saved location, collision, reserved name and Escape cancellation in desktop/mobile Chromium.
- **Scope:** this is the bounded source file-backed desktop rename action; creating desktop shortcuts, drag-to-Bin, all original menu actions, filename display preferences and screenshot/theme parity remain pending. Module `src/modules/system/main.js` stays `in-progress`.
- **Verification passed:** the first opt-in [CI 43190794745](https://github.com/codersachin99/windows-os/actions/runs/43190794745) passed TypeScript/Vitest/source/build, but one Playwright drag fixture ran with Explorer obscuring the desktop (90/92 browser tests). After correcting it in commit `02393219`, **[CI 43191657508](https://github.com/codersachin99/windows-os/actions/runs/43191657508) passed TypeScript, 19 Vitest files / 110 unit tests, original source and Contacts fidelity checks, Vite production build, and all 92 Chromium desktop/mobile browser tests**. Source F2, context rename, TXT/lnk extension retention, collision rules, Escape, directory contents and free-icon position migration are verified as this bounded slice. Full `system/main.js` remains `in-progress`. See [DESKTOP-RENAME.md](DESKTOP-RENAME.md).

## Tested implementation

- Boot → Windows 7 logon → source Guest session → Windows 7 desktop; source wallpaper/Guest avatar/window icons/Start art copied byte-for-byte, with original initial defaults `skipBoot=false`, `nativeCursor=false`, `theme=win7`.
- Shared types (`packages/contracts`), asset paths (`packages/assets`), session/window state reducer (`packages/engine`), application registry (`packages/sdk`), reusable shell/window/Start/login components (`packages/ui`), Vite app (`apps/web`).
- Original external app shortcut `web_contacts` is read from the **unmodified source JSON**, not invented. A real Contacts React component now replaces the old iframe. It uses the original Contacts CSS (unaltered rules inside Shadow DOM), backend list/save/delete routes, exact form fields, selection, search, validation, and status/error handling.
- Source's **23 Python API/controller/model files** preserved as a separate loopback-only dev service; this is *code preservation*, not audited production security or verified integration.
- Complete checkpoint inventory `migration/legacy-files.tsv`: **3,348 files**; **290 webpack/Vue module bundles**, **158 original CSS files**, **2,395 assets**. SHA verifying importer `scripts/import-legacy.mjs`; core Win7 image assets already staged and source file/shortcut/CSS checks under `scripts/source-contacts.test.mjs`.
- `migration/module-tracker.json` and `npm run audit:legacy`: all 290 module paths tracked (5 in-progress, 285 pending); three standalone app pages tracked (Contacts implemented pending acceptance, two source-zero-byte pages pending investigation).

**Automated verification:** GitHub Actions push run https://github.com/codersachin99/windows-os/actions/runs/43087351461 passed on commit `0cb7dc705df7a02221c4eac9a3bdb7581f491757`:
TypeScript, Vitest unit tests, source inventory audit, original Contacts byte-for-byte CSS/shortcut checks, Vite build, desktop and mobile Chromium interaction tests (boot, Guest, Start/window lifecycle, Contacts CRUD and backend errors). No native desktop installers or complete source parity tests exist yet. A draft PR event has separate status; check its latest CI before merging.

## Run locally

```powershell
git switch feat/0001-faithful-react-foundation
npm install
npm run typecheck
npm test
npm run audit:legacy
npm run test:source
npm run build
npx playwright install chromium
npm run test:e2e
npm run dev       # React at 127.0.0.1:1420
```

For persistent Contacts data run the preserved Python backend on 127.0.0.1:8099 with the documented private SQLite `db.config.json`; Vite proxies `/api`. The browser tests mock API responses so they run without Python. To import every untouched source asset and stylesheet into Vite public paths, run the pinned clean source checkout through `npm run import:legacy -- --from "<path to legacy-win7>"` (or `node scripts/import-legacy.mjs --from ...`) and follow with `--check`. Do not copy a modified/mismatched source revision.

## Actual next coding priorities — do not replace functionality with placeholders

1. **Shared simulated file system + document app contract.** Before porting Notepad or Computer, examine source modules `src/modules/apps/notepad.js` (~45 KB; CodeMirror, font selection, word wrap, status and file open/save), `src/modules/apps/computer.js` (~84 KB; navigation, files/devices and search), and their shared webpack chunks. Build one source-mapped file store/SDK shared by Explorer, Notepad, Recycle Bin, media apps and drag/drop. Do not substitute a browser text area for the full Notepad.
2. **Finish shell semantics**, not just its wallpaper: source exact window layout, Start/search, context menus, desktop icon positioning, notifications, keyboard/mouse/touch/cursors, drag/drop, session/user/account flow, screen saver/BSOD/boot options and 18+ original theme families. Correct interactions and responsive states must be verified against the source.
3. **System and utility apps**, each as a native React component using the common app/window/storage contracts. The original Calculator (`src/modules/apps/calc.js`, ~128 KB) has multiple layouts, conversions and worksheets; a basic arithmetic panel would not be parity.
4. **Games, gadgets, audio, locales, media and backend**: preserve their exact functionality and source assets, implement feature tests, compare matching initial/state/action screenshots at mobile and desktop dimensions. Do not mark modules `verified` without source-behavior evidence.

## Source and security caveats

The original `apps/illustrator/index.html` and `apps/photoshop/index.html` are zero bytes at the pinned checkpoint. Their actual runtime may depend on other code/external integrations; investigate before declaring them missing or implemented.

The preserved backend contains legacy account/security behavior, including non-production password/token handling. Never publicly expose it without authentication/security review. The new `windows-os` GitHub repository is **public**, whereas the source repository was private: check rights for original bundled artwork, sounds, fonts and third-party code before promoting a distributable build. Do not commit private DB configuration, user data or tokens.

**Acceptance gate:** Full source parity means every original module/feature has mapped source behavior, tested interactions, correctly rendered artwork/themes across target viewports, and the status tracker is entirely verified. A green CI on this initial vertical slice is not that gate.


## CMD original Tab path completion and Escape — 2026-11-15 (CI requested)

- After corrected CMD cross-surface [run #43645272266](https://github.com/codersachin99/windows-os/actions/runs/43645272266) completed **SUCCESS**, continued pinned legacy cmd.js Ht keyboard controls and helpers a/c/l.
- New SourceCmdSession.complete enumerates actual Guest VFS names under the current mounted Windows path, with original quoted/unquoted token detection, case-insensitive prefix and sorted matching; sourceCmdApplyCompletion adds quotes for spaces. React CMD Tab cycles matches; Escape clears text; non-Tab editing cancels cycling. It never reads the host filesystem.
- Added pure/VFS unit tests and desktop/mobile Playwright source prompt scenario for Tab cycling, quoted paths and missing mounts. This commit uses **[run-ci]** exactly once to run verification; do not declare this slice verified before the workflow completes.
- Remaining original CMD features: pipe/redirection/batch, source interactive confirmations and interrupt, exact icon artwork, and original-vs-migration screenshots. CMD remains in progress; 290 tracked original source modules: 254 pending / 28 in progress / 8 implemented / 0 fully pixel-verified. Preserve open draft PR #1, main and no releases.


## Source-exact CMD icon artwork — 2026-11-15 (CI deliberately skipped)

- Imported legacy-win7 original cmd.a2c1d19b.webp, exact 536-byte source/target Git blob SHA bcec3ad17a595cc2eb99686b084773b7bb171d9c. Shared original icon registry now maps cmd to this asset, removing the former generic-file placeholder in original CMD shortcut and app window artwork.
- Added asset/unit contract and browser assertion checking installed Start Menu CMD .lnk icon and original-artwork provenance. This change is **without [run-ci]**, avoiding a second overlapping GitHub Actions run while Tab completion CI #43669660346 finishes. This exact-artwork change is not yet CI verified.
- Draft PR #1 stays open and unmerged, main unchanged, no release. Remaining CMD work: pipes, redirect, batch, full source commands, confirmation/interrupt and screenshot parity.


## CMD source b894 300-entry transcript cap — 2026-11-15 (batched, no CI)

- Restored original Ht.trim/Ft=300 visible history-entry cap for both normal results and exceptions; distinct original Tt xt=100 command recall is already retained in the React input. Added one pure test covering >300 retention and unchanged input history.
- Committed without [run-ci], to avoid triggering another GitHub Actions workflow during previous Tab completion browser suite #43669660346. Verify this later with the next deliberately opted-in acceptance batch; no claim of browser parity.
- Preserve draft PR #1, main untouched and no release.
 / 0

## CMD echo trailing-space test correction — 2026-11-15 (opt-in retest requested)

- [Combined CI #43678975812](https://github.com/codersachin99/windows-os/actions/runs/43678975812) **FAILED four unit assertions** (376/380 pass). TypeScript passed; remaining audits/build/browser were skipped. The failing fixtures incorrectly discarded trailing spaces before operators, though original pinned cmd.js St/Te.echo preserves them. Source implementation preserves exact text.
- Corrected expected output and CRLF bytes to retain original trailing spaces. Browser tests now match whitespace flexibly while still asserting order. No production changes; one [run-ci] recheck requested. No green claim until conclusion.


## CMD yt() pipeline FIND/SORT/MORE — 2026-11-15 (CI batched later)

- Pinned yt()/Tt.runPipeline and ie FIND/SORT/MORE implemented with original quote-aware pipe splitter, stage output forwarding, Guest file read input and source flags. Intermediate output is hidden, final output may be sent to source wt() redirect. Source helper and real Guest unit/browser contracts included.
- No host process is run. This commit intentionally omits [run-ci] while existing chain+redirect retest #43679131656 remains active. Run a single opt-in CI on a later combined checkpoint after inspecting current results.
- Still pending: CMD batches, host interactions/confirmation and screenshot parity, plus other source commands. Keep PR #1 draft, main untouched and no release.


## CMD source vt() ECHO whitespace fidelity — 2026-11-15 (CI batched later)

- Original ECHO source preserves untrimmed rest and removes one leading literal space; added sourceCmdRawRest and ECHO tests for multi-space, tab, ON/OFF, dot and chained operators. Other command parsing remains unchanged.
- This commit contains no [run-ci] while #43679131656 remains in progress. Combine with pending quoted pipeline/FIND/SORT/MORE CI once previous verification concludes. Draft PR #1, main untouched and no release.


## Combined original CMD pipe and ECHO source acceptance — 2026-11-15 (CI requested)

- The new pipeline/FIND/SORT/MORE work 0fcf85d and exact ECHO raw-rest spacing d300159 have pure/unit and desktop/mobile browser test coverage but no previous CI execution.
- Opted in to a single full [run-ci] batch for these two commits (plus the already staged source CMD chain/redirect/icon/history fixes); do not infer any pass until GitHub concludes this new workflow.
- Previous chain/redirect [CI #43679131656](https://github.com/codersachin99/windows-os/actions/runs/43679131656) was still running its desktop/mobile Playwright suite at this checkpoint; it was triggered on commit 5c689b2, before these newer features. Separate commit-SHA concurrency prevents the new opt-in from cancelling it.
- Preserve draft PR #1, main untouched and no release. Remaining original CMD behaviors: batch execution, interactive confirmation / interruption, and screenshot/pixel parity, plus unfinished original commands.


## CMD original Ht Ctrl+C and in-flight transcript — 2026-11-15 (CI requested)

- Both earlier [chain/redirect CI #43679131656](https://github.com/codersachin99/windows-os/actions/runs/43679131656) and [FIND/SORT/MORE + ECHO CI #43679639347](https://github.com/codersachin99/windows-os/actions/runs/43679639347) **SUCCESS**, including desktop/mobile browser checks at commit e1eb0b2.
- Pinned b894 submit/interrupt source behavior added: visible pending command row, Ctrl/Meta+C idle appends input^C, during busy appends ^C and discards late UI result by runId, keeps 300-row transcript and 100-item history recall. Noncollapsed text selection is left to browser copy. No promise of underlying Guest VFS cancellation: once started, mutations may still finish.
- Pure unit and real desktop/mobile Playwright input/history/no-unintended-file test added. One [run-ci] requested to verify this change. Keep PR #1 draft, main untouched, no release; source visual parity and confirmation/other original commands still pending.


## Source ze PAUSE + b894 keyResolver — 15 November 2026 (CI staged)

- Ported original PAUSE with visible waiting message, injected keyboard keyResolver, any-key continuation and chained commands. Ctrl+C/unmount release pending key reads; stale UI output remains guarded.
- Model and browser coverage added, including explicit unsupported response without a key host. No [run-ci] in this commit while Ctrl+C acceptance CI #43681551196 is still active; batch with next acceptance test.
- Draft PR #1, main untouched, no release. No host shell access.


## CMD original RD /S source confirmation — 15 November 2026 (CI staged)

- Pinned Te.rd and ke(waitForKey) Y/N confirmation restored for nonempty RD /S or RMDIR /S; response N preserves actual Guest file bytes, Y performs an atomic Guest VFS removeTree, and empty folders delete without prompt. No host filesystem access.
- Added model and real desktop/mobile confirmation browser tests. No [run-ci] yet while Ctrl+C CI #43681551196 runs; batch with PAUSE in the next opt-in test. Keep PR #1 draft and main untouched.


## CMD source DEL wildcard and directory confirmation — 15 November 2026 (CI staged)

- Original De/xe/ke selectors and exact '*' Y/N flow ported for DEL/ERASE on actual Guest files. Source glob matching, case-insensitive names, preservation of directories, and explicit rejection when all-files confirmation UI is absent. Pure unit and desktop/mobile browser tests added.
- No [run-ci] in this commit while the preceding Ctrl+C run remains active. Batch with PAUSE and RD /S in the next full acceptance. PR #1 draft; main untouched; no releases.


## Source CMD pause, Y/N RD and DEL confirmation combined acceptance — 15 November 2026 (CI requested)

- Cumulative source keyboard/interactive commits: [Ctrl+C 1b360aa](https://github.com/codersachin99/windows-os/commit/1b360aaf2b938f0da45fd5c8b951dc5bc1d0c0b7), [PAUSE c226b68](https://github.com/codersachin99/windows-os/commit/c226b6835f0eb1dae2692dcd73ecc6f075b46a12), [RD /S fa1b20e](https://github.com/codersachin99/windows-os/commit/fa1b20ee262ad42b8c8d210be1c4b1c9b090a4ba) and [DEL wildcard 12642ea](https://github.com/codersachin99/windows-os/commit/12642eac8b2e86b96a35ed497ec48427a6870aec).
- This docs handoff commit intentionally contains [run-ci] to opt into one **full combined** TypeScript, units, original-source audits, production build and desktop/mobile Playwright verification. No green claim before workflow completion. Prior Ctrl+C [CI #43681551196](https://github.com/codersachin99/windows-os/actions/runs/43681551196) had not completed its browser stage when this was scheduled.
- Y/N confirmation only mutates real mounted Guest VFS; N means no deletion; Y (single char) allows the specifically named subtree/files. Without interactive key host, destructive multi-file operations refuse execution. Host OS is never touched.
- Keep draft PR #1, main unchanged and no release. Source screenshot parity and unimplemented CMD commands/batch behavior remain pending.


## DEL old wildcard-rejection test corrected — 2026-11-15 (CI retest requested)

- [First PAUSE/RD/DEL CI #43682005351](https://github.com/codersachin99/windows-os/actions/runs/43682005351) **FAILED exactly one stale unit assertion** (397/398 passed); TypeScript passed, later stages skipped. The old DEL test was still asserting a live *.txt pattern should fail, but original Te.del now correctly removes matching files. Replaced it with nonexistent *.log and retained named-file/directory protections.
- No source runtime changes. This commit opts into a new single [run-ci] to verify the corrected cumulative tests and desktop/mobile browser scenarios. No pass claim until completion; draft PR #1, main untouched, no release.


## Original CMD banner command — 2026-11-15 (CI pending)

- Added source ze.cmd: prints original Win7 host.getBanner contents within current simulated session, no new window, no host process. Unit/browser contracts and HELP registration added.
- No [run-ci] while PAUSE/RD/DEL acceptance #43682097876 remains active. Batch with next opt-in verification. PR #1 draft, main untouched, no release.


## Correct PAUSE Ctrl+C + empty DIR /B E2E locator regression — 15 November 2026

- [CI #43681551196](https://github.com/codersachin99/windows-os/actions/runs/43681551196) **SUCCESS** for independent Ctrl+C acceptance. Combined [CI #43682097876](https://github.com/codersachin99/windows-os/actions/runs/43682097876) **FAILED only four browser tests** (two cases × desktop/mobile); TypeScript, 398 unit tests, source audits, Vite build and 372 other browser tests succeeded.
- React browser copy-selection guard now applies only while idle, so busy PAUSE Ctrl+C is not swallowed by a stale text selection. The RD browser test now plants a durable DirAnchor.txt before Y/N confirmation and checks that anchor plus the absent deleted name; original DIR /B of an empty directory legitimately renders zero output and leaves last rendered output on prior RD.
- This checkpoint omits [run-ci] until combined with next original DIR /S /W implementation and tests. Draft PR #1 remains open, main unchanged and no release. Review browser acceptance before green claim.


## Original CMD DIR /B /S /W source format and recursion — 2026-11-15 (CI requested)

- Ported original Te.dir /B /S /W modes, wildcard search beneath nested source Guest directories, known-directory versus named-file selection, original timestamp/size layout and 5-column W format, runtime volume headers and 39-column summaries, 12-level depth and 5000-item limit. Source mounted VFS only; no host shell or fabricated disk space.
- Added pure formatting and VFS regressions plus desktop/mobile Playwright acceptance. Batched with [PAUSE Ctrl+C / RD post-confirm browser fix c2a9a78](https://github.com/codersachin99/windows-os/commit/c2a9a78494ab864c2b1feab980b410805fe2dad2) and earlier [unverified CMD banner f4d54cf](https://github.com/codersachin99/windows-os/commit/f4d54cfd71a31dcfa3b24c5928955f0548005c16).
- Request one [run-ci] opt-in batch. Previous [CI #43682097876](https://github.com/codersachin99/windows-os/actions/runs/43682097876) failed four browser tests (two scenarios desktop/mobile) though all units, source audits and build passed. No green claim until new run completes. Draft PR #1, main untouched and no release. Remaining original CMD commands / visual parity pending.


## Source CMD DIR /S /W and browser-fix acceptance retry — 2026-11-15

- [First DIR source CI #43683595361](https://github.com/codersachin99/windows-os/actions/runs/43683595361) failed one **test fixture**, not implementation: five-column /W expected output omitted source brackets around directories and dynamic column spacing (402/403 units otherwise passed; TypeScript passed). [Fixture corrected 3910ba9](https://github.com/codersachin99/windows-os/commit/3910ba9dae59d6f895a4246302e7e98ed7a7e4d2), no production change.
- This handoff commit opts into one [run-ci] for corrected /W unit fixture, original DIR /S /W/browser listing tests, original CMD banner, and prior PAUSE Ctrl+C and RD /S end-to-end fixes. The original source remains authoritative; do not adjust implementation for wrong expected output.
- Check the new CI job after it finishes; do not call it green before full desktop/mobile Playwright results. PR #1 remains draft, main unchanged, no release. Source CMD parity and visual captures remain incomplete.


## CMD source WHERE simulation support — 2026-11-15 (CI staged)

- Added ze.where based on existing c170 source program installation catalog (IDs, aliases, executable basenames), returning source C: paths or original info/help text. Browser Guest simulation only, no host process lookup.
- Added pure/model and desktop/mobile browser contract tests. No [run-ci] while earlier DIR /S /W + PAUSE browser CI #43683710914 remains active. Batch with later verification.
- Keep draft PR #1 and main unchanged, no release. Source-host integration commands and screenshot parity remain incomplete.


## CMD ze.START desktop host adapter — 2026-11-15 (CI staged)

- Original START command now dispatches a real installed program via DesktopShell appRegistry and OPEN_APP; shares source c170 resolver with WHERE. Unknown/unsupported apps fail visibly, no host program execution or invented windows. Missing START arg is a successful no-op per source.
- Added pure/model contracts and desktop/mobile Playwright real Notepad launch. Staged without [run-ci] while earlier DIR /S /W + browser fixes CI #43683710914 runs. Keep draft PR #1 and main untouched.


## Source CMD fixed-command dispatch + current WHERE/START acceptance — 2026-11-15

- Source Tt.execute only looks up registered ht() internal commands. BAT/CMD script execution and native process execution are **not supported by the pinned source**, despite PATHEXT default values. Avoid introducing those as invented migration requirements. A mounted Guest .bat non-execution test has been added and related source commentary corrected.
- [WHERE 526f64f](https://github.com/codersachin99/windows-os/commit/526f64f6e46b15ca28599e9d7c865ef1451c814c) returns source manifest C: program-install paths. [START aab21fe](https://github.com/codersachin99/windows-os/commit/aab21fe4ed17c285cff43da30f351999e5c8c44a) launches real installed apps via desktop appRegistry/OPEN_APP, no host programs. Browser acceptance test made foreground-safe in [7955ff2](https://github.com/codersachin99/windows-os/commit/7955ff223dd5a26358eeb6b24d8dacf2a63f9e52).
- This commit requests one [run-ci] combined acceptance for WHERE/START and source BAT-negative boundary. Earlier DIR/keyboard corrective CI [#43683710914](https://github.com/codersachin99/windows-os/actions/runs/43683710914) has already passed TypeScript/unit/source checks/build and is running browser tests; it does not verify WHERE/START. Keep CI opt-in only.
- Remain on draft PR #1, main untouched, no premature release or complete-parity claim.


## CMD simulated TASKLIST/TASKKILL source semantics — 2026-11-15 (CI staged)

- Added original Re/Ne/je simulated task listing from actual open desktop windows, image names and source PID step, aligned table and fixed source simulation memory. TASKKILL /PID and /IM send close requests via existing DesktopShell onRequestCloseWindow, never host OS process signals. Unit and desktop/mobile tests check live CMD window, missing task errors and closure.
- No [run-ci] here while earlier WHERE/START [CI #43684125612](https://github.com/codersachin99/windows-os/actions/runs/43684125612) and DIR/interactive [CI #43683710914](https://github.com/codersachin99/windows-os/actions/runs/43683710914) are still running browser suites. Verify and batch later.
- Keep PR #1 draft, main untouched, no premature release; visual parity pending.


## Source TASKLIST / TASKKILL combined opt-in acceptance — 2026-11-15

- [Simulated window process support 9c2c6b2](https://github.com/codersachin99/windows-os/commit/9c2c6b23a55c4f734805ff82849fa2634648c0db): original source PIDs, source-specified tasklist column formatting, TASKKILL /PID and /IM through existing DesktopShell window close request. Unit tests and desktop/mobile tests added for live CMD task listing and self-termination. Underlying host OS processes are never observed or terminated.
- This commit opts in to one [run-ci] combined test batch for the new source simulated task commands. Other source command changes (DIR, WHERE, START) were already submitted in earlier separate opt-in batches and remain subject to their own browser conclusions. This run verifies the latest complete feature branch including them.
- Do not claim source, unit, build or browser passes before this new workflow reports. Keep PR #1 draft, main untouched, and no premature release or full parity claim.

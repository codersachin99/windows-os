## 28 November 2026 — Taskbar preview isolation and popup lifecycle

Previous full run 46137927880 on f8e7630 still in progress at check; nonbrowser gates passed. No new [run-ci] while that run is active. Reviewed frozen taskbar-base.js handleItemMouseEnter/Leave, mountLivePreview, peekWindow/unpeekWindow, activateFromPreview and grouped toggle. Existing group minimize/restore and 200/450ms delays are retained. React snapshot already strips duplicate IDs/test hooks and replaces embedded active media, but pointer-events and aria-hidden alone do not prevent cloned controls from taking keyboard focus. Make visual clone and host inert (React 19 supported). Background, pinned and dock item context opening now cancels visible/pending previews just like running-item context; suppress new hover scheduling while context is open. Clear stale peek target if one grouped instance disappears via another close route while the rest of its group remains. These lifecycle/accessibility safeguards are React integration decisions, not a claim that frozen source implements inert or identical popup coordination. Browser regression asserts both clones inert and direct focus rejected, verifies visible and delayed pinned popup overlap cancellation and Escape focus restore on hover-capable project. New artwork and preview tests remain unexecuted. Main/pin/releases unchanged. Next inspect full run, verify accumulated artwork/preview changes with deliberate opt-in CI, continue window-management source audit.

---

## 28 November 2026 — Source taskbar program popup artwork

Previous exact-head f8e7630 run 46137927880 was still running the complete browser acceptance suite at the last check; TypeScript, unit, original-source and build gates passed. Do not cancel or start another run just for this slice. Frozen taskbar-base.js program popup uses base-icon for Open (program icon), Pin/Unpin (pin) and Close window (close); icons.registry.json has base pin/close and Onebit-specific overrides. Imported three missing original assets via base64 Git blob transfer (a29ec3b), verified matching source and target blob SHAs; existing close-onebit also matched. Registered all four in target artwork verification manifest. Added pure sourceTaskbarCommandArtwork, explicit theme prop and program art resolver to popup, original icon/label spacing and semantic decorative artwork, and source data-test-taskbar-popup selector; background menu unaffected. Existing action semantics and keyboard/focus preserved. Added unit assertions for base/Onebit artwork and XP actual browser Open/Pin/Close asset URLs and image decode; tests not executed on new head. Existing theme popup surfaces preserved; exact source typography, per-theme chrome and icon dimensions remain unverified, so no visual acceptance claim. Main/pin/releases unchanged. No [run-ci] tag for this checkpoint while previous full CI runs. Next inspect run 46137927880, then continue source taskbar/window behavior audit and verify accumulated new changes in a deliberate CI run.

---

## 28 November 2026 — Focused green checkpoint and source taskbar menu placement

Exact head 375f15f run 46132436845/job 140940337878 succeeded: TypeScript, 807 units/168 files, source inventory, byte-identical artwork, Contacts checks, Vite build, and all 384 focused browser tests passed. All five previously failed full-suite cases cleared. Full acceptance still pending exact new head.

Frozen taskbar-base.js module 2ae5/taskbar-menu offset watcher places background popup at pointer x if it fits, otherwise at x-menuWidth, bottom anchored at pointer y. Original background commands have separators after Toolbars and Show desktop; cascade/stack/side/Toolbars explicitly disabled in original, so retain disabled state. React previously reused centered item placement for background and omitted dividers. Added separate pure sourceTaskbarBackgroundPosition with viewport clamp, preserved item geometry, rendered two semantic separators and shared neutral divider paint. Added three geometry unit cases, divider-order unit assertion and actual Win7 pointer/keyboard browser regression on both projects. Changes authored, not yet executed; divider paint is a neutral adapter, exact per-theme separator visual parity remains unverified. Request standard complete [run-ci] on checkpoint to cover all earlier fixes and new changes. Main/pin/releases unchanged. Next inspect full CI; continue auditing taskbar popup item artwork and window behavior against frozen source.

---

## 28 November 2026 — Full browser results and remaining alignment/tray/Action Center fixes

Exact head 86eced1 run 46126956039/job 140923555884: all nonbrowser gates passed (807 units / 168 files). Deduplicated complete Playwright suite completed in 36.5 minutes, 1718 passed, 5 failed, 5 skipped (1728 total). Aero Noir/Oxygen sprite tests passed. Five failures: desktop/mobile theme-shell-source Win11 stale centered default assertion, desktop/mobile XP battery test expected noncharging static art on charging runner, mobile cpanel Action Center hidden sidebar. Source inspection additionally confirmed Win11 Start aligner 18ee uses saved taskbar.centered preference (not taskbar fit result); actual React Start always centered. Ported logical 4px start-edge default and saved-preference center, including narrow fit fallback. Regression checks assert actual default geometry, centered preference and narrow fallback. XP fixture now explicitly mocks battery and dispatches chargingchange, checks both original assets, current XP volume art and Win11 vector network glyph. Frozen cpanel a259 handleResize uses >500 or full; narrow sidebar is intentionally hidden, assert visibility by panel width and both disabled controls via DOM, retain empty-history and back/search contracts. No fabricated alerts or fake capabilities. Extended existing [shell-fix-check] to include theme-shell-source and cpanel specs with list output. Focused verification requested; actual new tests not yet run. Full acceptance remains pending a subsequent [run-ci], visual parity unverified. Main/locked pin/releases unchanged.

---

## 28 November 2026 — Full CI cancellation and duplicate browser execution removal

Exact head 7ef8e9c run 46122352542/job 140909398321: TypeScript, 807 unit tests (168 files), inventory, original theme artwork, Contacts checks, Vite production build and Chromium install passed. The broad source shell batch completed with 1109 passed, 3 skipped, zero failures (1112 cases, 22.4 minutes). The immediately following complete 1728-case Playwright suite repeated the broad subset and was cancelled near the workflow's configured 48-minute timeout; three dot-reporter failure markers appeared before cancellation, but no named failure summary or failure artifacts survived. Do not infer which tests failed or mark full CI green. Dedicated Aero Noir/Oxygen sprite regression is not confirmed by the broad subset alone.

CI change a1a4aa6: normal [run-ci] and manual nonvisual runs now execute the complete browser suite once; retain the old broad subset as explicit [run-ci] [shell-check] alongside existing focused flags. Use Playwright list reporter for named diagnostics on complete and broad runs. Full browser step has 60-minute timeout, job 70 minutes, failure/cancellation artifact collection is best effort. Coverage unchanged: both Chromium projects and all tests in the full Playwright testDir remain required; no test skips or retries added. All typecheck/unit/source/build gates remain intact. Ordinary pushes still skip CI. Request one full opt-in run on this checkpoint to identify remaining failures. No production code changes, no visual acceptance claim, main/pin/releases unchanged. Next inspect full CI and fix actual named failures before further taskbar development.

---

## 28 November 2026 — Focused CI result and final sprite assertion repair

Exact head c9fdac8, run 46110316560/job 140872153384: all 807 unit tests (168 files), TypeScript, original inventory/artwork/Contacts checks and Vite production build passed. Focused browser run 328 passed, 4 failed (332 total, 98.8% pass rate); all 32 previously failing cases now pass, including Ubuntu desktop/Explorer tests. Remaining failures are new to this batch: Aero Noir and Oxygen source-start-button-sprite.spec.ts first-frame assertion on both desktop and mobile. Chromium computes source background-position:0 0 as 0px, not 0%; equivalent rendering. Updated both initial and hover-exit assertions to allow exactly zero px or percent (471d9bf), preserving the artwork, sizing, source 100% hover/active frame and all keyboard checks. No production UI changes. Request standard full opt-in [run-ci] on checkpoint rather than another partial run; keep focused option available for future regressions. Full CI and exact-head sprite fixes pending verification. Visual capture still opt-in; main, legacy reference and releases unchanged. Next inspect full result before further taskbar behavior development.

---

## 28 November 2026 — CI recovery and stale shell regression contracts

Recovered actual push CI using approved GitHub REST actions/runs?head_sha=... and commits/.../check-runs (PR-only connector status was incomplete). Exact head 4ac3b67 run 46066871875 job 140734190882: TypeScript, 807 unit tests/168 files, source inventory, original artwork/Contacts checks, Vite build and Chromium install all passed. Targeted browser batch: 1077 passed, 32 failed, 3 skipped; complete browser suite not run; visual capture skipped. No Win10 search failures reported. 20 failures on desktop/mobile were stale Win7/Aero/Basic-1 Start img assertions after actual source orb sprite port; update to verify sprite background asset, visibility and crop. Ten failures were stale centered-by-default Win11/Win11dark background context coordinates (right-clicked Start); new test helper finds real unoccupied visible taskbar surface and performs physical mouse click, no synthetic events. Ubuntu artwork test timed out on both projects without a pinpointed failing line; scope launcher image to actual dock and minimize Explorer before opening desktop folder to avoid occlusion, retain independent window assertion via original mounted window ID and new visible ID. No production UI changes or softened feature requirements. Authored fixes in six specs and reusable helper; introduced opt-in [shell-fix-check] subset covering those six, source sprite and taskbar settings/search; all non-browser gates retained, standard [run-ci] remains full verification. Request one focused run on checkpoint. Exact fixes not yet verified; Ubuntu cause remains hypothesis. Next inspect exact-head run via REST, fix residual failures, then full CI before integration and continue taskbar parity. Main/pin/releases unchanged.

---

## 28 November 2026 — Win10 search glyph, catalog and delayed query

Frozen 5aea requests Iconify la:search at 24px. Replaced the approximate SVG with upstream Line Awesome search-solid.svg geometry at icons8/line-awesome@e89681366bfa03e5f2672186cb54f14e216f3092, inline SVG with currentColor, 32x32 viewBox and MIT notice. No network dependency or new package. Frozen f0aa.searchablePrograms starts from allProgramItems; reuse existing sourceWin11AllAppItems (c170 manifest + registered user apps) and append Computer/Control Panel/library places only if missing. Unmigrated original entries are visible and disabled; games registered outside showInStart can now launch. Reuse 1902 shared 300ms debounce for published query across program/settings/file groups. Enter flushes a changed query and opens its fresh default rather than a stale visible result; file scan starts after publication and aborts superseded scans. Added browser regression for SVG geometry, disabled WordPad, migrated Minesweeper, and immediate fresh Calculator Enter after old Notepad results. Existing tests remain unexecuted in this session. Earlier workflow status inaccessible through PR-filtered connector; request one consolidated opt-in CI on this checkpoint for all accumulated search changes. Remaining gaps: overlay appears immediately with pending state rather than waiting for source debounce, 500-file cap, unavailable source app implementations, incomplete device/web app catalog and exact icon asset coverage. Exact visual parity remains unverified. Next inspect CI, fix any failures, then taskbar/window management audit. Main/pin/releases unchanged.

---

## 27 November 2026 — Win10 search result artwork and real file contracts

Frozen f0aa.describeEntry/readShortcutIcon uses the original shortcut's JSON icon independently of its launch target, else 4cca.getIconType. Added reusable sourceSearchFileArtwork helper using shared theme-aware file artwork, source binary/text shortcut reader and safe malformed fallback. Win10 results resolve file artwork asynchronously with stale-query abort guards; libraries use registry icon keys with folder fallback and avoid duplicate app IDs. Added three artwork unit cases and two desktop/mobile Playwright contracts: two actual uploaded Guest documents with default selection/ArrowUp wrap/ArrowDown/Enter and content verification; uploaded Notepad shortcut with Calculator artwork, matching the Desktop icon independently of actual launch target. Exact-head e3005c1 workflow and combined status endpoints returned empty lists; connector's run lookup is PR-filtered, so neither success nor failure is known. No repository checkout available for local builds. No duplicate CI request; new tests authored but not executed. Original la:search glyph still approximate, unimported icons remain tracked fallbacks, file-result cap/debounce/catalog limits unchanged. Next obtain CI result, verify accumulated search work, then source glyph and remaining taskbar behavior. Main/pin/releases unchanged.

---

## 27 November 2026 — Win10 modern Start search groups

Frozen 26b9f0ce7: startmenu-win10 53e9, shared chunk 4b4fcada f0aa/8f99, shared startmenu-win10~startmenu-win8 bfe9, startmenu-win10.css. Modern search overlay uses source Best match promotion (first ranked app, then setting, then file), Apps/Settings/Documents/Folders/Photos/Music/Videos order, no duplicate promoted result, root library exclusions. App ranking uses existing source parser/scorer; Control Panel uses existing source registry, supported routes only and disabled unsupported destinations. File scan uses actual Guest home, excludes AppData, aborts stale searches, subscribes to VFS changes and reuses real association resolver. Arrows wrap, Enter launches selection, mouse selects, first Escape clears query and second closes. Added three unit contracts and settings launch browser regression, updated prior app search contract. Intentional gaps: immediate app/settings results rather than full 300ms source debounce, file result safety cap 500, generic file artwork rather than original shortcut/file icons, no full original program catalog beyond registered apps, and original task action coverage remains limited. New tests not run; prior CI 404; request consolidated opt-in CI after these two slices. Main/pin/releases unchanged. Next verify tests, add actual file and keyboard browser coverage, then original taskbar glyph and other taskbar behavior audit.

---

## 27 November 2026 — Win10 taskbar search entry point

Frozen vue-app.js taskbarSearch registry selects only win10; taskbar-base 2ae5 mounts 5aea beside Start. Ported source taskbar-search.js input and taskbar-search.css (white, black placeholder, #666 focused placeholder, 256px desktop width, 24px approximate search glyph), shared Start query, focus opens Start and clears tray/context popups, Escape/close clears query and blurs, typing from Start routes to taskbar field, Enter opens matching registered app. Measured capacity reserves search width and observes resize; narrow viewports shrink search field intentionally. Existing Start list is used for app results; original full overlay, Guest files/settings result groups, keyboard selection and exact Iconify glyph remain pending. New desktop/mobile Playwright contract authored, not executed. Prior run #45757125603 returned 404 during inspection; last confirmed green a52eeea. Main/pin/releases unchanged. Next implement source modern search results overlay and shared mounted-file search, then consolidate opt-in CI.

---

## 26 November 2026 — Source centered taskbar preference

Restored frozen taskbar-base bc55 default centered=false, persisted strict boolean with v1 migration, transactional Taskbar Properties checkbox for Win11/Win11dark, and 2ae5 getCenteredWidth symmetry (bar minus twice tray plus sibling show-desktop reservation and Start). Center only when all groups fit; otherwise use left-aligned normal flex tray and pagination. Dedicated docks unchanged. Used measured wider label pitch as existing React safety adapter; exact theme whitelist module e47c not located, only Win11 family enabled from verified theme CSS. Added two unit contracts and desktop/mobile browser preference/resize test; adjusted old Win11 context-menu test helper for left default. Parent CI #45757125603 passed TypeScript, units, artwork/inventory and build when checked, browser step running. No new CI requested yet. Next verify exact-head after current run; audit taskbar search and remaining behaviors. Main/pin/releases unchanged.

---

## 26 November 2026 — Taskbar pagination theme paint

Ported frozen taskbar scrollbar paint for Aero/Basic1/Vista, Classic/9x, Win31, all seven XP variants and Longhorn Slate (exact source gradient/border/shadow variables and embedded SVG arrows), Win8/10 flat arrows, Win11, Whistler/Longhorn Plex, Aero Noir, Oxygen, Kubuntu, ChromeOS and Onebit. Taskbar-only scoped rules preserve other app scrollbars. Kept 24px reserve for all themes (source Oxygen/Kubuntu width 22px remains a small layout deviation), accessible disabled edge controls and no arbitrary HTML. Added computed Win7 artwork assertions. Consolidated [run-ci] [tray-check] requested for pagination and inline formatting. Exact visual theme comparison and centered-taskbar capacity remain pending. Main/pin/releases unchanged.

---

## 26 November 2026 — Source taskbar overflow pagination

Source taskbar-base.js 2ae5, K=55, E/N scrollbar: measured base taskbar capacity, 24px vertical prev/next controls, source active group row and bounded page indices. Base themes now page pinned and running groups together; macOS/Ubuntu docks unchanged. Reserve actual wider label width and control/gap space to prevent clipping; centered Win11 uses current lane constraints rather than exact source getCenteredWidth (full centered config parity pending). Scrollbar paint is shared approximation pending source theme CSS trace. Added pure capacity tests and mobile/desktop browser paging test using existing local pin storage. New code and prior inline formatting not yet executed. Latest verified a52eeea: 795 units, 106 browsers. No duplicate CI requested. Next verify row behavior and source scrollbar skins. Main/pin/releases unchanged.

---

## 26 November 2026 — Notification checkpoint verified; source inline formatting

Exact-head CI #45654246277 passed 165 unit files / 795 tests, 106 browser tests (including both notification lifecycle projects), TypeScript, inventory, artwork, build. Visual-capture skipped. Located actual 7c5c in frozen src/modules/chunks/chunk-2d0e1bd0.js (c062ddcf60b66283f768ab2d92c3ac780df3c571): bundled Marked.parseInline, default GFM and sanitize false. Ported common safe flat inline strong/em/strikethrough/code/angle HTTP(S) autolink tokens and shared React renderer for toast/history, retaining explicit URL restrictions, raw HTML escaping, and literal Markdown image syntax (no remote image fetch). No added dependency. Full Marked nesting, bare URLs, escape semantics and reference links are not implemented; security-first subset, not full Markdown parity. Three additional tests authored; no CI rerun requested yet. Notification functional checkpoint green at parent; next resume remaining taskbar source behavior audit. Main/pin/releases unchanged.

---

## 25 November 2026 — Notification browser lifecycle and responsive test repair

Exact-head CI #45646864303 (b1b3e77) passed TypeScript, 164 unit files / 790 tests, source inventory, artwork and build; 98 browser tests passed, 6 mobile shared-hidden-tray cases failed because their old navigation targeted a now-hidden Action Center sidebar. Corrected all six cases to assert window-width-driven sidebar visibility and use the always-present Control Panel breadcrumb. Added actual browser notification lifecycle test to source-notification-tray.spec.ts, included by existing tray glob: Vite SDK singleton import from captured dev-server module URL, no production test hook or synthetic feed; checks icon-relative bounds, warning/error queue, dismiss vs read, safe popup link (locally intercepted), history order, severity artwork and persisted read flags. New browser and inline-parser tests not yet executed. Requested consolidated [run-ci] [tray-check] on this commit. Next inspect new run and address any remaining regression. Main/pin/releases unchanged.

---

## 25 November 2026 — Safe notification inline links

Restored source inline notification links in toast and Control Panel history using shared SDK tokenizer, confirmed frozen en-US update-notification-body [changelog](https://visnalize.com/win7simu/changelog). Only absolute HTTP(S) URLs without credentials, control characters or backslashes are accepted; unsupported syntax remains escaped text, no innerHTML. Real links open on explicit user click in a new browsing context with noopener/noreferrer; toast click marks message read and clears pending as f0ed. History already marks all read on entry. Original 7c5c implementation not yet located; full Markdown syntax, source external opener adapter and analytics remain pending. Added three parser and two markup cases. CI #45646864303 for parent passed TypeScript, unit tests and build at time of inspection; browser checks in progress. No extra CI requested. Next inspect exact-head verification and add browser coverage for notification lifecycle. Main/pin/releases unchanged.

---

## 25 November 2026 — Icon-relative notification balloon

Ported f0ed balloon anchoring using the measured Action Center trigger in desktop-local coordinates; source top/bottom directions, RTL alignment, narrow viewport clamping and 18px/24px tail geometry. When the icon is hidden, use the hidden-items toggle until the icon is revealed; if neither is measurable, retain desktop-edge fallback. ResizeObserver tracks tray, icon, desktop and toast dimensions; preference/hidden-panel changes remeasure. Kept toast outside the clipped hidden tray and modern Win10/11/ChromeOS fixed card positioning unchanged. Added four geometry contracts. Requested consolidated [run-ci] [tray-check] after popup/balloon/history changes; exact visual anchor still requires browser observation. No inline links or production feed enabled. Main/pin/releases unchanged.

---

## 25 November 2026 — Control Panel Action Center history

Frozen cpanel.js te/oe, handleResize and cpanel.css: Action Center history uses shared original theme-specific 32px severity icons, flex rows (16px gap), 6px logical leading severity border (#c00/#e8a200/#4a4), exact content padding, 768px maximum, preserved whitespace and empty notice. Extracted ActionCenterPanel; source mounted MarkAllRead now runs only when entering page, not every parent rerender. Sidebar hidden at <=500px panel width via container query; full-screen source special case and exact sidebar theme paint still pending. Shared artwork resolver moved to assets and re-exported from tray helper. Source inline links intentionally remain escaped plain text pending safe parser/URL adapter; archived/settings remain disabled as source. Two SSR contracts authored. No runtime testing yet, no duplicate CI requested. Next icon-relative notification anchoring and consolidated CI. Main/pin/releases unchanged.

---

## 25 November 2026 — WinUI notification balloon styling

Ported frozen vue-app.css .winui-balloon, f0ed direction and theme SCSS paint: 360px nominal balloon, 380px source max, 18px RTL-aware tail, 400px nominal modern cards (source max retained), 32px/40px icon variants, source border/gradient palettes and close controls across Win7/Vista/8, classic/XP/9x/31, prototypes, Win10/11, macOS/Ubuntu/Kubuntu/ChromeOS, Oxygen/Aero Noir and Onebit. React retains fixed desktop-edge placement with viewport bounds rather than original icon-local absolute anchoring (still pending); XP close hover is a simplified source-colored approximation; plain text retained, no executable markup. New markup direction test authored. Latest green bd11935, no new CI requested this slice. Next Control Panel Action Center history source audit, then verify accumulated visual/layout changes. No production feed activated. Main/pin/releases unchanged.

---

## 25 November 2026 — Action Center popup source dimensions

Exact-head [CI #45603617798](https://github.com/codersachin99/windows-os/actions/runs/45603617798) passed 782 unit tests and 104 browser tests, TypeScript, inventory, assets and Vite; visual capture skipped. Pinned f0ed and src/styles/chunks/chunk-517d7f56.css specify 280px popup, 24px headline, 8px summary gap/12px padding, 12px history gap and 16px/24px padding, 12px footer. Applied shared layout with viewport/hidden-tray constraints retained; normal/Onebit headline matches registry. Error/warning headline keys are absent in pinned registry; omit image rather than invent art (actual BaseIcon missing-art rendering still unverified). Existing theme paint and link navigation retained. Added unit and Win7 browser assertions; new head not tested, no duplicate CI requested. Next audit source WinUI balloon styles and anchoring, then Control Panel history. No production feed activated. Main/pin/releases unchanged.

---

## 25 November 2026 — Notification feed service and device metadata

Ported frozen 779a A() injected service with explicit URL, no-cache request, 5s abort/deadline through JSON decode, validated list entries and URL-scoped storage cache fallback. SourceNotificationStore now persists version, announcement date, session count and pushAsked alongside bounded seen/read IDs; counts once per runtime and retains flags on reset. Service load uses current flags on completion; latest load wins. Cache write failure preserves valid live data (intentional resilience); malformed individual entries skipped, non-array falls back. Five regression cases authored. No production endpoint, automatic feed load, push permission, or telemetry enabled. Requested consolidated [run-ci] [tray-check] for accumulated artwork/state/feed changes. Next inspect exact-head CI then source toast layout/Action Center history parity. Main/pin/releases unchanged.

---

## 25 November 2026 — Source notification feed selection

Ported frozen 779a pure feed targeting/date/version comparisons, localized text fallback, descending history/ascending unseen queue, default success, first-install suppression and version announcement metadata, session count and push eligibility. Explicit SourceNotificationStore.replaceFeed implements original SetEntries using existing flags; it replaces active history/queue and is not automatically invoked. Duplicate IDs are rejected after first eligible entry (React keys/queue safety). Six unit contracts authored. No actual feed URL, remote fetching, cache, push permission, analytics, or version-state persistence wired; no synthetic announcements or permission prompts. Next implement injected feed/cache service and persist version/session metadata, then batch CI. New tests unexecuted; last green 4f6e09f. Main/pin/releases unchanged.

---

## 25 November 2026 — Original notification state lifecycle

Located original 779a in frozen src/modules/runtime/vue-app.js. Source severity is unread error then warning only; Dismiss persists seen ID, MarkAllSeen clears pending without marking read, MarkRead and MarkAllRead clear corresponding pending and persist both flags, Promote puts a known entry first. Ported all these operations and bounded device-local seen/read persistence (50 IDs each; session reset retains flags). History content is not persisted: trusted local publishers can republish to restore flags, while source feed date/target filtering, localization, version announcement, cache/fetch, deferred push ID and Android permission/telemetry are not yet ported. No external service or synthetic production notifications added. Added four unit contracts and extended existing tests. No new CI requested; latest green remains 4f6e09f, newer artwork/lifecycle tests pending. Next implement pure feed selection and version-state adapters, then combined verification. Main/releases/pin unchanged.

---

## 25 November 2026 — Theme notification artwork

Exact-head battery/tray [CI #45592881400](https://github.com/codersachin99/windows-os/actions/runs/45592881400) passed 765 units and 104 browsers, TypeScript, inventory, art and Vite; visual capture skipped. Frozen f0ed selects themeData.icon[notifi-type]; all 12 original error/success/warning images imported byte-identically from four icon families and centralized in sourceTrayArtwork. Toast receives active theme, renders success artwork, keeps 32px image from shrinking, and preserves existing 8-second timer, dismissal and escaped text. Guest info has no source registry entry and stays text-only. Added family and rendered-markup unit assertions. No new CI requested; tests not executed for new head. Source notification store 779a, producer, remote feed and exact balloon paint remain pending. Next locate 779a and audit lifecycle. Main, pin, releases unchanged.

---

## 25 November 2026 — Battery popup source meter

Confirmed consolidated [CI #45588193465](https://github.com/codersachin99/windows-os/actions/runs/45588193465) on 27e74e7: 761 unit and 104 browser tests passed; TypeScript, inventory, artwork and Vite build green; visual capture skipped. Pinned a88c and chunk-391f23b6.css now use the exact original battery-meter sprite, 32px meter, raw-level <10%/<20% frame selection, -960px charging overlay, full/remaining/charging locale text and original non-macOS brightness label. macOS keeps original separate summary. Unknown browser battery remains unavailable (no fabricated charge); Guest power plans and brightness do not change native device settings. Unit thresholds and browser live updates authored; [run-ci] [tray-check] requested to validate all post-green tray changes. Full pixel parity remains unverified. Next inspect exact-head CI, fix regressions, then source notification toast artwork and lifecycle.

---

## 25 November 2026 — Action Center and network artwork

Pinned f0ed/e0ee and registry: Action Center tray now selects inherited error/warning art (Onebit shared severity SVG) with three original assets imported and Git blob verified. Guest info/success uses normal flag because registry has no corresponding variant; original severity store and missing headline variant behavior remain pending. Network uses vector only for Win10/11/macOS, offline opacity and Win10 rotation; Ubuntu/base families use source image. Popup always uses inherited signal/wired/offline image rather than tray glyph; exact Iconify vector shape and native controls remain pending. Added unit and historical/modern browser assertions; no runtime execution or duplicate CI requested. Battery audit confirms non-macOS uses a source 32px sprite meter and remaining/charging label; port next. Main, frozen source and releases unchanged.

---

## 25 November 2026 — Inherited tray artwork audit

Frozen icons.registry.json and shared~plugin-cssvar~sandbox~vue-app~vue-store.js confirm default colored volume icons for Win7/Aero/Basic/Vista/Win8/81/Oxygen/Aero Noir; Win10/11/macOS/ChromeOS/Ubuntu/Kubuntu override them; Longhorn Slate uses winxp iconPack and Plex has matching explicit icons. Centralized volume theme mapping in sourceGuestAudio, routed Longhorn network/battery/action-center through XP artwork, imported four missing default volume binaries with exact source SHA, and verified already-present 100% binary. Removed grayscale filtering from default colored mute glyphs, preserving dark high contrast override. Updated four existing tray tests and prototype icon assertions, added mapping unit coverage. No runtime tests executed; no duplicate CI requested. Next audit Action Center severity and shared source network/battery rules; CI result remains inaccessible without push run ID.

---

## 25 November 2026 — Tray interaction and geometry audit

Audited accumulated tray changes against live branch source. Push-triggered CI result cannot be retrieved by available GitHub connector (PR-only workflow list empty; combined status empty), so no CI outcome claimed. Fixed measured nested flyout height and width based on actual panel rect and viewport (ResizeObserver + resize; RTL included), added document Escape fallback after keyboard focus leaves hidden group, preserved Win7/Vista/Win8 and Win11 today styling on hover/focus, and improved modern header wrapping. Corrected year-picker test locator, closed Notification Area Icons settings after preference edits to test actual Customize navigation, and added nested popup vertical bounds and external-focus Escape regressions. No execution observed and no duplicate CI requested. Main/releases/source pin unchanged. Next inspect push workflow job results when run ID is available, then resolve actual failures and audit inherited art.

---

## 25 November 2026 — Onebit tray and consolidated verification

Onebit pinned theme-onebit-scss.js source dark #352b30, sand #e6d4bf, inverted tray popup with 2px outline, today/selected inversion and source clock color. Shared controls extended to Onebit; seven original SVG binaries copied with verified source SHA and importer entries, including original volume thresholds. Battery uses existing capability-based SVG (no dedicated Onebit registry override); exact full source shell/pixel paint still pending. Added browser and unit tests. [run-ci] [tray-check] requests one consolidated opt-in run covering all source-*-tray.spec.ts and Taskbar Settings/Performance, with normal TypeScript/unit/inventory/artwork/build gates. No execution result observed at commit time. Main/releases/pin unchanged. Next inspect CI failures and fix regressions before more feature work.

---

## 25 November 2026 — Historical Windows interactive tray

Pinned theme-win9x/win31/winW/winlonghorn source tray styles and registry: Win31, Win95/98/2000, Whistler (winW), Longhorn Plex (winLP) and Slate (winLS) now route through shared interactive tray and hidden flyout. Four missing Win2000 network/speaker binaries imported with exact source SHA; XP Action Center/battery reused for historical themes and XP icons for Whistler. Win9x source opaque bevel, palette, gray weekdays, yellow dotted selection and square marks; Win31 square outline; Whistler pale surface and blue today; Longhorn directional borders and Slate shadow. Source-specific paint adapted to React component structure; Win31 calendar uses shared retro treatment, Longhorn inherited icon artwork and full visual parity still pending. Seven browser scenarios and unit mapping test authored, not executed. No new CI requested; next Onebit and consolidated verification. Main/releases/pin unchanged.

---

## 25 November 2026 — Modern Windows interactive tray

Pinned theme-win8/10/11-scss.js: Win8/81 use accent frame, white content, pale footer and inherited Win7 calendar/analog clock; Win10 dark #1f1f1f popup, 30px square days, accent selection and digital header; Win11 light/dark #f9f9f9/#242424, 6px radius, circular 40px days and source palette. Shared live tray controls and hidden tray lifecycle extended to five IDs. Digital-only modern layout is a source-style adapter (exact legacy datetime component markup not yet audited); exact source volume/network artwork for Win8 and other inherited variants pending. Authored five browser scenarios; no tests executed. Main/releases/pin unchanged. Next historical base families and consolidated verification.

---

## 25 November 2026 — XP family interactive tray

Pinned theme-winxp-scss.js blob 780085761632998d6ad003b3f2b754ab7fcab6ea: XP seven theme IDs use source opaque surface and mirrored four-layer bevel, rounded inset calendar/clock panels, weekday bar overrides and square clock marks. Shared interactive tray and hidden flyout now cover all seven. Original XP registry maps action-center, network/offline, battery/charging and all volume thresholds to specific assets; seven binaries checked against source blob IDs. Shared components accept explicit xpArtwork/xpLayout options; unavailable battery still shows unknown glyph. Source calendar mark bevel is approximated in SVG, inherited Silver header color and full clock paint not certified; native controls unavailable. Added seven browser scenarios and audio mapping unit test, not executed. No new CI requested. Main/releases/pin unchanged. Next remaining historical tray families and consolidated verification.

---

## 25 November 2026 — Vista interactive system tray

Pinned src/modules/themes/theme-winvista-scss.js blob 0ab2f2627a079c4c557d6507c0f6394ddf83e31c specifies #f0f0f0 popup and 1px rgba(0,0,0,.4) border, transparent popup menu, rounded pale-blue gradient hover, and identical Win7 calendar/clock colors and bevel. Vista now uses shared functional tray and hidden icon lifecycle (Action Center, live browser network, capability-based battery, Guest brightness/audio, calendar and clock), explicit Vista root selector, common calendar/clock CSS, and dedicated flat popup adapter. Registry winvista overrides omit network and volume; network uses inherited base artwork, exact inherited volume sprite and battery asset parity remain pending (existing shared art retained). Source popup-button hover mapped to shared React controls; exact source screenshot and native controls not certified. Browser regression covers login, network offline, battery, volume, clock, calendar, popup bounds and Control Panel. Tests authored, not executed; no additional CI requested. Main, releases and pinned source unchanged. Next XP family tray, then inherited artwork and consolidated verification.

---

## 25 November 2026 — Shared hidden tray and fixed top bars

Pinned source taskbar-base.js renders TaskbarHiddenItems only when hiddenItems exists, with real component slots. Pinned taskbar-macos.js and taskbar-ubuntu.js instead render fixed tray components with no hidden-items flyout. Extended Win7 interactive hidden tray to ChromeOS/Kubuntu/Oxygen/Aero Noir via explicit base routing, preserved shared popup lifecycle and added bounded nested panel geometry plus theme-aware footer. Dedicated macOS/Ubuntu now keep hidden/notifications-only enabled items directly visible (honor off and clock preferences as a Guest compatibility choice, although original dedicated markup is fixed); no invented hidden arrow. Added six-theme browser regression exercising Control Panel preferences, real volume controls, Escape and Customize. Source centered flyout and original compact Ubuntu behavior remain pending, exact screenshots not certified. Tests authored, not executed; no additional CI requested; previous consolidated CI status remains unresolved. Main, pinned source and releases unchanged. Next verify latest batch, then migrate Vista/XP/remaining base tray styles.

---

## 25 November 2026 — Interactive hidden tray

Pinned taskbar-base.js TaskbarHiddenItems renders real hidden component slots, a wrapped icon row, clickout and Customize link opening cpanel notification. Win7/Aero/Basic 1–4 now reuse exactly the same visible/hidden renderer, hide the arrow when there are no hidden items, keep the parent mounted during nested popup ownership, restore keyboard focus on Escape, dismiss outside and close on theme/start/preferences changes. Both hidden and notifications-only behaviors work; off remains excluded. Added source-style row/footer and nested positioning, plus browser regression for real preference edits, volume, network, Escape, popup switch and Customize. Other theme families retain their prior hidden-icon display until their popup placement is adapted; source centered flyout and native host controls are not pixel/functionally certified. No tests executed and no new CI requested (prior batch pending). Main/releases/frozen source unchanged. Next verify latest CI and extend hidden tray lifecycle to remaining shared families.

---

## 25 November 2026 — Classic and High Contrast tray

Frozen theme-win7-classic-scss.js final effective popup rules override the earlier outer bevel with square 1px black border and no shadow; Basic 3/4 use currentColor border and theme-surface inner panels. React now routes Basic 2/3/4 to existing Win7 shared interactive tray, with source opaque palette, 440px calendar cap, themed month header and mirrored arrow bevel, selected/today accent and dotted selection outline, same source clock, muted outside-date color, and Basic 4 weight. Aero glass/shadow explicitly excluded for Classic. Existing Win7 today hover specificity tightened. Tests authored across all three variants for popup styling, navigation, keyboard ownership and volume. Reviewed prior Aero Noir Start selectors against current markup; they exist. Consolidated existing [aeronoir-check] adds Win7 tray, Performance Options, taskbar settings and Classic RTL context regression alongside Ubuntu/Kubuntu/Oxygen/Aero Noir and palette/sprite tests; all non-browser gates retained. CI requested, not confirmed executed; connector PR-only workflow lookup still limits verification. Source layout uses shared React components; exact asset variants, hidden-icon interactivity and host controls remain incomplete; paired visual gate outstanding. Main, frozen source and releases unchanged. Next verify CI if accessible, otherwise continue source registry/artwork and remaining theme tray coverage.

---

## 25 November 2026 — Win7 Aero and Basic 1 interactive tray

Pinned theme-win7-scss.js: Win7/Aero 1–4 and Basic 1 tray now uses shared Action Center, network (base source artwork), battery capability and Guest brightness, Guest volume/mute, numeric DateTime, notification toast, and calendar navigation. Source black 7px radius/6px padded five-layer glass frame, mirrored gradients and conditional 4px glass/shadow, white body/light-blue footer, dotted today calendar and 128px beveled analog clock ported; Basic 1 removes radius/padding/shadow and uses #646464 border. Shared static icon wrappers preserve positioning; existing Kubuntu/Oxygen/Aero Noir selectors expanded only via explicit root data-source-win7-tray. React inner panel structure and analog SVG geometry are source-adapted, not pixel-certified. Native host settings not enabled. Added full Win7 tray interaction contract and five family calendar checks; no tests executed or CI requested this slice. Classic/High Contrast Basic 2–4 separate source paint next, then consolidated verification. Main/source/release unchanged.

---

## 25 November 2026 — Taskbar animation performance option

Frozen source theme-win7-scss.js uses opacity calc(0.4s * var(--effect-animate-taskbar)) for the Start orb hover layer. Existing SystemPerformance only modeled glass/shadows; this slice adds independent animateTaskbar with auto/appearance enabled, performance disabled, custom draft, Apply/OK/Cancel, and backwards-compatible v1 preference migration (old performance false, other presets true). Existing legacy source SystemPerformance dynamically derives checkbox labels from effect keys; exact localized label/preset hardware autodetection not reverified. React maps the effect to the existing Win7-family sprite fade, retaining immediate open and reduced-motion preference. Other taskbar animations remain to be wired; no host operations enabled. Updated unit and browser regression contracts including old saved settings, no pre-Apply mutation and reload. Tests authored but not executed, previous push CI result still inaccessible; no duplicate run requested. Main, frozen source, releases unchanged. Next verify latest batch and address remaining functional Win7 tray parity.

---

## 25 November 2026 — Win7 family Start orb sprite

Frozen theme-win7-scss.js .win7 StartButton rules and 3b8c registry establish 54px width, background-size 100%, normal -7px, hover overlay -61px and open -115px, mirrored RTL. Extended existing verified base sprite renderer to Win7 alias, Aero 1–4 and Basic 1 (same icon pack). Classic Basic 2–4 retain their independent win7classic icon. CSS uses original .4s fade, no transition while open and reduced-motion fallback; the individual legacy animate-taskbar performance switch is not yet modeled. Added six-theme state/RTL browser regression and classic logo guard to existing focused sprite spec. Existing Aero Noir/Oxygen implementation preserved. Tests not executed; previous exact-head push-triggered CI status remains unavailable via connector's PR-only workflow lookup. No duplicate CI requested for this slice. Next verify full sprite batch and continue theme coverage; main, pinned source and releases unchanged.

---

## 25 November 2026 — Aero Noir and Oxygen source Start sprite

Frozen src/config/icons.registry.json base start points to start-button.b35eae12.webp; Aero Noir and Oxygen overrides omit start. Existing React asset Git blob SHA aedd5f662a1bd181ec2193131abc396c0b7d11a9 matches pinned inventory; decoded VP8X header confirms 108x324. Original StartButton module 2159 uses w-14 wrapper and full-size icon; both frozen theme styles explicitly set background-size 100% 300%, normal top and hover/open bottom with RTL anchor. React renders the source sprite in a decorative span on those two themes, preserving accessible button and shared Start lifecycle; other themes unchanged. Added exact blob to artwork audit and browser regression for image dimensions and frame state. Previous push CI cannot be resolved through available commit workflow lookup (PR-triggered runs only) or combined statuses; no pass claim. This new exact-head opt-in expands Aero Noir batch to Ubuntu/Kubuntu and registry tests because palette changes need coverage, without full repeated browser suite. Tests not yet executed. Original Win7's separate sprite rules, exact visual pairs, and complete custom appearance integration remain pending. Main/frozen source/releases unchanged. Next inspect CI if available and continue remaining source gaps.

---

## 25 November 2026 — Source registry palette correction

Source registry directly verified in frozen legacy-win7@26b9f0ce7 src/modules/chunks/shared~plugin-cssvar~sandbox~vue-app~vue-store.js modules 2299/3b8c (palette indexes 6 Ubuntu #f0b85b, 1 Kubuntu #5986ca, 4 Oxygen #b3e165, 3 Aero Noir #6bc35b). Replaced provisional shell and portaled menu accents; Oxygen fixed #3c92c8 link color retained. Original shared~personalize~plugin-cssvar.js de(e,r) sets active alpha .65 and inactive .3 when transparent; Aero Noir glass inactive token now uses verified .3, opaque inactive color and Appearance integration remain pending. Updated existing RGB browser assertions to the registry values without removing checks and added four-theme default token regression. Also located frozen src/config/icons.registry.json: Aero Noir and Oxygen theme packs omit start, base start is start-button.b35eae12.webp; sprite rendering and fallback inheritance audit deferred to next slice. Prior Aero Noir exact-head workflow query returned no visible runs (not a success claim); this independent palette commit does not request duplicate CI until prior status known. Tests authored, not executed; next check CI and verify palette batch across all affected themes. Main, frozen source and releases unchanged.

---

## 25 November 2026 — Aero Noir tray and focused verification

Frozen Aero Noir theme source taskbar-popup/ColorCalendar/clock-hand selectors ported to shared interactive base tray. Enabled Guest Action Center/notification history, browser network and battery capabilities, Guest display brightness and media volume, numeric date and marked 128px analog clock. Source dark inner gradient and accent border, 4px radius/glass, mirrored shadow and selection/today gradient; React dialog surface layers approximate original separate tinted shell and panel wrappers. Reuse shared static tray geometry and base network artwork; no filter on icon wrappers. Native connectivity, host brightness/volume/date settings and exact tray artwork remain incomplete. Added focused browser coverage and [run-ci] [aeronoir-check] batch for Aero Noir, Oxygen, shared cascade/shell and Personalize; all TypeScript/unit/source/artwork/Contacts/Vite gates retained, full browser suite and paired screenshots not requested. CI pending until exact head passes; no release or merge. Next inspect real CI and fix any failures, then remaining palette/source parity gaps.

---

## 25 November 2026 — Aero Noir context and Explorer

Frozen legacy-win7@26b9f0ce7 src/modules/themes/theme-aeroNoir-scss.js (blob be07ef24...) WinUI Menu/MenuBar, ListView/TreeView and WindowAddress/SidePane/StatusBar ported: #555/#333 menus, #888 border and directional shadows, isolated .6 opacity/.7 brightness accent hover layer, glossy menubar, #555 list, #333 navigation, #444 status, inset address/textbox paint and source gradient/brightness selection. Body-portaled Start context uses verified solid palette fallback; optional glass alpha on portal and exact menu artwork/checkmarks remain pending. Shared cascade geometry and Guest file actions untouched. Extended existing edge suite to Aero Noir; added Desktop/Computer/Bin/Start/Notepad menu paint and real Guest upload/view-selection tests. Browser tests authored, not executed. Next Aero Noir tray/DateTime and focused CI; no extra marker for this slice. Exact paired visual comparison still blocked by LEGACY_SOURCE_READ_TOKEN. Main, frozen source, draft PR, releases unchanged.

---

## 24 November 2026 — Aero Noir Start base launcher

Pinned src/modules/themes/theme-aeroNoir-scss.js (be07ef24...) specifies a 400px two-column startmenu__wrapper, 248px left and 140px right with 30px top inset, 60% tint layer, 4px optional glass, dark gradient and glossy program/link states. Pinned startmenu-base.js supplies Guest library shortcuts and configured power action; shared React base Start family now includes aeroNoir (recent programs, installed tree, touch-aware search focus, actual Guest Documents/Pictures/Music, configured power button). Source layout paint and compact viewport bounds added; existing shared avatar preview/library artwork, Contacts link, incomplete source Default Programs/Help and secondary power menu remain adapters or gaps, not full source behavior. StartButton module 2159 uses themeData.icon.start and 300% vertical sprite state CSS; exact Aero Noir registry sprite key not yet verified, existing icon preserved. Added browser test for real navigation/search and dimensions, not executed; no new CI marker. Next Aero Noir context menus/Explorer, then tray and consolidated verification; exact source artwork/preview and power options still outstanding. Main, frozen source, draft PR and releases unchanged.

---

## 24 November 2026 — Oxygen verified / Aero Noir WindowMain

Oxygen exact-head rerun [#45420655049](https://github.com/codersachin99/windows-os/actions/runs/45420655049) SUCCESS: 159 unit files, 757 tests, 89 browser passed / 1 skipped; TypeScript, pinned inventory/artwork/Contacts and Vite build passed. Visual capture skipped. Aero Noir WindowMain source verified directly against immutable legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776, src/modules/themes/theme-aeroNoir-scss.js (blob be07ef24d8856dc6a1ae440eca2367f3a4f840cf). Ported 6px frame, mirrored corner gradients and active/inactive shadows, glass effect, dark body, 23px green/gold/red glossy circular controls, 5px logical spacing and title glow. React uses shared window lifecycle; static padding and maximized reset are bounded adapters, inactive tint fallback #555 is provisional, original glyph fidelity and appearance integration pending. Browser regression authored but not executed; no new CI marker until Aero Noir batch is ready. Next: original Start menu and button mapping. Paired screenshot acceptance still pending. Draft PR/main/source/releases unchanged.

---

## 24 November 2026 — Aero Noir base shell initial slice

Oxygen rerun 45420655049 at 4942c28 passed all build/unit/source/artwork gates, browser pending when inspected. Aero Noir isolated source taskbar/desktop first slice: original gloss, inset highlight, active/open task gradients, desktop selection brightness/shadow, optional 4px taskbar glass layer and source palette 3b8c/2299 index 3 #6bc35b (65% active alpha when glass on). Exact palette evidence also Kubuntu index 1 #5986ca, Oxygen index 4 #b3e165, Ubuntu index 6 #f0b85b; those previously provisional colors to be corrected in a separate verified batch. Aero Noir CSS uses default source transparency and visual-effects flag, separate appearance Save/Cancel integration and inactive color still pending. Original Start sprite mapping, full window/launcher/context/Explorer/tray and screenshot parity pending. Browser test authored, not executed; no additional CI marker. Next check Oxygen rerun then Aero Noir WindowMain.

---

## 24 November 2026 — Oxygen focused CI locator repair

Oxygen CI [45416420482](https://github.com/codersachin99/windows-os/actions/runs/45416420482) at 198ad40: TS, 159 unit files / 757 tests, source inventory, original artwork, Contacts and Vite passed; 85 browser passed / 4 failed / 1 skipped. All four failures are two test locator defects reproduced in both projects: Oxygen Start spec expects non-existent .source-oxygen-start-body although original shared layout uses .source-kubuntu-start-body; Notepad menubar spec matches hidden program list plus search result. Correct both locators only, retaining full behavior and styling assertions; no source changes or weakened checks. [run-ci] [oxygen-check] rerun requested. Do not certify Oxygen until rerun completes. Next Aero Noir.

---

## 24 November 2026 — Oxygen tray and focused verification

Oxygen tray/DateTime source slice: shared base Guest Action Center, notification history, browser connectivity/battery, Guest brightness/audio, numeric date and marked 128px analog clock. Reuse verified Kubuntu base tray geometry by broadening selectors, retain Kubuntu-only glass and override Oxygen with original #40464d/#2f3438 gradient, #474c55 border, 4px corners, logical shadow, source calendar picker and hover borders. Static icon wrappers retain popup positioning; source hover paint on trigger. Browser date settings remain disabled; native connectivity/brightness/audio unavailable. Added Oxygen tray test and focused [run-ci] [oxygen-check] suite (all Oxygen/Kubuntu specs, shared cascade, shell and Personalize); build/unit/source/artwork gates retained. Results pending. Exact Start sprite, full icon map, accent and visual parity still unresolved. Next inspect actual CI results before further theme slices.

---

## 24 November 2026 — Oxygen context and Explorer

Oxygen WinUI context/Explorer source slice: original #40464d/#2f3438 gradient, #474c55 borders, 4px menu corners, inset accent hover, double gradient separators, directional submenu highlight; desktop/taskbar/Explorer/Notepad and body-portaled Start contexts. Shared measured cascade engine retained; added Oxygen to existing desktop cascade edge test. Explorer address/search, navigation and list gradient selection pseudo-layer, details headers and status/menubar ported; selection still owned by Guest filesystem. Added context and Explorer tests, including file upload and fast view changes; tests not run yet. Accent fallback remains provisional; exact original popup icon/checkmark and native widget details partial. Next interactive tray/DateTime and focused verification.

---

## 24 November 2026 — Oxygen shared source launcher

Oxygen source theme-oxygen-scss.js explicitly styles .startmenu__wrapper.is-kubuntu. Reused SourceKubuntuStartMenu with typed theme parameter, keyed remount per theme, themed Guest/application/file artwork and separate test hooks. Original 6px rounded gradient wrapper, #474c55 border and source shadow; same 320px body, sorted program list, recents, grouped Guest search, account and six footer actions, existing shared context callbacks. Tests for Oxygen source paint, icon, launch, recents, settings, Documents and logoff authored, not executed. Exact source Start button sprite mapping not yet located; retained existing button art, no invented sprite. Footer glyphs, full app icon registry and exact settings task-level results remain partial. No additional CI marker; next Oxygen context/Explorer, then tray and focused batch.

---

## 24 November 2026 — Kubuntu / Personalize verified, Oxygen WindowMain

Exact-head CI [45413134164](https://github.com/codersachin99/windows-os/actions/runs/45413134164) at 01163fe SUCCESS: 159 unit files / 757 tests, 73 browser passed / 1 skipped / zero failed, TypeScript, inventory, artwork, Contacts, Vite build. All 35 theme cards, Kubuntu volume fix and initial Oxygen shell verified in targeted browser suite. Full suite and visual capture skipped. Oxygen WindowMain source theme-oxygen-scss.js: #31363b frame, #474c55 border, 4px radius, #2a2e32 body, active accent glow and inactive shadow, 20px gradient circular controls and 10px logical end spacing; hover close red #da4453. Existing shared lifecycle/SVG fallback retained; accent #3c92c8 is provisional source link color, not verified original registry. New browser coverage authored, not run. Next Oxygen Start button sprite and launcher.

---

## 24 November 2026 — Complete Personalize theme selection / Kubuntu tray repair

User requested in-app switching to test all themes. Exposed all 35 non-duplicate source IDs (excludes source base and canonical Win7 alias, Windows 7 Aero card remains), added the original fourth Other Themes gallery, source wallpaper previews, existing SET_THEME immediate/persistence route, coverage for each added card and Kubuntu login after reload. Display labels/group placement for previously absent variants are readable adapters; unfinished skins are selectable, not certified. Kubuntu CI 45412140618: 757 units passed, build/inventory/artwork passed; browsers 49 passed / 2 failed / 1 skipped (mute popup disappears on desktop/mobile). Suspected cause: hover filter on tray icon wrapper establishes containing block and relocates absolute popup; apply brightness to trigger/image only. Preserve failing mute assertion; rerun with [run-ci] [kubuntu-check], also includes Personalize and initial Oxygen shell tests. No release/merge.

---

## 24 November 2026 — Oxygen base shell initial slice

Kubuntu CI [45412140618](https://github.com/codersachin99/windows-os/actions/runs/45412140618) passed TypeScript, units, inventory, artwork, Contacts and production build; browser pending when inspected. Independent Oxygen first slice from frozen theme-oxygen-scss.js at 26b9f0ce7: base bottom taskbar with dark gradient/top highlight and active/open glow, desktop icon label shadow and original embedded WebP 8px border-image selection transferred directly (whitespace normalization only). Shared window commands retained; source start sprite states and popup/window/Start/Explorer/menubar remain pending. New browser regression authored, not run. No CI marker on this isolated slice. Next inspect Kubuntu browser outcome, repair if needed, then Oxygen window chrome.

---

## 24 November 2026 — Kubuntu tray and focused verification

Kubuntu source 582b base taskbar: enabled shared Guest Action Center, browser connectivity and battery, Guest brightness/audio, numeric date and base calendar with 128px analog clock. Dark translucent source surfaces, 3px popup corners, calendar borders/accent, optional glass. Absolute tray anchoring avoids fixed-position containing block from taskbar blur; viewport sizing is adapter. Browser capability limitations and disabled native settings remain. Focused [run-ci] [kubuntu-check] runs all build/unit/source/artwork gates, Kubuntu specs plus shared cascade and prior shell regressions. CI pending; no visual capture/release. Next diagnose real results, resolve failures before next theme.

---

## 24 November 2026 — Kubuntu context and Explorer

Ported source 582b dark translucent WinUI context/menu paint, 3px borders, disabled/hover/focus states, shared menubars and Explorer address/search/nav/list/status across Computer and Bin. Accent row layer remains separate from content; portal fallback accent is provisional #3daee9. Menu color-mix is a paint adapter; original optional popup glass blur deferred to avoid establishing a new containing block for fixed cascades. Existing measured cascade geometry unchanged, expanded regression to Kubuntu. No CI requested this slice; tests unexecuted. Next: Kubuntu interactive tray/DateTime and consolidated verification.

---

## 24 November 2026 — Kubuntu Start menu

Kubuntu original launcher module 8753 and bfe9, shared f0aa: Guest account header, search, 256px alphabetical program pane, 320px body, four-column 100px recent tiles, grouped overlay, Documents (opens Computer as source), Games, Settings, Restart, Shutdown and Log off. Uses existing source program registry, shared ranked program/Control Panel search and mounted Guest files, program context hook and actual session commands. Responsive compact grid and footer are adapters; temporary footer glyphs are not exact source Iconify artwork, current account label is Guest, settings results are supported panels rather than all original task-level entries. Tests authored, not executed. Next Kubuntu context menus/Explorer.

---

## 24 November 2026 — Ubuntu verified / Kubuntu WindowMain

Ubuntu rerun [45409926204](https://github.com/codersachin99/windows-os/actions/runs/45409926204) at 711015d passed all gates: 159 unit files, 757 tests; focused browser 53 passed / 1 skipped / 0 failed. Full browser and visual capture intentionally skipped. Kubuntu WindowMain source module 582b: #31363b frame, #4f585f border, 4px radius, active/inactive shadows, #2a2e32 body, 24px circular controls with 5px logical spacing, red active and white inactive close. Common WindowFrame lifecycle and fallback glyphs retained. Maximized square frame is shared shell adaptation. Exact static-dialog sizing, app body paint and inactive-state screenshot comparison remain pending; new browser contract not run. Next Kubuntu Start menu.

---

## 24 November 2026 — Kubuntu base shell initial slice

Kubuntu starts from original theme-kubuntu-scss.js module 582b and uses the source base taskbar, not the Ubuntu dock. Ported isolated taskbar/desktop paint, 47px compact tasks, active/inactive group states, optional glass blur and icon selection alpha layer. #3daee9 is the provisional Breeze accent pending exact registry verification. Shared base geometry and commands retained. Kubuntu shell browser regression authored, not run; no new CI while Ubuntu rerun 45409926204 is active. Next Kubuntu window chrome and launcher after checking Ubuntu results.

---

## 24 November 2026 — Ubuntu CI regression repair

Run [45408745508](https://github.com/codersachin99/windows-os/actions/runs/45408745508): TypeScript, all unit tests, source inventory, byte-identical artwork, Contacts source checks and production build passed; focused browser 49 passed / 4 failed / 1 skipped. Both projects reproduced two issues: generic tray position:relative captured Ubuntu clock's absolute centering; rapid view switches retained list item's 400ms double-tap state and opened Notepad. Fix: Ubuntu-only position:static tray, and key Explorer item instances by view mode and URI (selection remains session-owned). Added explicit no-Notepad assertion while preserving rapid view change regression; keep original clock geometry assertion. Rerun with [run-ci] [ubuntu-check]. Results pending. No full browser suite or visual capture. Next: inspect rerun before Kubuntu.

---

## 24 November 2026 — Ubuntu focused CI batch

Opt-in `[run-ci] [ubuntu-check]` retains TypeScript, all units, source/artwork checks and build, then exercises Ubuntu logon/shell/launcher/window/context/Explorer/tray plus shared cascade and XP/Win11 shell regression on Chromium projects. Static review corrected shared DateTime wrapper positioning that overrode Ubuntu clock centering; added geometry assertion. CI result pending; no visual capture or release. Next: inspect run, repair actual failures, then Kubuntu.

---

## 24 November 2026 — Ubuntu tray and DateTime

Integrated shared Guest Action Center/network/battery/volume, exclusive popup owner, original system menu and calendar/analog clock. [Source trace](UBUNTU-TRAY-SOURCE.md). Browser regression authored, not executed. Next focused Ubuntu CI, resolve failures before Kubuntu. Main/frozen source/draft PR unchanged.

---

## 24 November 2026 — Ubuntu Explorer and application menubars

Ported original dark address, navigation, search, list selection, status and shared Notepad/Explorer menubars. Real Guest file operations unchanged; browser contracts authored, not executed. [Source trace](UBUNTU-EXPLORER-SOURCE.md). Next Ubuntu tray, DateTime and system menu, then focused verification. Main/frozen source/draft PR unchanged.

---

## 24 November 2026 — Ubuntu Desktop and WinUI context menus

Source per-icon selection and shared dark menu palette across Desktop, Explorer, menubars and Start portal. Existing measured cascade geometry retained, Ubuntu added to edge/keyboard coverage. [Source trace](UBUNTU-CONTEXT-SOURCE.md). Tests pending. Next Explorer chrome and menubar, then tray/DateTime. Main/frozen source/draft PR unchanged.

---

## 24 November 2026 — Ubuntu WindowMain chrome

Ported original active/inactive frame, titlebar and circular controls; shared lifecycle and responsive dock/top reserve. [Source trace](UBUNTU-WINDOW-SOURCE.md). Browser regression authored, not executed. Next desktop selection/context and Explorer. Main/frozen source/draft PR unchanged.

---

## 24 November 2026 — Ubuntu Activities / Launchpad

Ported original overview grid, page controls and grouped real Guest program/settings/file search. Shared Activities and dock toggle. [Source trace](UBUNTU-LAUNCHPAD-SOURCE.md). New tests authored, pending execution. Next Ubuntu window chrome, desktop/context and Explorer. Main/frozen source/draft PR unchanged.

---

## 24 November 2026 — Ubuntu top bar and vertical dock

Ported original recent + running item ordering, 64px dock, 32px top bar and maximized workspace bounds; real Guest focus and original artwork. [Source trace](UBUNTU-SHELL-SOURCE.md). Previous focused ChromeOS [CI #45405625966](https://github.com/codersachin99/windows-os/actions/runs/45405625966) passed. New Ubuntu unit/browser contracts authored, not executed. Next original Ubuntu Activities/launcher and window chrome, tray/context/Explorer. Main/frozen source/draft PR unchanged.

---

## 24 November 2026 — ChromeOS DateTime and focused verification

Shared calendar plus original 128px analog marked face and digital seconds, source time formulas and date reset. Native date settings disabled honestly. [Source trace](CHROMEOS-DATETIME-SOURCE.md). Added focused [run-ci] [chromeos-check] verification including ChromeOS specs, cascade edges and prior XP/Win11 artwork repair; all nonbrowser gates preserved. Latest batch results pending. Next repair exact-head failures, then Ubuntu. Main/frozen source/draft PR unchanged.

---

## 24 November 2026 — ChromeOS shared tray

Reused base source Action Center, Network, Battery and Volume functionality with theme-scoped light bottom popups and 400px notification toast. Three original network images byte verified and audited. Shared Guest brightness/audio and popup ownership; real account/session boundaries unchanged. [Source trace](CHROMEOS-TRAY-SOURCE.md). Browser regression authored, unexecuted. Next DateTime analog/digital calendar variant and focused ChromeOS CI including XP/Win11 artwork correction. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — ChromeOS Explorer and menubar

Ported source addressbar, body/footer, navigation, list view details/icon/tile palettes, status height and shared menubar across Computer/Bin/Notepad. Real Guest file actions, selection and navigation unchanged. [Source trace](CHROMEOS-EXPLORER-SOURCE.md). Browser regressions authored; latest batch untested. Next source tray popups and focused verification. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — ChromeOS desktop and context menus

Source inherited desktop selection/drag band and ChromeOS WinUI menu geometry/palette across Desktop, Taskbar, Computer/Bin, Notepad and Start portal. Shared real commands, keyboard focus and measured cascade placement retained. Added ChromeOS to existing edge-placement tests and cross-surface menu regression. [Source trace](CHROMEOS-CONTEXT-SOURCE.md). Tests not executed; next ChromeOS Explorer chrome/list selection and menubars, then tray and focused CI. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — ChromeOS launcher

Original f5a6 470px launcher, sorted core/all grid, five recent apps, Google art, real Guest program/file search, account and power actions, shared context. [Source trace](CHROMEOS-LAUNCHER-SOURCE.md). Unit/browser contracts authored; exact ranking/hover/visual parity pending. Previous ChromeOS shelf and XP/Win11 repair also pending execution. Main/frozen source/draft PR unchanged. Next ChromeOS desktop/context and Explorer.

---

## 24 November 2026 — ChromeOS shelf and window chrome

Ported source 48px shelf, circular launcher, actual maximized radius transition, running/focused indicators, tray and time-only clock, source WindowMain palette and 28px circular controls. [Source trace](CHROMEOS-SHELL-SOURCE.md). Browser lifecycle regression authored. Prior macOS CI #45402373188 passed; XP/Win11 artwork correction and new ChromeOS head pending verification. Next original ChromeOS launcher f5a6, context menus and Explorer. No redundant CI; main/frozen source/draft PR unchanged.

---

## 24 November 2026 — full CI regression repair

Full CI #45395440100 at d0d3d0b: targeted 1065 passed/3 skipped; full 1507 passed/5 skipped/2 failed. Both failures were the same stale XP Desktop navigation expectation in theme-shell-source.spec.ts (generic folder expected, original desktop-winxp received). Frozen icons.registry.json confirms XP-specific Desktop artwork; Win11 has no override and inherits base desktop. Imported byte-identical base desktop.96562ad8.webp, mapped Win11/Win11dark, updated both browser expectations and unit/hash audit; generic folder tests unchanged. Focused CI #45402373188 at fff2620 passed TypeScript, units, source inventory, artwork and Contacts at inspection; build/browser pending. New regression repair not yet tested, no redundant trigger. Next include repaired theme-shell-source cases in subsequent focused validation, repair any macOS failures. Main/frozen source/draft PR unchanged.

---

## 24 November 2026 — focused macOS verification checkpoint

Explicit [run-ci] [macos-check] batch: TypeScript, all units, original inventory/artwork/Contacts audits, Vite build and macOS browser cases in theme-bin-artwork, player and macOS logon across both configured Chromium projects. Does not repeat broad suites; existing full CI and manual dispatch unchanged. Added five already byte-verified volume icons to automatic source artwork audit and all seven popup owner transition pairs to unit coverage. Static checks confirmed WindowFrame active/maximized/control attributes and Launchpad/search hooks. Previous CI #45395440100 still in full interactions at inspection; this is a new-head focused check, not evidence of a passing run. Next inspect and repair exact-head failures before moving to ChromeOS. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — Guest notification lifecycle

Added shared SDK notification store, FIFO current toast and 8s dismissal, retained history/seen/read states, macOS toast paint, Action Center history and Control Panel shared messages. Unit and SSR escaping contracts authored. [Source trace](MACOS-NOTIFICATION-SOURCE.md). Remote feed/provider and exact original 779a store behavior pending; no synthetic production notifications. Prior CI #45395440100 full interactions still running at inspection. Next consolidate latest-head verification and remaining theme parity. Main/frozen reference/PR unchanged.

---

## 24 November 2026 — macOS Volume and Guest audio

Original c561 vertical meter, mute toggle, exact five original volume artwork blobs, shared Guest audio state applied to actual Player media element (local × system volume and combined mute). Unit thresholds and actual media property browser contract authored. [Source trace](MACOS-VOLUME-SOURCE.md). Prior CI #45395440100 full interactions running at inspection; no redundant trigger. Next notification history/delivery, remaining macOS parity and consolidated verification. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS Battery and display

Ported source a88c battery percentage/charging/power source, original battery vector, shared popup owner, balanced/saver presets and 0.6–1.2 Guest brightness filter. Real browser BatteryManager capability only, unavailable fallback, listeners cleaned up. Unit and browser contracts authored (mocked battery events, actual display filter). [Source trace](MACOS-BATTERY-SOURCE.md). Previous CI #45395440100 full interactions running at inspection; no redundant trigger. Next original Volume/audio capability and notification delivery. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS Action Center summary

Resolved missing Action Center and Battery source modules via taskbar-base lazy imports (chunk-517d7f56 f0ed, chunk-391f23b6 a88c). Ported source empty message summary, bundled headline, shared popup ownership and actual cpanel/action-center route; browser regression authored. [Source trace](MACOS-ACTION-CENTER-SOURCE.md). Feed/history/severity/toast delivery still pending; no fabricated messages or push permission. Previous CI #45395440100 full interactions running at inspection; no redundant trigger. Next battery popup and source Guest display brightness, then volume and notification history. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS shared popup ownership

One source-style active popup owner for Apple, Network, Spotlight and DateTime; guarded stale close, keyboard switching and Launchpad/theme/preference cleanup. Unit and browser contracts authored. [Source trace](MACOS-POPUP-OWNERSHIP-SOURCE.md). Action Center module f0ed not located in inspected chunks, so prioritized source-confirmed popup lifecycle rather than inventing behavior. Prior CI #45395440100 full interactions running at inspection; exact-head verification pending. Next Action Center source discovery and remaining tray capabilities. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS tray and network

Original macOS tray order/40px slots, removed Windows-only Show Desktop and unnecessary hidden chevron. Network popup now uses browser connectivity and optional type events with truthful online/offline text, cleanup and Escape; native settings unavailable. [Source trace](MACOS-TRAY-NETWORK-SOURCE.md). Browser offline/online regression authored. CI #45395440100 targeted browsers passed, full interactions running at inspection. No redundant CI; next Action Center/notification and battery/volume capabilities. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS DateTime popup

Ported original calendar-only topbar clock popup, live short date, full-date reset, 42-cell grid, month/year pickers and source red day selection. Shared date arithmetic with rollover/leap year unit tests and browser navigation contract. [Source trace](MACOS-DATETIME-SOURCE.md). Exact-head tests pending; previous CI #45395440100 still running targeted browsers at inspection. No redundant trigger. Next inspect browser failures then source tray order/action center and remaining capabilities. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS application menubars

Ported source active/inactive Notepad menu/status and shared Computer/Bin menubar paint, original hover/pressed text and background, separators, RTL and disabled states. Existing command and dropdown behavior preserved. Browser contracts for real status toggle and Organize Escape/focus restoration authored. [Source trace](MACOS-MENUBAR-SOURCE.md). [CI #45395440100](https://github.com/codersachin99/windows-os/actions/runs/45395440100) still running targeted browsers at inspection; no redundant trigger. Next repair any browser failures, then remaining macOS shell details. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS Explorer chrome

[CI #45395440100](https://github.com/codersachin99/windows-os/actions/runs/45395440100) at d0d3d0b passed TypeScript, units, inventory, artwork/Contacts audits and Vite build; targeted browsers in progress. Ported active/inactive source address/status/navigation surfaces, dark list body, split icon selection, details rows and active folder highlight to shared Computer/Bin. Real history/upload/selection and active window regression authored. [Source trace](MACOS-EXPLORER-SOURCE.md). New head unverified, no redundant CI. Next inspect browser results then macOS menubars. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS WinUI context and CI repair

Recovered push-triggered workflow history: [CI #45374111162](https://github.com/codersachin99/windows-os/actions/runs/45374111162) green at 496ed05; [CI #45387916534](https://github.com/codersachin99/windows-os/actions/runs/45387916534) failed one stale Vista Start artwork unit assertion (732 passed; TypeScript passed, browser gates skipped). Corrected expectation to exact original Vista Start, preserve generic fallback guards. Original macOS dark menu skin now shared across Desktop, Dock, Explorer child/root, Launchpad portal and app dropdowns; browser contracts added. [Source trace](MACOS-CONTEXT-SOURCE.md). One consolidated [run-ci] requested; current head unverified. Next inspect CI, fix failures, then macOS Explorer chrome and menubars. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS dock Bin and tooltips

Shared mounted Guest trash count hook, synchronized original empty/full Bin artwork on Desktop and Dock, source tooltip paint and embedded pointer, viewport-safe portal and keyboard access. Existing upload/delete/empty browser contract extended and tooltip regression authored. [Source trace](MACOS-DOCK-DETAILS-SOURCE.md). Exact-head tests pending. Next macOS context and Explorer skins; consolidated CI afterward. Main/frozen source/draft PR/releases unchanged; no extra CI trigger.

---

## 24 November 2026 — macOS Launchpad

Replaced generic Windows Start fallback with source macOS fullscreen blurred wallpaper, 5x4 program-only grid, 52px icons, search, page dots, wheel/swipe, shared program context and real registered launch. Bounded compact layout and keyboard input, disabled unported apps. [Source trace](MACOS-LAUNCHPAD-SOURCE.md). Browser regression authored, exact-head CI unavailable. Next macOS dock tooltip/Bin state and context/Explorer skins. Main/frozen source/draft PR/releases unchanged; no extra CI trigger.

---

## 24 November 2026 — macOS Spotlight

Ported source Spotlight tray trigger and centered dark search surface. Shared mounted Guest search with cancellation/trash exclusion and shared file association resolver extracted from Win8 Start; application and file result navigation, real launch and Escape restoration. [Source trace](MACOS-SPOTLIGHT-SOURCE.md). Original ranking/grouping and global shortcut pending, tests authored but not executed. Next original Launchpad. Main/frozen source/draft PR/releases unchanged; no extra CI trigger.

---

## 24 November 2026 — macOS Apple menu

Ported original seven-command Apple menu, exact bundled Apple glyph and source popup palette. Connected Settings/About/Account and Guest power actions, with accounts route, arrow navigation and Escape restoration. Help and Support disabled pending destination verification. [Source trace](MACOS-APPLE-MENU-SOURCE.md). Browser contract authored, tests pending. Next Spotlight and original Launchpad. No extra CI trigger; main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS dock groups

Implemented source three-group dock ordering (Computer/Launchpad/pins/Control Panel, recent plus running, Bin) with deduplication, registered app actions, source gaps/dividers and existing window activation. Added grouping unit and launch/minimize/restore browser contracts. [Source trace](MACOS-DOCK-GROUPS-SOURCE.md). Dock Bin state, tooltip, Apple menu, Spotlight and Launchpad remain pending. Exact-head CI not available; no extra trigger. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS top bar and dock geometry

Ported 28px top bar, active title, separate bottom dock with original 48px icons and running/stacked indicators. Shared Start, pin/running and tray actions retained; maximized windows reserve top/dock work area. [Source trace](MACOS-TOPBAR-DOCK-SOURCE.md). Source Apple menu, Spotlight, exact dock groups and Launchpad pending. Browser contract authored, CI pending; no duplicate trigger. Next macOS context menus and Explorer plus dock grouping. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — macOS desktop and window chrome

Checked CI at 75f7708: PR-filtered run lookup and combined statuses both returned empty; conclusion unknown, no duplicate trigger. Ported original macOS desktop selected icon/label and rename styles, dark active/inactive frame, 28px titlebar and left-leading traffic-light controls. Added computed-style/lifecycle browser contract. [Source trace](MACOS-DESKTOP-WINDOW-SOURCE.md). Next top menu bar/dock geometry, context menus and Explorer. Main/frozen source/draft PR/releases unchanged; tests pending.

---

## 24 November 2026 — Consolidated historical shell verification requested

Static review of head 82b823d: all 301 registered artwork checksum entries match the frozen legacy-files.tsv inventory (target-byte audit still needs CI); previous XP program overrides preserved. Confirmed resolver signatures and original wallpaper paths, Start markup and taskbar selectors. Bounded flyout to original 288px base height, retaining Slate override and viewport cap; explicit left/right placement state type. One opt-in [run-ci] push requests TypeScript, unit, source audit, build, targeted and full Playwright suite; results not yet available. No visual capture or release. Next inspect actual CI jobs, fix failures before further theme work. Main and frozen source unchanged.

---

## 24 November 2026 — Historical All Programs flyout

Implemented separate flat sorted source-style All Programs for Slate/Plex/Whistler, shared viewport placement, theme artwork, hover/click/keyboard navigation and Escape return. Updated previous inline-tree assertion and added three real launch/viewport contracts. [Source trace](HISTORICAL-ALL-PROGRAMS-SOURCE.md). Exact-head CI pending; next consolidated CI and repair, then remaining themes. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — Longhorn/Whistler application menubar adapters

Source menu-bar palettes and popup states ported for actual Notepad and Computer/Bin Organize toolbar; RTL, disabled and focus styles. Six desktop/mobile regression contracts authored for status toggle and Organize Escape/focus restoration. [Source trace](LONGHORN-WHISTLER-MENUBAR-SOURCE.md). Other application menu consumers and original All Programs flyout remain pending. No extra CI trigger; exact-head verification pending. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — Longhorn/Whistler Explorer chrome

Scoped Explorer stylesheet ports original addressbar gradients, enabled/disabled history palette, white navigation pane, selection gradients and statusbar colors. Computer/Bin shared render path, file/history operations untouched. Added desktop/mobile regression contracts for actual Back/Forward and folder creation/selection. [Source trace](LONGHORN-WHISTLER-EXPLORER-SOURCE.md). Original structural/glyph parity, application menubar and All Programs flyout pending. No additional CI trigger; exact-head CI pending. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — Longhorn/Whistler context-menu skins

Ported original distinct Plex, Slate and Whistler WinUI menu palettes to Desktop, taskbar, Explorer root/child and body-portaled Start contexts via shared scoped CSS. Existing viewport flipping and actions unchanged. Three desktop/mobile regression contracts added for menu paint, hover, nested Explorer View and pin action. [Source trace](LONGHORN-WHISTLER-CONTEXT-SOURCE.md). Exact-head CI pending; no extra trigger. Next Explorer address/navigation/sidepane/statusbar and application menubar. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — Longhorn/Whistler window frame chrome

Ported original Plex/Slate/Whistler window frame palettes, active/inactive title treatment, 20px caption controls, maximized state and RTL styling. Original Whistler embedded PNG copied directly from frozen CSS. Added real Guest window lifecycle regression contracts. [Source trace](LONGHORN-WHISTLER-WINDOW-SOURCE.md). App bodies, exact glyph variants, context and Explorer chrome pending. Exact-head CI pending; no redundant trigger. Main/frozen reference/draft PR/releases unchanged.

---
## 24 November 2026 — Longhorn/Whistler XP-style Start skin

Source XP Start structure now selected for Slate/Plex/Whistler; distinct original pane palettes, corners, shadows, Whistler no-avatar header, three power controls and RTL styles. Three desktop/mobile regression contracts cover menu rendering, All Programs navigation and Computer launch. [Source trace](LONGHORN-WHISTLER-START-SOURCE.md). Original flyout and full shortcut/geometry parity pending. Exact-head CI pending; no extra CI trigger. Next theme-specific window chrome and context menu. Main/frozen source/draft PR/releases unchanged.

---
## 24 November 2026 — Longhorn/Whistler desktop and taskbar state styling

Ported source Plex/Slate gradient palettes, Whistler cream tray/taskbar, selected desktop labels, running/active/hover taskbar states and RTL shadows using one shared scoped stylesheet. Three desktop/mobile computed-style regression cases added. [Source trace](LONGHORN-WHISTLER-SHELL-SOURCE.md). Original mask tint, Start/window geometry and full paired visuals pending. No extra CI trigger; exact-head verification pending. Next original theme Start/menu/window chrome and remaining shell families. Frozen source/main/draft PR/releases unchanged.

---
## 24 November 2026 — Complete shared XP-family icon registry

66 exact XP override keys (65 shared by Slate/Plex/Whistler, distinct source Start as applicable); 57 distinct XP files, 15 new hash-matched original files. Consolidated partial XP and Longhorn maps; retained personal compatibility key. Unit coverage expanded to all original shared keys, XP browser folder navigation and HTTP availability of new art. [Source trace](XP-COMPLETE-ICONS-SOURCE.md). Exact-head CI pending; latest push-triggered run lookup still unavailable through PR-only connector. Next theme-specific desktop/taskbar layouts and source verification. Main/frozen source/draft PR/releases unchanged.

---
## 24 November 2026 — Longhorn Slate icon inheritance resolved

Frozen theme catalog explicitly sets Slate iconPack=winxp; pinned XP and Plex registries differ only in Start. Slate now shares 43 original mapped keys plus original XP Start and distinct wallpaper; no new binary imports. Unit/browser regression tests extended for Slate, including actual Bin and folder operations. [Source evidence](LONGHORN-WHISTLER-CORE-ICONS-SOURCE.md). Latest combined push CI lookup remains unavailable through PR-only run listing; no redundant trigger. Next finish remaining XP-family shared registry keys and then shell layout. Main/frozen source/draft PR/releases unchanged.

---
## 24 November 2026 — Onebit core monochrome artwork

Combined opt-in CI requested at `496ed05`; connector lookup still returns no PR-triggered run. Last confirmed green [CI #45368395974](https://github.com/codersachin99/windows-os/actions/runs/45368395974). No redundant trigger.

Onebit: 29 exact keys, 17 original SVGs with Git blob equality, intentional shared Bin/folder/disk/text/default aliases, source Start and desktop navigation. Added unit and focused browser tests; verify real trash contents even though Bin art stays constant. [Source trace](ONEBIT-CORE-ICONS-SOURCE.md). Exact-head verification pending. Next investigate Slate icon fallback and remaining theme shell/layout parity. Main/frozen source/draft PR/releases unchanged.

---
## 24 November 2026 — Vista complete icon override registry

Combined opt-in CI requested at `496ed05`; the commit workflow lookup did not return a run (connector filters PR runs). Last confirmed full green remains [CI #45368395974](https://github.com/codersachin99/windows-os/actions/runs/45368395974) at `4dd3b3c8`. No duplicate opt-in trigger.

Vista has only eleven original overrides; all eleven paths hash-matched and mapped, preserving shared artwork for absent keys. Added unit/browser tests and full artwork audit entries. [Source trace](VISTA-CORE-ICONS-SOURCE.md). Exact-head verification pending. Next Onebit core registry and investigate Slate icon fallback; main, frozen source, draft PR and releases unchanged.

---
## 24 November 2026 — Longhorn Plex/Whistler core icons and combined verification

[CI #45368395974](https://github.com/codersachin99/windows-os/actions/runs/45368395974) at `4dd3b3c8` completed SUCCESS: TypeScript, units, inventory, historical artwork audit, Contacts, Vite, focused and full browser suites passed. Visual job skipped. Six newer icon packs and expanded audit are not covered by that checkpoint.

Longhorn Plex and Whistler share 43 exact registry keys (plus distinct Start keys), five new original artwork paths and verified Win2k Start reuse. Source aliases preserved; no guessed Slate registry. Unit and focused browser lifecycle tests added. [Source trace](LONGHORN-WHISTLER-CORE-ICONS-SOURCE.md). Combined opt-in [run-ci] requested for Ubuntu/Kubuntu/Aero Noir/Oxygen and previous icon packs plus the expanded default artwork audit. Exact-head acceptance pending. Next Vista and Onebit core artwork and verify CI; no merge/release or full visual parity claim.

---
## 24 November 2026 — Oxygen core desktop/Explorer artwork

[CI #45368395974](https://github.com/codersachin99/windows-os/actions/runs/45368395974) at `4dd3b3c8`: TypeScript, units, inventory, historical artwork, Contacts, Vite and focused browser suite passed; full browser suite running at inspection. No redundant CI.

Oxygen: 28 registry keys, 25 exact files (23 new, 2 reused), original folder/disk aliases, distinct Bin states and power icons. No Start/Videos source keys; fallback retained. Unit and focused browser tests added; all new assets in audit. [Source trace](OXYGEN-CORE-ICONS-SOURCE.md). Exact-head verification pending. Next inspect CI, batch six newest core packs and expanded audit; then continue remaining theme artwork/layouts. Frozen source/main/draft PR/releases unchanged.

---
## 24 November 2026 — Aero Noir core desktop/Explorer artwork and audit coverage

[CI #45368395974](https://github.com/codersachin99/windows-os/actions/runs/45368395974) at `4dd3b3c8` passed TypeScript, unit, inventory, historical artwork, Contacts and Vite steps; focused browser stage still running at inspection. No redundant run.

Aero Noir: 26 original registry keys via 21 hash-matched original files, source folder and disk aliases, distinct Bin states. No Start registry key; existing fallback retained. Added unit and focused browser regressions. Corrected artwork verifier CLI to include every registered pack by default (previous seven-group default missed newer artwork). [Source trace](AERONOIR-CORE-ICONS-SOURCE.md). Exact-head verification pending. Next Oxygen core art and inspect outstanding CI before batching. Frozen source/main/draft PR/releases unchanged.

---

## 24 November 2026 — Kubuntu core desktop/Explorer artwork

Combined [CI #45368395974](https://github.com/codersachin99/windows-os/actions/runs/45368395974) at `4dd3b3c8`: TS/units/inventory/exact art/Contacts/Vite passed; focused browser stage running at inspection. No redundant CI.

Pinned Kubuntu registry now supplies 27 core mappings via 26 paths (19 new hash-matched, seven reused). Exact Computer/folder alias and Ubuntu/shared Videos, CD, connected/disconnected disks, richtext, ZIP and shortcut aliases; distinct empty/full Bin, source Start, Desktop, special folders and selected app/file types. Unit and existing focused browser lifecycle regression added. [Source trace](KUBUNTU-CORE-ICONS-SOURCE.md). Ubuntu and Kubuntu slices await exact-head verification. KDE shell remains pending. Next Aero Noir/Oxygen core icons after checking CI. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — Ubuntu core desktop/Explorer artwork

Combined [CI #45368395974](https://github.com/codersachin99/windows-os/actions/runs/45368395974) at `4dd3b3c8`: TS, units, inventory, exact artwork, Contacts audit and Vite passed; focused browser stage still running at inspection. No redundant CI.

Pinned Ubuntu registry now supplies 27 core keys via 27 exact paths (26 new hash-matched, one existing shortcut alias). Computer, distinct empty/full Bin, generic and special folders, five disk states, Start, Desktop navigation, core application/file types. Shared resolver + unit and existing focused theme-bin-artwork E2E for actual trash lifecycle and folder/file creation. [Source trace](UBUNTU-CORE-ICONS-SOURCE.md). Exact-head verification pending; Ubuntu shell stays pending. Next Kubuntu core icon registry, then Aero Noir/Oxygen. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — repair failed focused browser verification

[CI #45364747459](https://github.com/codersachin99/windows-os/actions/runs/45364747459) at `2b5b818d` **failed** after TypeScript, 724 UI unit tests (139 files), source inventory, byte-identical artwork, Contacts audit and Vite passed. Focused browser: 947 passed, 3 skipped, 6 failed. Both Control Panel Background tests expected stale 16 instead of actual 30; updated count, retained asset/save assertions. Oxygen desktop/mobile interaction timed out; mobile log shows footer intercepting Switch User. Ubuntu desktop/mobile first logon interaction timed out (exact failing action not logged). Inspection found six newer theme logon roots override shared fixed inset:0 with position:relative, shrinking to contents and overlapping footer/menu with Guest controls. Restored fixed full-viewport root for Oxygen, Ubuntu, Kubuntu, ChromeOS, macOS, Aero Noir; preserve internal original positioning. Added viewport bounds regressions in catalog and explicit non-overlap checks for Oxygen/Ubuntu before real clicks. Ubuntu timeout root cause remains hypothesis until verified. No forced clicks, skip, or timeout inflation.

New opt-in CI includes these repairs plus already committed macOS/ChromeOS core icons. Exact-head verification pending, full browser not reached in previous run; visual capture skipped. Frozen source/main/draft PR/releases unchanged. Next Ubuntu/Kubuntu core icon packs after this repair. 

---

## 24 November 2026 — ChromeOS core desktop/Explorer artwork

Combined [CI #45364747459](https://github.com/codersachin99/windows-os/actions/runs/45364747459) at `2b5b818d`: TS/units/inventory/artwork/Contacts/Vite passed; focused browser stage still running. No parallel full CI.

Pinned ChromeOS registry now supplies 27 keys via 20 original paths (19 imported hash-matched, one existing Start SVG reused). Exact same empty/full Bin alias, generic folder aliases, distinct Downloads, three disk images, application/file type art and explicit desktop navigation. Unit and focused theme-bin-artwork browser coverage for real delete/empty state, Computer, folder/file creation and navigation. [Source trace](CHROMEOS-CORE-ICONS-SOURCE.md). macOS and ChromeOS icon slices await new verification batch. Shell status remains pending. Next Ubuntu/Kubuntu core icons. Frozen source/main/draft PR/releases unchanged.

---

## 24 November 2026 — macOS core desktop/Explorer artwork

Combined [CI #45364747459](https://github.com/codersachin99/windows-os/actions/runs/45364747459) at `2b5b818d`: TypeScript, units, inventory, exact art, Contacts audit and Vite passed; focused browser suite still running at inspection. No second full run.

Pinned icons.registry.json themes.macos now has 24 core key mappings (20 verified original files). Computer, empty/full Bin, file/folder, special folders, five drive aliases, Start, Calc/Control Panel/Notepad/CMD and text/richtext/executable/shortcut. Shared asset resolution reaches Desktop, Explorer navigation, file selection, taskbar/window artwork. Added unit regression and expanded existing focused theme-bin-artwork browser tests to macOS actual delete/empty lifecycle and folder/file creation. [Source trace](MACOS-CORE-ICONS-SOURCE.md). macOS shell remains pending; not full icon registry or visual parity. Next: remaining core theme icon packs and shell geometry. Main, frozen source, draft PR/releases unchanged.

---

## 24 November 2026 — finish original desktop default mapping and correct stale Ubuntu test

Combined [CI #45363645210](https://github.com/codersachin99/windows-os/actions/runs/45363645210) at `fadb0e6f` **failed**: TypeScript passed; UI unit suite 721 passed, 1 failed (137 files passed, 1 failed). Sole failure sourceOnebitLogon.test.tsx:25 expected obsolete Ubuntu Win7 fallback. Corrected to assert actual Ubuntu renderer and no Onebit leakage/no fallback. All subsequent stages skipped; no browser acceptance yet.

Frozen registry 3b8c: exact XP Olive Green autumn, Royale follows, Silver azul, Zune ascent; Win31 #bfbdc0, Win95 #007d7b, Win98 #57a8a8, Win2k #3b6ea4. Four exact original images copied with verified Git hashes. Desktop defaults and existing Personalize previews corrected together; solid colors remain outside safe image whitelist. Gallery 26 -> 30; source artwork mappings for icons/preview legacy paths unchanged; desktop/preview tests updated to original expectations and preserve existing shell palette checks. All 37 configured/canonical theme IDs now have explicit source defaults or shared canonical wallpaper. Existing manually selected backgrounds remain valid. [Source trace](CLASSIC-XP-WALLPAPER-SOURCE.md). New combined opt-in CI requested after prior failed. Main/frozen reference/draft PR/releases unchanged. Next check CI, then theme-specific Computer/Bin/folder assets.

---

## 24 November 2026 — first remaining desktop default wallpaper batch

Combined [CI #45363645210](https://github.com/codersachin99/windows-os/actions/runs/45363645210) at `fadb0e6f` started and TypeScript passed; units were running at inspection. Six newly ported login families and mobile regression fix remain pending exact-head acceptance.

Frozen registry 3b8c identifies original image backgrounds for Vista, macOS, ChromeOS, Ubuntu, Kubuntu, Longhorn Slate/Plex, Aero Noir, Oxygen and Whistler; base uses #fffd and Onebit #352b30. React now uses these 12 exact defaults instead of Win7 wallpaper fallback. Five reused original assets and five new binary assets with matching Git hashes. System image picker/whitelist expands 16 to 26, tests updated, new unit and desktop/mobile Guest paint/reload tests added to focused CI. [Source trace](DESKTOP-WALLPAPER-DEFAULTS-SOURCE.md). Pending shell statuses unchanged. Next correct XP variant-specific and older classic default colors, then original shell artwork/UI; keep main/frozen source/draft PR/releases unchanged. Batch CI only after currently running check.

---

## 24 November 2026 — Vista completes partial logon family routing; mobile Personalize regression repair

[Personalize CI #45360503128](https://github.com/codersachin99/windows-os/actions/runs/45360503128) at `68590906` finished **FAILURE**: TypeScript/units/source inventory/original art/Contacts/Vite passed; focused Playwright **892 passed, 3 skipped, 1 failed**. Sole failure chromium-mobile source-personalize-appearance.spec.ts:82: sidebar Desktop Background link was hidden by the existing <=530px CSS. Control Panel direct Background test passed. Full browser and visual capture did not run. Browser logs also report existing segoepr.ttf decode failures; investigate font availability separately (do not claim visual parity). Fixed regression route: desktop still clicks direct sidebar link; narrow layout uses real Cancel then visible gallery Background link, with committed tint assertions at both exit and picker and subsequent editor state. No forced clicks or skipped assertions; no change to mobile source UI.

Vista is implemented via original shared logon-win7.js module 8ba0d isVista branch rather than inventing a separate source module. Original Vista wallpaper and shared shutdown sprite copied with equal Git hashes. Source Windows Vista Professional branding, framed Guest and power art, audit, SSR all 37 IDs / 19 unique families and desktop/mobile Vista checks. [Source trace](VISTA-LOGON-SOURCE.md). All 19 source logon families now have partial renderers; no known configured fallback, not full visual/auth/shell parity.

One combined opt-in CI requested for mobile regression repair and the six Oxygen/Kubuntu/Ubuntu/ChromeOS/macOS/Vista slices. Exact-head result pending. Frozen reference, main, draft PR #1, releases unchanged. Next: inspect new CI, fix failures and resume remaining desktop shell/Start/Explorer/Bin skins.

---

## 24 November 2026 — original macOS Guest logon

Previous [Personalize CI #45360503128](https://github.com/codersachin99/windows-os/actions/runs/45360503128) still in targeted browser stage at inspection; TypeScript/units/source/artwork/Contacts/Vite passed. Oxygen/Kubuntu/Ubuntu/ChromeOS unverified.

Original macOS ff91 now has partial source-specific renderer: cover wallpaper, black/50 blur(10px), original 150px round avatar-only Guest, source centered Shutdown/Switch User/Restart footer with 36px circles and rotated restart glyph. Two original assets copied by exact Git SHA; asset audit, SSR and desktop/mobile E2E including actual power callbacks, catalog and focused workflow added. [Source trace](MACOS-LOGON-SOURCE.md). 18/19 partial login families; Vista only fallback. macOS shell pending. Exact glyphs, authentication/loading, paired screenshot parity pending. Batch CI once previous finishes; source lock/main/draft PR/releases unchanged.

---

## 24 November 2026 — original ChromeOS Guest logon

Previous [Personalize CI #45360503128](https://github.com/codersachin99/windows-os/actions/runs/45360503128) still in targeted browser stage when inspected; TS/units/source/artwork/Contacts/Vite passed. Oxygen/Kubuntu/Ubuntu remain unverified.

ChromeOS source module 5af3 and CSS now have a dedicated partial Guest renderer: two 24px blurred layers (original wallpaper and black/60), original 100px usertile12 avatar, avatar-only Guest, Shutdown/Restart/Switch User footer pills, decorative status and live HH:mm clock. Original wallpaper/avatar copied with identical Git blob hashes. Added audit, SSR and desktop/mobile E2E, catalog and focused suite. [Source trace](CHROMEOS-LOGON-SOURCE.md). Now 17/19 partial login families, Vista/macOS remaining fallback; shell pending. Exact source account/locale/glyphs/visual acceptance still outstanding. Batch CI after previous completes. Main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — Ubuntu Guest logon and logon-only System menu

Previous Personalize [CI #45360503128](https://github.com/codersachin99/windows-os/actions/runs/45360503128) was still in the targeted browser stage when inspected; TS/units/source/artwork/Contacts/Vite passed. Oxygen and Kubuntu remain unverified at their new heads.

Frozen Ubuntu 94a5 + taskbar c56e now have a source-backed Guest renderer with 88px original circular Guest art, 20px padding, 192px original logo, source-only top bar containing Restart/Shutdown System menu and actual simulator lifecycle. Added original SVG assets with matching Git hashes, audit, SSR/browser cases and keyboard dismissal, source catalog and focused workflow. [Source trace](UBUNTU-LOGON-SOURCE.md). 16/19 partial renderer families; Vista/macOS/ChromeOS still fallback; Ubuntu shell pending. Source background composite, exact power glyph, account auth/loading and screenshots remain unverified. Batch exact-head CI after prior run, keep main/frozen source/draft PR/releases unchanged.

---

## 24 November 2026 — original Kubuntu Guest logon

Previous [Personalize CI #45360503128](https://github.com/codersachin99/windows-os/actions/runs/45360503128) is still running its targeted browser stage at inspection; earlier TS/units/source/artwork/Contacts/Vite passed. Oxygen head `1d491607` is not yet covered by CI. No parallel full run requested.

Frozen Kubuntu module 17bf and CSS now have their own partial Guest renderer with 300% original wallpaper, 150px avatar opacity .8, blur(10px) black/50 overlay, 48px circular source Restart/Shutdown art, distinct 4/8px button gaps and icon-only hover. Imported exact source wallpaper blob `78bd1d5c`; reused existing verified KDE icons and guest-win10. Added SSR plus desktop/mobile browser cases for source artwork, computed styling, account fallback, Guest and simulator power lifecycle, catalog and focused suite. [Source trace](KUBUNTU-LOGON-SOURCE.md). Now 15/19 partial login families; four fallback (Vista/macOS/ChromeOS/Ubuntu). Kubuntu shell stays pending. Next: inspect running CI, then batch Oxygen/Kubuntu and next source slice with one opt-in check. No changes to frozen source, main, draft PR or releases; paired visual capture remains pending.

---

## 24 November 2026 — original Oxygen Guest logon

Previous Personalize [CI #45360503128](https://github.com/codersachin99/windows-os/actions/runs/45360503128) at `68590906` passed TypeScript, units, source inventory/artwork/Contacts checks and Vite; targeted browser stage was still running at last inspection. No new green claim yet.

Oxygen no longer uses Win7 fallback. Frozen `logon-oxygen.js`/CSS and shared logon-base define its separate 128px circular Guest avatar, 6px padding, black/50 overlay blur(10px), white gradient controls, bottom-centered 40px power art. Three original binary assets copied with equal source/destination Git SHAs and registered in checksum audit. New source adapter, SSR contract and real desktop/mobile browser spec plus catalog/focused workflow updated. [Oxygen source trace](OXYGEN-LOGON-SOURCE.md). Now 14/19 partial login renderer families, five explicit fallback; entire Oxygen shell pending. Batch exact-head opt-in CI after previous run finishes. Keep frozen source, main, draft PR #1 and releases unchanged; original paired screenshots not certified.

---

## 24 November 2026 — Explorer resize CI green; Control Panel Background appearance rollback

[Coordinate repair CI #45355394198](https://github.com/codersachin99/windows-os/actions/runs/45355394198) at `929c943e` is now **SUCCESS**: TypeScript, units, pinned inventory, original artwork, Contacts audit, Vite, focused and full desktop/mobile Playwright all passed. Visual capture was skipped. This certifies the earlier Explorer root coordinate correction, not the later Personalize changes.

The previous Personalize sidebar rollback was already committed at the resumed head `2f9b526a`. The separate Control Panel search task "Change desktop background" opens another Personalize window through `DesktopShell.ApplicationContent.onOpenProgram`, bypassing the sidebar rollback. The global Aero preview could therefore remain active in the Background picker. In `7ce054a5` this specific launch restores committed appearance before dispatching OPEN_APP; the original independent window behavior remains. Frozen personalize.js ChangeAppearance.back() (lines 730–733) restores stored color/transparency; this is a React cross-window route consistency correction, not a claim that the source Control Panel implements the identical route.

`ef94c191` adds actual desktop/mobile browser coverage in source-cpanel-program-launch.spec.ts: save red, preview unsaved opaque turquoise, switch to the existing Control Panel by taskbar, launch Background, assert saved translucent red, then return to appearance and check committed controls. `79756aa9` adds the entire source-personalize-appearance.spec.ts to the existing opt-in targeted suite (previously only in full suite). Both previous sidebar and new Control Panel regression must pass. Fresh exact-head [run-ci] requested after documentation; not yet verified. No local checkout/network was available in this session.

Next: inspect exact-head CI and repair any failures; continue pinned Desktop/Start/Computer/Bin and remaining theme logon renderers. Source `26b9f0ce7a1665dee89a7c81824bec09e2c75776`, main `9bb90a41a8ec76d3b983b1c02c2774029f659539`, draft PR #1 and releases unchanged. Paired original screenshot comparison still requires source read access. No cleanup workflow recreated.

---

## 24 November 2026 — one-time cleanup removed; Personalize view-exit rollback

User requested deletion of the temporary cleanup workflow after the successful one-time cleanup. Verified actual counts in [run #45355161254](https://github.com/codersachin99/windows-os/actions/runs/45355161254): **105 artifacts, 1,068,010,786 bytes reclaimed; zero failures, zero caches, zero remaining artifacts/caches at completion**. Deleted workflow in commit `0d3ff09e`; shorter 2/3-day retention remains.

[Desktop hover run #45353856723](https://github.com/codersachin99/windows-os/actions/runs/45353856723) finished with 877 focused passes, 3 skips, 4 failures solely from the already-diagnosed Explorer resize root bounds cases. The new Desktop hover tests passed. [Coordinate repair CI #45355394198](https://github.com/codersachin99/windows-os/actions/runs/45355394198) at `929c943e` is still in its focused browser stage; do not claim successful repair until results.

**Additional development:** `PersonalizeApp.tsx` now discards live unsaved color/transparency when its sidebar opens Desktop Background directly from Window Color and Appearance, following the frozen source `src/modules/system/personalize.js` ChangeAppearance `back()` restore contract. Previously the persistent sidebar changed views without calling discard. Added desktop/mobile E2E in `source-personalize-appearance.spec.ts` covering both color and transparency, navigating to Background, Cancel, then returning to the appearance editor and verifying committed values. The source theme palette and Save behavior are unchanged. This patch is not covered by the in-progress coordinate repair run. Batch verification after that run finishes; no redundant parallel full CI. Source lock, main, draft PR and releases unchanged.

---

## 24 November 2026 — Actions storage maintenance and Explorer coordinate correction

The one-time [Actions cleanup #45355161254](https://github.com/codersachin99/windows-os/actions/runs/45355161254) succeeded: 105 artifacts, 1,068,010,786 bytes deleted; zero caches, zero failed deletions, zero remaining artifacts/caches at completion. User subsequently requested removal of the maintenance workflow; `.github/workflows/actions-storage-cleanup.yml` was deleted in `0d3ff09e`. There is no recurring cleanup workflow or trigger. Retain browser failure artifacts for 2 days and visual evidence for 3 days; normal CI remains opt-in.

[Resize CI #45352806191](https://github.com/codersachin99/windows-os/actions/runs/45352806191) at `66e4f621` passed TS, 132+715 units, source/artwork/Contacts and Vite; focused browser **875 passed / 4 failed / 3 skipped**. Desktop resize passed, but Computer/Bin background View and Computer file Send-to root bounds exceeded 320px viewport on both profiles (right edge 389/391 instead of <=322). Aero `backdrop-filter` establishes a containing block for fixed descendants, so the root menu's viewport clamp must convert the desired screen position into actual local CSS offsets. `ExplorerApp.tsx` now measures the rendered root rect and corrects left/top with its actual scale and screen displacement. The existing strict resize E2Es remain unchanged. Desktop hover run [#45353856723](https://github.com/codersachin99/windows-os/actions/runs/45353856723) was still executing focused browser at last check and predates coordinate fix. Fresh exact-head CI required; do not claim either cleanup completion or new parity before results. Frozen source, main, PR #1 and releases untouched.

---

## 24 November 2026 — adjacent Desktop context submenu hover reconciliation

The immediately preceding [CI #45352806191](https://github.com/codersachin99/windows-os/actions/runs/45352806191) at `66e4f621` passed TypeScript, units, source inventory/artwork, Contacts audit and Vite; focused browser regressions remained in progress when inspected. The last completed green head remains `089e56e6` ([CI #45341894836](https://github.com/codersachin99/windows-os/actions/runs/45341894836): 873 focused / 1325 full browser passes, 3 / 5 skips). Neither result certifies the changes below.

**New bounded Desktop parity correction:** moving the pointer from an open adjacent View/Sort/New cascade to Refresh or another ordinary root command previously left that child open. The shared Explorer background popup already closes adjacent children on ordinary row hover but preserves stacked children when the screen is too narrow for either side. In `packages/ui/src/DesktopIcons.tsx`, root pointer movement now uses the same policy. It does not affect item context Send to, menu action semantics, geometry or source skin. On narrow screens the existing stacked traversal protection remains active.

Added an actual desktop/mobile Chromium test to `tests/e2e/source-menu-cascade-edge-placement.spec.ts`: all three adjacent branches close when hovering Refresh while root stays open and expanded state resets; at 320px New remains open across ordinary/alternate branch rows, and ArrowLeft/Escape restore source keyboard behavior. The existing focused gate includes this test file. See [CONTEXT-SUBMENU-CASCADE-EDGE-SOURCE.md](CONTEXT-SUBMENU-CASCADE-EDGE-SOURCE.md).

**Next:** inspect the preceding resize run and new exact-head opt-in CI, repair any failures, then advance source-backed shell functionality. Do not claim new code passes until CI completes; source-versus-React visual capture still blocked without `LEGACY_SOURCE_READ_TOKEN`. Keep frozen legacy `26b9f0ce7a1665dee89a7c81824bec09e2c75776`, main `9bb90a41a8ec76d3b983b1c02c2774029f659539`, draft PR #1 and releases unchanged.

---

## 24 November 2026 — GREEN exact-head CI plus live Desktop/Explorer/Bin cascade resize fix

**Certified preceding head:** [GitHub Actions #45341894836](https://github.com/codersachin99/windows-os/actions/runs/45341894836) at `089e56e6b170bf189a4cb5db81573df9d471a4af` completed **SUCCESS**. It passed TypeScript; unit groups **132 + 715**; pinned legacy inventory, original theme binary-artwork and Contacts audits; production Vite build; focused Playwright **873 passed / 3 skipped**; full desktop/mobile Playwright **1,325 passed / 5 skipped**. This includes repaired Aero Noir computed CSS and actual Personalize titlebar/Alt+F4 color-preview rollback. Original-vs-React visual-capture Action **skipped** due missing `LEGACY_SOURCE_READ_TOKEN`. Therefore neither paired screenshots nor full visual parity are certified.

**Next source-driven shell priority completed in code:** original WinUI BaseMenu context cascades and user-requested Desktop/Computer/Bin side-flipping already worked when first opened, but **Computer/Bin Explorer root and View/New/Send to children did not update when the viewport was resized while still open**. `packages/apps/explorer/src/ExplorerApp.tsx` now installs a scoped `resize` listener only when context is open, records width/height on change, and re-runs root clamp and measured child cascade placement. This preserves the existing source right-when-fits/left-at-edge behavior, stacks on phones that cannot fit both, and flips back on widening, without new menu identity, resetting keyboard focus, touching selected Guest files or altering source palettes. Desktop already had ResizeObserver and remains unchanged.

**New actual-browser test coverage:** `tests/e2e/source-explorer-open-menu-resize.spec.ts` runs on desktop/mobile Chromium with live 1100→320→1100 viewport changes, verifying open Computer and Bin View, Computer Guest Documents file Send to, and Desktop View remain bounded with correct adjacent/stacked geometry and invoking-row ArrowLeft focus. CI focused suite now includes this file; full suite auto-discovers it. Source documentation: [OPEN-CONTEXT-MENU-RESIZE-SOURCE.md](OPEN-CONTEXT-MENU-RESIZE-SOURCE.md). This is code and tests, **not** a screenshot-equivalence claim.

**Pending verification:** new exact-head opt-in `[run-ci]` must validate changed Explorer geometry and new browser cases; the preceding green `089e56e6` is not proof for this new head. Keep original `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`, candidate `main` `9bb90a41a8ec76d3b983b1c02c2774029f659539`, draft PR #1 and releases unchanged. Next unblocked scope: complete original Desktop/Start/Computer/Bin actions, context and 37 theme shells; only source-backed incremental fidelity, no guessed hardware services or account authentication.

---

## 24 November 2026 — fix real Appearance rollback regression; unblock Aero Noir CSS assertion

Read actual GitHub Actions (not inferred): WinW [CI #45333123563](https://github.com/codersachin99/windows-os/actions/runs/45333123563) at `283dea33` **SUCCESS**, with **131 + 713 units**, **871 targeted browser passed / 3 skipped**, **1,321 full browser passed / 5 skipped**, source inventory/artwork/Contacts audits, TS and production Vite. Visual comparison skipped due absent source token. Previous WinL [CI #45330433060](https://github.com/codersachin99/windows-os/actions/runs/45330433060) at `096d6c38` passed targeted 869 / 3 skipped and full **1,318 passed / 1 failed / 5 skipped**. The single failure was not in WinL: `tests/e2e/source-personalize-appearance.spec.ts` reported unsaved turquoise `rgba(0,178,148,0.65)` tint after titlebar-close instead of committed Aero `rgba(89,134,202,0.65)`.

Frozen `legacy-win7/src/modules/system/personalize.js` source `selectColor()` applies live CSS variables but `back()` restores saved value. In `packages/ui/src/DesktopShell.tsx` `requestClose(id)` now synchronously discards Personalize preview **before** dispatching the close action, instead of relying solely on later passive `PersonalizeApp` unmount cleanup. Centralized handler covers titlebar Close and Alt+F4. Preserved old failing E2E unchanged; added distinct Alt+F4/unsaved preview E2E. This fixes a real source-behavior race and does not skip or relax the full-suite acceptance.

Aero Noir [CI #45333920227](https://github.com/codersachin99/windows-os/actions/runs/45333920227) at `0cbb5a2d` passed 132 + 715 units, TS, original binary hash/artwork/Contacts, Vite, **871 focused browser / 3 skipped**, but two new desktop/mobile Aero Noir checks failed on CSS computed serialization: original `background-size:300%` is reported by Chromium as `300% auto`. Corrected only expected `toHaveCSS("background-size","300% auto")`; source styles and actual rendering remain untouched.

Complete source traceback: [PERSONALIZE-APPEARANCE-CLOSE-SOURCE.md](PERSONALIZE-APPEARANCE-CLOSE-SOURCE.md); Aero Noir: [AERONOIR-LOGON-SOURCE.md](AERONOIR-LOGON-SOURCE.md). **New exact-head CI not yet run** after these fixes; must do TS/units/source audits/Vite/focused+full browser acceptance, inspect failures. No visual screenshots until `LEGACY_SOURCE_READ_TOKEN` is available. Keep `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776` immutable, draft PR #1 open/unmerged, `main` at `9bb90a41`, no releases.

---

## 24 November 2026 — Aero Noir source logon increment on immutable legacy reference

CI **at previous heads only**: [#45330433060](https://github.com/codersachin99/windows-os/actions/runs/45330433060) at `096d6c38` passed TS/units/source hashes/Contacts/Vite and focused browser checks, full browser still running at last check; [#45333123563](https://github.com/codersachin99/windows-os/actions/runs/45333123563) at WinW head `283dea33` was executing focused browser checks without reported failure at last check. Do not apply either run to this new Aero Noir head or claim full-suite pass until complete. The old [#45330319765](https://github.com/codersachin99/windows-os/actions/runs/45330319765) failed four WinL tests solely from old Playwright `APIResponse.headerValue`, already corrected with `headers()["content-type"]`; no guest/power code needed to change.

**New source-backed theme increment:** original `src/modules/themes/logon-aeronoir.js` module `089e` and `src/styles/themes/logon-aeronoir.css` define separate Aero Noir logon: image `aeroNoir` scaled to 300%, `bg-black/50` and `blur(10px)` overlay, 150px `guest-win10` circular avatar, 36px `restart-kubuntu` and `shutdown-kubuntu` power buttons, white text and gradients. Imported original binary files with **matching source and destination Git blob SHAs**: `aeroNoir.237e6377.webp` `6ae97abb`, `restart-kubuntu.5c766c73.svg` `e689418c`, `shutdown-kubuntu.146c3ea3.svg` `26b83d0f`; added to checksum importer and source art map. No recreations.

Added `SourceAeroNoirLogon.tsx`, `sourceAeroNoirLogon.css`, theme routing, SSR contract `sourceAeroNoirLogon.test.tsx` and real desktop/mobile `source-aeronoir-logon.spec.ts` (art HTTP, computed backdrop, avatar and power dimensions, Guest session and safe unavailable account). Focused and full browser workflows include new tests. Source catalog expects independent `aeroNoir` renderer, but `sourceThemeShellStatus("aeroNoir")` **still pending**, tracker `src/modules/themes/logon-aeronoir.js` **in-progress**; original account service/spinner and full shell/screenshot parity not claimed. Coverage now **13/19** partial source logon families, 6 still fallback, not finished 37 themes. Evidence: [AERONOIR-LOGON-SOURCE.md](AERONOIR-LOGON-SOURCE.md).

**Next gate:** trigger one exact-head opt-in `[run-ci]` after docs to run TypeScript, full units, frozen source inventory/theme artwork/Contacts checks, Vite, targeted and full desktop/mobile Playwright. Inspect actual jobs/logs; repair failures without skip/false certification. Preserve `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`, `main` `9bb90a41a8ec76d3b983b1c02c2774029f659539`, and unmerged draft PR #1; do not release or assert paired pixel match without source screenshots.

---

## 24 November 2026 — WinW Whistler logon source incremental renderer

The preceding exact-head [CI #45330433060](https://github.com/codersachin99/windows-os/actions/runs/45330433060) for `096d6c38` passed TypeScript, units, source inventory/artwork/Contacts audit, Vite build and targeted source browser cases; full desktop/mobile browser acceptance was **in progress** when inspected, **not** yet certified. Its direct predecessor [CI #45330319765](https://github.com/codersachin99/windows-os/actions/runs/45330319765) had four source WinL `APIResponse.headerValue` test-method errors (865 targeted passed, 4 failed, 3 skipped), corrected in `2ee7866`. The current branch already contains this fix. React original visual-capture still skipped absent `LEGACY_SOURCE_READ_TOKEN`; do not assert screenshot parity.

**New source-backed priority:** theme ID `winW` had original boot artwork but displayed the generic Win7 Guest logon fallback. Frozen `legacy-win7/src/modules/themes/logon-winw.js` and `src/styles/themes/logon-winw.css` define its distinct Whistler logo, source white body, `#295da8` vertical Windows rail (`sideways-lr`), orange Welcome, navy instructions/account text, direct Restart/Shutdown and source Control Panel footer text. Imported exact `assets/images/logowhistler.73c9045c.webp` source bytes: Git blob **`c0528d4a30f97f83400939ae891bc2ae54d863bb`** equals target blob after verified Git binary import. Added `sourceThemeLogonArtwork.winW.logo` and SHA importer group `winW`.

`SourceWinWLogon.tsx`, `sourceWinWLogon.css` and `LogonScreen.tsx` now mount an independent, bounded Guest/power renderer, safe unavailable account dialog, clamped narrow viewport layout and the unchanged original image. Added SSR unit `sourceWinWLogon.test.tsx`, actual desktop/mobile Playwright `source-winw-logon.spec.ts` in focused and full browser suites, and catalog test now expects `winW` without confusing screen availability and full shell status (`pending`). Updated `migration/module-tracker.json` for `src/modules/themes/logon-winw.js` to `in-progress`; source form, spinner, screenshot/pixel matching and WinW shell remain unported. Counts: **12 of 19 partial logon-family renderers; 7 honest Win7-fallback families**. Full evidence: [WINW-LOGON-SOURCE.md](WINW-LOGON-SOURCE.md). No changes to source lock SHA `26b9f0ce7a1665dee89a7c81824bec09e2c75776`, main branch, PR draft status or releases.

**Next gate:** exact-head opt-in `[run-ci]` for new Whistler slice, inspect actual TS/unit/source hash/Vite/targeted/full browser results and fix failures without weakening original guest/power assertions. No green claim until completed. After that, prioritize Desktop/Start/Explorer/Bin submenu and remaining theme family coverage; original-vs-candidate paired screenshot matching still blocked by unavailable source secret.

---

## 24 November 2026 — WinL browser API typing fix before exact-head acceptance

Prior opt-in [Actions #45330319765](https://github.com/codersachin99/windows-os/actions/runs/45330319765) began on `a58bec45`. Source-backed WinL desktop/mobile E2E subsequently found a typing mismatch in an **assertion only**: the Playwright `APIResponse` returned by `page.request.get` exposes `headers()` rather than `headerValue()`. Fixed to `image.headers()["content-type"]` in `tests/e2e/source-winl-logon.spec.ts` (`2ee7866`), keeping the same original binary MIME proof. That old workflow cannot certify the corrected head. The Onebit and WinL source adapters, 37-theme metadata and tests otherwise remain unchanged; preserve opt-in CI, no draft PR merge, original source/main/release untouched. Request exact-head new `[run-ci]` and inspect type/unit/source artwork/build/targeted/full outcomes before further development.

---

## 24 November 2026 — Onebit CI stale catalog assertion repaired; exact WinL logon now ported for winLS/winLP

**Prior exact-head failed CI:** [#45327784052](https://github.com/codersachin99/windows-os/actions/runs/45327784052) at pre-pixelation Onebit head `914cdb58` and [#45328094689](https://github.com/codersachin99/windows-os/actions/runs/45328094689) at pixelation head `8defd468`. Both passed TypeScript, all units (latest 129+709), source inventory, artwork, Contacts audit and Vite build. Each failed **only** in `Source shell targeted browser regressions`: **863 passed, 2 failed, 3 skipped**, two desktop/mobile cases in `tests/e2e/source-final-theme-catalog.spec.ts` still asserting `onebit` displayed `win7-fallback` even though a *correct Onebit source-specific renderer* now exists. The dedicated new Onebit Guest/pixel-canvas browser tests passed in focused CI. No full suite ran on these heads because focused checks failed. Commit `ed3c193` updates the catalog expectation to `onebit` while keeping shell status `pending` (not weakening correctness or inventing full theme parity).

**New theme priority:** immutable `legacy-win7/src/modules/themes/logon-winl.js` module `c17d` and `src/styles/themes/logon-winl.css` identify a single WinL logon shared by **winLS and winLP**, separate from Onebit and Win7. Added `SourceWinLLogon.tsx`, `sourceWinLLogon.css`, `LogonScreen.tsx` route, `sourceThemeLogonArtwork.winLS` map, unit + desktop/mobile E2E tests and focused CI inclusion. The original `login-winL.d27b081a.webp` Git blob SHA `fd22904131ad5ddb4ab5c316edbe9eb19aa01376` was copied via Git binary blob **byte-for-byte** and equality verified; added to `scripts/import-source-theme-assets.py` SHA audit. Reuses exact existing `guest-win10` avatar and `start-button-winxp` brand. WinL uses original 512×320 gray-gradient frame, white pane, 100px Guest avatar and Restart/Shutdown controls, with only narrow-mobile viewport clamping. Test catalog now correctly expects the `winLS` renderer for both themes while `sourceThemeShellStatus` remains `pending`; source module tracker marks `logon-winl.js` **in-progress**, not implemented. Family logon partial count is now **11 of 19**, **8** still explicit fallback. More: [WINL-LOGON-SOURCE.md](WINL-LOGON-SOURCE.md).

**Pending verification** of exact new head: TS, all units, pinned inventory/hash/artwork/Contacts audits, Vite build, new Onebit/WinL focused desktop/mobile and full Chromium suite. Request opt-in `[run-ci]` once on final head. The private original `legacy-win7` reference remains frozen at `26b9f0ce7a1665dee89a7c81824bec09e2c75776`. Paired original-vs-React 37-theme pixel validation still needs `LEGACY_SOURCE_READ_TOKEN` for optional visual Action; do not claim it. Draft PR #1 remains unmerged; `main` and releases unchanged. After gate, continue Desktop/Start/Computer/Bin and remaining 8 theme logon families, using actual source modules.

---

## 24 November 2026 — green full submenu acceptance and Onebit source logon increment

Verified exact previous head `0ddcfb62`: [CI #45144237553](https://github.com/codersachin99/windows-os/actions/runs/45144237553) **SUCCESS**. TS, units (**127 + 704 passed**), frozen original migration inventory, byte-matched theme artwork, Contacts source audit and Vite production build passed; **focused Playwright 863 passed / 3 skipped**, **full desktop/mobile Playwright 1313 passed / 5 skipped**. This confirms the preceding Desktop detached View/New, Explorer/Bin cascading placement and mobile pointer-corridor, Win95/98/2k Start nested hover preservation, Shortcut Wizard and Control Panel Backup regressions. It does **not** establish original screenshot parity; `visual-capture` was skipped.

Next code slice for the user's **many original themes** priority: source `src/modules/themes/logon-onebit.js`, `src/styles/themes/logon-onebit.css` and `src/modules/themes/theme-onebit-scss.js` (immutable original SHA `26b9f0ce7`) show a **separate Onebit Guest logon**, with exact dark `#352b30` / sand `#e6d4bf` palette, square 2px outlined Guest frame and 4px button shadows, source showInstruction/captcha options, and direct Shutdown/Restart power items. React previously marked `onebit` as `win7-fallback` login.

Implemented `SourceOnebitLogon.tsx`, `sourceOnebitLogon.css`, `LogonScreen.tsx` routing and unit/browser contracts in `sourceOnebitLogon.test.tsx` and `source-onebit-logon.spec.ts`. The original source palette/hover, real Guest login, power actions and explicitly unavailable separate account auth are preserved. Browser tests run on both desktop/mobile and were added to opt-in focused suite. Crucially: original captcha form, some source icon glyphs and full Onebit desktop shell are **still not ported**; `sourceThemeShellStatus("onebit")` remains `pending` and `module-tracker.json` for `logon-onebit.js` is **in-progress**, not implemented. Theme screen-family progress is now **10 of 19** partial renderers (9 fallback). Trace: [ONEBIT-LOGON-SOURCE.md](ONEBIT-LOGON-SOURCE.md); updated [ALL-SOURCE-THEMES.md](ALL-SOURCE-THEMES.md).

No new Onebit exact-head tests are claimed passed until its own opt-in `[run-ci]` completes. Original paired captures still need `LEGACY_SOURCE_READ_TOKEN`. Keep frozen source, `main`, draft PR #1 and releases unchanged. Next inspect latest CI stage/job logs and repair any regression before expanding more source-backed themes, Desktop, Start, Explorer/Bin.

---

## 23 November 2026 — full browser CI: remaining Shortcut Wizard and Control Panel Backup New-menu selectors fixed

Exact-head [CI #45110895627](https://github.com/codersachin99/windows-os/actions/runs/45110895627) at `51e17e4` completed **FAILURE** only in full browser acceptance, not focused: TypeScript, all units, original-source inventory, original artwork hash audit, Contacts audit, Vite build, Chromium installation and **focused source-shell suite: 863 passed / 3 skipped**. The full E2E run had **1301 passed / 12 failed / 5 skipped**. The prior opt-in [CI #45110555028](https://github.com/codersachin99/windows-os/actions/runs/45110555028) had its focused suite pass as well (857 passed) but the same full-suite stale selectors (1295 passed / 12 failed / 5 skipped).

Inspected actual Actions job `137482761473`: **all 12** were the same migrated Desktop New-menu DOM structure, not errors in app logic or Win9x hover geometry: 10 desktop/mobile Playwright cases in `tests/e2e/shortcut-wizard.spec.ts` (5 tests × 2 projects) waited for `Shortcut` inside the root `data-test-desktop-menu`; 2 (1 × 2 projects) in `tests/e2e/cpanel.spec.ts` waited for `Text Document` under that same root. In correct source-style Desktop context menus the New submenu is a detached sibling `data-test-desktop-background-submenu`. Updated both test files to open the unchanged source `data-test-desktop-new` trigger, assert child `aria-label="New"`, and click real submenu item from that sibling. Kept all original functional coverage: real Guest shortcut wizard and persisted .lnk with Calculator/Notepad/Paint, Browse/Cancel/close and unique naming, and Backup/Restore ZIP import without overwrite. No app source behavior changed in this slice.

**Next:** run exact-head opt-in `[run-ci]` and inspect actual results. If green, add further source-backed UI parity tasks; if browser still fails, repair without blanket skipping. PR #1 stays draft, no main merge or release. Original legacy SHA `26b9f0ce7a1665dee89a7c81824bec09e2c75776` is unchanged. Original-vs-React 37-theme screenshots still cannot be declared equal without source reference capture.

---

## 23 November 2026 — Win95/Win98/Win2k Start stacked submenu pointer corridor parity

Continued after mobile viewport test correction `c42d106` and opt-in run [#45110555028](https://github.com/codersachin99/windows-os/actions/runs/45110555028) (initially in progress; its head predates this new slice, so it **cannot** verify it).

Next source-backed user priority: context submenus in **other apps/Start**, not only Desktop, Computer and Bin. The classic Win95/98/2000 Start menu has its own `sourceWin9xSubmenuPlacement` with mobile Programs **below** and power options **above**; nested flyouts were already measured and triggered correctly, but `SourceWin9xStartMenu.tsx` cleared the branch in ordinary command rows' `onPointerEnter`, or switched branch on pointer crossing another trigger. This can discard a stacked popup as the user travels past an intervening root row toward its child. Fixed it by suppressing **incidental row/other-branch hover** only while the actual measured direction is `below`/`above`; normal adjacent desktop hover and explicit click, power, program launch and ArrowLeft/Escape behavior remain unchanged. No CSS colors, assets, menu source dimensions or VFS changed.

Added three real browser regression cases (desktop/mobile = 6 project cases) in `tests/e2e/source-win9x-shell.spec.ts`: one per Win95/98/2k; narrow 375px phone layout; hover Documents while Programs is stacked, then launch Notepad; hover Find/Search while Shutdown is stacked, then perform Log off. Existing screen geometry/trigger and command tests remain. Existing opt-in focused CI command **already includes this file**, so no workflow logic change needed. Extended `migration/CONTEXT-SUBMENU-CASCADE-EDGE-SOURCE.md`.

Validation pending at this new exact head: TS, units, pinned source/artwork hashes/Contacts audit, Vite, focused and full Chromium desktop/mobile. Do not claim original screenshot parity: 37-theme paired captures still lack private-source checkout token for Actions. Keep `main`, frozen source SHA and draft PR #1 unchanged; no release. Next evaluate the latest actual workflow log, fix any failure, then continue Start/context/Explorer visual and functional parity.

---

## 23 November 2026 — fix Playwright mobile about:blank viewport pre-navigation assertion

[Exact-head CI #45056170267](https://github.com/codersachin99/windows-os/actions/runs/45056170267) on `d9d0c8e` failed **only** a new mobile stacked-submenu E2E: 856 focused browser passes, 1 failed, 3 skipped. Job `137311774234` explicitly reported `window.innerWidth` = **980**, expected **320**, at the assertion *before* `guest(page, "win7")`. This is Chromium mobile's initial `about:blank` default layout viewport, **not** evidence of a defective menu or a failed responsive app page. The app's `apps/web/index.html` already has `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`.

Committed test-only fix `c42d106`: preserve `page.setViewportSize({width:320,height:800})`, **navigate and log in first**, then assert the browser's real 320px CSS viewport before opening Computer/Bin and exercising stacked View/New pointer and keyboard behavior. No source features, CSS, or functional assertions were weakened; root cause is Playwright test lifecycle ordering.

Retain the normal opt-in `[run-ci]` trigger on an exact-head verification commit only, rather than enabling CI on every documentation commit. A CI pass is not yet claimed. `main` and the frozen source remain unchanged, draft PR #1 unmerged. After source-shell targeted and full desktop/mobile acceptance, return to unresolved 37-theme reference visual differences.

---

## 23 November 2026 — resolve sole focused browser failure: mobile test assumed stack despite valid left flip

Current latest full-check [CI #45045984846](https://github.com/codersachin99/windows-os/actions/runs/45045984846) at `328d8fa` completed **FAILURE** solely in one new mobile test: 856 focused browser passes, 1 failed, 3 skipped. TypeScript, full unit suite, pinned source inventory, byte-identical artwork, original Contacts audit and Vite build **PASSED**. Full desktop+mobile browser stage was not reached due to focused failure. Log confirmed actual Computer View child had `data-side="left" data-cascade="adjacent"` while test unconditionally expected `"stacked"` merely because it ran in the mobile project. Left-flipping is explicitly correct whenever two actual measured popups fit; it is not a production-side bug.

`tests/e2e/source-menu-cascade-edge-placement.spec.ts` now deliberately sets a **320 CSS px touch viewport** before entering Guest, and confirms `window.innerWidth === 320`. The tested 205px source parent/child cannot fit laterally there, so the test genuinely exercises the stacked popup pointer corridor. The pre-existing tests cover source right-opening/left-flipping at larger viewports independently. No application code or assertions of real pointer/keyboard behavior were removed. Exact-head opt-in `[run-ci]` required again; preserve CI opt-in policy, do not declare browser success before run. Keep frozen original, `main`, draft PR #1 and releases untouched. 37-theme original/React side-by-side pixel acceptance remains outstanding.

---

## 22 November 2026 — full desktop/browser old inline-selectors reconciled

After the 22 logged focused failures (fixed in three files), proactively scanned prior full-suite Desktop/New/hover/drag/clipboard tests that are NOT all part of focused CI. More legacy-inline selectors remained in `desktop-create.spec.ts`, `desktop-icons.spec.ts`, `source-context-hover.spec.ts`, `desktop-clipboard.spec.ts`, `desktop-bin-drop.spec.ts`, `desktop-explorer-drop.spec.ts`, and `explorer-desktop-icons.spec.ts`. Updated helpers to open the **unchanged real Desktop View/New trigger** and choose children from the new `data-test-desktop-background-submenu` sibling, including aria-label assertions. The original *functional* tests for persistent icon positions, visibility, folder creation, clipboard, Bin restore, native pointer drag/drop, keyboard and hover are all retained. Old Explorer background child selectors remain valid because Explorer's children are positioned inside the root DOM node, but absolutely painted outside its bounds.

No application behavior was changed in this follow-up test repair. Existing opted-in CI at `9706c46` started before this full-suite sweep and cannot certify it. Deliberate new `[run-ci]` at latest head required. If full suite still fails, read the exact log and repair without skipping features or weakening assertions. No merge/release/pixel-parity claim. Frozen legacy source and `main` still untouched.

---

## 22 November 2026 — repair existing browser tests for detached Desktop cascades

[Earlier opt-in CI #45040528367](https://github.com/codersachin99/windows-os/actions/runs/45040528367) at `8c179c9` **FAILED** in focused browser: 834 passed / 22 failed / 2 skipped. TypeScript, all units, source inventory, byte-identical artwork, Contacts audit and Vite build completed before browser. Inspected the actual failed job log (`137263728312`): **all 22 cases in three historical files used stale inline-root selectors**, now invalid since the correct Desktop View/New children are detached sibling `data-test-desktop-background-submenu` surfaces. 4 failures from `desktop-item-source-menu.spec.ts` New > Text Document click, 12 from `source-win7-aero-context-themes.spec.ts` View child query, 6 from `source-win7-classic-rtl-context-themes.spec.ts` View child query, each desktop/mobile. There is no evidence from this log of a production JS regression, but new geometry and mobile interaction acceptance still need fresh CI.

Updated all three test files to query the actual detached child. The New file-creation E2E retains its real source Guest create/rename/download/Delete/Bin functional checks. Aero and Classic tests now additionally assert source theme styling **of the child popup**, and aria-label View, rather than merely weakening visibility. Existing root paint/hover/working Open and RTL tests remain. Fresh exact-head `[run-ci]` required after these commits. A previous mobile-stack `[run-ci]` [#45045374660](https://github.com/codersachin99/windows-os/actions/runs/45045374660) at `306e050` was still running when this test repair was made; it *predates* repaired tests and cannot validate them. No source screenshot equality yet, no release/merge, frozen source and `main` unchanged.

---

## 22 November 2026 — complete Explorer mobile stacked submenu pointer corridor

Follow-up to the same user-reported Desktop/Explorer/Bin cascade parity issue. Current source/test checkpoint: [306e050](https://github.com/codersachin99/windows-os/commit/306e050a9b808641198e16a11880b6321dafaf06) (intentional opt-in `[run-ci]`). Earlier shared geometry and desktop sibling cascade is at [8c179c9](https://github.com/codersachin99/windows-os/commit/8c179c97e69cb96547fc4d62ca45ebd5529ba1fd). Explorer background View/New could still close or change while an above/below mobile stack was reached by crossing its own root rows; the existing Explorer item Send-to and Desktop stacks already handled that corridor.

`packages/apps/explorer/src/ExplorerApp.tsx` now records actual measured `data-cascade` on background View/New and, **only for stacked mobile fallback**, ignores incidental root row pointer travel and sibling View/New hover. Normal adjacent desktop right-opening/left-flipping, clicks, keyboard and theme styles are unchanged. `tests/e2e/source-menu-cascade-edge-placement.spec.ts` now checks actual mobile Chromium pointer crossing of Refresh and View rows, preserves Computer View/New and Bin View child visibility, and verifies ArrowLeft focus return. The original source/React test matrix remains bounded; see [CONTEXT-SUBMENU-CASCADE-EDGE-SOURCE.md](CONTEXT-SUBMENU-CASCADE-EDGE-SOURCE.md).

Previous [CI #45038369243](https://github.com/codersachin99/windows-os/actions/runs/45038369243) **SUCCESS** but is the *earlier Bin slice*, not this fix. New `[run-ci]` requested on code head 306e050. This GitHub connector exposes no matching push-triggered workflow runs when queried by commit, so **do not mark new CI as passed** without viewing the actual Actions run. No local dependency/build/browser verification available in the current sandbox; code source and test contents were re-fetched to confirm writes. Next check CI (TS, all units, original source/artwork/Contacts audits, Vite, targeted and full desktop/mobile Playwright), repair failures, then continue source-backed Desktop/Start/Computer/Bin and 37-theme visual parity. `LEGACY_SOURCE_READ_TOKEN` still missing; no paired source screenshots. Keep frozen legacy SHA, `main`, draft PR #1 and no release unchanged.

---

## 22 November 2026 — Desktop/View/Sort/New, Explorer/Bin cascade edge flipping

User specifically requested Windows source context submenus **open to the right**, or **flip left when they would exceed the screen edge**, across Desktop and apps. Initial audit found Desktop background View / Sort by / New children rendered inline inside scroll-clipped `windows-desktop__menu`, changing its measured height. Desktop item Send-to used fixed width/index row offsets. Explorer/Bin already had source-measured side-flipping `sourceExplorerSubmenuPlacement` with dedicated unit/Playwright, but it was an app-only implementation.

Implementation committed on feat/0001-faithful-react-foundation: `packages/ui/src/sourceCascadingSubmenuPlacement.ts` factors out existing Explorer source-adjacent right/left/vertical/mobile geometry; TypeScript and Vite alias `@windows-os/ui/menu-cascade`; `packages/apps/explorer/src/sourceExplorerSubmenuPlacement.ts` re-exports with former public API (no consumer change). `DesktopIcons.tsx`: View/Sort/New now render a sibling measured context menu `data-test-desktop-background-submenu` rather than inline root children; Send-to uses the same actual parent+row+child measurements and CSS-local position. Desktop keyboard arrows operate inside each submenu; ArrowLeft restores its exact trigger; Escape/outside-click and theme skins still apply; root height remains constant. On mobile, when no side fits, child stacks above/below without accidentally switching submenu on parent row crossing. CSS bounds paint above root. Paths/Guest permissions/clipboard untouched.

Tests: new `packages/ui/src/sourceCascadingSubmenuPlacement.test.ts` verifies right, left, narrow stack, vertical clamp alongside existing Explorer tests. New `tests/e2e/source-menu-cascade-edge-placement.spec.ts` tests Win7/XP/Win11-dark, desktop/mobile, right/left/viewport/parent-height/keyboard, plus real Computer and Bin View cascades. Updated `tests/e2e/desktop-context-source.spec.ts`, `source-desktop-context-keyboard.spec.ts`, `source-desktop-context-theme.spec.ts` to locate detached submenu rather than the previous inline root children. Focused opt-in CI list updated. Exact source scope/limits: [CONTEXT-SUBMENU-CASCADE-EDGE-SOURCE.md](CONTEXT-SUBMENU-CASCADE-EDGE-SOURCE.md).

Previous #45038369243 on baef407 covers Bin deleted-folder open restriction, *not* this new refactor; its full browser step was still in progress as this work began. Next: deliberately run current head `[run-ci]` and inspect TS/units/source inventory SHA/Contacts/Vite + focused and entire desktop/mobile browser. If tests fail, fix the real regression and repeat; do not claim acceptance in advance. `LEGACY_SOURCE_READ_TOKEN` still missing for private legacy-win7 original paired 37-theme screenshots. No merge, no release; PR #1 stays draft, main/pinned legacy immutable.

---

## 22 November 2026 — frozen Recycle Bin does not open deleted folders before Restore

Most recent previously accepted checkpoint: [CI #45018661202](https://github.com/codersachin99/windows-os/actions/runs/45018661202) completed **SUCCESS** at 7d162af, verifying previous original Win7 Start hover artwork, TS, unit, source inventory/byte-identical artwork/Contacts, Vite and focused/full Chromium desktop/mobile. No paired original screenshots, `visual-capture` skipped.

Found source discrepancy in immutable legacy-win7@26b9f0ce7 `src/modules/apps/computer.js open(e)`: guards *all* entries with `e.uri.includes(this.trashPath)` BEFORE dispatch to shortcut/file/openFolder; `src/modules/apps/bin.js` hoists Computer to `trashPath`. Candidate ExplorerApp `openEntry` checked directory first, allowing deleted folder double-click/Enter to navigate into the Bin tree. Fixed `packages/apps/explorer/src/ExplorerApp.tsx` to reject all `isBin` types first (same existing 'Restore this item...' alert as deleted files); normal Computer directory navigation unaffected, as are Restore and Delete confirmation lifecycle.

New `tests/e2e/source-bin-folder-open-guard.spec.ts` creates a real nested folder, recycles the parent, tests no Bin address/Back-history change for pointer double-click and Enter, then restores and checks nested folder survives. Three source skins win7/winxp/win11 x Chromium desktop/mobile. Focused Actions browser test list updated. See [BIN-OPEN-GUARD-SOURCE.md](BIN-OPEN-GUARD-SOURCE.md) for exact source trace and limits.

Next: deliberate `[run-ci]` checkpoint of THIS new head (TS, all units, source inventory/byte-identical artwork/Contacts, Vite, targeted/full desktop+mobile Playwright). Repair any real browser test failures; keep branch PR #1 draft, no release or main/immutable source changes. Original paired pixel comparison of 37 theme IDs remains blocked on LEGACY_SOURCE_READ_TOKEN.

---

## 22 November 2026 — exact original Win7 Start library icon blobs and 400-ms hover

Accepted prior checkpoint: [CI #45002955097](https://github.com/codersachin99/windows-os/actions/runs/45002955097) SUCCESS at 48383e4 (source Win7/Vista/Basic Guest Documents/Pictures/Music link navigation; focused/full desktop/mobile). The original-vs-React visual job was skipped, not verified.

Frozen legacy-win7@26b9f0ce7 source `src/modules/shell/startmenu-base.js`: original start-docs/start-pics/start-music image keys for right-pane links; hover/leave calls showLinkIcon(key or empty), which defers avatar replacement by 400 ms; no preview when `isBaseTheme`/custom/useBaseAssets. Six original binaries (standard WebP plus base SVG) fetched as base64 from immutable legacy SHA and written to target via `create_blob`/`create_tree`/`create_commit`/lease-protected `update_ref`, all byte-identical original Git blob SHA checks. Atomic binary import commit 7ec98fca. Hashed paths under apps/web/public/assets/images preserved. New pinned expected hashes in `scripts/import-source-theme-assets.py` theme `win7`, so target-only CI audits all six.

New `packages/assets/src/index.ts` `sourceWin7StartLibraryArtwork` and `sourceWin7StartLibraryIcon(theme,key)` maps standard WebP and Basic source SVG without substitutions; `StartMenu.tsx` now swaps Guest avatar to proper image on delayed 400-ms mouseenter, restores on delayed mouseleave for Win7/Vista/Aero family, disables preview for Basic. `sourceStartMenuThemes.css` prevents portrait cropping/borders on source icon, keeping existing candidate avatar box until paired visual geometry verified. Added `packages/assets/src/sourceWin7StartLibraries.test.ts` and `tests/e2e/source-win7-start-library-artwork.spec.ts` with image-load, avatar-restore, and Basic no-preview assertions in desktop/mobile Chromium, focused CI list updated. Prior `WIN7-START-USER-LIBRARIES-SOURCE.md` reconciled to this later import. Detailed source proof: [WIN7-START-LIBRARY-HOVER-ARTWORK-SOURCE.md](WIN7-START-LIBRARY-HOVER-ARTWORK-SOURCE.md).

Next: trigger [run-ci] at exact new head to pass TS, all unit tests, pinned source inventory, full original hash manifest artwork, Contacts audit, Vite build, focused and full desktop/mobile Playwright; diagnose failures before further features. Source useBaseAssets/custom theme preview rules and original full menu layout still need screenshot comparison across 37 source themes. `LEGACY_SOURCE_READ_TOKEN` not configured, paired visual job skipped. No merge/release, main/pinned source untouched.

---

## 22 November 2026 — Win7/Vista/Basic Start user-library links restored

Last checked existing CI: [#44994511592](https://github.com/codersachin99/windows-os/actions/runs/44994511592) at 4da2277 SUCCESS (source Desktop mixed-selection path count); [#44995958802](https://github.com/codersachin99/windows-os/actions/runs/44995958802) at d6900c2 SUCCESS (Win7-family touch search focus), including focused/full desktop/mobile browser. Visual capture skipped because LEGACY_SOURCE_READ_TOKEN is missing. Never conflate these accepted prior SHAs with subsequent new work.

Frozen `legacy-win7@26b9f0ce7` `src/modules/shell/startmenu-base.js` `shortcuts()` renders `data-test-startmenu-link=documents/pictures/music` in Start right pane, with `this.open('computer', this.userPath + '/Documents'/'Pictures'/'Music')`. React `packages/ui/src/StartMenu.tsx` omitted all three and only offered generic Games/Computer/etc. Now adds all three links before Games for `isWin7StartFamily`, routing `OPEN_APP` Computer with file path derived from permissioned Guest `desktopPath`'s parent; mount/launcher missing yields visible error. Win10 source separately routes rail Documents to `open('computer')`, untouched. No direct host filesystem access, no frozen source or main modifications.

Added `tests/e2e/source-win7-start-user-libraries.spec.ts`: real win7, winvista, basic-1 Start links each navigate to mounted Guest `/Users/Guest/Documents`, `/Pictures`, `/Music`; actual Explorer address asserted; Explorer closed before next link. Win10 rail separate behavior asserted. Included in focused CI. Documentation: [WIN7-START-USER-LIBRARIES-SOURCE.md](WIN7-START-USER-LIBRARIES-SOURCE.md). Exact original theme-specific start-docs/start-pics/start-music images and 37-theme paired screenshots still pending; this is a bounded FUNCTIONAL link parity fix, not pixel parity.

Next: deliberately trigger exact-head `[run-ci]`; verify TS, all unit tests, pinned source inventory/artwork/Contacts, Vite, focused + full desktop/mobile Playwright. Repair any genuine failures before merging or releasing. PR #1 remains draft, frozen legacy SHA and windows-os/main immutable.

---

## 22 November 2026 — Win7-family Start search focus is desktop-only on initial open

Frozen source `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`, `src/modules/shell/startmenu-base.js`: `watch.isOpen(t)` schedules `focusSearch` only if `!isTouchDevice()`. Existing React `StartMenu.tsx` set unconditional `autoFocus` on non-XP Search causing touch keyboards to appear immediately for Win7/Vista/Basic Start. Only the Win7-family path was changed; Win10/Win11 Start focus retains existing behavior pending separate source audit.

`StartMenu.tsx`: `startSearchRef` plus conditional `useLayoutEffect` on mount focuses the Win7-family Search only when `navigator.maxTouchPoints===0` and pointer media query is not coarse, with `preventScroll`; `autoFocus={!isWin7StartFamily}` preserves other flavors. Input remains editable/tappable. Touch detection is browser approximation of original utility, not false claim of byte-identical implementation.

New `tests/e2e/source-start-search-touch-focus.spec.ts` tests `win7`, `winvista`, `basic-1` on Chromium desktop/mobile: Search immediately focused on desktop only, mobile tap explicitly focuses, typing works; focused CI list updated. See [START-SEARCH-TOUCH-FOCUS-SOURCE.md](START-SEARCH-TOUCH-FOCUS-SOURCE.md). Previous #44994511592 on `4da2277` had passed targeted browser regression and was still on full boot/Contacts step when this later slice began; it predates Start changes. New exact-head `[run-ci]` required and may reveal genuine test issues, to be fixed without weakening source behavior. No merge/release or 37-theme visual parity claim. Keep pinned legacy and main unchanged.

---

## 22 November 2026 — targeted CI failure: old Desktop icon-count assertion replaced

Checkpoint [CI #44990550774](https://github.com/codersachin99/windows-os/actions/runs/44990550774) at `faaa7ea` completed FAILURE solely at focused browser step, with two cases in `tests/e2e/desktop-item-source-menu.spec.ts` (chromium-desktop and chromium-mobile): `source Desktop multi-select removes Open and Rename from item context` expected no Open when selected Computer + one text file. The real pinned legacy-win7 `src/modules/system/main.js DesktopItemMenu.isMultiple` counts selected `shortcut.path` entries, not highlighted Computer icon; Computer has no path. New implementation is source-correct; old test was stale. TypeScript, unit tests, source inventory, byte-identical theme artwork/Contacts audits and production build passed earlier steps.

Committed `tests/e2e/desktop-item-source-menu.spec.ts` correction: first verify Computer+one Guest text file retains Open/Rename and enabled Delete, then upload second genuine file and select both files+Computer to verify Open/Rename hidden and Delete still enabled. Retains previous test value with now source-accurate stronger coverage; does not relax production code or remove any test. `tests/e2e/source-desktop-context-path-count.spec.ts` already independently validates ZIP extraction, multi-file and program-only scenarios.

Next: opt in exact-head `[run-ci]`; inspect targeted and complete desktop/mobile regressions, fix any real failure, update durable acceptance; keep PR #1 draft, `windows-os/main` and frozen legacy SHA unchanged. Original-vs-React 37-theme paired visual capture still unverified without `LEGACY_SOURCE_READ_TOKEN`.

---

## 22 November 2026 — Desktop context-menu isMultiple counts real selected paths

Previous accepted checkpoint: [CI #44984857015](https://github.com/codersachin99/windows-os/actions/runs/44984857015) SUCCESS on d8b5efb (Desktop Bin pointer shortcut data-loss guard), with TypeScript, units, original source inventory/artwork/Contacts audits, build, focused/full desktop/mobile Playwright. Paired frozen original-vs-React screenshots across 37 theme IDs not yet verified.

Frozen source proof at legacy-win7@26b9f0ce7 src/modules/system/main.js DesktopItemMenu: data watcher maps selected ids to getShortcut(key).path, excludes system icons without real path; computed isMultiple is this.paths.length > 1. openItemMenu retains the clicked selected icon within selected group. Previous React contextKeys.length>1 incorrectly hid Open, Rename, Properties and Extract here when Computer, Bin or a program-only .lnk was selected alongside just one real Guest file.

Implemented packages/ui/src/desktopFileActions.ts desktopSourceItemMenuPathCount(items,selectedKeys): counts validated real path-bearing shortcut ICONS including distinct aliases of same target, ignoring system/program-only/host/stale icons. Existing file clipboard continues to deduplicate actual target URIs; menu cardinality deliberately differs. packages/ui/src/DesktopIcons.tsx uses that count for contextMultiple both in sourceDesktopItemMenu input and source Guest ZIP Extract here predicate. Existing menu order, real ZIP/Download/Copy/Cut/Delete and other services untouched.

Regression: packages/ui/src/desktopFileActions.test.ts new cardinality matrix, and tests/e2e/source-desktop-context-path-count.spec.ts tests real mixed Computer+ZIP preserving Open/Rename/Extract here (including actual extracted Guest file), mixed two files+Computer hiding single-item actions, and program-only link+one file showing source single-item actions. Focused desktop/mobile Playwright CI list updated, full browser suite still enabled. See [DESKTOP-CONTEXT-PATH-COUNT-SOURCE.md](DESKTOP-CONTEXT-PATH-COUNT-SOURCE.md).

Next: run new exact-head [run-ci] to verify TS/units/pinned source inventory/artwork/Contacts/Vite/targeted and full desktop+mobile browser; diagnose any failure without weakening source assertions. Keep draft PR #1, main and original SHA unchanged, no release. After acceptance advance Start menu, Computer/Bin and all-theme pixel/function parity. Paired screenshot capture requires LEGACY_SOURCE_READ_TOKEN.

---

## 22 November 2026 — Bin pointer drag: actual frozen source differs from React extension

Confirmed [CI #44938100831](https://github.com/codersachin99/windows-os/actions/runs/44938100831) SUCCESS on 6741bed (combined Desktop shortcut compression and target Delete). Earlier compression-only [#44937841704](https://github.com/codersachin99/windows-os/actions/runs/44937841704) also SUCCESS. Paired original visual capture not completed.

Frozen legacy-win7@26b9f0ce7 src/modules/system/main.js Desktop icon mixin pressIcon/moveIcons/dropIcons only uses ShortcutMove to reposition selected icon group, unlike Delete keyboard/context handlers which invoke deleteItems on getShortcut(key).path. Existing React drag-to-Bin is an additional feature, NOT source parity; it had an unsafe fallback trashMany(file.entry.uri) for .lnk, deleting the shortcut JSON without confirmation, contradicting source target Delete.

Committed desktopSafeBinDragPaths in packages/ui/src/desktopFileActions.ts and wired DesktopIcons.tsx: only directly mounted canonical Guest files/folders can be dragged into React Bin convenience. Deny path-backed or program-only .lnk, system/unknown/host paths, or groups mixing any forbidden item as one whole batch; show clear alert pointing to explicit source-backed Delete, never delete a .lnk JSON or linked file on drop. Existing direct folder/batch move-to-Bin works unchanged; original icon drag/Explorer transfer code remains.

Added desktopFileActions.test.ts unit safety matrix and new desktop/mobile real pointer E2E source-desktop-bin-drag-guard.spec.ts: Explorer-created Documents target linked on Desktop; drop onto Bin denied; both link and original Documents TXT intact, Bin contains neither; program-only link denied. Included new focused browser test in opt-in .github/workflows/react-checks.yml. Full source evidence: [DESKTOP-BIN-DRAG-SAFETY-SOURCE.md](DESKTOP-BIN-DRAG-SAFETY-SOURCE.md). Previous green CI predates this slice. Request exact-head [run-ci] for all TS/unit/source inventory/artwork/Contacts/Vite/focused/full desktop+mobile browser and repair genuine failures. Do not merge PR #1, mutate source/main, or claim pixel parity across 37 themes.

---

## 22 November 2026 — Desktop path-backed shortcut Delete is target-based; restore regression

**Source proof:** frozen `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776` `src/modules/system/main.js` `DesktopItemMenu.deleteShortcut()` calls `deleteItems(this.paths)`, with `this.paths=selected.map(this.getShortcut).filter(shortcut=>shortcut.path).map(shortcut=>shortcut.path)`; keyboard `deleteSelectedIcons()` uses the same `getShortcut(key).path` selection. File-backed Desktop .lnk created by Explorer Send to Desktop points to real Guest target in Documents, not the .lnk JSON URI.

**Committed:** `DesktopIcons.tsx` context Delete and keyboard Delete now call `desktopSourceClipboardPaths` to confirm/recycle actual canonical mounted Guest targets; no host operations or shortcut deletion as a side effect. Program-only link with no path skips keyboard deletion and source menu Delete remains visible **disabled** via `sourceDesktopItemMenu.ts`. The existing Guest `trashMany` transaction and confirmation are retained. Linked .lnk stays on Desktop; target enters Bin and may be restored.

**Regression:** new `tests/e2e/source-desktop-shortcut-delete.spec.ts` added to focused desktop/mobile browser gate: real Explorer-created path-backed .lnk → Delete confirmation → original target absent in Documents, desktop .lnk still visible, Recycle Bin contains **actual binary**; Restore → exact original bytes download; program-only .lnk Delete disabled and keyboard Delete cannot trigger confirmation. Unit assertion in `sourceDesktopItemMenu.test.ts`. [Full source, security and acceptance note](DESKTOP-SHORTCUT-DELETE-SOURCE.md).

**CI:** previous exact-head [#44931334630](https://github.com/codersachin99/windows-os/actions/runs/44931334630) SUCCESS on `7af9b85` for clipboard. Compressed shortcut [#44937841704](https://github.com/codersachin99/windows-os/actions/runs/44937841704) was still in focused browser step at `34904c3` when Delete implementation began; **does not** validate Delete work. New exact-head opt-in `[run-ci]` required for TypeScript, all units, pinned inventory/artwork/Contacts, Vite, focused and complete desktop/mobile. Remaining drag-to-Bin source difference should be treated separately. Don't merge/release or claim paired original visual parity without secret and actual screenshots across all 37 themes.

---

## 22 November 2026 — Desktop shortcut Send to compressed ZIP source parity

**Previous accepted baseline:** [CI #44931334630](https://github.com/codersachin99/windows-os/actions/runs/44931334630) SUCCESS at `7af9b85` for source Desktop Copy/Cut and all earlier ZIP/Download commits (TS, units, pinned source inventory, original artwork/Contacts audits, Vite, focused/full desktop/mobile browser); paired original screenshots remain unverified.

**Frozen source evidence:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`, `src/modules/system/main.js` `DesktopItemMenu` Send to → compressed folder: `this.compress(this.paths)`; `this.paths` comes from selected `this.getShortcut(key).path`; submenu hidden when `!this.paths.length`. An Explorer-created path-backed `.lnk` on Desktop pointing at Documents must archive the real Documents target, not shortcut JSON. Program-only links with no `shortcut.path` should not offer Send to.

**Implementation:** `packages/ui/src/desktopFileActions.ts` adds `desktopSourceArchiveSelection` resolving canonical mounted Guest target paths via established `desktopSourceClipboardPaths` and the shared source ZIP adapter's one-parent safety restriction. `DesktopIcons.tsx` gates and invokes `createSourceGuestArchive` with actual source parent, selecting new Desktop icon only when ZIP created there; Documents ZIP remains in Documents, and original shortcut is preserved. `sourceDesktopItemMenu.ts` hides Send to when no source shortcut paths. Bounded atomic compression, overwrite safety and no host access unchanged. Source proof, distinctions and test contracts: [DESKTOP-SHORTCUT-COMPRESS-SOURCE.md](DESKTOP-SHORTCUT-COMPRESS-SOURCE.md).

**Regression:** expanded `desktopFileActions.test.ts` for real target, single/mixed Guest parents, program-only links, unsafe paths; expanded `sourceDesktopItemMenu.test.ts`; appended two desktop/mobile browser scenarios to already focused `source-desktop-send-to-compressed.spec.ts`: real Explorer-created target shortcut ZIP byte integrity in Documents; program-only link hidden. Existing direct file/batch ZIP scenarios unchanged.

**Acceptance still pending:** request deliberate exact-head `[run-ci]`, inspect TypeScript, units, source audits, original artwork/Contacts, Vite, focused and full desktop/mobile Playwright. Resolve genuine failures without weakening tests. No merge/release. Next priority path-backed shortcut Delete, drag, Desktop/Start/Computer/Bin and all 37 source themes; paired screenshots need `LEGACY_SOURCE_READ_TOKEN`.

---

## 21 November 2026 — Desktop source shortcut Copy/Cut, accepted prior baseline

**Accepted exact-head baseline:** [CI #44913862521](https://github.com/codersachin99/windows-os/actions/runs/44913862521) SUCCESS on `e0dde5bdc39b0a3023e4a3307c62fd3bd414ce52`: TypeScript, all unit/source inventory/artwork/Contacts audits, Vite, focused source regressions and complete desktop/mobile browser. Historical CI #44913595324 failed full browser on a now superseded earlier snapshot; latest exact-head passed, no hidden claim about original side-by-side screenshot parity.

**Frozen next priority:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776` `src/modules/system/main.js` `DesktopItemMenu` `this.paths` enumerates selected `this.getShortcut(key).path`. `copyShortcut()` and `cutShortcut()` dispatch those target Guest paths, not the Desktop .lnk file. `hidden:!this.paths.length` hides Cut/Copy for program-only shortcuts, unlike earlier React behavior.

**Implemented:** `desktopSourceClipboardPaths` in `packages/ui/src/desktopFileActions.ts` resolves source path-backed .lnk to canonical mounted Guest target and excludes programs, system icons, duplicates, unmounted/traversal paths; direct files/folders retain own path. Wired both Desktop context Cut/Copy and keyboard Ctrl+C/X to the existing Explorer-shared `fileClipboard`. `sourceDesktopItemMenu.ts` hides Cut/Copy when no source paths. New Vitest cases in `desktopFileActions.test.ts`, `sourceDesktopItemMenu.test.ts`; desktop/mobile real source e2e `source-desktop-shortcut-clipboard.spec.ts` checks Explorer-created .lnk Copy & Cut target with Notepad/Explorer content and program-only gate, added to deliberate focused browser gate. See [DESKTOP-SHORTCUT-CLIPBOARD-SOURCE.md](DESKTOP-SHORTCUT-CLIPBOARD-SOURCE.md).

**Next:** run new exact-head `[run-ci]` for full TS, units, pinned source inventory, original asset and Contacts audits, build and all focused/full desktop/mobile Playwright, diagnose any failure without weakening tests. Do not merge/release. Never change original source SHA or `windows-os/main`. The original paired visual test requires `LEGACY_SOURCE_READ_TOKEN` and is still unverified across all 37 themes. Remaining Desktop Delete, Drag and Send to compressed-folder semantics for path-backed link targets are independent safety-sensitive source parity gaps. Draft [PR #1](https://github.com/codersachin99/windows-os/pull/1) remains open.

---

## 21 November 2026 — Desktop source path-backed shortcut Download parity

Frozen legacy DesktopItemMenu code in src/modules/system/main.js (DesktopItemMenu) collects this.paths via selected this.getShortcut(id).path, not the JSON .lnk filename. Its Download tests downloadablePaths from these real paths and calls download(this.downloadablePaths). Previous React multi-file Download was fixed for direct desktop icons, but incorrectly excluded Explorer-created path-backed .lnk ZIP targets.

Corrected packages/ui/src/desktopFileActions.ts: desktopDownloadableFiles dereferences validated targetPath for path-backed .lnk, checks normalized mounted Guest root scope again, filters path extension excluding .lnk, returns real target name and uri for byte-identical browser Download. Ordinary program-only .lnk, folders, synthetic icons, host/traversal paths remain excluded. Changes committed b794e50. Added pure unit tests (190b13c) and source e2e in source-desktop-multi-download.spec.ts (a26d613) using real Explorer Send to Desktop .lnk pointing to ZIP in Documents. Tests assert exact archive name/content; no target deletion/host download.

Preserved source multi-selection and original ZIP extraction helper fix (4aa5439) after earlier CI #44909579800 failed 4 browser cases (792 passed) due multi-upload selected icons. CI #44913595324 (a5c8f0d) started as exact-head acceptance for that correction, but is an earlier snapshot than the new path-backed Download changes. Run a new opt-in exact-head [run-ci] after all changes to verify TS/units/source/artwork/Contacts/Vite/focused/full desktop+mobile Playwright. Paired source visual parity across 37 themes not yet possible without LEGACY_SOURCE_READ_TOKEN.

Source still maps Cut/Copy/Delete and Send to compressed ZIP of .lnk path-backed shortcuts via this.paths. Those operations have not been changed in this slice; evaluate next under separate reversible Guest and source evidence tests rather than changing destructive behavior blindly. Keep draft PR #1, frozen source, main untouched, no release.

---
## 21 November 2026 — Desktop Extract here browser regressions diagnosed

CI #44908838690 (caf815e) and combined CI #44909579800 (bc45e6e) both failed only four focused Chromium tests (two scenarios x desktop/mobile). The newer run: 792 passed, 2 skipped, 4 failed; TypeScript, units, source inventory, artwork, Contacts audits, Vite all SUCCESS. Both failure cases reported Extract here menu item NOT FOUND after a multi-file upload, not an extractor failure.

Root cause: DesktopIcons.importDesktopUploads selects all newly imported real files, and DesktopIcons.contextMenu preserves the full selection when right-clicking one already-selected member. Frozen legacy main.js DesktopItemMenu isMultiple intentionally HIDE Extract here for such a selection. React behaves faithfully; the single-item browser tests wrongly assumed a right-click deselected the other files.

Fix commit 4aa5439ddd35a6a6b9b8ed378832d93eff23d115: source-desktop-extract-here.spec.ts shared helper now left-clicks a single icon before single-item right-click. Explicit multi-selection predicate check passes preserveSelection=true and must still hide Extract here. Archive bytes, overwrite safety, unsupported RAR and Guest .lnk assertions remain; no product code, source logic or test coverage was removed.

Next: request deliberate exact-head [run-ci] acceptance of focused/full Chromium and contracts. Keep draft PR #1, source frozen, main untouched, no release. Paired original-vs-React screenshot comparison still blocked by missing LEGACY_SOURCE_READ_TOKEN.

---
## 21 November 2026 — Desktop Download from original multi-selection, queued exact-head acceptance

**Reference:** frozen `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`; work `feat/0001-faithful-react-foundation`, draft [PR #1](https://github.com/codersachin99/windows-os/pull/1). No change to source, target main or releases.

**Specific source bug:** pinned `main.js` `DesktopItemMenu.downloadablePaths()` filters *all* selected real shortcut paths by extension excluding `.lnk`; Download executes `this.download(this.downloadablePaths)`. React's old `downloadSourceFile(item)` only downloaded the clicked Desktop item, and its source menu ignored selected eligible files when clicked item was a `.lnk`.

**New source-backed implementation:** `packages/ui/src/desktopFileActions.ts` extracts unique, actual selected Guest files excluding directory/system icons and `.lnk`; `sourceDesktopItemMenu.ts` accepts `downloadableCount` with default behavior retained for older callers; `DesktopIcons.tsx` reads all eligible Guest binary bytes, then triggers the browser downloads without touching host files. New `desktopFileActions.test.ts`, `sourceDesktopItemMenu.test.ts` and desktop/mobile `source-desktop-multi-download.spec.ts` verify selection, both real byte downloads, and a clicked `.lnk` with an eligible selected TXT. Focused opt-in workflow includes the new spec. Source proof: [DESKTOP-MULTI-DOWNLOAD-SOURCE.md](DESKTOP-MULTI-DOWNLOAD-SOURCE.md).

**Important boundary:** frozen `main.js` Desktop Properties `launchSetting(this.type)` resolves to the Capacitor `Launcher.launchMiscellaneous({target:type})` host action, **not** the internal System Properties React app; leave disabled pending a permissioned native adapter, do not invent parity.

**Prior acceptance:** Explorer ZIP extraction [CI #44905733445](https://github.com/codersachin99/windows-os/actions/runs/44905733445) SUCCESS on `d143ba3`. Desktop Extract here [CI #44908838690](https://github.com/codersachin99/windows-os/actions/runs/44908838690) at `caf815e` still had Source shell targeted browser regressions active when observed; its exact snapshot **predates** the `.lnk` test correction and all new multi-Download commits. New combined exact-head opt-in `[run-ci]` is required for TypeScript, all unit/source/artwork/Contacts audits, Vite, focused and full desktop/mobile Playwright. Do not claim either newer code slice verified before its own success. Original paired screenshot job still cannot prove 37-theme parity without private read token. Diagnose any failure without disabling or deleting tests.

---

## 21 November 2026 — real Desktop Extract here ZIP + source shortcut parity (pending CI)

**Accepted prior exact-head:** [CI #44905733445](https://github.com/codersachin99/windows-os/actions/runs/44905733445) at `d143ba3` completed SUCCESS for Explorer ZIP extraction: TypeScript, all unit/source/artwork/Contacts checks, Vite and full targeted + desktop/mobile Playwright. Original-paired visual capture job skipped. The previous failed TS2345 run is historical and was corrected without weakening tests.

**Next frozen gap:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776` `src/modules/system/main.js` `DesktopItemMenu` puts `extract-here` **after Pin and before Send to Desktop**, with `this.extractHere(this.shortcut.path)` for one archive-backed item. Explorer had now been fixed but Desktop still omitted the command.

**Implemented:** `packages/ui/src/sourceDesktopItemMenu.ts` now preserves this action and source order, showing enabled **Extract here** only for a genuine mounted Guest ZIP and disabled for other original archive formats. Source `.lnk` shortcut metadata can specify a ZIP target; `DesktopIcons.tsx` resolves `targetPath` to the target's actual parent folder (e.g., Documents) and delegates to the existing `extractSourceGuestZip`/one-transaction VFS service; direct Desktop ZIP extraction selects created Desktop items. No host paths, second algorithm, overwrite or fake completion. Added `sourceDesktopItemMenu.test.ts` source order/link/format gates and `tests/e2e/source-desktop-extract-here.spec.ts` real ZIP bytes, text in Notepad, empty folder, rollback, non-ZIP/unsupported item gate and Explorer-created `.lnk` target in Documents. The focused Actions suite includes the new spec. [Source trace/limits](DESKTOP-EXTRACT-HERE-SOURCE.md).

**Next:** one deliberate `[run-ci]` commit at exact head to verify TypeScript, all unit tests, source/artwork/Contacts audit, Vite, targeted Desktop/Explorer and full Chromium desktop/mobile. Diagnose concrete CI failures, preserve test coverage; do not claim green until completed. Unported RAR/7z/TAR/GZ, original archive filename/overwrite prompts and original paired screenshots for 37 theme IDs are still open. Draft [PR #1](https://github.com/codersachin99/windows-os/pull/1) stays open. Leave `windows-os/main`, original frozen reference and releases untouched.

---

### 21 Nov 2026 — first Extract here CI TypeScript failure diagnosed

[CI #44905650895](https://github.com/codersachin99/windows-os/actions/runs/44905650895) on `33af1d1` stopped in **Verify TypeScript**, before units, audits, Vite and browser tests. Exact error: `sourceExtract.test.ts(75,34) TS2345`, inferred heterogeneous object union in malformed-ZIP fixtures permits optional `undefined` keys and is not assignable to `Record<string,string|Uint8Array>`. This is a **test fixture type annotation** issue, not a reason to disable tests. Correct it by declaring `const invalid:Record<string,string>[]` and request one new exact-head acceptance. All original source/security assertions remain. Visual paired source capture remains skipped.

## 21 November 2026 — Explorer real Extract here ZIP implementation (pending exact-head CI)

**Prior verified checkpoint:** [CI #44898625505](https://github.com/codersachin99/windows-os/actions/runs/44898625505) at `17bdd8c` completed SUCCESS (TypeScript, unit, audited source/artwork/Contacts, Vite and browser-and-contracts including full desktop/mobile Chromium); visual capture skipped. That run confirms Desktop Send to Compressed ZIP and does **not** include new extraction code.

**New source delta:** Frozen `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`, `src/modules/system/main.js` `ExplorerItemMenu` supports `extract-here` with `this.extractHere(this.data.path)` for one archive selection outside an archive view. React previously disabled the action. The new `sourceExtract.ts` now safely extracts real `.zip` bytes under the mounted Guest folder only, bounded by 32 MiB/2048 ZIP members/64 path components, rejecting traversal/host paths, case/entry collisions, malicious object-key segments, non-UTF-8 text transcoding, and ZIP over-expansion before writes. The new `VirtualFileStore.createTreeAtomic` stages nested folders/files before one persisted commit; quota errors and collision failures leave no partial output. Valid UTF-8 text files stay Notepad-readable with byte-equivalent contents; binary files stay binary. `sourceExplorerItemMenu.ts` enables only backed ZIP Extract here, `ExplorerApp.tsx` performs real extraction and selects first root.

**Regression coverage:** `sourceExtract.test.ts` tests nested/empty/binary/UTF-8 entries, ZIP compression roundtrip, collisions, traversal, unsupported/malformed archives and quota rollback; `sourceExplorerItemMenu.test.ts` tests ZIP-only availability. New `source-explorer-extract-here.spec.ts` covers desktop/mobile upload, context action, nested binary Download, unsupported RAR disabled and non-overwrite. Focused workflow now includes the new spec; full browser plus TypeScript/unit/source/artwork/Contacts/Vite remain required. [Detailed original/React source trace](EXPLORER-EXTRACT-HERE-SOURCE.md).

**Do not overclaim:** no local repo clone/test runtime in this ChatGPT container; new ZIP extraction code is **unverified until an exact-head opt-in CI** finishes. The original Desktop archive extraction, RAR/7z/tar/gz, source overwrite dialogs, all 37-theme paired screenshots and complete source functional parity remain open. Paired visual requires private original source token. Preserve branch `feat/0001-faithful-react-foundation`, draft [PR #1](https://github.com/codersachin99/windows-os/pull/1), unchanged `windows-os/main`, pinned legacy source and no release.

---

## 21 November 2026 — Desktop source Send to Compressed ZIP continuation

**Frozen:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. **Work branch:** `feat/0001-faithful-react-foundation`; draft PR #1; `main`, original and releases unchanged.

Pinned `src/modules/system/main.js` `DesktopItemMenu` exposes `Send to` for real file paths, with one genuine `Compressed (zipped) folder` child calling `compress(this.paths)`. React Desktop had the parent permanently disabled. This follow-up reuses the bounded atomic Guest archive service previously verified for Explorer, without opening host paths, introducing another ZIP algorithm or claiming extraction/Properties parity.

Changes: `sourceDesktopItemMenu.ts` gates actual Guest compression; `DesktopIcons.tsx` restores the single original child, theme-style popup, hover/ArrowRight/ArrowLeft/Escape, edge flip and selected ZIP state; unit source-menu predicates, existing Desktop menu E2E and new `source-desktop-send-to-compressed.spec.ts` desktop/mobile real ZIP bytes + multi-select/collision coverage; new suite in deliberate opt-in focused GitHub Actions. Full source proof and test contract: [migration/DESKTOP-SEND-TO-ZIP-SOURCE.md](DESKTOP-SEND-TO-ZIP-SOURCE.md).

**Verification:** code and tests are committed, but no local execution is claimed (the local runtime has no access to clone the GitHub repository). Exact-head `[run-ci]` is required before reporting the slice verified. Prior Explorer ZIP [#44889309855](https://github.com/codersachin99/windows-os/actions/runs/44889309855) succeeded on an older commit; Win2k Search [#44895908763](https://github.com/codersachin99/windows-os/actions/runs/44895908763) is also an earlier code snapshot. Check the new head's TypeScript, units, original/artwork audits, Vite build and targeted/full desktop/mobile Playwright. Do not remove tests on failure; diagnose logs. Original/React paired screenshot parity and all 37 themes remain open; private visual source token still needed. Keep draft PR and no product release.

---

## 21 November 2026 — actual frozen Explorer Send to Compressed (zipped) folder via Guest ZIP

**Frozen source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. **Target:** `feat/0001-faithful-react-foundation`, draft PR #1. Original and target main untouched; no merge/release.

**Prior verified exact-head CI:** [Classic RTL #44884377212](https://github.com/codersachin99/windows-os/actions/runs/44884377212) `e51dd3f` and [Classic disabled #44884540994](https://github.com/codersachin99/windows-os/actions/runs/44884540994) `92fbce3` **SUCCESS** TypeScript, units, source/artwork/Contacts audit, build, focused and full desktop/mobile Chromium, visual paired job skipped. Newer [Classic Computer/Bin #44887093277](https://github.com/codersachin99/windows-os/actions/runs/44887093277) at `e553cbb` had completed focused source browser checks and was running full browser at last check. None covers the ZIP commits below.

**Source functionality:** pinned `src/modules/system/main.js` ExplorerItemMenu `send-to` has actual `compressed-folder` **click handler `this.compress(this.paths)`**, followed by Desktop shortcut; target always disabled first child even for normal Guest Documents files. Corrected a real function parity gap rather than cosmetic styling.

**New code commits:**
- [`7fa7988`](https://github.com/codersachin99/windows-os/commit/7fa7988407ffbf08cecf257f658707c4e3a0a130) + [`32039a0`](https://github.com/codersachin99/windows-os/commit/32039a012a91be396126a21b2204086413859427): `packages/filesystem/src/sourceArchive.ts` source ZIP adapter using already-installed `fflate.zipSync`. Real Guest `VirtualFileStore.readBytes`, recursive files/folders (empty directories), stores archive in same mounted Guest parent via **create-only atomic `createFilesAtomic`** with case-insensitive collision-safe `Archive (2).zip`/file-stem naming, never overwrite, null-prototype member table for `__proto__` filenames. Rejects foreign/unmounted paths, deleted Bin entries, missing sources, traversal and selection outside same Guest folder. Explicit safe limits 32 MiB input, 2048 entries, depth 64; not claimed as original app limits.
- [`bf6a7f9`](https://github.com/codersachin99/windows-os/commit/bf6a7f99d467748807fd9f61870557acf52524d9): export bounded source archive API from filesystem engine.
- [`ec4921c`](https://github.com/codersachin99/windows-os/commit/ec4921cf173242def57c6a385f630bac6eee2baf): `sourceExplorerSendToMenu(canCreateDesktop,canCompressGuest=false)` retains frozen ordering, independent correct disabled predicates, unbacked root fallback disabled.
- [`d8ce0ae`](https://github.com/codersachin99/windows-os/commit/d8ce0ae3308a62f3c8f7b11fab5a19b0139e2a55): `ExplorerApp.tsx` safely enables real ZIP command for mounted Guest paths, performs compression via shared error-handling and selects resulting ZIP. Leaves extracted archive service and disabled Properties untouched.
- [`930de65`](https://github.com/codersachin99/windows-os/commit/930de65d785f14e80757a6c460f8e2546a6ba590): `sourceArchive.test.ts` **6 unit cases**: UTF-8/binary, nested/empty directories, multi-select and non-overwrite, invalid root/traversal, missing source and no partial ZIP.
- [`34720d8`](https://github.com/codersachin99/windows-os/commit/34720d8c5028a1295e3aa8f04a512f525701eac0) + [`89192cd`](https://github.com/codersachin99/windows-os/commit/89192cd5d7075231f9a8debab5c02a21df75aa41) + [`fb6c165`](https://github.com/codersachin99/windows-os/commit/fb6c1658bf3e973398a9dcc303f0ec0f6a1cd771) + [`77da174`](https://github.com/codersachin99/windows-os/commit/77da1746908c9fcfeff8d2b129590270a5c90094) + [`f8eac34`](https://github.com/codersachin99/windows-os/commit/f8eac34e3c2084c1b02b7b6c62c44319ce38f35e): update menu availability/unit, real Explorer item, keyboard focused first enabled child, Classic high contrast tests; virtual Computer root remains disabled.
- [`2ca24b7`](https://github.com/codersachin99/windows-os/commit/2ca24b728aba7b49b1bfe620c43d1babcbd5c001) + [`b15f6d4`](https://github.com/codersachin99/windows-os/commit/b15f6d46aec9f0580c1e2fc63f9f767bc9727eda): **2 browser cases × desktop/mobile** uploading Guest binary TXT, clicking real Send to ZIP, downloading actual .zip with existing Download command and inspecting unzipped bytes; multi-select/collision repeat, preserves both archives.
- [`128a474`](https://github.com/codersachin99/windows-os/commit/128a474f6ef9bdba376a026595b86e4a8dcaf136): focused opt-in Playwright CI includes ZIP.
- [`df4cea7`](https://github.com/codersachin99/windows-os/commit/df4cea784fb89f11f6436cbfacb5df8def5c0efd): `migration/EXPLORER-SEND-TO-ZIP-SOURCE.md` exact source hook, Guest-only behavior, explicit limits/deltas.
- [`ab1d87c`](https://github.com/codersachin99/windows-os/commit/ab1d87c2233788b4f5e9cb80c4443225d24c8352): source main/computer tracker stays **in-progress**, not falsely complete.

**Required next action:** this checkpoint commit requests **one exact-head opt-in `[run-ci]`**. Verify TS (including `Zippable` type), all units incl ZIP, original source/artwork/Contacts audit, build, focused Playwright (ZIP, changed menu focus, Classic disabled) **and full desktop/mobile browser**. Diagnose all genuine CI failures; do not skip or remove checks. No local test execution claimed. Visual source-vs-React paired screenshots still skipped pending private `LEGACY_SOURCE_READ_TOKEN`. Original React source screenshot/functional parity and remaining 37 theme matrix not complete. Keep draft PR, original and main untouched.

**Next:** after ZIP CI, continue highest-priority original themes/context menu/Desktop/Start/Computer/Bin safe backing functionality; close outstanding source screenshot gap before merge or release.

---

## 21 November 2026 — source Classic Basic2/3/4 Computer and Bin disabled RTL menu emboss

**Immutable original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation`, draft PR #1; target `main` and pinned original unchanged, no merge or release.

**Last fully verified exact-head CI:** [#44880039033](https://github.com/codersachin99/windows-os/actions/runs/44880039033) `5bd0109` **SUCCESS** with TypeScript, full unit and source/theme/Contacts audits, Vite build, focused and full desktop/mobile browser. **In-flight Classic validations:** [#44884377212](https://github.com/codersachin99/windows-os/actions/runs/44884377212) at `e51dd3f` and [#44884540994](https://github.com/codersachin99/windows-os/actions/runs/44884540994) at `92fbce3` both passed TypeScript, units, source/artwork/Contacts audits, Vite, Chromium install and focused source-shell Playwright; their full desktop/mobile browser step was in progress at latest check. These older jobs **do not** cover the new Computer/Bin menu correction. Check their final statuses separately.

**New source gap:** locked `src/modules/themes/theme-win7-classic-scss.js` `.win7-classic .winui-menu [role=menuitem][aria-disabled]` **requires** full-opacity grey `#7b7b7b` plus LTR `text-shadow:1px 1px var(--border-color--contrast)` / RTL `text-shadow:-1px 1px var(--border-color--contrast)`. The preceding slice applied this to actual Desktop/taskbar popup buttons. Computer/Bin Explorer menus already had full-opacity disabled grey but **no source directional embossed shadow**, including nested Send To. The original source styles this at the shared menu level; all three Classic variants Basic2/3/4 inherit it.

**Committed follow-up:**
- [`33e65ac`](https://github.com/codersachin99/windows-os/commit/33e65ac5496ed611304bcb349a2de0947a1c6690): `packages/apps/explorer/src/sourceExplorerContextTheme.css` maps source LTR and RTL embossed disabled label text to Basic2/3/4 actual Computer/Bin root/item/nested menus. Native source-disabled actions stay disabled, other themes untouched.
- [`72c8a17`](https://github.com/codersachin99/windows-os/commit/72c8a1774cbedfe60408dd7d06500ae34f4d34de) and [`3e372b7`](https://github.com/codersachin99/windows-os/commit/3e372b7d6b545ddf5d4a7cdac2723a2239b7fbcf): `tests/e2e/source-classic-explorer-disabled-rtl.spec.ts` **6 real Chromium scenarios × desktop/mobile** across Classic2/3/4 × LTR/RTL. Validate empty Bin disabled Empty/Upload/Properties, Computer background Properties, uploaded actual Guest Documents file item Properties and compressed Send To child disabled text. Assert native disabled state, opacity 1, grey color and signed computed shadow; active Desktop send-to command remains enabled, no dummy action invented.
- [`7feb80f`](https://github.com/codersachin99/windows-os/commit/7feb80f07c95eaf49659294d2dd2984f42c94a2d): focused opt-in Playwright workflow includes new suite alongside existing 12 Classic Desktop/taskbar tests.
- [`3af45fd`](https://github.com/codersachin99/windows-os/commit/3af45fde57a46e2b93aef986ccfb6e2e6659d288): pinned source audit `migration/WIN7-CLASSIC-RTL-CONTEXT-SOURCE.md` updated.
- [`9a2bfe2`](https://github.com/codersachin99/windows-os/commit/9a2bfe285e79d2696c3b93c714877d41f1cbfb4f): original Classic theme, Computer and Bin tracker entries remain **in-progress** with source evidence.

**Verification:** this handoff checkpoint requests fresh exact-head `[run-ci]` validating TypeScript, units, locked source/artwork/Contacts audits, build and **all focused + complete desktop/mobile Chromium**, including both the older Classic 12 and new Explorer/Bin 6 scenarios. Inspect failure logs and fix actual source-compatibility issues; no removal of tests. Paired original-vs-target pixel screenshot acceptance still awaits `LEGACY_SOURCE_READ_TOKEN`. No merging, releasing, or implying all source themes migrated.

**Next:** confirm both older runs and this new exact-head run; then continue highest-priority original themes, context menus, Desktop, Start, Computer and Bin source interactions. Keep docs and PR in sync.

---

## 21 November 2026 — Classic Basic2–4 disabled popup source contrast follow-up

**Frozen original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. **Target:** `feat/0001-faithful-react-foundation`, draft PR #1; original and `main` unchanged.

**Last fully verified CI:** [#44880039033](https://github.com/codersachin99/windows-os/actions/runs/44880039033) at `5bd0109` **SUCCESS** (TS, unit, immutable source/artwork/Contacts audit, build, focused and full desktop/mobile Playwright). **Prior Classic RTL CI [#44884377212](https://github.com/codersachin99/windows-os/actions/runs/44884377212) at `e51dd3f`** had completed TypeScript, unit, original source/artwork/Contacts audit, build and Chromium install and was running focused browser regressions at latest check. Inspect terminal result, fix any failures; it predates the two follow-up commits below.

**Additional source gap confirmed:** original `theme-win7-classic-scss.js` `.win7-classic .winui-menu [role=menuitem][aria-disabled]` keeps **opacity:1**, `var(--text-color--disabled,#7b7b7b)` and direction-aware embossed text shadow `1px 1px` LTR / `-1px 1px` RTL in `var(--border-color--contrast,#fff)`. React generic `.windows-taskbar__context button:disabled` has **opacity .52** and no emboss. This incorrectly fades the High Contrast Black/White and Classic source popup actions. The source expects unavailable controls greyed, not silently enabled.

**New commits:**
- [`80775b3`](https://github.com/codersachin99/windows-os/commit/80775b346097d88a56e678683004a9427b09001b): `packages/ui/src/sourceWin7ClassicContrast.css` restores source full-opacity, disabled grey and LTR/RTL embossed text shadow for real Basic2/3/4 Desktop/taskbar popup `button:disabled` only. Leaves source View/Task Manager actions, all other themes and paint untouched.
- [`a7c9907`](https://github.com/codersachin99/windows-os/commit/a7c9907f001ca9c8787233bacc520e4d03299814): existing Classic `tests/e2e/source-win7-classic-rtl-context-themes.spec.ts` now asserts disabled `Toolbars` is still disabled, computed `opacity=1`, `rgb(123,123,123)` text, directionally mirrored computed shadow **on each Basic2/3/4 taskbar in both LTR and RTL**, and still launches Task Manager; total 12 source browser cases × desktop/mobile retained.
- [`d353bc5`](https://github.com/codersachin99/windows-os/commit/d353bc513fbefaf99b89bdade1bfe70aa673cfd2): source audit `migration/WIN7-CLASSIC-RTL-CONTEXT-SOURCE.md` updated with literal source disabled style and expected role mapping.

**Verification:** trigger fresh exact-head `[run-ci]` once checkpoint commits; verify full TS, unit, audits, Vite, focused + full desktop/mobile browser, without suppressing failing tests. Prior Classic RTL run only validates older commit. Paired original-source screenshots not checked due read-only `LEGACY_SOURCE_READ_TOKEN` requirement. Keep all classic source modules in progress, PR draft, `main` intact, no release.

---

## 21 November 2026 — original Basic2–4 Win7 Classic RTL context bevel

**Immutable original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target branch:** `feat/0001-faithful-react-foundation`, draft PR #1. Do not touch frozen original or target `main`, do not merge/release before full source parity.

**Last verified CI:** [#44880039033](https://github.com/codersachin99/windows-os/actions/runs/44880039033) at `5bd0109` **SUCCESS**: TypeScript, unit, immutable source/theme/Contacts audits, Vite production build, focused source-shell and full desktop/mobile Playwright browser regressions. Paired source-vs-target visual capture **skipped**.

**New focused source discrepancy:** pinned `src/modules/themes/theme-win7-classic-scss.js` `[dir=rtl] .win7-classic .winui-menu` mirrors all three inset shadow offsets compared to `[dir=ltr]`: `inset 1px -1px var(--border-color)`, `inset -1px 1px var(--border-color--contrast)`, `inset 2px -2px var(--text-color--disabled)`. This belongs to `basic-2` Classic, `basic-3` High Contrast Black, `basic-4` High Contrast White (not Aero Basic1). React Computer/Bin already ported that CSS in RTL; real Classic Desktop/taskbar context panels had original LTR bevel even in RTL.

**Actual branch commits:**
- [`f2cefce`](https://github.com/codersachin99/windows-os/commit/f2cefced6c25b4413b8c53bd7f6e9c3db7f8bb0f): `packages/ui/src/sourceWin7ClassicContrast.css` adds exact RTL-only mirrored classic 3D bevel on Desktop and taskbar context popup for three named source themes. Leaves LTR rules, real action handlers and contrast palettes intact.
- [`e33a030`](https://github.com/codersachin99/windows-os/commit/e33a03042d3078470197fa1ef8e5ec153761902a) + [`e564207`](https://github.com/codersachin99/windows-os/commit/e5642074e0f1871f1f12fc82342a7e4faf95d5f2): `tests/e2e/source-win7-classic-rtl-context-themes.spec.ts`: **12 genuine browser scenarios × desktop/mobile**. For each Basic2,3,4: actual Desktop menu LTR/RTL (computed source classic surface/contrast/first 3D bevel/hover, View action, Computer item Open); RTL taskbar background menu and real Task Manager; separate Computer and Bin background with detached View child (8 source radio modes). CSSOM box-shadow checked directly without text-matching stylesheet declarations, 24 total project runs.
- [`189a290`](https://github.com/codersachin99/windows-os/commit/189a290aad2283c4361563759efa2d992ef6de31): add new spec to opt-in focused browser Actions, preserving `[run-ci]` condition and separate `[capture-visual]` controls.
- [`8bcbe01`](https://github.com/codersachin99/windows-os/commit/8bcbe01cec265ed939abb241ee298c1d1676de35): `migration/WIN7-CLASSIC-RTL-CONTEXT-SOURCE.md` exact original source and bounded evidence/limits.
- [`c687aa4`](https://github.com/codersachin99/windows-os/commit/c687aa423c917b7a54c2b7478a5612f3be13d73f): theme-win7-classic-scss.js/main.js/taskbar-base.js tracker entries remain **in-progress**, not fully migrated.

**Verification request:** this checkpoint commit opts into ONE exact-head `[run-ci]`. Confirm TypeScript, unit tests, original source/artwork/Contacts checks, Vite build, focused and full desktop/mobile Chromium; if any failure, inspect exact logs and fix the real issue, never remove source tests or label incomplete parity complete. Source-paired pixel screenshot job still requires private source read access `LEGACY_SOURCE_READ_TOKEN`, not run automatically.

**Next:** after CI, continue source themes, Desktop, context menus, Start, Computer and Bin acceptance. Source visual and functional parity across all 37 themes remains outstanding; no main merge/release.

---

## 21 November 2026 — correct 18 identical RTL browser assertion failures

**Frozen original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation`, draft PR #1. `main` and original untouched.

**Exact preceding CI:** [#44878445135](https://github.com/codersachin99/windows-os/actions/runs/44878445135) at `2c7585c` **FAILURE** in focused Chromium browser tests: **716 passed / 18 failed / 2 skipped**. The missing Linux Rollup native dependency was **recovered successfully** and TypeScript, units, locked source/artwork/Contacts audits and Vite build all **PASSED**. Full E2E was skipped because focused browser step failed. Each failure came from new `source-win7-vista-explorer-rtl.spec.ts` line 34: in both desktop and mobile all nine cases expected computed `::before.left="auto"`, Chromium correctly returned the USED numeric coordinate `"174px"` for an absolutely positioned pseudo-element declaring `left:auto;right:27px`. RTL menu surface, border, shadow, gutter content/width assertions had passed before this erroneous test line. This is a CSSOM assertion mistake, **not a proven app style failure**.

**Correction on branch:**
- [`578df57`](https://github.com/codersachin99/windows-os/commit/578df572baba5ca64c37c14491567d5c0fae366c): assert computed **RTL right offset exactly 27px**, resolved left greater than right, and geometry `left+right+2px≈clientWidth` within 2px rounding; reciprocal **LTR left=27px**, used right, geometry and no negative RTL shadow. Preserves 9 × desktop/mobile cases and all RTL original CSS; no assertion or tests removed.
- [`d0abb02`](https://github.com/codersachin99/windows-os/commit/d0abb02ba31342ad192f6206a5248bff0fc52f7b): `migration/WIN7-VISTA-EXPLORER-RTL-SOURCE.md` root cause, exact CI counts and evidence.

**Current acceptance:** run ONE fresh exact-head `[run-ci]` including TypeScript, units, audits, build, focused and full desktop/mobile Chromium; verify actual outcome before marking RTL task complete. Prior taskbar keyboard [#44877278653](https://github.com/codersachin99/windows-os/actions/runs/44877278653) had passed its focused browser step but the full browser step was still in progress as of latest check. Inspect its terminal status too. Original screenshot pairing still requires private locked-source `LEGACY_SOURCE_READ_TOKEN`. No main merge or release.

---

## 21 November 2026 — fix exact-head CI Rollup Linux native optional package install

**Frozen source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation`, draft PR #1, `main` untouched. No change to reference source.

**Observed exact-head failure:** [CI #44878279959](https://github.com/codersachin99/windows-os/actions/runs/44878279959) at `0bb8e5e` **FAILED** during `npm test` after TypeScript **PASSED**. Runner Node 22.23.5/npm 10.9.9, `npm install` reported 119 packages added, then Vitest's transitive Rollup native loader aborted: **`Cannot find module @rollup/rollup-linux-x64-gnu`** (known npm optional-dependency omission). Source/theme audits, Vite build, focused RTL/taskbar browser tests and full browser tests were **SKIPPED** due to this installation issue. Do **not** interpret as a failed RTL or taskbar assertion or disable suites to force green.

**Minimal CI-only changes:**
- [`11e3937`](https://github.com/codersachin99/windows-os/commit/11e3937484ba2a967a3b3e716b9f4f7a09441e80): `.github/workflows/react-checks.yml` installs `npm install --include=optional`; checks real native `@rollup/rollup-linux-x64-gnu`. Only if missing, reads the actually installed Rollup package version, explicitly installs exact matching native package with `--no-save --no-package-lock`, and asserts load success. Same guarded setup in opt-in visual-capture job. No lockfile or package/version-range change, no source or app change, `[run-ci]` trigger policy unchanged.
- [`a9ff01c`](https://github.com/codersachin99/windows-os/commit/a9ff01cd0c45f061823ce6b70850a7c25b684286): `migration/CI-ROLLUP-OPTIONAL-NATIVE.md` exact failure, fix and acceptance.

**Other running work:** previous taskbar keyboard [CI #44877278653](https://github.com/codersachin99/windows-os/actions/runs/44877278653) at `0b5fd0f` had progressed to full desktop/mobile browser after **success** on targeted source-shell browser test, but its overall result was not yet confirmed at last poll. Keep this previous SHA's result distinct from the failed new RTL SHA and the forthcoming repaired run.

**Exact-head recheck:** this checkpoint commit requests one `[run-ci]` to verify repaired npm setup + TypeScript, full units, immutable source and artwork audits, production Vite build, **taskbar keyboard** and **Win7/Vista RTL Computer/Bin** focused Chromium cases and the full desktop/mobile E2E suite. New code is NOT verified until the whole exact-head job is green. Diagnose true assertion failures in CI logs and fix source-backed causes. Paired original-React pixel comparison still requires read-only token `LEGACY_SOURCE_READ_TOKEN`; complete migration not reached. Do not merge PR, touch original or `main`, or publish release.

---

## 21 November 2026 — original Win7/Vista RTL Explorer & Bin context mirror

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation`, draft [PR #1](https://github.com/codersachin99/windows-os/pull/1), no changes to original or target main.

**Earlier verified CI:** [Win7/Aero/Basic1 #44870350897](https://github.com/codersachin99/windows-os/actions/runs/44870350897) on `46883af` **SUCCESS** with TypeScript, unit, original source/theme/Contacts audit, Vite production build and focused/full desktop/mobile Playwright; source-paired screenshot visual job **skipped**.
**Prior taskbar keyboard CI:** [#44877278653](https://github.com/codersachin99/windows-os/actions/runs/44877278653) at `0b5fd0f` was **IN PROGRESS (source-shell targeted browser gate)** at last poll. This previous CI does not cover current RTL changes. Inspect its final status, and fix any taskbar focus regressions without weakening tests.

**Source comparison:** frozen `src/modules/themes/theme-win7-scss.js` and `theme-winvista-scss.js` have `[dir=rtl] .winui-menu` with negative horizontal drop shadow, opposite/right 2px icon gutter + bevel, and right-aligned command padding. React Explorer's `sourceExplorerContextTheme.css` mirrored Win8 and Basic2/3/4 but **not** Win7/Aero1–4/Basic1/Vista. Source Desktop/Start menu had already ported the equivalent RTL geometry.

**New branch commits:**
- [`8d0f8d6`](https://github.com/codersachin99/windows-os/commit/8d0f8d64dd7eab07aeaba51fc6a54558d93c7d4): original RTL-only -4px shadow, 2px gutter at `right:27px` with opposite inset shadow, 34px right command padding, right alignment for source Win7/Vista/Aero/Basic1. Applies to Computer and Bin roots plus independently rendered View/New/Send-To submenus. LTR/other themes and functionality untouched.
- [`0ffcb88`](https://github.com/codersachin99/windows-os/commit/0ffcb88a5db2a4eb63a9c3ae07b832740b21e839) + [`10e62d7`](https://github.com/codersachin99/windows-os/commit/10e62d7d469d1a2da613f37ab9631d2d99e1e62d): new `tests/e2e/source-win7-vista-explorer-rtl.spec.ts` 9 real browser tests × desktop/mobile, for Win7/Aero2/Basic1/Vista Computer and Bin menus and detached View child; true RTL root, computed paint/gutter/shadow/padding/alignment, live View actions, Escape focus return, and RTL→LTR reversibility. CSSOM shadow regex accommodates serialization order.
- [`7809255`](https://github.com/codersachin99/windows-os/commit/7809255f3343688ce529702db8189fb44d8922aa): targeted opt-in Actions suite includes new RTL test.
- [`78cebc5`](https://github.com/codersachin99/windows-os/commit/78cebc5f8014e300bb1203bc7539611fde40eb78): `migration/WIN7-VISTA-EXPLORER-RTL-SOURCE.md` original source values, limited scope and acceptance.
- [`fcbc504`](https://github.com/codersachin99/windows-os/commit/fcbc50431b0448fefe9de7a883c795bd6e6cec13): tracker entries for `theme-win7-scss.js`, `theme-winvista-scss.js`, `computer.js`, `bin.js` record bounded evidence, remain **in-progress**.

**Verification request:** commit this checkpoint with `[run-ci]` to launch fresh exact-head TypeScript/unit/source audits, Vite, focused and full Chromium desktop/mobile. New RTL test and taskbar keyboard slice are **NOT accepted** until exact-head CI success. Run/failure artifacts should be inspected; never skip or remove failing tests for a green badge. Original paired screenshot visual acceptance still awaits `LEGACY_SOURCE_READ_TOKEN`, and full 37 source themes/apps remain incomplete. Keep PR draft, `main` intact, no release.

**Next:** inspect previous taskbar run and new RTL run; fix concrete failures; then continue source-backed Desktop, Start, Computer, Bin shell parity and source theme variants without inventing design.

---

## 21 November 2026 — source taskbar context keyboard entry and exact focus restoration

**Frozen original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation`, draft PR #1. Original source and target `main` remain untouched.
**Last verified exact-head CI:** [#44870350897](https://github.com/codersachin99/windows-os/actions/runs/44870350897), `46883af` **SUCCESS** TypeScript, unit, original source/artwork/Contacts audit, Vite build, focused and full desktop/mobile Chromium. Visual source-vs-target capture **skipped**.

**Frozen source relationship:** `src/modules/shell/taskbar-base.js` `taskbar-menu`, `base-menu` and `taskbar__main-popup` open from real taskbar background and app-item context events. Target had source action ordering/disabled Toolbars/arrangement and `sourceMenuArrowFocus` already, but a genuine right-click did not put focus on any root action. Escape removed the menu without restoring the actual taskbar button/background.

**Implemented commits:**
- [`cc90263`](https://github.com/codersachin99/windows-os/commit/cc9026338be8446cf4c290dda69562a3bd7d7fd2): `SourceTaskbarMenu.tsx` focuses first enabled direct menuitem once on anchor-open, keeps existing ArrowUp/Down roving, restores actual connected trigger on Escape after dismiss (taskbar fallback), does not steal focus on action/clickout.
- [`2d7e695`](https://github.com/codersachin99/windows-os/commit/2d7e695ee8ceed755e75c44bc2e9d708c95452ae): `DesktopShell.tsx` records real right-click background footer/pinned launcher/running group origins, adds taskbar footer `tabIndex={-1}` (not Tab order), passes origin to popup.
- [`afd5a81`](https://github.com/codersachin99/windows-os/commit/afd5a8183aabc4b2fe479c02b6441f63adce35ec): 7 true Playwright contexts × desktop/mobile across Win7/XP/Win11dark/Basic1 background; Win7/XP pin; actual unpinned Win7 running Computer. Confirms first enabled focus, skip disabled commands, ArrowDown/Up wrap, exact focus return without launching/closing.
- [`3236e9c`](https://github.com/codersachin99/windows-os/commit/3236e9c96c9e1b5f13ad4c15566884a484730bec): use actual Win7/XP/Basic1 running lane, not the Start orb, to invoke the background context; Win11 dark empty lane requires left footer edge.
- [`5c4f060`](https://github.com/codersachin99/windows-os/commit/5c4f0603ea9efd2438477b5f1cb17482409bb5c7): include new suite in focused **opt-in** GitHub Actions.
- [`196e805`](https://github.com/codersachin99/windows-os/commit/196e805f9e1c96b8d1330c96eca031f893e9d680): `migration/TASKBAR-CONTEXT-KEYBOARD-SOURCE.md` locked-source audit, interaction scope and limits.
- [`53cdcd0`](https://github.com/codersachin99/windows-os/commit/53cdcd0b654c09504de8b370311d0a56007b577d): `migration/module-tracker.json` tracks bounded source `src/modules/shell/taskbar-base.js` menu coverage as **in-progress**.

**Verification:** this handoff commit requests one new exact-head `[run-ci]`. The previous green run predates this change. Inspect focused browser run and full mobile+desktop; diagnose log/trace if any failures. Do not claim this slice is accepted before run **SUCCESS**. Paired original screenshot evidence requires configured `LEGACY_SOURCE_READ_TOKEN`, is still pending. Do not merge draft PR or publish releases based on bounded menu focus alone.

**Next:** after current CI, continue Desktop/Start/Computer/Bin full original behavior and all theme families, with pixel-perfect paired parity as separate acceptance.

---

## 21 November 2026 — original Win7/Aero/Basic1 Desktop + taskbar context source parity

**Immutable reference:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target branch:** `feat/0001-faithful-react-foundation`, draft [PR #1](https://github.com/codersachin99/windows-os/pull/1). Do not merge `main` or modify original source.
**Last verified CI:** [Vista run #44836963645](https://github.com/codersachin99/windows-os/actions/runs/44836963645) **SUCCESS** on `ed6012a`; TypeScript, unit, source/artwork/Contacts audits, production Vite build, focused and full desktop/mobile Chromium. Screenshot pairing SKIPPED.

**Next verified source defect:** frozen `src/modules/themes/theme-win7-scss.js` `.win7 .winui-menu` uses pale `#f1f1f1`, `#979797` border, inset 2px bevel `#f5f5f5`, 2px icon/check gutter and pale-blue gradient hover with `#aaddfa` border. The React Computer/Bin menus already use this paint, but original Win7, Aero1–4 and Basic1 **Desktop/taskbar context menus** still used the port's generic blue-gradient fallback.

**Commits:**
- [`82062b4`](https://github.com/codersachin99/windows-os/commit/82062b4a67dc249a4f00a0701e69c237c0c457b3): source Win7 WinUI menu skin mapped to actual Desktop/taskbar context popups for `win7`, `aero-1`, `aero-2`, `aero-3`, `aero-4`, `basic-1`, with RTL shadow/gutter. Preserves source actions, taskbar behavior and source classic Basic2–4.
- [`4d61e93`](https://github.com/codersachin99/windows-os/commit/4d61e93972a371d24739431a1d9f97a041d55007): 15 Playwright cases × desktop/mobile, for six theme Desktop background/Computer Open, taskbar Task Manager popup, plus Aero2/Aero4/Basic1 Explorer View child, asserting painted computed source colors, bevel/gutter/hover.
- [`771d777`](https://github.com/codersachin99/windows-os/commit/771d7777f7f46c1f76750cb3074c957a2e81a025): remove overly broad Basic1 CSS rule that applied original `.taskbar__tray .taskbar-popup` border/shadow override to all taskbar context menus; tray-popup-specific port is still pending. Keep Basic1 taskbar height, shell paint and window chrome.
- [`834308a`](https://github.com/codersachin99/windows-os/commit/834308a36271d44e48deda327f5884835e31368e): include new spec in opt-in focused Playwright gate, not always-on GitHub Actions.
- [`05bcc0f`](https://github.com/codersachin99/windows-os/commit/05bcc0fdb3f571cc202abce86230eec964a7d737): `migration/WIN7-AERO-DESKTOP-TASKBAR-MENUS-SOURCE.md` pinned source comparison, code scope and known limits.
- [`b786cd7`](https://github.com/codersachin99/windows-os/commit/b786cd7655b706291d0dbf4ac766c1fd6b56b674): `theme-win7-scss.js` and `main.js` tracker evidence remains **in progress**, not complete.

**Verification:** request one exact-head opt-in `[run-ci]` with this checkpoint. **New Win7/Aero/Basic1 browser tests and CSS are not verified until that run finishes.** Inspect all focused, full browser and CSS outcomes without disabling tests. Source paired screenshots still require approved pinned private legacy checkout (`LEGACY_SOURCE_READ_TOKEN`), so no source-to-React pixel parity claim and no release.

**Next priority:** resolve CI failures, then continue original Desktop/Start/Computer/Bin and all themes according to pinned source, not new designs. Preserve the 37 source theme IDs, including login-only and high-contrast pending scopes; do not silently promote anything to pixel-perfect.

---

## 21 November 2026 — Vista Desktop/taskbar/Computer/Bin source menu parity slice

**Pinned source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Branch:** `feat/0001-faithful-react-foundation`; draft PR #1 unmerged. Original source/`main` intact.

**Previous CI now confirmed GREEN:** [#44828332062](https://github.com/codersachin99/windows-os/actions/runs/44828332062) exact head `5112f358`: TypeScript, unit, original asset/source/Contacts audits, Vite, targeted and full desktop/mobile Chromium **SUCCESS**; source-paired visual capture **SKIPPED**.

**Source check:** `src/modules/themes/theme-winvista-scss.js` `.winvista .winui-menu` has exact Win7/Vista pale `#f1f1f1` surface, `#979797` border, directional black shadow + `inset 0 0 0 2px #f5f5f5`, painted 2px icon/check gutter, `#aaddfa` hover border and three-stop white/pale-blue gradient. RTL reverses shadow/gutter. The React Start menu had already ported Vista shared recents/power and right-click palette, but **Desktop/taskbar/Explorer/Bin context menus still used fallback paint**, and the theme catalog incorrectly reported Vista `pending`.

**Branch changes:**
- [`f5d8e53`](https://github.com/codersachin99/windows-os/commit/f5d8e53b66166ac80c0dd18e7dc16bbf0679e23a): `sourceThemeShellStatus("winvista")="partial"`, reflecting actual partial source-backed shell; 26 partial instead of 25. Original Vista screen mapping unchanged and login renderer remains honestly labeled `win7-fallback`, not a fake complete Vista login.
- [`67dd4d1`](https://github.com/codersachin99/windows-os/commit/67dd4d180617a38795f52dc0ecf0275730865886): unit assertion for Vista shell scope.
- [`623ec1a`](https://github.com/codersachin99/windows-os/commit/623ec1a5862b9bc8b534e69ebcc83a89a869b6ce): browser catalog asserts Vista source login mapping, documented Win7 fallback, partial status.
- [`1c5548d`](https://github.com/codersachin99/windows-os/commit/1c5548d79c1e2fd9b04151801c2f07643116c3d2): include Vista in original Win7-family Explorer context base/child selectors, preserving all commands.
- [`c6f9303`](https://github.com/codersachin99/windows-os/commit/c6f9303ee12b4776c9f948e89c74daf2ead6f452): original Vista WinUI gutter, bevel, shadow, hover and RTL for real Desktop/taskbar context.
- [`ae536c1`](https://github.com/codersachin99/windows-os/commit/ae536c186d1d814bc41ffa2bf3ea810d15cb3afc), [`d44ccfe`](https://github.com/codersachin99/windows-os/commit/d44ccfe27427fb92f0e161a816c9893a6e194ad0): three real Playwright browser cases × desktop/mobile covering source paint, gutter, hover and working Desktop Computer, taskbar Task Manager, Computer and Bin context View nested menu.
- [`2825d60`](https://github.com/codersachin99/windows-os/commit/2825d6024d891602bacd82b4b2517805a62d0a28): opt-in focused Actions includes new Vista suite.
- [`5e4606e`](https://github.com/codersachin99/windows-os/commit/5e4606ec425b6a195244a41e5d6e6376eacf95c6): `migration/VISTA-CONTEXT-MENU-SOURCE.md` source proof and acceptance constraints.
- [`3d8c748`](https://github.com/codersachin99/windows-os/commit/3d8c74886b601ada30331dc9df78430adc32a654): source module tracker updated, remains **in-progress**, not complete.

**Verification:** this handoff checkpoint requests ONE exact-head opt-in `[run-ci]`. Above Vista code/tests are **not verified** by prior `5112f35` green CI. Inspect any failures and fix source-backed CSS/test issues; do not skip tests. Source-and-target matched screenshots remain unavailable without a controlled pinned private source checkout and configured `LEGACY_SOURCE_READ_TOKEN`. Main untouched, PR draft, no release until accepted.

**Next:** confirm new CI, then original Desktop/Start/Computer/Bin visual/interaction parity. Preserve the other original themes, including macOS/ChromeOS/Ubuntu/Kubuntu/Oxygen/WinW/WinLS/WinLP/Onebit, as pending rather than inventing skins.

---

## 21 November 2026 — correct source Computer root Send to Desktop test fixture; rerun CI

**Immutable original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation` / draft PR #1, `main` untouched.

**Actual CI outcomes:**
- [Desktop/Bin context #44805818122](https://github.com/codersachin99/windows-os/actions/runs/44805818122) at `7c194be`: **SUCCESS** with full TypeScript/units/audits/Vite and both focused/full desktop/mobile Chromium suites.
- [Computer/Bin Explorer context #44807318274](https://github.com/codersachin99/windows-os/actions/runs/44807318274) at `8f81fe0`: **FAILURE**, focused 662 passed / 2 failed / 2 skipped; full suite skipped. Both failures are the SAME new `Computer file context focuses Open, opens Send to child, and Escape focuses exact row` test at line 93 on desktop and mobile. TypeScript, unit, source/artwork audits, Contacts, Vite and browser installation PASSED.

**Root cause:** test uploaded `Keyboard Context Note.txt` in virtual Computer `/` before trying the source `Send to → Desktop (create shortcut)` submenu. Actual DOM correctly disabled this action. The existing `sourceExplorerSendToMenu` guard requires a real `/EXTERNAL/computer/...` live Guest path; virtual `/` cannot produce supported Guest desktop shortcuts. This is a TEST FIXTURE mistake, not a reason to bypass path permissions.

**Changes on branch:**
- [`60a4da7`](https://github.com/codersachin99/windows-os/commit/60a4da70e2909a999d03be1fa0e23dfd35802c6a): navigate the source Explorer Documents folder before importing the positive keyboard test text file; confirms real Guest path (same setup as existing `source-explorer-item-menu.spec.ts`).
- [`c22688a`](https://github.com/codersachin99/windows-os/commit/c22688afb042745df93e930c2f93f2b3893d9b36): add explicit virtual Computer root NEGATIVE browser regression: both child commands disabled, focus stays on Send to row, Escape restores origin; desktop/mobile.
- [`a54d2de`](https://github.com/codersachin99/windows-os/commit/a54d2de1265c150ccaaaa3029dbd766071fe7ee7): root cause, source safety boundary and exact CI numbers documented in `migration/EXPLORER-BIN-CONTEXT-KEYBOARD-SOURCE.md`.

**Verification request:** commit this handoff with `[run-ci]` to re-run the fixed targeted gate and full browser checks on the latest exact head. **Do not claim green** until run completes. No production Explorer code change in this correction. No code skipped, weakened, made permissive or fake filesystem service added. Original source and target `main` untouched, PR remains draft and releases remain blocked by paired source/candidate screenshots and unported modules.

**Next:** inspect exact-head focused/full browser CI for any additional failures, fix root causes, continue source-backed Desktop/Start/Computer/Bin functionality and visual parity only once grounded. The source-paired visual job still requires the private original checkout token `LEGACY_SOURCE_READ_TOKEN`.

---

## 21 November 2026 — Computer and Recycle Bin Explorer context focus integration

**Original lock:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Branch:** `feat/0001-faithful-react-foundation`; draft PR #1 unmerged.
No original/`main` modifications or product release.

**Prior verification:** [#44794377379](https://github.com/codersachin99/windows-os/actions/runs/44794377379) **SUCCESS** at `d157ca5`, validating Start popup focus, TypeScript/unit, all source/artwork audits, Vite and focused/full desktop/mobile Chromium. The following Desktop/Bin context run [#44805818122](https://github.com/codersachin99/windows-os/actions/runs/44805818122) was still **in progress** at `7c194be` during this slice (non-browser gates passed, focused browser running); do NOT infer its result or this new slice's result from that run.

**Next concrete menu defect:** Computer and Bin `ExplorerApp.tsx` root/item `[data-test-explorer-context]` menus already have the shared `sourceMenuArrowFocus` handler and real source View/New/Send to children, but right-click did not focus the first action, so arrow navigation was unreachable; Escape dismissed without restoring the original file row or folder surface.

**Source-backed commits:**
- [`ecec0b8`](https://github.com/codersachin99/windows-os/commit/ecec0b8909abd88840d2d8b9abb36dac3acfccfe): add real item/background focus anchor; make `explorer-content` programmatically focusable but out of Tab sequence; focus first enabled direct menuitem only on root context open; return focus on Escape, fallback to current Explorer content. Preserve existing directional child menus, source item actions, styles, clipboard and trash operations.
- [`e6f45b8`](https://github.com/codersachin99/windows-os/commit/e6f45b8ffa0dd1d47691970fdc6816fc7e55a976): eight real Playwright scenarios × desktop/mobile: Computer bg Win7/XP/Win8/Win11dark, empty Bin bg Win7/XP, uploaded Computer text-file Send-to submenu, and actual created/deleted folder in Bin. Checks disabled commands and returned focus.
- [`1e70a86`](https://github.com/codersachin99/windows-os/commit/1e70a8627ba61f26b655274f48a099a277c35dd7): add suite to opt-in focused GitHub Actions.
- [`5bb1199`](https://github.com/codersachin99/windows-os/commit/5bb1199a525028ddcc4450b20d28ef9fd66451ea): `migration/EXPLORER-BIN-CONTEXT-KEYBOARD-SOURCE.md` source proof and limits.
- [`f52aaf5`](https://github.com/codersachin99/windows-os/commit/f52aaf5a7f456f680d4955f603734706a403eb15): mark specific `main.js`, Computer and Bin modules **in progress** with bounded evidence; not full source ports.

**Verification:** one new exact-head `[run-ci]` required; no claim this slice passed before CI. Check prior run #44805818122 and this new run separately, inspect failed browser logs/traces without skipping tests. Source-paired visual capture still needs controlled pinned original checkout / configured `LEGACY_SOURCE_READ_TOKEN` and has not proved pixel fidelity. Continue original Desktop/Start/Computer/Bin next priorities; draft PR remains unmerged until safe acceptance.

---

## 21 November 2026 — Desktop and Recycle Bin context keyboard focus integration

**Original pinned:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`; **branch:** `feat/0001-faithful-react-foundation`; draft PR #1 unmerged. No source, `main` or release changes.

**Previous exact-head CI:** [#44794377379](https://github.com/codersachin99/windows-os/actions/runs/44794377379) **SUCCESS** at `d157ca5` (source Start context keyboard fix). All TypeScript, units, source/artwork, Contacts, Vite, focused and full desktop/mobile Chromium passed. Source-paired screenshot job skipped.

**Found Desktop/Bin keyboard gap:** `DesktopIcons.tsx` already rendered original DesktopMenu/ItemMenu commands with `sourceMenuArrowFocus` and right/left child menu navigation, but pointer-opened menu had no focus. The arrow handler was unreachable without explicit focus; Escape discarded the menu without returning focus to the invoking icon or Desktop background.

**Changes in this slice:**
- [`d58b36b`](https://github.com/codersachin99/windows-os/commit/d58b36bd39ed84604aa0c57c16320460b13a389c): capture real Desktop icon/background as return-focus target; move focus to first enabled context item on menu-anchor mount only (not submenu rerenders); Escape closes popup and returns focus to connected target or Desktop root. Preserve original actions, existing menu viewport reposition and source theme skins.
- [`fb56504`](https://github.com/codersachin99/windows-os/commit/fb56504ee66f80f047ae5b26b21bbc4ed6229080), [`c4a9a67`](https://github.com/codersachin99/windows-os/commit/c4a9a67c5bc5160a16834a726f7c3cea28cc452e): 11 Playwright cases, desktop/mobile, for Win7, XP, Win31, Win8, Win11dark Desktop background View/Sort/ArrowLeft/Right/Escape, Computer icon disabled Properties skip and return focus, Bin disabled Empty/Properties skip with real Enter opens Bin. Original checked Large icons label accounts for its check glyph.
- [`93475e4`](https://github.com/codersachin99/windows-os/commit/93475e4ad4e7225936d3241ee2e1340df69bd6c5): targeted opt-in CI now runs the suite.
- [`035845d`](https://github.com/codersachin99/windows-os/commit/035845ddca4bcaaae63415b7b195471dc5ad357f): source-specific acceptance audit.
- [`d4466de`](https://github.com/codersachin99/windows-os/commit/d4466de194a75362f8a47fe0d65a483badbab1ba): module tracker in-progress evidence, not complete.

**Verification:** checkpoint triggers one exact-head `[run-ci]` run; the new code/tests **have not passed** until the run concludes. Inspect any failed desktop/mobile Playwright traces; fix original code/acceptance assertions, do not skip. The broader Desktop/Start/Computer/Bin original-vs-target pixel parity remains unverified until `LEGACY_SOURCE_READ_TOKEN` or a controlled pinned reference checkout is available. No releases or merge yet.

**Next:** after checking CI, prioritize source-backed Desktop/Explorer/Bin functional fidelity and source-paired visual regression rather than aesthetic reinvention.

---

## 21 November 2026 — fix Start program popup keyboard and Escape focus for every renderer

**Source lock:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Branch:** `feat/0001-faithful-react-foundation`; draft PR #1 unmerged.
`main` and pinned source untouched.

**Previous exact-head CI checks BOTH green:**
- [#44787399492](https://github.com/codersachin99/windows-os/actions/runs/44787399492), `b97d550`: Win10/11 popup styling, TypeScript, unit, audits, Vite, focused and full desktop/mobile browser **SUCCESS**.
- [#44788112053](https://github.com/codersachin99/windows-os/actions/runs/44788112053), `b8dc340`: Vista shared Start recents/power and popup styling, all checks **SUCCESS**. Visual capture SKIPPED on both; no original-vs-React parity established.

**Found actionable keyboard bug:** Start program action menu is portaled under `document.body`, with `role=menu` and ArrowUp/Down roving focus handler but never focuses a menu item when opened. The arrow handler was effectively unreachable on right-click. Escape focus restoration previously used only normal `data-test-program` or `data-test-source-program` selectors; it missed actual Win31 Program Manager and Win95/98/2k cascading menu buttons, and some Win10 recent tiles.

**Committed:**
- [`657ea323`](https://github.com/codersachin99/windows-os/commit/657ea3237c057516f524f6baa11ec04dbfb56b3b): keep the actual invoking `event.currentTarget` in a React ref; focus first enabled action after portal mounts; Escape restores actual still-connected origin button. Retain selector fallback, source viewport placement, action engine and disabled-item boundaries.
- [`2cfa74e8`](https://github.com/codersachin99/windows-os/commit/2cfa74e8ee5d2c52bf106d476097f21ba738f580): 11 theme/layout Playwright cases × desktop/mobile checking focus, arrows, disabled action skip, Escape and exact origin focus in Win7, XP, Vista, Win10, Win11dark, Win8/81, Win31 and Win95/98/2k.
- [`5f0e83da`](https://github.com/codersachin99/windows-os/commit/5f0e83dad65d805779c5b707a27e1315b2446c89): includes the suite in opt-in source shell targeted browser CI.
- [`2e7ed61d`](https://github.com/codersachin99/windows-os/commit/2e7ed61d9664e97ed040b653dd35ccfc74e0c0ba): source/focus audit `migration/START-CONTEXT-KEYBOARD-SOURCE.md`.
- [`876515d0`](https://github.com/codersachin99/windows-os/commit/876515d0cffade3851fcd1f28cfa2b10114280b4): source module tracker evidence; module status remains **in-progress**.

**Verification request:** ONE new exact-head opt-in `[run-ci]` on this checkpoint. New code and 22 desktop/mobile browser executions are NOT verified until that CI completes; previous green CI cannot be applied to new code. Inspect test failures and remedy root causes, especially HTML focus and Win8/Win31 event propagation; do not skip failing tests. Screenshot comparison remains pending original private-source checkout/configured `LEGACY_SOURCE_READ_TOKEN`, not part of default CI.

**Next highest priority:** check current CI exact-head result, correct any source-backed defects, then tackle the highest-value original Start/Desktop/Computer/Bin interactions and visually compare rendered source and candidate at fixed sizes. Full source parity, remaining apps/themes/native adapter and verified release are not complete; PR remains draft.

---

## 20 November 2026 — restore source Vista Start recents/power and program menu

**Original pinned:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Branch:** `feat/0001-faithful-react-foundation`, draft PR #1, unmerged.
`main` and original remain untouched.

**Verified prior baseline:** exact-head [CI #44782599216](https://github.com/codersachin99/windows-os/actions/runs/44782599216)
**SUCCESS** on `c2a7afd`, including focused/full browser runs.
The newer Win10/Win11 system popup [CI #44787399492](https://github.com/codersachin99/windows-os/actions/runs/44787399492)
was still **running** at handoff (TypeScript, unit, source/artwork audit,
Contacts and Vite passed; focused browser started).
Do not silently mark that run green or infer Vista verification from it.

**Found source omission:** immutable `src/modules/shell/startmenu-base.js`
defines `isVista() { return "winvista" === this.theme; }` and
`searchStyle() { return this.isVista ? "vista" : "win7"; }`.
The same Vue base template renders recentPrograms and the configured
powerButtonAction for Vista. React had included Win7/Aero/Basic in
`isWin7StartFamily` but accidentally excluded **`winvista`**, hiding
both working shared surfaces. Pinned `theme-winvista-scss.js` also
uses the Win7 source `.winui-menu` light panel/hover/gutter, which
was missing on the detached React program-actions popup.

**Committed source-backed slice:**
- [`d63689c`](https://github.com/codersachin99/windows-os/commit/d63689c704fb4cb5700feb6fe2a9192abdb192e3) adds Vista to the shared Start recent/history and configured power surfaces.
- [`ea539b9`](https://github.com/codersachin99/windows-os/commit/ea539b93e8124446033a46408dae58808e6f15f9) adds original Vista system popup gradient, gutter, bevel, border, directional shadow in portal-local stylesheet.
- [`0e17784`](https://github.com/codersachin99/windows-os/commit/0e1778416ed67453a15300030343fc4809471f72) adds 3 desktop/mobile browser tests: recent launch + All Programs, right-click hover + real taskbar Pin, configured Switch user/logon.
- [`73cc241`](https://github.com/codersachin99/windows-os/commit/73cc24136d65e9246d403be6b7b9b8ffad6b6d8f) includes these in the opt-in focused gate.
- [`10bb118`](https://github.com/codersachin99/windows-os/commit/10bb118c5104a1dfdf2b33876914c07dde0d2a44) documents original source evidence and explicit acceptance gaps.
- [`30d0693`](https://github.com/codersachin99/windows-os/commit/30d0693fc5827cf98258a67415b8bea7732244b5) records the source module slices as **in-progress**, never complete.

**Verify:** one exact-head opt-in `[run-ci]` requested by this handoff;
new Vista tests remain **unverified** until that run completes.
The older Win10/11 modern popup run at `b97d550` is independent.
Inspect source targeted browser test failures (especially Android
touch emulation, menu selectors and original CSS computed colors)
and fix objectively. The original `searchStyle:"vista"` search
places UI and original-vs-target screenshot matching remain pending.
Native host features, whole themes and unrelated app behavior are
not certified. Do not merge draft PR or release.

**Next:** check both opt-in runs, then continue highest-value original
Start/Desktop/Computer/Bin functional parity and paired screenshots,
when the private source can be run in a controlled visual comparison.

---

## 20 November 2026 — correct source Win10 / Win11 Start program popup paint

**Immutable original:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation` / draft PR #1, unmerged.

**Prior exact-head CI:** [#44782599216](https://github.com/codersachin99/windows-os/actions/runs/44782599216)
**SUCCESS at `c2a7afd`** (TypeScript, units, source inventory,
byte-identical original art, Contacts, Vite, focused regressions and full
desktop/mobile Chromium). Source-vs-React visual capture skipped; no
source screenshot parity claimed.

**Next source-backed bug:** original frozen
`src/modules/themes/theme-win10-scss.js` shows
`.win10 .winui-menu` **light `#eee`** with black text, `#a0a0a0`
border and `#fff` hover. Earlier React Start popup incorrectly copied
the dark `#2c2c2c` Start panel. The **pinned**
`theme-win11-scss.js` similarly has `.win11 .winui-menu` radius 6,
padding 6, left item indent 32, light `#f9f9f9` surface, original
`--item-bg--hover:#f0f0f0` rather than the reused incorrect blue
`#e5f3ff`; Win11dark uses `#242424`, `#fff1` border/hover,
black 20% shadow. These source constants were confirmed directly
against the frozen modules. Real program actions are still portaled
to `document.body` and must be styled via popup attr, not by theme
ancestor.

**Commits on this branch:**
- [`43c93b6`](https://github.com/codersachin99/windows-os/commit/43c93b6078a32ef2b9e371d195dbaea4d900fdb4): isolated
  exact source Win10 light/Win11 light-dark popup CSS in
  `sourceStartContextThemes.css`, RTL preserved and dark Start panel
  unchanged.
- [`070b06e`](https://github.com/codersachin99/windows-os/commit/070b06eae1fd639f5a5cfd38d222528acea46a6a): three real Notepad
  right-click and Pin-to-taskbar cases on desktop AND mobile; computed
  color, hover, border, radius and item indentation checks.
- [`ec18634`](https://github.com/codersachin99/windows-os/commit/ec18634ebf5b312a5a1b707a12971404772b5045): add to opt-in
  focused GitHub Actions source shell tests.
- [`66c61fe`](https://github.com/codersachin99/windows-os/commit/66c61fe4425c67998f8856ae926a91c787f53600): source comparison and
  acceptance limits in `migration/START-CONTEXT-MODERN-SOURCE.md`.
- [`44f61eb`](https://github.com/codersachin99/windows-os/commit/44f61ebb91a63ae6f811ac56ad53be979537dfa6): source module tracker
  flags theme-win10/theme-win11 and startmenu-win10/startmenu-win11 as
  **in progress**, NOT fully complete, with linked evidence.

**Verification action:** this commit uses `[run-ci]` to request one
new exact-head CI; new code/tests have not yet been verified. Inspect
focused browser failures and fix root causes. If green, pursue the
next source-backed Start/desktop/Computer/Bin screenshot/behavior
difference. Source-paired screenshot capture depends on private
`LEGACY_SOURCE_READ_TOKEN` or an explicitly authorized source checkout;
do not treat target-only capture as parity. No merge to main and no
release until genuine pixel/function parity.

---

## 20 November 2026 — repair XP Royale test; source Win31/9x/8 Start popup palettes

**Frozen source reference:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target branch:** `feat/0001-faithful-react-foundation`; draft PR #1 unmerged.

**Verification facts:**
- [Previous Win7 Start CI #44763970264](https://github.com/codersachin99/windows-os/actions/runs/44763970264)
  **PASSED**, including TypeScript, unit, source/artwork/Contacts audits, Vite,
  focused and full desktop/mobile Chromium. It checks `4cf6406`.
- [Win7/Xp context CI #44765901335](https://github.com/codersachin99/windows-os/actions/runs/44765901335)
  **FAILED** at `927bdb5`: source, TypeScript, unit, artwork, Contacts
  and Vite all passed; focused Chromium: **578 passed, 2 failed, 2 skipped**.
  Both failures were the SAME stale test expected `rgb(51,90,168)`
  vs actual **`rgb(51,94,168)`** for Royale `winxpR`.
  Source `sourceShellTheme.css` and pinned XP palette both use
  `#335ea8`; the application CSS is correct. Full browser suite
  skipped after targeted failure; no green claim.

**Corrective/source-backed work:**
- [`0dafa824`](https://github.com/codersachin99/windows-os/commit/0dafa824c0374213ab05ca035c4544de68c6c974)
  corrects only the precise XP Royale test value, preserving the CSS.
- [`39e62f31`](https://github.com/codersachin99/windows-os/commit/39e62f31bf0ce815a383aee1a4c01fa1b81a5198)
  ports the original `.winui-menu` theme CSS for Windows 3.1,
  Win95/98/2000 and Win8/8.1 to **real portaled** Start program menus,
  preserving individual original palette, classic bevel, Win8 gutter,
  high contrast and direction-specific shadows.
- [`287ce3cf`](https://github.com/codersachin99/windows-os/commit/287ce3cfd5ddc875c7340a97726bfa09d5b6424a)
  adds six per-theme Playwright cases (desktop and mobile: 12 instances)
  testing actual Win31 Program Manager/Win9x cascading Programs/Win8 tile
  right-click, menu paints and working Pin to taskbar.
- [`4b8994ff`](https://github.com/codersachin99/windows-os/commit/4b8994ff0f6ebadd048f5c1410bcf516e1366260)
  adds this test suite to opt-in focused browser CI.
- [`4e0e32a8`](https://github.com/codersachin99/windows-os/commit/4e0e32a8966876b6aa0ac12420947aa585cf69f4)
  adds source audit; [`abfe0220`](https://github.com/codersachin99/windows-os/commit/abfe02206a2cde9061cb57f5d1a258a40acd310e)
  marks three source theme modules **in-progress**, not complete.

**Action:** this checkpoint deliberately triggers ONE `[run-ci]` exact
branch-head run. All new tests remain **unverified** until this run
completes. Inspect concrete Playwright failure logs/artifacts and fix
real implementation/tests; never skip, relax source values or falsely
claim pixel parity. Screenshot source pairing still unavailable until
private `LEGACY_SOURCE_READ_TOKEN` is configured for source checkout;
React-only screenshots are not original comparison evidence.

**Next priority:** resolve exact-head CI, then pursue measured original
vs React Start/desktop/Computer/Bin theme screenshots and finish the
largest source-backed interaction and visual gaps, preserving
`legacy-win7`, target `main`, draft PR and no product release.

---

## 20 Nov 2026 — source StartProgram popup skins across Aero / Classic / XP

**Original frozen:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation`, draft PR #1, unmerged.

**Previous Start recents/power verification:** exact-head [CI #44763970264](https://github.com/codersachin99/windows-os/actions/runs/44763970264)
was **still in progress** at this handoff (TypeScript, unit, source inventory,
asset/Contacts audit and Vite build all passed; focused desktop/mobile browser
running, full suite not completed). Do **not** claim prior Start changes green
until that run finishes; inspect and fix failures if any.

**New pinned source slice:** the original `.winui-menu` styles in
`theme-win7-scss.js`, `theme-win7-classic-scss.js` and
`theme-winxp-scss.js` have been ported to the actual
`StartMenu.tsx` program context menu through
`sourceStartContextThemes.css`. Unlike Explorer popups, these program
menus are portaled to `document.body`, so source family selectors under
`.windows-desktop` could never style them. The new adapter explicitly
scopes source paints by the existing `data-source-start-context-theme`:
Win7 + four Aero + Basic 1 source inset/gutter/gradient hover; Basic 2–4
classic/high-contrast bevel, backgrounds and selection; all seven XP
variant accent highlights and source white/Tahoma/beige border.
The menu's real Pin to taskbar action, keyboard/portal positioning, and
disabled Properties remain unchanged.

**Commits**
- [`a60f601`](https://github.com/codersachin99/windows-os/commit/a60f601c08fddd368b3a7fdb5bea0bb944720020) source palette and theme-family popup CSS;
- [`51f90f4`](https://github.com/codersachin99/windows-os/commit/51f90f4d78819980d3b57ebddeb10e370f1ec061) imports stylesheet after existing Start base;
- [`fe8ab5b`](https://github.com/codersachin99/windows-os/commit/fe8ab5b27a0a76706cf92cb1d41c6ca39e59d50c) adds 16 browser theme cases (32 desktop/mobile);
- [`0ae06df`](https://github.com/codersachin99/windows-os/commit/0ae06dfcf67ee58cc772138481551eaf93e51e35) adds the suite to the **opt-in** focused CI gate;
- [`d991a80`](https://github.com/codersachin99/windows-os/commit/d991a80cbe6799c70b78c35818a604e170242c90) pins explicit original source evidence and outstanding differences;
- [`714851a`](https://github.com/codersachin99/windows-os/commit/714851ab8e83596ebf13a8cf33e266484d78deed) updates source module tracker, keeping statuses partial/in-progress.

**Verification:** This checkpoint deliberately requests **one** new
exact-head opt-in `[run-ci]` for both the prior Start recents/power
changes and new popup CSS and browser tests. None of the new popup tests
were executed locally (GitHub connector has no local test runner).
Inspect TypeScript, unit, source/artwork audits, Vite, focused and
complete desktop/mobile Chromium. Fix failures; never skip tests.
The source-vs-target viewport **paired screenshot** comparison, exact
Vue menuitem DOM/icons/indentation and remaining theme families are
not accepted. `main`, frozen reference and releases remain unchanged.

**Next priority:** verify both outstanding opt-in CI runs; if green,
measure real original/React Start/desktop/Computer/Bin screenshot
differences where pinned source can be launched, then correct the
highest-confidence source-backed visual/function gap. If screenshot
capture lacks `LEGACY_SOURCE_READ_TOKEN`, mark it target-only,
not visual parity.

---

## 20 Nov 2026 — restore shared Win7 Start recents and configured power (Aero/Basic)

**Immutable source:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation`, draft PR #1 (unmerged).

The **previous** exact-head [CI #44756219652](https://github.com/codersachin99/windows-os/actions/runs/44756219652)
**PASSED** on `b3051af`: TypeScript, units, source/artwork/Contacts
audits, Vite, focused and full desktop/mobile Chromium; visual capture
was skipped. This acceptance includes the previous Computer/Bin context
menu theme-family work, *not* the Start changes below.

**New source-backed fix:** the pinned original `src/modules/shell/startmenu-base.js`
provides one `recentPrograms` list and configured power action for its
shared Start. React's existing recent-section condition included only
canonical `win7` (plus XP/Win11), even though the surrounding Win7 Aero
and Basic branch already mounted the list. The power button was likewise
restricted to literal `win7`. A shared family predicate now enables
both real source behaviors on four Aero and four Basic variants without
altering XP, Win8/10/11, Win31 or Win9x menus. All eight variations
continue using their existing theme-specific shell and Start paints.

**Commits:**
- [`3b3646a`](https://github.com/codersachin99/windows-os/commit/3b3646a0cef7274ad6079f9991d57fdf7fb18824) restores recent history and configurable power on Aero/Basic;
- [`d27fc43`](https://github.com/codersachin99/windows-os/commit/d27fc43ce428db5335ead00d58e7ca5e4ac5eac8) adds Playwright per-theme history/All Programs checks and actual configured Switch user action tests on desktop/mobile.

**Verification:** one opt-in `[run-ci]` exact-head workflow is requested
by this handoff commit. At commit time, new Start tests are **unverified**:
inspect the result, address actual regressions, never suppress tests.
Paired pinned-source/React viewport screenshots remain **not assessed**,
including original Start layout geometry and full Computer/Bin/desktop
functional/theme parity. Preserve reference SHA, target `main`, draft PR
state and zero product releases.

**Next:** inspect exact-head CI; then compare source/React Start and
Desktop/Explorer/Bin screenshots across desktop and mobile, isolate the
largest measured difference and port the smallest complete original
behavior/skin rather than inventing a substitute.

---

## 20 Nov 2026 — source theme-family Explorer / Recycle Bin context menus

Pinned reference: `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
Target branch: `feat/0001-faithful-react-foundation`; draft PR #1.

Previous exact-head [CI #44749268210](https://github.com/codersachin99/windows-os/actions/runs/44749268210)
**SUCCEEDED** on commit `1de989fe` (browser-and-contracts; visual-capture
skipped). Previous PR/HEAD docs that said in progress are historical.

**Implemented next source-priority slice:** `sourceExplorerContextTheme.css`
now uses the source .win7 menu appearance for Aero 1–4 + Basic 1, source
.win7-classic menu bevel/contrast/accessibility variables for Basic 2–4
and the source .winxp menu for seven XP variants. XP menu selection
uses original per-variant `--source-accent`, consistent with desktop
context menus. Scope includes Computer/Recycle Bin background/item
menus and detached View/New/Send To child surfaces. New
`source-explorer-theme-families.spec.ts` covers real Computer/Bin
context, hover and eight View modes on desktop/mobile.

**Status:** commit(s) `a242268`, `1644c92`, `37560dc` and
`fd0a880` have NOT yet passed exact-head browser CI. A single opt-in
`[run-ci]` will be requested on the documentation checkpoint.
Do not claim this CSS slice accepted until the run completes and any
failing tests are fixed. Pair with actual original screenshots later.
The pinned original and target main stay unchanged; PR #1 is draft,
no merge/release.

**Next:** check precise CI results/logs; fix regressions without
skipping. Then source/React viewport screenshot comparisons and
remaining original Start, Desktop, Explorer and Recycle Bin visual,
interaction and audio parity (do not infer completeness from tests).

---

## Aero Window Color and Appearance — 20 Nov 2026

**Pinned original:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Branch:** `feat/0001-faithful-react-foundation`, Draft PR #1.
Previous [CI #44745437012](https://github.com/codersachin99/windows-os/actions/runs/44745437012)
had passed typing, unit, source/asset and targeted browser steps; its
full browser suite remained in progress at last observation.

**Implementation:** actual 32-color source webpack 2299 palette,
ChangeAppearance Save/Cancel and transient preview, transparency
option, validated Guest persistence and color reset when switching
themes. Enabled glass respects the pinned plugin-cssvar predicate.
Tests cover source colors, safely parsed storage, source painting,
Cancel/window-close rollback, theme reset and persistence.
No merge, release or upstream edit. Exact-head `[run-ci]` required
before accepting new behavior as green. Complete screenshots and
Start/context/Computer/Recycle Bin theme parity remain next.

---

## Fix stale system wallpaper regression counts — 20 Nov 2026

**Source lock:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
Latest metadata exact-head [CI #44741632387](https://github.com/codersachin99/windows-os/actions/runs/44741632387)
FAILED: TypeScript, unit, source/artwork checks and Vite build PASSED;
the targeted Playwright suite had 524 passes, 4 failures, 2 skips
on desktop/mobile. Both failing scenarios still asserted the previous
13 original system wallpapers, while the actual source-correct gallery
now includes 3 additional byte-imported Aero category images (16).
This was a stale assertion, not evidence that the three source assets
should be removed.

Updated `source-personalize-background.spec.ts` and
`source-cpanel-program-launch.spec.ts` to require 16 items and verify
all 3 original architecture/landscape/nature image URLs explicitly.
No application logic changed or tests disabled. Triggered an
exact-head opt-in `[run-ci]` for verification; results must be read
before claiming this new head passes. Previous taskbar
[CI #44739028004](https://github.com/codersachin99/windows-os/actions/runs/44739028004)
PASSED. Original and target main untouched; PR #1 remains draft and
there is no release.

**Next:** inspect new exact-head CI, correct any regressions, then
pair screenshots against the pinned original and complete Start,
Desktop, context, Computer and Recycle Bin theme parity.

---

## Original source registry-driven Aero/Basic thumbnails and desktop — 20 Nov 2026

**Source lock:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
Original webpack modules 3b8c/2299 establish exact Aero colors
# aad1fb, #5986ca, #ababab, #9f81bf (no spaces), Basic1 #a7c0dc,
Aero2/3/4 category backgrounds architecture/landscape/nature and
Basic2/3/4 solid backgrounds #3b6ea4 / #000 / #fff. Three source
images imported with source/target Git SHA equality.

**Code:** `packages/contracts/src/sourceWin7ThemeMetadata.ts`,
`packages/assets/src/index.ts`, `packages/ui/src/DesktopShell.tsx`,
Personalize model/view/CSS, source unit tests and desktop/mobile E2E.
The original Aero gallery has FOUR IDs; canonical `win7` direct
route remains supported, but not as a fifth source gallery tile.
Live DesktopShell uses original metadata to set theme-color /
theme-color--inactive and background image or solid paint.
The source sound scheme metadata is recorded but sound changes
are not yet implemented. Do not mark full theme parity complete.

**Verification:** this checkpoint triggers one opt-in `[run-ci]`
run on exact head. Previous Aero frames and Basic1/2 CI passed.
Source taskbar [CI #44739028004](https://github.com/codersachin99/windows-os/actions/runs/44739028004)
was still running during metadata implementation.
Fix any browser failures before expanding source theme skins.

**Next:** source/target viewport screenshots, full Start/menu/
Explorer parity, source sound/transparency experience, then
more themes beyond Windows families. PR #1 remains draft,
main and immutable original untouched, no product release.

---

## Aero taskbar source test syntax correction / CI — 20 Nov 2026

Reviewed new source taskbar browser assertion before running CI;
fixed an over-escaped regex by testing CSS linear-gradient and
its exact 'to right' axis separately. This commit triggers the
only opt-in `[run-ci]` run for the new taskbar source adaptation.

Previous full browser [CI #44735229979](https://github.com/codersachin99/windows-os/actions/runs/44735229979)
successfully verified the Aero window-chrome slice. Basic 1/2
[CI #44734587135](https://github.com/codersachin99/windows-os/actions/runs/44734587135)
also successfully passed. Source taskbar results remain unverified
until this new exact-head run finishes.

---

## Shared Win7 Aero taskbar original surface — 20 Nov 2026

**Locked source** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`; target PR #1 draft.
Source `src/modules/themes/theme-win7-scss.js` provides exact Win7
taskbar gradients, dark 50–80px left strip, 1px/2px highlight rims,
conditional 4px glass blur, 54° reflected translucent texture,
40px-extended tray backing and 54px Start wrapper. New
`packages/ui/src/sourceWin7AeroTaskbar.css` copies their source
declarations to live taskbars for Win7 and Aero 1–4 with RTL.
Source color variable remains configurable; per-ID colors/wallpapers
are still not verified. Classic Basic 1–4 remain independent.

**Tests** `tests/e2e/source-final-theme-catalog.spec.ts` for all five
live themes: source painting, pseudo-element rim, Start open/close,
actual Computer running/minimize/restore. Exact-head CI must
verify before asserting this task green. Prior Basic 1/2
[CI #44734587135](https://github.com/codersachin99/windows-os/actions/runs/44734587135)
finished **success**; preceding Aero #44735229979 was still
running during this work.

**Next** resolve any CI regressions and original Aero per-ID
palette/wallpaper lookup; source + candidate screenshot pairs on
desktop/laptop/mobile. PR remains draft; no merge or release.

---

## Aero 1–4 shared source Win7 WindowMain shell — 20 Nov 2026

**Immutable source:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Branch:** `feat/0001-faithful-react-foundation`, draft PR #1.
**Previous head:** Basic 1/2 `76d3005`, opt-in
[CI #44734587135](https://github.com/codersachin99/windows-os/actions/runs/44734587135)
was still running during source inspection; no earlier green claim.

**Work:** source `theme-win7-scss.js` shares the same window/glass
geometry across all Aero IDs, while `app.config.json` maps each
Aero boot/logon to Win7. Extended exact source Win7 window rules
to the four Aero IDs, preserving RTL, Aero Peek and Start history;
no made-up accent palettes or wallpaper associations. Source catalog
now records the four as **partial**. Added four real desktop/mobile
Playwright browser acceptance scenarios; updated source audit
`migration/AERO-BASIC-SOURCE.md` and module tracker.

**Remaining:** recover source exact Aero 1/2/3/4 palette and
wallpaper associations, theme-specific assets and desktop/taskbar
styles, screenshot pair source/target, Explorer/context full parity.
No merge or release until verified.

---

## Basic 1 and 2 real shell migration — 20 Nov 2026

**Source:** immutable `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Previous checkpoint:** Basic 3/4 `5f4ee9f`; opt-in
[CI #44703453623](https://github.com/codersachin99/windows-os/actions/runs/44703453623)
SUCCESS including browser suite.

**Implementation:** Basic 1 gets its own source-backed Windows 7
opaque-window style, 40px caption controls and Win7 taskbar overlay;
Basic 2 uses actual classic source default palette #d4d0c8 and
52px taskbar, classic bevelled Start, 20px window controls, original
active/inactive title gradients. New `sourceWin7BasicVariants.css`;
shared classic selector now also includes Basic 2.
Real menu/window state remains wired to the existing React engine.
Both statuses advance to partial, with all Aero variants pending.

**Verification:** new desktop/mobile browser contracts in
`source-final-theme-catalog.spec.ts`; opt-in `[run-ci]` commit
requires exact-head green before reporting tested. Original
wallpaper-to-theme associations and some custom color metadata are
unverified. Docs at `migration/AERO-BASIC-SOURCE.md`.

**Next:** diagnose browser/test failures if any, then Aero 1–4
original palettes and shell frames, followed by paired visual captures
and full context/Explorer parity. Keep PR #1 draft; don't touch main,
locked legacy source or releases.

---

## Basic 3/4 high-contrast classic skin — 20 Nov 2026

**Original source:** locked `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Previous green CI:** [#44697312900](https://github.com/codersachin99/windows-os/actions/runs/44697312900) (XP fixes),
[#44697839308](https://github.com/codersachin99/windows-os/actions/runs/44697839308)
(Aero/Basic Personalize). Both finished successfully.

**Implementation:** scope-isolated CSS for source Basic3/4 black/white
palettes, source 52px classic taskbar, original 26px Classic Start icon,
Start pressed paint, active/idle title and window body,
Start/context menus and live React lifecycle. Catalog now identifies
both as partial, while Basic1/2 and Aero remain pending.
See `migration/AERO-BASIC-SOURCE.md`.

**Verification:** new Playwright desktop/mobile contracts for Start,
taskbar, Computer/Recycle Bin focus, maximize bottom, Desktop and
taskbar context actions; opt-in CI must confirm before counting green.
**Next:** fix any exact-head CI regression, then Basic 1/2 real shell,
Aero metadata and shell visuals; pixel-perfect screenshot pairing.
PR #1 stays draft, main/original source untouched, no release.

---

## Win7 Aero/Basic original Personalize gallery — 20 Nov 2026

**Original pin:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Development:** `feat/0001-faithful-react-foundation`, draft PR #1.
**CI:** preceding XP geometry-fix opt-in run [#44697312900](https://github.com/codersachin99/windows-os/actions/runs/44697312900)
was pending at commit start, not yet marked green.

**Source work:** `packages/apps/personalize` now renders four
Aero + four Basic literal source IDs with the pinned source gallery
geometry, glass overlay and Basic 1/2/3/4 faux-window CSS swatches.
Adds source-correct separate Basic group, real theme choice/persistence
and desktop/mobile browser tests; source and target main unchanged.

**Important limit:** Aero color metadata and exact theme wallpaper
mappings were NOT evidenced by the pinned files; previews use
existing original byte-imported Win7 wallpapers with interim
assignments. Full visual shell skins are still PENDING, not partial.
See [AERO-BASIC-SOURCE.md](AERO-BASIC-SOURCE.md).
Do not claim complete source migration or merge draft PR.

**Next:** inspect CI job failures precisely and repair. Recover
source Aero/Basic palette metadata and implement actual source
taskbar/Start/menu/context/Explorer/Bin variants, screenshot-pair.

---

## Correct failed XP Start CI source geometry — 20 November 2026

**Source:** immutable legacy-win7 26b9f0ce7a1665dee89a7c81824bec09e2c75776.
**Previous run:** [CI #44695637058](https://github.com/codersachin99/windows-os/actions/runs/44695637058)
FAILED, not green: 488 passed, 4 failed (2 repeated cases across
desktop/mobile), 2 skipped. Typed/build/unit and artwork checks passed.

**Root causes:** new CSS reduced XP taskbar height to 36px while
maximized-window source regression/previous React geometry kept the
40px window reservation: a 4px edge mismatch. Re-synchronized XP
taskbar and Start button height to 40px and retained the original
115%-wide/80px curved Start pseudo-skin. The RTL browser test assumed
computed `left:auto` under an absolutely positioned 115%-wide pseudo
element also anchored by `right:-18px`; Chromium resolves its computed
left in px. Acceptance now checks the physically meaningful right
anchor and rounded mirrored corner. Neither failing browser test is
skipped or loosened for window-frame position.

**Validation:** a new `[run-ci]` check is required. No local browser
runner available. If it fails, inspect exact job logs and fix source.
The draft PR, main and source ref are unchanged.

**Next:** finish eight Aero/Basic source-themed Personalize previews,
then real shell skins, desktop/Start/context/explorer visual parity.

---

## XP Start source shape, hover and pressed styling — 20 November 2026

**Source reference:** locked `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `feat/0001-faithful-react-foundation`, draft PR #1.
**Previous CI:** [run #44692695641](https://github.com/codersachin99/windows-os/actions/runs/44692695641)
was still in progress at check time; do not claim green until complete.

**New actual code:** `DesktopShell.tsx` makes the Start toggle reflect
real `state.startOpen` as `.is-active` and `aria-expanded`. XP-only
rules in `sourceShellTheme.css` copy original curved 80px, 115%
Start `::before` geometry and shadows, original image at 20px and
source "start" label, theme-specific E/G/N/R/S/Z gradients, Noir hover
and pressed and Zune pressed, plus RTL mirroring. XP shell/taskbar
reserve the original 36px height. Other themes stay isolated.

**New source checks:** `source-final-theme-catalog.spec.ts` tests
all seven XP variants on desktop/mobile for original icon bytes,
CSS background, hover, active-menu state, closing, taskbar dimensions
and one RTL shape check. Previous full visual screenshot pairing
and all non-XP skins remain pending.

**Verification:** New `[run-ci]` opt-in commit will run TypeScript,
unit, Vite, source/asset audits and browser assertions. Cannot run
local npm/browser tests via connector-only GitHub environment;
do not report green before the exact-head run concludes.

**Next:** fix any CI failure, then prioritize Win7 Aero/Basic family
selection and original desktop/Start/context/Computer/Bin parity.
Avoid merging draft or releasing incomplete migrations.

---

## XP taskbar application state painting — 20 November 2026

**Original:** immutable `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Branch:** `feat/0001-faithful-react-foundation`; draft PR #1, unchanged main.
**Previous verification:** [CI #44688489556](https://github.com/codersachin99/windows-os/actions/runs/44688489556)
completed **SUCCESS**, covering prior XP Personalize swatches.

**This slice:** `sourceShellTheme.css` ports XP taskbar running/opened,
hover, active and active-hover paints from the original XP source; XP
Green is olive, Embedded/Noir/Royale/Silver/Zune each have separate
four- or two-stop palettes. Real pinned/running groups and original
foreground flags control the paint; 22px icon/active translation.
Desktop/mobile Playwright tests operate an actual Computer window
through open, hover, minimize, hover, restore. Source reference, main
and releases untouched. Source-paired screenshot parity still pending.

**Verification:** opt-in `[run-ci]` is required for this commit and
must not be marked green before job completion. No local npm test
execution was possible through connector-only access.

**Next:** fix any CI regression; XP Start button pseudo-state parity;
then original Win7 Aero/Basic and shell/Explorer/Bin visual comparison.

---

## Original XP seven-theme Personalize cards — 20 November 2026

**Immutable original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Branch:** `feat/0001-faithful-react-foundation`, draft PR #1; original and
target `main` unchanged.

**Last finished acceptance:** [run #44682340690](https://github.com/codersachin99/windows-os/actions/runs/44682340690)
completed successfully, including TypeScript, units, source/asset audits,
Vite build, focused and full browser testing of the preceding XP frame slice.

**New change:** `PersonalizeApp` now lists all seven real XP source IDs, with
the same exact original XP background preview and each distinct
source `personalize.css` 25px color swatch. No generated images or guessed
theme palette. The existing source-derived reducer applies/persists each
variant when selected. Added unit catalog/image checks and real desktop/mobile
Playwright tests for every variant's color and persistence. See
[migration/XP-VARIANTS-SOURCE.md](XP-VARIANTS-SOURCE.md).

**Verification:** this new slice is not covered by the previous green run.
The source/target checkout cannot run locally in the connector-only workspace.
One explicit `[run-ci]` commit requests the next full check; inspect the
new run before reporting success, fix failures without skipping assertions.

**Next priorities:** source-paired Personalize preview screenshots and
XP taskbar/Start hover/pressed behavior; then Windows 7 Aero/Basic families,
desktop, Start, context menus, Computer/Bin. Preserve draft PR/no release
until source and responsive parity are substantially verified.

---

## XP variant original painted-frame migration — 20 November 2026

**Reference:** immutable `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Branch:** `feat/0001-faithful-react-foundation`; draft PR #1. Source, target main and releases unchanged.

**Implemented code:** `packages/ui/src/sourceShellTheme.css` now adapts the *actual original*
`winxpG/N/R/S/Z` taskbar/tray and `winxpN/R/S/Z` Start top/footer gradient rules,
instead of painting every variant with Luna blue. `packages/ui/src/sourceWindowChrome.css`
now preserves N/R/S/Z original active/inactive caption gradients, with non-close caption
control ramps for N/R/Z and silver S black title text. Original source rules are
`src/modules/themes/theme-winxp-scss.js` `.winxpG` through `.winxpZ`;
the exact stops and unresolved source omissions are recorded in
[migration/XP-VARIANTS-SOURCE.md](XP-VARIANTS-SOURCE.md).

**Regression coverage:** `tests/e2e/source-final-theme-catalog.spec.ts` checks
original G olive tray border and N/R/S/Z painted taskbar/tray and Start
header/footer first-stop colors plus active Computer-window gradient,
in the existing desktop/mobile theme matrix. No tests disabled or skipped
to accommodate the new work.

**CI status at this handoff:** previous exact-head
[run #44679824547](https://github.com/codersachin99/windows-os/actions/runs/44679824547)
was still `in_progress` (browser tests) when checked; it does **not** cover these
new CSS/browser assertions. This handoff commit explicitly opts into a **single new**
`[run-ci]` run for current code. Examine its TypeScript, unit, inventory, asset,
build, focused and full Playwright checks; do not describe it as green until
GitHub confirms completion. Local tests could not be run through the
connector-only GitHub workspace, so this is **unverified** pending CI.

**Next:** fix real CI failures if any, finish XP E/G/S/Z caption and
taskbar-item/Start-button interactions and source Personalize variant previews,
then prioritize the eight Windows 7 Aero/Basic IDs and desktop/Start/context/
Computer/Bin/source-paired screenshots. Keep PR **draft** and never imply
full visual parity.

---

## Original XP seven-theme family implementation — 20 November 2026

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`; target remains `feat/0001-faithful-react-foundation`, draft PR #1. Do not merge or claim pixel parity.

**Fixed after the earlier browser regression commits:** `scripts/import-legacy.mjs` now gets its source SHA from the exact `module-tracker.json.referenceSha` already verified by `npm run audit:legacy` instead of hardcoding obsolete `4e63290`; `packages/assets/src/index.ts` now reports the same final source `LEGACY_REVISION`. `migration/README.md` was corrected to actual npm commands and final original PHP Slim 4 service rather than claiming a source Python server.

**Original XP variant slice:** `SOURCE_XP_THEME_IDS` and `sourceIsXpFamily` in contracts identify precisely `winxp,winxpE,winxpG,winxpN,winxpR,winxpS,winxpZ` from source config / compiled CSS; all report **partial** shell status. The shared assets now reuse byte-identical original XP wallpaper, Start, program, tray, Computer/Bin art for all seven, rather than the incorrect Win7 fallback. `StartMenu` includes all XP-specific sections and Power actions for each family ID; `SourceWindowControlGlyph` uses the original XP SVG glyph on every XP variant. The source XP desktop/taskbar, context menu, window chrome and Start geometry rules are now family-scoped; source `--startmenu-*`, accent and window tokens were transcribed from pinned `theme-winxp-scss.js` into six variant-specific rules in `sourceShellTheme.css`. `migration/XP-VARIANTS-SOURCE.md` documents the exact original colors and unresolved gradients/remaining mismatches.

**New tests:** `sourceThemeCatalog.test.ts` checks exact IDs/status and invalid strings; `sourceShellArtwork.test.ts` checks XP asset reuse for all subvariants; `source-final-theme-catalog.spec.ts` checks original XP wallpaper/Start/menu/power, source palette CSS and Guest entry in each of seven variants on desktop and mobile. The previous Win11dark/Control Panel regression fix is preserved.

**CI:** Previous opt-in [run #44677771463](https://github.com/codersachin99/windows-os/actions/runs/44677771463) passed the focused browser suite and entered the full browser suite, but has **not yet concluded** as of this note. The commit carrying this handoff contains `[run-ci]` to request a fresh exact-head verification of the new XP/code/importer changes. Inspect the most recent Actions run; if red, repair actual errors before expanding theme features.

**Next high-priority tasks:** (1) resolve exact-head CI, (2) finish source-per-variant XP taskbar/tray/window gradients and source Personalize previews, (3) continue original Win7 Aero/Basic theme selector and desktop/Start/context/Computer/Bin parity, (4) obtain genuine paired Vue-vs-React screenshot evidence via authorized read-only original-repo access. Original repository is private and currently unpaired. Keep draft PR, source and main intact.

---

## CI regression repair + locked-source documentation checkpoint — 20 November 2026

**Branch:** `feat/0001-faithful-react-foundation`; **draft** [PR #1](https://github.com/codersachin99/windows-os/pull/1). `main` still `9bb90a41`; immutable `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776` unchanged.

**Actual failed exact-head CI:** [run #44668590682](https://github.com/codersachin99/windows-os/actions/runs/44668590682) on `7afffdd` passed TypeScript, Vitest, source/artwork audits and Vite build but finished targeted Chromium with **442 passed, 2 skipped, 4 failed** (full browser suite not reached). The four failures are desktop/mobile duplicates of:
1. Control Panel background scene expected **12** imported system wallpapers although the verified Win11 Dark asset makes **13**. [`ae798895`](https://github.com/codersachin99/windows-os/commit/ae7988956c522b270b8a1e067fa8fdf8ab97ca48) restores the precise count assertion, not by hiding an asset.
2. Win11 Dark scene right-clicked `#desktop-icons` after opening Notepad, Computer and Personalize; the active Computer correctly intercepted the desktop coordinate. [`6d0da7ab`](https://github.com/codersachin99/windows-os/commit/6d0da7ab85566b5614af9842e4bc20a7033d8644) minimizes those windows in topmost-first order and verifies they are hidden before the real desktop context action. No timeout increases, skipped tests or window click-through hacks.

**New opt-in [`[run-ci]` #44677771463](https://github.com/codersachin99/windows-os/actions/runs/44677771463)** is running against exact test-code head `6d0da7ab` as of this handoff. Inspect *both* targeted and full desktop/mobile Chromium outcomes before claiming green. Later commits are documentation-only: [`090409bd`](https://github.com/codersachin99/windows-os/commit/090409bd1601d287b84f189c16ad5638cc7eb6ca) fixed the stale migration README's source SHA and counted **36** configured original `themeScreens` IDs (plus Win7 runtime alias); [`9ea62df5`](https://github.com/codersachin99/windows-os/commit/9ea62df5717986d076576a6b9e740bde7f997333) and [`f1d33522`](https://github.com/codersachin99/windows-os/commit/f1d335223776c9dd3666eef61255f321d9b2a42b) corrected the visual runbook to the immutable pin and original **PHP 8+ Slim 4** `start.php` launcher, Composer install and isolated SQLite storage; the obsolete `start.py` command is invalid at the locked checkpoint.

**Next:** verify/fix this exact-head run, then implement original Windows 7 Aero/Basic variant personalities and Windows XP color variants with **source CSS/asset evidence**, and deepen Desktop/Start/Computer/Bin acceptance. Pinned original is a *private* repo; the optional original-side CI captures still require repository-authorized read-only `LEGACY_SOURCE_READ_TOKEN`. Target-only screenshots are **not** source-paired pixel parity. Keep source, main, draft status and releases untouched until full migration and visual acceptance.

---

## Source Win11 Dark exact original assets/palette and two real CI fixes — 20 November 2026

**Previous actual verification:** [CI #44590124670](https://github.com/codersachin99/windows-os/actions/runs/44590124670) passed TS/unit/source/assets/build and 443 of 446 focused browser tests, but failed the Win7 mobile stacked Explorer Send-to click; full browser skipped. Fixed actual hover-corridor collapse on the vertical child in `ExplorerApp.tsx` with `data-cascade=stacked`; adjacent desktop menu hover rules remain unchanged. Its 375x667 test deliberately crosses the Copy row en route to the real Desktop shortcut action.

[CI #44667190114](https://github.com/codersachin99/windows-os/actions/runs/44667190114) on `d930195` passed all non-browser checks and **443 focused browser tests, 2 skipped, 1 failed**, now only the Win95 narrow Start Shutdown test: clicking a trigger opened by pointer-enter cleared placement without a branch change, so `useLayoutEffect` never remeasured. The **actual state bug** is fixed by not resetting placement on a redundant open, in `SourceWin9xStartMenu.tsx` (`54b3930`, `2f8b1e1`). No disabled tests, retries or timeouts.

**Next implemented source family:** Windows 11 Dark `win11dark` original `app.config.json` shares Win11 boot/logon; it is a separate shell palette with **two newly imported byte-identical source blobs**: `win11dark.af52a1ca.webp` SHA `18ec99e80efb302bcdd01e86d31954daaa706b8d` and `start-button-win11dark.d417814c.webp` SHA `13187c97beb8af8f2b0b3a7ccda25b0925868a42`. Shared Win11 Start/taskbar/window layout and menu actions now work under the dark ID; source `#1c1c1c` base, `#242424` bright panel, `#fff` text and translucent white border/hover propagate to Start, Desktop, taskbar, window and Explorer menu surfaces. Guest logon shows original dark wallpaper; Personalize exposes a distinct dark tile and 13 byte-pinned background choices. Updated model/source/browser tests preserve light Win11.

[Detailed Win11 Dark audit](WIN11-DARK-SOURCE-SHELL.md), [draft PR #1](https://github.com/codersachin99/windows-os/pull/1). **This handoff commit includes `[run-ci]`** to verify the current exact SHA: TypeScript, all Vitest, source and binary audits, Vite, focused and full desktop/mobile Chromium. Inspect the run and repair failures before saying green. No screenshot pixel-parity claim, no main/source changes, no merge, no release. Continue Windows 7 Aero/Basic, XP variants, Vista, remaining themes, and source-paired captures only after shell regressions are green.

---

## Win7 mobile Explorer stacked Send-to pointer traversal — 20 November 2026 (08:48 IST continuation)

**Actual prior CI failure:** [run #44590124670](https://github.com/codersachin99/windows-os/actions/runs/44590124670), head `f3b734b`. TypeScript, unit, source inventory, source artwork, Contacts source, Vite build **passed**; focused Playwright finished **443 passed, 2 skipped, 1 failed**, so full browser suite was **skipped**. The single failure was recurring **Win7 mobile Explorer "Send to Desktop" click** at `source-explorer-send-to-desktop.spec.ts:26`: first child action was visible/enabled, then `html` intercepted the pointer and submenu detached. The failing trace artifact is `browser-test-results` (artifact 14564231726). No evidence of Win9x classic Start test failure in this run.

**Source behavior fix:** [`c2a0868`](https://github.com/codersachin99/windows-os/commit/c2a086855d271ed695fe0f93fab24682d55edbba) identifies when a narrow-viewport `sourceExplorerSubmenuPlacement` has *vertically stacked* the Send-to child away from the root menu, then ignores incidental `onPointerEnter` events from its other root rows while the child is open. This is necessary because a pointer going from the trigger to a child **above/below the parent** must physically cross those root rows; the old other-item hover handler destroyed the child mid-travel. Desktop adjacent submenu hover-to-switch behavior is **unchanged**; clicking a real root action still performs and closes the menu. It does not disable Playwright, skip the test, or introduce timeout inflation.

**Regression:** [`e945d3f`](https://github.com/codersachin99/windows-os/commit/e945d3fc8d85fa334e3c4f7acebd899b56967b17) explicitly checks a 375x667 stacked child, intentionally hovers **Copy** while Send-to remains expanded, and then clicks the real Desktop shortcut action. The previous mobile placement/desktop/brower tests are preserved.

**Verification:** This `[run-ci]` commit requests exact-head TS, units, source audits, Vite, all focused and full browser tests. Do not mark this bug closed or claim CI green until this run finishes. Original `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`, target main and releases untouched; PR #1 remains draft. Next source-backed work resumes remaining Win7 Aero/Basic and XP variants and untouched original theme families after mobile regression is verified.

---

## Win95/98/2000 narrow Start cascading-menu regression — 20 November 2026

**Prior exact-head verification:** [CI #44558730852](https://github.com/codersachin99/windows-os/actions/runs/44558730852) **SUCCESS** at `bb347915df37c195a593249a959e39a77d9eafdc`, including TypeScript, unit, original source inventory and artwork, production build, and full desktop/mobile Chromium. This verifies the preceding Windows 95/98/2000 source shell, Explorer and Personalize integration, **not** the follow-up below.

**Next source-faithful behavior repair:** Pinned `src/modules/shell/startmenu-win9x.js` and `src/styles/shell/startmenu-win9x.css` render 224px Programs/Shutdown cascading submenus beside the classic Start menu on desktop. React's previously untested <=520px CSS instead placed a 224px submenu over its parent trigger inside a vertical scroll container, risking pointer interception on phones. The new pure `sourceWin9xSubmenuPlacement.ts` chooses the source-adjacent right/left flyout where room exists and otherwise stacks entirely **below Programs or above Shutdown**, constrained to the actual desktop area above the 36px classic taskbar. `SourceWin9xStartMenu.tsx` measures the mounted flyout and viewport in a layout effect, makes narrow flyouts fixed to escape scroll clipping, repositions on viewport resize, and returns focus to its parent on ArrowLeft/Escape; >=521px CSS remains the previous source cascade. Unit tests cover adjacent, side flip, below/above and short phones. `source-win9x-shell.spec.ts` now tests 375x667 actual-bounds, parent re-click, Notepad launch, ArrowLeft focus, and Logout in each of Win95, Win98 and Win2k.

**Verification state:** Changes committed on `feat/0001-faithful-react-foundation` after green `bb347915`. This handoff commit deliberately includes `[run-ci]` to request fresh **exact-head** TypeScript/unit/asset/build plus focused and full desktop/mobile Chromium. Inspect CI before claiming the fix verified; repair failures on this same branch. Original `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`, target `main`, draft PR #1 and releases remain untouched.

**Next priority after green:** source-backed unfinished Win7 Aero/Basic and XP variants, Vista and remaining shell/theme families, deeper Computer/Recycle Bin/Start actions, and **actual original-vs-React** screenshots across desktop/tablet/mobile (not verified by target-only captures). No pixel-perfect or completed-37-theme claim.

---

## Win8/8.1 Computer/Bin View toolbar and genuine narrow-screen Send-To bug fix — 18 November 2026

**Previous evidence:** [Win8 initial full CI #44363167728](https://github.com/codersachin99/windows-os/actions/runs/44363167728), commit `b7a30d2`, passed TypeScript, 655 unit tests, original source and byte-identical artwork, Vite, **324 focused desktop/mobile browser tests**, then **FAILED full browser: 747 passed, 2 skipped, 1 failed**. The only failure was `[chromium-mobile] source-explorer-send-to-desktop.spec.ts` 30s timeout (Win7 Guest Explorer). This was **not** a harmless expectation mismatch: actual Playwright trace from archived `browser-test-results` demonstrates `data-test-explorer-sendto-submenu` repeatedly **intercepts pointer events** on its parent `data-test-explorer-item-send-to` trigger, when both menus cannot fit beside one another in the mobile viewport. The source interaction was already real but the responsive overflow geometry was faulty; no skipped/relaxed tests.

**Actual fix:** [`1ad5ae9`](https://github.com/codersachin99/windows-os/commit/1ad5ae9db300ae0bd2b82360d98a3d40c3238e41) in `sourceExplorerSubmenuPlacement.ts` preserves source adjacent right/left submenu flip on desktop; if *neither* horizontal side fits and a vertical side fits, stacks the submenu entirely **below** or **above** the parent root menu (2px separation) instead of overlapping the clickable trigger. When no vertical room either, existing clamped fallback retained. Preserves the `side` API for existing source tests. Unit regressions cover narrow below/above, desktop flips and oversized child fallback. Added functional **375×667** browser test to `tests/e2e/source-explorer-send-to-desktop.spec.ts` verifying hover-open submenu leaves parent clickable and real Desktop path-backed shortcut creation. This explicitly fixes Win7 mobile as well as responsive menus in all themes; no source desktop geometry changed.

**Next source-backed Explorer task already committed:** [`a9631a0`](https://github.com/codersachin99/windows-os/commit/a9631a0b0397a52636d38ec41adfa475acf28f4b) changes Win8 and Win8.1 Computer/Bin native View select fallback to the **same icon-only eight-mode View menu with 0–7 slider** that original `legacy-win7/src/modules/apps/computer.js` renders for all themes. Adds `sourceWin8ComputerToolbar.css` scoped source `theme-win8-scss.js` `window-menubar asToolbar` and popup colors/hover, white 6px addressbar. [`9ea38b4`](https://github.com/codersachin99/windows-os/commit/9ea38b4ea8aa059f0b1280eb75dea1613c385dd0) adds Computer/Bin desktop+mobile actual browser tests and focused CI inclusion. Not pixel-complete; other themes and source screenshot pairs remain pending.

**Verification policy:** New `[run-ci]` exact-head checkpoint needed for all subsequent Win8 Personalize/Explorer popup/toolbar work and Win7 responsive submenu regression. Independent earlier [CI #44365340756](https://github.com/codersachin99/windows-os/actions/runs/44365340756) on `01eee83` passed TypeScript/unit/art/build but was still in focused browser when this note was written; it does **not** validate the Win8 Computer and submenu fix committed later. Inspect failed job logs, rerun all checks, preserve draft PR #1, immutable source SHA, main and release untouched.

---

## Windows 8/8.1 Personalize and context menus — verification checkpoint, 18 November 2026

- First Win8 Fullscreen Start/desktop/window source run [CI #44363167728](https://github.com/codersachin99/windows-os/actions/runs/44363167728) verified TypeScript, unit, source inventory, exact image SHA, Vite and focused desktop/mobile browser; full suite was still in progress when this checkpoint was initiated. That run is on `b7a30d2` and **does not** certify the new work below.
- Later code [`5e6dd2a`](https://github.com/codersachin99/windows-os/commit/5e6dd2a28a3904f373a52911fb7ab053609eb524) adds selectable Win8 and Win8.1 Personalize cards (original source wallpapers, theme switch persistence, tests); [`176923e`](https://github.com/codersachin99/windows-os/commit/176923e3bb0ab33f07f584367548679251b331d8) applies original Win8 `.winui-menu` style to Desktop, taskbar and Explorer; [`7c88bc4`](https://github.com/codersachin99/windows-os/commit/7c88bc4e41de17d78c6da80f2a9946957ce8457d) adds focused desktop/mobile computed-CSS and real action browser tests; [`e50c218`](https://github.com/codersachin99/windows-os/commit/e50c218ad87704c998f61c32f665d2fc7021764e) records source audit.
- New exact-head `[run-ci]` is being triggered for all these additional changes. Do not assume success; inspect jobs/logs and correct actual regressions, then update PR #1 draft. Maintain original immutable `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776` and target main unchanged; never merge/release or claim complete pixel parity.

---

## Original Win8/8.1 Desktop, taskbar and Explorer context palettes — 18 November 2026

- Original pinned `legacy-win7@26b9f0ce` **`theme-win8-scss.js .win8 .winui-menu`** uses `var(--theme-surface)`, **1px `rgba(0,0,0,.4)`** border, flat corners, **`4px 4px 3px -2px rgba(0,0,0,.5333333333)`** shadow, 1px **`#d7d7d7`** left gutter and **`rgba(146,200,253,.2)`** hover with **`0 0 0 1px #8acfff`** outline. Win81 uses the same Win8 popup family.
- [`176923e`](https://github.com/codersachin99/windows-os/commit/176923e3bb0ab33f07f584367548679251b331d8) implements source skins in `sourceDesktopContextThemes.css` for actual Desktop/icon and taskbar context and `sourceExplorerContextTheme.css` for Explorer root, item and submenu popups. React surface uses the original customizable CSS variable, with neutral fallback `#f0f0f0` until theme surface personalization is ported. No changes to Win7/XP/Win10/Win11.
- [`7c88bc4`](https://github.com/codersachin99/windows-os/commit/7c88bc4e41de17d78c6da80f2a9946957ce8457d) adds focused desktop/mobile actual-browser checks for both Win8 and Win81: source computed menu colors/borders/hover/outline, real Computer open, View → Details and Task Manager, and popup boundaries. Full CSS geometry, original account/search, all other theme ids and paired screenshots remain pending.
- Both changes were pushed **after** the Win8 [CI #44363167728](https://github.com/codersachin99/windows-os/actions/runs/44363167728) opt-in checkpoint. That run passed TypeScript/unit/asset/build/focused browser for the original Win8 Start but was still running the full suite when this note was created. New exact-head `[run-ci]` is required for Personalize and popup changes. Preserve pinned original, target main, draft PR, no release.

---

## Source-backed Win8 and Win8.1 selectable Personalize themes — 18 November 2026

[Commit `5e6dd2a`](https://github.com/codersachin99/windows-os/commit/5e6dd2a28a3904f373a52911fb7ab053609eb524) adds real Win8/Win8.1 theme cards to the existing Personalize app with source-pinned distinct wallpaper previews, `SET_THEME` and reload persistence; five source-backed cards now shown (Win7, XP, Win8, Win8.1, Win11), not a false 37-complete-theme claim. New unit and desktop/mobile browser test is in `model.test.ts` and `source-personalize-theme.spec.ts`. Previous Win8 [CI #44363167728](https://github.com/codersachin99/windows-os/actions/runs/44363167728) **passed typecheck/unit/assets/build and focused browser** at `b7a30d2`; its full browser suite was still running at documentation time. That run **predates this Personalize commit**. A new exact-head `[run-ci]` is required after the prior full browser suite resolves. Do not claim new card tests passed prematurely. Keep draft PR, pinned original and target main unchanged.

---

## Win8 exact-head CI checkpoint — 18 November 2026

- First Win8 opt-in [CI #44362853105](https://github.com/codersachin99/windows-os/actions/runs/44362853105) at `50b010e9` stopped at **TypeScript**, before unit/asset/build/browser: `packages/ui/src/DesktopShell.tsx:459 Cannot find name 'wallpaper'`. This was a real new-integration bug; do not describe that run as green or claim its unrun suites passed.
- [`9d8f72d`](https://github.com/codersachin99/windows-os/commit/9d8f72d6ce42bc201caaac02755f8a5a46749d14) passes **`state.wallpaper`**, the actual mounted Guest desktop background, into `StartMenu` rather than an out-of-scope identifier. This preserves original source Desktop preview showing current selected background.
- New exact-head opt-in **`[run-ci]` checkpoint pending**. Need review TypeScript + asset/gallery changes, 7 added Win8/Win81 browser tests across desktop/mobile, then full suite; fix remaining findings. Keep draft PR #1, pinned source, no release/merge.

---

## Windows 8 / Windows 8.1 full-screen Start, exact art and shell personality — 18 November 2026

**Previous checkpoint verified:** [CI #44351174157](https://github.com/codersachin99/windows-os/actions/runs/44351174157) **SUCCESS** on `c7c79e0`, including full TypeScript/unit/source inventory/artwork/Vite, focused browser and full desktop/mobile browser. That verification predates the following Win8 changes.

**New source-backed commits:**
- [`b59aded`](https://github.com/codersachin99/windows-os/commit/b59aded0295c5bac15113267c378096104dbc66a) adds **3 original Git-blob-identical Win8/Win81 images**, separate desktop wallpapers and Start-screen background, source asset audit, 10-photo gallery contracts.
- [`a8f22ac`](https://github.com/codersachin99/windows-os/commit/a8f22aceac4830981aa35a61549ddcf617e0755c) adds full-screen Win8/Win8.1 original source Start heading, double-wide Desktop, Computer/Games/Control Panel and up to six-app tile groups, Guest account and 420px dark Search flyout with actual Guest session actions.
- [`bd51ec5`](https://github.com/codersachin99/windows-os/commit/bd51ec56816015609bbc6419d49709767988b4e2) wires the separate full-screen `SourceWin8StartScreen` into existing Start/window lifecycle (real program context retained), passes active desktop wallpaper; no Win7/XP/Win10/Win11 rendering changes.
- [`8949bf0`](https://github.com/codersachin99/windows-os/commit/8949bf040bbfc8af21ed2329f4147ee898d54f2e) source Win8/81 desktop selection, theme-colored taskbar, **Win8 hidden 14px/26px touch Start** vs **Win8.1 visible 48px** with pinned SVG, flat 20px window caption/42px close.
- [`3aa7613`](https://github.com/codersachin99/windows-os/commit/3aa76138f0c82ede044365271b1b6b67751db3f6) and [`379dbad`](https://github.com/codersachin99/windows-os/commit/379dbadacdd3f3437d1c4a5ae8de0bb8b6b5d15f) desktop/mobile acceptance for Win8/81 actual Start/Shell and touch-aware corner size.

**Exact original source modules/SHAs/CSS values, test evidence, and explicit incomplete functionality** documented in [`migration/WIN8-SOURCE-SHELL.md`](https://github.com/codersachin99/windows-os/blob/feat/0001-faithful-react-foundation/migration/WIN8-SOURCE-SHELL.md). New `[run-ci]` required for this head. Keep PR #1 draft, legacy source pin `26b9f0ce`, main and release unchanged. Fix real CI failures and source-paired screenshots; do not imply pixel-perfect theme parity.

---

## Windows 10 source Organize/View toolbar rather than nonexistent Computer ribbon — 18 November 2026

- Previous full [CI #44346504203](https://github.com/codersachin99/windows-os/actions/runs/44346504203) **SUCCESS** at `ee92f99` (TypeScript, unit, source inventory and SHA, Vite, focused + full desktop/mobile browser) for context menus and original Win10 Computer/Bin art. This green run does **not** cover the following toolbar changes.
- Original `src/modules/apps/computer.js` specifically renders **`window-menubar asToolbar` with Organize and icon-only View popup**. Although generic `theme-win10-scss.js` has `ribbon__` rules, original Computer does **not** use a full ribbon. Do not port imagined ribbon tabs.
- [`738934c`](https://github.com/codersachin99/windows-os/commit/738934c4afa775f66673fc9ffc030e2323073af0) uses the existing real `SourceViewMenu` for Win10 Computer and Bin (eight source choices/192px vertical slider, shared Guest ExplorerSession); ports source white toolbar, original `#eee` Organize/View popup with `#90c8f6` hovered menu items, black navigation/status, details row separators. CSS is scoped to Win10 only; Win7/XP/11 unaffected.
- [`4eec318`](https://github.com/codersachin99/windows-os/commit/4eec31840adfd4e1e28a7ebca7ac653a8b84cd0c) adds focused desktop/mobile browser cases for actual Computer, Recycle Bin, view menu and keyboard action plus XP nonregression. [`aa2fd1b`](https://github.com/codersachin99/windows-os/commit/aa2fd1b73f0e5dcdfa24bc1570dbae8bf254c308) fixes test helper page typing before CI.
- Detailed pinned-source evidence, exact selectors/colors and explicit unverified fidelity: [`migration/WIN10-EXPLORER-TOOLBAR.md`](https://github.com/codersachin99/windows-os/blob/feat/0001-faithful-react-foundation/migration/WIN10-EXPLORER-TOOLBAR.md).
- New **`[run-ci]`** head validation pending; never fabricate test results or label pixel parity. Next: fix any e2e regressions, original-vs-React captures (read-only private-source token needed), XP/Win11 and remaining theme source widgets, then other Desktop/Start/Computer/Bin parity. Keep PR #1 **draft**, no changes to original `legacy-win7@26b9f0ce` or target main, no release.

---

## Source XP / Win10 / Win11 menu and Win10 Bin regression findings — 18 November 2026

**Verified CI evidence:** [`#44344993847`](https://github.com/codersachin99/windows-os/actions/runs/44344993847) at `d04c313`: TypeScript **success**, **655 unit tests passed**, legacy inventory **success**, source-artwork integrity **success**, Vite **success**, focused Playwright **294 passed / 2 failed**, full browser suite skipped. The two failures were the **same test expectation in desktop and mobile**, not CSS: `source-explorer-context-themes.spec.ts` still expected Win11 menu text `rgb(26,26,26)` for new Win10, whereas the original `theme-win10-scss.js` and actual React renderer correctly specify **black `rgb(0,0,0)`**. [`722f295`](https://github.com/codersachin99/windows-os/commit/722f295827f769d442fa446172bc6588845da7c6) corrects that source-specific expectation, keeping CSS and action tests strict.

**Additional functional source checks** [`32bb659`](https://github.com/codersachin99/windows-os/commit/32bb659cda2d5c3a9d76931f083bc9499d8ea66d) and [`b1334e5`](https://github.com/codersachin99/windows-os/commit/b1334e5800dcc8ef1a81feaef0af6bd0cfb2ab90): expanded existing XP/Win11 full Bin artwork test to **Win10 empty/full exact original Git blob art**, real Guest desktop upload, deletion, opened Bin navigation and Empty Recycle Bin; separately verify original Win10 Computer icon, actual Desktop folder (source `folder-win10.294665f0.webp`) and unknown-extension generic file icon (`file-win10.036601ed.webp`), and opening folder to a second real Computer window. Registered `theme-bin-artwork.spec.ts` in focused desktop/mobile gate.

This deliberate `[run-ci]` exact-head checkpoint must verify the corrected Win10 menu contract **and** new Bin/file tests, then the full desktop/mobile browser suite. **No completed test result is claimed for this new commit until run exits.** Keep PR #1 draft and source/main untouched; screenshot parity still unassessed (`86` React-only screenshots, original private checkout unavailable).

---

## Source XP / Win10 / Win11 Desktop, Taskbar and Explorer context skins — 18 November 2026

**Previous completed evidence:** Full [CI #44327673276](https://github.com/codersachin99/windows-os/actions/runs/44327673276) **SUCCESS** for original source boot mapping on `c61ed7d` (TypeScript, unit, original source/assets verification, Vite, focused and full desktop/mobile browser tests). [Visual capture #44328456992](https://github.com/codersachin99/windows-os/actions/runs/44328456992) **SUCCESS** at `b5006e5`: **86 target-only screenshots, zero errors, no source images** (optional private-source token missing); artifact `visual-parity-b5006e5c954af026265425348f8139ebe5aec2c4`. Do NOT declare visual comparison/pixel parity achieved.

**New source-backed work:** [`6f190c5`](https://github.com/codersachin99/windows-os/commit/6f190c52559a66663b49521874126564aa48a93f), [`de4fc44`](https://github.com/codersachin99/windows-os/commit/de4fc44595f9e245799b57af898bb43336282261), [`3da1c8f`](https://github.com/codersachin99/windows-os/commit/3da1c8f5d6697969de19bc00d31f048fd2186779), [`dfa7934`](https://github.com/codersachin99/windows-os/commit/dfa79346eac04816e5cf13483bd71e497555bf4e). Match original **XP/Win10/Win11 Desktop and taskbar context skins** and **Win10 Explorer background/item, View/Send-To child menus**. The source `theme-win10-scss.js` demands *light `#eee` / `#a0a0a0` / white hover*, never dark Start palette; original XP white with `#316ac5` hover and Win11 bright/rounded menu scoped. New browser specs check rendered computed CSS and actual menu commands for desktop/mobile. All other family shells remain pending. Detailed evidence in [`migration/SOURCE-CONTEXT-MENUS.md`](https://github.com/codersachin99/windows-os/blob/feat/0001-faithful-react-foundation/migration/SOURCE-CONTEXT-MENUS.md).

**New exact-head `[run-ci]` checkpoint required**, do not call new menus browser-verified yet. Keep user priority: desktop/Start/context/Computer/Bin and all source themes. PR #1 draft, pinned `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`; no edit to `main` or source; no release.

---

## Original boot renderer families / source artwork — 18 November 2026

**Previous exact-head verification:** Full [GitHub CI #44323413550](https://github.com/codersachin99/windows-os/actions/runs/44323413550) **SUCCESS** at `a918d6c9cf19e70c6dac277515ab648e42b74ba2`, including TypeScript, unit, original inventory, source image SHA, Vite build, **focused browser** and **complete desktop/mobile browser** suites. That successful run predates the newly committed source boot visuals and cannot certify them.

**New actual source changes** on `feat/0001-faithful-react-foundation`, original `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776` pinned:
- [`ea22849`](https://github.com/codersachin99/windows-os/commit/ea228491a7f12b1504a039727342103eb41c970d) imported **10 byte-for-byte original boot assets** (Win31, Win95, Win98, Win2k, XP, Vista, Win8, Win11, WinL and WinW) by verifying and reusing identical Git blob SHA. `scripts/import-source-theme-assets.py --verify-target-only` now includes the `boot` family by default.
- [`ffb4749`](https://github.com/codersachin99/windows-os/commit/ffb47496dae667ffbcd438cd3e85722f3ba1c949) rebuilt `BootScreen` with **four source-derived original renderer shapes**: Win31 5/6-height image; Win9x/2k/XP full-screen animated GIF; Vista/WinLS/WinW contained image; Win8/10/11 original 100px logo and 25px five-ball orbiter including source 4.4-second CSS keyframes/delays. Source `win10` uses the original **Win8 boot art**; theme aliases use `sourceThemeScreens(theme).boot`.
- [`54e0859`](https://github.com/codersachin99/windows-os/commit/54e085993a54ebe566d0a50d60bd1268019b57df) adds React SSR unit contracts for **all 11 supported source boot family IDs**, original URL mapping, Win81/XP subvariants/Win11dark/WinLP aliases, five spinner elements and explicit fallback.
- Full source SHA table, original module references, supported/unported families and remaining pixel/timing gaps: [`migration/SOURCE-BOOT-FAMILIES.md`](https://github.com/codersachin99/windows-os/blob/feat/0001-faithful-react-foundation/migration/SOURCE-BOOT-FAMILIES.md).
- **Source default unchanged:** `app.config.json defaults.skipBoot:true`, so regular browser runs still start at unauthenticated Guest **logon**; enabling the optional animated boot cannot bypass Guest login. Retained existing 1,800ms React completion timer is not declared source-equivalent. Original paired screenshots and other eight boot families remain pending.
- **New exact-head `[run-ci]` required**, no fabricated test success or visual parity. Keep PR #1 draft; no main edits or release. Next original source-paired Desktop/Start/context/Explorer/Bin screenshot parity and remaining theme UI work.

---

## Win10 focused desktop/mobile browser findings and repairs — 18 November 2026

**Actual verification evidence:** earlier [CI #44321719275](https://github.com/codersachin99/windows-os/actions/runs/44321719275) was **TypeScript/units/source inventory/artwork/Vite success, focused browser failure: 8 tests failed**. [CI #44322185627](https://github.com/codersachin99/windows-os/actions/runs/44322185627) was **TypeScript/units/source inventory/artwork/Vite success, focused browser 276 passed/6 failed** after the first gallery-spec update, with full browser suite skipped. Do not claim these runs green.

Six failures (three per desktop/mobile) at `3220ea4` were grounded by the actual browser job log:
1. `source-cpanel-program-launch.spec.ts` still expected 7, now source-added eighth original Win10 system wallpaper; [`fa922fa`](https://github.com/codersachin99/windows-os/commit/fa922fa71e21b77f5014e8e838895e5d2b5e1138) updates this **additional** browser contract to 8 and checks exact Win10 image URL.
2. `source-win10-shell.spec.ts` expected a 5px Show Desktop divider, but Chromium measured 13px because native button padding/min-content survived despite a CSS width declaration; [`fa922fa`](https://github.com/codersachin99/windows-os/commit/fa922fa71e21b77f5014e8e838895e5d2b5e1138) fixes the **actual layout** with explicit `box-sizing:border-box`, `min-width`, `max-width`, `padding:0` plus source 5px flex basis. Test remains strict about 5px.
3. `source-win10-start.spec.ts` erroneously expected only one Computer window after opening Documents via Win10 Start; original runtime explicitly allows independent multiple Explorer windows and the UI correctly rendered two. Same commit corrects test to assert **two** real Computer windows, with the new one active rather than weakening or changing the real Guest window behavior.

The prior [`299498a`](https://github.com/codersachin99/windows-os/commit/299498a6090a92e1af8b74a2454bdb886454f327) source-backed Start icon test update also reflects that Games and Control Panel are **sidebar commands** (not Start program-list registrations), so it tests those actual original positions. `source-personalize-background.spec.ts` now validates 8 original system wallpapers (previous [`040cc40`](https://github.com/codersachin99/windows-os/commit/040cc4070e1b75624dccced16bf6c5f360e7fcaa)).

**This single deliberate `[run-ci]` exact-head checkpoint** tests *all* corrected source assertions and the Win10 Desktop/Start work; wait for TypeScript, all unit, asset SHA/audit, Vite, focused desktop/mobile 280+ browser tests and the full desktop/mobile suite. Report any further failures accurately and fix before calling the new source shell CI-verified. No source/main modification or release; PR #1 remains draft. Pixel-paired original screenshot tests, all Win10 taskbar popups and other variants' boot/Start/desktop skins are still pending.

---

## Win10 imported wallpaper — browser acceptance correction — 18 November 2026

- The second exact-head [CI #44321719275](https://github.com/codersachin99/windows-os/actions/runs/44321719275) at `efc652b` already passed TypeScript, all unit tests, original source inventory, byte-identity source-art audits and Vite build. Browser suites were running at the time of this note; that head's `tests/e2e/source-personalize-background.spec.ts` still expected **7** backgrounds despite importing an eighth exact original Win10 wallpaper.
- [`040cc40`](https://github.com/codersachin99/windows-os/commit/040cc4070e1b75624dccced16bf6c5f360e7fcaa) corrects the *browser* contract to demand **8** byte-imported system background options, including exact `win10.743e8c13.webp`, while retaining source Save/Cancel behavior and the existing Win7/XP cases.
- This deliberate `[run-ci]` exact-head checkpoint verifies Win10 shell and Start browser interactions, source artwork, Guest desktop and existing application tests **after** all test expectations have been updated. This is not a claim of full original visual parity or completed Win10 theme.
- Next: fix any remaining focused/mobile/full browser failure, make source-paired screenshots for Win7/XP/11/10 Desktop, Start, context menus, Computer/Bin; verify the 19 boot screen families. PR #1 remains draft; no source or main edits, no release.

---

## Win10 exact-head CI unit contract follow-up — 18 November 2026

The first Win10 Desktop/Start [CI #44321034075](https://github.com/codersachin99/windows-os/actions/runs/44321034075), exact-head `47e482d`, passed TypeScript but **failed two outdated unit expectations**; source/art audits, Vite, and browser steps were skipped (not a code-build verification). Both failures arose from deliberately migrated **original** source assets: `sourceShellArtwork.test.ts` incorrectly still treated Win10's Start/Computer/Bin artwork as unported, and `personalize/src/model.test.ts` expected the gallery to omit the newly imported byte-identical original Win10 wallpaper.

[`f87e6e2`](https://github.com/codersachin99/windows-os/commit/f87e6e2a473ccccb0f75b6edd0f28ccb36caba99) updates these **tests to assert actual source behavior**, not to disable tests: Win10's unusual original Win8 start-button SVG, Computer and both Bin states, file/folder artwork, original Games/CPanel and wallpaper URL and exact gallery order. Unported other themes still must return `null` and Win7 remains unchanged.

This deliberate `[run-ci]` checkpoint is required to verify the *new* exact head. Resolve any TypeScript, unit, art SHA/audit, Vite or focused/full desktop/mobile Playwright failure before claiming the Win10 shell slice passed. Original visual screenshot parity and all 19 source boot families are still pending, PR #1 remains draft, main and immutable source remain unchanged.

---

## Windows 10 desktop, taskbar, window controls, Computer/Bin, Start menu — 18 November 2026

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`; original repository, target `main`, existing PR draft and release history untouched.

- [`ed1fa17`](https://github.com/codersachin99/windows-os/commit/ed1fa179c3dafb920bce3a755fcdb043efd3b241) imports 8 **byte-identical original** Win10 images from source `icons.registry.json`, including the surprising official Win10 mapping `start-button-win8.2e5214cc.svg`, plus Computer, both Bin states, folder, file, Games and Control Panel. Wallpapers and visual asset registries now select the Win10 originals for Desktop/Explorer and Start programs.
- [`c0411ef`](https://github.com/codersachin99/windows-os/commit/c0411ef872855b2b18205e3f666a87cb7e42e04a) adds source theme Win10 dark `#101010` taskbar, top-window active button/underline based on live Guest z-order, Win10 desktop selection rules, and source-white square windows with **44×28** controls and `#e81123` close hover; new browser source chrome/Computer/Bin test in the targeted gate.
- [`6485fd3`](https://github.com/codersachin99/windows-os/commit/6485fd346f275991f81214e22fd867ca2b052ba1) adds source `startmenu-win10.js` rail/list/tiles organization with 430px dark panel, hover/touch-expand 48/200px sidebar, real Guest account/power/computer/games/cpanel actions and recent-app tiles, plus responsive adaptation and two new browser tests.
- [`2e86a8f`](https://github.com/codersachin99/windows-os/commit/2e86a8fb2bb23ff454048548fa9ce5e5d2826a3c) fixes original Computer/Bin art used in Start tiles/program list. Tests cover active program launches and inherited original icon URLs.
- Detailed source references, original blob SHA table, CSS values and explicit acceptance gaps: [`migration/WIN10-SOURCE-SHELL.md`](https://github.com/codersachin99/windows-os/blob/feat/0001-faithful-react-foundation/migration/WIN10-SOURCE-SHELL.md).

**Verification:** previous [exact-head CI #44312389355](https://github.com/codersachin99/windows-os/actions/runs/44312389355) was **SUCCESS** (TypeScript, unit, source inventory, original artwork, Vite, focused and full browser desktop/mobile) for the earlier Photo/Win8/Win10-*logon* checkpoint `9e47848`. That green result **does not cover** the new Win10 Desktop/Start commits. This deliberately triggered `[run-ci]` checkpoint tests the new exact head including two new targeted desktop/mobile browser specs and whole suite; report any failures without claiming success until completion.

**Priority after CI:** fix any new regression, then resume original-versus-React screenshots of taskbar, Desktop, Start, Explorer/Bin and source theme families. Win10 visual/app/audio/power animation parity remains pending, as do XP/11 and all other themes. Keep PR #1 draft, never release/merge docs-only or failed work.

---

## Win8/8.1 and Win10 original source logon adapters — 18 November 2026

**Source lock unchanged:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`; source and `windows-os/main` untouched. PR #1 stays draft, no release.

- [`723bd6f`](https://github.com/codersachin99/windows-os/commit/723bd6f726ef31fcb810212e96208046b0fd3b7c): Win10 original login-family renderer replaces Win7 fallback, sharing the 150px `guest-win10` avatar and translucent overlay from `logon-win10.js` with Win11 while retaining its own source `win10.743e8c13.webp` background and square-button source styling. The new wallpaper blob `988278e48d41f10f2f701c748d73595f700b75c0` is byte-identical to pinned legacy.
- [`d513860`](https://github.com/codersachin99/windows-os/commit/d5138600d6b3c84f3045f35eed73347c4dc9aab0): original-family Win8/8.1 Guest logon adapter with source purple `#180053`, group layout, original SVG-arrow motif and 150px `guest-win8.265e68f5.webp` avatar. The source-target blob `060bcb7d2327f85c3f51bc33d2704072e86df578` matches exactly. Both theme IDs preserve Win8 login family; responsive Guest, unavailable account-backend and power actions are regression-tested.
- Original binary asset verification includes both files. **9/19** original screen families now have incremental source-shaped Guest logons; **10/19** still use documented Win7 fallback. **All original boot animations and complete Win8/10 shell/Start/Explorer/theme pixel parity remain pending.** Whole-theme completion and original account registration are not claimed.
- Prior [CI #44289346899](https://github.com/codersachin99/windows-os/actions/runs/44289346899) finished **699 passed, 1 mobile Photo Viewer failed, 2 skipped** in its full browser suite (270 focused passed). [Fix `1dc5fdd`](https://github.com/codersachin99/windows-os/commit/1dc5fdd75e2a78d66d17dbe96fd8a137f5d14aed) now decodes actual image intrinsic dimensions and serializes asynchronous rotated-photo save/navigation; the Photo browser spec was added to the focused gate in [`6e752b7`](https://github.com/codersachin99/windows-os/commit/6e752b7f91e479cf2a0363a0349e553f0690eb2c). [Opt-in run #44311354270](https://github.com/codersachin99/windows-os/actions/runs/44311354270) is for that **earlier** head and cannot verify today's new theme commits.
- **This checkpoint intentionally includes `[run-ci]`** to verify the new exact head once: TypeScript, Vitest, pinned original-source inventory, original art blobs, production build, focused desktop/mobile Playwright (including Photo and classic/modern logons), then full browser suite. Do not claim verified until this run completes.

**Next priority:** repair any new CI failure, then source-pair fixed viewport logon/desktop screenshots, restore Win7/XP/11 desktop, Start/context and Computer/Bin pixel/behavior parity, and port each remaining original family without collapsing variants. Keep PR draft, never modify source lock or merge/release prematurely.

---

## Photo Viewer mobile save/navigation regression repair — 18 November 2026

**Source remains pinned** at `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. The previous classic-theme exact-head opt-in [CI #44289346899](https://github.com/codersachin99/windows-os/actions/runs/44289346899) **failed** after: TypeScript, Vitest, immutable source/art audits, Vite and **270/270 focused browser tests all passed**; full desktop/mobile Chromium ended **699 passed / 1 failed / 2 skipped**. The sole failure was mobile `tests/e2e/photo.spec.ts:37`: after rotating `a.png` 90° then clicking Next, Photo Viewer stayed on `a.png` rather than navigating to `b.png`. No claim that the prior exact head was fully green.

[`1dc5fdd`](https://github.com/codersachin99/windows-os/commit/1dc5fdd75e2a78d66d17dbe96fd8a137f5d14aed) repairs a real risk in the asynchronous photo navigation path:
- Save rotated canvas using the currently mounted HTMLImageElement's **actual intrinsic width/height**, waiting for decode when necessary, instead of depending exclusively on the last asynchronous React `onLoad` state snapshot.
- Serialize pending navigation with a ref, temporarily disable image controls while canvas encoding and Guest file write are in flight, and prevent repeated mobile taps from starting conflicting writes to the same image.
- Preserve safe abort when image decoding/format conversion fails: never silently replace an original unsupported-format file with mismatched image data; after a successful save, next/wrapped photo navigation and title still proceed.
- Browser test now verifies next image intrinsic size and absence of save error, as well as the existing rotated 2×3 result when returning to the original file.

**This `[run-ci]` checkpoint** adds `tests/e2e/photo.spec.ts` to the fast focused desktop/mobile gate before the full suite. All new Photo changes require TypeScript, unit, source/art, Vite, focused browser and full browser success before acceptance. This addresses a plausible load/save race from evidence; it **does not yet establish** which browser asynchronous step caused the observed one-off mobile failure. Keep the PR draft until verification. No changes to `legacy-win7` or `windows-os/main`, no release.

**Next priority:** fix any further CI failures. Then compare original source-vs-target theme screenshots and complete Win7/XP/11 desktop, Start/context and Computer/Bin interactions, while migrating all catalogued themes. Avoid repeated always-on CI.

---

## Classic Win31/Win95/Win98/Win2k source Guest logons — 18 November 2026

**Active pinned reference remains** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`; original source and `windows-os/main` are unchanged. Existing draft PR #1 remains intentionally unmerged and no release has been published.

- [`5fdb65b`](https://github.com/codersachin99/windows-os/commit/5fdb65bd46096d8276107c144fea3e1e02294f4a): introduced a reusable `SourceClassicLogon` React family adapter for **Win31, Win95 and Win98**, matching pinned source `logon-window` / `logon-form-win9x` screen routing, source Win31 grey backdrop / 40% window placement, Win9x 30% placement, 500px classic pane, authentic existing Guest entry and honest unavailable-account login panel. Added source-ID/Guest/power/responsive Playwright coverage and targeted CI inclusion.
- [`f67b24a`](https://github.com/codersachin99/windows-os/commit/f67b24a129e7e1ea8146c51b0480853c54089397): extended same shared adapter to **Windows 2000**: original `src/modules/themes/logon-win2k.js` banner / hidden avatar, `logon-win2k.css` blue `#3b6ea4` backdrop, top 20% / 32rem window, six-pixel blue gradient. Original `logo2k.15140c8b.webp` imported binary-identical to source Git blob `028a0e1cd4f9eab7c472482312189eeecd0fc0df`, and added to source artwork verification.
- The active 36-config-entry/19-family theme catalog plus canonical Win7 is retained. The new 4 original logon families are **incremental Guest adapters**, not complete source-parity themes. Other screen families still use explicitly labelled Win7 fallback; source-specific boot animations, all old-family desktop/taskbar/Start/Explorer styles and source-paired screenshot measurements are not accepted.
- The final Win9x `--logon-bg` variable value still needs to be traced from the pinned compiled theme config; the current teal background is an explicitly provisional classic adapter, **not confirmed color accuracy**. Account registration/authentication and any social provider are likewise not faked.
- Prior exact-head [CI #44283674420](https://github.com/codersachin99/windows-os/actions/runs/44283674420) **completed success** on previous `d9972e8`, including typecheck, unit, immutable source/art audits, build and browser tests. That result **does not verify** the new Win31/95/98/2k commits.
- **This checkpoint commit carries `[run-ci]`** to opt in to TypeScript, unit, source/asset audit, Vite build, focused desktop/mobile classic screen browser tests, then complete browser suite. Read the exact resulting run conclusion before claiming the new head is green. Never run always-on Actions.

**Next highest priority:** repair any new CI failure first. Then capture side-by-side **pinned legacy vs React** logon screenshots on desktop/mobile, reconcile Win9x configured background and original form/active-window state; continue Win7 Desktop/Start/context/Computer/Bin priority alongside other original boot/logon families and eventually every desktop theme. Keep PR draft, preserve all themes and functionality, no premature main merge or release.

---

## Exact source login artwork audit added — 18 November 2026

- `26457dd` extends `scripts/import-source-theme-assets.py`
  source SHA table with `logoxp.9b034658.png` Git blob
  `33b3bca96d3c07994b096bf13d2a87a6a05b1196` and
  `guest-win10.a110df5a.webp` Git blob
  `57caee256e62a46271db867a088f49b1981bbc7d`.
  Now the existing CI **Verify byte-identical original theme artwork**
  step checks the newly imported login assets too, not just
  the previous XP/Win11 icons.
- This `[run-ci]` checkpoint revalidates the current exact head after
  the artwork audit was strengthened. Check TypeScript/Vitest/hash
  audits/build/focused browser and full browser status. No releases,
  PR draft. Earlier source login CI
  [#44283291889](https://github.com/codersachin99/windows-os/actions/runs/44283291889)
  passed TypeScript/unit/art audits/Vite through Chromium install
  at the time of writing; it did **not** contain this audit-table
  addition.

---

## XP/Win11 source-backed Guest logon renderers and CMD restart regression — 18 November 2026

**Source pin:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
All **36 original `defaults.themeScreens` entries / 19 families**
remain pinned in the shared catalog and documented in
`migration/ALL-SOURCE-THEMES.md` (plus canonical `win7`).
No source repository or WindowsOS main-branch changes.

### Actual migrated source code and artwork

- `dea81a7`: copied original `assets/images/logoxp.9b034658.png`
  (source Git blob SHA `33b3bca96d3c07994b096bf13d2a87a6a05b1196`)
  and `assets/images/guest-win10.a110df5a.webp`
  (source Git blob SHA `57caee256e62a46271db867a088f49b1981bbc7d`)
  into `apps/web/public/assets/images` with **byte-identical
  Git hashes**. No generated/substitute art.
- `f71b8e9`, `f4b7184`: real React source XP login structure
  from `src/modules/themes/logon-winxp.js`:
  two 13%-height dark blue regions, radial blue middle background,
  logo and prompt on left, divider, clickable Guest row on right;
  responsive narrow viewports. Dedicated Win11 login structure from
  `src/modules/themes/logon-win11.js` and `logon-base.js`:
  original Win11 wallpaper, original 150px guest-win10 avatar,
  black/50 overlay, centered Guest and login action; source-like
  translucent buttons and mobile-safe dimensions. Source login
  family routing also covers XP color variants and Win11-dark.
- `41c1948`, `76d8892`, `7ef17e4`: centralize source art in
  `sourceThemeLogonArtwork`, use it in React and test exact asset
  contract. Retain `data-test-avatar="win7"` as a compatibility
  action selector; `data-source-logon-renderer` now reports
  `winxp`/`win11` for actually implemented views and
  `win7-fallback` for the other original screen families.
- `ff5353a`: desktop/mobile Playwright checks source XP logo,
  three-band CSS, Win11 source guest/wallpaper/overlay, selected
  theme passing through explicit Guest login, power options and
  honest unsupported account backend behavior.
- `c13ae2e`, `7add53d`: source theme matrix and complete theme
  inventory updated with concrete implementation status and remaining
  screenshot/boot/auth parity gaps.

### CI regression discovered and fixed

- Previous [source startup CI #44279822077](https://github.com/codersachin99/windows-os/actions/runs/44279822077)
  passed TypeScript, unit/source/artwork/production build and **208
  targeted browser tests**, but failed the full browser suite with
  **682 passed, 2 failed, 2 skipped**. Both failures occurred in
  `tests/e2e/cmd-source-files.spec.ts` (desktop/mobile): after clicking
  simulated BSOD, the test still expected a boot screen, contradicting
  final `skipBoot=true`. This is an obsolete expectation, not a
  request to reintroduce the old boot animation.
- `c82bedb` changes the source CMD BSOD click test to assert
  **BootScreen absent, Guest Logon present, Desktop absent before
  authentication**, then explicitly click Guest to enter desktop.
  `f2397a0` includes CMD source tests in focused opt-in CI.
- [Previous catalog CI #44281267348](https://github.com/codersachin99/windows-os/actions/runs/44281267348)
  already passed TypeScript, unit, source audit, Vite build and
  focused browser; full suite was in progress at note time.
  [Recent Start CI #44278251054](https://github.com/codersachin99/windows-os/actions/runs/44278251054)
  is complete **success** on its older head.

**This handoff `[run-ci]` commit triggers a NEW exact-head gate**
covering original XP/Win11 login, source art, safe theme catalog,
corrected CMD/BSOD restart, Vitest, TypeScript, Vite, 2D browser
desktop/mobile focused then full. Do not claim successful verification
until the new run completes. Screenshot reference parity, original
per-theme boot animations and 16 other login families remain pending.
No merge, tag or release; draft PR #1 continues.

### Next task

Fix any exact-head CI failures first; compare source/React XP and Win11
login screenshots at desktop/mobile sizes, then migrate source-specific
remaining login/boot families. Maintain original desktop/context,
Start menu and Computer/Recycle Bin highest priorities. Avoid
always-on CI; only deliberate `[run-ci]` commits.

---

## Full final-source theme catalog and screen routing — 18 November 2026

**User clarified: WindowsOS must migrate ALL original themes, not just XP/Win7/Win11.** Source remains pinned to
`codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
Exact `app.config.json defaults.themeScreens` has **36 named entries
grouped into 19 boot/logon screen families**, plus the canonical
React/original shell `win7` ID, for 37 recognized runtime IDs.
The full list and family breakdown is in
`migration/ALL-SOURCE-THEMES.md` (including all Aero/Basic/XP variants,
Win31/95/98/2k/Vista/8/8.1/10/11dark, macOS, ChromeOS,
Ubuntu/Kubuntu, winLS/winLP, Aero Noir, Oxygen, winW, OneBit).

**Source-backed code committed on this feature branch:**
- `dab82d5`, `95cfb9e`: exact source screen map plus a complete,
  typed `ThemeId` contract; no collapsing of variants; explicit
  `sourceThemeShellStatus` distinguishes partial (Win7/XP/11) from
  pending themes. The catalog is **not** a visual parity claim.
- `ec0c187`: source testmode theme selection and persisted values
  now validate against all literal known IDs, never arbitrary strings,
  URL paths or unsafe object property names.
- `dba683f`, `265ed9c`, `8efbae8`: unit tests for source
  36-entry map, 19-family aliases, exact variant casing, invalid
  theme protection, and persisted/testmode theme handling.
- `cd86490`, `0c235ee`, `328d4a1`: Boot, Guest Logon, Switch User
  now receive the selected original source theme and its configured
  `boot`/`logon` screen family. **Until source-specific view
  components/assets are migrated**, the existing Win7 markup remains
  the visual renderer; `data-source-*-renderer="win7-fallback"`
  explicitly reveals this gap. No pretend XP/Win11/macOS UI.
- `3c3c464`: desktop/mobile Playwright checks original family mapping,
  honest fallback state, canonical Win7 logon, arbitrary-ID rejection,
  and explicit Guest authentication for Win11-dark source theme.
- `ee00a6a`, `c154844`, `d1ab919`: theme inventory, focused
  browser gate, and final-source parity matrix updated.

**This handoff commit uses `[run-ci]` to request the new exact-head
TypeScript, unit, source integrity, byte-identical source artwork, Vite
and focused/full desktop/mobile browser tests.** The earlier source
Win7 recent Start [#44278251054](https://github.com/codersachin99/windows-os/actions/runs/44278251054)
and startup [#44279822077](https://github.com/codersachin99/windows-os/actions/runs/44279822077)
were still running the full browser suite at the time this entry
was written. Do not call this new head accepted until its run
concludes successfully.

**Next priority:** fix CI regressions, then port exact source
boot/login views and assets for XP/11 and all other theme screen
families via reusable adapters; preserve Win7 Desktop/Start/context
and Computer/Bin priority. Run source-vs-React screenshots before
claiming pixel perfection. No original-source changes, no
main merge/release, PR #1 stays draft.

---

## Source-final startup defaults (skipBoot true, nativeCursor true) — 18 November 2026

**Source remains immutable and pinned:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
Verified source `app.config.json` `defaults.skipBoot=true` and
`defaults.nativeCursor=true`. `src/modules/shell/boot.js` explicitly
uses `shouldSkipBoot` to suppress `showBooting` and accelerate `bootup()`,
which finally emits `changeView: Logon` (unless installer). **It does
not authenticate Guest or skip the login screen.**

- `9985dc5`: `packages/engine/src/index.ts` final configuration
  `LEGACY_DEFAULTS.skipBoot=true,nativeCursor=true`; independent
  `sourceInitialPhase(skipBoot)` correctly chooses `logon` when
  skipping the animation and `boot` when disabled, **never desktop**.
  `initialDesktopState({skipBoot:false})` preserves an explicit
  animated-boot path. React browser UI already uses the system/native
  cursor (no fabricated cursor implementation).
- `add9efb`, `727f00f`: Vitest covers final unauthenticated
  Logon startup, normal BootComplete when boot is enabled, inability
  to launch an app before Guest authentication, and BSOD/restart landing
  back at Logon without bypassing the profile.
- `087d540`, `91ed46d`: desktop/mobile browser shell tests enforce
  final default without BootScreen and no early Desktop, exact Guest
  original wallpaper/shell after selecting Guest, and restart from
  shutdown requiring another explicit Guest login.
- `c63426c`: shell startup test is now in focused opt-in CI; the
  complete desktop/mobile suite continues afterward.
- `f3bc985`: migration reference matrix reflects implemented skip
  and native-cursor defaults while retaining clear remaining gaps.

**Original Win7/XP/11 theme screen mapping still unverified.**
The final `themeScreens` dictionary maps Win7 → Win7, XP → XP,
Win11 → Win11 boot/logon views, but React's visual LogonScreen is
still the prior Win7 shell for all supported themes. Do not call
the theme visual migration complete without separately porting
`src/modules/themes/logon-winxp.js`,
`src/modules/themes/logon-win11.js`, their original CSS/assets,
screen mapping and paired source-vs-target screenshot tests.
The optional animated React BootScreen remains an existing adapter,
not the complete original per-theme animation.

**CI:** [previous exact-head Win7 recent Start run #44278251054](https://github.com/codersachin99/windows-os/actions/runs/44278251054)
had passed typecheck, unit, integrity, artwork and focused browser
tests, with its complete browser suite still in progress at the
point of this handoff. **This `[run-ci]` commit requests a new
exact-head run** to verify startup changes; check full results
before accepting the new SHA. Avoid CI on ordinary commits.

**Next:** fix any new CI failures first; finish XP/11 source logon and
boot-theme view mapping, then Start/search, desktop context menus,
Computer/Bin, and permissioned mapped directories. Draft PR #1
unmerged, WindowsOS main and legacy source unchanged, no release.

---

## Verified previous milestone and Win7 Start recent-app source reconciliation — 18 November 2026

**Previous exact-head milestone accepted by automated CI:**
[CI #44256365987](https://github.com/codersachin99/windows-os/actions/runs/44256365987)
on `95bf7ce34ba5834d3137c6fc6fc380c7ee03888e` completed **success**:
TypeScript, unit tests, source-inventory integrity, original byte-identical
artwork, Contacts source audit, Vite build, focused desktop/mobile browser
suite and complete desktop/mobile browser suite. That acceptance **does not
mean pixel-perfect themes/screenshots or full functional migration**.

**Current Win7 Start source slice:** final source pinned to
`codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
Original `src/modules/shell/startmenu-base.js` renders
`data-test-list-recent` while not searching or showing All Programs.
Existing React Start menu only exposed its recent history on XP and Win11.

- `bc33bcf`: enable source Guest recent-program section in Win7 Start,
  reusing the already migrated `sourceRecentPrograms` (no host-program
  history, no new storage schema). Existing source-installed app launcher
  compatibility grid retained to prevent temporary loss of working apps
  while the original Win7 Start composition is still incomplete.
- `67f621b`: scoped Win7 recent area, source-like hover/focus, icons,
  bounded scroll area and separator; remains an interim CSS adapter until
  source-paired screenshots for XP/Win7/Win11 are accepted.
- `81064df`: desktop/mobile browser test verifies Win7 empty-to-recent
  history, Notepad-before-Calculator order, All Programs separation,
  profile persistence across browser reload, and clicking a real recent
  app to reopen it.
- `0db1310`: `migration/FINAL-SOURCE-BASELINE.md` updated with
  explicit newly migrated behavior and remaining Start pixel gaps.

**This commit is deliberately `[run-ci]`:** check the exact new head's
unit, type, inventory, Vite, focused browser including recent/start and full
desktop/mobile browser conclusions. Any failure requires a repair before
an acceptance claim. The old baseline is historical only and original
`legacy-win7` source was not changed.

**Next priority:** verify CI; continue Win7/XP/11 original Start
visual contracts, desktop/context menu, Computer/Bin source behaviors,
and permissioned mapped-directory integration. Draft PR #1 remains
unmerged, WindowsOS main unchanged, no release.

---

## Final source taskbar singleton title regression and app alias registry — 18 November 2026

**Active reference remains locked** at `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
The old `4e63290d` pinned reference is historical; `migration/SHELL-PRIORITY.md` now labels it explicitly. Source repo was not modified.

**CI evidence before this work:**
- [CI #44249449912](https://github.com/codersachin99/windows-os/actions/runs/44249449912) on `813c9e1` passed TypeScript, unit tests, source inventory, byte-identical artwork, Contacts audit, Vite build and **188/188 focused desktop/mobile Chromium tests**.
- Full Chromium had **676 passed, 2 failed, 2 skipped out of 680**. The failures were the same Notepad dirty-title minimize/restore test on desktop and mobile. Exact cause was the new grouped taskbar always generating the ARIA button label from the program name `Notepad`, when a single running instance had a dynamic window title `*Untitled - Notepad`. The program window and its unsaved document remained present; Playwright could not find the old uniquely titled switcher.

**Pushed fix and focused acceptance:**
- `337d287` — single-instance unpinned grouped taskbar buttons expose `Switch to ${win.title}`, while multiple windows retain their program-level group name. No extra app instance or document reset is involved.
- `f47d9b4` — new Playwright acceptance: Notepad dirty title, single window group, minimize/restore, original CodeMirror content remains, close confirmation. `8473dd5` — moves the existing `notepad.spec.ts` into opt-in focused CI to catch this regression before the complete suite.

**New final-source app registry reconciliation:**
- `be89029` — source `src/config/app.registry.json` alias catalogue for 13 source entries. Only aliases with currently migrated app launch semantics are enabled; unported programs and Explorer folder-path aliases are retained as reference data but deliberately not falsely activated.
- `7a9d621`, `fd1f979` — alias contract and collision-validated `AppRegistry` with safe case-insensitive lookups for migrated apps (e.g. `calculator` → `calc`, `control` → `cpanel`, `winver` → `about`, `explorer` → `computer`, `sysdm.cpl` → `system`). `sticky.allowMultipleWindows=false` now explicitly comes from the final registry policy as well as the existing shell singleton guard.
- `1250e03` — Vitest for source aliases, absence of fake unported apps, case-insensitive resolution, duplicate names, unsafe paths, and retained installed app count.
- `eb3a854`, `4beb7ca` — updated active baseline matrix and historical shell-priority checkpoint.

**This handoff commit with `[run-ci]` triggers exact-head opt-in CI.** Validate TypeScript, unit, fixed source asset checks, Vite build, focused Playwright including Notepad and full desktop/mobile suite before claiming accepted status. This is not evidence of end-to-end pixel-perfect parity.

**Next:** repair any new CI failure; prioritize original Win7/XP/11 visuals, desktop context/Start and Computer/Bin remaining items (mapped-directory permission adapter, source registry shortcuts, original icon and theme screenshot comparisons). Draft PR #1 unmerged, no release, WindowsOS main unchanged.

---

## Final source Computer checkbox reconciliation — 18 November 2026

- Pinned source `legacy-win7@26b9f0c` has `features.showItemCheckboxes=false`; source `src/modules/apps/computer.js` explicitly gates touch-selection checkbox rendering on this flag.
- `bdc5a38`, `17d947b`: shared final source SDK flag and React Computer/Bin Explorer suppression, preserving normal file selection.
- `6423a1b`, `bf33057`: replaced obsolete touch-checkbox Playwright expectations and added desktop/mobile regression to focused CI.
- `6265eca`: updated `FINAL-SOURCE-BASELINE.md`.
- [CI #44247665104](https://github.com/codersachin99/windows-os/actions/runs/44247665104) had **183/184 focused browser tests passing**, with one real-window selector collision from the thumbnail DOM clone; fixed in `b353511` plus `f1cc1e0` browser assertion. [Follow-up #44248902140](https://github.com/codersachin99/windows-os/actions/runs/44248902140) is historical for the previous head. This `[run-ci]` commit verifies the **new** exact head including Explorer changes.
- Next: verify exact-head CI; source theme previews, context/Start/Computer/Bin, then permissioned mapped directories. No main merge/release; PR #1 stays draft.

---

## Exact-browser regression repaired; Desktop submenu keyboard parity — 18 November 2026

- Exact pinned source is still `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`; no source-branch modification.
- [CI #44247665104](https://github.com/codersachin99/windows-os/actions/runs/44247665104)
  **failed 1 of 184 targeted desktop/mobile Chromium tests (183 passed)**
  after TypeScript/Vitest/source-inventory/theme art/Vite all passed.
  Root cause: new `cloneNode(true)` thumbnail accidentally duplicated the
  real `data-test-window-id` selector and semantic `role=dialog` identity,
  so the peek assertion matched both real and inert cloned windows.
  Full suite skipped after focused gate failed. Do not call it green.
- `b353511`: sanitize cloned thumbnail tree: remove duplicated
  `id`, `name`, `role`, `aria-label`, `data-test-*`.
  Preserve the real Guest window selectors and accessibility.
- `7eff7f2`: use source theme-specific program icons in hover cards;
  click on the entire card, including its title bar, activates the original
  mounted Guest window; close button stops bubbling as in final source.
- `f1cc1e0`: Playwright regression verifies exactly **one**
  `data-test-window-id` element for each running window during preview.
- `4f4cc82`, `aa3d2ef`: Desktop View, Sort by, and New
  keyboard ArrowRight/ArrowLeft submenus remain mutually exclusive;
  browser test verifies original menu focused child and restored parent
  after ArrowLeft without mixing options. Prior menu layout and
  rename/Explorer behavior are preserved.
- This handoff `[run-ci]` commit requests **exact-head**
  typecheck, Vitest, original-source inventory/artwork, Vite,
  focused browser and full desktop/mobile browser.
  Read its full conclusion before claiming accepted status.
- Draft PR #1 remains unmerged; no release. Next work remains
  Win7/XP/11 source CSS screenshot alignment and original
  desktop/context/Start/Computer/Bin parity.

---

## Final pinned taskbar grouped thumbnails — 18 November 2026

**Source remains frozen only by SHA:** `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`,
`src/modules/shell/taskbar-base.js`, `app.config.json`:
`showStackedIcons=true`, `showPeekPreviews=true`, 200 ms
show / 450 ms hide, 220 px thumbnail / 8 px gap, 206×125 scaled DOM.
Do not conflate this with earlier `useAeroPeek=false` Show desktop.

- `e16d4d3`, `22fad76`: source grouping model,
  grouped pinned/unpinned app IDs, exact preview timings, viewport
  position clamping and unit tests.
- `5e7ff9c`, `0c15d30`: scaled inert Guest DOM snapshot of
  original live windows in taskbar popup, per-window title and icon,
  close/activate controls; browser network security prevents cloning
  iframes/media/scripts into active duplicate content.
- `83c30ea`, `46e2080`: React `WindowFrame` target
  marker, grouped taskbar rendering, hover preview (delayed) and
  source group toggle/restore behavior; no duplicate program launch.
- `14689c3`: exclude inert preview clones from CSS that hides
  unrelated source windows during one-window peek.
- `38a7b4c`: Playwright: groups two Computer windows under one
  running button, group minimize/restore, hover preview cards,
  clone, peek, target-specific activate/close. Mobile touch checks
  avoid artificial hover.
- `a6cdaa1`: deliberate focused CI includes the new taskbar suite;
  extended the entire job from 25 to 48 min because
  [prior CI #44243971212](https://github.com/codersachin99/windows-os/actions/runs/44243971212)
  **passed typecheck, unit, original inventory/theme asset/build,
  focused Playwright** but **cancelled at its 25-min job cap
  while running full desktop/mobile Chromium**. No full green
  acceptance can be claimed from that run.
- `c7967c9`: source contract, preview evidence and explicit
  theme/Sticky/iframe/screenshot limitations recorded in
  `migration/TASKBAR-LIVE-PREVIEWS-FINAL.md`.

**New verification:** this handoff commit includes `[run-ci]`
to deliberately run typecheck, Vitest, original source/image audits,
build, focused browser and full browser on the exact pinned branch
head. Check all results and fix failures before acceptance.
No source repository modification, no merge, no release.

**Next:** confirm new CI and repair real failures; then match
Win7/XP/11 original preview pixels, continue shell context menu,
Start, Computer/Bin and safe source map-directory implementation.

---

## Final legacy-win7 source locked at 26b9f0c — 18 November 2026

**Authoritative immutable source reference:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Previous, now historical:** `4e63290d783009e1293433c6ccf252abba9c1187`.
Source `main` is **not locked/modified**; WindowsOS reproducibly pins
this exact commit regardless of future source pushes.

Read `migration/FINAL-SOURCE-BASELINE.md` **first** for the complete
reconciliation matrix, source/target caveats and next priorities.
`migration/final-upstream-delta.json` records all 40 new source commits
and 215 changed paths, including PHP Slim4 backend, PWA, window-manager,
per-app registry, taskbar preview/stack, Desktop Sort by, feature flags,
network map, icons/sounds, shader effects, and boot/logon mappings.
`migration/legacy-files.tsv` is rebuilt from the final source Git tree:
3414 Git blobs, 291 JavaScript modules, 76 changed module objects and
one new `src/modules/system/close-effects.js`. `module-tracker.json`
preserves the prior evidence but downgrades source-changed
verified/implemented entries until re-accepted.

**Implemented during this rebaseline:**
- `876c0f5`: rebuilt pinned source inventory and tracker.
- `7412f07`: retargeted strict reference audits, theme art and source
  visual capture SHA plus opt-in CI to new SHA.
- `6891fad`, `7c09ea7`, `0c965a6`, `82d99d4`: final source
  Desktop Sort by Name/Size/Type/Modified, Ascending/Descending;
  persisted Guest-only column-major grid. New source flags hide
  Copy Path, rename Upload Files and expose disabled host-dependent
  Map Directory. Unit and Playwright test coverage added.
- `c0c54d8`, `74a1bc1`, `104ac98`, `47da4f3`, `b252c66`:
  single SDK menu flag source shared by Desktop and Computer/Bin Explorer;
  updated final source context expectations/Playwright tests.
- `783bc02`: detailed machine-readable 40-commit/215-file delta.
- `1c7ddd3`: optional source visual capture now boots pinned legacy
  via PHP router and composer instead of missing Python `start.py`.
- `ca30112`, `24bf58a`, `714e5b3`: window-engine three-instance
  global default limit, per-app override hooks, source error dialog
  focusing frontmost existing window, engine and desktop/mobile browser
  tests added to deliberate focused CI gate. Full source per-shortcut
  override precedence remains pending.
- `b768491`: curated immutable baseline and pending-parity matrix.

**Not finished:** final source introduces grouped taskbar instances/live
thumbnail previews, map/disconnect permissioned folders, feature flag
config source, exact app/shortcut/icon/sound declarative registries,
webapp fullscreen/header controls, source PHP/PWA integration, and
boot defaults `skipBoot=true`/`nativeCursor=true`. These are
tracked pending and MUST NOT be reported as migrated. In particular,
the older Show Desktop Aero Peek is separate from final live taskbar
window thumbnails. Updated source changes do not magically validate
old screenshot evidence. Preserve React Guest login until new boot
skip semantics can be migrated without bypassing authentication.

**Validation:** this `[run-ci]` handoff push deliberately starts
full TypeScript/unit/source-inventory/artwork/build/focused browser/full
desktop+mobile tests for the exact new head. The old source SHA's CI
is historical. Check exact run SHA/results and fix failures with a
new deliberate CI run before labeling acceptance. Keep draft PR #1;
no main merge, no release.

**Next:** repair new exact-head CI regressions, complete final-source
desktop context and Explorer source feature flag behavior, then taskbar
group/live previews, source registry and theme/frame visual parity.
Follow `migration/SHELL-PRIORITY.md`, updated by the new
`FINAL-SOURCE-BASELINE.md` source freeze.

---

## Win7 taskbar Aero Peek preview — 18 November 2026

Continued **themes/taskbar shell-first** migration after System
Properties tab navigation. Exact source checkpoint:
`legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`,
`src/modules/shell/taskbar-base.js`, `taskbar.js`,
`src/modules/themes/theme-win7-scss.js`, and original
`assets/locales/en-US.json`.

- `8c3587c`, `053cfe6`: extend original Guest taskbar preferences
  with strict default-off `useAeroPeek`; preserve legacy v1 type-only
  settings, persist boolean with notifications and safe storage denial;
  expanded unit tests.
- `9521c5a`, `aee17fb`, `ad4434d`: original-source-labeled
  Taskbar Properties Aero Peek checkbox; live Apply/OK, Cancel discard,
  capture checkbox value before queued React updater; Win7 enabled,
  other theme behavior gated pending evidence.
- `93ecaea`, `9ac216c`: Show desktop hover and touch-press
  previews Win7 Guest windows without minimizing them, while click
  still minimizes only visible windows. Source outline/RTL gradients,
  noninteracting window frame and .3s title/body fade; pointer leave
  restores original window state.
- `202640e`: desktop/mobile Playwright coverage for default-off,
  committed hover, no window mutation, show-desktop click, Cancel,
  reload, and Win11 unsupported-theme gating.
- `570bd6a`: pinned original source findings, distinction between
  source `window__background` and React adapter, unsupported exact
  feature matrix and unfinished screenshot parity at
  `migration/TASKBAR-AERO-PEEK-SOURCE.md`.

**Verification:** The earlier System Properties tab
[CI #44239204644](https://github.com/codersachin99/windows-os/actions/runs/44239204644)
passed TS, Vitest, source/artwork audit, Vite build and focused
Playwright but was **still running its complete browser suite**
when inspected. It predates every Aero Peek change and cannot
validate them. Even older Performance Options
[CI #44237513268](https://github.com/codersachin99/windows-os/actions/runs/44237513268)
was **cancelled** during its full browser step, not green.

This handoff's opt-in `[run-ci]` push starts the **new exact-head**
TypeScript/Vitest/source/asset/build/focused/full desktop+mobile
browser gates. Check failures before acceptance; record any fix and
rerun only when necessary. Keep PR #1 draft, main untouched, no
release/pixel-parity claim.

**Next:** confirm full CI then improve original Win7 peek frame
background, validate all theme Aero Peek capability flags before
enabling XP/Win11, continue source-vs-React visual captures, context
menu, desktop, Start and Computer/Bin fidelity ahead of optional apps.

---

## System Properties source tab navigation — 18 November 2026

Next shell-first source milestone, continuing from the 18 November
Performance Options bridge. Pinned reference remains
`legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`,
`src/modules/shell/system.js` module `508f` and
`assets/locales/en-US.json`.

- `f538611`: all five original System Properties tabs in source order
  (Computer Name, Hardware, Advanced, System Protection, Remote)
  are **navigable**, default Advanced, with source English instructions.
  Computer Name is explicitly Guest-scoped. Unavailable host hardware,
  network joining, restore points and Remote Desktop controls remain
  disabled and no fake device/drives are supplied. Advanced retains
  original Performance Options access.
- `52f057f`: scoped classic layout for source group boxes, fields,
  system protection section dividers and an intentionally empty drive
  column layout.
- `f91a3c5`: desktop/mobile Playwright navigation assertion covering
  every tab, visible original text, unavailable host operations and
  returning to Advanced → Performance. Existing Visual Effects
  Cancel/Apply/persistence browser coverage is retained.
- `612604c`: source audit and explicit unsupported art/host scope in
  `migration/SYSTEM-PERFORMANCE-SOURCE.md`.

**Verification boundary:** previous original-effects
[CI #44237513268](https://github.com/codersachin99/windows-os/actions/runs/44237513268)
ran on `ddf8537` and had passed TS, unit, source/artwork, Vite and
focused browser checks; its full suite was still running when last
inspected. It does **not** cover these newer tab commits. This
`[run-ci]` handoff push triggers a **new exact-head validation**.
Read its logs separately for TS, units, source audits, production build,
focused browser and full desktop/mobile suite. If failing, fix real
regressions on branch and rerun deliberately; don't claim green while
in progress. Do not merge draft PR #1 into main or tag a release.

**Next:** extract the original Vuex `554d` Visual Effects inventory
and exact presets, port only effects that can run in the Guest shell;
import missing source tab illustrations; original-vs-React fixed-size
screen captures/pixel comparisons for Win7/XP/Win11. Continue
priority themes, context menu, desktop, Start and Computer/Bin parity,
not optional games.

---

## System Properties → Performance Options Visual Effects slice — 18 November 2026

Continued shell-first functional fidelity from original
`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`,
`src/modules/shell/system.js` (SystemProperties `500×500`,
SystemPerformance child `420×500`), Control Panel 3097 registry
and original Win7 glass/shadow selectors.

- `53cc2d9`: source `auto/appearance/performance/custom` visual
  preset model, strict versioned Guest storage and independently
  editable original `enableGlass`/`showWindowShadows` values.
  `6e72e0d` adds pure unit tests for presets, storage,
  corrupt records and storage denial.
- `9c6e066`/`1d10ccb`: actual System Properties Advanced page
  and nested `Performance Options` child dialog. Real Visual Effects
  radios and checkbox state, source Apply/OK/Cancel semantics.
  Unsupported host processor, DEP, memory and other panels remain
  disabled, not fabricated.
- `429660a` exports the System app/model from CPanel;
  `c56e8cb` enables original source CPanel program target `system`
  only after the adapter exists; `ad174f4` updates original-registry
  unit acceptance. `33423ef` registers source hidden
  `sysdm.cpl` System Properties Guest program with source 500×500
  fixed/centered frame.
- `c84b3ef` loads/commits Guest effects under
  `windows-os:guest:visual-effects:v1`. `dbaee13` handles
  restricted localStorage getters by retaining session state.
  `9db6acf` wires actual state into both DesktopShell app host paths
  and source `data-effect-enable-glass`/
  `data-effect-show-window-shadows` attributes.
- `a73d46c` covers CPanel System launch, source Visual Effects
  Cancel discard, Apply/OK and reload persistence, and disabled
  host-only controls in desktop/mobile Chromium. `c4b1606`
  includes the spec in **opt-in** focused browser CI.
  `b0816b6` pins source values, implemented behavior and the
  incomplete Vuex preset/hardware/platform scope in
  `migration/SYSTEM-PERFORMANCE-SOURCE.md`.

**Previous CI:** appearance-effects
[CI #44235649209](https://github.com/codersachin99/windows-os/actions/runs/44235649209)
on `5b8347a` passed TypeScript, 619 units, art/source checks,
production build and focused Playwright; the full suite was still
**running** on its older SHA when checked. This new CPanel/
System Properties milestone must **not** inherit that result.

**New acceptance:** this commit triggers fresh exact-head `[run-ci]`.
Inspect TS, units, source/artwork, Vite build, focused browser and
full suite separately. If any fail, fix on branch, document exact
logs and rerun as needed. Do not claim source pixel parity from
component layout alone. Keep draft PR #1 and main unchanged,
no release.

**Next:** implement and pair-verify the broader original Visual
Effects Vuex inventory/presets and System Properties tabs;
then other XP/Win7/Win11 shell visuals, context menus, desktop,
Start and Computer/Bin screenshot parity. Avoid optional games
until these priorities are sound.

---

## Original Aero/XP/Win11 visual effect and RTL bridge — 18 November 2026

Continued priority themes/window-chrome fidelity against original
`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.
Pinned rules are in `src/modules/themes/theme-win7-scss.js`,
`theme-winxp-scss.js` and `theme-win11-scss.js`.

Prior SVG window control
[CI #44144175118](https://github.com/codersachin99/windows-os/actions/runs/44144175118)
on `0915bc7` passed 619 unit and 144 focused browser tests, as well
as TypeScript, source/artwork checks and production Vite, but its
648-case full browser suite was **cancelled**, not accepted.
Earlier window-chrome
[CI #44141690244](https://github.com/codersachin99/windows-os/actions/runs/44141690244)
on `2ecfa7f` likewise passed focused browser and was cancelled during
its full suite. Do not present either as fully green. The older
theme-skin
[CI #44139175165](https://github.com/codersachin99/windows-os/actions/runs/44139175165)
on `31444d5` did complete successfully (619 unit, 130 focused,
632 full browser, 2 full skipped).

**Actual changes this milestone:**

- `8382d83`: original Win7 active `--theme-color` vs inactive
  `--theme-color--inactive` dynamic tint; independent source
  `data-effect-enable-glass` and
  `data-effect-show-window-shadows` CSS gates. Restore pinned
  RTL `-140/-225/-135deg` Aero highlights and negative focused
  shadow offset.
- `0f5ccba`: expose both source effect flags on the desktop root
  with current enabled visual defaults. Removing either attribute
  now switches off only its corresponding glass/shadow rendering.
- `0fee3c0`: mirror Win7 control group, XP titlebar text shadow
  and Win11 titlebar padding under original RTL direction.
- `4991de8`: Win11 active frame uses source
  `--theme-accent` token with existing safe fallbacks.
- `c757460`: focused Playwright tests use actual browser computed
  styles for independent glass/shadows, two-window active/inactive
  color, RTL Aero gradient/shadow, XP/Win11 titlebar layout, and
  Win11 custom accent. `90bfba5` adds this spec to the
  **opt-in** focused shell CI gate.
- `bcc41cf`: new pinned audit:
  `migration/WINDOW-APPEARANCE-EFFECTS-SOURCE.md`.

**Scope boundary:** This is a rendering/attribute effects bridge
only. The original source System Properties → Advanced →
Performance Options dialog in
`src/modules/shell/system.js` is not yet migrated; the flags
are enabled by default and not user-editable. Do not claim a complete
settings migration or original-vs-React pixel matching.

**Verification:** Trigger an exact-head `[run-ci]`, check
TypeScript, Vitest, source/artwork audits, Vite and focused desktop/
mobile Chromium; full suite is a separate acceptance gate. Fix
real errors. Keep PR #1 draft, main unchanged, no release.

**Next:** migrate original Visual Effects/Performance Options
controls and settings persistence in a source-matched Control Panel
surface; keep themes, desktop, context menus, Start and Explorer
ahead of optional games.

---

## Original Win7 Aero / WinXP / Win11 titlebar SVG controls — 17 November 2026

Continued the shell-first window chrome milestone with exact compiled
source icons rather than approximate Unicode window titlebar symbols.
Pinned original `legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`,
Webpack `ControlItem` module `e863` in
`src/modules/chunks/shared~about~bin~bsod~calc~camera~chess~chrome~cmd~computer~cpanel~find~gadgets~games~ie~installer~i~40bd2819.js`.

Original control variants: Win7 Aero original `isVariant1`,
XP original `isVariant2`, Win11 original default. On maximize, the
original replaces the maximize icon with an independent **restore**
SVG; prior React had shown the same empty-square Unicode symbol.

- `ec2990b` ports all 4 controls × 3 theme variants into
  `SourceWindowControlGlyph.tsx`, reusing exact original viewBoxes,
  SVG `path` / `rect` commands and Aero gradient stops. Unique
  `useId` IDs prevent cross-window gradient collisions.
- `4aa6125` replaces `─`/`□`/`×` text in `WindowFrame`
  with source SVGs; original button actions and tested accessible
  names remain stable; `data-source-window-control` distinguishes
  minimize/maximize/restore/close; titlebar maximize now swaps to
  source restore glyph when maximized.
- `3321c68` passes selected `ThemeId` from both normal desktop
  and Magnifier window hosts to `WindowFrame`.
- `1933943` centers source SVG artwork with flex and zero line
  height while preserving original caption button sizes.
- `8bd28e2` adds Playwright cases for exact source SVG viewBoxes,
  path attributes and Aero gradient stops, maximize→restore→maximize,
  plus accessible keyboard close on desktop/mobile in each theme.
  `4391258` adds this spec to opt-in focused CI.
- `190bd76` adds
  `migration/WINDOW-CONTROL-GLYPHS-SOURCE.md`; `9e03bdd`
  updates window chrome source notes.

**Prior CI:** Explorer source theme skins
[CI #44139175165](https://github.com/codersachin99/windows-os/actions/runs/44139175165)
completed **success** on `31444d5` (619 units, 130 focused,
632 full browser passing, two full skipped). The older
window-chrome
[CI #44141024625](https://github.com/codersachin99/windows-os/actions/runs/44141024625)
on `3dc9ffe` **failed focused browser** (background taskbar
click incorrectly minimized the Computer window; also a mobile
Win7 context-menu test timed out). Background taskbar semantics were
corrected in `8fce354`. The later corrected-window-chrome
[CI #44141690244](https://github.com/codersachin99/windows-os/actions/runs/44141690244)
on `2ecfa7f` passed its focused gate; full desktop/mobile browser
suite was **still running** when checked.

**Acceptance:** This titlebar SVG addition is **newer than** all
the above runs. Do not infer green CI. Trigger one exact-head
`[run-ci]` gate, inspect actual TS, unit, source/artwork, Vite,
focused Playwright and full browser outcomes separately. Keep
PR #1 draft, main untouched, no release or source-paired pixel
parity claim. Next: original configurable window colors,
theme shadow effects, RTL and source-vs-React screenshot matching.

---

## Taskbar activation correction and exact-head rerun — 17 November 2026

During the new source window chrome/browser focus audit, a real
shell interaction gap was found: clicking an **inactive, visible**
taskbar window entry dispatched `MINIMIZE_WINDOW` instead of
bringing it to the front. This conflicted with the newly explicit
source `.window__main.active` frame and typical original shell
focus semantics.

- `8fce354` corrects the taskbar click policy:
  * minimized button → `FOCUS_WINDOW` (restore);
  * visible but background window → `FOCUS_WINDOW` (activate);
  * visible topmost window → `MINIMIZE_WINDOW` (toggle).
  The existing source-window-chrome Playwright test covers two-window
  Computer/Bin focus, minimize and restore.
- `727fed7` documents the behavior in
  `migration/WINDOW-CHROME-SOURCE.md`.
- Earlier chrome [CI #44141024625](https://github.com/codersachin99/windows-os/actions/runs/44141024625)
  began on `3dc9ffe` **before** the taskbar correction; its status
  must **not** be presented as validation of the newer commit.
  This handoff triggers a fresh exact-head `[run-ci]` opt-in gate.
  Check unit, TypeScript, artwork/source inventory, build, focused
  browser and full browser results separately, and fix actual
  failures. Preserve draft PR #1; main untouched, no release
  or pixel-parity claim.

---

## Source window chrome and titlebar controls — 17 November 2026

Continued the user's Windows 7/XP/11 themes and shell-first migration.
Pinned original `legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`,
`src/modules/themes/theme-win7-scss.js`,
`theme-winxp-scss.js`, and `theme-win11-scss.js`.

- `62407fd` extends shared `WindowFrame` with a source
  `is-active`/data attribute and a maximized taskbar inset based on
  `--taskbar-height` (40px Win7/XP, 48px Win11), instead of always
  reserving only 40px.
- `94bf5d1` derives focus from highest visible desktop window z-index
  in `DesktopShell`; minimized windows remain mounted but cannot
  hold active frame styling.
- `522c0dd` creates `sourceWindowChrome.css`: Win7 original
  layered Aero frame and 20px/48px caption controls, XP Luna
  frame/24px control gloss/white bold title, Win11 8px framed,
  44×30px controls and #c42b1c close hover. Maximized radius,
  padding and shadows follow each original theme, within current
  dynamic theme accent limitations.
- `f11e504` loads the chrome **after** old
  `windows7.css` and `sourceShellTheme.css` so source metrics
  override the earlier generalized CSS.
- `1af5356` adds browser tests for actual computed frame
  radii, colors, button measurements, active state, maximize/restore,
  taskbar inset and close for all three themes, plus focus transfer
  between Computer and Bin. `6d4dda8` adds them to opt-in focused CI.
- `e0d9337` adds pinned
  `migration/WINDOW-CHROME-SOURCE.md` for original source values,
  user-configurable accent caveat and remaining glyph/pixel-parity work.

**Previous CI finding and correction:** Original Computer icon-geometry
[CI #44135610739](https://github.com/codersachin99/windows-os/actions/runs/44135610739)
**failed** one of 628 full Chromium tests: after a keyboard ArrowRight
on background **View**, the submenu could be replaced by **New** because
a pointer-entry event fired during layout. Its 619 unit and 124 focused
browser tests did pass. `0584895` fixes the actual interaction:
background context hover switching now requires real pointer
movement, not pointer enter/reflow. This fix is included in the
new chrome validation branch but **not** in the failed old run.

The previous Explorer theme-skin
[CI #44139175165](https://github.com/codersachin99/windows-os/actions/runs/44139175165)
passed focused browser tests but its full run was still executing
when checked. These new chrome/focus edits require a **new exact-head
`[run-ci]` gate**, and cannot inherit either older result.
Original-vs-React screenshots remain unavailable. Keep PR #1 draft,
do not merge or release.

**Next:** inspect exact-head CI failure logs and fix any regressions;
then original titlebar glyph assets, settings-controlled shadows and
pixel-matched visual captures, while continuing priority desktop,
Start, Computer and Bin functionality rather than games.

---

## Explorer context theme skins — 17 November 2026

Continued exact original Windows 7/XP/11 shell theme fidelity while
preserving the existing Computer/Bin functional context commands and
previously migrated outward side submenus. Pinned source remains
`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

Previous original-icon-geometry
[CI #44135610739](https://github.com/codersachin99/windows-os/actions/runs/44135610739)
passed TypeScript, units, source/artwork checks, production Vite and
focused Chromium; its full browser suite was **still running** when
last checked. Independently, the corrected Computer/Bin side-menu
[CI #44133299513](https://github.com/codersachin99/windows-os/actions/runs/44133299513)
**completed success**: 619 Vitest unit tests, 118 focused browser
tests and 620 full browser tests.

- `f15cb8b` adds `sourceExplorerContextTheme.css`, scoped to
  `data-theme`, with real source `winui-menu` palette for root and
  separate nested menus. Win7: #f1f1f1 surface, #979797 border,
  double inset stroke/gutter and source hover gradient with
  #aaddfa edge. WinXP: white inherited Vue menu surface,
  #aca899 border, blue #316ac5 hover/white text, original square
  corners and menu shadow. Win11: #f9f9f9 surface, #0001 bright
  border, 6px radius/padding, #f0f0f0 hover and #0003 shadow.
- `01520c7` imports the palette after `ExplorerApp.css` so the
  previously hardcoded generic blue/gray React context styles
  cannot override source theme selection.
- `f2af6a9` adds computed-style desktop/mobile browser tests for
  source background and View submenu palette/hover/shape.
  `dd44779` expands them to file-item menus and Send to side
  popup for all three themes, including real active Guest
  Desktop action.
- `4fd13e6` adds this spec to the **opt-in focused browser
  test gate**, and `bb9aa03` pins source CSS and caveats in
  `migration/EXPLORER-CONTEXT-THEME-SOURCE.md`.
- No change to VFS operations, app associations, original import
  assets, existing context command order or shell routing.

**Acceptance boundary:** New palette/source tests are **not**
covered by prior CI runs. Trigger exact-head `[run-ci]`,
inspect TypeScript, units, source/asset audits, production Vite,
focused desktop/mobile Playwright and full suite separately. No
source-paired original screenshots, no validated pixel-parity claim.
Remaining menu differences: original Vue DOM, radio/checkmark icon
gutter, submenu arrow glyph and exact font metrics. Keep PR #1 draft,
main unchanged, no release. Next slice: original window chrome and
theme titlebar controls, followed by source-vs-React visual captures.

---

## Source Computer icon geometry for Win7 / XP / Win11 — 17 November 2026

Continued shell-first theme and Computer fidelity. Pinned reference:
`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`,
`src/styles/apps/computer.css` (already copied unchanged to
`packages/apps/explorer/src/source.css`).

Original source uses small icon 16px/min 160px width, medium item
96px/icon 88px, large item 144px/icon 128px, extra item 212px/icon
196px, Tiles minimum 256px/icon 48px, and Content icon 48px.
The later React `ExplorerApp.css` overrides had incorrectly shrunk
medium to 64px, large to 112px, extra to 160px and default Tiles to
32px; captions were also clipped to one line rather than the source
four-line clamp.

- `3dbce2c` restores source sizes and padding in the shared
  `ExplorerApp.css` for Win7, XP and Win11, including normal
  4-line medium/large/extra captions. Existing source-native
  Win7 Tiles/Details/List/Content geometry overrides are preserved;
  narrow mobile modes retain responsive bounds.
- `3cd6efb` adds desktop/mobile Playwright computed layout checks
  for original medium/large/extra, Small and Tiles size constants.
  `fa90ed5` checks large icons in both XP and Win11. `5782658`
  reuses a persisted Guest VFS fixture when cycling between themes,
  avoiding false duplicate uploads.
- `5721ae9` adds icon layout regression tests to the opt-in
  focused CI gate. `a9b355c` adds
  `migration/EXPLORER-ICON-METRICS-SOURCE.md` with pinned
  source dimensions, previous discrepancies and explicit limits.

At this checkpoint earlier focused shell suites
[#44131229628](https://github.com/codersachin99/windows-os/actions/runs/44131229628),
[#44132734259](https://github.com/codersachin99/windows-os/actions/runs/44132734259)
and corrected
[#44133299513](https://github.com/codersachin99/windows-os/actions/runs/44133299513)
were **success** for their respective older commits. Their full
Chromium stages remained in progress when last checked.
**Do not attribute those statuses to these new geometry commits.**
Run a new exact-head `[run-ci]` for the CSS geometry change, fix
failures from actual logs and report full outcome only when confirmed.

Source-paired screenshots remain unconfigured, and matching source CSS
dimensions alone does not establish pixel parity. Keep draft PR #1,
main untouched, no release. Next: theme-specific popup/menu palettes,
window chrome and source artwork checks across XP/Win7/Win11.

---

## Desktop unsafe-shortcut full-suite regression correction — 17 November 2026

The older [path-backed shortcut CI #44128632442](https://github.com/codersachin99/windows-os/actions/runs/44128632442)
on `9e0f541` completed **FAILURE**, although TypeScript,
614 units, source/art checks, Vite and the focused shell suite passed.
Full Chromium detected **two test failures** (desktop and mobile) in
`tests/e2e/desktop-files.spec.ts` for one stale assertion: untrusted
imported `Unsafe.lnk` is still rendered but correctly blocked from
launching; the app now displays the *more specific* rejection
`The original shortcut target cannot be opened safely.` rather
than the older generic `No original application association`.
No `cmd` window was opened. This is a test expectation mismatch,
not evidence of arbitrary shortcut execution.

- `0e07683` updates the exact expected safe rejection message
  without weakening either the valid program shortcut path or the
  Guest path shortcut validator. `811625f` includes
  `desktop-files.spec.ts` in the source-shell **focused CI gate**
  to catch this class of regression before the expensive full suite.
- These updates are **newer than** both earlier
  [Send to popup CI #44131229628](https://github.com/codersachin99/windows-os/actions/runs/44131229628)
  and new View/New
  [CI #44132734259](https://github.com/codersachin99/windows-os/actions/runs/44132734259).
  Need one new exact-head `[run-ci]` rerun after committing
  this corrected acceptance checkpoint. Never label the earlier
  failing run green or assume older tests accept newer commits.
- Keep PR #1 draft and main unchanged; no release, no original
  source-paired pixel-parity claim.

---

## Computer / Recycle Bin background side submenu parity — 17 November 2026

Continued the original shell and Computer/Bin priority, pinned to
`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.
Original Explorer background `View` (8 view modes) and `New` (Folder,
Rich Text Document, Text Document) children were incorrectly rendered
inline, enlarging the parent context menu rather than showing a real
side-flipping popup.

- `ec6513a` adds dedicated nested Computer/Bin background submenu
  measurement and side-placement using the same bounded geometry engine
  as the already-migrated Send to. Opening children no longer changes
  the parent command list height or menu position.
- `8a1c873` renders View and New in their own accessible `role=menu`
  popup; preserves each source command, checked view modes, real Guest
  folder/TXT/RTF creation, Bin's View options and absence of Bin New.
  Right opens/focuses children; Left returns focus to the parent; Escape
  dismisses. Pointer moving to a different command closes the child.
- `2c1da3c` allows this background submenu to render outside its
  parent without changing the Recycle Bin item menu. `fb4f1a2`
  limits shared arrow focus to the nearest `role=menu`, preventing
  parent navigation from selecting children or vice versa.
- `ddf04cb` adds Playwright desktop/mobile coverage for fixed
  parent geometry, viewport bounds, eight original view modes,
  independent child navigation, real New text creation and Bin
  options. `75e5271` includes `explorer-context-source.spec.ts`
  in opt-in focused shell CI. `4d3224d` updates the pinned source
  behavior note.

**Verification:** Earlier [path shortcut CI #44128632442](https://github.com/codersachin99/windows-os/actions/runs/44128632442)
and [item-menu popup CI #44131229628](https://github.com/codersachin99/windows-os/actions/runs/44131229628)
had passed their focused shell gates at this checkpoint; both full
desktop/mobile suites were still running and have not been accepted as
complete. These **new** View/New changes require their **own exact-head
[run-ci] commit**, not the earlier SHAs. Original-paired screenshots
still unavailable, no pixel parity claim. Draft PR #1, main untouched,
no release.

**Next:** inspect the exact-head focused/browser test results, fix
failures; then prioritize Windows XP/7/11 visual/theme geometry and
remaining original shell behavior before games.

---

## Source Explorer Send to nested side popup — 17 November 2026

Continued top-priority shell/Computer context fidelity from pinned
`legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.
Previously, the Send to child **incorrectly extended the main item
context menu vertically**; original BaseMenu children open beside their
parent command, flipping on tight screen edges.

- `061173e` adds pure `sourceExplorerSubmenuPlacement` with parent
  and trigger rect inputs, horizontal right/left flip and top/bottom
  viewport clamping. The child is positioned in the menu's local
  coordinates to tolerate transformed native window shells.
- `f086299` tests desktop normal/right-edge placement, lower-screen
  clipping, narrow phone placement and oversized menu bounds.
- `04b7382` renders the existing source **Send to** actions in their
  own popup, keeps the original main-menu order/height, isolates
  child Up/Down keyboard focus, Right Arrow expand/focus and Left
  Arrow close/restore, Escape via the shared handler; hover across
  other parent commands closes the child.
- `38cd757` applies popup-specific source-theme-compatible CSS and
  overflow only for normal Explorer **item** context menus. Bin and
  Computer background context retain existing independent handling.
- `9e6ac91` browser tests real parent geometry, child bounds on
  desktop/mobile viewport and keyboard focus behavior.
  `20ee166` updates
  `migration/EXPLORER-ITEM-MENU-SOURCE.md` with known residual
  visual/interaction scope.

**Verification:** Earlier path-shortcut
[CI #44128632442](https://github.com/codersachin99/windows-os/actions/runs/44128632442)
on `9e0f541` passed TypeScript, units, source/artwork checks, Vite and
**focused browser suite**. Its **full Chromium run was in progress**
when last checked; its success must not be invented. The new
popup/geometry commits are **not included** in that run and require a
fresh exact-head `[run-ci]` gate. Do not merge or release PR #1.
Original-source paired pixel comparisons remain unavailable; background
View/New still use inline children.

**Next:** verify new focused Playwright geometry and earlier full
suite. Fix any regressions, then continue Win7/XP/11 shell/context
visual fidelity and Computer/Bin source features, not game migration.

---

## Corrected Send to Desktop acceptance rerun — 17 November 2026

Initial exact-head [CI #44128175487](https://github.com/codersachin99/windows-os/actions/runs/44128175487)
on `d212fee` **FAILED at unit tests** (613 passed, 1 failed).
TypeScript passed. This was a *test assertion error*, not a runtime
shortcut defect: the negative case mistakenly asserted that valid
installed-program JSON `{exe:"calc",icon:"calc"}` with no `path`
must be rejected. The original build supports that program-only form.

- `02827f0` fixes the test: malformed/untrusted **path-containing**
  JSON remains rejected by both parsers; the valid pathless installed
  program form correctly remains executable by the existing Guest app
  registry.
- `60807ea` corrects the item-menu browser precondition: the
  synthetic Computer root `/` is not an EXTERNAL/computer Guest disk
  path, so source Send to Desktop must remain disabled there. The
  positive test now opens the actual mounted Guest Documents folder.
- New exact-head opt-in `[run-ci]` is required after these edits.
  The earlier failed run never reached browser tests. Only claim
  acceptance after TypeScript, 614+ units, focused Playwright and
  full suite have each passed on the same exact commit.

Preserve draft PR #1, no main merge/release, no original pixel parity
claim. This note supersedes the stale acceptance status in the
chronological checkpoint below.

---

## Explorer Send to Desktop path-backed shortcuts — 17 November 2026

Continued the user's original-theme/desktop/Computer context priority using
pinned `legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`,
`src/modules/system/main.js`, `ExplorerItemMenu.sendToDesktop`.

- `465b734` adds `sourcePathShortcuts.ts`: original-style
  `{exe,icon,path}` data in `<name> - Shortcut.lnk`; bounded canonical
  `/EXTERNAL/computer` Guest path, no host file commands, no recursive
  shortcut-to-shortcut path; atomically creates multi-selection links
  with collision-safe case-insensitive suffixes.
- `1deb1b2` exposes shared contracts. `fee28af` prevents the
  executable-only `parseSourceShortcut` from processing ANY
  path-containing shortcut.
- `d5630f9` updates the Desktop file-backed list model to track
  a separate `targetPath` and source icon, never spoof a programId.
  `99d1d0f` resolves live path-shortcut targets and opens mounted
  Guest folders/TXT/photos/media through existing registered app
  adapters. Deleted/missing targets yield an error, not a host operation.
  `2929aee` adds the same safe path resolver to Computer.
- `b10cd6a` dynamically enables the original Send to Desktop child
  while leaving unimplemented Compressed (zipped) folder disabled.
  `1b6f8bf` wires Explorer item selection to a real atomic VFS
  creation operation; file/clipboard/desktop remain single shared data.
- `2e734ce` tests real source JSON, paths, collisions, atomicity,
  traversal and malicious JSON. `362f45c`/`39d11c8` test the Desktop
  parser's distinct program vs path semantics. `d503a55` updates
  item-menu unit conditions, `afecc98` updates browser menu conditions.
  `ced56ff` adds three Playwright E2E cases: file/folder open,
  reload persistence, Win11 multi-select and suffix collision.
  `50e92e4` adds this spec to opt-in focused shell CI.
- Updated `migration/EXPLORER-ITEM-MENU-SOURCE.md` describes the
  implementation and remaining icon/appearance gaps. Original byte
  assets and source inventory remain unchanged.

**Verification boundary:** Latest prior Explorer menu
[CI #44125386790](https://github.com/codersachin99/windows-os/actions/runs/44125386790)
passed TypeScript, units, source/asset audits, production build and
focused shell Playwright, but its **full Chromium job was still executing
as of this write**. The newly added path shortcut code is **not verified
by that earlier commit**. A new exact-HEAD `[run-ci]` gate is required
to accept this milestone. Never claim full parity: source screenshot
pairing is unconfigured, Compressed ZIP, special file associations,
exact original icon/exe path mapping, nested context geometry and
additional theme rendering remain unported. Keep draft PR #1, no
merge to main or release.

---

## Explorer file/folder item menu fidelity — 17 November 2026

Both previous exact-head shell checkpoints **PASSED full GitHub CI**:

- [Taskbar appearance #44116995900](https://github.com/codersachin99/windows-os/actions/runs/44116995900)
  on `2321f94`: **598** unit / **70** focused shell / **596** complete
  desktop/mobile Chromium tests; TypeScript/source audits/artwork/build passed.
- [Control Panel background routing #44118718417](https://github.com/codersachin99/windows-os/actions/runs/44118718417)
  on `f7f14d6`: **601** unit / **78** focused / **600** complete
  desktop/mobile Chromium tests; TypeScript/source audits/artwork/build passed.
- Original-paired pixel capture still **skipped**; green automation is not
  an assertion of full source look/feel parity.

The new high-priority **Computer item context** slice is sourced from
pinned `legacy-win7/src/modules/system/main.js` `ExplorerItemMenu`
`G.items()`. The original normal menu offers Open, archive-only Extract
here, nested Send to (Compressed (zipped) folder, Desktop/create shortcut),
Download for eligible files, Cut, Copy, Delete, Rename, and disabled
Properties; Open/Rename are hidden for multiple selection. The Bin menu
remains independently Restore/Delete/disabled Properties.

- `a32551c` adds reusable source-ordered item-menu predicate model and
  explicitly disabled unimplemented archive/shortcut submenu actions.
  `b6e1b7e` extends Explorer item-context state with accessible nested
  Send to open state and keyboard Left to close.
- `1cbcd13` wires a safe Guest byte-backed Download using
  `VirtualFileStore.readBytes`, Blob URLs, actual original file name
  and cleanup; Open/Cut/Copy/Delete/Rename reuse the existing Explorer
  session and real VFS, not fake standalone actions.
- `cb7e33c` renders the item menu and two source child labels;
  `2928301` fixes the hover-open/click interaction. `172b09a`
  hardens the empty selection archive predicate.
- `07139d0` unit-tests 7 source menu eligibility/order cases;
  `7375c36` adds browser tests for source order, disabled Send to
  children, TXT and real binary bytes, multi-selection and directory
  rules. `d5e3d93` adds the spec to the deliberately opt-in CI focused
  shell gate.
- `migration/EXPLORER-ITEM-MENU-SOURCE.md` documents original
  predicates, limited archive eligibility and remaining unimplemented
  source path-backed shortcuts / archive services / side-flipped child
  menu geometry.

**Verification boundary:** This new code needs a fresh exact-head
`[run-ci]` run. Do not count the earlier green CI for these later
commits. Keep PR #1 draft, main untouched and no release until paired
original screenshots and unported functionality are accepted.

---

## Source Control Panel task deep links and disabled task fidelity — 17 November 2026

Continued the user's themes/context/desktop/Start/Computer priority,
without resuming game work. Reference remains pinned to
`legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.
This is a **small source-backed integration, not complete Control Panel parity**.

Original `src/modules/system/cpanel.js` registry `3097` sends its
**Change desktop background** task to program `personalize`; React now
implements a separate system-only Background view. Other tasks targeting
that same program ID (glass color, screen saver) have not been implemented.
Original `src/modules/shell/taskbar.js` actually disables Lock, Auto-hide,
Small icons and Start Customize in its own settings, so those Control
Panel tasks must not falsely advertise a working action.

- `79be874` adds pure exact-label program-task destination mapping and
  enabled/disabled predicates. Theme and Desktop Background are the only
  currently implemented `personalize` task destinations; unsupported
  appearance and taskbar actions remain visible but disabled. Supported
  original task redirect `taskbar → notification` stays enabled.
- `13720cc` changes search-task clicking to dispatch the proper
  destination instead of blindly opening any task with an installed program
  ID. The parent program root tile remains clickable.
- `ecf6323` adds an optional initial pane to the existing Personalize
  component, maintaining a single reusable theme/background implementation.
  `12c5f6c` carries the source task through the shared
  `OPEN_APP` window dispatcher using a safe bounded file-path marker.
  CPanel and Personalize remain independent shell windows.
- `d38dd95` adds unit assertions for the two enabled Personalize
  tasks, unavailable glass/saver/Start Customize/Lock/Auto-hide and the
  existing Notification Area redirect. `58be8ad` adds real Guest
  desktop/mobile tests for direct Background view, staged Save,
  independent windows, disabled search actions and Notification routing.
  `77cbd1b` includes those browser tests in the opt-in focused shell gate.

Previous verified Personalize baseline:
[CI #44112519193](https://github.com/codersachin99/windows-os/actions/runs/44112519193)
**SUCCESS** — 595 unit, 62 focused shell browser and 588 complete
desktop/mobile browser tests; original paired screenshots **not verified**.
The independent Taskbar button-mode gate
[CI #44116995900](https://github.com/codersachin99/windows-os/actions/runs/44116995900)
passed TypeScript, unit/source/artwork checks, Vite and its focused shell
browser suite; its full Chromium run was still executing at this checkpoint.
Do not attribute later commits to those earlier SHAs.

**Next:** trigger one exact-HEAD `[run-ci]` gate for the new CPanel
integration. Record its actual complete result, fix failures if any,
and keep PR #1 **draft** until original-paired pixel parity and unported
functional scope are accounted for. No release or merge to main.

---

## Source Taskbar button labels and green Personalize baseline — 17 November 2026

[Exact-head CI #44112519193](https://github.com/codersachin99/windows-os/actions/runs/44112519193) on
`110b83d` **PASSED**: 595 unit tests, 62 focused source-shell browser tests,
588 complete desktop/mobile Chromium tests, TypeScript, source inventory/
artwork audits and Vite build. This verifies the earlier ChangeBackground
Save/Cancel + reload slice. The separate original-source screenshot
equivalence gate was intentionally **skipped / not configured**; do not
claim pixel parity from that success.

Now continuing the user's theme/taskbar/desktop priority using the pinned
original `legacy-win7@4e63290`:

- Source `src/modules/shell/taskbar.js` binds the **Taskbar buttons**
  selector to `taskbarDraft.type` with `combine`,
  `combine-when-full` and `no-combine`; the dropdown is enabled.
  The source `src/modules/shell/taskbar-base.js` checks
  `"combine" !== buttonType` to add `is-full-size` and render a
  `taskbar__main-label` per button. Importantly, its
  `loadItems()` still derives item keys from pins and window IDs:
  the selector does **not** perform React-style program grouping. A
  source-accurate first slice should change label/size without claiming
  a rewritten multi-instance window manager.
- `84df120` adds a validated, observable Guest taskbar button-mode
  preference store with safe restricted-storage fallback. `e3d0266`
  exports it through the modular SDK.
- `39ca7eb` enables only the source Taskbar buttons selector in the
  three-tab Taskbar settings app and saves it using the existing
  transactional OK/Apply/Cancel model.
- `be3ce0f` subscribes DesktopShell to mode changes and adds
  source `is-full-size` button semantics plus labels for both pinned
  and running applications; `5527ab4` adds responsive widths/ellipsis
  without disrupting Win11's centered taskbar structure.
- `6e353cf` unit-tests three source IDs, persistence, malformed data,
  no redundant notifications and denied browser storage.
  `d6429e8` browser-tests Win7/11 Apply, Cancel, full-size labels,
  icon-only mode and reload. `d59d159` includes these browser cases
  in the deliberately opt-in focused shell CI.
- The original Taskbar **Lock**, **Auto-hide** and **Use small icons**
  checkboxes are explicitly disabled in `taskbar.js` itself, and stay
  disabled in React. No fake effect is introduced.
  Source-backed exact pixel widths, taskbar overflow paging and
  original per-window ID presentation remain pending.

**Acceptance gate:** all code after `110b83d` is unverified until the
new exact-HEAD opt-in `[run-ci]` run finishes. Keep PR #1 draft;
do not merge, release, mark complete parity, or change `main`.

---

## Source Desktop Background chooser and verified Control Panel gate — 17 November 2026

The earlier integrated Control Panel/Taskbar [CI #44092169140](https://github.com/codersachin99/windows-os/actions/runs/44092169140)
**PASSED** at `57da241`: **591/591 unit**, **58/58 focused source-shell Chromium**,
**584/584 full desktop/mobile Chromium** tests, TypeScript, original-source
inventory/artwork audits, Contacts checks and production Vite build.
This is React behavioral acceptance, **not source-paired pixel parity**.

The new source-backed Personalization slice follows the user's priority on
XP/Win7/Win11 themes, desktop and context menu before finishing games:

- `60db1ec`: catalog of 7 original byte-imported system backgrounds;
  reject unknown image paths and remote wallpaper URLs.
- `273189b`: Guest wallpaper storage validation by active theme and
  exact path, safe malformed-storage fallback.
- `138dacb`: shell dispatch persists supported wallpaper choices and
  clears previous wallpaper override on theme selection, matching original
  ChangeTheme replacing Background. Restricted storage remains safe.
- `c18bfdf`, `e57bf59`, `9917a8c`: new separate source ChangeBackground
  system thumbnail gallery with selected draft, Save and Cancel, responsive
  layout, original image bytes and no fabricated upload/video features.
- `7b83af9`: both desktop window layers pass the active background through
  to Personalize and dispatch its Save action.
- `ad6bf02`, `d3b0ea7`, `71f7f2c`, `6e4334d`: exact image whitelist,
  safe storage/Theme reset unit tests and desktop/mobile Playwright cases
  for Cancel/Save/reload/theme reset; old window reused after Cancel.
- `abfb947`: opt-in focused shell browser gate now includes the background
  integration. Detailed source evidence and known differences are in
  [PERSONALIZE-BACKGROUND-SOURCE.md](PERSONALIZE-BACKGROUND-SOURCE.md).

The next commit explicitly opts in to one `[run-ci]` exact-head check.
Do **not** mark the new Personalization slice accepted before checking all
TypeScript, unit, source/audit, focused and full browser results. Keep
PR #1 draft, main untouched. No release or original pixel-parity claim.
Still pending: remaining source backgrounds/uploads, full theme/appearance,
context-menu skin visuals, taskbar combining/geometry, Computer/Bin file
properties and original-source paired screenshots.

---

## Control Panel original program targets and taskbar background CI repair — 17 November 2026

The requested shell/theme/Start/Computer focus continues on draft PR #1,
`feat/0001-faithful-react-foundation`; **do not merge or release** while
original-source paired pixel parity is unavailable. This is a source-backed
integration, not a claim of complete Control Panel, theme or taskbar parity.

- [CI #44089852404](https://github.com/codersachin99/windows-os/actions/runs/44089852404)
  at `b29cc69` passed TypeScript, unit tests, source and artwork audits and Vite,
  but the focused shell browser gate failed **4/58** cases: the new Win7
  Taskbar Properties helper right-clicked the Start orb rather than empty
  taskbar background. No application behavior was disabled to work around it.
- `9c8f521` switched to the Win7 empty running lane. Its opt-in
  [CI #44090817828](https://github.com/codersachin99/windows-os/actions/runs/44090817828)
  passed TypeScript, unit tests, audits and Vite; **56/58** focused browser
  checks passed. The remaining Win11 desktop/mobile cases timed out because
  the unoccupied Win11 centered taskbar has a *zero-width* running lane.
  `51dd485` now uses the actual Win11 empty left edge and the original
  Win7 empty running lane in the shared browser helper.
- Pinned original `src/modules/system/cpanel.js` registry `3097` has
  distinct `target:"program"` entries for Personalize and Taskbar/Start.
  `d796fce` classifies **only** their now-migrated app adapters; it does
  not misclassify them as in-panel `SourceControlPanelLocation` history pages.
  `e86a1ef` exposes these two entries and search tasks only when a real
  program-launch callback exists; `4ce36a2` connects that callback to the
  shared `OPEN_APP` shell dispatcher, preserving independent CPanel and
  program windows. All other unported program/host targets stay disabled.
- `eaf2eac` adds exact original-registry target and negative unit checks.
  `25ecf92` adds real Guest desktop/mobile browser cases for Control Panel
  Change the theme → Personalize, theme selection, and Taskbar and Start Menu
  → its actual three-tab window. `54bc3a2` updates the stale root/search
  assertions, while `de452d9` uses the normal Guest session for changing a
  saved theme. No screenshot equivalence is inferred from these tests.
- [CI #44091717660](https://github.com/codersachin99/windows-os/actions/runs/44091717660)
  was triggered on `25ecf92` before the Win11 browser helper and old CPanel
  assertion updates; it must not be counted as acceptance for later changes.
  This handoff requests a fresh **exact-head** `[run-ci]` gate for the
  integrated modifications. Record the resulting focused and complete browser
  counts before marking these slices verified.

**Still pending:** full Personalization/background/appearance pages, original
window/taskbar skins and resize semantics, remaining Explorer file-properties
and source-paired screenshots. Main is unchanged; PR #1 remains draft.

---

## Source taskbar Properties, Start privacy and Win11 obsolete test fix — 17 November 2026

After Personalization first-slice source gallery (the focused browser
gate passed at
[CI #44087981638](https://github.com/codersachin99/windows-os/actions/runs/44087981638),
full desktop/mobile suite was still executing when this change began),
continued the requested taskbar/context/Start priorities.

- `36a3d56` adds a shared source `startmenuDraft` preferences store
  in SDK for the original `src/modules/shell/taskbar.js` Start tab:
  `powerButtonAction` (Switch user / Log off / Restart / Shut down,
  source default Shut down), and `storeRecentApps` (default true).
  Validated local Guest persistence, subscriptions, restricted-storage
  fallback, and unit tests.
- `11862d9` wires Start's actual Win7 power button to that selected
  engine action; keeps XP and Win11 explicit native source power controls.
  Shared App dispatcher does not record recent launches when Start
  recent-app privacy is off; XP/11 recent sections hide accordingly.
- `9860ac9` adds a modular source `taskbar.js` three-tab
  **Taskbar and Start Menu Properties** React window (Taskbar,
  Start Menu, Toolbars), with working power/recent preferences,
  transactional Apply/OK/Cancel. Original nonported taskbar sizing,
  centering, combining, toolbars and Aero Peek controls remain
  disabled rather than being falsely claimed as working.
- `fcf03af` registers source taskbar settings (original w=450,
  h=490, nonresizable bottom-left) and enables right-click taskbar
  background **Properties** to open it. Notification area
  **Customize** opens the existing source Control Panel Notification
  settings via `file.path="notification"`.
- `21fe12a` updates source taskbar menu unit/browser expectations
  and adds Playwright for taskbar Properties tabs, Start power/recent,
  Apply, Cancel, local reload and CPanel notification Customize.
  Included in focused shell CI.
- The earlier full [CI #44085385577](https://github.com/codersachin99/windows-os/actions/runs/44085385577)
  at `dfea989` finished **568 passed / 2 failed**, but those failures
  were the **same obsolete Win11 assertion** in desktop and mobile
  `tests/e2e/theme-shell-source.spec.ts`: it still expected a Games
  `.lnk` folder in Win11 All Programs, which is now correctly the
  pinned `startmenu-win11.js` flat alphabetical app list.
  `b8fa46a` updates the old browser check to keep the XP Games-folder
  original-art check, and assert Win11's flat list and original Notepad
  themed art instead. No source behavior is reverted or bypassed.

This handoff is the exact-head opt-in `[run-ci]` for the new
Taskbar/Start/Personalization integration and obsolete test repair.
The last accepted full CI baseline is `1c4a454` run #44045584638.
Do **not** merge draft PR #1, change main or create a release until new
checks pass and original-paired screenshot parity is proven.
Remaining source differences include complete Personalization,
taskbar layout/combining and full Explorer file-properties modules.

---

## First source Personalization/ChangeTheme shell slice — 17 November 2026

This checkpoint extends the priority Desktop, Start, context-menu and XP/Win7/Win11 theme migration. The preceding
[Bin + Win11 All Apps gate #44085385577](https://github.com/codersachin99/windows-os/actions/runs/44085385577)
had passed TypeScript, all unit/source/asset checks, Vite, and focused browser tests; the full Chromium run
was still executing when this section was written. Its SHA `dfea989` predates Personalization.

Pinned source `src/modules/system/main.js` DesktopMenu `showPersonal()` opens
app `personalize`, and `src/modules/system/personalize.js` ChangeTheme
groups `aero` / `basic` / `wins` then `select()` immediately saves
Theme and a theme-specific background. The original has many more
functions and categories, **not** migrated in this first slice.

- `8949564`: imported exact original source Win7 `personal.ccbfdd3a.webp`
  and Win11 `personal-win11.76af8a1e.webp`, verified Git blobs.
  XP `personal-winxp`, XP/Win11 wallpaper previews and default Win7 art
  were previously imported.
- `67afe5d`: modular `packages/apps/personalize` first ChangeTheme
  gallery. Grouped Aero (Win7) / Other Windows (XP, 11) using original
  imported theme preview art and real source-recognized theme IDs.
  Unit tests cover catalog categories and exact image paths. Custom
  themes, background gallery, appearances, cursors, sound, screen saver,
  theme studio, ad/premium gates and other source skins are **pending**.
- `4ceaec6`: registered Personalize as a real system app; centralized
  `sourceShellWallpaper`; source theme selection changes desktop skin
  and background together and persists the supported shell choice in
  Guest browser storage. Explicit source testmode `?theme=...` still
  takes priority.
- `e681c33`: the source Desktop right-click Personalize action now
  opens an actual React window. New shell app and Vite/TypeScript
  aliases preserve modular app architecture.
- `cf7b111`: added two more pinned Personalization icon checks
  (64 total original artwork SHA checks, now Win7/XP/Win11), engine
  persistence unit, Desktop and gallery switching/regression e2e and
  targeted shell CI gate. This commit adds tests but is not a
  verified acceptance result.

This handoff commit explicitly opts in `[run-ci]` at the exact integrated
SHA. Inspect all TypeScript/unit/build/focused/full Chromium results before
calling this slice accepted. Remain on draft PR #1; main untouched.
Do not merge or release without complete source-to-React visual/functional parity.

---

## Verified shell baseline; source Bin item menu + Win11 All Apps — 17 November 2026

The previous full migration gate at
[GitHub Actions #44045584638](https://github.com/codersachin99/windows-os/actions/runs/44045584638)
**passed** at commit `1c4a454`: TypeScript, unit tests, source/contact
audits, all 62 original XP/Win11 theme Git blob SHA checks, Vite build,
focused shell browser tests, and the complete desktop/mobile Chromium
acceptance suite. Source-paired screenshot capture remains skipped because
`LEGACY_SOURCE_READ_TOKEN` is not configured; a passing CI is **not**
pixel-perfect original-source acceptance.

Next source-backed commits:

- `c1c02bc` corrected the Recycle Bin **item** right-click menu against
  pinned `src/modules/system/main.js` ExplorerItemMenu `host==="bin"`.
  Original order is **Restore**, **Delete**, disabled **Properties**.
  The React menu previously advertised a nonexistent "Open folder" and
  "Delete permanently" label. Restore still checks Guest VFS
  originalPath metadata and Delete still shows permanent-delete
  confirmation. This uses `sourceBinItemMenu` as a small pure contract
  plus unit and browser tests for restore and permanent-delete flows.
  Computer's normal file item menu is unaffected.
- `f6f8c26` separates the pinned `startmenu-win11.js` **All
  Programs** flat alphabetical list (`allProgramItems`) from the
  older XP/Win7 filesystem-backed Guest `.lnk` folder tree. The new
  pure `sourceWin11AllAppItems` combines the pinned c170 manifest
  (excluding hidden system helpers) with separately registered
  device apps and uses `localeCompare` for original ordering.
  Unported original programs (e.g. WordPad) appear disabled rather
  than claiming fake functionality; migrated apps launch normally and
  support the shared original right-click menu. The view scrolls as
  a vertical list. Win11's pinned twelve-app grid stays separate.
- `665a64b` tightened the browser acceptance to assert a real
  expanded Win11 app catalog. Added unit tests for ordering, hidden
  entries, duplicate IDs and disabled unported items; added desktop
  and mobile browser tests to the focused shell gate.

Run exact-head opt-in CI before considering either new slice verified.
Keep draft PR #1 open and do not modify `main` or create a release.
Priority after acceptance: desktop/context-menu fidelity, more exact
Computer/Bin actions, missing Win11 pinned-program source order, XP and
Win7 theme screenshot parity. Source is pinned at
`4e63290d783009e1293433c6ccf252abba9c1187`.

---

## Win11 Start All Programs regression isolation — 17 November 2026

[Paging gate #44044951437](https://github.com/codersachin99/windows-os/actions/runs/44044951437)
at `54c187d` finished static checks and then failed **only**
the two new desktop/mobile paging browser tests (32 other focused tests
passed). Playwright's trace shows `data-test-all-programs-back` was
visually covered by the "Games" folder button after changing to All
Programs. The root cause was a CSS
`grid-template-rows:repeat(2,minmax(0,1fr))` accidentally inherited
from the new 12-app pinned grid into the **different** scrolling
All Programs pane.

- `955f7f7` restricts the two-row overflow-clipped grid to
  `:not(.is-all-programs)`, and applies source-like auto-sized rows and
  vertical scrolling to `.is-all-programs`. The existing browser
  test clicks Back and verifies a return to page 1, so its earlier
  failure is no longer hidden or worked around.
- The newer [footer run #44045301939](https://github.com/codersachin99/windows-os/actions/runs/44045301939)
  was still running the focused gate at this handoff and predates
  `955f7f7`. The new exact-SHA opt-in CI must confirm the fix and
  all Win11 Power Options browser tests.
- Keep main and draft PR #1 unchanged. No release or pixel-perfect
  acceptance until source screenshot comparison and remaining shell
  features have been verified.

---

## Win11 Start footer: source Power Options and quick launcher — 17 November 2026

After the pinned Win11 18ee 12-program page control work,
`src/modules/shell/startmenu-win11.js` shows a true footer with the
Guest account on the left and four actions on the right:
Computer, Games, Control Panel, and Power Options. The last opens
a popup with Log off / Shut down / Restart. Previously React showed
a direct "Shut down" action in the Win11 footer, with no restart
choice or quick-launch controls.

- `558433c` adds source-ordered footer quick launch actions and a
  controlled Power Options popup, click-outside and Escape submenu
  dismissal, and real original engine LOG_OFF / SHUTDOWN / RESTART
  dispatch. Existing Win7 direct power and XP footer are untouched.
  The popup and launcher assets use imported source themed icons.
  Browser acceptance tests exercise the menu choices, Escape,
  launching Calculator, actual Shutdown, and opening Computer.
- `f483d55` positions the Guest avatar/name on the left *before*
  the source quick action row, as in original module 18ee.
- `9493110` adds power/footer regressions to the focused shell
  acceptance gate.

Previous [Win11 paging gate #44044951437](https://github.com/codersachin99/windows-os/actions/runs/44044951437)
at `54c187d` had TypeScript, units, source audits, 62 image checks and
Vite build green, with focused browser testing still in progress at
the time these new footer commits were added. That gate cannot
validate the new footer. Run an opt-in exact-head gate here and
inspect all failures. Do not merge draft PR #1 or create a release
until screenshot and source behavior acceptance are complete.

---

## Pinned Win11 Start 12-app page layout — 17 November 2026

The previous full original-React migration acceptance completed successfully
at [CI #44035240545](https://github.com/codersachin99/windows-os/actions/runs/44035240545)
(commit `9d34182`) and the preceding shell acceptance at
[CI #44034330475](https://github.com/codersachin99/windows-os/actions/runs/44034330475)
also passed. These validate the previously migrated source-recentApps,
Start/Taskbar/Explorer and 62 SHA-verified source XP/Win11 images.

Pinned source `src/modules/shell/startmenu-win11.js` webpack module 18ee
has `pageItemCount() { return 12 }`, page dots aligned vertically beside
the six-column/two-row grid, wheel/swipe page selection, and reset to
page 1 whenever Start reopens. React previously displayed all registered
apps in one scrolling grid, diverging from the pinned source.

- `42d70f1`: pure, tested `sourceWin11StartPaging` model (12/page,
  stable slices, clamped page counts and source wheel directions);
  Win11 Start main program list now uses the paged model without
  altering Win7/XP or user search (which stays unpaged). React page
  dots, wheel and swipe selection and return-to-All-Programs reset
  match source behavior. Includes Chromium acceptance.
- `f8521b6`: browser page-change acceptance compares actual program
  IDs across pages, not fragile hard-coded assumptions about the exact
  total number of registered programs.
- `102ec63`: moved page indicators *inside the main grid* and aligned
  them vertically at the grid edge, matching pinned 18ee placement.
  A small column inset prevents overlap with the last icon column.
- `d64aecc`: add Win11 page test to the preexisting focused shell
  Playwright gate, preserving opt-in [run-ci] policy.

Still pending exact source programKeys vs React registry ordering, Win11
all-programs presentation, full CSS/pixel parity via paired screenshots,
Properties and taskbar configuration, and remaining Computer/Bin parity.
The added tests and build must pass before accepting this new slice.
Keep PR #1 draft, main untouched, and no release.

---

## XP/Win11 source recentApps history — 17 November 2026

Continuing after the **focused shell browser gate passed** at
[CI #44034330475](https://github.com/codersachin99/windows-os/actions/runs/44034330475)
(the complete desktop/mobile suite was still running when these later
changes were added).

The pinned original `src/modules/shell/startmenu-winxp.js` renders
`recentPrograms.slice(0,7)`, and
`src/modules/shell/startmenu-win11.js` renders
`recentPrograms.slice(0,6)`. Both derive from the shared
`recentApps` history instead of hard-coded UI labels.

- `eee2f70`: added `SourceRecentPrograms` to the shared SDK with
  local Guest-scoped, validated unique app IDs; newest-first launches,
  persistence, restricted-browser fallback, subscriber lifecycle and
  explicit capped retention. No host commands or paths are stored.
  App.tsx intercepts the existing `OPEN_APP` dispatch to record launches
  from **every** shell surface (Start, Desktop, Explorer, Run, taskbar)
  instead of tracking only Start tile clicks.
- `eee2f70`: XP and Win11 Start menus subscribe to that source
  history and show the first 7/6 apps respectively with original
  registered program IDs, themed source icons, relaunch and the shared
  source right-click menu. Win11 includes a Recently opened section;
  XP shows a recent program strip. All Programs still uses actual
  installed Guest `.lnk` data. Source initial pinned app catalog and
  exact screenshot layouts remain separate and **not accepted**.
- `3fd398c`: corrected source recent browser acceptance to target
  the first recent item without strict locator ambiguity.
- `8cb3e0b`: added the XP/Win11 history browser spec to the **focused**
  shell CI gate before the costly full Chromium suite. Unit tests cover
  persistence, sorting, validation, deduplication, retention and
  storage-denied behavior.

This handoff commit explicitly opts in `[run-ci]` at the latest
source history SHA. The previous full gate does not verify this change.
Do not merge PR #1 or release until the new unit, focused browser and
full acceptance suites pass. Continue source style and Windows XP/7/11
Start-menu exactness, taskbar properties and Computer/Bin menu parity.

---

## Source Start Escape, XP notification artwork and quick shell gate — 17 November 2026

This checkpoint **fixes the root cause** of persistent browser acceptance
failures in the prior two runs:

- [Full CI #44030623990](https://github.com/codersachin99/windows-os/actions/runs/44030623990)
  at `0c9045b`: **542 passed, 4 failed** on Chromium desktop/mobile.
  The two duplicate failures each were XP Start program-context Escape
  erroneously closing the entire Start menu and normal Start Escape
  failing to restore focus to the taskbar Start button. TypeScript,
  all unit tests, the 58 image SHA audit, source audits and Vite build
  already passed. [Earlier #44029438284](https://github.com/codersachin99/windows-os/actions/runs/44029438284)
  had the same 4 failures with 540 passed.
- `c5eeb5c` **root-cause fix**: top-level `apps/web/src/App.tsx`
  attached an Escape key listener to `window` before the more-specific
  StartMenu listener. It unconditionally dispatched CLOSE_START first,
  preempting Start program-menu Escape and making parent focus restoration
  unreliable. Removed that *duplicate* Escape action, while preserving
  Ctrl+Escape/Meta Start shortcuts. StartMenu owns Start/context Escape
  now and DesktopShell restores Start focus on its committed unmount.
  Existing source browser tests cover both desktop/mobile cases.
- `e3dd150`: imported four additional **byte-identical** pinned XP
  tray/date image blobs (Action Center, Network, Battery and datetime).
- `3c32279`: registered the new images in central theme artwork and
  pinned hash verification manifest; `sourceThemeTrayArtwork` selects
  only exact provided XP notification variants for visible and hidden
  tray icons, retaining Win7 fallback for non-imported Volume/Win11.
  Added unit/browser icon tests. All **62 XP/Win11 image blobs** now have
  an exact Git-SHA verifier independent of the legacy-source token.
- `3c32279`: workflow now runs a focused shell browser subset first
  (Start Escape, XP context, taskbar context and Desktop item menus),
  followed by the exhaustive acceptance suite. Opt-in checks still
  require `[run-ci]`; ordinary commits skip CI.

This explicit checkpoint is to run the focused and full gate at one
SHA, not to merge. Keep PR #1 draft, main unchanged, no release.
Future: source recent/pinned Start lists, remaining Computer/Bin
actions and original screenshot visual parity still need work.

---

## XP/Win11 image parity and source-proof contract — 17 November 2026

Following shell context-menu commits (see previous section), the exact
pinned `codersachin99/legacy-win7@4e63290` recursive Git tree was
audited for all available `assets/images/*winxp*` and `*win11*`
entries. The target now includes **58** original, SHA-verified theme
image blobs: 26 from the earlier shell batch and **32** newly imported.

- `f52cd30`: imported 32 byte-identical original icons as actual Git
  blobs, after reading each original Base64 body with source ref and
  comparing its SHA to the expected original Git blob. Includes XP
  camera/magnifier/paint/player/run/display/programs/taskbar and
  Win11 paint, text/media/executable types, special folder variants
  and System/Data/CD disk icons. Original image bytes are unchanged.
- `27f114e`: added all 32 names and pinned SHA hashes to
  `scripts/import-source-theme-assets.py` and the central theme
  program/icon manifest in `packages/assets/src/index.ts`.
  `sourceThemeSpecialFolderArt` selects original theme variants
  only when present; other labels gracefully retain fallback imagery.
- `b8607ae`: Computer/Recycle Bin Explorer sources original
  System/Data/CD drive icons and sidebar special folder artwork for
  XP/Win11, while VFS list items recognize special art only for
  actual mounted Guest profile paths, never arbitrary user folders.
- `618ba80`: unit and Chromium regression contracts for text/media
  themed file icons, actual Guest Documents path, XP/Win11 drive and
  known folder image URLs; updated old generic TXT expectations to
  actual original TXT image assets.
- `d43aabf`: `--verify-target-only` checks every committed target
  file's Git blob SHA against the pinned manifest, and the opt-in
  React Actions workflow now requires this check before production
  build and browser acceptance. It does not require legacy access
  or an external repository checkout.

[Prior CI #44029438284](https://github.com/codersachin99/windows-os/actions/runs/44029438284)
was launched before this image batch. It passed TypeScript, units,
source audits and production build at `fdacd66`; Chromium was
running at the time of this checkpoint. It cannot validate these
newer commits. This handoff deliberately invokes one new `[run-ci]`
gate at its exact head, not for every ordinary commit.

**Important blockers:** Pinned source still has more theme variants
and components; CSS parity and original/React paired screenshot
comparisons are unverified. Source Start pinned/recent semantics,
taskbar configuration and remaining Computer/Bin context properties
are incomplete. PR #1 stays draft. No release or merge.

---

## Source taskbar and Start context-menus — 17 November 2026

Accepted source references: `legacy-win7@4e63290`
`src/modules/shell/taskbar-base.js` (taskbar-menu + 2ae5 item menu),
`src/modules/shell/startmenu-base.js` and `startmenu-winxp.js`
(`openMenu` forwarding to DesktopItemMenu), and
`src/modules/system/main.js` DesktopItemMenu.

The prior [CI #44027070596](https://github.com/codersachin99/windows-os/actions/runs/44027070596)
completed 524 browser tests passing, 4 failing (desktop/mobile):
two Playwright strict-mode failures caused by `not.toContainText` on five
multi-select menu elements, and two Start Escape focus regressions.
The duplicate test assertions were replaced by exact action ID absence
assertions in `6faccd4`; parent `DesktopShell` now restores Start
button focus *after* the Start menu is unmounted using a guarded layout
effect rather than an unreliable RAF within its own disappearing input.
This new focus behavior is not in the earlier failed run. The subsequent
[CI #44028127261](https://github.com/codersachin99/windows-os/actions/runs/44028127261)
was still running at time of this handoff, and predates the context menus.

- `91ce2ce`: source taskbar background menu (Toolbars, Cascade,
  Stacked, Side by Side, Show Desktop, Task Manager, Properties) and
  source taskbar item menu (Open, Pin/Unpin, Close window). Working
  actions use existing shell state and `SourceTaskbarPins`, while
  unported arrangement/Taskbar Properties remain disabled. Shared
  pointer/keyboard/viewport geometry, unit + browser acceptance.
- `b1bf55a`: Close window now calls the parent request-close handler
  to honor apps with unsaved document and media confirmation guards.
- `75179e3`: source Start-menu tiles invoke original DesktopItemMenu
  action contracts on right-click (including All Programs installed
  shortcuts), with real taskbar Pin/Unpin and collision-safe, actual
  Guest Desktop `.lnk` JSON creation. Context portal prevents Win11
  overflow/transform clipping; keyboard Escape/outside behaviors and
  mobile positioning are covered by browser tests.
- `6faccd4`: commit-ordered Start Escape focus and exact multi-select
  menu action assertions, addressing the four earlier failures.
- `b0858e0`: Win11 empty taskbar background Playwright fixture targets
  the real nonzero taskbar surface, avoiding the zero-width empty
  centered running-items lane.

This commit intentionally requests a new combined exact-SHA full gate
with `[run-ci]`. It is NOT yet accepted by browser verification.
The original XP/7/11 source-vs-React pixel comparison remains blocked
without paired source capture. Other outstanding priorities are
Source Theme completeness, source pinned/recent Start lists,
Computer/Bin Properties/context extensions, original taskbar layout
configuration, taskbar default pins/reordering, and all untouched
system menu functions. Do not release or merge draft PR #1 yet.

---

## Shell-first incremental follow-up — 17 November 2026

The `1931a05` opt-in CI #44027070596 was triggered *before* the
following changes. Its completed TypeScript, unit, source, Contacts and Vite
build stages passed; desktop/mobile browser results were still pending
when work moved to the next verifiable slice.

- `9de1ac1`: exported `sourceThemeFileIconArtwork` as one shared
  source 4cca/0f35 resolver for Explorer and VFS-backed Desktop file icons.
  This preserves custom JSON .lnk images, original XP/Win11
  program/folder/file art and honest unknown-type fallback metadata. Added
  exact-source unit checks and Desktop XP/Win11 browser fixture.
- `0d0e2f6`: migrated the original `taskbar-base.js`
  `pinnedPrograms`/ProgramPin/ProgramUnpin lifecycle as a browser-local,
  persisted `SourceTaskbarPins` service. Enabled source Desktop item Pin
  and Unpin for registered apps; taskbar now renders pinned launchers,
  runs a pinned app on click and avoids duplicate running-window buttons.
  Original host OS taskbar remains untouched. Added unit and Chromium
  regression cases. Unported source taskbar context menu, default pin
  catalog, pinned program ordering by drag, full source screenshot parity,
  Explorer/Start Properties, Compressed Folder, and XP/Win11 image completeness
  remain explicit blockers. Do NOT treat them as migrated.

This checkpoint requests deliberate `[run-ci]` verification of the
two new source theme/taskbar slices. Keep PR #1 draft and `main`
untouched until full acceptance is demonstrated.

---

## Shell context interaction regression repairs — 17 November 2026

The full earlier [CI #44024842900](https://github.com/codersachin99/windows-os/actions/runs/44024842900)
at `088cb2a` passed TypeScript, 555 unit tests, source inventory,
Contacts checks and production build but failed 9 Chromium assertions
(4 desktop + 5 mobile). All nine were repeatable source test/interaction
mismatches: ambiguous Text Document versus Rich Text Document selectors
(4), an obsolete Explorer direct New folder context test (2), mobile
inline-rename checkbox/field selection (1), and Start-menu Escape focus
restoration (2). The source menu structure stays intact:

- `f0a7bc4`: exact source menuitem selector, source Explorer New submenu
  and inline-rename test targeting, plus post-unmount Start Escape focus.
- `8107d38`: Desktop/Explorer View and New submenus open on pointer hover
  and with ArrowRight; an idempotent click preserves touch behavior.
- `35ca7e0`: shared `sourceMenuKeyboard.ts` arrow focus helper with
  pure unit contracts, Up/Down skipping disabled commands, ArrowRight
  entering first submenu item and ArrowLeft returning focus to its trigger.
  Vite/TypeScript aliases and desktop/mobile browser scenarios added.

New behavior has been committed but is NOT yet verified by an
exact-head full CI. Do not claim parity from the older failed runs.
Proceed next with source context item actions, desktop, Start and
Computer/Bin parity and original paired screenshots if source access
becomes available. **This commit requests the deliberate
`[run-ci]` contract+desktop/mobile browser gate.** Draft PR #1 must
remain unmerged; do not release unverified shell work.

---

### Corrected source icon fallback exactness — 17 November 2026

Opt-in run [#44024675599](https://github.com/codersachin99/windows-os/actions/runs/44024675599)
again passed TypeScript and 554/555 units. Its single failure
identified a genuine metadata bug: an unknown .lnk JSON icon key
correctly displayed the original theme's generic file bitmap but was
incorrectly reported as an *exact* match for that unknown requested
artwork. Commit `afaeeee` fixes the source metadata to
`exactSourceArtwork:false` for unknown shortcut icon keys and keeps
true only when the source icon key is exactly `file`.
Existing regression tests already check this behavior and all other
source cases. This new `[run-ci]` gate validates the semantic fix on
the latest branch head. The previous browser acceptance is separately
still in progress. Do not claim complete parity or merge until CI green.

---

### Corrected 555-case unit test gate — 17 November 2026

Exact prior opt-in run [#44024512186](https://github.com/codersachin99/windows-os/actions/runs/44024512186)
completed with TypeScript success and 554/555 passing unit assertions.
Its sole failure was an outdated expectation in
`sourceComputerIcons.test.ts` for the XP Calculator shortcut: the
implementation correctly returns the newly imported original
`calc-winxp.f79aee6b.webp`, not the old Win7
`calc.1733a9a0.webp`. Commit `64b8acf` adjusts this expectation
while preserving Win11/Win7 fallbacks. Later build/browser steps on
that failed SHA were correctly skipped. This deliberate `[run-ci]`
requests the entire gate on the corrected head; its result remains
to be inspected, especially desktop/mobile Playwright and screenshot
parity, before any release/merge.

---

### Combined final XP/Win11 source-art acceptance — 17 November 2026

This opt-in `[run-ci]` commit is the consolidated gate for 26 verified
original XP/Win11 image blobs, typed program/icon resolvers,
Desktop/Start/taskbar/window/Explorer integration, the fixed source
.lnk icon loader across themes and desktop/mobile E2E Bin full/empty
lifecycle. Run typecheck, unit tests, original source byte audit,
source Contacts checks, Vite build and all Playwright cases on this
exact commit. Earlier CI snapshots verify only earlier commits;
neither screenshot/pixel parity nor full migration parity is claimed.
Do not merge or publish a release on a failing/incomplete gate.

---

## Verified original XP/Win11 program artwork — 17 November 2026

Ten more pinned original blobs imported byte-identically into the React
project (XP Notepad, Games, Control Panel, Calculator, CMD; Win11 Notepad,
Games, Control Panel, Photo, CMD). Their exact source filenames are
tracked in the importer and source image audit, and the theme-aware
shared asset registry now powers Start program tiles and installed
shortcut entries, registered Desktop icons, taskbar buttons/window
chrome and Explorer source program images. Arbitrary valid custom .lnk
URL artwork retains precedence and Win7 original artwork is unchanged.

Regression coverage includes shared asset-map tests, Explorer icon
classification with custom URL precedence, desktop/mobile Start/taskbar,
and real Guest trash empty/full state. Other XP/Win11 original program
artwork and screenshot parity are still pending, not claimed complete.
Full exact-head acceptance `[run-ci]` must be run after the previous
running snapshot completes before safe merge/release.

---

### Combined source XP/Win11 image acceptance gate — 17 November 2026

After the three theme implementation commits, this opt-in `[run-ci]`
requests exact-SHA TypeScript, Vitest (including original icon map),
source byte integrity/Contacts audits, production build and all desktop
and mobile Chromium cases for Desktop, themed Start, Computer/Bin,
plus existing programs. Ordinary pushes remain skipped. If any gate
fails, inspect the actual logs and fix instead of claiming verified.
No original-source paired screenshot/pixel parity is implied.

---

## XP/Win11 source image import and Explorer integration — 17 November 2026

Commit `a55f0ef`: imported 16 original XP/Win11 source images (including
empty/full Bin), verifying the pinned legacy Git blob hashes against
their new target repository blob hashes before the commit.
Commit `15fe6f0`: theme-aware live Desktop Start/Computer/Bin rendering,
XP Start menu footer art, and unit + desktop/mobile browser contracts.
This follow-up integrates the exact source themed folder, file,
Computer/Recycle Bin navigation artwork in Explorer and extends the
byte-verified importer manifest. Win7 original icon and custom .lnk
behavior remain untouched. Source audit checks original image bytes.

**Status:** committed to draft PR #1 but no full latest-SHA typecheck,
Vitest, source audit, build or Chromium run has completed yet.
Next deliberate action: one combined [run-ci] acceptance gate,
inspect failures and fix before claiming pass. Original paired visual
parity not assessed. Do not merge main or release; keep work shell-first.

---

## Shell context-menu source parity gate — 17 November 2026

At the start of this continuation, first integrated shell acceptance
[run #43962896634](https://github.com/codersachin99/windows-os/actions/runs/43962896634)
was **SUCCESS**, pinned to `a0a3100` (before the subsequent
Computer/Bin context-menu and measured popup commits).

Since then, migrated and committed:
- Measured edge-clamped source context popup for Desktop, Computer, Bin,
  including nested popup movement and constrained mobile viewport.
- Computer/Bin background context View eight modes from existing shared
  `ExplorerSession`, Copy path, safe file upload, Refresh, Bin Empty
  guarded by real VFS and no Bin upload/paste.
- Original Desktop item menu order and file/system/multi selection
  predicates (`sourceDesktopItemMenu.ts`); source Empty Bin with
  real Guest trash entry count and confirmation, byte-preserving
  download, installed-program Send to Desktop .lnk JSON. Unmigrated
  Pin/Compress/Properties remain disabled.
- Original Explorer New submenu Folder/RTF/TXT using the shared
  collision-safe Guest VFS creator. Existing Explorer toolbar New folder
  remains for historical compatibility.
- Unit and desktop/mobile browser regression tests for each slice.

**Current acceptance:** this commit opts in once with `[run-ci]`
to TypeScript, unit tests, original-source audits, build and full browser
suite. It has not passed until the new exact-SHA run concludes.
If failing, inspect logs, repair true failures, and repeat only when
needed. Do not merge PR #1, ship, or claim pixel parity.

**Priority remains:** Themes → Context menus → Desktop → Start menu →
Computer/Recycle Bin; no additional Games until shell parity improves.
Primary handoff [SHELL-PRIORITY.md](SHELL-PRIORITY.md).

---

## Additional prioritized shell context-menu slice — 17 November 2026

After the shell-first integrated `[run-ci]` snapshot, added measured
context-menu positioning and desktop/mobile nested submenu bounds,
then the pinned source Computer and Bin background menus: all 8 shared
View options, Copy path, Upload files here (non-Bin only),
Refresh, and Recycle Bin's safe Empty status. See
[migration/SHELL-PRIORITY.md](SHELL-PRIORITY.md) for detailed source
trace, migrated/pending behavior and new tests
(`sourceDesktopMenuPosition.test.ts`,
`desktop-context-source.spec.ts`,
`explorer-context-source.spec.ts`).

**Validation boundary:** Earlier shell
[CI #43962896634](https://github.com/codersachin99/windows-os/actions/runs/43962896634)
started at exact SHA `a0a3100` and does **not** contain the later
menu positioning or Computer/Bin changes. It passed typecheck, units,
source audits and build; browser suite was in progress at this note.
No additional `[run-ci]` yet: await the first result and batch fixes
before another opt-in gate. Keep PR draft, `main` unchanged, no release.

---

## Shell-first priority pivot and integrated acceptance — 17 November 2026

Product priority explicitly changed: **themes, context menus, desktop,
Start menu, Computer/Recycle Bin Explorer ahead of further game engines**.
Source-locked implementation order and incomplete source contracts are
in [migration/SHELL-PRIORITY.md](SHELL-PRIORITY.md). Draft PR #1,
`main` untouched, no release/pixel parity claim.

Previous Solitaire React acceptance
[run #43952536487](https://github.com/codersachin99/windows-os/actions/runs/43952536487)
completed **FAILURE: 468/470 browser**, both errors identical:
`aria-hidden` decorative drag element marked not visible by
Playwright. TS, units, source audits, contacts source tests and build
all PASSED. Corrected regression to assert DOM presence and
pointer-events, no underlying engine behavior changed.

First shell batch source-backed in this branch:
- Desktop background menu: Copy path (mounted Guest path via browser
  clipboard), Upload files here (native multi-file to safe Guest VFS),
  Display (live Control Panel location/historical Back-Forward).
  Gadgets/Personalize shown disabled pending their actual source app
  engines. Source `main.js` menu order retained; desktop/mobile tests.
- WinXP profile-top, two-column Start, bottom actions; Win11 centered,
  search-top, six-column Start with responsive narrow four-column.
  Win7 baseline unchanged. React skin is structural **only**; color,
  image, pinned/recent semantics and pixel parity remain unaccepted.
  Source `startmenu-winxp.js`/`startmenu-win11.js` and corresponding
  source CSS traced. Tests assert themes/responsive functionality.

This opt-in `[run-ci]` commit requests full TypeScript, Vitest,
legacy source audits, build and all desktop/mobile Chromium tests.
It supersedes only the previous test snapshot when its **exact commit**
has actually passed. If it fails, diagnose and correct before claiming
any acceptance. Do not trigger unrelated workflows or visual captures.

---

## Playable Solitaire React slice — 17 November 2026

The preceding Solitaire/card rules and asset acceptance at
[CI #43949278947](https://github.com/codersachin99/windows-os/actions/runs/43949278947)
completed **SUCCESS** on the earlier exact SHA `f9e7382`. It does
**not** cover the new Solitaire React board below.

Added `sourceSolitaireView.ts` with e202 52-card rendered order,
three-card waste .22-width fan, face-up affordances, source
foundation-before-tableau legal targets, and the original 0510
overlap-based drag drop, plus deterministic unit tests.

Added `SolitaireApp.tsx` / CSS: original imported 949x490 card sheet
and Klondike background, live engine-backed stock dealing/undo,
draw-one/draw-three, foundation/tableau auto-moves, pointer-captured
drag, card face keyboard activation, source audio effects, responsive
scroll-reachable board, status time/score and parented source-styled
Help/About/Appearance windows with three card backs. Added the actual
660x500 app registry entry and mounted the game in DesktopShell; the
original Games tile now launches it. Playwright desktop/mobile
acceptance tests check card inventory, source image paths, stock and
undo, draw-one, visible pointer drag, child dialog lock and Exit.

**Known incompleteness:** original Solitaire Statistics persistence,
full win particle animation and original deck/prefs persistence are
NOT migrated. Source runtime paired visual parity still unavailable.
The `solitaire.js` tracker remains `in-progress`, NOT verified.
Do not merge draft PR #1 or release a product. This opt-in `[run-ci]`
commit starts a new exact-SHA typecheck/unit/source-audit/build/browser
acceptance; only call it green after GitHub finishes.

---

## Solitaire/card source audit acceptance correction — 17 November 2026

The initial Solitaire source-model [run #43948813972](https://github.com/codersachin99/windows-os/actions/runs/43948813972)
stopped at **one new sprite test setup assertion**:
a freshly shuffled stock card is face-down, so
`sourceCardSpriteStyle(card,73)` correctly selected the
source Blue back at `0px -392px`, while the test wrongly
expected the face of the Queen of Hearts. The exact model
and sprite semantics are correct. Fix the test to explicitly
set `faceUp:true` for face sprite verification; no source
behavior or assets changed. Source Solitaire rules' six
unit cases and 531/532 unit assertions passed on that
failed run; browser suite was not reached.

This deliberate `[run-ci]` gate reruns the fixed test,
the newly added 0510 shared card drag geometry unit tests,
all existing Tetris/Minesweeper suites, pinned image+audio+
Solitaire CSS audits and the full desktop/mobile browser
suite on the current exact commit SHA. Do not mark passed
until complete. No visual source comparison is possible
without the pinned source runtime. Keep PR #1 draft, no
main merge/release.

---

## Shared original 0510 card dragging model — 17 November 2026

Added `sourceCardDrag.ts` and Vitest coverage for exact
4px axis drag threshold, first-greatest-overlap legal target,
and CSS-scaled board coordinate conversion, source-traced
from shared cards mixin 0510 and helper 5ea1. Solitaire UI
is intentionally still disabled; the game will use these
shared primitives along with the imported sprite/sounds.
This later code is not in the earlier Solitaire model
`[run-ci]` snapshot #43948813972. Keep draft PR #1.

---

## Deliberate Solitaire model/assets acceptance — 17 November 2026

One opt-in **[run-ci]** for the source-backed Klondike
model, card helpers, original sprite renderer and responsive
layout, and ten imported source card media files. Validate:
strict TypeScript across all packages, Vitest regression for
Solitaire's stock, tableau, foundations, undo, scoring,
2f7e Fisher–Yates and 5ea1 sprites, pinned image/audio/CSS
integrity audit, production build, and the unchanged full
desktop+mobile browser suite. Tetris keyboard/pointer CI
#43945990957 is an earlier SHA and does not include Solitaire.
The source Solitaire tile remains **disabled**; the board UI,
drag interactions and source card dialogs remain unported.
No original source paired screenshot parity can be inferred
from React-only captures. Only mark accepted if new exact
run completes successfully. Keep draft PR #1, don't merge
or release.

---

## Source Solitaire card sprite/layout — 17 November 2026

Original 949×490 image (13 columns by 5 rows; 73×98 card)
and source e202 pile geometry have been ported to reusable
`sourceCardArtwork.ts` / `sourceSolitaireLayout.ts`,
with sprite and mobile pile-layout unit tests. Original
Klondike and shared-card CSS were imported with verified
source=target Git blobs and pinned audit checks.
Solitaire's card sprite and layout are ready for the UI,
but no playable Solitaire app is enabled yet.
These changes are after the original Tetris input acceptance
run #43945990957 and need their own opt-in verification.

---

## Original shared card assets restored — 17 November 2026

After Solitaire rules port `2553c2a`, restored all 3 common
card-game source images and 7 audio effects byte-identically
using Git blobs. The shared asset manifest now covers
Klondike + Spider backgrounds, the original source card sheet
and seven `cards-*` effects; tests bind the exact source names.
Tracked in `migration/SOLITAIRE-SOURCE.md`. Original 2f7e
Fisher-Yates algorithm is now confirmed by source, though ec2b
suit iteration order remains unresolved. Solitaire remains
**in-progress, not playable**; no fake game windows enabled.
This slice is later than input CI #43945990957, and needs
its own opt-in audit/build acceptance. Keep draft PR/main
unmodified and no product release.

---

## Solitaire pure rules port — 17 November 2026

Source-backed groundwork for the next Games engine:
`sourceCards.ts` for shared 5ea1 deck/color primitives,
`sourceSolitaire.ts` for the pinned e202 Klondike game:
7 descending tableau columns, 4 foundations, draw three/one,
stock recycling, alternating run/auto-drop validation, scoring
and 50-step Undo. Unit tests exercise deterministic source
logic. See `migration/SOLITAIRE-SOURCE.md`. Tracker now
`in-progress` for Solitaire; **Games tile remains disabled**.
Original 2f7e shuffle and ec2b suit order, card artwork and
browser UI still missing; never claim complete game parity.
This code is after the active Tetris input [run-ci]
#43945990957 and is NOT covered by that snapshot.
Batch a later verification when a further Solitaire slice is ready.
PR #1 stays draft; main unchanged, no release.

---

## Tetris source input fidelity acceptance gate — 17 November 2026

One deliberate `[run-ci]` acceptance is requested for the
post-88e4895 Tetris improvements: original 22-row game-over wipe,
source CSS hash checks, exact source keyboard aliases, primary/secondary
tap direction, non-passive canvas wheel rotation, continuous
captured-pointer drag and engine-admitted move/rotate sounds.
New pure Vitest cases and desktop/mobile Chromium browser tests cover
those inputs including keyed L piece choice and drag before release.
This CI will also rerun all previous desktop + mobile source contracts.
It does not trigger visual capture or claim original screenshot
parity; last target-only 68-scene run remains #43941143525,
`sourceCaptured=0`, `parityStatus=not-assessed`.
Do not mark changes accepted until the exact workflow completes.
Keep PR #1 draft, no release or main merge.

---

## Verified Tetris baseline and input fidelity follow-up — 17 November 2026

First Tetris playable functional [CI #43939723976](https://github.com/codersachin99/windows-os/actions/runs/43939723976)
completed **SUCCESS** at `88e489555c5023a04fc16098336e68034bca2cb4`:
**516/516 Vitest**, **460/460 Playwright Chromium desktop/mobile**;
TypeScript, build, source audio/image asset audits passed.
Target-only [visual #43941143525](https://github.com/codersachin99/windows-os/actions/runs/43941143525)
also **SUCCESS** at `edced26de266231e664730ff2aab5ca3a9c9f9a0`:
**68/68** React screenshots, zero errors, `sourceCaptured=0`,
`parityStatus=not-assessed`. These do not establish pixel parity.

New source fidelity work in this branch: `sourceTetrisControls.ts`
plus tests for source keyboard, positive/negative wheel rotation,
primary/secondary tap, captured pointer drag and source piece
bounds; engine-admitted move/rotate sounds; per-frame pointer
motion and explicit rotation/position browser hooks. The
previous Tetris white game-over wipe and byte-locked original
source CSS remain later than initial Tetris acceptance too.
None of the newer behavior is accepted until a new opt-in CI
tests all relevant source and browser contracts.
Keep PR #1 in draft, do not merge or release.

---

## Deliberate 68-scene Tetris visual capture — 17 November 2026

The Tetris canvas, source assets, Help/Stats child windows and
original game-over wipe are integrated into the React Games library.
This commit opts into the screenshot workflow **[capture-visual]**
only, not a full CI pass. Capture 34 React scenes each at desktop
and Pixel 7, including source-backed Tetris initial/playing/Help/
Statistics and parented Minesweeper result/stats screenshots.
Inspect visual job logs, the exact manifest, artifact images and
nonzero errors. This is a target-only baseline:
`sourceCaptured=0` and `parityStatus=not-assessed` until
the actual pinned Vue runtime is captured. The separate Tetris
functional CI #43939723976 is still an older SHA, excluding
the later game-over/audio-source-style corrections.
Do not claim visual success before the run finishes.

---

## Source CSS integrity for Tetris — 17 November 2026

Copied the exact original Tetris 13bc CSS to
`migration/source-css/tetris.css` with original/target Git
blob SHA agreement, and extended `npm run audit:legacy`
to check it against `migration/legacy-files.tsv`.
This later batch is beyond Tetris acceptance CI #43939723976;
do not claim it passed without a new opt-in gate.
The source 3px cyan button border and 300px statistics width
remain explicitly traceable. No original screenshot pairing.

---

## Tetris game-over source animation continuation — 17 November 2026

Source 13bc ends with a white 22-row board wipe, advancing each
row every 8 frames, then GAME_OVER_END opens the stats window.
The React model and animation loop now implement this sequence
with a deterministic top-out regression. This is **after**
Tetris CI #43939723976 at SHA `88e4895` and is not covered
by that older run. The next explicit acceptance gate must
cover this correction alongside the visual/browser fixes.
Keep draft PR #1, no main merge or release.

---

## Visual plan for first playable Tetris and parented child windows — 17 November 2026

Authored four deterministic React-only screenshot scenes for
original Tetris fullscreen board, played/locked piece, Help and
Statistics child windows, taking planned target coverage to 68
desktop/mobile PNGs. Also corrected existing Minesweeper
statistics/result selectors to find their new desktop siblings,
not descendants of the main game window. This is a capture
**plan**, not an executed or visually accepted run.
Run `[capture-visual]` only after functional Tetris acceptance,
inspect the new visual manifest/PNG artifact, and keep
`sourceComparisonEligible=false` for these target-only scenes.
No main merge/release. Draft PR #1.

---

## Deliberate Tetris playable milestone acceptance — 17 November 2026

Following Tetris pure engine, source canvas layout, nine exact pinned
source background/audio imports, game window and two browser scenarios,
run one explicit **[run-ci]** acceptance: TypeScript, all Vitest
(including Tetris physics/layout/stats), original source integrity
audits, production Vite build, all desktop/mobile Playwright cases,
and source Tetris menu/play/hard-drop/Help/Statistics window tests.
Do not mark Tetris fully implemented or verified merely because
it is visible in the Games folder; original animation, pointer,
audio and source-vs-target pixel pairing are still unfinished.
The prior child-window CI #43937165381 used SHA `481babc`
and cannot accept Tetris changes. Record the new exact run result
before making any acceptance claim. No repeat CI on ordinary commits.

---

## Playable source Tetris integration (pending acceptance) — 17 November 2026

The source 13bc Tetris is now a real React canvas game rather than
an unavailable Games tile. Implemented full-screen fixed shell
registration, source-shape/score physics and 60fps tick loop, original
responsive canvas projection, keyboard/touch-pointer play/pause/new
controls, independent Help/Stats child windows, browser statistics
adapter and nine byte-identical source background/audio assets.
See `migration/TETRIS-SOURCE.md`. Added two paired desktop/mobile
browser contract tests in `tests/e2e/tetris.spec.ts`. The legacy
tracker remains **in-progress** because source input timing,
animations and exact original GameStats/visual parity are not
fully accepted. This work followed child-window CI #43937165381,
which ran on prior SHA `481babc` and does **not** test Tetris.

Do not claim runnable acceptance until new opt-in `[run-ci]`
tests TypeScript, unit, source image/audio inventory and browser
actions. Do not merge draft PR #1 into main. Original Vue source
comparison is `not-assessed`, not complete.

---

## Tetris source engine foundation — 17 November 2026

Started pinned Tetris 13bc pure engine under
`packages/apps/games/src/sourceTetris.ts` (type-safe 10×22 grid,
seven original shapes, source gravity/score, piece movement/rotation,
soft and hard drop, pause, line burn and lock-height ARE delay).
Added deterministic Vitest cases and exported the reusable pure
model, documented `migration/TETRIS-SOURCE.md`, and marked
`src/modules/games/tetris.js` **in-progress** in the module
tracker. Tetris Games tile stays deliberately disabled because
the source 60 FPS canvas, keyboard/pointer event handling, assets,
game-over animation and stats/help windows are not ported.
This is not a playable implementation or complete source parity.
The latest child-window [run-ci] #43937165381 began at earlier
SHA `481babcdfa807d861d405840f88de37f2fbdc8ab`
and does **not** include the Tetris additions. Batch a later
opt-in CI acceptance after the next actual Tetris slice.

---

## Deliberate source child-window acceptance gate — 17 November 2026

The previous commit `05ffe44` introduces a reusable portal-backed
`SourceChildWindow` and ports pinned 245c result/stats to independent
desktop child windows. This follow-up **[run-ci]** marker explicitly
requests one full GitHub Actions acceptance: TypeScript, Vitest,
byte-pinned source audits, Vite build, all desktop/mobile browser
tests, including new parent-instance lock and titlebar-close checks.
It does NOT initiate visual capture. Wait for the exact CI outcome;
a successful earlier Advanced snapshot is not sufficient to accept
this refactor. Normal pushes stay skipped. Source-original vs
React screenshot pairing remains `not-assessed`.

---

## Minesweeper child-window port — 17 November 2026

Accepted Advanced functional gate:
[CI #43876750158](https://github.com/codersachin99/windows-os/actions/runs/43876750158)
SUCCESS, exact SHA `8fe240ca8b505cf2d39ea9ab75d024abceb2c075`:
**507/507 unit tests**, **454/454 Chromium desktop/mobile cases**,
TypeScript, source file hashes, Contacts audit, production Vite build.
Accepted Advanced visual baseline:
[run #43877288974](https://github.com/codersachin99/windows-os/actions/runs/43877288974)
SUCCESS, exact SHA `19e36d9e2c74de4369fd674c4f49367047cdd37b`:
**60/60** React screenshots; zero errors; original source inaccessible,
`parityStatus=not-assessed`. ZIP artifact 14230782421.

New work: pinned source 245c has result and statistics as separate
window siblings. Added reusable `SourceChildWindow` inside the
UI package; portaled result/stats out of main game with native shell
titlebars, exact parent-instance locking, close/minimize behavior and
focus handling. Existing gameplay and stats controls are unchanged.
Changed E2E/capture selectors for the now separate DOM siblings.
Added browser acceptance for parent inert lock, titlebar exits,
and child removal. See `migration/GAMES-SOURCE.md`.

**Not accepted by prior CI**; verify on the next explicit
`[run-ci]` commit, then consider a target visual scene capture
before claiming visual approximation. Original paired source
screenshots and other six game engines remain missing.
Do not merge draft PR #1 into main or tag a release.

---

## One deliberate Advanced visual capture — 16 November 2026

Added three target-only Minesweeper scenes: Advanced fullscreen,
Statistics dialog, and delayed result dialog, with a strict wait
for the viewport-sized Advanced grid before any PNG. This commit
opts in only to **[capture-visual]** to collect 60 React screenshot
scenes (30 × desktop/mobile). The source Vue comparison remains
unavailable; screenshot status must stay `not-assessed` until a
real pinned original-source reference is captured. Inspect the
run manifest, error count and actual new PNGs before recording
success. Do not trigger another full CI with this visual commit.
Advanced functional [run-ci] #43876750158 is a separate earlier SHA.

---

## Target visual fixture extension — 16 November 2026

Prepared React-only `minesweeper-advanced`,
`minesweeper-statistics`, and `minesweeper-result` visual capture
fixtures. These use actual UI flows and deterministic mine placement,
not hand-authored screenshots. 30 scenes × desktop/mobile = 60
**planned** PNGs. Original source comparison remains unavailable;
do not claim a successful capture until the separate
`[capture-visual]` workflow completes, even if Advanced CI passes.
See `migration/VISUAL-APP-SCENES.md`.
Keep draft PR #1 and no main merge.

---

## Advanced acceptance correction — 16 November 2026

The first Advanced opt-in CI
[run #43876422581](https://github.com/codersachin99/windows-os/actions/runs/43876422581)
failed at **one newly added unit assertion**:
`packages/engine/src/index.test.ts` expected the original generic
`TOGGLE_MAXIMIZE` no-op on a non-resizable window to return the same
DesktopState object. Existing reducer behavior always allocates a new
state object for this action, even though it correctly leaves the
fixed game window `maximized:false`. The test was too strict;
change it to assert the actual non-maximized behavior rather than
object identity. The run stopped at Vitest; browser acceptance was
not executed. The pure viewport sizing tests passed.

The following deliberate `[run-ci]` commit verifies the corrected
test plus full Advanced desktop/mobile browser coverage. Do not
claim acceptance until its run completes on the exact new SHA.
No CI on routine pushes, no merge or release.

---

## Deliberate Advanced acceptance gate — 16 November 2026

`6f4dea9` adds source 245c Advanced fullscreen behavior and
window content-box 22px grid sizing. This commit opts in **once**
with `[run-ci]` to check TypeScript, all unit tests, original-source
image/audio/CSS audits, Contacts audit, production Vite build and
the entire desktop/mobile Playwright suite including the new
Advanced on/off fullscreen case. Older accepted baseline is
[CI #43856185812](https://github.com/codersachin99/windows-os/actions/runs/43856185812),
452/452 at `e19ed49e`; it does **not** include Advanced.
Do not claim this new batch passes until checking the exact workflow
run and head SHA. Unmarked subsequent commits are CI-skipped.
Keep PR #1 draft, main untouched, no release.

---

## Minesweeper Advanced measured fullscreen continuation — 16 November 2026

Latest accepted opt-in
[CI #43856185812](https://github.com/codersachin99/windows-os/actions/runs/43856185812)
succeeded on **e19ed49e3cbebae624a1c1e5332d03771dc3f9fe**:
**452 / 452** desktop+mobile Chromium browser cases; TypeScript,
unit tests, original image + audio + CSS byte audits, Contacts audit
and production build all passed. This accepts result/stats, source
CSS styles, game icon and original audio as scoped React behavior,
but not full source pixel parity.

The next slice implements source 245c Advanced:
fullscreen fixed game window, viewport-derived 22px grid and
half-density mine count, read after shell fullscreen commit, and
normal-size restoration on Beginner/Intermediate. Game-specific
fullscreen cannot maximize unrelated fixed windows. Added unit,
reducer and paired browser tests. See `migration/GAMES-SOURCE.md`.
No claim of acceptance until exact newer [run-ci] success.
Six additional game engines, original source account storage and
independent child windows remain pending. Draft PR #1 and main
unchanged; no release. Do not trigger CI for routine pushes.

---

## Minesweeper result/statistics accepted; source CSS+audio gate — 16 November 2026

[Opt-in CI #43853843232](https://github.com/codersachin99/windows-os/actions/runs/43853843232)
completed **SUCCESS** at exact SHA `1ec009a94bcf279b847267d3b2234453c66b4caa`:
**452 / 452** desktop/mobile Chromium browser cases passed, including
deterministic loss, replay, per-level statistics and Reset/Cancel;
TypeScript, all unit tests, source image/Contacts audits and Vite
production build also passed. This is the accepted 245c result/stats
lifecycle checkpoint, not full source pixel or account-persistence parity.

After that baseline, `9d56cb9` imported **two original Minesweeper mp3s**
with matching source/target Git blob SHA, restored original cyan-to-navy
board/stats layout using source CSS values, and saved original CSS bytes;
`5eb31d9` added byte-exact CSS integrity audit. These are not covered
by #43853843232. The current opt-in **[run-ci]** commit accepts that
later CSS/audio slice and all previous regression tests once its own
run completes successfully. Do not mark it passed before checking the
exact run SHA/steps. Regular future pushes remain CI-skipped.

Open draft PR #1 remains unmerged; main unchanged and no release.
Do not present target-only screenshots as original pixel parity.

---

## Source Minesweeper visual/audio continuation (16 November 2026)

Source-verified `src/styles/games/minesweeper.css`: the previous
generic gray scorebar and face button above the game were not the
original Minesweeper's cyan/navy board and bottom stats bar.
React is now sourced to these exact tile/number colors, border,
opacity and background values. Two original new-game/loss mp3
assets were imported byte-identically, and the legacy audit now
verifies all imported audio bytes. Original CSS itself is preserved
as a byte-identical migration reference.

The result/statistics acceptance CI #43853843232 ran against SHA
`1ec009a94bcf279b847267d3b2234453c66b4caa` and does NOT
include this newer CSS/audio commit. Wait for its actual result
before scheduling a new opt-in `[run-ci]` gate. Original pixel
parity/host account storage still not assessed. No main merge or
release; PR #1 remains draft.

---

## Deliberate Minesweeper dialog/statistics acceptance gate — 16 November 2026

Request one `[run-ci]` gate for the previously committed 245c
result/statistics UI and pure browser stats model. Verify TypeScript,
Vitest, source hashes, Contacts audit, Vite build and all paired
desktop/mobile Playwright contracts including the deterministic
first-safe-click/loss/restart/Statistics/Reset sequence.
This handoff opt-in commit has no additional behavior changes.
**Do not claim success** until the exact linked workflow completes.
Do not enable `[capture-visual]` by default; private source screenshot
reference remains unavailable. Keep PR draft and main unchanged.

---

## Minesweeper source result + statistics slice (16 November 2026)

Latest accepted baseline: [CI #43838335106](https://github.com/codersachin99/windows-os/actions/runs/43838335106)
completed **SUCCESS** at exact SHA `2edf0cc10210aad11aed32adc5d5c64fb19dccd0`:
TypeScript, Vitest, original image/blob source inventory, Contacts audit,
production build and all desktop/mobile Chromium browser contracts.
It accepts 11 byte-identical imported Games/Minesweeper images.

New post-baseline development: delayed source result dialog with
original 245c English win/loss text and replay/exit, show every mine
on loss, active per-level Statistics menu, browser-persisted played/
won/best times and Reset confirmation. Added unit and deterministic
browser regressions. See `migration/GAMES-SOURCE.md`.
Source `e0b8` persistence format and independent OS child windows
are not yet ported; browser storage/overlays are declared adapters.
Do not claim complete source parity or a new CI pass until a dedicated
`[run-ci]` run tests this post-baseline commit.

Keep PR #1 draft, main unchanged, no release. Ordinary pushes keep
GitHub Actions skipped unless deliberately tagged.

---

## Deliberate Games graphics acceptance gate — 16 November 2026

After byte-identical restoration of 11 original Games/Minesweeper images
in `0badbc1`, request exactly one full opt-in **[run-ci]** check.
The existing `npm run audit:legacy` already independently re-computes
Git blob SHA-1 plus byte sizes for **every** imported image against
`migration/legacy-files.tsv`; this includes all 11 newly restored images.
Also check TypeScript, Vitest artwork routing tests, production build, and
paired desktop/mobile Playwright Games/Minesweeper artwork selectors.
Do not record this new code as CI-accepted until its exact workflow
result is SUCCESS. Earlier accepted snapshot remains
[CI #43817006528](https://github.com/codersachin99/windows-os/actions/runs/43817006528).
No automatic CI runs on subsequent ordinary commits; the existing
`[run-ci]` workflow condition remains unchanged.

---

## Games original graphics restoration (16 November 2026)

Exact pinned original Games library (eight icons) and Minesweeper
(three WebP graphics) were copied through authenticated source Base64
and target Git blob creation. All **11 / 11 source-to-target Git blob
SHA-1 comparisons passed**. React icon routing and Minesweeper
sprite rendering are updated with unit and Playwright assertions.
No release, merge or false pixel-parity claim. Source copyright/
redistribution clearance remains a release blocker.

The previous deliberately opted-in
[CI #43817006528](https://github.com/codersachin99/windows-os/actions/runs/43817006528)
at `036b5f1d462aaa2b6add3644566b438ac5a85b2c`
completed **SUCCESS**: TypeScript, Vitest, original-source audits,
production build and browser contracts. That run covers the earlier
timer/mobile-scroll corrections but **not this later artwork commit**.
Do not run Actions for every normal push; use an explicit
`[run-ci]` commit when the next functional/artwork batch is ready.
The successful 54 target-only images remain visual evidence without
original-side reference. PR #1 draft, main untouched.

---

## Games/Minesweeper accepted 450/450; final source-timer regression gate — 16 November 2026

**Accepted functional source snapshot:** opt-in
[CI #43814952314](https://github.com/codersachin99/windows-os/actions/runs/43814952314)
at exact SHA `760fa39a1246d3cb164c2b690157bb6820301967`
completed **SUCCESS**: **450 / 450** desktop/mobile Chromium browser
tests, TypeScript, all unit tests, source inventory and Contacts
source audits, and production Vite build. This includes the newly
registered original `shell:games` library and actually playable
Minesweeper Beginner/Intermediate source board/game UI, with
safe disabled entries for six still-unported game engines.

**Accepted screenshot evidence:** explicit
[visual capture #43816057643](https://github.com/codersachin99/windows-os/actions/runs/43816057643)
at `7320d45` **succeeded 54 / 54 React-only desktop/mobile PNGs**
with **zero errors**, artifact **14203045417** (26.4 MB).
All six new Games/Minesweeper images were downloaded and visually
inspected. Source checkout was unavailable:
`sourceConfigured=false`, `sourceCaptured=0`,
`parityStatus=not-assessed`. These are target screenshots,
**NOT original/React pixel parity**. The Win7 Minesweeper 12x12
Intermediate board needs inner content scrolling at mobile widths;
a new Playwright regression asserts the final row/cell remains
scroll-reachable in the window.

**Post-450 CI code:** original pinned `minesweeper.js`
webpack 245c starts its timer only while Board.state() is PRISTINE.
Earlier flagging flips the board to IN_PROGRESS, so the clock
remains stopped on later opening; added typed
`sourceMineShouldStartTimer` and its unit regression and wired it
into the React handler. Also added the Intermediate bottom-right
scroll-reachability browser assertion. Both are **after** the
450-pass CI SHA and must not be claimed as accepted by that run.

This deliberately opted-in **[run-ci]** commit tests those later
changes and all existing source-backed apps as a single gate. Inspect
the exact new Actions result before promoting this checkpoint;
ordinary subsequent pushes remain skipped. Pinned source Games/WebP
binary artwork is **still missing**. A safe test of cross-repo
Git object reuse failed with HTTP 422; no source blobs were copied
or branches mutated by the experiment. Require legitimate source
binary import plus matching Git blob SHA checks before claiming
asset parity. Keep PR #1 draft, main unchanged, no release.

## Pinned Minesweeper timer correction + source Games visual proof — 16 November 2026

Original `src/modules/games/minesweeper.js` webpack 245c
starts the 1-second timer only while `9538.Board.state()` is
`PRISTINE`. The source Board `cycleCellFlag` transitions to
IN_PROGRESS before a first reveal; opening after an early flag
therefore does not start the clock. Extracted
`sourceMineShouldStartTimer` and used it in the React game
handler; added unit cases preserving that exact source quirk.
These commits are **after** Games CI #43814952314's code SHA.

Three new source-traced but **React-target-only** visual scenes
(`games-library`, `minesweeper-initial`,
`minesweeper-intermediate`) are prepared for full desktop and
mobile captures, raising expected React images to **54**.
This explicitly opted-in **[capture-visual]** commit exercises
those scenes and preserves the resulting artifact. The pinned
legacy Vue source is still private and lacks a configured read
token, so no source-pair pixel acceptance is expected or claimed.
If capture is red, inspect exact logs/fixtures before calling it
successful. Source game image assets remain missing; screenshots
are UI evidence, not source parity.

Full opt-in [Games CI #43814952314](https://github.com/codersachin99/windows-os/actions/runs/43814952314)
on `760fa39` had completed TypeScript, Vitest, both source audits
and build; Playwright was still running at last poll. Do not
label Games or Minesweeper CI accepted before completion.
One newer full `[run-ci]` gate is necessary for the post-snapshot
timer change; do not trigger it before learning the current run's
actual browser results. PR #1 remains draft, main untouched, no release.

## Games visual fixture follow-up — 16 November 2026

Added three **target-only** visual capture scenes for the new
source-backed Games and Minesweeper slices:
`games-library`, `minesweeper-initial`,
`minesweeper-intermediate`. They are authored for desktop 1920x1080
and mobile Pixel 7; the plan is **54** total target PNG captures
(27 scenes × 2 profiles). This is code/config preparation only,
**not a successful screenshot capture**. The previous 48-image run
#43809843426 remains the last actual target capture; private
source access was absent and original pixel parity not assessed.

[Full opted-in Games CI #43814952314](https://github.com/codersachin99/windows-os/actions/runs/43814952314)
was in progress on source SHA
`760fa39a1246d3cb164c2b690157bb6820301967` when last checked:
TypeScript, units, source/Contacts audits and Vite build passed;
desktop/mobile Playwright was still running. The visual fixture and
this handoff commit are **after that CI snapshot**. If CI succeeds,
review real gameplay test results before deciding whether to opt in
to one `[capture-visual]` run. Keep PR #1 draft and no release.

## Source Games library + first playable Minesweeper; combined gate (16 November 2026)

[Previous full CI #43813132144](https://github.com/codersachin99/windows-os/actions/runs/43813132144)
completed **SUCCESS** on exact commit
`ecae28088d7b6ad2b77301e4511e86d643c26928`:
**442 / 442** desktop/mobile Chromium tests, TypeScript, all units,
source inventory and Contacts audits, production Vite build.
This accepts the source a259 Control Panel current-location icons,
25px breadcrumb with ancestor-only navigation, XP skin guard and
24th-tile responsive reachability. It does **not** accept later code.

**After** that source SHA, traced original `games.js` webpack 24d9,
`computer.js` pane-games, and filesystem 5401: source special folder
`shell:games` is **not** the physical Guest Start-menu Games .lnk path.
Created `packages/apps/games` containing a native source Games
library, source seven installed offline titles and publishers,
two collapsible `SourceListView variant="tiles"` sections,
and explicitly empty original Online games. Registered the Games app
and original right-side Start-menu entry. Games and its assets are
**in progress**, not complete pixel/interaction parity.

Traced original Minesweeper webpack **9538** board semantics and
**245c** UI: implemented source Fisher–Yates generator,
rectangular board/8-neighbor counts, three flag states, flood fill,
Board WON/LOST behavior, and source Beginner (8x9, 10 mines) /
Intermediate (12x12, 30 mines). Added an actual playable
`MinesweeperApp` with source first-click reroll, game result
counting, restart, timer, contextual flag cycle, and touch flag
adapter. Registered a real Minesweeper `game` runtime; it is now
the **one enabled tile** in the Games library. Remaining six
games stay disabled pending their own engines. Original sprites,
audio, Advanced viewport sizing, statistics, skin polish and
source-versus-target pixel comparison are NOT implemented/verified.
Source exact game icon WebPs remain inventoried but absent; generic
adapter fallback is not represented as parity. New unit and paired
Chromium cases cover source engine and gameplay. See
`migration/GAMES-SOURCE.md`.

This **deliberately opted-in [run-ci]** commit checks the *entire*
post-ecae280 Games/Minesweeper slice, including actual UI browser
routes and all existing apps. Do **not** mark success until the exact
CI run completes and all tests are inspected. Ordinary subsequent
pushes must not trigger expensive Actions; no premature main merge,
release, or draft PR ready-for-review.

## Full CI accepted and source addressbar icon follow-up — 16 November 2026

**Latest validated snapshot:** [CI #43811148997](https://github.com/codersachin99/windows-os/actions/runs/43811148997)
completed **SUCCESS** on `fcaa2e362b4c92a283dc868d3fa1fbbaaf5c178d`.
**436 / 436** desktop/mobile Chromium Playwright tests passed,
along with TypeScript, all Vitest unit tests, both original-source
audits and the production Vite build. It includes the corrected
search Back/Forward expectation, original 300ms indexed search, and
shared exact Win7 nav WebP sprites. Earlier #43808943088's two
obsolete assertions are fixed and no longer failures.

After that CI source SHA, the next parity slice:
1. passes the real theme through `DesktopShell` to Control Panel,
   limiting the original Win7 27px sprite to Win7 instead of applying
   it to WinXP and Win11; adds theme unit and XP browser regressions;
2. scrolls and verifies all 24 original root tiles under the
   responsive window on both desktop/mobile with a browser contract;
3. ports pinned `a259.currentLocation.icon` and
   `a259.addressLocation` into the React addressbar, using
   source-locked active page WebP artwork instead of a static root
   icon and rendering the current segment as text (only ancestors
   are clickable). Adds unit tests for six icons and paired browser
   tests for root/Action Center transitions. See
   `migration/CPANEL-REGISTRY-SOURCE.md`.

This next **[run-ci]** commit opts in to one full acceptance batch
for all of the post-`fcaa2e3` source UI and regression changes.
Do **not** mark that batch successful before checking its exact
run SHA/result. The 48 React-only screenshots in visual run
#43809843426 were captured successfully, but the private legacy Vue
runtime was unavailable: original-versus-React pixel parity remains
`not-assessed`. No main merge, release, or draft-PR promotion.

## Theme-safe Control Panel navigation and mobile reachability — 16 November 2026

After the `fcaa2e3` opt-in CI snapshot, inspected original Win7
Control Panel desktop/mobile captures and identified that its exact
27px Win7 sprite must not leak to the other supported skin IDs.
`DesktopShell` now passes actual theme to `ControlPanelApp`;
source-pinned Win7 shared artwork is used when and only when
`theme==="win7"`. WinXP, Win11 and other themes keep previous
neutral Back/Forward controls while their individual source skins
remain unported. Added `themeNav.test.ts` and XP browser navigation
regressions, plus a browser test verifying that all 24 original
Control Panel tiles can be scrolled to on both desktop and mobile
without document-level horizontal scrolling.

**CI separation:** [CI #43811148997](https://github.com/codersachin99/windows-os/actions/runs/43811148997)
is testing `fcaa2e362b4c92a283dc868d3fa1fbbaaf5c178d`
and had passed TypeScript/unit/audit/build while browser tests were
running at last inspection. All theme-safe and viewport reachability
commits are **after** its snapshot and require the next opt-in
acceptance, not an automatic extra CI per commit. PR #1 draft, no merge
or product release. The earlier React-only visual capture
[43809843426](https://github.com/codersachin99/windows-os/actions/runs/43809843426)
succeeded 48/48 with no source comparator.

## Acceptance follow-up: stale test fixed, 48 visual screenshots verified (16 November 2026)

- [CI #43808943088](https://github.com/codersachin99/windows-os/actions/runs/43808943088)
  completed with **432 / 434** Chromium desktop/mobile tests passing.
  TypeScript, all units, source/Contacts audits and Vite build passed.
  The only two failures were identical outdated Playwright assertions in
  `tests/e2e/cpanel.spec.ts`: after opening the "Customize icons on
  the taskbar" search result then navigating Back, the test expected
  root tiles. The source `a259.openLocation()` **preserves query and
  searched results**. This code behavior was already correct; fixed
  the stale test in commit `43c526d` to assert retained task results,
  then explicit empty search input and home tiles.
- [Visual #43809843426](https://github.com/codersachin99/windows-os/actions/runs/43809843426)
  completed **SUCCESS** at `b9fb0fe`: 48 / 48 React screenshots
  across 24 desktop and 24 mobile scenes, **zero capture errors**,
  artifact ID `14200540179`. All four Control Panel scenes succeeded
  in both profiles. Source token was not configured; the exact pinned
  `legacy-win7` instance was **not captured**, so visual source
  parity is **not assessed**. Artifact is accessible from that run.
  Screenshot ZIP was downloaded and the desktop/mobile Control Panel
  PNGs inspected: source sprite navigation renders, all four target
  surfaces are visible, narrow mobile scroll containers are present.
  No comparison to source pixels was possible.
- `migration/module-tracker.json` now includes the new registry,
  Backup/Restore, source 5985 and 1902 engines, original artwork and
  shared Win7 nav evidence without upgrading source status to verified.

The following deliberately opted-in **[run-ci]** push tests current
code including the corrected historical browser expectation,
source-delayed search and Back query retention, shared exact WebP
27px history nav for Explorer+Control Panel, new unit/desktop/mobile
nav contracts, and all previously accepted app suites.
**Do not claim this batch succeeded until it completes.**
Keep PR #1 draft, no main merge or release.

## Shared exact Win7 navigation sprites + deliberate visual capture (16 November 2026)

Ported the original 27px Win7 Back/Forward history navigation sprite
from the Explorer-only CSS into the reusable
`packages/ui/src/SourceWin7HistoryNav.tsx` and
`sourceWin7HistoryNav.css`. The exact original source WebP data URLs
and -27px hover / -54px pressed / -81px disabled offsets were preserved,
with horizontally mirrored Forward. Explorer retains its existing
`SourceWin7Navigation` wrapper and selectors, now delegating to the
generic sprite control. Control Panel replaces its approximate 25x24
text arrows with the same source navigation and retains functional
history and Playwright `data-test-cpanel-back/forward` selectors.
A dedicated `@windows-os/ui/navigation` Vite/TS alias avoids cycles.
New shared SSR unit and desktop/mobile CSS+history E2E tests are
committed. See `migration/SEARCH-ADDRESSBAR-SOURCE.md` and
`migration/CPANEL-REGISTRY-SOURCE.md`.

**Acceptance boundaries:** original [CI #43807380475](https://github.com/codersachin99/windows-os/actions/runs/43807380475)
**passed 432/432 browser tests** on f565741. Opt-in
[CI #43808943088](https://github.com/codersachin99/windows-os/actions/runs/43808943088)
on f5c3463 had passed TypeScript, units, audits and build and was
running browser tests when last checked. The exact-sprite extraction
and its new tests are **after that CI snapshot**, therefore not yet
accepted. Do not merge or release.

This commit intentionally uses **[capture-visual]** to obtain real
target React desktop/mobile screenshot evidence for all existing
scenes plus the four Control Panel new scenes, independently of full
CI and only once this milestone needs visual review. If the private
source access token is missing, the workflow correctly records
target-only evidence; it must not report source pixel parity.
After screenshot evidence, inspect the actual artifact and run one
deliberate `[run-ci]` gate on this newer shared UI when the existing
CI finishes. Keep PR #1 draft, main untouched.

## Acceptance #43807380475 passed; full source-search follow-up (16 November 2026)

[Opt-in CI #43807380475](https://github.com/codersachin99/windows-os/actions/runs/43807380475)
completed **SUCCESS** on exact SHA `f565741f02d2777f53621bb61fbd23500dbd5041`:
**432 / 432 Chromium desktop+mobile tests**, TypeScript, all unit tests,
original source inventory audits, Contacts source parity audit, and Vite
build. This validates the pinned 24-icon/66-task Control Panel registry,
original weighted `5985` search engine, task routes, Backup/Restore
browser interchange, and corrected strict test selectors, but **not**
any commits made later.

The next code batch added pinned source **1902** delayed search and
five fake-timer tests, wired it to the Control Panel's distinct
`searchText` input and `searchedText` indexed results, and added
four target-only screenshot scenes in `scripts/capture-visual-parity.mjs`
for desktop/mobile. Source proof: pinned
`src/modules/shell/win7-ui.js` `WinuiSearchbox instant` emits every
keystroke at once, while pinned `cpanel.js` `a259.search(t)` calls
`delayedSearch.type(t)` and thus delays **result updates** by 300 ms.
Source `a259.openLocation(t)` does not clear search state: when Back
returns from a matched panel to root, the original search results
reappear. React now preserves both search values until explicit user
clear; new paired browser test covers Back and clear. It is a
source-fidelity correction, not a new feature.

**Next action:** execute one opt-in `[run-ci]` checkpoint over these
later engine/UI/tests, inspect results before calling them accepted.
Then opt-in `[capture-visual]` for target-only source-locked
screenshots if CI passes; source/target pixel parity remains **unproven**
because the legacy private runtime has not been captured. Draft PR #1
only, no merge to main and no product release.

## Follow-up visual capture fixtures — 16 November 2026

Added four explicitly **target-only** Control Panel screenshot scenes in
`scripts/capture-visual-parity.mjs`: `cpanel-root` (24 original
source tiles/art), `cpanel-search` (quoted Display task after source
1902 debounce), `cpanel-backup` (real browser ZIP view), and
`cpanel-action-center` (real Guest empty history). Each captures at
1920x1080 desktop and Pixel 7 mobile for eight additional target-only
images when the explicit opt-in visual workflow is run. These
scenarios are **not source comparison eligible**, because source-side
Vue selectors have not been verified at the exact private pinned SHA;
they are reproducible evidence plans, not successful screenshots or
pixel-parity claims. Details: `migration/VISUAL-APP-SCENES.md`.

Latest branch includes source 5985 full shared search, source 1902
300ms delayed search, and new target-only capture fixtures.
Opt-in [CI #43807380475](https://github.com/codersachin99/windows-os/actions/runs/43807380475)
at **f565741** passed TypeScript/unit/source audits/build at the last
poll; browser tests were still running. All debounce and visual-fixture
commits were made **after** f565741 and require separate acceptance.
No unnecessary second GitHub Actions run has been triggered.
Keep PR #1 draft; no main merge or release.

## 1902 source search latency follow-up (16 November 2026)

The pinned `shared~cpanel~startmenu...` webpack **1902** exports
`delayedSearch(callback, delay=300)` with source semantics:
nonempty text schedules a 300 ms emission; a new value cancels the
prior timer; empty text emits immediately; `now(text)` emits only if
different from the last delivered value; and `cancel()` clears a
pending timer. Implemented shared
`packages/engine/src/sourceDelayedSearch.ts`, exported from
`@windows-os/engine`, with five fake-timer unit tests.

`ControlPanelApp` now preserves responsive input text while separately
debouncing the searched query, automatically cleans up timers when the
window unmounts, and prioritizes the active navigated page over stale
search results. This is source-backed behavior, not a new search feature.

**CI boundary:** [Run #43807380475](https://github.com/codersachin99/windows-os/actions/runs/43807380475)
at `f565741` had passed TypeScript, units, source audits and build;
desktop/mobile Playwright still running when last checked. All 1902
helper and React debounce commits came **after** that exact CI snapshot.
They are committed but **not yet CI accepted**. Do not trigger a
second expensive browser run while that older one is still executing
unless there is a clear need. PR #1 remains draft and main unchanged.

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


## 19 November 2026 — Win8 source Search result keyboard selection and full-check request

The last finished exact-source [CI #44375432800](https://github.com/codersachin99/windows-os/actions/runs/44375432800)
passed on `c561149`, before subsequent independent Win8 Start group,
native wheel and Search navigation improvements. The current source is
still pinned to `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`,
and PR #1 remains **DRAFT**; neither `main` nor the reference is touched.

The original Win8/Win81 Start flyout's `start-search-results` has a
selected index and keyboard handling; the React slice previously
launched the first result regardless of ArrowUp/ArrowDown.
[7ede461](https://github.com/codersachin99/windows-os/commit/7ede461eab0bd3d77b90e1099a7227b7503c3ae7)
restores selected-result keyboard and pointer behavior;
[f52dd18](https://github.com/codersachin99/windows-os/commit/f52dd182cdeb378236691343b102e221e9101d60)
adds the original selected color; and
[5b63146](https://github.com/codersachin99/windows-os/commit/5b6314627781cdcf74770d7564a7ef8400bb6357)
adds actual browser regressions in `source-win8-start.spec.ts` for
Win8 and Win8.1. The immediately preceding tile-group and horizontal
wheel commits also remain outside the older green run.

**Action now:** inspect the opt-in CI result of this handoff commit
(`[run-ci]`). Check TypeScript, unit/source/artwork/build, focused
and full desktop/mobile Chromium. Fix genuine failures rather than
relaxing tests. Source-paired visual capture remains blocked if the
private original is not accessible in runner; do not report pixel
parity. Continue unimplemented theme families and desktop/menu/
Computer/Bin source parity after verification. Never auto-trigger CI
without the explicit marker; do not merge the draft PR or release
while acceptance is incomplete.


## 19 November 2026 — full Win8/8.1 Start Search Guest file results

**Verified previous:** [CI #44425244752](https://github.com/codersachin99/windows-os/actions/runs/44425244752)
completed **success** against `5e4eaf7`: TypeScript, unit/source/art
contracts, Vite, focused and full desktop/mobile Chromium. Visual
capture was skipped. The resulting Win8 search keyboard/grouping/wheel
work is accepted at that exact SHA only, not screenshot parity.

**New code:** [18f5d3d](https://github.com/codersachin99/windows-os/commit/18f5d3d8e59e4d245e1bc263f2cdf4e2c378aba6)
adds real mounted Guest VFS search to the fullscreen Win8/Win81 Search
pane, with source-ranked filtering, cancellation, bounded results,
trash exclusion and file-store invalidation. The presentation separates
Programs from Files and folders.
[fbce994](https://github.com/codersachin99/windows-os/commit/fbce994736d3d1478bdaf25e95789f4c7285c7d2)
reuses Guest app associations for opening text, picture, media, paths
and resolved source shortcuts, with truthful failure errors for
unported cases.
[2c9bd54](https://github.com/codersachin99/windows-os/commit/2c9bd54d1ebdf6bc8a993e29f1eb92585d609323)
adds scoped CSS; [29b92b0](https://github.com/codersachin99/windows-os/commit/29b92b0cd7a32b78a7c1ebaf3a3a9bf6aaedc25f)
uses actual desktop UI upload then Win8/Win81 Search and Notepad
launch in the browser, not mocked files.

**Next:** this `[run-ci]` handoff commit deliberately requests
one exact-head verification. Review full TypeScript/unit/source/art/
build/desktop+mobile browser status and actual failure logs; fix
regressions without loosening behavioral checks. Screenshots require
a separate original-source visual gate. Do not alter immutable
`codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`,
target `windows-os/main`, or draft PR #1 status. No release or
full-theme parity claims.


## 19 November 2026 — Follow-up after actual failed Win8 Start Guest search CI

[CI #44465134125](https://github.com/codersachin99/windows-os/actions/runs/44465134125)
at `1803a79` exited **failure** in focused browser: **363 passed,
2 skipped, 5 failed**; TypeScript, unit, source migration inventory,
byte-identical artwork, Contacts integrity and Vite build passed. Full
desktop/mobile browser did not run; visual capture skipped.

Playwright `error-context.md` from artifact `14501443759` shows
four failed Win8/Win81 file launch cases displaying actual unported
association error; `StartMenu.tsx` regex literals were accidentally
double-escaped. [facce577](https://github.com/codersachin99/windows-os/commit/facce577025b043f8ce065a621a51b398ba86353)
repairs `.txt`, media and `.lnk` matching without changing source
Guest VFS semantics. The fifth failure was a Win8/mobile apps-only
ArrowUp wrap test incompatible with newly included Guest file results;
[a709309](https://github.com/codersachin99/windows-os/commit/a709309f8d8afabefcd7389d2bbc9d81de85d062)
checks the last combined result, while
[3e81f48](https://github.com/codersachin99/windows-os/commit/3e81f48a222779a39572ad4342d02cd437d9e433)
and [5c4f113](https://github.com/codersachin99/windows-os/commit/5c4f113b5c9952b0932237b2ada80b4a44e73fa5)
ensure actual search completion before asserting keyboard state.

**Next action:** this deliberate `[run-ci]` checkpoint must establish
TypeScript, unit, original source/artwork, Vite, focused and full
desktop/mobile browser success for the corrected SHA. Investigate
real failures from artifacts and repair, never suppress tests.
Then resume highest-priority themes/context/Desktop/Start/Computer/Bin
source migration. Preserve locked `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`,
`windows-os/main`, PR #1 **draft**, and no releases.


## 19 November 2026 — Windows 10 theme chooser follows Win8 CI repair

Independent next theme-priority slice after the Win8 Search repair:
[c876061](https://github.com/codersachin99/windows-os/commit/c876061bfd7d92f1777c492e4db5583e92831afc)
adds the already source-art-backed `win10` Personalize card;
[d9b0eac](https://github.com/codersachin99/windows-os/commit/d9b0eac1f326fe5a207855c1bff53655ba7e4c61)
updates exact original asset/grouping unit expectations;
[5e0bd1e](https://github.com/codersachin99/windows-os/commit/5e0bd1eaced78f06ef8261fafd7146bec92f3252)
adds actual desktop/mobile theme switch, Win10 taskbar/Start,
wallpaper and reload persistence acceptance.

There are now **six partially implemented, selectable** source-backed
Personalize themes (Win7, XP, Win8, Win8.1, Win10, Win11). The full
37 original recognized theme IDs remain in the catalog; none is
certified screenshot pixel-perfect. This new chooser change is
**not included** in the existing Guest Win8 search repair CI
[#44473304311](https://github.com/codersachin99/windows-os/actions/runs/44473304311)
whose SHA is `5487b67`. Do not invent a test pass. Finish/fix
that run first, then deliberately opt in one exact-head full CI
for Win10 card without generating Actions on each intermediate commit.
Maintain PR #1 draft and original/main/release unchanged.


### 19 Nov verification marker for Win8 Guest search fixes + Win10 selectable Personalize

An intentional combined `[run-ci]` exact-head checkpoint is requested
here for the Win8 search extension-pattern/combined-result corrections
and the new Win10 Personalize card. This is separate from the already
started earlier [CI #44473304311](https://github.com/codersachin99/windows-os/actions/runs/44473304311)
on `5487b67`: that older run cannot verify the later Win10 chooser
changes, regardless of its eventual conclusion. Inspect the new run's
actual completed focused and full browser steps and correct failures.
Avoid further CI-marked commits for documentation-only work.
Original source, `main`, draft PR status and releases remain unchanged.


## 19 November 2026 — Windows 3.1 Program Manager and six honest partial-shell statuses

**Previous completed acceptance:** [CI #44474137082](https://github.com/codersachin99/windows-os/actions/runs/44474137082)
at `334e1a8` finished **SUCCESS** TypeScript, unit/source
inventory/artwork/Contacts audit, Vite, focused and full browser
desktop/mobile. It verifies corrected Win8/8.1 Guest-file Start
search, Win10 Personalize choice and app interactions.
Visual capture job was skipped; **no original screenshot parity claim**.

**Current work, newer than the green checkpoint:**
[0c3ec89](https://github.com/codersachin99/windows-os/commit/0c3ec898287f748a5ac50cad11d5d7eef7e58011)
corrected the source shell implementation status:
Win7, XP, Win8, Win8.1, Win10 and Win11 are now truthfully
`partial`, not `pending`. All other source catalog variants
remain `pending`, including `win31`; no theme is labeled
pixel-perfect. Unit/browser contracts updated in
[44da660](https://github.com/codersachin99/windows-os/commit/44da6604e050c320a761555bd78e7c4b910a7597)
and [2569f1b](https://github.com/codersachin99/windows-os/commit/2569f1bc425380b4d70a68e5729d2dc4e70a94b4).

Original `startmenu-win31.js` is a genuine 600×400 **Program
Manager**, not a Win7 menu. [985447d](https://github.com/codersachin99/windows-os/commit/985447dffef1cfeaa73d5bc55fb2e780c5a2e5b0)
adds a new source-shaped React component with separately closable,
maximizable and focusable Recent/Programs/Games child windows,
source Window/Help command structure and real app/power dispatch.
[0c6523a](https://github.com/codersachin99/windows-os/commit/0c6523ab9815293bdd9b62ea4b4c98f9b4dfff5d)
adds exact source 32px group icon, 24px caption, 600×400 frame,
`#2900ad` hover and constrained mobile geometry.
[fdbc798](https://github.com/codersachin99/windows-os/commit/fdbc7982fe045420093fff79bfdc769fac27f585)
routes only Win31 Start through the component; other themes unchanged.
[3e7147b](https://github.com/codersachin99/windows-os/commit/3e7147bafe97a00aac48b54b71befd5eddc5c667)
adds desktop/mobile browser tests for layout and actions;
[a1c6357](https://github.com/codersachin99/windows-os/commit/a1c63574eb8205ee4e6204d83278b410dae5d235)
opts these specs into the focused Actions test set.

**Next:** single deliberate `[run-ci]` commit at exact head,
inspect status/logs for TypeScript, all unit/asset/build, focused
and full browser. Fix real regressions rather than skipping tests.
Continue source Win31 themed taskbar/Desktop/context/Computer/Bin,
and all remaining original theme skins, with paired screenshot gate
before any full-parity claim. Preserve immutable
`legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`,
`windows-os/main`, PR #1 **draft**, and no release.


### Win31 group focus follow-up (newer than initial opt-in CI) — 19 Nov 2026

[052ec13](https://github.com/codersachin99/windows-os/commit/052ec1382ef12db084f4f0195b1050c514e21a02)
changes Program Manager child window bring-to-front from
`onPointerDown` to `onClickCapture`, matching the original Vue
`nativeOn.click` group-window focus action. React may reorder keyed
child group sections when focus changes; doing this during
`pointerdown` can detach the pointer target before the subsequent
click and prevent a program/close control from activating. The new
handler reorders during the click event and preserves the original
group toggle/maximize behavior.

Initial [CI #44477415484](https://github.com/codersachin99/windows-os/actions/runs/44477415484)
was already running on `b973dc9` when this commit landed, so its
outcome **cannot verify** this follow-up. Do not trigger GitHub
Actions for every edit; after inspecting that run, request a single
opt-in full check of this exact latest head. Keep PR #1 draft and
do not claim pixel parity.


## 19 November 2026 — Resolve Win31 CI failure and add original classic shell

**Failed source CI checkpoint:** 
[Run #44477415484](https://github.com/codersachin99/windows-os/actions/runs/44477415484)
at `b973dc9` was **failure**: TypeScript, unit, source inventory,
original artwork/Contacts verification and production build all
**passed**; targeted browser: **372 passed, 4 failed, 2 skipped**.
The four failures were only in Windows 8 logon status browser tests,
which expected `partial` from the newly corrected catalog while
`SourceWin8Logon` still rendered hard-coded `pending`.
[Fix `a606c6c`](https://github.com/codersachin99/windows-os/commit/a606c6ca78dd133c808fffdde7cf8fd41fbaf521)
adds a typed `shellStatus` prop and
[fix `bfd25d2`](https://github.com/codersachin99/windows-os/commit/bfd25d20937c50f185b396afe9055893bb932f39)
passes the authoritative shared status from `LogonScreen`.
No test expectations were relaxed. Win31 Program Manager specs
had no failures in this run. Full browser suite was not run after
targeted failure; original paired screenshot job skipped.

**Next source-backed shell slice:** original
`legacy-win7@26b9f0c/src/modules/themes/theme-win31-scss.js`
shows white/black taskbar, `#c0c0c0` classic surface,
`#080abd` selection/title accent, 24px window caption,
24×24 square control buttons, no hover icon rectangle and
accented selected *label* only. 
[33bb31f](https://github.com/codersachin99/windows-os/commit/33bb31ff3a83cf3026cd2dc7bedf4627ba5eded2)
implements scoped Win31 taskbar/Desktop/WindowFrame CSS.
[336bd81](https://github.com/codersachin99/windows-os/commit/336bd81eac3409eb700702e2536b983ee44417ce)
and [c2dc99f](https://github.com/codersachin99/windows-os/commit/c2dc99f862ecef553b52420825e9cf7e36a4e498)
add strict desktop/mobile browser tests opening real Computer,
Recycle Bin, minimizing and restoring from the taskbar; 
[ac0c5e2](https://github.com/codersachin99/windows-os/commit/ac0c5e2852e646e3c5d4cad6a7547a09da6e6449)
includes them in the focused CI.

**Next:** a single deliberate `[run-ci]` verification of the
*new exact head* must pass TS/unit/art/source/build,
focused and complete desktop/mobile browser tests. Investigate
actual Playwright errors and fix source code/test defects rather
than suppress tests. Preserve pinned
`codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`,
target `windows-os/main`, draft PR #1 and no releases.


### 19 Nov — Win31 original popup menu source parity follow-up

Original `theme-win31-scss.js` source `.winui-menu` palette
is flat white, black 1px border, zero padding, square corners,
1×1 `#808080` shadow and white/bold hover labels on
`#080abd`. [ec56fd3](https://github.com/codersachin99/windows-os/commit/ec56fd3bfd3bd717fcfb0f8c8261ededae3e12e5)
maps original style to actual Desktop/taskbar popup menus;
[1bd4426](https://github.com/codersachin99/windows-os/commit/1bd4426310eed2c9c37ae188a20236982a64c2b3)
maps it to Computer/Bin and View/Send To Explorer context
popups. [1a2d611](https://github.com/codersachin99/windows-os/commit/1a2d611a6d29c789a5afd1d0efc7b5357626a0d7)
and [9a4d676](https://github.com/codersachin99/windows-os/commit/9a4d6768aac70c8dd54277b196867156fbfc964d)
expand desktop/mobile browser contract variants using
real menus and working actions. This work is newer than
[CI #44478850230](https://github.com/codersachin99/windows-os/actions/runs/44478850230),
which tests the earlier Win31 chrome and Win8 shell-status
fix, **not** these popup changes. Check the earlier run and
request one exact-head full acceptance run only when appropriate.
No merges/releases/visual-complete claim. Preserve PR #1 draft.


### Exact-head combined acceptance request — 19 Nov 2026

Request **one** deliberately gated full `[run-ci]` for the newest
source Win31 popup menu, taskbar, desktop, Computer/Bin chrome,
Program Manager click focus and Win8/Win81 catalog status fixes.
Earlier [CI #44478850230](https://github.com/codersachin99/windows-os/actions/runs/44478850230)
was on `5b76646` and cannot verify subsequent menu changes. The
new run is the acceptance authority for *this* head; retain
all original source/artwork/unit/Vite and focused/full mobile/desktop
browser assertions. Report any failures precisely, then repair on
branch without suppressing them. Do not automatically merge
draft PR #1 or alter the frozen legacy source/main/release.


## 19 November 2026 — Win31 Computer/Bin authentic listview and tree slice

The two previous deliberate opt-in checkpoints are **green**:
[CI #44478850230](https://github.com/codersachin99/windows-os/actions/runs/44478850230)
at `5b76646`, and exact-head
[CI #44479186773](https://github.com/codersachin99/windows-os/actions/runs/44479186773)
at `1e9c980`, both with TypeScript, unit, source asset and inventory
verification, build, focused and full browser desktop/mobile tests.
Original screenshot visual-capture job was skipped; not pixel-complete.

**Additional unverified work (new head):**
Pinned `theme-win31-scss.js` original `.window__addressbar`,
`.winui-textbox`, `.listview__header`, `.listview__item`,
`.treeview__button`, and `.window__statusbar` require classic
gray/black square frames and white-on-`#080abd` selected rows
with **no hover wash**.
[5506c27](https://github.com/codersachin99/windows-os/commit/5506c276b64fb991cba13607ad78d711d62ab3df)
adds a theme-scoped Explorer/Bin adapter;
[4bb4901](https://github.com/codersachin99/windows-os/commit/4bb49010d9a1bafa848933a98037a763c29d7099)
adds `aria-current=location` for live drive/Desktop/shortcut
navigation; [4df2043](https://github.com/codersachin99/windows-os/commit/4df20430074e6af5efb7403b796586211b8a0912)
tests desktop/mobile Computer/Bin source style, real uploaded
Guest file, selection, Details header and context actions.
[1fb6569](https://github.com/codersachin99/windows-os/commit/1fb6569f00314f0b0d53413898dbe0ecf249933a)
adds the spec to the opt-in CI list.

**Next:** run one deliberate exact-head `[run-ci]` acceptance
covering TS/unit/original source and artwork audits, build,
targeted and full browser tests. If a real browser failure occurs,
read logs and artifacts; do not weaken checks. Continue theme
desktop/context/Computer/Bin priorities after verification.
PR #1 stays draft; original pinned repo `26b9f0ce...`,
`windows-os/main` and releases remain untouched.


### 19 November 2026 — Original Win31 Program Manager centering correction

Pinned `startmenu-win31.js` `window-main` explicitly sets
`centered:true, w:600, h:400`. The previous React
`SourceWin31ProgramManager` positioned at `top:0`.
[bdad2c9](https://github.com/codersachin99/windows-os/commit/bdad2c9be9eb742cf3a83693eacb80bb98ac4d0c)
centers original-sized window in the working desktop above
the taskbar, preserving maximized window and narrow-screen
constraints. [a844d07](https://github.com/codersachin99/windows-os/commit/a844d076bd756dac404b39f8cae996b3c598fb66)
adds strict real Playwright checks of desktop window x/y as
well as original source width/height.

Also [652967d](https://github.com/codersachin99/windows-os/commit/652967da28b10f4be9e1e702c218ba9def2c2e42)
ensures Win31 Explorer's selected tree row stays blue while hovered
(the non-selected hover remains transparent), preventing generic
Win7 behavior from masking the original current-directory indicator.
Neither edit is covered by the previously started
[CI #44483797012](https://github.com/codersachin99/windows-os/actions/runs/44483797012).
Check its actual conclusion, and run **one** opt-in full CI at the
current branch head to verify all source-backed Explorer and
Program Manager changes together. No merges/releases; keep
the pinned reference/main unchanged and draft PR #1 open.


### 19 Nov — Exact-head Win31 Explorer + centered Program Manager CI gate

The [first Explorer CI #44483797012](https://github.com/codersachin99/windows-os/actions/runs/44483797012)
at `baf8b12` is a separate, earlier verification. It
**does not include** later
[652967d](https://github.com/codersachin99/windows-os/commit/652967da28b10f4be9e1e702c218ba9def2c2e42)
(selected tree item remains accented on hover),
[bdad2c9](https://github.com/codersachin99/windows-os/commit/bdad2c9be9eb742cf3a83693eacb80bb98ac4d0c)
(centered original Win31 Program Manager), or
[a844d07](https://github.com/codersachin99/windows-os/commit/a844d076bd756dac404b39f8cae996b3c598fb66)
(strict centered geometry acceptance).

This is the **single deliberate** new `[run-ci]` checkpoint
for all those changes together, preserving the full TypeScript,
unit, original inventory/artwork/Contacts, Vite, focused and
complete desktop/mobile browser gates. If browser asserts
fail, inspect actual CI logs and Playwright artifacts before editing.
Never claim a passing run from a still-running job.
Do not merge draft PR #1, change `main`, mutate
`legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`
or create a docs-only release. Original paired screenshot
parity remains unverified.


## 19 November 2026 — Classic Windows 95/98/2000 source migration

**Last accepted green:** exact-head
[CI #44484384067](https://github.com/codersachin99/windows-os/actions/runs/44484384067)
at `2d9fa42` **SUCCESS** (TypeScript, all unit tests, immutable
source inventory/artwork/Contacts audit, production build,
targeted and full desktop/mobile browser).
Original screenshot comparison was skipped; no full visual parity.

**New unverified work:** 20 source image Git blobs
imported byte-identically in [de197bb](https://github.com/codersachin99/windows-os/commit/de197bb89b49ee480c4257d3970e31cb777ed9a4);
exact Start/Computer/Bin/folder/wallpaper/image mapping
[20d561c](https://github.com/codersachin99/windows-os/commit/20d561c50322fcea7c6c8613eb4ac54a673f5ae1).
Original classic `startmenu-win9x.js` has
a 208px main menu, vertical source banner, cascading Programs
and Shutdown menus and 24px icons; not a Win7/11 Start.
[9d35d48](https://github.com/codersachin99/windows-os/commit/9d35d48647f5718c228801dc83596a73c718a952)
adds source-specific React Start, [75defb3](https://github.com/codersachin99/windows-os/commit/75defb3a8a75ced9f863865136b59700133ba610)
source CSS and [56e84db](https://github.com/codersachin99/windows-os/commit/56e84db8c36ad7ecee697af4dcdace0d9496f97d)
shared shell routing. Source-hover submenu bug fixed in
[4691672](https://github.com/codersachin99/windows-os/commit/4691672f6f61f642470453ad4c68ed628d039dec).
[850b005](https://github.com/codersachin99/windows-os/commit/850b00538cb536035ba8b340547fc36a4f794477)
ports three classic palettes + 36px taskbar/20px caption controls;
[fb815c3](https://github.com/codersachin99/windows-os/commit/fb815c323dbbbdac3907a36015761a8886c227ee)
mounts CSS only on those themes.
[995d4be](https://github.com/codersachin99/windows-os/commit/995d4be6d51729f7921fa3ff3731fd5ae0a954bb)
and [1667b17](https://github.com/codersachin99/windows-os/commit/1667b17b4a46d2a04a14a96be2c3815f84df0275)
port Desktop/taskbar/Explorer context palette.

Tests [4fad547](https://github.com/codersachin99/windows-os/commit/4fad547bfb3103ef3b60856d70194fdcf6acdc3b),
[be8c5b9](https://github.com/codersachin99/windows-os/commit/be8c5b93f89ac4720ed7951d73fdd55e511727c8),
[36a31f2](https://github.com/codersachin99/windows-os/commit/36a31f26776dd509dd194c1038fc0514bf9a1540),
[9f22d7f](https://github.com/codersachin99/windows-os/commit/9f22d7feb9e36b672597491088c3d061121b731d)
and [7121051](https://github.com/codersachin99/windows-os/commit/7121051a6f1f386b2684cad39d29da1824777d6c)
verify original assets, three palettes, Start actions,
Computer/Bin image lifecycle and nested Explorer menus.
[ec82812](https://github.com/codersachin99/windows-os/commit/ec82812840564cad2f058ee07d7753443023b0bf)
labels Win31/95/98/2k accurately `partial`; all
37 source IDs remain recognized.
[b52377d](https://github.com/codersachin99/windows-os/commit/b52377dac594eabfd4915ab28869bc0967207698)
adds new classic Start spec to the focused opt-in browser gate.

**Known gaps/risks:** source Win2k Search should launch Computer
in search mode, currently only opens Computer. Original Help
depends on unavailable legacy service and is deliberately disabled.
95/98/2k complete Explorer toolbar, theme customization,
other icon overrides and screenshot parity remain incomplete.

**Next:** Run a *single* opt-in `[run-ci]` at exact head;
inspect TypeScript, unit, original-source/artwork audit,
Vite and all browser suites. Correct actual failing tests
or implementation, do not skip. PR #1 stays draft;
do not change `windows-os/main`, release, or update pinned
`legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.


### 19 Nov — First classic CI failure diagnosed; corrected gallery inventory

[CI #44556148207](https://github.com/codersachin99/windows-os/actions/runs/44556148207)
on `9cc064d` failed only `Unit tests`:
**658 passed, 1 failed**, TS passed, browser was skipped.
`packages/apps/personalize/src/model.test.ts` expected the
prior 10 system backgrounds after source imports added the
byte-identical `win95.fcef1b3b.webp` and
`default-win2k.1c1f7fa2.png` entries to
`sourceSystemWallpapers`. The source-backed gallery
correctly contains 12 now; [4e833fc](https://github.com/codersachin99/windows-os/commit/4e833fc1730f7d594335eaa4d860ae9bb19d0065)
updates only that expected list, without deleting any art
or relaxing validation. No browser acceptance was obtained in
the failed run.

**Deliberate exact-head CI request:** this handoff
commit includes `[run-ci]` to run TypeScript/unit,
original source/artwork/Contacts checks, production build,
focused and complete desktop/mobile Chromium tests.
If failures recur, inspect logs/traces before further edits;
do not imply original screenshot parity, do not merge
draft PR #1, and keep `main` and immutable
`legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`
untouched.


### 19 Nov — Win95/98/2k Explorer original label selection and listview header

Classic source CSS `theme-win9x-scss.js` requires a
transparent selected list **row** while only the file
**label** receives accent/white text/1px dotted yellow
outline. `listview__header-column` uses a raised 3D
border, the address/toolbar has inset classic lines,
and the navigation active item is accented.

[8bfe39e](https://github.com/codersachin99/windows-os/commit/8bfe39ee2003f90898e6e96b88474399a7941e3b)
adds classic-only Explorer/Bin stylesheet;
[e9b67aa](https://github.com/codersachin99/windows-os/commit/e9b67aaa9193763637555408b3f508e3a330026a)
imports it in the real Explorer module.
[2dd3d69](https://github.com/codersachin99/windows-os/commit/2dd3d69cdc997177c9b8fc46a547d8ec2b4fce8b)
tests all three original palettes via real Guest upload,
selection, details headers and Bin; [cc582ed](https://github.com/codersachin99/windows-os/commit/cc582ed9a867b57794dd53e50db0bd7b84b5dbea)
adds the spec to the focused opt-in Actions gate.

This slice is newer than the already running
[CI #44556549754](https://github.com/codersachin99/windows-os/actions/runs/44556549754)
at `b8b7bca` (classic Start/assets). Do not claim the
new Explorer code was checked by that earlier run.
The next CI-marked exact-head commit should verify the
full classic shell + source listview. Keep original source
pinned, PR #1 draft, main/release unchanged.


### Combined exact-head Win9x source shell/Explorer acceptance — 19 November 2026

`[run-ci]` intentionally requested for latest Win95/98/2k
React Start shell, 20 byte-identical source assets, real
Recycle Bin art, source Desktop/taskbar/Explorer context menus,
and **new source label-only Explorer listview**.
The earlier [run #44556549754](https://github.com/codersachin99/windows-os/actions/runs/44556549754)
checks only `b8b7bca`, before `8bfe39e`/
`e9b67aa`/`2dd3d69`. No exact-head verification can
be inferred from that run.

Inspect TypeScript, 659+ unit contracts,
source/original artwork/Contacts audit, build, targeted and
full desktop/mobile Chromium. If a browser test fails,
inspect the real GitHub Actions error and trace and fix
without bypassing. Source Win9x Help integration,
2000 Search mode and original-paired screenshot parity
remain incomplete. Preserve draft PR #1, `main`, frozen
legacy reference and zero release changes.


## 19 November 2026 — Classic theme UI chooser and fixed background browser expectations

[First classic source CI #44556549754](https://github.com/codersachin99/windows-os/actions/runs/44556549754)
on `b8b7bca` **failed** source shell targeted browser with
**426 passed, 4 failed, 2 skipped**; source/TypeScript/unit/build
all passed. Four failures were the same obsolete expected
Personalize system gallery size 10 (actual 12) in
`tests/e2e/source-cpanel-program-launch.spec.ts` and
`tests/e2e/source-personalize-background.spec.ts`,
both on desktop/mobile. The imported Win95 and Win2k
source-pinned wallpapers are legitimate extra entries.
[dd23936](https://github.com/codersachin99/windows-os/commit/dd23936ded586d8a6572c84a61d207abde241a02)
and [99f32ad](https://github.com/codersachin99/windows-os/commit/99f32ad5ea126b84d934507560142817c4674f34)
update only those counts to 12. No regression is suppressed.

[ccb3d37](https://github.com/codersachin99/windows-os/commit/ccb3d379d01b1c6c57acf40e6c21f000dddbbe37)
adds real Windows95/98/2000 theme cards in the 9-option
Personalize chooser, using exact original wallpaper previews.
[3c63945](https://github.com/codersachin99/windows-os/commit/3c63945985c64e362f4119a66beef7cbb2b1cb16)
updates the unit contract; [e69c655](https://github.com/codersachin99/windows-os/commit/e69c6550da295f48197179499eec278c5f615430)
tests real classic theme selection, wallpaper,
palette, Start and persistent Guest reload in desktop/mobile.

The earlier [CI #44557543620](https://github.com/codersachin99/windows-os/actions/runs/44557543620)
on `128843c` does **not** cover these Personalize
and browser count fixes. Next: exactly one opt-in
`[run-ci]` at current head to verify all changes,
inspect failure traces if needed, keep PR #1 draft;
never claim paired-source screenshot parity or merge.
Frozen reference `26b9f0ce7a1665dee89a7c81824bec09e2c75776`,
`main` and releases stay unchanged.


### Final classic shell + Personalize acceptance request — 19 November 2026

This is the **deliberate new head `[run-ci]`** after actual
Win95/98/2k Personalize chooser implementation and correction
of both browser gallery counts. It must run original pinned
asset audits, all unit tests, TypeScript, Vite, the focused
source shell suites and the full desktop/mobile Chromium tests.
Previous CI jobs on older heads are historical only; review
the result of this run's exact commit before labeling work
verified. If any failures persist, extract concrete error
contexts and fix implementation/test defects without deleting
source functionality or skipping tests.

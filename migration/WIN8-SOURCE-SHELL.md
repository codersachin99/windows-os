# Windows 8 / Windows 8.1 original fullscreen Start and shell — 18 November 2026

**Source lock:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. The source `app.config.json defaults.themeScreens` maps **`win8` and `win81` to the same `win8` boot/logon family**, but the desktop wallpaper and Start corner behavior are different. The original `defaults.skipBoot:true` remains unchanged.

## Byte-identical original artwork

Three new images were read directly from the immutable source Git tree and uploaded to `windows-os` with **identical source and target Git blob SHA**. The original `start-button-win8.2e5214cc.svg` is already byte-imported and reused (the source Win10 also reuses it).

| Original path under `assets/images` | Git blob SHA | Purpose |
| --- | --- | --- |
| `win8-startscreen.844bc8df.webp` | `018e7ce006174771f2bf24e4a18c77596cf26b01` | Actual full-screen Start background (source `assets.bgs["win8-startscreen"]`) |
| `win8.3a5f11f3.webp` | `02d9561be738dca78f8af8f67b2cbccf0390c48c` | Win8 desktop wallpaper |
| `win81.7b80787e.webp` | `e2b46add76737836683dfe48fb13532615acc2b7` | Win8.1 desktop wallpaper |
| `start-button-win8.2e5214cc.svg` | `4fee2569b36836b595b0f13d429ad4ed967127af` | Both source themes use Win8 start art; Win8 hides it, Win8.1 displays it |
| `guest-win8.265e68f5.webp` | `060bcb7d2327f85c3f51bc33d2704072e86df578` | Source Guest account image (previously imported for login) |

The dedicated original-asset audit is updated through `scripts/import-source-theme-assets.py` and `sourceWin8ShellArtwork` in `packages/assets/src/index.ts`. `sourceShellWallpaper` now handles both wallpaper IDs; `sourceSystemWallpapers` includes them in the explicit, non-derived system wallpaper gallery (now ten original pinned backgrounds).

## Start screen structure

Pinned `src/modules/shell/startmenu-win8.js` + `src/styles/shell/startmenu-win8.css` demonstrate the original's **fixed fullscreen** Start (not a Win7 popup), background `win8-startscreen`, heading **Start**, 64px horizontal / 48px top header margins, 40px Guest avatar, source account flyout with Manage accounts / Log off / Restart / Shut down, and right-side **420px dark `#1d1d1d` search flyout**.

The pinned source's first `grid-list` has a **double-wide Desktop tile**, followed by Computer, Games and Control Panel; each subsequent program/app list group has at most **six** tiles. Original `startmenu-win8.css`: 120px tile grid, three rows, **`#006582`** regular background, **`#4a329b`** Computer, **`#35762b`** Games, **`#0e4aa0`** Control Panel, `rgba(255,255,255,.2)` tile borders, .2s press scale, white focus outline, and custom desktop-preview current wallpaper.

React module `packages/ui/src/SourceWin8StartScreen.tsx` + `sourceWin8StartScreen.css` implements the source composition and hooks it into `StartMenu` only for exact `win8`/`win81`. Desktop tile **closes Start**; Computer/Games/Control Panel and registered app tiles open through the existing Guest `appRegistry` and `DesktopAction` lifecycle. Shared Start-program right-click menu retains real Pin/Unpin, Send To Desktop, keyboard Escape and source unavailable-action handling. Account Log off/Restart/Shutdown use real session transitions, **Manage accounts disabled** until its original app is migrated. Searching/typed keys filter real registered apps; original full filesystem search groups and app grids are not yet complete. `Escape` first closes account/search flyout, then closes Start; desktop/mobile layouts use horizontal groups.

## Desktop/taskbar/window source personality

Pinned `src/modules/themes/theme-win8-scss.js` defines:
- desktop hover `rgba(242,247,254,.4666666667)`, active two-stop blue gradient, 3px radius;
- taskbar background **`var(--theme-color)`** with inset overlay black 0.2, pinned/run active alpha-white 0.2667 / 0.5333 and original control white;
- **Win8** `.startbutton-wrapper` width **14px** with icon hidden; on non-hover/touch it is **26px**. **Win8.1** `.startbutton-wrapper` width **48px** and visible start SVG **28×28**, black hover `#111`;
- inactive window `#ebebeb`, 1px translucent border, **flat/square**, 6px side padding and 3px top; active window original `var(--theme-color)`; titlebar **20px**, centered **18px** title; caption close **42×20**, inactive `#bcbcbc`, active `#c75050`, hover `#e04343`.
- These are scoped in `packages/ui/src/sourceShellTheme.css` and `sourceWindowChrome.css` to **both win8/win81** without changing Win7/XP/Win10/Win11.

## Contract and remaining gaps

- `tests/e2e/source-win8-start.spec.ts` is in the opt-in **focused desktop + mobile** Chromium gate, checking original asset URLs, distinct wallpapers, 14/26px Win8 and 48px Win8.1 button geometry, full screen, source tile colors, real Desktop return/Computer launch/close, Guest menu, disabled Manage accounts, Escape/Search/typed character handling and real Notepad pin.
- Updated `packages/apps/personalize/src/model.test.ts`, `source-personalize-background.spec.ts` and `source-cpanel-program-launch.spec.ts` for the ten byte-verified source wallpapers.
- Last completed [CI #44351174157](https://github.com/codersachin99/windows-os/actions/runs/44351174157) **SUCCESS** on previous `c7c79e0` (TypeScript, unit, assets, focused and full desktop/mobile browser). **This Win8 code is newly pushed and is NOT verified by that previous run**; a new exact-head `[run-ci]` checkpoint is required.
- **Not complete:** original `appItems`/installed-program tile grouping, per-tile image/icon parity, animated background preview, Start drag gestures, source optional theme color and control settings, original keyboard/search file categories, all original context-menu palettes, source screenshots, exact mobile gestures/animation transitions, Win8 Explorer and remaining 15+ theme family shells. Screenshot-perfect and whole-theme parity cannot be claimed.

Keep PR #1 **draft**, pinned source and `windows-os/main` unchanged, no release; address CI failures and visual comparisons before expanding further.

## Working Personalize theme switcher

[Commit `5e6dd2a`](https://github.com/codersachin99/windows-os/commit/5e6dd2a28a3904f373a52911fb7ab053609eb524) extends `packages/apps/personalize/src/model.ts` from the three previously selectable source-backed shells (Win7, XP, Win11) to **five**: Win7, XP, **Win8**, **Win8.1**, Win11. These exact IDs use their byte-imported original wallpaper previews, and the existing real `SET_THEME` action changes shell theme and wallpaper immediately, persisting on reload; no source-family reduction from Win8.1 to Win8 in the selected desktop identity. `sourceThemeScreens` still correctly aliases both to the original common Win8 boot/logon family.

Updated `packages/apps/personalize/src/model.test.ts` requires the five IDs and exact original previews, and `tests/e2e/source-personalize-theme.spec.ts` now validates choosing Win8 → Win8.1, different original images, start button image, reload and full-screen Start. This is **additional work after the initial Win8 CI checkpoint**, so a new exact-head `[run-ci]` run must verify it. Keep the rest of the source 37-theme catalog recognized but unexposed in Personalize until their individual shell personalities are sufficiently implemented.

## Win8/Win81 source context menu skin

[`176923e`](https://github.com/codersachin99/windows-os/commit/176923e3bb0ab33f07f584367548679251b331d8) scopes the original Win8/8.1 `.winui-menu` `var(--theme-surface)` surface and 1px alpha-black border, offset shadow and gutter, with source **`rgba(146,200,253,.2)`** hover and **`#8acfff`** outline, to React Desktop/icon, taskbar and Explorer context/submenus. Original theme color customization remains a separate task; React uses neutral `#f0f0f0` until customized. [`7c88bc4`](https://github.com/codersachin99/windows-os/commit/7c88bc4e41de17d78c6da80f2a9946957ce8457d) adds actual desktop/mobile browser action+computed-style cases for Win8/Win81; requires new exact-head verification.

## Win8/8.1 Computer and Bin source View toolbar

The pinned `src/modules/apps/computer.js` renders `window-menubar asToolbar` and icon-only eight-mode `winui-menu.is-view` in **all themes**, including Win8/Win8.1; it is neither a full ribbon nor a native `select`. [`a9631a0`](https://github.com/codersachin99/windows-os/commit/a9631a0b0397a52636d38ec41adfa475acf28f4b) ports the same existing functional source View menu to Win8/Win81 Computer and Bin, with separate `is-source-win8` CSS matching `theme-win8-scss.js`: `var(--theme-surface)` menubar, `rgba(146,200,253,.2)` hover `#8acfff` outline, `.4` focused `#58b1fc`, alpha-black menu border and original white 6px address. [`9ea38b4`](https://github.com/codersachin99/windows-os/commit/9ea38b4ea8aa059f0b1280eb75dea1613c385dd0) covers real Computer + Bin, exact icon and menu modes, slider 0–7, keyboard, original skin and functional selection on desktop/mobile in focused CI. Complete source screenshots still pending.


## Source Search flyout clickout and repeat-open correction — 19 November 2026

Pinned `src/modules/shell/startmenu-win8.js` declares `v-clickout=closeSearch`
on the 420px Search flyout. Its `closeSearch()` clears the query and
restores focus to the Start root; `openSearch()` is idempotent and never
toggles an active flyout closed. The migrated Start screen previously
left the pane open after an outside click and treated a repeat Search
trigger as a toggle.

[`7f8340c`](https://github.com/codersachin99/windows-os/commit/7f8340c04d717065c3131a9dc05c2c967dd7e014)
adds a scoped pointerdown clickout listener excluding the flyout and
its Search trigger. Outside click dismisses and clears the query and
refocuses the Start root; the Search button now opens instead of
toggling; source keyboard typing ignores both inputs and textareas.
[`234484f`](https://github.com/codersachin99/windows-os/commit/234484f241d3b511aef4414852f7c5112892e509)
adds Win8/Win81 browser regressions for Escape/reset/reopen and
repeat-open on desktop/mobile, plus physical backdrop clickout at
viewport widths where the pane does not cover the entire screen.
Narrow-phone clickout is intentionally not a reachable mouse action:
the flyout occupies the full viewport and Escape remains available.

This handoff commit opts into a single `[run-ci]` checkpoint. No
new source/runtime test pass is claimed until its exact-head TypeScript,
unit, source-art, production build and desktop/mobile Playwright jobs
finish successfully. The 37-theme source catalog remains partially
implemented; source-paired screenshots, original installed-program tile
grouping, broader search results and all-theme fidelity remain pending.
Draft PR #1 stays open, and `main` is unchanged.


## Separate source installed-program and external application tile grids — 19 November 2026

The original `startmenu-win8.js` renders two *different* grid-list loops
after the Desktop/Computer/Games/Control Panel system group:
`programItems.slice(6*(n-1),6*n)` with both click and contextmenu, then
`appItems.slice(6*(n-1),6*n)` with click-only. It must not split
these source categories merely by taking batches of six from a single
combined registry list.

[`4d86c47`](https://github.com/codersachin99/windows-os/commit/4d86c4726ed44bdf2476ce68059e63142df20add)
uses the already pinned `sourceProgramsById` install-path manifest to
partition the real React app registry into executable-backed programs
and external application shortcuts, preserving each source array's
existing order and creating groups of at most six within each category.
This avoids inventing a second program registry or duplicating tile
implementations. Context menu callbacks only attach to program tiles,
matching the source's distinct original handlers; core system tiles
retain their existing separate actions.

[`04d8d6f`](https://github.com/codersachin99/windows-os/commit/04d8d6f91387c92cbee964c39ef2e81ee5dab1de)
adds browser tests for both Win8 and Win8.1, verifying source group
order/size, real Notepad program context and the click-only
`web_contacts` external shortcut. These commits intentionally omit
`[run-ci]` while the prior Source Search clickout verification run
[#44375432800](https://github.com/codersachin99/windows-os/actions/runs/44375432800)
was still in progress. The new grouping is **not included in that run**.
Source-installed-program inventory and presentation still require
side-by-side pixel/interaction acceptance; do not mark Win8 or Win81
fully verified or merge draft PR #1.


## Pinned horizontal Start grid wheel semantics — 19 November 2026

The original `startmenu-win8.js` `mounted()` handler attaches a
native wheel listener to the tiled pose grid, cancels the default
wheel scrolling and invokes `scrollBy({left: deltaY + deltaX})`.
The React Start previously handled only vertical deltas with delegated
`onWheel`, losing trackpad-horizontal input and page-scroll
cancellation.

[`e4884ec`](https://github.com/codersachin99/windows-os/commit/e4884ec22e0dab24e36ae62c000b35d576eeaffa)
restores a scoped **non-passive native wheel listener** with source
`deltaY + deltaX` horizontal scrolling and effect cleanup.
[`2bd8e12`](https://github.com/codersachin99/windows-os/commit/2bd8e122b23fb09e340d80b2b7a05e0424a5925c)
adds a browser regression verifying both wheel directions move the
original tile grid at a narrow viewport. No additional GitHub Actions
run was triggered while the earlier clickout acceptance
[#44375432800](https://github.com/codersachin99/windows-os/actions/runs/44375432800)
was active. **The program/app separation and native wheel changes
are not part of that earlier CI commit SHA**, and remain unverified
until a subsequent deliberately opted-in exact-head run. The source
rendered screenshots and all-theme parity gate remain open.

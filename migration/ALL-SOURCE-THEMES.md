# Complete final-source theme catalog and migration acceptance

**Source lock:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Exact input:** `app.config.json` → `defaults.themeScreens`.
This source object has **36 explicitly named entries** and **19 distinct
boot/logon screen families**. The source runtime also uses the canonical
Win7 desktop theme ID `win7`, bringing the React-recognized IDs to 37.
Source aliases and subvariants are **not** evidence of 37 individually
finished CSS themes.

## Source screen families and every listed ID

Each entry below is pinned in `packages/contracts/src/sourceThemeCatalog.ts`
with the original ID spelling, case and boot/logon family (each source
entry currently has identical boot and logon family values). No source
entry is intentionally omitted.

| Source boot/logon family | Exact source theme IDs | Count | React migration status |
| --- | --- | ---: | --- |
| `win7` | `base`, `aero-1`, `aero-2`, `aero-3`, `aero-4`, `basic-1`, `basic-2`, `basic-3`, `basic-4` | 9 | Win7 logon renderer retained; Aero/Basic variants pending |
| `win31` | `win31` | 1 | Original boot artwork/view + classic Guest logon; shell/pixel parity pending |
| `win95` | `win95` | 1 | Original boot GIF/view + Win9x Guest logon; shell/pixel parity pending |
| `win98` | `win98` | 1 | Original boot GIF/view + Win9x Guest logon; shell/pixel parity pending |
| `win2k` | `win2k` | 1 | Original boot GIF/view + classic Guest logon; 2000 logo; shell/pixel parity pending |
| `winxp` | `winxp`, `winxpE`, `winxpG`, `winxpN`, `winxpR`, `winxpS`, `winxpZ` | 7 | XP source-shaped Guest logon migrated for all XP mappings; XP desktop/variant skins pending |
| `winvista` | `winvista` | 1 | Original boot GIF/view migrated; logon/shell/pixel parity pending |
| `win8` | `win8`, `win81` | 2 | Original boot/logon, Win8 fullscreen tile Start, source wallpaper/taskbar/flat windows; full shell/pixel parity pending |
| `win10` | `win10` | 1 | Original Win8-reused boot logo/spinner + Win10 logon, dark taskbar, windows, Start; complete shell/pixel parity pending |
| `win11` | `win11`, `win11dark` | 2 | Shared original Win11 Guest logon and desktop/Start layout, with source-pinned separate dark wallpaper and Start art, source dark palette/context menus; complete screenshot and functionality parity pending |
| `macos` | `macos` | 1 | Pending theme-specific implementation |
| `chromeos` | `chromeos` | 1 | Pending theme-specific implementation |
| `ubuntu` | `ubuntu` | 1 | Pending theme-specific implementation |
| `kubuntu` | `kubuntu` | 1 | Pending theme-specific implementation |
| `winLS` | `winLS`, `winLP` | 2 | Original shared winL boot GIF/view; logon/shell/pixel parity pending |
| `aeroNoir` | `aeroNoir` | 1 | Pending theme-specific implementation |
| `oxygen` | `oxygen` | 1 | Pending theme-specific implementation |
| `winW` | `winW` | 1 | Original boot WinW image/view; logon/shell/pixel parity pending |
| `onebit` | `onebit` | 1 | Pending theme-specific implementation |

**Separate canonical ID:** `win7` maps to `{boot:"win7",logon:"win7"}`
even though `win7` itself is not a key in the final source
`defaults.themeScreens` object.

## Architecture and truthfulness contracts

- **Source names:** `sourceThemeScreens(theme)` yields the exact
  configured boot and logon families for each valid ID. The catalog
  retains variants such as `winxpE/G/N/R/S/Z`, `win81`,
  `win11dark`, `winLP` and `aeroNoir` instead of silently
  reducing them to three user-facing choices.
- **Safe recognition:** `sourceTestTheme` and `sourceSavedTheme`
  accept only known IDs and reject arbitrary strings, host paths and
  prototype property names. React's static bundle does not dynamically
  import an untrusted query parameter.
- **Boot/logon lifecycle:** the selected source family propagates to
  `BootScreen`, `LogonScreen`, and Switch User, while the engine
  still requires Guest authentication. The React Guest logon now dispatches to source-derived **WinXP**
  (three blue regions, 150×89 logo, Guest account tile) and **Win11**
  (source wallpaper, dark overlay, original 150px guest-win10 avatar)
  renderers. The existing **Win7** login remains intact. Win31, Win95, Win98 and Win2k use a shared classic Guest logon;
  Win8 and Win8.1 share a source-purple screen and Win10 reuses the
  source-modern account structure with its own background and CSS.
  **9 of 19** logon families now have at least an incremental renderer;
  the other **10** screen families expose
  `data-source-logon-renderer="win7-fallback"` and do not pretend to
  use their unported original screen. The optional animated Boot
  renderer now supports **11 of the 19 configured boot families**
  using ten original Git-blob-identical images and source layout/spinner
  families. The other eight retain an explicit Win7 fallback.
  See [SOURCE-BOOT-FAMILIES.md](SOURCE-BOOT-FAMILIES.md).
  A recognized theme ID is **not** a fully ported theme.
- **Visual fidelity:** Win7/XP/Win11 shell skins are partially ported.
  No theme is currently certified pixel-perfect. Other theme IDs
  remain source-catalogued, with existing Win7 fallback shell artwork.
  Do not label a skin complete until its original rendered desktop,
  taskbar, Start, context menus, windows, Explorer/Bin, boot/login,
  background, icons, sound interactions and responsive breakpoints
  have been source-paired and tested.
- **Source files:** consult `src/modules/themes/theme-*-scss.js`,
  `src/modules/themes/logon-*.js`,
  `src/styles/themes/*.css`, `src/config/icons.registry.json`,
  `src/modules/shell/startmenu-*.js`, and the original assets
  listed in `migration/legacy-files.tsv`. Do not invent missing
  theme files or derive binary artwork from filenames alone.

## WinXP and Win11 original Guest logon slice — 18 November 2026

- Source `src/modules/themes/logon-winxp.js` and
  `src/styles/themes/logon-winxp.css`: 13%-height top/bottom
  blue regions, thin gradient dividers, radial blue middle section,
  left logo/label, center divider and right clickable Guest account.
  Source asset `assets/images/logoxp.9b034658.png` displays 150×89.
- Source `src/modules/themes/logon-win11.js`,
  `src/modules/shell/logon-base.js` and
  `src/styles/themes/logon-win11.css`: original Win11 background,
  black half-opacity overlay, centered 150px rounded guest-win10
  avatar. Win11-dark shares the original Win11 logon *family*.
- Imported binary source blobs into `apps/web/public/assets/images`
  with **matching immutable Git blob IDs**:
  `logoxp.9b034658.png` → `33b3bca96d3c07994b096bf13d2a87a6a05b1196`;
  `guest-win10.a110df5a.webp` →
  `57caee256e62a46271db867a088f49b1981bbc7d`.
  The art and original existing Win11 background are referenced through
  `sourceThemeLogonArtwork` in the shared asset package.
- `LogonScreen.tsx` selects the original screen family with
  `sourceThemeScreens(theme).logon`. Native Guest login and source
  logout/restart actions remain wired, while unsupported account
  authentication displays the existing honest backend limitation.
  XP and Win11 layouts respond to smaller viewports.
- `sourceThemeLogon.css` transcribes key XP region, background,
  avatar hover and Win11 translucent button/overlay rules;
  it is an **incremental rendering migration**, not confirmed
  pixel-perfect across all original viewport dimensions and states.
- Browser acceptance in `source-final-theme-catalog.spec.ts`
  covers XP/Win11 variants, original asset URLs, screen selectors,
  visual CSS properties, power/account boundaries and Guest entry.
  Original vs React screenshot comparisons and original authentication
  backend parity remain pending. Do not mark any whole theme complete.

## Execution sequence

1. Keep the Win7 desktop/Start/context/Explorer/Bin source parity gate
   as a priority and verify XP/Win11 source-paired login screenshots and interactions,
   then implement the still-missing original boot animation families.
2. Migrate **families and derivatives**, not isolated hardcoded
   `if(theme==="winxp")` branches. The shared contracts and reusable
   themed UI/engine components should drive variant selection.
3. Continue with earlier Windows families (Win31, Win95/98, Win2k),
   Vista/8/8.1/10, longhorn, dark/Aero/Basic variants, then the
   other original skins (macOS, ChromeOS, Ubuntu/Kubuntu, AeroNoir,
   Oxygen, winW, OneBit), using the actual source module dependencies
   and app-specific artwork for each.
4. Each accepted family requires source screenshot comparison at
   desktop/laptop/tablet/mobile, source actions, keyboard/context
   behavior, and browser/unit tests. Keep exact in-progress/pending
   labels rather than claiming completion from theme ID recognition.

## Current acceptance evidence

- Unit: `packages/contracts/src/sourceThemeCatalog.test.ts`,
  `packages/engine/src/sourceTestTheme.test.ts`,
  `packages/engine/src/sourcePersonalizeTheme.test.ts`.
- Browser: `tests/e2e/source-final-theme-catalog.spec.ts`.
- Existing theme and file tests remain unchanged and must still pass.
  A new `[run-ci]` commit is required to verify all these changes.

## Classic Win31/Win95/Win98 Guest logon slice — 18 November 2026

- `SourceClassicLogon.tsx` reconstructs the shared `logon-window` / `logon-form-win9x` family from immutable original `src/modules/themes/logon-win31.js`, `logon-win9x.js`, and `src/modules/chunks/shared~logon-win2k~logon-win31~logon-win9x.js`.
- Original `logon-win31.css` background `#bfbdc0`, window top 40%, and `logon-win9x.css` window top 30% and 500px width are represented in `sourceClassicLogon.css`. Win9x's runtime `--logon-bg` is currently a static interim teal adapter and is **not** source color proof.
- Classic form displays source-inspired username/password/Guest Logon/Options; Guest enters the real existing Guest filesystem, while account submit/create requests explicitly report unavailable authentication. Shut down/restart remain functional.
- `source-classic-logon.spec.ts` and the theme catalog test cover all three families, narrow viewport bounds, Guest authorization and account/power boundaries. The focused `[run-ci]` browser gate includes the new regression suite.
- **Not certified**: Win31/Win9x pixel screenshots, original forms and social login fidelity, audio, all boot animations, shell skins. Theme status is still `pending` for all three.

## Windows 2000 original Guest logon slice — 18 November 2026

- Source `logon-win2k.js` uses the shared `logon-window` with `hideAvatar`, a `misc.logo2k` banner, 32rem-wide window at top 20%, `#3b6ea4` background and a six-pixel blue gradient bar (`logon-win2k.css`). The shared React classic adapter now selects this family without a Win7 visual fallback.
- Exact original `assets/images/logo2k.15140c8b.webp` is committed byte-for-byte: source/target Git blob SHA `028a0e1cd4f9eab7c472482312189eeecd0fc0df`. The existing source art verification gate now checks it.
- Desktop/mobile browser tests cover banner URL, hidden avatar, blue source background, form/Guest/power boundaries and responsive width. Original account backend, screenshot pixel parity and boot/theme shells remain pending; status remains `pending`.

## Windows 10 original Guest logon slice — 18 November 2026

- The pinned `src/modules/themes/logon-win10.js` uses the same `logon-base` account icon `guest-win10`, 150px round avatar and half-transparent black overlay as Win11, but loads `bgs.win10` and has different CSS for login buttons/avatar focus. Shared React modern logon rendering now dispatches by exact screen family (`win10` or `win11`) instead of falling back to Win7.
- Exact original `assets/images/win10.743e8c13.webp` imported with source/target Git blob SHA `988278e48d41f10f2f701c748d73595f700b75c0`, and registered in `sourceThemeLogonArtwork.win10`; the already pinned `guest-win10.a110df5a.webp` avatar is shared intentionally. The original-source artwork audit now includes the Win10 wallpaper.
- Theme catalog browser acceptance checks Win10 wallpaper URL, source avatar, translucent overlay, square login button, unported backend limitation, power controls, Guest authorization and active theme identity. `win10` shell status remains `pending`: complete Windows 10 taskbar/desktop/Start/window/Explorer/boot visual personalities, sound, screenshots and authentic login-form pixel parity are still not certified.

## Windows 8 and Windows 8.1 original Guest logon slice — 18 November 2026

- Pinned `src/modules/themes/logon-win8.js` and `src/styles/themes/logon-win8.css` map BOTH `win8` and `win81` to the identical `win8` screen family: purple `#180053` backdrop, 150px `guest-win8` avatar, 20px horizontal guest pane spacing, grouped Guest label, arrow form submit and themed focus. New `SourceWin8Logon` React adapter preserves Guest login and source CSS motifs with explicit account-authentication boundary and responsive stacked layout.
- Original binary `guest-win8.265e68f5.webp` added with exact source Git blob SHA `060bcb7d2327f85c3f51bc33d2704072e86df578` and source art audit.
- Browser acceptance covers both exact theme IDs, original purple, avatar URL/size, guest vs unported account auth, power menu, and active selected desktop theme. This **does not certify** original login pixel parity, Win8/8.1 Start screen, desktop/taskbar/icon visual functionality, boot animation, audio or other Win8 shell behavior. Both remain `pending`.

## Windows 10 desktop, Start and window shell — 18 November 2026

- The pinned original `icons.registry.json` `win10` artwork, taskbar/window rules in `theme-win10-scss.js`, and Start structure in `startmenu-win10.js` / `startmenu-win10.css` are now partially rebuilt in React. **8 new original byte-identical images** supplement the earlier Win10 wallpaper and shared Guest avatar. See [WIN10-SOURCE-SHELL.md](WIN10-SOURCE-SHELL.md) for exact original Git blob SHAs, dedicated UI widgets and tests.
- Core Desktop, taskbar, Start, Computer/Bin visuals now select Win10-specific originals rather than Win7 fallback. This does **not** mean the complete original Win10 theme, original rendered screenshot equivalence, touch animation/entire app art inventory or boot/account backends are finished. Win10 shell status remains `pending`.

## Original boot renderers — 18 November 2026

- **11 of the 19 source boot families** now render source-shaped original boot images or spinner views: Win31, Win95, Win98, Win2k, XP variants, Vista, Win8/8.1, Win10 (original Win8 logo), Win11 variants, WinLS/LP, WinW. The **ten unique original binary images/GIFs have matching source and target Git SHA**. The other eight retain the explicit source-catalog fallback.
- Original source `defaults.skipBoot:true` remains unchanged; only the opt-in boot phase shows these images. The full original boot timing and paired screenshots remain unverified. Detailed [SOURCE-BOOT-FAMILIES.md](SOURCE-BOOT-FAMILIES.md).

## XP/10/11 context-menu source skins — 18 November 2026

The original `theme-win10-scss.js` defines a **light `#eee` Win10 context menu with white hover**, independent of the **dark** Win10 Start menu. This has now been ported to React Desktop, taskbar and Explorer root/child popups. Original XP white/blue/Tahoma and Win11 bright rounded menu skins were also scoped to Desktop/Taskbar without affecting Win7. Playwright CSS/functional acceptance is added to the focused desktop/mobile CI gate. These are individual source-exact palette/motion slices, not screenshot-perfect complete theme coverage. See [SOURCE-CONTEXT-MENUS.md](SOURCE-CONTEXT-MENUS.md).

## Win10 Computer / Recycle Bin original toolbar — 18 November 2026

The pinned `computer.js` does **not** use a full File/Home/Share/View ribbon; its original `window-menubar asToolbar` uses Organize and an icon-only View menu. React Win10 now shows that shared eight-mode/0–7 slider source menu in Computer and Bin, and scopes the original white menubar, light Organize/View menu colors and blue hover to Win10. See [WIN10-EXPLORER-TOOLBAR.md](WIN10-EXPLORER-TOOLBAR.md). Complete screenshot/functional parity still pending.

## Windows 8 and Windows 8.1 Start / desktop personalities — 18 November 2026

Both themes now have their original separate **byte-identical desktop wallpapers**, common Win8 Start-screen background, responsive **full-screen Start with 120px tile groups**, Desktop/Computer/Games/Control Panel tiles, account/search flyouts, and theme-scoped **Win8 hidden 14px (26px touch) Start corner vs Win8.1 visible 48px Start**. The source-based desktop/taskbar/flat 20px-window-caption skins supplement earlier purple Guest login and boot. **Still pending full fidelity** in the original program tile/app grouping, Explorer, context-menu variants, source-paired screenshots and remaining themes. See [WIN8-SOURCE-SHELL.md](WIN8-SOURCE-SHELL.md).

## Win8/Win8.1 selectable themes and source context menus

The source-backed Personalize chooser now includes separate Win8 and Win8.1 entries with their distinct pinned wallpapers, rather than requiring URL parameters ([`5e6dd2a`](https://github.com/codersachin99/windows-os/commit/5e6dd2a28a3904f373a52911fb7ab053609eb524)). Their desktop/taskbar/Explorer popup surfaces now use the original Win8 light theme-surface/blue-accent menu palettes ([`176923e`](https://github.com/codersachin99/windows-os/commit/176923e3bb0ab33f07f584367548679251b331d8)); focused browser contracts were added ([`7c88bc4`](https://github.com/codersachin99/windows-os/commit/7c88bc4e41de17d78c6da80f2a9946957ce8457d)). Original shell/pixel parity across all 37 theme IDs is still incomplete.


## Windows 3.1 source Program Manager Start slice — 19 November 2026

The canonical `win31` shell Start is *not* a Win7-style Start menu.
Immutable original `src/modules/shell/startmenu-win31.js` renders
`window-main` as a **non-draggable, non-resizable, centered 600×400**
**Program Manager**, with a 24px caption, Window/Help menubar and
group icons. Source groups are keyed `recently-opened`,
`simu-programs`, `games` and (only on the original Android
platform) `android-apps`. Toggling a group opens/closes a separate
**250px-high group window**; maximized/restore, child close and
front-focus are independent. Original
`src/styles/shell/startmenu-win31.css` fixes group icon dimensions at
32×32 and hover group label colors **`#fff` on `#2900ad`**.
`theme-win31-scss.js` defines a 24px caption, source surface/accent
variables, square/inset classic frames.

The React port is a dedicated `SourceWin31ProgramManager` component,
not a Win7 two-column skin. It preserves source **three browser groups**
and live Recent program order, shows only registered/source-manifest
applications in the respective program/game group, opens actual
apps via existing `OPEN_APP` dispatch, supports multi-open/close,
front reorder, maximized/restore and titlebar close, with the
Window menu's Computer, Games, Control Panel, Log off, Restart and
Shut down; About is working and original Support is honestly
disabled pending integration. No Android-only group is fabricated
on web. React uses shared source artwork where available; the
generic Programs group icon and exact desktop palette still need
the rest of the original theme asset/skin verification.

Code: [985447d](https://github.com/codersachin99/windows-os/commit/985447dffef1cfeaa73d5bc55fb2e780c5a2e5b0),
[0c6523a](https://github.com/codersachin99/windows-os/commit/0c6523ab9815293bdd9b62ea4b4c98f9b4dfff5d),
[fdbc798](https://github.com/codersachin99/windows-os/commit/fdbc7982fe045420093fff79bfdc769fac27f585).
Actual-browser desktop/mobile group lifecycle, 600×400 bounds,
game/program launch, menu/power actions in
[3e7147b](https://github.com/codersachin99/windows-os/commit/3e7147bafe97a00aac48b54b71befd5eddc5c667);
opt-in focused gate extended in
[a1c6357](https://github.com/codersachin99/windows-os/commit/a1c63574eb8205ee4e6204d83278b410dae5d235).

**Limit:** This is a source-backed Program Manager functional/layout
slice, not full Win31 fidelity. Exact source group window placement,
legacy toolbar keyboard, bitmap icon mapping, grouped windows outside
the main frame, classic taskbar/desktop/window/explorer styles,
screenshots at all sizes and many program/Help commands remain
pending. `win31` continues reporting theme shell `pending`
rather than claiming entire family is migrated.


## Win31 original taskbar, desktop selection and window frame slice — 19 Nov 2026

Pinned `src/modules/themes/theme-win31-scss.js` source confirms
`--theme-surface:#c0c0c0`, `--theme-accent:#080abd`,
white `taskbar__wrapper` with black 1px outline and 2px vertical
padding, 2px gap for running items and bold icons/text.
Active taskbar buttons use `shade-color--dark:#808080`; the
selected desktop icon has **no selection rectangle**, but its
`desktop__icon-name` gets the accent background and white text.
The source classic window frame is `theme-surface` with inset
black border, a **24px** caption, centered title and **24×24**
square caption buttons. Non-active captions are white, active
ones use `theme-accent`. Program Manager stays separately
implemented by `SourceWin31ProgramManager`.

The React Win31-only adapter in `packages/ui/src/sourceShellTheme.css`
now applies those source-grounded palette and geometry rules to
the actual desktop/taskbar/app window DOM while preserving existing
application lifecycles and the other theme families.
[Code `33bb31f`](https://github.com/codersachin99/windows-os/commit/33bb31ff3a83cf3026cd2dc7bedf4627ba5eded2).
Browser test `tests/e2e/source-win31-shell.spec.ts` exercises white
taskbar, Start Program Manager, selected Computer icon label,
actual Computer and Recycle Bin windows, source border/title
metrics, real minimize/restore and theme-specific state.
[Tests `336bd81`](https://github.com/codersachin99/windows-os/commit/336bd81eac3409eb700702e2536b983ee44417ce).
Focused opt-in CI includes the new test in
[workflow `ac0c5e2`](https://github.com/codersachin99/windows-os/commit/ac0c5e2852e646e3c5d4cad6a7547a09da6e6449).

The prior [Win31 CI #44477415484](https://github.com/codersachin99/windows-os/actions/runs/44477415484)
failed **4 of 378 targeted browser tests**: two Windows 8
catalog statuses in each desktop/mobile project; **372 passed
and 2 skipped**, and the Win31-specific tests passed. The shared
`sourceThemeShellStatus` now correctly reports `win8`/`win81`
as partial, but the Win8 logon component was hard-coded
`pending`. Fixed without weakening any browser assertions in
[a606c6c](https://github.com/codersachin99/windows-os/commit/a606c6ca78dd133c808fffdde7cf8fd41fbaf521)
and [bfd25d2](https://github.com/codersachin99/windows-os/commit/bfd25d20937c50f185b396afe9055893bb932f39).

**Status:** Win31 remains **pending** for full-shell parity: desktop
background, icons, taskbar menus, full classic Computer/Bin skins,
native artwork, timing and source-paired screenshots still need
verification. Do not label the project pixel-perfect based on
source-shaped CSS alone.


## Win31 Desktop, taskbar and Computer menu source skin — 19 Nov 2026

Exact pinned source `src/modules/themes/theme-win31-scss.js`
`.win31 .winui-menu` is a flat white menu, **1px black border**,
zero padding, square corners, **1px diagonal `#808080` shadow**,
bold text and `--theme-accent:#080abd` selection with white labels.
This is distinct from the XP/Win7/Win8/Win10/Win11 menu families;
it does not use a blue glossy hover or a gutter/ribbon.

The React shell now maps that source skin only under Win31 to
the functional Desktop and taskbar popup menus
([ec56fd3](https://github.com/codersachin99/windows-os/commit/ec56fd3bfd3bd717fcfb0f8c8261ededae3e12e5))
and to Computer/Recycle Bin Explorer background and item
context menus, including View and Send To child popups
([1bd4426](https://github.com/codersachin99/windows-os/commit/1bd4426310eed2c9c37ae188a20236982a64c2b3)).
Real desktop/mobile browser tests added to both original
menu palette/action suites:
[1a2d611](https://github.com/codersachin99/windows-os/commit/1a2d611a6d29c789a5afd1d0efc7b5357626a0d7)
and [9a4d676](https://github.com/codersachin99/windows-os/commit/9a4d6768aac70c8dd54277b196867156fbfc964d).

This is source-grounded visual CSS plus existing functional menu
actions. Exact menu glyphs, focus/keyboard event timing, original
Win31 font bytes and original-vs-React screenshot comparisons still
need verification. No full theme acceptance claim.


## 19 November 2026 — Win31 source Computer/Bin file-list and navigation adaptation

Source lock is still the immutable `legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
`src/modules/themes/theme-win31-scss.js` explicitly defines:
`--theme-surface:#c0c0c0`, `--theme-accent:#080abd`,
`.window__addressbar` with `4px 0` padding,
`.winui-textbox` white/black border,
`.listview__header` and `.listview__header-column` black borders,
`.listview__item:hover` transparent (no Win7 blue wash),
`.listview__item.is-active` and `:focus` white foreground on
theme accent, `.treeview__button.is-active` same accent with
dotted yellow outline, and the classic gray/black `.window__statusbar`.
These differ materially from modern Explorer styles.

New `packages/apps/explorer/src/sourceWin31Explorer.css`
([5506c27](https://github.com/codersachin99/windows-os/commit/5506c276b64fb991cba13607ad78d711d62ab3df))
reuses those exact source colors and geometry on the **existing
functional Guest Computer and Recycle Bin** lists, address bar,
buttons, header, navigation, status and in-app prompts. It is
strictly scoped to `[data-theme=win31]`, not a new Explorer engine.
[4bb4901](https://github.com/codersachin99/windows-os/commit/4bb49010d9a1bafa848933a98037a763c29d7099)
gives real Guest folder navigation links
`aria-current=location` for active drive/Desktop/shortcut paths;
only Win31 uses the classic selected-tree palette. This stays
keyboard/assistive-technology discoverable and works at mobile width.

[4df2043](https://github.com/codersachin99/windows-os/commit/4df20430074e6af5efb7403b796586211b8a0912)
adds desktop/mobile browser acceptance for themed Computer navigation,
true Guest VFS file upload and selected blue list item, no hover
background, details column borders, and real Recycle Bin Explorer
context and status. [1fb6569](https://github.com/codersachin99/windows-os/commit/1fb6569f00314f0b0d53413898dbe0ecf249933a)
adds the new spec to the opt-in focused browser gate.

**Not certified:** complete source Computer UI hierarchy, original
Win31 folder/drive glyphs, classic toolbar actions beyond already
migrated VFS behavior, source-paired visual screenshots, host support
and remaining 36 source-theme catalog variants. Win31 full shell
status remains `pending` until feature and visual acceptance.


## 19 November 2026 — Center Program Manager exactly in desktop area

Original immutable `src/modules/shell/startmenu-win31.js`
sets `window-main` `centered: true`, `w:600`, `h:400`.
The earlier React Program Manager used `top:0` and only horizontal
centering despite being described as centered.
[Fix `bdad2c9`](https://github.com/codersachin99/windows-os/commit/bdad2c9be9eb742cf3a83693eacb80bb98ac4d0c)
centers both axes within the desktop workspace **above** its
40px taskbar while keeping the bounded small-screen layout and
maximized state at the workspace origin. Browser acceptance
[a844d07](https://github.com/codersachin99/windows-os/commit/a844d076bd756dac404b39f8cae996b3c598fb66)
now checks original 600×400 geometry and centered top/left
coordinates on a full desktop viewport. This still does not
assert screenshot pixel parity for the full source shell.


## 19 November 2026 — Win95, Win98 and Win2k classic source Start/shell migration

Original immutable source
`codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`
`src/modules/shell/startmenu-win9x.js`, `src/styles/shell/startmenu-win9x.css`
and `src/modules/themes/theme-win9x-scss.js` show that the three
classic themes share a **different Start implementation**:
208px `winui-menu` with vertical Windows 7 Simulator banner,
24px command icons, a separate **224px Programs submenu**, and
a nested Shutdown submenu. Commands include About, Programs,
Documents/Computer, Games, Control Panel, Find (95/98) or
Search (2k), Help, Run, Switch user, and Shut down/Restart/Log off.
The source has `--taskbar-height:36px` (not Win7's 40px),
beveled taskbar/Start/window borders, 20px caption controls,
and independent color palettes:
`win95:#bdbebd/#00007b`,
`win98:#c0c7c8/#0608a6`,
`win2k:#d4d0c8/#082767`
(surface/accent). Windows 2k's active titlebar gradient runs
from the accent to `#a4caee`. The original Start sidebar
renders text **Windows 7 Simulator** even for 95/98/2k;
retain the pinned product text rather than inventing branding.

**Binary provenance:** Imported 20 image blobs from the exact
immutable reference to `apps/web/public/assets/images`.
Each target `mcp__GitHub__create_blob` SHA was compared against
the original source file's Git blob SHA, and all 20 matched before
committing [de197bb](https://github.com/codersachin99/windows-os/commit/de197bb89b49ee480c4257d3970e31cb777ed9a4).
They cover the Win95 wallpaper, 2k base texture, 2k Start button,
95/2k Computer/Bin empty/full/folders, 95 generic file,
and source 2k Program/Power/Control Panel/Games/Run/Search icons.
[20d561c](https://github.com/codersachin99/windows-os/commit/20d561c50322fcea7c6c8613eb4ac54a673f5ae1)
binds that catalog to normal Desktop, Computer, Bin and Start image
selection; Win98 uses the same original Win95 icon family.

**React adaptation:** [9d35d48](https://github.com/codersachin99/windows-os/commit/9d35d48647f5718c228801dc83596a73c718a952)
adds the separate `SourceWin9xStartMenu` with real app launch,
right-click program context, nested Programs and Shutdown commands
and separate Find/Search title; [75defb3](https://github.com/codersachin99/windows-os/commit/75defb3a8a75ced9f863865136b59700133ba610)
ports classic layout/scroll geometry. [56e84db](https://github.com/codersachin99/windows-os/commit/56e84db8c36ad7ecee697af4dcdace0d9496f97d)
routes those three themes through shared `StartMenu` and
permissioned `DesktopAction` dispatch. The source 2k Search
currently opens Computer without replicating its original
`file:{path:null,search:true}` search-location state; full
search-mode parity is pending. Original browser Help service
is explicitly disabled, not replaced with an unrelated action.
[4691672](https://github.com/codersachin99/windows-os/commit/4691672f6f61f642470453ad4c68ed628d039dec)
keeps a hover-open submenu open when clicked.

[850b005](https://github.com/codersachin99/windows-os/commit/850b00538cb536035ba8b340547fc36a4f794477)
adds the classic taskbar, source color, 3D window and desktop
label selection; [fb815c3](https://github.com/codersachin99/windows-os/commit/fb815c323dbbbdac3907a36015761a8886c227ee)
installs the theme-only stylesheet. The source `win9x`
menu backdrop and hover rules are ported to Desktop and
taskbar [995d4be](https://github.com/codersachin99/windows-os/commit/995d4be6d51729f7921fa3ff3731fd5ae0a954bb)
and Explorer background/item/child menus
[1667b17](https://github.com/codersachin99/windows-os/commit/1667b17b4a46d2a04a14a96be2c3815f84df0275).
All existing Guest virtual-file operations remain shared.

**Verification under construction:** Unit art mapping
[4fad547](https://github.com/codersachin99/windows-os/commit/4fad547bfb3103ef3b60856d70194fdcf6acdc3b),
classic browser Start/power/shell
[be8c5b9](https://github.com/codersachin99/windows-os/commit/be8c5b93f89ac4720ed7951d73fdd55e511727c8),
actual deleted/restored Bin art lifecycle
[36a31f2](https://github.com/codersachin99/windows-os/commit/36a31f26776dd509dd194c1038fc0514bf9a1540),
Desktop/taskbar palette
[9f22d7f](https://github.com/codersachin99/windows-os/commit/9f22d7feb9e36b672597491088c3d061121b731d)
and Explorer child menu actions
[7121051](https://github.com/codersachin99/windows-os/commit/7121051a6f1f386b2684cad39d29da1824777d6c).
[ec82812](https://github.com/codersachin99/windows-os/commit/ec82812840564cad2f058ee07d7753443023b0bf)
now honestly reports Win31/95/98/2k shell families as
**partial** alongside six other source-backed themes;
no source theme is marked fully pixel-parity verified.

**Remaining:** exact original theme full Explorer layout/controls,
vintage artwork not yet imported, Win2k Search mode,
original Help service, 95/98 alternate shutdown screens,
customization/reflow, paired original/React screenshot measurements,
and other source themes. Do not infer "complete" from source
CSS and passing functional browser tests alone.


## 19 November 2026 — Win9x source Computer/Bin classic listview and tree selection

Pinned `theme-win9x-scss.js` differentiates the
classic 95/98/2k `listview__item` from both Win7 and
Win31. On hover and when selected, the **row background stays
transparent**. Only the **filename label** is accented
(white text on source `--theme-accent`) with a **1px dotted
`#ff3` outline**. The original also specifies beveled
`listview__header-column` box shadows, a 2px header,
an inset 4px address bar, a theme-surface navigation
menubar and status surface, and an active tree button
using the same label accent/dotted yellow outline.

[8bfe39e](https://github.com/codersachin99/windows-os/commit/8bfe39ee2003f90898e6e96b88474399a7941e3b)
ports these *source-backed* styles into a Win95/98/2k-only
Explorer/Bin adapter while sharing Guest VFS and Computer
actions. [e9b67aa](https://github.com/codersachin99/windows-os/commit/e9b67aaa9193763637555408b3f508e3a330026a)
activates it. [2dd3d69](https://github.com/codersachin99/windows-os/commit/2dd3d69cdc997177c9b8fc46a547d8ec2b4fce8b)
tests real Guest file upload, pointer hover, label-only
accent+outline, details header, folder navigation and
Recycle Bin on **all three classic themes** in desktop/mobile.
[cc582ed](https://github.com/codersachin99/windows-os/commit/cc582ed9a867b57794dd53e50db0bd7b84b5dbea)
includes that spec in the deliberately opt-in focused browser
regression set.

Source Help and Win2k Computer search mode, file operation
completeness, and original paired screenshots remain pending.


## 19 November 2026 — Classic Win95/98/2k Personalize cards and source gallery

The source-backed Personalize chooser initially listed only
Win7, XP, Win8, Win8.1, Win10 and Win11. With exact original
Win95 wallpaper and Win2k default background now imported, all
three source classic shell variants can also be chosen from
the real `ChangeTheme` UI. Win98 intentionally reuses the
same original Win95 backdrop while its separate classic theme
CSS palette `#c0c7c8/#0608a6` remains distinct.

[ccb3d37](https://github.com/codersachin99/windows-os/commit/ccb3d379d01b1c6c57acf40e6c21f000dddbbe37)
adds Win95, Win98 and Win2000 theme cards (nine source-backed
choices, grouped under Other Windows Themes);
[3c63945](https://github.com/codersachin99/windows-os/commit/3c63945985c64e362f4119a66beef7cbb2b1cb16)
pins card IDs, groups and exact imported previews.
[e69c655](https://github.com/codersachin99/windows-os/commit/e69c6550da295f48197179499eec278c5f615430)
uses the actual Desktop Personalize window to test switching
all 3 palette/wallpaper combinations, Start and reload persistence
on desktop/mobile. Win31 has only source classic shell/boot
coverage and a gray desktop, so it is not misrepresented by
a fake wallpaper preview tile.

The first classic [CI #44556549754](https://github.com/codersachin99/windows-os/actions/runs/44556549754)
had **426 targeted browser passes, 4 failures, 2 skips**
because two pre-existing Personalize/Control Panel checks
asserted 10 background cards after importing 2 new exact
original system wallpapers; desktop and mobile both failed.
[dd23936](https://github.com/codersachin99/windows-os/commit/dd23936ded586d8a6572c84a61d207abde241a02)
and [99f32ad](https://github.com/codersachin99/windows-os/commit/99f32ad5ea126b84d934507560142817c4674f34)
correct those exact counts to 12 without disabling tests
or dropping the new source gallery entries. The original
10-asset source archive requirement was never implied:
the imported gallery grows as real source art is added.

Status remains **partial**; source-paired visual screenshots,
full 95/98/2k menus, Win2k search location and unported
classic theme variants remain outstanding.

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
| `win11` | `win11`, `win11dark` | 2 | Win11 source-shaped Guest logon migrated for both IDs; complete dark desktop skin pending |
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

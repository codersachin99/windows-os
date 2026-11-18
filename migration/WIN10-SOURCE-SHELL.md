# Pinned Windows 10 original desktop, Start and window shell — 18 November 2026

**Immutable original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. These are bounded original-family React slices, not a finished Win10 theme.

## Exact original references

- `src/config/icons.registry.json` → `icons.win10`; notably **Win10 reuses `start-button-win8.2e5214cc.svg`** rather than the generic Windows 7 Start orb.
- `src/modules/themes/theme-win10-scss.js` → dark `#101010` taskbar, Win10 active/running hover states, source icon selection colors and square white WindowMain, with **44×28** caption buttons and red **`#e81123`** close hover.
- `src/modules/shell/startmenu-win10.js` (`53e9`) and `src/styles/shell/startmenu-win10.css` → dark `#1f1f1f` 430px Start shell, **48px collapsed / 200px expanded** sidebar, **300px** program list, 100×100 two-column recent-app tiles, Guest/Computer/Games/Settings/Power rail and Log off/Shut down/Restart popup.
- `app.config.json` `defaults.themeScreens.win10` → `{boot:"win10",logon:"win10"}`; original `logon-win10.js` background already migrated in the previous checkpoint.

## Byte-identical original artwork

All binary content was fetched at the immutable reference, checked against its Git blob SHA, created in the React Git repository with **the same SHA**, and registered in the original asset import/audit manifest:

| Source image file (under `assets/images/`) | Original and target Git blob SHA |
| --- | --- |
| `start-button-win8.2e5214cc.svg` | `4fee2569b36836b595b0f13d429ad4ed967127af` |
| `computer-win10.2212df79.webp` | `0e57037ee2ec589556c6a0ab80509c7c979666cd` |
| `bin-win10.e0f739cc.webp` | `4a68a6a3958748018640f1b9cd7fc9b55137d098` |
| `bin-full-win10.857c2cab.webp` | `6b9a1f6d1b3fede8661f201e940cc881db6bed09` |
| `folder-win10.294665f0.webp` | `096e033bf55aaf5a8c98472d21fbd8d4c748acf0` |
| `file-win10.036601ed.webp` | `cd0a20cbb1099f61e7028a1c315b585d616208f6` |
| `cpanel-win10.d3d1d446.webp` | `a960a2939446c2ef6901dc9acdca55ddfcfdbaf6` |
| `games-win10.63f82076.webp` | `05104c19549b3579db2eb3f31b1b9af5bb4d7377` |

The original Win10 wallpaper `win10.743e8c13.webp` (SHA `988278e48d41f10f2f701c748d73595f700b75c0`) was imported earlier for the login background. It now also becomes the original selected **desktop wallpaper**. `sourceShellAsset("win10",...)` drives the exact Win10 Computer/Bin/Full Bin/folder/file and Start graphics. `sourceThemeProgramArt("win10",...)` drives Win10 Games/Control Panel/Computer/Bin art in the Start menu, running programs and relevant Explorer lists. The shared Guest virtual filesystem is unchanged and Recycle Bin full-state transitions remain functional.

## Implemented bounded source behaviors

- A separate Win10 scoped style in `sourceShellTheme.css` preserves the **#101010** taskbar, #272727 hover, #333 top-window active button, running-app underline and 5px Show Desktop divider. `DesktopShell.tsx` now derives active taskbar app class from the actual topmost visible guest window rather than guessing.
- `sourceWindowChrome.css` uses a square white Win10 frame, source background/active color inheritance, no Win7 glass or rounded caption chrome, source **44×28** controls, distinct titlebar and close-hover behavior; maximize/minimize/close still route through the existing React engine.
- Original Win10 desktop selection colors `rgba(57,142,211,.2)` hover, `.5333333333` selected, and `.4` selected + hovered are scoped to the Win10 theme.
- Win10 Start menu now exposes a **separate, source-shaped rail/list/tile structure**, with hover/touch-expand guest sidebar, Guest account actions, Computer/Documents, Games, Control Panel/Settings, power actions, program list, recent app tiles and right-click program context menu through the shared source model. The existing actual installed `.lnk` All Programs view and keyboard search are retained instead of removing functionality.
- The Start CSS follows the original **#1f1f1f / #2c2c2c / #353535**, 430px height, 48/200px rail, 300px program list, 24px program icons, 100px tiles and 32px tile icons. On narrow viewports the tile surface hides so the program list and rail remain usable, with actual actions staying accessible.
- Browser specs `tests/e2e/source-win10-shell.spec.ts` and `tests/e2e/source-win10-start.spec.ts` cover original art paths, wallpaper, taskbar, active desktop selection/window chrome/caption operations, Start rail/power/menu, recent app tiles and desktop/mobile fallback. They are included in the targeted opt-in GitHub Actions gate.

## Not completed / acceptance

**Do not label Win10 fully migrated or pixel-perfect.** Original theme accent variable/personalization inheritance is still partial. Pixel-paired original vs React screenshots, Win10-specific remaining app icons, source-tile ordering at scale, original account service, animation timing, exact context-menu styling for every placement, taskbar calendar/popup/notification surfaces, full shell accessibility/keyboard behavior and all original boot/BSOD/shutdown phases still require source audit and verification. The adapter uses the existing shared source UI/SDK rather than introducing an alternate/duplicated app registry. Win7/XP/11 styles remain scoped and unchanged by this patch.

**Opt-in CI and PR:** commit [`ed1fa17`](https://github.com/codersachin99/windows-os/commit/ed1fa179c3dafb920bce3a755fcdb043efd3b241) exact artwork; [`c0411ef`](https://github.com/codersachin99/windows-os/commit/c0411ef872855b2b18205e3f666a87cb7e42e04a) shell chrome and tests; [`6485fd3`](https://github.com/codersachin99/windows-os/commit/6485fd346f275991f81214e22fd867ca2b052ba1) Start menu structure; [`2e86a8f`](https://github.com/codersachin99/windows-os/commit/2e86a8fb2bb23ff454048548fa9ce5e5d2826a3c) original program tile art. A deliberate `[run-ci]` checkpoint must pass full tests **before** calling this slice CI-verified. Keep PR #1 draft, no release/merge.

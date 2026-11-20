## Original built-in Win7 Aero/Basic registry and exact asset bytes — 20 Nov 2026

**Recovered pinned source:** webpack registry `3b8c` and palette
`2299` in
`src/modules/chunks/shared~plugin-cssvar~sandbox~vue-app~vue-store.js`;
`src/modules/system/personalize.js` module `5e9f` verifies
per-ID color lookup and category selection. The plugin-cssvar
component specifies 0.65 active / 0.3 inactive Aero alpha.

| ID | Original name | Accent | Default background | Sound |
| --- | --- | --- | --- | --- |
| aero-1 | Windows 7 | #aad1fb | default Win7 | Windows Default |
| aero-2 | Architecture | #5986ca | architecture | Cityscape |
| aero-3 | Landscape | #ababab | landscape | Landscape |
| aero-4 | Nature | #9f81bf | nature | Garden |
| basic-1 | Windows 7 Basic | #a7c0dc | default Win7 | Windows Default |
| basic-2 | Windows Classic | none | #3b6ea4 | Windows Default |
| basic-3 | High Contrast Black | none | #000 | Windows Default |
| basic-4 | High Contrast White | none | #fff | Windows Default |

Original Aero category has FOUR cards; there is no separate win7
card in the source `_getThemes("aero")` collection, although the
canonical win7 route remains valid. Three real original category
images were imported byte-identically, SHA matched:
`architecture.e651db26.webp` e1b4fcd17c720133cbff993b76a0ec1555aafaef;
`landscape.1626b82c.webp` 3fcedce05153b18a12ac2568d3d87266ac9e11e9;
`nature.e05e4ec0.webp` b7de1d0743118a4ba05868c42034ad3248b0c308.

New typed `sourceWin7ThemeMetadata.ts` records immutable source
colors/categories, backgrounds and sound names. React applies its
real Aero active/idle chrome colors, uses actual category wallpapers,
and paints Basic2/3/4 solid desktops rather than fallback Win7
wallpapers. Personalize thumbnails render exact source names and
real/solid backgrounds, with Aero thumbnail accents from registry.
Additional unit tests validate source metadata and safe theme IDs;
desktop/mobile browser tests validate selected visuals and persistence.

The source preview's theme list, specific audio playback, interactive
transparency toggle, per-app source styles and screenshot-matched
pixel parity remain incomplete until independently verified.

---

# Windows 7 Aero and Basic source migration

**Pinned original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `codersachin99/windows-os`, draft PR #1; source and main unchanged.

## Evidence and bounded implementation

- Final source `app.config.json` lists exactly `aero-1…aero-4`
  and `basic-1…basic-4` among its theme IDs. All have Win7 boot/logon
  screens, but distinct desktop theme IDs.
- Original `src/modules/system/personalize.js` computes
  `_getThemes("aero")`, `_getThemes("basic")`, and `_getThemes("wins")`.
  React previously omitted Basic entirely and showed only canonical Win7.
- Original `src/styles/system/personalize.css` uses a 112×70
  thumbnail, a separate 96×64 background and 25×25 preview marker.
  For Aero, source CSS has layered glass gradients on the theme-provided
  `--preview-color`. For Basic 1/2/3/4, source CSS encodes four
  different 35%/65% faux-window diagrams with blue, classic beige,
  purple and monochrome borders. React now copies these preview
  geometries/strokes in both LTR/RTL.
- React Personalize now exposes these eight literal IDs with a
  separate Basic category. The preview images use only previously
  imported, byte-verified original Win7 wallpaper assets, not generated
  substitutes. Their **exact wallpaper-to-theme association** and
  **per-theme Aero color token** have NOT been recovered from the
  immutable source metadata; previews use source images with interim
  assignments, and one explicit base Win7 color-token fallback.
  Do not misrepresent these as exact original theme-skin reproductions.
- Theme selection already uses real `SET_THEME`, persistence, and
  source Win7 boot/logon family mapping. The eight IDs' actual shell
  visual styles are still `pending` and fallback to the interim
  Win7 frame. The new gallery does NOT mark their shell status partial.

## Acceptance

Model tests enforce 24 selected theme IDs and source-derived groups.
Desktop/mobile Playwright enumerates the Aero/Basic cards, their original
assets and marker CSS, selects each, checks shell ID and pressed tile,
and verifies persistence on reload.

**Remaining:** recover original category metadata (names,
wallpaper associations, Aero colors), faithfully port Basic 1/2/3/4
taskbar/Start/window/Explorer/desktop differences and Aero translucency,
then obtain paired source/target screenshots on all target viewports.
No full parity or release claim until these checks exist.

## Classic high-contrast Basic 3/4 shell — 20 Nov 2026

Verified against pinned `src/modules/themes/theme-win7-classic-scss.js`.
Basic 3 uses black (#000) surface, white text, purple (#800080) focused
title and green (#008000) inactive title/taskbar border. Basic 4 has
white surface, black text, black focus title and a #7d7d7d taskbar border.
Both use the original classic 52px taskbar and rectangular Start control
with 26px original icon and bold `Start` pseudo text.

Added an isolated source CSS adapter applied to live React desktop,
taskbar/running buttons, Start menu, 420px classic menu surface,
opaque square window frames and focus/idle titlebar, Explorer surfaces,
and real Desktop/Taskbar context menus. Actual menu/focus engines remain
unchanged. Source theme catalog marks Basic 3/4 **partial**;
Basic 1/2 and all Aero still **pending**.

Added browser contracts for both themes, desktop/mobile, which exercise
real Start open/close, Computer focus/maximize, Bin focus change,
Desktop/Taskbar right-click actions and high-contrast paints.
Remaining: exact full app styles, original wallpaper associations,
screen captures across viewports and pixel-by-pixel visual comparison.

## Basic 1 + Basic 2 actual shell adapters — 20 Nov 2026

Pinned `theme-win7-scss.js` defines dedicated `.basic-1` rules:
source Win7 taskbar dark linear overlay, non-glass window background,
zero bottom frame rounding, focused cyan-white inset shadow, three
40px caption controls, transparent window-body borders, and zero
padding on Start right area. React now scopes these overrides to
Basic 1 without changing Win7 or Aero theme rendering. The exact
theme accent and wallpaper association is not yet independently
recovered; the preview-tint fallback remains provisional.

The pinned `theme-win7-classic-scss.js` has no separate
`.basic-2` override. Basic 2 therefore inherits its original
`.win7-classic` base with `--theme-surface:#d4d0c8`,
`--theme-accent:#0a246a`, 52px taskbar, 26px classic Start icon,
20px classic window buttons, bevelled opaque backgrounds, idle
grey and active blue titlebar gradients (LTR/RTL), and 420px Start
surface. Shared classic shell behavior is now scoped to Basic 2/3/4.

Browser acceptance covers Basic 1 and Basic 2 real Start, window
focus/maximization, 40px/52px geometry, literal pinned assets and
Desktop/Taskbar context actions. Catalog moves both to **partial**;
all four Aero variants remain **pending**. These are bounded
source-backed shells, NOT full parity or finished themes.

## Shared source Aero 1–4 shell family — 20 November 2026

Original `src/modules/themes/theme-win7-scss.js` contains one
shared `.win7` WindowMain style for the Aero family: 6px inactive/
7px active rounded window, black border, 6px inset padding, source
140/225-degree highlight gradients, optional 4px blur and activated
shadows, mirrored RTL and source Aero Peek. The immutable final
`app.config.json` maps all four Aero IDs to the Win7 boot/logon
family. No discrete `.aero-1`…`.aero-4` window declarations were
found in the pinned Win7 SCSS.

The React WindowMain source chrome now applies these shared rules to
canonical Win7 and all four Aero IDs without assigning invented
per-theme palette values. The original Start orb, 40px taskbar,
real Start recent history and Aero Peek eligibility are preserved
across those IDs. Contracts define the exact allowed Aero IDs;
the shell catalog reports them as **partial**.

Desktop/mobile Playwright tests cover per-ID logon, Start open/close,
source-window border/radius/padding, maximize/restore/close and
desktop context Refresh, not just a screenshot. The exact original
per-ID accent palette, wallpaper mapping, desktop skin differences
and full source visual comparison remain unported/unverified.

## Shared Win7 Aero source taskbar surface — 20 Nov 2026

The pinned `theme-win7-scss.js` `.win7 .taskbar__wrapper`
background is a 50–80px dark horizontal gradient over editable
`--theme-color`, with an inset black/white 1px/2px rim. When
`data-effect-enable-glass` is set, original `blur(4px)` and a
full-height two-layer 54° glass reflection texture apply. The
source also draws a 40px-extended translucent tray backing
and uses a 54px Start wrapper, white running-program text and
2px-radius taskbar buttons with dark 53.3% hover/open borders.

A new narrowly scoped `sourceWin7AeroTaskbar.css` applies those
original source gradients/reflections (including RTL texture)
to canonical Win7 and Aero 1–4 React taskbars. The source
`--theme-color` remains a live CSS variable: its original
individual palette values have *not* been fabricated. Basic
1–4 taskbars remain separate and unaffected.

Added browser checks of paint, 40px height, Start 54px wrapper,
opened program taskbar focus/minimize/restore and source ::before
glass rim on desktop and mobile.

## Aero Window Color and Appearance — 20 Nov 2026

Pinned original `src/modules/system/personalize.js` ChangeAppearance
renders the exact 32 webpack 2299 colors in eight columns, plus
`enableTransparency` and separate Save/Cancel. Original
`src/modules/plugins/plugin-cssvar.js` requires both the theme
transparent flag and `effects.enableGlass` before applying Aero alpha.

React now provides this bounded Aero 1–4 screen: original palette,
live color/transparency preview, Cancel and window-close rollback,
Guest-local validated persistence, theme default color reset, and
0.65/0.3 alpha when glass/transparency are on. Basic themes stay opaque.
Unit and desktop/mobile acceptance have been added, but remain
unverified until the new exact-head opt-in CI completes. Full
source-paired screenshot and audio parity remain pending.

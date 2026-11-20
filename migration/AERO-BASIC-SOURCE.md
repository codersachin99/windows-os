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

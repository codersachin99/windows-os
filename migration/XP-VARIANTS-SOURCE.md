# Original Windows XP color variants — source-backed partial shell

**Immutable source:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`

**Original evidence:** `src/modules/themes/theme-winxp-scss.js` defines `.winxp`, `.winxpE`, `.winxpG`, `.winxpN`, `.winxpR`, `.winxpS`, `.winxpZ` as distinct style variants. `app.config.json` maps all seven to the same XP boot/logon family. Original icon files `assets/images/*-winxp.*` and XP background are retained by source byte audit.

## Implemented incremental React contract

- `sourceIsXpFamily` is a single, allowlisted source-family classifier in `packages/contracts/src/sourceThemeCatalog.ts`; arbitrary theme names are not accepted. The seven ID variants now report **partial**, not **completed** shell support. Boot/logon dispatch remains driven by the independent source `themeScreens` mapping.
- `packages/assets/src/index.ts` uses the same exact XP wallpaper, Start orb, Explorer/Bin art and app/tray program icon catalogue for the seven IDs. This avoids the previous incorrect Win7 art fallback. These are already-imported, Git-blob-identical original XP resources; no new image was invented.
- `StartMenu.tsx` preserves XP-only header, account, recent list, search omission and Log off/Turn off computer footer for all variants; `SourceWindowControlGlyph.tsx` uses the original XP caption SVG variant for every ID.
- `sourceShellTheme.css`, `sourceStartMenuThemes.css`, `sourceDesktopContextThemes.css`, and `sourceWindowChrome.css` now scope XP shell geometry and context/menu chrome to all variants. The original source `--startmenu-*`, `--theme-accent`, and `--window-*` values are transcribed into the React `--source-*` adaptation variables. Unsupported source properties stay inherited from the base XP adapter; **the full source appearance is not yet copied**.

## Exact selected original color tokens

Colors below are from original `theme-winxp-scss.js`, not a newly designed palette.

| Source ID | `--startmenu-bd` | `--startmenu-bg--right` | `--theme-accent` |
| --- | --- | --- | --- |
| `winxp` | `#1665cb` | `#d3e5fa` | `#316ac5` |
| `winxpE` | `#010305` | `#3c83bb` | `#3e9de8` |
| `winxpG` | `#bdbfa8` | `#f1f2e4` | `#93a070` |
| `winxpN` | `#01060e` | `#5a606f` | `#5e81bc` |
| `winxpR` | `#6595cd` | `#5373bf` | `#335ea8` |
| `winxpS` | `#6b6e73` | `#e7e6ed` | `#bbb7c7` |
| `winxpZ` | `#080808` | `#666` | `#bebebe` |

Some original variants have no `--taskbar-bg` or `--window-bg` declaration of their own in this compiled source block. The React source base still supplies such inherited values: **do not call those unmigrated properties source-equivalent** without locating and checking the original resolved CSS.

## Original XP painted-frame follow-up — 20 November 2026

Added scoped frame treatments after comparing the immutable source
`src/modules/themes/theme-winxp-scss.js` with the React adapters.

- `winxpG`: original taskbar highlight ramp and olive tray border `#968b4b`.
- `winxpN`: original dark navy four-stop taskbar and tray gradients, top and bottom Start regions, and inactive/active 17px/34px caption frame ramps.
- `winxpR`: original Royale four-stop taskbar, light tray and Start region gradients, inactive/active frame gradients and non-close caption control gradient.
- `winxpS`: original silver taskbar, tray, Start top/bottom, 2px/5px/28px active/inactive frame and muted window-button surface, including black caption text.
- `winxpZ`: original dark charcoal taskbar, tray, Start top/bottom and 17px/34px frame and non-close control ramps.

The source has **no independent `--taskbar-bg` declaration** for E/N/R/S/Z
inside these variant blocks; React retains the base XP fallback for untouched
properties. Do not present missing source overrides as copied or pixel-verified.
The source `winxpG` `--taskbar-bg:#bac891` and `--taskbar-tray-bg:#eae2b2`
already came from the exact CSS variable audit.

The focused Chromium theme catalog now checks original first-stop colors on
taskbar, tray, Start header/footer and a real active Computer window, on desktop
and mobile. No screenshot pairing or full variant parity is claimed. Remaining:
other original XP taskbar item states, start-button pseudo-element skins,
window caption button hover/pressed states, full explorer/scrollbar controls,
Personalize appearance previews and source-paired visual measurements.

## Acceptance, limits and follow-up

- Automated contracts: `packages/contracts/src/sourceThemeCatalog.test.ts`; `packages/assets/src/sourceShellArtwork.test.ts`.
- Browser: `tests/e2e/source-final-theme-catalog.spec.ts` includes desktop/mobile checks per XP ID for Guest login, theme selection, source palette tokens, wallpaper, Start orb and XP-only header/footer.
- Pending: remaining XP caption interaction states, taskbar item/Start-button skins and independent source preview tiles in Personalize; full right-click/menu, Computer/Bin and layout parity in each variant; matching source/target screenshots at desktop/laptop/tablet/mobile; final E2E CI results. Keep original source untouched.

## Personalize XP variant preview controls — 20 November 2026

**Source-of-truth:** `src/modules/system/personalize.js` renders a theme item
using a 112×70 preview with a 96×64 theme background and a separate 25×25
color swatch positioned 36px from the top. The immutable
`src/styles/system/personalize.css` supplies **independent swatch paints**
for `winxp,winxpE,winxpG,winxpN,winxpR,winxpS,winxpZ`.
The previous React chooser mistakenly offered only `winxp`.

**Now implemented:** the exact seven IDs appear separately within the
existing Other Windows Themes gallery. Each shares the verified original
XP wallpaper image; its 25×25 marker copies the correct source CSS border,
gradient, and background color, rather than using accent approximations.
Selecting any variant applies the existing source-backed partial XP shell,
not a screenshot-only fake. The existing theme persistence code is unchanged.

**Acceptance:** the Personalize unit catalog tests enforce all seven IDs,
source order, and byte-imported wallpaper references. Desktop/mobile
Playwright now selects all seven in turn, checks the independent swatch
paint and selected/persisted desktop ID. Non-XP cards intentionally retain
their existing interim thumbnails. Source theme names, complete preview
composition for remaining 20+ families, responsive dimensions and entire
source-paired screenshot parity are not certified.


## Source taskbar running / foreground paints — 20 November 2026

Original `theme-winxp-scss.js` defines separate taskbar application
idle, opened (running), hovered, focused, and active-hover paint. React
now ties these visual states to real taskbar grouping and window focus,
preserving base XP and Green source variable colors plus the independent
E/N/R/S/Z source gradient stops. Silver retains its original bevel
shadow treatment. Source taskbar icons are 22px and focus-shift 4%.

The new desktop/mobile Playwright contract opens Computer, inspects
foreground+hover, minimizes it, checks running+hover and restores it for
each XP ID. Original screenshot-paired pixel parity, remaining variant
inset shadows and exact Start-button pseudo paints are still pending.


## XP Start button original pseudo-skin and real pressed state — 20 November 2026

The pinned `theme-winxp-scss.js` Start wrapper renders a curved 115%-wide,
80px pseudo background, exact source 20px icon, CSS italic 1.5rem `start`
label, and separate idle/hover/active brightness. React now uses the same
original imported XP icon with those CSS source geometries rather than the
generic round Win7 40px orb. The actual Start open state controls
`.is-active` and `aria-expanded`, so the pressed skin follows app behavior.
Seven source-specific before-gradient treatments are copied, including
XP Noir hover/open and XP Zune open override; mirrored RTL framing added.
XP taskbar is aligned to the validated 40px window-reserved height.
No new raster graphics are generated; some deeper source variations
(Win7/Vista taskbar, other 29 themes, source screenshot comparison)
are still unverified.

Desktop/mobile browser regressions check the source image, label, 20px
icon, 40px taskbar, per-theme gradient, pointer hover, real menu open,
active skin and close. An RTL case checks curved side mirroring. These
checks do not establish source/React pixel-by-pixel equivalence.


## XP Start regression correction (20 Nov 2026)

The first Start pseudo-skin commit introduced a 36px XP taskbar token,
but `WindowFrame` and the already-established source-window geometry
regression use the 40px taskbar baseline. That mismatch left a visible
4px strip below maximized XP windows. Corrected the XP taskbar and Start
control to 40px while retaining the source 80px curved pseudo-skin;
this ensures the wallpaper, maximized windows and bar share one token.
Do not certify source pixel dimensions until source/target paired capture.

In Chromium, a pseudo-element with both `right:-18px` and
`width:115%` has computed `left` resolved numerically even if the
author CSS declares `left:auto`. The RTL acceptance now checks the
actual right anchor and curved mirrored corner rather than an invalid
computed-style `auto` expectation.


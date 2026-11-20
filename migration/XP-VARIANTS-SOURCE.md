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

## Acceptance, limits and follow-up

- Automated contracts: `packages/contracts/src/sourceThemeCatalog.test.ts`; `packages/assets/src/sourceShellArtwork.test.ts`.
- Browser: `tests/e2e/source-final-theme-catalog.spec.ts` includes desktop/mobile checks per XP ID for Guest login, theme selection, source palette tokens, wallpaper, Start orb and XP-only header/footer.
- Pending: all source XP-specific caption frame colors, gradients and taskbar/tray backgrounds; independent source preview tiles in Personalize; full right-click/menu, Computer/Bin and layout parity in each variant; matching source/target screenshots at desktop/laptop/tablet/mobile; final E2E CI results. Keep original source untouched.

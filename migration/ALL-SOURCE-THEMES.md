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
| `win7` | `base`, `aero-1`, `aero-2`, `aero-3`, `aero-4`, `basic-1`, `basic-2`, `basic-3`, `basic-4` | 9 | Win7 partial; variants pending |
| `win31` | `win31` | 1 | Pending theme-specific implementation |
| `win95` | `win95` | 1 | Pending theme-specific implementation |
| `win98` | `win98` | 1 | Pending theme-specific implementation |
| `win2k` | `win2k` | 1 | Pending theme-specific implementation |
| `winxp` | `winxp`, `winxpE`, `winxpG`, `winxpN`, `winxpR`, `winxpS`, `winxpZ` | 7 | XP partial; other XP variants pending |
| `winvista` | `winvista` | 1 | Pending theme-specific implementation |
| `win8` | `win8`, `win81` | 2 | Pending theme-specific implementation |
| `win10` | `win10` | 1 | Pending theme-specific implementation |
| `win11` | `win11`, `win11dark` | 2 | Win11 partial; dark variant pending |
| `macos` | `macos` | 1 | Pending theme-specific implementation |
| `chromeos` | `chromeos` | 1 | Pending theme-specific implementation |
| `ubuntu` | `ubuntu` | 1 | Pending theme-specific implementation |
| `kubuntu` | `kubuntu` | 1 | Pending theme-specific implementation |
| `winLS` | `winLS`, `winLP` | 2 | Pending theme-specific implementation |
| `aeroNoir` | `aeroNoir` | 1 | Pending theme-specific implementation |
| `oxygen` | `oxygen` | 1 | Pending theme-specific implementation |
| `winW` | `winW` | 1 | Pending theme-specific implementation |
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
  still requires Guest authentication. The React logon view is
  currently implemented with the **Win7 renderer** and explicitly
  exposes `data-source-logon-renderer="win7-fallback"` when the
  requested screen has no dedicated renderer. The same transparency
  applies to animated boot. A mapped ID is **not** a fully ported theme.
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

## Execution sequence

1. Keep the Win7 desktop/Start/context/Explorer/Bin source parity gate
   as a priority and finish XP/Win11 source screenshots and login
   renderers, with the exact configured boot/logon family.
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

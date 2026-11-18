# Original Windows boot renderer families — 18 November 2026

**Pinned immutable source** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776` (`app.config.json` `defaults.themeScreens`). This is a partial boot-**view** migration, not complete OS themes or a boot/authentication backend.

## Original source renderers

- `src/modules/themes/boot-win31.js`: source `h-5/6 pointer-events-none` image (Windows 3.1)
- `src/modules/themes/boot-win9x.js`: original `w-full h-full pointer-events-none` animated GIF image for Win95/98/2k/XP
- `src/modules/themes/boot-win-mixed.js`: source `max-h-full pointer-events-none` for Vista, `winLS`/alias `winLP` (asset key `boot-winL`) and `winW`
- `src/modules/themes/boot-win-x.js` + `src/styles/themes/boot-win-x.css`: `h-64` stacked 100px boot logo, five orbiting dots in a 25px spinner, exact source 4.4-second CSS keyframes and five original staggered animation delays. Source **Win10 intentionally uses the Win8 boot logo** while Win11 uses its own
- `src/modules/themes/boot-*.js` for macOS, ChromeOS, Ubuntu, Kubuntu, Oxygen, AeroNoir and Onebit still require their original renderers/assets; Win7 custom boot renderer remains the pre-existing React bridge

## Boot artwork actually committed

All ten distinct original image/GIF bytes were fetched directly from the pinned `legacy-win7` Git tree, checked against its exact source Git blob SHA and uploaded as identical Git blobs in `windows-os`. The source importer `scripts/import-source-theme-assets.py` now audits the `boot` group by default.

| Source boot screen | React family | Original image under `assets/images/` | Git blob SHA (same in source and React target) |
| --- | --- | --- | --- |
| `win31` | `win31` | `boot-win31.7bac4ac4.webp` | `45c51183da1be81aed459cce5b499e2137bd9f29` |
| `win95` | `win9x` | `boot-win95.9bf06d7a.gif` | `c8ef1f453edb0e25a9bb8d1cb7f802716e2c3384` |
| `win98` | `win9x` | `boot-win98.36ae413e.gif` | `92bbf71f5a62d394d9d2b29db5dcecf2db955961` |
| `win2k` | `win9x` | `boot-win2k.2870262d.gif` | `6355fd992e8d60c19612df37e8e499d063f7a76e` |
| `winxp` | `win9x` | `boot-winxp.c42ee019.gif` | `91d8eda88f2c022cedceb94e056c25b396e1ed45` |
| `winvista` | `win-mixed` | `boot-winvista.f7526b81.gif` | `1c18b94eef48368ea02a6cefe77bb3186b82ea48` |
| `win8` | `win-x` | `boot-win8.1a6acdfd.webp` | `70a378a2198fb25ab23f4007a89b90e0f11e0aae` |
| `win10` | `win-x` | `boot-win8.1a6acdfd.webp` | `70a378a2198fb25ab23f4007a89b90e0f11e0aae` |
| `win11` | `win-x` | `boot-win11.120bb3b3.webp` | `f92ad078c0fa36ad8347fb582511fe36745b654a` |
| `winLS` | `win-mixed` | `boot-winL.934ea74a.gif` | `e5fa6198492b9065dcd58e07ac975dd41a9ce670` |
| `winW` | `win-mixed` | `boot-winW.052f504e.webp` | `3f27d7236654d969a99c3300b283a27973e0c156` |

Theme aliases are resolved **before** artwork lookup with `sourceThemeScreens(theme).boot`: `winxpE/G/N/R/S/Z` → `winxp`, `win81` → `win8`, `win11dark` → `win11`, `winLP` → `winLS`. User-supplied theme strings cannot create file paths or dynamic imports. Unsupported boot families continue reporting `data-source-boot-renderer="win7-fallback"`, with no false fidelity claim.

## React adapter and checks

- `packages/assets/src/index.ts`: frozen original artwork table and strict lookup.
- `packages/ui/src/BootScreen.tsx` + `sourceBootScreen.css`: family-marked original image/spinner renderers; preserves `data-source-theme-id`, `data-source-boot-theme`, `data-test-boot-screen` and source-specific `data-test-boot-theme`. Source selection and original centered/full/contained behavior are adapted to the responsive React shell.
- `packages/ui/src/sourceBootScreen.test.tsx`: server-rendered React unit checks for every known original family, aliases, 5 spinner balls and explicit fallback.
- **Important default and lifecycle:** the pinned `app.config.json` says `defaults.skipBoot:true`. The existing `sourceInitialPhase(skipBoot)` and the regular browser app therefore show Guest logon immediately; `BootScreen` is mounted only when boot is enabled. The original GIF/logo view does **not** silently sign in. The current separate 1,800ms React timer is retained, *not* certified to equal the original source's boot lifecycle or GIF animation duration. Do not change the source-aligned default just to make screenshots easier.
- Source-paired actual boot screenshots, original progression sound/timing, legacy Win7 boot animation and remaining themes are pending; this only expands original boot family *view* coverage. No Windows kernel/runtime, BIOS, or host startup is simulated.

## Commits / verification

- [`ea22849`](https://github.com/codersachin99/windows-os/commit/ea228491a7f12b1504a039727342103eb41c970d) imported 10 source images/animations as **byte-identical Git blobs**.
- [`ffb4749`](https://github.com/codersachin99/windows-os/commit/ffb47496dae667ffbcd438cd3e85722f3ba1c949) rebuilt React boot renderers and source CSS.
- [`54e0859`](https://github.com/codersachin99/windows-os/commit/54e085993a54ebe566d0a50d60bd1268019b57df) added original image mapping, family and alias/SSR unit tests.
- Previous full [CI #44323413550](https://github.com/codersachin99/windows-os/actions/runs/44323413550) passed TypeScript, unit, original inventory/art audits, build, targeted browser and full desktop/mobile browser suite **at `a918d6c` before this boot work**. A subsequent opt-in `[run-ci]` checkpoint is required for the new exact head.

**Outstanding:** preserve PR #1 **draft**, `windows-os/main` and original reference unchanged; no release or pixel-perfect claim. Desktop/context/Start/Explorer/Bin parity remains the highest-priority follow-on.

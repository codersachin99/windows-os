# WindowsOS — source-faithful React conversion

This is the new **React + TypeScript + Vite** home for the existing WindowsOS product. The design and functional specification is the private [legacy-win7 repository](https://github.com/codersachin99/legacy-win7) at the pinned commit `4e63290d783009e1293433c6ccf252abba9c1187`. It is a **port, not a redesign**.

**Current status: conversion underway, not complete.** This first slice provides the source-art-backed Windows 7 login and Guest desktop, boot/session transitions, Start menu, taskbar, desktop shortcuts, a shared window manager, and a modular app registry. The Contacts HTML is preserved temporarily inside a source app iframe. Its backend integration and the full legacy apps/games/gadgets/themes remain to be ported. The app must not be called fully equivalent until every original behavior is verified.

## Run locally

Requires Node.js 22+, npm or pnpm, and the original checkout if you want **all** original asset/style files.

```powershell
git clone https://github.com/codersachin99/windows-os.git
cd windows-os
git switch feat/0001-faithful-react-foundation
npm install
npm run dev
```

Visit `http://127.0.0.1:1420`. The essential Windows 7 wallpaper, Guest art, Start orb and computer/bin icons have already been transferred byte-for-byte. To import **every** original image/audio/font/style/app resource, verify a clean `legacy-win7` checkout at the pinned commit and run:

```powershell
node scripts/import-legacy.mjs --from "C:\Sandbox\UNCLEOS\parity\legacy-win7"
node scripts/import-legacy.mjs --from "C:\Sandbox\UNCLEOS\parity\legacy-win7" --check
```

Existing source remains untouched. The importer is checksum-verifying, so a wrong revision fails instead of silently substituting artwork. After confirming usage and rights, commit imported public assets to the new repository.

Test the engine and source module coverage, then browser interactions:

```powershell
npm run typecheck
npm test
npm run audit:legacy
npx playwright install chromium
npm run test:e2e
npm run build
```

## Modular implementation

| Package | Responsibility |
| --- | --- |
| `packages/contracts` | Shared app, window, session and event contracts |
| `packages/assets` | Exact original asset path registry, not replacement icons |
| `packages/engine` | Pure desktop/session/window state, source-aligned events |
| `packages/ui` | React boot, login, desktop, taskbar, Start and window components |
| `packages/sdk` | App registry and shared extension contract |
| `apps/web` | Vite browser entry point, React application and public resources |
| `migration` | Locked full source inventory, status per module and migration runbook |
| `scripts` | Auditing and byte-for-byte asset/style import |

This repository currently does **not** represent the whole product; see [the migration tracker](migration/README.md) and `migration/module-tracker.json` before declaring a feature done. The original backend APIs still need to be ported or maintained through an explicit compatibility layer; no host privileges or fake disks are asserted.

## Migration rule

Port the **source code and behavior**, preserving component names/semantics and original image/fonts/CSS where appropriate. When a module is migrated, attach functional tests and screenshot state evidence before changing its status to verified. Every legacy module is accounted for in the source inventory. Work on functional vertical slices until the source and target pass the same behavior suite, including responsive and desktop/mobile interactions.

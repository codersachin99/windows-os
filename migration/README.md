# Source-locked React conversion of legacy-win7

**Canonical product/source:** [codersachin99/legacy-win7](https://github.com/codersachin99/legacy-win7), commit `4e63290d783009e1293433c6ccf252abba9c1187`.
**Target:** [codersachin99/windows-os](https://github.com/codersachin99/windows-os), React + TypeScript + Vite.
**Non-negotiable:** do not redesign, replace icons with emojis or approximate source behavior. Preserve login, themes, boot, windows, apps, games, gadgets, settings, keyboard/touch behavior, backend and files.

`legacy-files.tsv` is a complete inventory of **3348** tracked files. It records the source Git blob SHA1 and size of every file, including **2395 assets**, **290 source module bundles**, and **158 original stylesheets**. Every file must be tracked through to replacement/retention; presence in this inventory is **not** evidence a feature has been ported.

## Reuse original resources first

Run from this repo root:

```powershell
node scripts/import-legacy.mjs --from "C:\Sandbox\UNCLEOS\parity\legacy-win7"
node scripts/import-legacy.mjs --from "C:\Sandbox\UNCLEOS\parity\legacy-win7" --check
pnpm install
pnpm dev
```

The importer verifies the *clean* pinned source Git revision and every imported blob SHA before copying the original, untouched `assets/` and `apps/` to `apps/web/public/`; original CSS goes to `apps/web/public/legacy/styles/`. It does **not** copy Vue executable bundles into the React application or change the old project. Commit imported asset files into `windows-os` after provenance/license review (third-party components may have separate rights). Until the import is performed, exact wallpaper, avatars, styles, sound and icon resources **will not render**.

The original Python API and unresolved apps are not yet ported; run the original server separately only when comparing behavior. This new React application is **incomplete**, not a replacement for the full legacy product.

## Migration order

1. Exact boot and Win7 logon, Guest and account flows, first-run behavior.
2. Desktop and taskbar/window management: grid, wallpaper, selection, drag/drop, menus, Start, tray, clock, theme changes.
3. Full source application registry and *one-by-one real ports* of apps with shared Window SDK, storage, commands and events.
4. Games/gadgets/media/assets, 18 original themes, responsive/mobile and input accessibility.
5. Python backend/API parity (auth, contacts, store, themes, feed), persistence and browser/native host boundaries.
6. Audit every source module and asset against the checkpoint; functional behavior tests and screenshot acceptance per state.

Do not label a React placeholder, a compatibility iframe, or a screenshot as a completed app.

# Source-locked React conversion of legacy-win7

**Canonical product/source:** [codersachin99/legacy-win7](https://github.com/codersachin99/legacy-win7), immutable commit `26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** [codersachin99/windows-os](https://github.com/codersachin99/windows-os), React + TypeScript + Vite.
**Non-negotiable:** do not redesign, replace icons with emojis or approximate source behavior. Preserve login, themes, boot, windows, apps, games, gadgets, settings, keyboard/touch behavior, backend and files.

`legacy-files.tsv` is a complete inventory of **3348** tracked files. It records the source Git blob SHA1 and size of every file, including **2395 assets**, **290 source module bundles**, and **158 original stylesheets**. Every file must be tracked through to replacement/retention; presence in this inventory is **not** evidence a feature has been ported.

## Reuse original resources first

Run from this repo root:

```powershell
node scripts/import-legacy.mjs --from "C:\Sandbox\UNCLEOS\parity\legacy-win7"
node scripts/import-legacy.mjs --from "C:\Sandbox\UNCLEOS\parity\legacy-win7" --check
npm install
npm run dev
```

The importer verifies the *clean* pinned source Git revision and every imported blob SHA before copying the original, untouched `assets/` and `apps/` to `apps/web/public/`; original CSS goes to `apps/web/public/legacy/styles/`. It does **not** copy Vue executable bundles into the React application or change the old project. Commit imported asset files into `windows-os` after provenance/license review (third-party components may have separate rights). Until the import is performed, exact wallpaper, avatars, styles, sound and icon resources **will not render**.

The target includes a loopback-only Python development API under `services/api/`, but the final pinned original uses a **PHP Slim 4** backend under `service/api/`. The Python adapter is not certified as functionally or security-equivalent to that source. The original standalone Contacts app is now a native React port under `packages/apps/contacts` with the same CSS and API CRUD; it is **implemented pending tests**, not full acceptance. The original Photoshop and Illustrator standalone `index.html` files are zero bytes at the pinned checkpoint; their runtime capability requires investigation rather than an invented implementation. This new React application is **incomplete**, not a replacement for the full legacy product.

## Standalone source applications

All three `apps/*/index.html` entries from the original source are now recorded in `module-tracker.json.externalApps`, and `npm run audit:legacy` verifies the SHA and status for each. Contacts uses the exact original CSS extracted from its source HTML and React components instead of a legacy iframe. The existing target Python development API is preserved separately; full parity with the pinned original PHP endpoints is still pending. **Original module bundles are still predominantly pending**: the tracker reflects this instead of treating basic shell screenshots as full functionality.

## Migration order

1. Exact boot and Win7 logon, Guest and account flows, first-run behavior.
2. Desktop and taskbar/window management: grid, wallpaper, selection, drag/drop, menus, Start, tray, clock, theme changes.
3. Full source application registry and *one-by-one real ports* of apps with shared Window SDK, storage, commands and events.
4. Games/gadgets/media/assets, all 36 original `defaults.themeScreens` IDs (plus canonical Win7 runtime alias), responsive/mobile and input accessibility.
5. Backend/API parity with the original PHP Slim 4 contract (auth, contacts, store, themes, feed), using permissioned Python adapters where appropriate, persistence and browser/native host boundaries.
6. Audit every source module and asset against the checkpoint; functional behavior tests and screenshot acceptance per state.

Do not label a React placeholder, a compatibility iframe, or a screenshot as a completed app.

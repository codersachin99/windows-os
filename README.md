# WindowsOS — source-faithful React conversion

This is the new **React + TypeScript + Vite** home for the existing WindowsOS product. The design and functional specification is the private [legacy-win7 repository](https://github.com/codersachin99/legacy-win7) at the pinned commit `4e63290d783009e1293433c6ccf252abba9c1187`. It is a **port, not a redesign**.

**Current status: conversion underway, not complete.** This first slice provides the source-art-backed Windows 7 login and Guest desktop, boot/session transitions, Start menu, taskbar, desktop shortcuts, a shared window manager, and a modular app registry. **Contacts has now been rebuilt as a native React application**, preserving its original source stylesheet through an isolated Shadow DOM and using the same Python CRUD endpoints (`/api/contacts`, `/api/contacts/save`, `/api/contacts/delete`). It supports New/Edit/Delete, refresh, search across name/email/phone/company, details, original form fields and status messages. Contacts browser CRUD/error tests have passed against mock responses; complete live backend integration and production security hardening remain pending. The full legacy apps/games/gadgets/themes still require migration. The app must not be called fully equivalent until every original behavior is verified.

## Verified native Windows 7 Run dialog — 12 November 2026

The original **Run** utility from pinned `src/modules/apps/run.js` is now implemented in modular React/TypeScript as `packages/apps/run`: **450×220**, non-resizable, bottom-left placement, the **byte-identical original Run WebP icon** (Git SHA `6f669cbb5865e3c342d2f8b16c86051acd63e861`), focused **Open:** input, OK/Cancel, Enter/Escape, Windows+R and retryable errors. Its command resolver uses the pinned source program manifest, original aliases and installed executable names: `calc`/`calculator`, `notepad.exe`, `explorer` and exact C: installed paths open only real migrated apps. Unknown commands and recognized-but-unported apps cannot launch host programs or masquerade as working applications.

**[Opt-in CI 43242039487](https://github.com/codersachin99/windows-os/actions/runs/43242039487) passed 156 unit tests across 29 files and 164 desktop/mobile Chromium browser tests**, along with TypeScript, original-source/Contacts checks and production Vite build. See [Run source-to-React mapping](migration/RUN-SOURCE.md) and [migration handoff](migration/HANDOFF.md).

**Next:** original source Sticky Notes, broader source application coverage, exact theme assets and screenshot parity. Run's successful migration does not imply legacy Paint, Command Prompt, WordPad, or complete desktop equivalence. PR remains draft; `main` is untouched.

## Atomic external File imports — 12 November 2026

The browser now stages all dropped/uploaded File payloads before writing to the mounted Guest virtual filesystem and commits the complete selection **as one create-only persisted snapshot**. This applies to Explorer Upload, Explorer folder drops, Desktop background drops and real Desktop folder-icon drops. It preserves mixed Unicode text and binary bytes; duplicate targets, concurrent file creation, read failures and storage-quota exceptions cannot produce a partially imported selection or overwrite existing data. Generic non-atomic filesystem adapters remain a documented compatibility exception; the production Guest store is atomic.

**[Opt-in CI 43231526749](https://github.com/codersachin99/windows-os/actions/runs/43231526749) passed TypeScript, 150 Vitest unit tests across 28 files, Vite build and all 152 Chromium desktop/mobile browser tests.** New tests explicitly measure one VFS storage write, inject quota failure, verify zero partial items and successfully retry. See the [source implementation map](migration/ATOMIC-HOST-IMPORT.md) and [durable handoff](migration/HANDOFF.md).

**This earlier import milestone is complete.** Run was ported in the verified milestone above; next continue original Sticky Notes, Paint/WordPad and visual asset/theme/screenshot parity. The conversion is not a complete product; feature branch and draft PR remain unmerged.

## Verified atomic transfers and Desktop folder/Bin drops — 12 November 2026

Existing Guest-to-Guest multi-file **copy/move is now atomic**: the VirtualFileStore stages selected roots and their descendants in memory and persists them with one complete snapshot. A quota/storage failure leaves both source and destination unchanged and emits no file-change notifications. The shared Explorer/Desktop drag sessions and Cut/Copy clipboard use this same transfer engine; native Explorer file drags can land on actual Desktop **folder icons** (move or Ctrl-copy) or the visible **Recycle Bin icon** (trusted in-session files only). Original folder metadata, binary content and Recycle Bin restore paths remain intact.

**[Opt-in GitHub Actions 43221928672](https://github.com/codersachin99/windows-os/actions/runs/43221928672) passed 143 unit tests (27 files) and 146 desktop/mobile Chromium browser tests**, plus TypeScript, source/Contacts checks and production build. Unit tests inject storage quota exceptions to verify no partial changes; Playwright tests verify folder drops, duplicate refusal, multi-selection recycling/restoring and host-file safety. See the [implementation and source trace](migration/ATOMIC-TRANSFER-DESKTOP-ICONS.md) and [engineering handoff](migration/HANDOFF.md).

At that earlier copy/move checkpoint multi-file browser uploads were still sequential; the subsequent atomic-import milestone above completed that work. Numerous original applications, visual themes, and pixel-level screenshot comparisons remain unfinished. The migration PR is still draft; `main` is untouched and there is no release.

## Verified Desktop ↔ Explorer file drag/drop — 12 November 2026

The Guest Desktop can now transfer real files/folders and multi-selections to Explorer's current directory or a visible folder row using the original desktop pointer gesture and shared shell VFS drag token. Ctrl/Meta copies; ordinary drag moves. Native Explorer drag also moves/copies files to **empty Desktop background**, and external browser File drops import .txt or binary into the mounted Guest Desktop. Name collisions, nested-folder/self-transfer, hidden windows and builtin icons are rejected without overwriting files. The Desktop and Explorer share one persistent Guest VFS; the file clipboard remains independent.

Mobile CI revealed a real responsive issue: oversized application windows could horizontally pan the entire page and hide Desktop icons. The common shell now bounds window positions and sizes to the viewport, preserving desktop window geometry on large screens and preventing mobile overflow. **[Opt-in CI 43213708078](https://github.com/codersachin99/windows-os/actions/runs/43213708078) passed TypeScript, 134 Vitest unit tests (25 files), source checks, Vite build and all 138 desktop/mobile Chromium browser tests**. See the [forward flow](migration/DESKTOP-EXPLORER-DROP.md), [reverse flow](migration/EXPLORER-DESKTOP-DROP.md), and [engineering handoff](migration/HANDOFF.md).

Remaining work includes drop onto Desktop folder/Bin icons from Explorer, atomic rollback on multi-file quota failures, source-fidelity visual screenshots, theme variants, touch accessibility, and hundreds of other legacy modules. This is **not** complete product parity or a release.

## Verified Shortcut Wizard and restored legacy icons — 12 November 2026

Desktop New → Shortcut now opens a centered non-resizable 550×400 React shell window and a separate Browse window, faithfully following the pinned original `src/modules/shell/shortcutwiz.js` workflow: selection, double-click, disabled Finish/OK until valid, Cancel/Escape, source-format `.lnk` serialization and numbered ` (2)` collision suffixes. Pinned source programs that are not migrated remain selectable but never execute arbitrary host commands. **[Opt-in CI 43207440829](https://github.com/codersachin99/windows-os/actions/runs/43207440829) passed 127 Vitest unit and 122 Chromium browser tests** plus TypeScript, source/Contacts checks and Vite build.

Six original Win7 icons (Shortcut, File, Folder, Calculator, Notepad, Paint) were subsequently imported into the target with **identical Git blob hashes**; this asset-only commit does not imply full art/theme parity. See [Wizard source mapping](migration/SHORTCUT-WIZARD-SOURCE.md) and [exact asset inventory](migration/SHORTCUT-ICON-ASSETS.md). The draft PR remains open; no full product release is claimed.

## Verified Desktop and Explorer clipboard checkpoint — 12 November 2026

Guest Desktop uses the same source-mapped `FileClipboard` instance as Explorer for keyboard Ctrl/Meta+C/X/V and right-click Cut/Copy/Paste. Delete now prompts before recycling selected real files/folders; builtin Computer and Recycle Bin icons are excluded. Data remains in the existing Guest VFS and mounted source `trashPath`. Browser and unit tests exercise cross-window transfers, safe collision behavior and cancellation. **[Opt-in CI run 43202578182](https://github.com/codersachin99/windows-os/actions/runs/43202578182) passed 124 unit tests and 116 Chromium desktop/mobile tests** plus TypeScript/source checks and Vite build. [Detailed mapping](migration/DESKTOP-CLIPBOARD.md).

The original `src/modules/shell/shortcutwiz.js` Browse/Finish wizard now has a dedicated native React window and separate Browse dialog, validated in [CI 43207440829](https://github.com/codersachin99/windows-os/actions/runs/43207440829). Its full localization, icons and screenshot parity are not yet complete. Many applications, themes and screenshot-parity cases are still pending. The draft PR remains unmerged, `main` untouched, and no product release is claimed.

## Latest verified source-migration checkpoints — 12 November 2026

The Guest Desktop now supports the original source **New** submenu actions (Folder, Shortcut, Rich Text Document, Text Document) using real mounted VFS files; created entries can be renamed inline and preserved across reload. A dedicated original-style Shortcut Wizard now creates source `{exe,icon}` `.lnk` files for pinned installed source programs, including programs still awaiting a React implementation. Its two-window Browse/Select/Finish workflow is verified; exact visual/localization parity and WordPad remain pending.

Desktop pointer drag can recycle individual files or selected file/folder groups by dropping onto the visible Recycle Bin icon. Batch Recycle Bin writes use one atomic VFS snapshot; the source-based Bin can restore the file contents and original paths. System icons and hidden/obscured Bin targets are protected. Full drag/drop, touch/source UI parity and exact artwork are not yet verified.

**CI checkpoint:** [43198433398](https://github.com/codersachin99/windows-os/actions/runs/43198433398) passed **121 unit tests** and **106 desktop/mobile Chromium browser tests**, TypeScript, source auditing, Contacts style/source checks, and production Vite build. Earlier New menu checkpoint [43197537081](https://github.com/codersachin99/windows-os/actions/runs/43197537081) passed 116 unit and 102 browser tests. PR #1 remains **draft** and `main` unchanged; the product is **not** at complete legacy parity. [Desktop creation mapping](migration/DESKTOP-CREATE.md) · [Desktop Bin drop mapping](migration/DESKTOP-BIN-DROP.md) · [Handoff](migration/HANDOFF.md).

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

## First source-following app: Contacts

Original source: `legacy-win7/apps/contacts/index.html` and `api/controllers/contact_controller.py`, pinned to the same Git commit. The source's external shortcut key `web_contacts` is preserved in the new registry. The React implementation uses its **actual CSS** rather than a rewritten cosmetic approximation, embedded inside a Shadow Root to protect the shell's styles. Unlike the earlier prototype, no iframe is used. Form fields and API payloads match the source.

The 6 API/model unit tests and the browser CRUD test are committed, but a test file is **not evidence of a passing test**. Use `npm test` and `npm run test:e2e`; the browser tests can use mocked responses and do not require the local Python service. For manual persistent data, run the API service on localhost first. The preserved backend still uses legacy authentication/security and **must not be publicly exposed** until separately hardened.

## Preserved Python API (optional during the React migration)

The source's **23 Python API/controller/model files** have been copied verbatim into `services/api/api/`, with the original `app.config.json` and a private SQLite `db.config.example.json`. The original backend endpoints remain available during the React conversion, rather than being rewritten or removed prematurely. They have **not** yet passed integrated endpoint tests and are not a production security certification.

```powershell
Copy-Item services/api/db.config.example.json services/api/db.config.json
npm run dev:api   # separate terminal; localhost:8099
npm run dev       # localhost:1420, proxies /api to backend
```

Do not commit the populated DB config, SQLite database, tokens or user data. The API must stay on loopback until reviewed; see [services/api/README.md](services/api/README.md).

## Modular implementation

| Package | Responsibility |
| --- | --- |
| `packages/contracts` | Shared app, window, session and event contracts |
| `packages/assets` | Exact original asset path registry, not replacement icons |
| `packages/engine` | Pure desktop/session/window state, source-aligned events |
| `packages/ui` | React boot, login, desktop, taskbar, Start and window components |
| `packages/sdk` | App registry and shared extension contract |
| `packages/apps/contacts` | First source-following React app port; original Contacts CSS, REST service adapter, and unit/e2e tests |
| `apps/web` | Vite browser entry point, React application and public resources |
| `migration` | Locked full source inventory, status per module and migration runbook |
| `scripts` | Auditing and byte-for-byte asset/style import |

This repository currently does **not** represent the whole product; see [the migration tracker](migration/README.md) and `migration/module-tracker.json` before declaring a feature done. The original backend APIs still need to be ported or maintained through an explicit compatibility layer; no host privileges or fake disks are asserted.

## Migration rule

Port the **source code and behavior**, preserving component names/semantics and original image/fonts/CSS where appropriate. When a module is migrated, attach functional tests and screenshot state evidence before changing its status to verified. Every legacy module is accounted for in the source inventory. Work on functional vertical slices until the source and target pass the same behavior suite, including responsive and desktop/mobile interactions.

## Development CI policy

Regular commits do not spend runner time. GitHub Actions runs only for a push whose **latest commit message** includes `[run-ci]`, or an explicit manual workflow dispatch. PR updates do not automatically trigger the workflow. For a checkpoint run, use a commit message such as `test: verify migration checkpoint [run-ci]`; ordinary implementation commits omit that marker. Note: the workflow will still show a skipped run for routine pushes, but no test job is executed.

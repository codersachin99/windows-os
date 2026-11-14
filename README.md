# WindowsOS — source-faithful React conversion

This is the new **React + TypeScript + Vite** home for the existing WindowsOS product. The design and functional specification is the private [legacy-win7 repository](https://github.com/codersachin99/legacy-win7) at the pinned commit `4e63290d783009e1293433c6ccf252abba9c1187`. It is a **port, not a redesign**.

**Current status: conversion underway, not complete.** This first slice provides the source-art-backed Windows 7 login and Guest desktop, boot/session transitions, Start menu, taskbar, desktop shortcuts, a shared window manager, and a modular app registry. **Contacts has now been rebuilt as a native React application**, preserving its original source stylesheet through an isolated Shadow DOM and using the same Python CRUD endpoints (`/api/contacts`, `/api/contacts/save`, `/api/contacts/delete`). It supports New/Edit/Delete, refresh, search across name/email/phone/company, details, original form fields and status messages. Contacts browser CRUD/error tests have passed against mock responses; complete live backend integration and production security hardening remain pending. The full legacy apps/games/gadgets/themes still require migration. The app must not be called fully equivalent until every original behavior is verified.

## Source-backed Windows Sound Recorder — 14 November 2026

The pinned `legacy-win7/src/modules/apps/recorder.js` now has a modular React/TypeScript application in `packages/apps/recorder`. It uses permissioned browser microphone capture, the original Start/Stop and audio-level meter structure, a seconds counter, a `MediaRecorder` audio source and signed 16-bit PCM RIFF/WAV conversion. An app-specific **Waveform Audio File (*.wav)** Save As dialog persists the recording in the shared virtual filesystem; Notepad retains its original TXT/HTML Save As options. The source Recorder SVG icon was imported byte-for-byte as a temporary theme fallback; the exact Win7-specific icon remains outstanding.

**[Verified full opt-in CI #43567671473](https://github.com/codersachin99/windows-os/actions/runs/43567671473)** passed **277 Vitest tests (54 files), 276 desktop/mobile Playwright cases**, TypeScript, Vite production build, Contacts source verification and **38/38 byte-identical imported source image checks**. The new browser cases test actual WAV conversion/persistence with a deterministic **mock microphone**, and graceful permission denial. See [Recorder source trace](migration/RECORDER-SOURCE.md) and [handoff](migration/HANDOFF.md).

**Not yet full parity:** live microphone hardware, precise source sound encoding, Win7 Recorder screenshot/window geometry, exact theme artwork and all theme variants still require comparison. `recorder.js` remains **in-progress**, not source-verified; the draft PR is unmerged and `main` unchanged.

## Source-backed Windows Photo Viewer — 14 November 2026

The original pinned `photo.js` has been migrated as a modular React/TypeScript **Windows Photo Viewer** in `packages/apps/photo`. Double-clicking an actual picture file in Computer opens it through the source image-file association and the shared shell; the viewer reads real binary virtual filesystem content and supports original same-directory previous/next wrap, 90° rotations persisted on navigation/close for PNG/JPEG/WebP, zoom/fit, 3-second slideshow controls and source-disabled File/Print/E-mail/Burn/Open entries. The original base-theme SVG Photo Viewer icon is imported byte-exactly, while the original Windows 7-specific WebP icon still needs transfer.

**[Explicit opt-in CI #43560941513 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43560941513)**: 274 passing unit tests across 53 files and **272 Chromium desktop/mobile browser tests**, plus TypeScript, original-source Contacts audit, Vite build, and **37 exact source-art checks**. Photo browser tests exercise actual 3×2 image uploads, navigation wrap and persisted rotation. See [Photo source trace](migration/PHOTO-SOURCE.md) and [engineering handoff](migration/HANDOFF.md).

**Remaining:** this is a tested *functional slice*, not original pixel parity. Exact Win7 art/control geometry, some picture-format rotation/export behavior, fullscreen parity, all themes and source-vs-React screenshots remain pending. The draft PR is not merged, and no release is claimed.

## Verified Windows 7 Task Manager — 12 November 2026

The pinned original `src/modules/apps/taskmgr.js` has been migrated into an independent `packages/apps/taskmgr` React/TypeScript module, preserving its **Applications / Processes / Services** tabs, source **450px height**, Minimize without Maximize, and byte-identical original Task Manager artwork. Applications lists the simulator's actual windows with 16px icons and selected **End Task**. Processes uses the exact pinned source c170 **non-hidden program list**, displaying `.exe`, Guest, Running/Stopped, and the original literal `0 MB` column. **Start Process** and **End Process** operate only on real registered WindowsOS applications; the source's Services tab displays **None** with its Services button disabled.

The existing `taskmgr.exe` and `C:\Windows\System32\taskmgr.exe` Run commands now launch the same singleton Task Manager. **End Task respects Notepad's unsaved-document confirmation**, and unported original programs remain marked unavailable instead of opening fake windows or accessing host processes.

**[Deliberate opt-in CI 43278169231](https://github.com/codersachin99/windows-os/actions/runs/43278169231) passed 188 Vitest unit tests across 33 files and all 204 desktop/mobile Chromium browser tests**, alongside TypeScript, original-source/Contacts checks and the production Vite build. Five new Task Manager browser cases verify tabs, real app termination, Notepad safety, source process start/stop and installed Run launcher. [Detailed source map](migration/TASKMGR-SOURCE.md) · [engineering handoff](migration/HANDOFF.md).

**Remaining:** original Task Manager window inherits a source default width not yet measured (the target currently assumes 560px); screenshot/pixel parity, non-English and alternative themes, and many large original programs remain incomplete. PR is still draft, `main` untouched, no release.

## Verified original Windows 7 About dialog — 12 November 2026

The pinned `src/modules/apps/about.js` **About** dialog is rebuilt as a separate React/TypeScript module in `packages/apps/about`. It preserves the original **520×400 centered non-resizable window**, close-only titlebar without icon, classic 44-pixel Windows 7 brand image, Windows® 7 Simulator heading, legal/description copy, three source informational links and Credits button. The original `winver`, `winver.exe`, and installed C-drive `winver.exe` commands launch the same singleton window through the real Run app. Source `APP_CONFIG.getUrl` provides the only allowed destinations; if absent, links stay visible but cannot navigate to invented sites.

**[Opt-in GitHub Actions 43273716820](https://github.com/codersachin99/windows-os/actions/runs/43273716820) passed 179 unit tests across 32 Vitest files and all 194 Chromium desktop/mobile browser tests**, plus TypeScript, source/Contacts checks and Vite production build. Browser coverage validates original source geometry/branding/text/controls, safe missing/configured HTTPS links, Credits activation and Run aliases. See the [About source trace](migration/ABOUT-SOURCE.md) and [engineering handoff](migration/HANDOFF.md).

**Remaining source fidelity:** the original About version is imported from a separate webpack exporter (9224); this new dialog displays the current WindowsOS package version (0.0.1) instead of guessing the pinned build's value. Screenshot-level design parity across source themes and many original applications remain incomplete. No product release or merge has been made.

## Verified original Windows 7 Magnifier — 12 November 2026

The source **Magnifier** from pinned `src/modules/apps/magnifier.js` has been rebuilt as an independent React/TypeScript app in `packages/apps/magnifier`. It preserves the original 260-pixel non-resizable toolbar, **Minimize without Maximize**, byte-identical Magnifier/Help WebP images, disabled Views/Settings/Help controls, **0.5× zoom steps from 100% to 1600%**, source desktop mouse-pointer transform origin and 0/0 touch origin. Closing Magnifier clears the zoom, and `Magnify.exe` in the real Run application opens the same source app ID. The shared shell zooms wallpaper, desktop icons, Start menu and ordinary app windows, while leaving the taskbar and zoom controls usable at the source 16× maximum.

**[Opt-in CI 43268254941](https://github.com/codersachin99/windows-os/actions/runs/43268254941) passed 173 unit tests across 31 Vitest files and 184 desktop/mobile Chromium browser tests**, with TypeScript, source/Contacts checks and production Vite build. The five Magnifier browser scenarios verified real visual scaling, 100–1600% boundaries, touch/pointer origin, minimize/restore, cleanup, and Run integration. See the [source implementation trace](migration/MAGNIFIER-SOURCE.md) and [durable migration handoff](migration/HANDOFF.md).

**Remaining:** the original Magnifier used a direct DOM desktop container and auto-sized height; the React zoom canvas retains recoverable taskbar/toolbar controls and uses an 86-pixel control-window approximation. Multi-theme screenshot comparison and many original apps are still missing. No full legacy parity, merge or release.

## Verified original Windows 7 Sticky Notes — 12 November 2026

The original **Sticky Notes** utility from pinned `src/modules/apps/stickynotes.js` now lives in a separate modular React/TypeScript app (`packages/apps/sticky`). Unlike an ordinary framed window, the source displays independently floating notes controlled by **one taskbar entry**. The migration preserves the centered 200×200 yellow default note, random selection from six exact source colors (**#c3f3fa, #c8fec0, #f9ccf8, #d2d7fc, #eaeaea, #fffeb3**), and original image files for the app icon and note add/close buttons (identical Git blob bytes to the pinned source). Each note supports writing, dragging by its toolbar, resizing via eight handles with 150×100 minimum dimensions, focus-to-front, adding, deleting and app closure when the last note is removed.

Note records are saved in Guest-scoped browser storage as the original `{notes:[{x,y,w,h,color,content}]}` shape, with the source's **600 ms debounced text saving** and immediate structural/drag/resize saves. Notes survive reload, and the source `StikyNot.exe` command now launches the real app through Run. Minimize/restore preserves unsaved state without unmounting the app.

**[Deliberate opt-in CI 43249454264](https://github.com/codersachin99/windows-os/actions/runs/43249454264) passed TypeScript, 166 Vitest unit tests across 30 files, Vite production build and all 174 Chromium desktop/mobile browser tests.** Tests cover pixel-sized default geometry, source yellow color, exact assets, editing/save/reload, multiple notes, drag/resize persistence, minimize/restore, final-close/reopen, and Run integration. See [the source-specific implementation map](migration/STICKY-NOTES-SOURCE.md) and [durable migration handoff](migration/HANDOFF.md).

**Subsequent milestone:** Magnifier was migrated and verified above. The original About window, other source apps/games, and visual baseline comparisons remain. The Windows 7 look and feature set are still incomplete; this is not a parity-complete product or release. Draft PR remains unmerged.

## Verified native Windows 7 Run dialog — 12 November 2026

The original **Run** utility from pinned `src/modules/apps/run.js` is now implemented in modular React/TypeScript as `packages/apps/run`: **450×220**, non-resizable, bottom-left placement, the **byte-identical original Run WebP icon** (Git SHA `6f669cbb5865e3c342d2f8b16c86051acd63e861`), focused **Open:** input, OK/Cancel, Enter/Escape, Windows+R and retryable errors. Its command resolver uses the pinned source program manifest, original aliases and installed executable names: `calc`/`calculator`, `notepad.exe`, `explorer` and exact C: installed paths open only real migrated apps. Unknown commands and recognized-but-unported apps cannot launch host programs or masquerade as working applications.

**[Opt-in CI 43242039487](https://github.com/codersachin99/windows-os/actions/runs/43242039487) passed 156 unit tests across 29 files and 164 desktop/mobile Chromium browser tests**, along with TypeScript, original-source/Contacts checks and production Vite build. See [Run source-to-React mapping](migration/RUN-SOURCE.md) and [migration handoff](migration/HANDOFF.md).

**Subsequent milestone:** original source Sticky Notes has now been migrated and verified above; broader application coverage, exact theme assets and screenshot parity remain pending. Run's successful migration does not imply legacy Paint, Command Prompt, WordPad, or complete desktop equivalence. PR remains draft; `main` is untouched.

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

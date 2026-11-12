# WindowsOS conversion — implementation handoff

**Canonical source:** `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`  
**Target:** `codersachin99/windows-os`, `feat/0001-faithful-react-foundation`  
**PR:** https://github.com/codersachin99/windows-os/pull/1 (draft; not merged)  
**Status:** the first React application slice is working and CI-tested; **the full product is not migrated or release-ready**.

## Checkpoint: shared filesystem substrate (2026-11-12)

- **Commit:** [8f09f912](https://github.com/codersachin99/windows-os/commit/8f09f912011c042cfc80298ebc297c5809f47071); **PR Chromium/TypeScript/unit/build CI:** [43089881176](https://github.com/codersachin99/windows-os/actions/runs/43089881176), passed.
- **Implemented:** `packages/filesystem` source-style absolute URI paths; typed `list`, `stat`, `read`, `write`, `mkdir`, `remove`, `copy`, `move`, `isExisting`; metadata including UTF-8 text byte size; persistent Guest browser store; SDK singleton `packages/sdk/src/files.ts`. Seven new unit cases cover paths, nesting, errors, copy/move, storage recovery and write failure.
- **Limitations:** only text files/directories; source disks, binary/media, permissions, account-specific volumes, shortcut metadata, trash, search and file-dialog behavior are **not** implemented. This core is not yet connected to an authentic Computer/Explorer or Notepad UI.
- **Source references:** original `src/modules/apps/notepad.js` uses `read(path,true)`/`write(content,path)`/`getParentDirectory(path)`; `computer.js` uses `uri`, `type`, `mtime`, `size`; `cmd.js` uses `fs.list/read/stat` with drive-letter mapping. See [FILESYSTEM.md](FILESYSTEM.md).
- **Drive-path follow-up:** commit [909a4f13](https://github.com/codersachin99/windows-os/commit/909a4f13a24e48c534d6c4a16fc21bd65cb8aab2) ports the source CMD drive-letter parsing, working-directory resolution, drive stats and Guest user-name-to-URI mount translation in `packages/filesystem/src/drivePaths.ts`; tests cover D: and C: volumes, cross-drive paths and unknown disks. [PR CI 43090752469](https://github.com/codersachin99/windows-os/actions/runs/43090752469) passed. This is a path adapter, **not** a mounted or seeded source volume.
- **Next:** map source disk mounts + folders into one source-compatible volume/session adapter, then wire native Explorer and the full CodeMirror-based Notepad to the shared filesystem with comparable interactions. Do not replace the source editor with a basic textarea or declare the files/apps migrated.

## Update: opt-in CI and source-configured volumes (2026-11-12)

- **CI workflow:** routine commits no longer run tests; the job only executes when the latest push commit message contains the literal `[run-ci]` marker or the workflow is manually dispatched. `pull_request` auto-run was removed. Working branch and `main` are supported. Source: `.github/workflows/react-checks.yml`.
- **File store:** added change-event subscribers for File Explorer/Notepad/Recycle Bin to observe writes, moves, copies and removal after successful persistence; observers cannot undo a committed write. Added separate persistent user-scoped stores with a backwards-compatible Guest key.
- **Runtime mounts:** `LegacyVolumeSession` accepts actual source `systemPath`-based root, `desktopPath`, `trashPath`, and disk `getStats()` entries. Only source-provided directories are created, rather than a fabricated C: drive or default document tree. Validation and idempotency are tested. These are integration contracts, **not** a completed Explorer/Notepad implementation.
- **Dependency reliability:** one accidental CI run on the workflow-change commit failed during `npm install` because a newer Babel dependency requested unavailable `@babel/types@^7.29.14`. Transitive Babel parser/types are pinned through npm overrides to published compatible v7 releases pending a full generated lockfile.
- **Next coding:** provide source mount metadata at session startup, then plug native Explorer/file dialogs and CodeMirror Notepad into this SDK; verify complete behavior and visuals against pinned original. Do not claim module parity prematurely.

## Update: Notepad source-model port (2026-11-12)

- **Commit:** [399e8b742](https://github.com/codersachin99/windows-os/commit/399e8b742a5e9b96d4252613251a24541f8f871e) implements `packages/apps/notepad/src/document.ts` with the original Notepad's New/Open/Save/Save As behavior, dirty title indicator, close confirmation, font defaults, wrap/status settings, cursor position and date/time formatting. Uses the shared file store rather than separate mock documents.
- **Source quirk retained:** original New resets its label/content without clearing the previous path; this unusual behavior has an explicit unit test instead of being silently redesigned.
- **Verification:** the Notepad document model, CodeMirror adapter, source contracts, TypeScript and existing Chromium tests **passed** opt-in [CI run 43094398373](https://github.com/codersachin99/windows-os/actions/runs/43094398373). The preceding filesystem/profile and Babel checkpoint also **passed** [run 43092981085](https://github.com/codersachin99/windows-os/actions/runs/43092981085). These checks do not test a mounted React Notepad window, visual parity or file-dialog interactions; those integrations remain pending.
- **CodeMirror follow-up:** [ce06a6dc](https://github.com/codersachin99/windows-os/commit/ce06a6dc194b8cbf49f86933095aef8eded85d3b) implements a reusable native CodeMirror 6 editor adapter with source-oriented set/insert/focus/select-all/shortcut, cursor, wrapping and font behavior. The Notepad stylesheet is verified byte-for-byte against the source Git blob SHA `d8ac17121e7d28106d6986d4adccd795c69d1066`. It is not yet wired into the shell UI; no visual parity claim. Package versions for CodeMirror 6 are pinned.
- **Next:** integrate the CodeMirror editor into the native Notepad window, implement full menu/shortcut handling, open/save/font/overwrite dialogs and legacy appearance as native React modules; connect the original session-generated volumes, then add browser behavior comparisons. No source Notepad module is marked verified; the original app's full UI is not yet implemented. See [NOTEPAD.md](NOTEPAD.md).

## Native Notepad integration checkpoint (2026-11-12)

- Source-mapped Notepad now mounts as a native React Start menu app (not an iframe) using the original CodeMirror 6 adapter and source CSS. Dirty titles flow through the window manager and show in the taskbar.
- Source File/Edit/Format/View menus, keyboard bindings, font, word-wrap, status bar, date insertion and confirmation on close have React implementations. A reusable simulated filesystem file picker supports opening, saving, overwrite prompts, and folder navigation.
- App state is retained during minimize/restore; Windows titlebar close and Alt+F4 both use application-specific close requests. See `packages/ui/src/WindowFrame.tsx`, `DesktopShell.tsx`, `packages/apps/notepad`, `packages/apps/shared`.
- Desktop/mobile Playwright tests were added for document persistence, save and open, minimize, and Yes/No/Cancel close. **Verified:** opt-in [CI run 43145958318](https://github.com/codersachin99/windows-os/actions/runs/43145958318) passed TypeScript, unit tests, build and desktop/mobile Chromium tests for Notepad.
- Known source gaps: final Win7 Notepad icon `/assets/images/notepad.90e3ce4c.webp` must be copied through the pinned importer, active source disk/bootstrap metadata is not yet supplied, and shared file/font dialog CSS and all keyboard/touch states remain unverified against source. This is an in-progress port, not full Notepad parity.
- **Next:** Run source-parity screenshot comparisons, move the shared file dialogs closer to original source behavior, initialize verified guest volume metadata, and wire Computer/Explorer to the same filesystem.

## Native Computer / Explorer checkpoint (2026-11-12)

- The original Computer placeholder was replaced by `packages/apps/explorer` with source-following navigation history, current-folder filtering, selection, view modes, create-folder/rename and live updates from the same simulated filesystem used by Notepad.
- `.txt` association opens a separate native Notepad window with file path passed through the shared window contract. React StrictMode subscription lifecycle avoids leaked file listeners and maintains window state on minimize/restore.
- Original `src/styles/apps/computer.css` was copied byte-for-byte, SHA `f0cd08ab11f0c38a69cfacf602566059003afd99`. Exact source icons are referenced but require the pinned importer to render all original files.
- Browser tests now cover Computer/Notepad shared files, text-file association, creating a folder and back/forward navigation. **Verified:** opt-in [CI run 43147045676](https://github.com/codersachin99/windows-os/actions/runs/43147045676) passed TypeScript, unit, source inventory checks, production build and the existing/new desktop/mobile Chromium tests.
- Module tracker `computer.js` is `in-progress`. Source disk initialization/drive lists, deep search, devices, clipboard, drag/drop, Recycle Bin delete/restore, full list rendering and context menu parity remain pending. See [EXPLORER.md](EXPLORER.md).

## Tested implementation

- Boot → Windows 7 logon → source Guest session → Windows 7 desktop; source wallpaper/Guest avatar/window icons/Start art copied byte-for-byte, with original initial defaults `skipBoot=false`, `nativeCursor=false`, `theme=win7`.
- Shared types (`packages/contracts`), asset paths (`packages/assets`), session/window state reducer (`packages/engine`), application registry (`packages/sdk`), reusable shell/window/Start/login components (`packages/ui`), Vite app (`apps/web`).
- Original external app shortcut `web_contacts` is read from the **unmodified source JSON**, not invented. A real Contacts React component now replaces the old iframe. It uses the original Contacts CSS (unaltered rules inside Shadow DOM), backend list/save/delete routes, exact form fields, selection, search, validation, and status/error handling.
- Source's **23 Python API/controller/model files** preserved as a separate loopback-only dev service; this is *code preservation*, not audited production security or verified integration.
- Complete checkpoint inventory `migration/legacy-files.tsv`: **3,348 files**; **290 webpack/Vue module bundles**, **158 original CSS files**, **2,395 assets**. SHA verifying importer `scripts/import-legacy.mjs`; core Win7 image assets already staged and source file/shortcut/CSS checks under `scripts/source-contacts.test.mjs`.
- `migration/module-tracker.json` and `npm run audit:legacy`: all 290 module paths tracked (5 in-progress, 285 pending); three standalone app pages tracked (Contacts implemented pending acceptance, two source-zero-byte pages pending investigation).

**Automated verification:** GitHub Actions push run https://github.com/codersachin99/windows-os/actions/runs/43087351461 passed on commit `0cb7dc705df7a02221c4eac9a3bdb7581f491757`:
TypeScript, Vitest unit tests, source inventory audit, original Contacts byte-for-byte CSS/shortcut checks, Vite build, desktop and mobile Chromium interaction tests (boot, Guest, Start/window lifecycle, Contacts CRUD and backend errors). No native desktop installers or complete source parity tests exist yet. A draft PR event has separate status; check its latest CI before merging.

## Run locally

```powershell
git switch feat/0001-faithful-react-foundation
npm install
npm run typecheck
npm test
npm run audit:legacy
npm run test:source
npm run build
npx playwright install chromium
npm run test:e2e
npm run dev       # React at 127.0.0.1:1420
```

For persistent Contacts data run the preserved Python backend on 127.0.0.1:8099 with the documented private SQLite `db.config.json`; Vite proxies `/api`. The browser tests mock API responses so they run without Python. To import every untouched source asset and stylesheet into Vite public paths, run the pinned clean source checkout through `npm run import:legacy -- --from "<path to legacy-win7>"` (or `node scripts/import-legacy.mjs --from ...`) and follow with `--check`. Do not copy a modified/mismatched source revision.

## Actual next coding priorities — do not replace functionality with placeholders

1. **Shared simulated file system + document app contract.** Before porting Notepad or Computer, examine source modules `src/modules/apps/notepad.js` (~45 KB; CodeMirror, font selection, word wrap, status and file open/save), `src/modules/apps/computer.js` (~84 KB; navigation, files/devices and search), and their shared webpack chunks. Build one source-mapped file store/SDK shared by Explorer, Notepad, Recycle Bin, media apps and drag/drop. Do not substitute a browser text area for the full Notepad.
2. **Finish shell semantics**, not just its wallpaper: source exact window layout, Start/search, context menus, desktop icon positioning, notifications, keyboard/mouse/touch/cursors, drag/drop, session/user/account flow, screen saver/BSOD/boot options and 18+ original theme families. Correct interactions and responsive states must be verified against the source.
3. **System and utility apps**, each as a native React component using the common app/window/storage contracts. The original Calculator (`src/modules/apps/calc.js`, ~128 KB) has multiple layouts, conversions and worksheets; a basic arithmetic panel would not be parity.
4. **Games, gadgets, audio, locales, media and backend**: preserve their exact functionality and source assets, implement feature tests, compare matching initial/state/action screenshots at mobile and desktop dimensions. Do not mark modules `verified` without source-behavior evidence.

## Source and security caveats

The original `apps/illustrator/index.html` and `apps/photoshop/index.html` are zero bytes at the pinned checkpoint. Their actual runtime may depend on other code/external integrations; investigate before declaring them missing or implemented.

The preserved backend contains legacy account/security behavior, including non-production password/token handling. Never publicly expose it without authentication/security review. The new `windows-os` GitHub repository is **public**, whereas the source repository was private: check rights for original bundled artwork, sounds, fonts and third-party code before promoting a distributable build. Do not commit private DB configuration, user data or tokens.

**Acceptance gate:** Full source parity means every original module/feature has mapped source behavior, tested interactions, correctly rendered artwork/themes across target viewports, and the status tracker is entirely verified. A green CI on this initial vertical slice is not that gate.

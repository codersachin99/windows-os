# WindowsOS conversion — implementation handoff

**Canonical source:** `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`  
**Target:** `codersachin99/windows-os`, `feat/0001-faithful-react-foundation`  
**PR:** https://github.com/codersachin99/windows-os/pull/1 (draft; not merged)  
**Status:** the first React application slice is working and CI-tested; **the full product is not migrated or release-ready**.

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

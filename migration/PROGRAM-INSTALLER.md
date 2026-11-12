# Source installer, executable stubs and Start Menu shortcuts

**Pinned original:** `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

## Source evidence

- `src/modules/system/testmode.js` contains webpack module **c170** with the complete base-variant application manifest. The original `src/modules/chunks/shared~plugin-embed~sandbox~vue-app~vue-i18n~vue-store.js` module **15ca** sets `VUE_APP_VARIANT` to its non-clean/default mode, so **42** source program records survive the variant filter and **34** have an `install.path`.
- The pinned `assets/locales/en-US.json` provides labels where a manifest record omits `name`. The base variant resolves `t=Windows/System32`, `o=Program Files`, `r=Program Files/Microsoft Games`, `c=Program Files/WindowsOS`, and `d(e,a)` to `Program Files/e`.
- The original shared webpack installer module **757f** returns `Object.keys(manifest).filter(program => manifest[program].install)`, derives Start Menu folder categories (Accessories, Games or root), builds names as original display title + `.lnk`, and serializes shortcut data as `JSON.stringify({exe: id, icon: id})`.
- The original shared webpack installer module **760d** iterates executable paths and writes the binary `MZ` stub returned by `757f.y()`: a **1,024-byte** buffer with bytes 0x4D,0x5A followed by zeroes. Its user installer creates corresponding `.lnk` files under `AppData/Roaming/WindowsOS/Windows/Start Menu/Programs`, including Accessories and Games subfolders.

## React implementation

- `packages/filesystem/src/sourceProgramManifest.json` is a source-revision-frozen extraction of all **42** actual program definitions: ID, category, name, original hidden status, alias, original install relative path and app-data identifier.
- `packages/filesystem/src/sourcePrograms.ts` provides typed lookup, source shortcut path/JSON helpers, exact 1024-byte original install stubs and an idempotent installer that **does not overwrite existing edited files**.
- `packages/filesystem/src/index.ts` now stores binary files as validated base64 in the same persistent VFS snapshot and exposes `readBytes/writeBytes`. Existing text files, copy, move, trash and restore continue working; binary data is not silently interpreted as text.
- `packages/sdk/src/runtime.ts` initializes source executables and shortcuts on original Guest first-run or an upgrade from the earlier migrated Guest filesystem. A source-revision install marker prevents re-creating shortcuts intentionally deleted after installation. Custom source mount configurations **do not** receive invented original programs.
- `packages/apps/explorer/src/ExplorerApp.tsx` opens source `.lnk` and known installed executable paths by resolving the source app registry; only **implemented native applications** can actually launch. Thus Notepad can launch from its installed Accessories shortcut or `notepad.exe`. Unmigrated Calculator/Chrome/etc. remain explicit pending work.
- `packages/ui/src/StartMenu.tsx` provides an All Programs hierarchy populated by real persisted `.lnk` entries from Guest's source Programs folder. Unsupported applications appear disabled and remain visible as migration backlog rather than fake functional apps.

## Examples from the original manifest

| Program | Installed binary on System C: | Shortcut under Programs |
|---|---|---|
| Notepad | `Windows/System32/notepad.exe` | `Accessories/Notepad.lnk` |
| Calculator | `Windows/System32/calc.exe` | `Accessories/Calculator.lnk` |
| Command Prompt | `Windows/System32/cmd.exe` | `Accessories/Command Prompt.lnk` |
| Chess Titans | `Program Files/Microsoft Games/Chess Titans/Chess.exe` | `Games/Chess Titans.lnk` |
| Google Chrome | `Program Files/Google/Chrome/Application/chrome.exe` | `Chrome.lnk` |
| WordPad | `Program Files/Windows NT/Accessories/wordpad.exe` | `Accessories/WordPad.lnk` |

All installed binary paths are prefixed with `/EXTERNAL/computer/drive0/`. All shortcuts are prefixed with `/EXTERNAL/computer/drive0/Users/Guest/AppData/Roaming/WindowsOS/Windows/Start Menu/Programs/`.

## Verification and limitations

Unit tests assert the original 42/34 manifest count, exact source folder and shortcut paths, 1024-byte MZ bytes, preservation across a persistent reload, idempotency, no overwrite, user deletion and old Guest upgrade. Playwright tests cover source All Programs folders, Notepad launch via persisted shortcut, unmigrated app handling and binary/shortcut data across reload.

The original MZ files are **placeholder install bytes**, not runnable Windows PE executables. Reproducing them preserves the exact simulated file content but does not implement the programs. Original app implementations for Calculator, Command Prompt, WordPad, browser, games, media, themes, etc., remain pending. Full Start Menu theme/layout, localization, system-wide file association map, hover/keyboard navigation, folder dragging, per-user installers, upgrade build marker and all original art require additional source mapping and tests.

The program manifest is recovered faithfully; **application feature parity remains incomplete**.

# Original Windows 7 Search Dialog and Companion — source trace

Pinned legacy revision: 4e63290d783009e1293433c6ccf252abba9c1187.

## Child Search Dialog — src/modules/apps/search-dialog.js (fbbb)

- Source WindowMain is 360px wide, height auto, non-resizable with a parent Computer window and close-only titlebar.
- Search For defaults to *.*, is automatically focused; Start From uses shared cf89 disk/Document/current scope options; Search all subdirectories starts checked.
- Enter/OK emits a virtual query to parent. Cancel/close cancels; computer.js searchFromDialog closes the child and navigates its own session. It does not open the standalone Find window.
- The target mounts a parent-owned SearchDialog with an in-Explorer overlay; exact source parent focus/skin still needs screenshot comparison.

## Search Companion — src/modules/apps/search-companion.js (7a5f)

- Search Companion replaces the native navigation pane inside Computer (showCompanion). It has file-name input, Look in, and collapsible When/Size/Advanced groups.
- Source date choices: none, last week (7 days), month (1 month), year (12 months), between from/to.
- Source size choices: none, small <=100KB, medium <=1024KB, large >=1024KB, custom at-least/at-most KB.
- Advanced options use file-kind keys from shared 2e2c: folder/document/picture/music/video/playlist/program/link/webpage. Movie exists in the engine but is excluded from the dropdown.
- Back closes sidebar; Search navigates the same Computer session. The target reuses the existing single Guest virtual filesystem and search progress/abort implementation.

## Open fidelity boundaries

- Original 2e2c.f uses a search path with URLSearchParams q/in/name/sub; original 2e2c.e ranks filename relevance/mtime. Target uses win7-find: internal query and a basic VFS scan, not byte-identical serialization or ranking.
- Original 0e9a extension-category predicates remain only partly traced. The exact original f3ad theme search dispatch is recorded below. The preexisting Win7 Advanced Find entry is an interim convenience, NOT claimed to be default source theme menu parity.
- Exact UI screenshots, child-modal parent focus, international text and legacy themes need verification.
- This remains an unmerged draft PR, main unchanged, no product release. Run CI only when explicitly requested with [run-ci].

## Source theme dispatch verified (2026-11-13)

The pinned webpack module f3ad in legacy-win7/src/modules/runtime/vue-app.js has the actual explorerSearch style mapping:

- regex "^winxp|^winL|winW|win2k" -> Search Companion pane
- regex "win95|win98" -> standalone Find dialog
- "win31" -> parent-owned child Search dialog
- default "win7" -> null, meaning none of the classic interfaces (Computer has its own built-in search bar)

Target sourceExplorerSearchStyle in packages/apps/explorer/src/searchStyle.ts follows the pinned map. DesktopShell passes the current desktop theme to Explorer. React also accepts only known theme names via the legacy testmode.js-inspired validated "?theme=..." switch, so browser e2e can exercise XP and Win31 behavior without claiming their full visual themes are migrated. Default Win7 does not expose XP and Win31 classic buttons. The preexisting Advanced Find link is migration-era functionality, still pending its exact Win7 source menu mapping. Do not call default Win7 search pixel-identical.

For testing, /?theme=winxp exposes Search Companion and /?theme=win31 exposes Search Dialog. This changes conditional source search behavior; XP/Win31 full desktop skin is still unported.

## Final source theme CI verification — 2026-11-13

- [Opt-in CI 43357788138 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43357788138) on code SHA `e7d50c747ae0fd1e5f44413b80a3030f95b21d49`: TypeScript, **205 unit tests across 40 files**, source/Contacts checks, Vite production build and **218 desktop/mobile Chromium browser tests passed**.
- Browser cases exercised parent-owned Win31 Search Dialog, WinXP Search Companion, Win95 standalone Find, default Win7's absence of classic search tools, and Start From navigation into the real Guest Documents path.
- Previous opt-in run caught two missing theme-resolver/type imports at TypeScript stage, corrected before the final green run. No original XP/Win31 skin or full source search ranking fidelity is claimed.

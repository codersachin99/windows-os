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
- Original 0e9a extension-category predicates and exact f3ad theme explorerSearch.style mapping are not yet fully traced. The three explicit Explorer entry controls are interim, NOT claimed to be default Windows 7 source theme behavior.
- Exact UI screenshots, child-modal parent focus, international text and legacy themes need verification.
- This remains an unmerged draft PR, main unchanged, no product release. Run CI only when explicitly requested with [run-ci].

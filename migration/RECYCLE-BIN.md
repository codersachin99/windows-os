# Source-driven Recycle Bin integration

Pinned reference: legacy-win7/src/modules/apps/bin.js delegates to Computer with \`hoistedPath: trashPath\`. Its shell state exposes dynamically assigned \`systemPath\`, \`desktopPath\`, \`trashPath\`, and source \`getStats()\` disk metadata. The source uses shell \`TrashAdd\`, \`TrashRemove\`, \`TrashRestore\` and \`TrashEmpty\` actions.

React components:
- \`packages/filesystem/src/index.ts\`: source-configured \`trash(path, trashPath)\`, \`restore(binItem, trashPath)\`, \`emptyTrash(trashPath)\`, \`removeTree(path)\`. All content and original/deletion metadata persist in the same atomic Guest VFS snapshot; collisions and missing parents reject without overwriting. Binary files are still out of scope.
- \`packages/sdk/src/runtime.ts\`: validates explicit source \`LegacyRuntimeMounts\` and optionally persists the supplied runtime snapshot. Guest logon restores only this saved config; it does **not** create default drive letters, original user directories, or trash paths.
- \`packages/apps/explorer/src/RecycleBinApp.tsx\`: source-shape Bin wrapper; reuses the hoisted Explorer at the configured path when available, otherwise accurately reports "unmounted".
- \`packages/apps/explorer/src/ExplorerApp.tsx\`: selection-specific Delete (to Bin), Restore, Delete permanently and Empty Recycle Bin with confirmation, source-aware search exclusions, and hoisted Bin navigation root protection.

Tests:
- Unit coverage for tree deletion, recycle/restore/empty, duplicate names and persistence failure, and source runtime mount identity.
- Playwright explicit-source-runtime fixture coverage for Computer -> Bin -> Restore -> reload persistence, and unconfigured source sessions.

Limits: The original Vue/webpack source uses its own trash metadata and shell events; the new atomic VFS metadata format is an implementation-level replacement, not byte-level compatibility with source on-disk internals. Source disk provisioning, original permission/shortcut handling, rename/upload/drag/drop and complete Win7 Bin visuals remain incomplete. \`bin.js\` is **in-progress**, not verified.

## Verified Recycle Bin checkpoint

Opt-in [GitHub Actions run 43157555063](https://github.com/codersachin99/windows-os/actions/runs/43157555063) passed TypeScript, tests, source inventory, build and Chromium desktop/mobile interactions including the explicit source-runtime fixture and unmounted-session fallback. Real legacy `getStats` and session metadata acquisition is still missing; no normal Guest disk or Bin path is invented.

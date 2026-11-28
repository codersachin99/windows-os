# Desktop context menu multi-selection — selected path count, not icon count

Date: 22 November 2026. Immutable source: codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776. Working target: codersachin99/windows-os@feat/0001-faithful-react-foundation, draft PR #1.

## Source proof

Frozen src/modules/system/main.js component DesktopItemMenu watcher receives an object with id and ids (selected keys), then assigns this.paths = ids.map(getShortcut).filter(shortcut => shortcut && shortcut.path && key !== computer && key !== bin).map(shortcut => shortcut.path). Its computed isMultiple returns this.paths.length > 1. The source menu hides Open, Rename, Properties and Extract here when isMultiple is true, not merely when multiple Desktop icons are highlighted.

Original openItemMenu({e,id}) preserves the selected keys when the right-clicked item is already selected and sends data {id,ids:[id,...selectedKeys.filter(k=>k!==id)]}. A selection of Computer plus one actual Guest file therefore has a single source path and should still show Open/Rename/Extract where applicable. A program-only .lnk has no shortcut.path and does not increase the path count. Two separate path-backed .lnk aliases referring to the SAME underlying target still contribute two original watcher entries, even though the file transfer clipboard deduplicates their target paths.

## React implementation

packages/ui/src/desktopFileActions.ts now exports desktopSourceItemMenuPathCount. It counts distinct selected icon IDs with validated source shortcut paths using the same mounted Guest target resolver as source Desktop Copy/Cut. It does NOT count system icons, program-only .lnk, stale icon keys or invalid/host target URIs. It does NOT deduplicate different selected icons pointing to the same target; the original menu paths array counts each.

packages/ui/src/DesktopIcons.tsx now uses this source count to compute contextMultiple, which gates SourceDesktopItemMenu input.multiple and whether Extract here is available. Existing real Copy/Cut, ZIP/Download, Delete and Recycle Bin service routing remains unchanged. Context menu selection preservation is kept.

## Regression contract

packages/ui/src/desktopFileActions.test.ts covers Computer/Bin/program-only links mixed with one real file, two real files, distinct aliases with the same target, duplicate selected IDs and invalid host target. Existing clipboard URI dedup is explicitly contrasted with original menu path count.

New tests/e2e/source-desktop-context-path-count.spec.ts verifies on desktop and mobile Chromium: selected Computer plus one ZIP retains source Open/Rename/Extract here and actually extracts the mounted Guest bytes; two real file paths plus Computer hide Open/Rename while retaining Download/Copy; program-only .lnk plus one real Guest file counts as one path. The opt-in GitHub Actions focused browser list explicitly includes this spec.

Previous CI #44984857015 SUCCESS on d8b5efb verifies the preceding Bin drag data-loss safeguard, not this new context-menu count fix. Run exact-head [run-ci] for TypeScript, unit tests, source inventory/artwork/Contacts audits, Vite and focused/full desktop/mobile Playwright. Do not claim original paired pixel parity across all 37 theme IDs without LEGACY_SOURCE_READ_TOKEN, do not mutate frozen reference or main, merge PR #1 or release.
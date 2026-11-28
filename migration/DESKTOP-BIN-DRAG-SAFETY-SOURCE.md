# Desktop Bin pointer-drag safeguard — frozen-source distinction

Date: 22 November 2026. Frozen source: codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776. Working branch: feat/0001-faithful-react-foundation, draft PR #1.

## Actual source vs existing React extension

Frozen src/modules/system/main.js icon pointer mixin pressIcon → moveIcons → dropIcons merely updates icon positions via ShortcutMove after the 4px threshold. No Bin hit test, TrashAdd, or deleteItems occurs in that dropIcons function. By contrast, its keyboard deleteSelectedIcons and DesktopItemMenu.deleteShortcut explicitly call deleteItems on selected getShortcut(id).path. The latter was migrated separately and verified at CI #44938100831.

React already has an EXTRA pointer drag-to-Bin convenience for direct Guest files/folders; it is not claimed as exact source behavior. Previously its unconditional trashMany(file.entry.uri) destroyed an Explorer-created .lnk JSON or program-only shortcut if dragged over Bin, while leaving the actual referenced Guest target untouched, silently contradicting the source Delete target model.

## Safe compatibility change

packages/ui/src/desktopFileActions.ts exports desktopSafeBinDragPaths: accepts canonical mounted direct Guest file and folder icons only; rejects file-backed and program-only .lnk, synthetic computer/bin/app icons, unsafe paths, stale icons and mixed selections including even one forbidden item. Rejection is whole-batch and never modifies a file or linked target.

DesktopIcons.tsx preserves direct-file/folder Bin pointer gestures using existing atomic Guest trashMany, while shortcut drops show a clear alert advising explicit Delete, which has a confirmation and a source-backed target path. Desktop icon reposition, Explorer transfers, ZIP and clipboard stay unchanged.

## Verification

desktopFileActions.test.ts tests allowed direct Guest file/folder groups and denied .lnk/system/mixed/host/stale selections. New focused tests/e2e/source-desktop-bin-drag-guard.spec.ts covers actual Explorer-created path-backed shortcut to Documents file, pointer drop onto Bin, visible rejection, preservation of shortcut and original target, neither appearing in Bin; also program-only .lnk remains. Existing tests/e2e/desktop-bin-drop.spec.ts direct-file and batch restore tests remain enabled in the full desktop/mobile browser suite.

Run exact-head opt-in [run-ci] for TypeScript, all unit tests, source/artwork/Contacts audits, Vite, focused and complete Chromium. Prior green #44938100831 at 6741bed predates this safeguard. No claim of paired original 37-theme visual parity without LEGACY_SOURCE_READ_TOKEN, no merge or release.
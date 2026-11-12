# Atomic Guest shell transfers and native Desktop folder/Bin drops

**Pinned original reference:** legacy-win7 \`src/modules/system/main.js\` Desktop icon gestures/Recycling and \`src/modules/apps/computer.js\` FileCopy/FileMove and Explorer selection, at source commit \`4e63290d783009e1293433c6ccf252abba9c1187\`.

## Atomic filesystem transfer

\`VirtualFileStore.transferMany(paths,destination,mode)\` now validates all selected roots, collapses selected descendants, validates target paths/duplicate names/missing files, builds every destination subtree in a new map and invokes **one** existing snapshot \`commit()\` for the entire move or copy. This guarantees in-memory state and persisted Guest snapshot are unchanged if \`storage.setItem()\` fails (e.g. quota). Subscribers receive one notification per changed root **only after** persistence succeeds; one storage write regardless of selection count. TXT, binary and folder descendants are preserved. \`transferFiles\` delegates to the atomic store method for the mounted VirtualFileStore; its compatibility fallback for external adapters without \`transferMany\` is not atomic. Existing Desktop pointer drags, Explorer HTML drags, and FileClipboard cut/copy all use the shared store and therefore share the atomic path.

\`packages/filesystem/src/transferAtomic.test.ts\` verifies exact byte/content integrity, one write, ordered post-commit notifications, missing/collision preflight, fault-injected quota errors for both move and copy, no UI event on failed persistence, safe retry and clipboard cut retention. Distinct from the previously atomic \`trashMany\` Recycle Bin path.

## Desktop folder and Bin targets

\`packages/ui/src/desktopNativeDrop.ts\` distinguishes real file-backed Guest folder icons from the builtin Recycle Bin; file icons and other system icons cannot accept native drops. A Desktop folder accepts a trusted \`SHELL_DRAG_TYPE\` token as FileMove or Ctrl/Meta FileCopy, plus external File payloads through the existing Guest \`importDroppedFiles\` parser. Bin uses **only** an in-process token to call \`fileStore.trashMany\` and set original path metadata; host File drops cannot forge a recycled item. Both icon targets show Win7-style hover feedback; native drops stop bubbling to the Desktop background handler. No host filesystem writes occur.

\`tests/e2e/explorer-desktop-icons.spec.ts\` checks native move into a desktop folder, copy and collision, multi-selection recycle and Restore, external File into folder and rejection of host File into Bin in desktop/mobile Chromium.

**Limitations:** \`importDroppedFiles\` still writes multiple *host-uploaded* files sequentially and lacks all-or-none quota rollback; this work guarantees atomicity of **existing VFS multi-copy/move**, not multi-file uploads. Exact original drag-ghost art, broader touch support, incomplete Windows app migrations and pixel-by-pixel screenshot parity remain open. No full product claim.

**Status:** code and tests pushed, opt-in CI pending.

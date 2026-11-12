# Atomic external browser File imports — Guest VFS

**Source anchor:** \`legacy-win7/src/modules/apps/computer.js\` accepts browser File drops on Explorer directory targets; \`src/modules/system/main.js\` accepts external files on the Guest desktop via the \`_parse(..., desktopPath)\` handler. The target retains these UI flows, and the migration centralizes their filesystem writes in the shared SDK.

## Implementation

\`packages/filesystem/src/drag.ts\` \`importDroppedFiles\` preserves the existing preflight of directory, malformed names, case-insensitive duplicate filenames and existing target collisions. It now **reads every host File payload fully before starting any write**. \`.txt\` files use the File's UTF-8 \`text()\`, while binary data uses \`arrayBuffer()\`/Uint8Array. An interrupted read or second-file decode error therefore has no persisted or in-memory effect.

\`VirtualFileStore.createFilesAtomic\` rechecks all target paths against the *current* mounted Guest VFS after asynchronous browser reading (preventing a concurrent file creation from being overwritten), checks duplicate normalized case-folded names, and builds the entire selection as a new VFS map. It calls the existing \`commit\` **once**, meaning that a quota/storage write failure leaves the live and persisted filesystem untouched; no file-change notifications are emitted. A successful batch notifies subscribers per file *only after* the one snapshot commit. The method is create-only: it never replaces existing files, regardless of extension.

All production entry points (Explorer Upload button, folder-row File drops, Desktop background File drops and Desktop folder-icon File drops) already share \`importDroppedFiles(fileStore,...)\` and therefore receive this behavior. The compatibility fallback for third-party filesystem adapters that do not implement \`createFilesAtomic\` is sequential and does not have this atomic guarantee; the mounted \`fileStore\` does.

**Tests:** \`packages/filesystem/src/importAtomic.test.ts\` covers mixed Unicode text/binary exact bytes, one snapshot write, post-commit notifications, reload persistence, injected QuotaExceeded error with unchanged state, failed browser File decode, collision preflights, race with concurrent creation, invalid filename and invalid direct-create contents. \`tests/e2e/atomic-import.spec.ts\` covers Explorer multi-File Upload with one storage write, quota-injected failure and successful retry, and native Desktop external multi-File drop in desktop/mobile Chromium.

**Boundaries:** Browser File objects stay inside the Guest browser VFS; there is no reading or writing host paths. Existing Win7 interface is preserved. This doesn't imply source app/theme pixel fidelity or completion of remaining original apps. No full product release or merge.

**Status: verified.** [Opt-in GitHub Actions run 43231526749](https://github.com/codersachin99/windows-os/actions/runs/43231526749) passed **150 unit tests (28 Vitest files)**, **152 desktop/mobile Chromium browser tests**, TypeScript, source/Contacts checks and production Vite build. New browser quota fault-injection cases passed. This does not imply entire Windows 7 simulator parity.

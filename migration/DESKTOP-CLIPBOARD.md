# Desktop keyboard, context and shared clipboard — scoped source migration

**Reference:** pinned \`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187\` \`src/modules/system/main.js\`. Source item context menu provides Cut/Copy, selected icons map through \`getShortcut\` to real file-backed paths, background menu Paste targets \`desktopPath\`, and desktop shortcut scope has Select All and Delete; each remains attached to the source session.

## React implementation

- \`desktopSelectedFilePaths\` filters desktop selection into actual source Guest file URIs, never builtin Computer/Recycle Bin app icons, and deduplicates selection keys without using any mock desktop state.
- \`DesktopIcons.tsx\` routes Ctrl/Meta+C (Copy), Ctrl/Meta+X (Cut), and Ctrl/Meta+V (Paste), including right-click Cut/Copy and background Paste, through \`fileClipboard\` shared with Explorer. Cross-folder copy/move uses \`transferFiles\` validation and existing source-backed VFS; no host clipboard, arbitrary host executable or overwrite. Duplicate/same-folder copy naming remains outside this bounded source slice and is rejected safely.
- Delete now asks for confirmation before moving real selected files/folders into the mounted \`trashPath\` using atomic \`trashMany\`. Cancel is non-destructive. Ctrl/Meta+A selects the same source desktop item set, including system icons, but file operations operate on file entries only.
- Keyboard commands apply when desktop/background or desktop shortcut has keyboard focus. They ignore rename fields, dialogs, shortcut wizard, menus, and windowed application controls to avoid intercepting Notepad and Explorer keystrokes. Existing F2 rename remains operational.

## Acceptance

Unit tests in \`packages/ui/src/desktopFileActions.test.ts\` cover mixed built-in/real selection and clipboard persistence/no-overwrite. Browser tests in \`tests/e2e/desktop-clipboard.spec.ts\` check Desktop → Explorer copy, Explorer → Desktop move, right-click Copy and collision, confirmed/cancelled group deletion, built-in icon safety and Bin visibility in desktop/mobile Chromium.

**Verified:** GitHub Actions [43202578182](https://github.com/codersachin99/windows-os/actions/runs/43202578182) passed TypeScript, 124 Vitest tests across 23 files, source auditing/Contacts fidelity, Vite build, and 116 desktop/mobile Chromium browser tests. The initial run [43201772163](https://github.com/codersachin99/windows-os/actions/runs/43201772163) had two prior-fixture failures because context Delete now confirms; the legacy `desktop-files.spec.ts` fixture was updated and the complete rerun passed. Original desktop module remains \`in-progress\`; full shortcut wizard, screenshot parity, same-directory copy naming, per-theme menu positioning and complete host clipboard semantics remain outstanding.

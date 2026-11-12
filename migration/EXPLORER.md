# Explorer source-map checkpoint

Source reference: legacy-win7/src/modules/apps/computer.js at 4e63290d783009e1293433c6ccf252abba9c1187.

ExplorerSession (packages/apps/explorer/src/model.ts) now manages folder navigation and history, back/forward/up, selectable file entries, case-insensitive current-folder name filtering, view-mode state, create-folder and rename operations. It observes the same VirtualFileStore as Notepad through change events; unit tests exercise history and document updates.

The source Computer app has much more: disk enumeration from getStats, special folders, breadcrumb layout, search index and wildcards/date/size filters, drag/drop, Windows shell shortcuts, full context menus, Recycle Bin actions, device mounting and numerous view modes. The model is an incremental basis, **not complete original behavior**. Do not invent disk metadata; source runtime mounts are still pending.

## Connected native Computer view

`packages/apps/explorer/src/ExplorerApp.tsx` now replaces the Computer placeholder. It renders the source stylesheet unchanged plus layout adapters and accepts only real filesystem entries. It supports folder navigation, back/forward/up, local name search, view modes, folder creation, rename and shared updates. The known `.txt` association opens the native Notepad with a selected file path carried by the shared window contract.

The source Computer stylesheet has been imported byte-for-byte (Git blob SHA `f0cd08ab11f0c38a69cfacf602566059003afd99`). The original Win7 folder and file images remain referenced under their exact legacy paths and need checksum-verified asset import before full visual acceptance. This implementation does not invent guest drives. Until source runtime volumes are mounted, the Explorer view displays the actual virtual root rather than a fabricated `C:` volume. No permanent-delete operation is offered before Recycle Bin semantics are implemented.

Playwright tests cover saved text files opening from Computer and folder navigation history. Parity acceptance against the original `computer.js` UI, special folders, search index, selection, drag/drop and device list is still pending.

## Verified implementation checkpoint

[GitHub Actions run 43147045676](https://github.com/codersachin99/windows-os/actions/runs/43147045676) passed the current unit tests, TypeScript, Vite build, source inventory and desktop/mobile Chromium tests, including the newly introduced cross-app Computer/Notepad behavior. This is **not source screenshot parity** and does not verify special folders/disks/trash.

## Shared shell clipboard checkpoint

Source module `src/modules/apps/computer.js` wires `FileCopy`/`FileMove` actions through the Vuex shell, not through browser/host clipboard APIs. The React port now has `FileClipboard` in the shared filesystem package and a singleton in the SDK. Explorer exposes Cut/Copy/Paste, Ctrl+X/C/V, and Ctrl+A (within Explorer), with explicit conflict validation, multi-select support and persistently shared updates between windows. No writes are allowed to host disk, and no silent overwrites occur.

Unit tests exercise copy/cut/clear, directory and missing-file protection, prevalidated multi-selection conflicts and subtree prevention. New Chromium tests exercise shared Notepad file copy/move and paste error handling. Full clipboard parity (context menus, overwrite prompts, drag/drop and source shortcut metadata) remains pending.

## Search scope checkpoint

`packages/filesystem/src/search.ts` introduces a bounded source-mapped search contract: scoped folder, optional child folders, case-insensitive substring and DOS-style `*`/`?` name wildcards, skipped roots, result limit, progress and abort. Explorer exposes a Find action, subfolder toggle and file pattern input. The browser test creates a document in a virtual subfolder through Notepad, then finds it from Computer using recursive wildcard search.

The original `searchIndex.walk`, full content indexing, search operators and ranking are not yet reproduced, nor is the original search dialog layout. These capabilities remain `in-progress`.

## Verified clipboard and search checkpoint

Opt-in [GitHub Actions run 43157555063](https://github.com/codersachin99/windows-os/actions/runs/43157555063) succeeded after the foreground-window browser test fix. It covers new scoped filename search, original-style wildcard matching and shared clipboard operations, as well as original-source inventory and the previous Contacts/Notepad/Computer interaction suite. Full original search-index and appearance equivalence remain outstanding.

## First-run System (C:) and original context-menu routing

Computer's navigation panel now shows the source-defined System (C:) volume, Desktop, Documents, Downloads, Pictures, Music and Videos. The optical Z: source device appears disabled, not fabricated as a writable VFS disk. Right-click file/folder and background menu actions (Open, Cut, Copy, Rename, Delete, Restore, New folder, Paste, Refresh) use shared Explorer commands, while unmigrated Properties remains disabled. Context-menu creation/rename and source drive navigation have browser tests. See [SOURCE-BOOTSTRAP.md](SOURCE-BOOTSTRAP.md).

## Verified source Guest navigation and context menus

[CI 43164294440](https://github.com/codersachin99/windows-os/actions/runs/43164294440) passed 36 Chromium browser tests, including the source System (C:) and Guest directory navigation and right-click background/item actions. The navigation sidebar is horizontally scrollable at small viewports so the drive/user-folder shortcuts remain accessible on mobile. Full original Explorer properties dialogs, plugin shell context-menu handlers and exact theme visuals remain pending.

## Source .lnk shortcut and executable associations

Explorer recognizes source .lnk JSON shortcuts and known installed executable paths (from the full original c170 manifest). Installed Notepad shortcuts launch the migrated React Notepad; programs not yet ported report pending implementation. The exact 34 source program placeholders now appear on the C: disk, and All Programs reads real persisted shortcuts in root/Accessories/Games. See [PROGRAM-INSTALLER.md](PROGRAM-INSTALLER.md).

# Explorer source-map checkpoint

Source reference: legacy-win7/src/modules/apps/computer.js at 4e63290d783009e1293433c6ccf252abba9c1187.

ExplorerSession (packages/apps/explorer/src/model.ts) now manages folder navigation and history, back/forward/up, selectable file entries, case-insensitive current-folder name filtering, view-mode state, create-folder and rename operations. It observes the same VirtualFileStore as Notepad through change events; unit tests exercise history and document updates.

The source Computer app has much more: disk enumeration from getStats, special folders, breadcrumb layout, search index and wildcards/date/size filters, drag/drop, Windows shell shortcuts, full context menus, Recycle Bin actions, device mounting and numerous view modes. The model is an incremental basis, **not complete original behavior**. Do not invent disk metadata; source runtime mounts are still pending.

# Original Listview Details and Tiles migration

## Pinned reference

- Immutable original: codersachin99/legacy-win7 commit 4e63290d783009e1293433c6ccf252abba9c1187.
- src/modules/apps/listview-details.js Git blob 17a7e3d60e15a11c9b364ac78a37e2da257c605d; webpack module 32cd. Renders listview__view.has-details; one listview-item per source item; one listview-extra per extra; calls a321.normalizeWidth(width, extras.length, true).
- src/modules/apps/listview-tiles.js Git blob 9b7d039e3f7c628c74dcdbe21e7aa2a59d5db11b; webpack module 7662. Renders listview__view.has-tiles; one listview-item per source item and all supplied extras; single-extra case also supported.
- Both chunks share source listview-extra c162: span, listview__item-extra, opacity 70%, overflow hidden, text ellipsis, text-base and leading-5.

## Modular React implementation

- packages/ui/src/sourceListView.tsx provides SourceListView (details, tiles, plain) and SourceListViewExtra for both original bundles, with separated source CSS in sourceListView.css.
- Explorer and Recycle Bin reuse the components through the direct alias @windows-os/ui/listview, avoiding a DesktopShell index import cycle. They continue to supply their own actionable file buttons, selection, VFS data and drag/drop, not static dummy rows.
- Details rows show actual date modified, item type and byte size. Tiles rows show file type/folder label and file size from the Guest VFS. Explorer's original source View menu, selected row, double-click navigation and shortcut launch behaviors are preserved.
- A bounded width hint adapter handles simple px/percent values without allowing arbitrary CSS, but original a321.normalizeWidth implementation has not yet been established. Existing responsive Explorer CSS grids still control details column sizes.

## Tests and limits

- Pure unit tests cover bounded widths and invalid CSS expressions.
- Browser cases (Chromium desktop and Pixel 7) create a real source folder, assert Tiles extras, change to Details via the source View menu, assert all three Details fields, maintain row selection, switch to Tiles again, double-click folder and cancel source Delete confirmation.
- Original a321 exact width algorithm, full rich listview slots and alternate themes, other migrated apps that use source listviews and source-versus-React pixel equivalence are not fully migrated.

Implemented-slice [full CI #43589707509](https://github.com/codersachin99/windows-os/actions/runs/43589707509) **SUCCESS** at commit 8d23db2: 305/305 unit tests in 62 files, 318/318 desktop/mobile Chromium E2E cases, 53 exact original-art audits, TypeScript and Vite build. The original a321 exact width normalization and source-vs-React screenshot/pixel parity remain pending. Both modules still **in-progress**, PR #1 draft, main untouched, no release.

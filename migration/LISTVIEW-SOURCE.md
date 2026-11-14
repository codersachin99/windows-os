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
- A bounded width hint adapter handles simple px/percent values without allowing arbitrary CSS, and the original a321.normalizeWidth implementation is now directly ported; the Explorer responsive grid still owns visual sizing. Existing responsive Explorer CSS grids still control details column sizes.

## Tests and limits

- Pure unit tests cover bounded widths and invalid CSS expressions.
- Browser cases (Chromium desktop and Pixel 7) create a real source folder, assert Tiles extras, change to Details via the source View menu, assert all three Details fields, maintain row selection, switch to Tiles again, double-click folder and cancel source Delete confirmation.
- Full rich listview slots and alternate themes, other migrated apps that use source listviews and source-versus-React pixel equivalence are not fully migrated.

Implemented-slice [full CI #43589707509](https://github.com/codersachin99/windows-os/actions/runs/43589707509) **SUCCESS** at commit 8d23db2: 305/305 unit tests in 62 files, 318/318 desktop/mobile Chromium E2E cases, 53 exact original-art audits, TypeScript and Vite build. The original a321 width normalization is now source-exact, but source-vs-React screenshot/pixel parity remains pending. Both modules still **in-progress**, PR #1 draft, main untouched, no release.

## Exact original a321 header and width contract — 14 November 2026

Found webpack module a321 inside the immutable source chunk:

- src/modules/chunks/shared~bin~bsod~camera~computer~cpanel~games~installer-screen~notepad~paint~player~recorder~shortcut~49e2ebd6.js
- Original chunk Git blob SHA: ed3b984138eed7c830b5fbe4a8be08d58328cb35.
- a321.isFixedWidth(width) is true precisely when typeof width is number.
- a321.normalizeWidth(width,count,isDetails): let offset = isDetails ? 1 : 0; if width is truthy, return typeof number ? width + "px" : width.toString(); otherwise return 100/(count + offset) + "%".
- The original Details bundle calls normalizeWidth(extra.width, extras.length, true); the original listview column-header calls normalizeWidth(column.width, columns.length) without the Details offset. A zero width is source-falsy and therefore uses the fallback percentage.
- The same a321 bundle renders source listview__header with data-test-listview-columnheader and button.listview__header-column children; numeric explicit width adds shrink-0.
- New pure sourceNormalizeListWidth and sourceListColumnIsFixedWidth in packages/ui/src/sourceListView.tsx follow these exact rules, including zero-width truthiness and the additional Details label column.
- Reusable SourceListViewHeader renders original source column buttons. Explorer replaces its four inert detail-column spans with the shared header while its responsive CSS grid remains responsible for visual sizing. Generic SourceListViewHeader can still opt into source inline widths. The bounded SourceListViewExtra style adapter accepts only safe CSS widths from callers; the pure helper retains exact source coercion.
- New unit cases validate original a321 truthiness, numeric and CSS-string widths, Details offset and source header markup. Desktop/mobile E2E now verifies source a321 header button shape in the real Guest Explorer.
- Exact original theme CSS and screenshot pixel parity remain unverified. This is a source-verified utility algorithm, not a claim that the full listview modules or windows are pixel-parity complete.


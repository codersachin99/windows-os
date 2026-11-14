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

Implemented-slice [full CI #43589707509](https://github.com/codersachin99/windows-os/actions/runs/43589707509) **SUCCESS** at commit 8d23db2: 305/305 unit tests in 62 files, 318/318 desktop/mobile Chromium E2E cases, 53 exact original-art audits, TypeScript and Vite build. The original a321 width normalization is source-exact; full source/React screenshot pixel parity remains pending. Both modules still **in-progress**, PR #1 draft, main untouched, no release.

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


## Original 0616 listview-item and exact 400ms double-click helper — 14 November 2026

The pinned shared webpack chunk 49e2ebd6.js (Git blob ed3b984138eed7c830b5fbe4a8be08d58328cb35) defines module 0616. Its root button has class listview__item, conditional is-active, data-key, data-test-listview-item, title, native click and contextmenu, plus v-tap:400 and v-clickout. Labels have alternating marked and unmarked text from item.highlights.

The original src/modules/runtime/vue-click-helper.js (Git blob 71db7989b3f01b4a6841c5346d6d88ede6cc5169) provides the helper behind the click gesture: it increments a click count on each captured click, invokes the callback with false after a 400ms single-click timeout, and invokes the callback with true on the second click inside the window, clearing the timer. Source 0616 only invokes item.dblclick if the callback receives true.

- packages/ui/src/sourceListViewItem.tsx implements SourceListViewItem using original root class, data-key, data-test-listview-item and title, is-active selection and source click-helper second-click semantics with a 400ms timer. The consumer's onClick still selects immediately. The source onDoubleClick callback is invoked once on second click, avoiding a duplicated native dblclick listener. The 400ms comparison is isolated in pure sourceListItemIsDoubleTap.
- The shared sourceListItemHighlightParts follows original 0616 labelParts for sorted highlight ranges, with extra bounds checks. Explorer's safe sourceMarkedName uses this helper, rendering the source listview__item-highlight class along with the existing explorer-search-mark style.
- Computer and Recycle Bin now render actual VFS items with SourceListViewItem, retaining original Explorer file handlers, drag/drop, context menu, file shortcuts and the data-test-explorer-item selector used by existing tests.
- Unit tests verify source button attributes, 400ms threshold and filename highlights. New desktop/mobile browser tests verify a real Guest folder, item selection, source class and attributes, search-highlight rendering, native dblclick navigation and two rapid click events causing one opening.
- Still outstanding: v-clickout source popup exclusions, item.toggle checkbox, inline filename rename mode/30-character limit, CSS --shortcut theme styling and complete alternate-theme/pixel screenshot parity. The source shared chunk contains many unrelated modules and must not be marked fully implemented.


## Source item, rename and clickout continuation

The exact 0616 inline rename, plugin-clickout and vue-click-helper source behaviors are traced in [LISTITEM-INTERACTIONS-SOURCE.md](LISTITEM-INTERACTIONS-SOURCE.md). Win7 Explorer now uses the shared 30-character rename input and source item-context outside click, with a focus-change reset to prevent false double-clicks across modal dialogs. Combined CI pending; original pixel-parity and optional checkbox not complete.

## Original Win7 Tiles markup and geometry — 14 November 2026

- Source `src/styles/shell/listview-tiles.css` blob `792221cf9f42cfe1579f5860fec0332e727f5381`: tile is flex row, gap 8px, minimum 256px, width `calc(20% - 8px)`, padding 4px and 48px iconbox; `.listview__item-info` flexes in column with 2px gap. Webpack 7662 passes the source extras through shared 0616's info-wrapper slot.
- React Win7 Tiles now renders a real info wrapper containing label / inline rename and source type/size extras. Existing VFS click, drag, search, cut/copy, touch checkbox and selection handlers remain on `SourceListViewItem`. The old 32px three-row grid no longer applies to Win7. Other themes retain their existing markup, and a bounded 580px mobile fallback avoids horizontal overflow.
- One desktop/mobile Playwright scenario checks the real Guest row's 48px icon, source 2px info gap, source flex-column, minimum width and actual folder extra. Exact Details flex/header width and original source screenshots remain outstanding. New slice awaits opt-in full CI.

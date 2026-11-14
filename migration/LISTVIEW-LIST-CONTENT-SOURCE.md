# Pinned shell List and Content view source migration

## Immutable original source

- Original repository: codersachin99/legacy-win7 at 4e63290d783009e1293433c6ccf252abba9c1187.
- src/modules/shell/listview-list.js Git blob 7218186c4db75d10802a6b5e61cb6210f80250d3, webpack 00d7. Root class `flex flex-col flex-wrap gap-1 h-full listview__view has-list`. Renders a source `listview-item` for every item and no extra fields.
- src/modules/shell/listview-content.js Git blob 6a0b4416a2b8cca5dce9a31046920828ea955c34, webpack 27b9. Root class `flex flex-col w-full listview__view has-content`. Renders each item and *every supplied extra* through the shared `listview-extra` c162, preserving the default slot.

## React extraction and real application wiring

- packages/ui/src/sourceListView.tsx now exposes reusable `list` and `content` SourceListView variants in addition to existing Details/Tiles. The shared CSS includes the original column wrapping, 4px gap and full-height List behavior, and full-width flex-column Content behavior.
- Explorer and Recycle Bin pass the actual source View menu selection directly to the shared UI variants rather than assembling duplicate has-list/has-content classes. Real Guest VFS file item click, selection, drag/drop, rename, search and navigation handlers remain in Explorer.
- The Content view now shows a full-width icon, filename and real file type/date-modified/size metadata through SourceListViewExtra, all sourced from mounted Guest filesystem entries. List view does not render extra metadata, preserving the original 00d7 list contract.
- The Content UI uses source listview__item-info and listview__item-extra classes, with a responsive single-column fallback on compact screens. Original alternate theme-specific dimensions remain to compare; do not claim pixel-perfect screenshots.

## Test acceptance and remaining gaps

- sourceListView.test.tsx asserts exact has-list/has-content wrapper attributes. source-listview-list-content.spec.ts checks real Guest folder creation, switching source View menu List→Content, absence/presence of extras, file folder metadata, selected-item persistence and double-click navigation, on desktop and mobile Chromium.
- Original module prop-to-item adapter and rich slot composition in other apps, exact CSS by theme and actual source/target paired screenshots are not complete. Both source modules remain in-progress pending full CI.
- No merge/release; draft PR #1 and main unchanged.

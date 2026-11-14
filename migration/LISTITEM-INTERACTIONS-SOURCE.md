# Pinned 0616 list-item interactions, source clickout and inline rename

## Immutable legacy references

- Pinned legacy commit: 4e63290d783009e1293433c6ccf252abba9c1187.
- 0616 item in shared~bin~bsod~camera~computer~cpanel~games~installer-screen~notepad~paint~player~recorder~shortcut~49e2ebd6.js, blob ed3b984138eed7c830b5fbe4a8be08d58328cb35.
- src/modules/runtime/vue-click-helper.js, blob 71db7989b3f01b4a6841c5346d6d88ede6cc5169, webpack 82f9. Source v-tap:400 increments clicks and fires the second-click action when two clicks occur within 400ms.
- src/modules/plugins/plugin-clickout.js, blob 7f8f5c392c71ca622bcc59883e24ef5866eae9e9, webpack 252b. It excludes the current item, plus registered popupItem ancestors using composedPath, then calls item.outclick on an outside mouse or touch action.
- The 0616 item input uses class listview__item-label is-input, input maxlength 30, autofocus/select when renaming, Enter triggers input blur and blur invokes item.rename(newFullName).

## React implementation

- packages/ui/src/sourceListViewItem.tsx retains source item button class, is-active, data-key, data-test-listview-item, native file activation callbacks and source label highlight segmentation.
- Source 82f9 double-click timing runs with the exact 400ms threshold. A focus-loss reset is intentionally added: switching to the Delete confirmation or another control clears a pending item double-click, so selecting the same file after dismissing a modal cannot unexpectedly open a folder. Original source's helper doesn't explicitly include this reset, but real file operations need this safety guard.
- Source 252b clickout is optional per item, with host containment and popup-selector exclusions checked against composedPath/closest. The Win7 Explorer item context menu uses it, while background menus continue to use the pre-existing backdrop dismissal. React uses pointerdown to unify mouse and touch rather than selecting one listener per original directive.
- packages/ui/src/sourceListItemRename.tsx offers original inline 30-character text input, selected on mount, Enter to blur/commit, blur commit, and Escape cancellation (the Escape behavior is an intentional accessibility addition). All filename text remains React-escaped.
- The Win7 Explorer toolbar/context Rename action and F2 key open the inline list-item input, invoke the existing Guest VirtualFileStore session.rename on commit, and keep the other themes' existing modal Rename fallback. This avoids introducing host-filesystem access.
- New sourceListItemRename.test.tsx validates the source input attributes and safe escaping. New listview-source-rename.spec.ts covers real Guest folders with F2, enter, context-menu Rename, escape, clickout popup exclusions and blur commit, on desktop and mobile.

## Regression evidence and remaining gaps

- Previous initial 0616 CI #43603371340: 313/313 units passed, 324/326 browser tests passed. Two source-message.spec.ts cases failed because a pending 400ms second click leaked across dismissal of Delete confirmation, causing folder navigation. Focus-loss reset added in this increment, full opt-in CI pending; **do not mark this increment green yet**.
- The original 0616 optional checkbox toggle/item.toggle, long-press source menus, clickout Vue directive lifecycle for arbitrary hosted components, shortcut CSS theme art, original newFullName extension helper, source popupItem registration and exact screenshot pixel parity remain open.
- The standalone source runtime vue-click-helper and plugin-clickout modules are now **in-progress**, not marked completed, as only their relevant item interactions are ported.
- Do not infer full parity from tests or target-only screenshot captures. PR #1 stays draft and main unchanged; no release.

## Source fa65 touch-only multi-selection checkbox — 14 November 2026

- The immutable original shared chunk `src/modules/chunks/shared~bsod~games~main.js` (Git blob `ecca9d786763c6be07df543e94701fe057e545ad`) exports webpack module **fa65**. Its root is a `span.winui-checkbox.item-checkbox` with `role=checkbox`, `aria-checked`, `aria-label`, `data-test-item-checkbox`, plus hidden checkbox input and label; it stops pointer/mouse/touch/double-click bubbling, and emits `input: !value` when clicked.
- The pinned original `src/modules/apps/computer.js` (Git blob `47aa521237c10f5e6763df37a1d8dcd73330f84f`) computes `showCheckboxes` as `isTouch && canMultiSelect && selection.length > 0`; item.toggle invokes `session.toggle(uri)` only then.
- `packages/ui/src/sourceItemCheckbox.tsx` ports the source class, ARIA and event suppression, checked state and toggle callback. A keyboard Space/Enter toggle is an intentional accessibility improvement. `packages/ui/src/sourceListViewItem.tsx` renders this optionally when `toggle` exists, before the icon and text, as in the source.
- React Explorer only enables source checkboxes on Win7 touch devices after at least one item is selected; a second checkbox toggles the existing Guest filesystem selection instead of navigating/opening a folder. Tiles and Details CSS explicitly reserve an extra checkbox slot, including compact mobile details columns. No host filesystem access is added.
- Unit checks cover source checkbox class, attributes and checked/unselected representation; desktop/mobile Playwright creates two real folders and verifies conditional display, checked flags, multi-selection, deselection, keyboard accessibility and unchanged directory location.
- The source's alternative theme artwork, exact hitbox/pixel sizing, long-tap menus and full source screenshot parity remain unverified; the shared source chunk contains unrelated modules and must not be marked fully migrated.

## Rename regression expectations and checkbox combined verification — 2026-11-14

- Source inline-rename/clickout [CI #43604884502](https://github.com/codersachin99/windows-os/actions/runs/43604884502) **FAILURE**: **315/315 unit in 65 files**, original **55 source-art audits**, TypeScript and production build passed. Chromium **326/330** passed; 4 desktop/mobile cases in explorer-organize.spec.ts and source-guest.spec.ts waited for the old modal Rename dialog. The actual Win7 0616 source now uses the inline text field, so the test contract—not the source behavior—needed updating. Both specs now assert the inline source field, type a real Guest folder rename and press Enter. Do not treat run #43604884502 as a pass.
- The source fa65 touch-only multi-select checkboxes were committed on 89d659c without [run-ci] specifically to avoid overlapping CI. This next combined [run-ci] commit verifies both updated rename integration and touch checkbox source contract on desktop/mobile, including the prior source-message modal focus regression.
- Inventory remains 257 pending, 25 in-progress, 8 implemented, 0 complete source parity / 290. Keep PR #1 draft, main unchanged, no release.


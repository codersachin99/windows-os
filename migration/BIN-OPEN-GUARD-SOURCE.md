# Source Recycle Bin open guard — deleted directories must not navigate

Date: 22 November 2026. Immutable original: codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776. Candidate: codersachin99/windows-os feat/0001-faithful-react-foundation, draft PR #1.

## Frozen source behavior

`src/modules/apps/bin.js` is a thin Computer wrapper, passing `id='bin'` and `hoistedPath=this.trashPath`. Its `src/modules/apps/computer.js` Explorer list view's `open(e)` checks `e.uri.includes(this.trashPath)` BEFORE deciding whether to launch a shortcut, open a file or call `openFolder(e)`. Therefore deleted folders are not opened by double-click or Enter within Bin, exactly like deleted files; users must Restore first. The normal Explorer `openFolder` call emits navigation only for non-trash items. This guard also preserves deleted tree metadata and the hoisted trash navigation boundary.

## React defect and correction

`packages/apps/explorer/src/ExplorerApp.tsx` `openEntry(path,type)` previously checked `type==='directory'` *before* `isBin`, allowing deleted directories to navigate into the trash tree on double-click/keyboard Enter. Files already displayed a 'Restore this item from the Recycle Bin before opening it.' message. The corrected dispatch checks `isBin` first for ALL types, then performs normal directory and file handling only when not in Bin. This preserves the existing useful error message, selection, source Bin context menu (Restore, Delete, disabled Properties), confirmation lifecycle, real VFS restoration and ordinary Computer navigation. It does not simulate a host filesystem or permanently erase any bytes.

## Browser acceptance

`tests/e2e/source-bin-folder-open-guard.spec.ts` sets up a real nested Guest folder, deletes its parent into the mounted Bin, opens Bin and verifies double-click and focused Enter do not change the `Recycle Bin` address or create Back history. It verifies the deleted item remains and the original restore action recovers the parent AND nested folder. The matrix runs under win7/winxp/win11 on desktop and mobile Chromium, matching the shared frozen `computer.js` guard across skins. The focused Actions browser list explicitly includes this spec, and full browser tests remain enabled.

Previous [CI #45018661202](https://github.com/codersachin99/windows-os/actions/runs/45018661202) SUCCESS at `7d162af` accepted original Start library icon hover/artwork, not this later Bin fix. Run new `[run-ci]` after commits and verify TS/unit, pinned source inventory/theme image SHA/Contacts, Vite build, focused and full desktop/mobile browser. Do not conflate no failures so far with acceptance.

## Pending parity

Original vs React side-by-side 37-theme screenshot capture still requires LEGACY_SOURCE_READ_TOKEN for the private pinned source. Recycle Bin layout, search-view refinements, all source file meta/restore semantics and per-theme pixel equivalence are not claimed complete. Keep PR #1 draft, original reference and windows-os/main unchanged; no release.
# Source Computer search index and progress

Source revision: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

## Pinned behavior

- `src/modules/chunks/shared~bin~bsod~camera~computer~find~games~notepad~paint~player~recorder~search-companion~search-dia~fc0c0d68.js` webpack module `2e2c.b` caches a `Map<folderUri, Promise<listing>>`; `getList()` calls original file store list once and suppresses errors to `[]`. Cached listings are filtered by `item.name !== 5401.g`, where source `5401.g` is `.meta`, plus source-specified skip callback.
- The source index's `walk(roots, progress, subfolders)` starts with `completed=0`, `estimated=roots.length`. Each scanned folder adds 1 to completed; every discovered subdirectory adds 1 to estimated only if recursive. The progress callback receives `completed/estimated` until the complete walk reaches 1. The source batches each breadth-first layer with `Promise.all`.
- Original `invalidate(changedPaths)` evicts any cached key matching a changed path or its descendant, not the whole index. `computer.js` invokes `searchIndex.invalidate` on filesystem-change notification and refreshes active search results when cached data was affected. `clear()` drops all cached listings.

## Modular React migration

- `packages/filesystem/src/sourceSearchIndex.ts`: per-window `SourceSearchIndex`, with promise-backed cache, source `.meta` exclusion, unreadable-folder fallback, array-copy return, explicit `invalidate()/clear()/dispose()`, and a `VirtualFileStore.subscribe` bridge. Our Guest store emits individual changed *file paths*, so the bridge invalidates containing parent listings and old/new parents and descendant caches on rename/move/trash/restore. Unrelated disks remain cached; listeners fire only on an affected cached listing.
- `packages/filesystem/src/search.ts`: preserves the existing direct uncached search API but now optionally emits `progress.fraction` for source-style scanned/discovered folder ratio. Existing foldersScanned/filesScanned/matches remain unchanged, and VFS root validation still protects search scopes. Source rank/order and mounted disk roots from prior checkpoints are preserved.
- `packages/apps/explorer/src/ExplorerApp.tsx`: each Computer window creates one `SourceSearchIndex`, uses it for searches, subscribes to relevant invalidations to reissue active searches, shows `<progress>` only while scanning, and disposes cache/subscriptions on window close. Original standalone Find and Search Companion/Dialog still use existing query routing, now with cached Guest listings.
- Direct API `searchFiles(fileStore,...)` remains uncached, preserving tests and other consumers.

## Tests / pending verification

- `packages/filesystem/src/sourceSearchIndex.test.ts`: eight new unit tests covering reuse, `.meta` exclusion, parent/descendant invalidation after create/overwrite/delete/move, untouched unrelated path, dispose, concurrent in-flight lookup deduplication, missing-folder fallback, trash/restore, multi-root fractional progress, exclusions and cancellation contract.
- `tests/e2e/search-index-refresh.spec.ts`: desktop/mobile regression for active Search refreshing after a real Guest folder is created, plus source Find result-window lifecycle/progress control cleanup.
- **Verification pending one deliberate [run-ci] commit.** Previous [CI 43366050095](https://github.com/codersachin99/windows-os/actions/runs/43366050095) passed 228 unit/224 Chromium browser tests before these changes.

## Explicit remaining differences

- Original index performs `Promise.all` per breadth-first folder layer; port currently awaits each folder in queue order (the same order of folders, but not identical concurrency). Source store notification payload differs, so the bridge has stronger parent-directory invalidation to keep Guest search results correct. Long-running searches update the control's progress; final Search UI screenshot/pixel parity has not yet been measured.
- In-memory cache is isolated to a Computer window and never persisted or exposed to host filesystem. Search content indexing, screenshot/alternate-theme fidelity and many legacy applications are still separate workstreams. PR #1 draft; main unchanged, no release.

## Source-consistent descendant invalidation regression

The first CI attempt [43369157632](https://github.com/codersachin99/windows-os/actions/runs/43369157632) compiled, but two new tests assumed that a changed parent would preserve cached descendants and that VFS alphabetic directory traversal would end at a specific child. Pinned `2e2c.b.invalidate` intentionally evicts a changed directory **and every descendant cached key**; `VirtualFileStore.list` orders folders by name. Keep that source behavior and assert those reloads and path membership rather than a fabricated targeted one-directory invalidation or a fixed final directory order.

# Mounted Guest disk search — source parity checkpoint

Legacy source revision: `legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

## Original behavior

- Original `src/modules/apps/computer.js` `listSearch` parses the `shell:search` query with `2e2c.d`. It obtains `this.disks || getStats()`, computes `roots = in ? [in] : disks.map(d => d.path)` and calls `this.searchIndex.walk(roots, progress, subfolders)`.
- Shared webpack `2e2c.b` seeds the walk with those **actual disk paths**; it never inserts the Computer container as an additional search root. With no disks, no directories are walked. Subfolder=false restricts the walk to each selected disk's immediate children.
- `5401.k` provides the original `shell:search` path prefix; `2e2c.f/d` preserve `in=` as blank when Computer is selected.

## Implementation

- `packages/filesystem/src/sourceSearchLocations.ts` exports `sourceMountedSearchRoots(volume)` that uses exclusively `LegacyVolumeSession.pathConfig.drives` already validated against provided runtime mount metadata. No guessed drive, host disk, or fallback to Computer root.
- `searchFiles` accepts optional `rootScopes` while keeping the existing explicit `scope` API unchanged. It normalizes/deduplicates roots, rejects overlapping roots and missing/non-directory mounts, then scans each root using shared trash exclusion, cancellation, progress, pattern/metadata filtering and cross-drive relevance ranking before capping results. `rootScopes: []` produces empty results.
- `ExplorerApp.runSearch` supplies mounted roots only when the actual source Find URI has blank `in=` or a classic Search Dialog/Companion query explicitly selects Computer. An explicit `in=/folder` remains a single-folder search. Blank classic search scope no longer tries to navigate Explorer to the invalid empty path.
- All paths remain confined to the Guest `VirtualFileStore`; no native host directory read is introduced.

## Regression coverage

- `packages/filesystem/src/sourceDiskSearch.test.ts`: two mounted drives; exclusion of unlisted Computer shell nodes; shallow `sub=0`; explicit scoped folder; no mounts; stale drive removed from runtime metadata; missing or file roots and overlapping roots; cancellation; global top-N across disks.
- `tests/e2e/search-mounted-disks.spec.ts`: desktop/mobile Find Computer selection exercises real Guest System C:, excludes sibling virtual Computer node and opens a separate Computer results window.
- Verification **pending** opt-in `[run-ci]` commit. The previous source URI/type checkpoint [43364173206](https://github.com/codersachin99/windows-os/actions/runs/43364173206) is green (223 unit / 222 browser).

## Remaining

- The original source `2e2c.b` search index caches listings and tracks fractional progress across roots. React currently performs a fresh VFS scan. Source UI/screenshot pixel parity and non-search legacy programs remain unverified. Avoid treating this targeted search fidelity as project completion.
- PR #1 remains draft, `main` unchanged, no release. Only intentional `[run-ci]` commits run GitHub Actions.

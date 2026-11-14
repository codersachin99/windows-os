# Original Win7 Recycle Bin instant search source trace

Pinned source: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

## Why Bin has the Computer search field

- `src/modules/apps/bin.js` renders `<computer id="bin" hoistedPath={trashPath} />`; it does not define a separate search toolbar.
- `src/modules/apps/computer.js` renders `window-addressbar-search` with the `instant` attribute whenever `classicSearch` is false. There is no `id === "bin"` exclusion in this template.
- The Computer's `searchLocation` comes from its current location breadcrumb; source `getLocation` replaces the trash path with a Recycle Bin breadcrumb. The Win7 search placeholder is therefore `Search Recycle Bin`.
- `computer.js#search(e)` calls `delayedSearch.type(e)` and its webpack module `1902` sets the default delay to **300 ms**. Previous React approximation was 250 ms.
- `openSearch("")` exits a virtual search route and returns to the scope; the React port clears results and restores the mounted trash folder without making an untrusted host path.

## Bounded React parity change

Code: `193177650b69b3004728f92cee684e9070cf5b11`.

- `packages/apps/explorer/src/searchStyle.ts` includes Bin in Win7 instant search and exports the source-derived delay constant.
- `packages/apps/explorer/src/ExplorerApp.tsx` renders search result address breadcrumbs in Bin as in Computer, retains a mounted Recycle Bin scope, and omits the additional manual Find/Clear-results buttons.
- The shared Guest VFS search service is constrained to the mounted Recycle Bin for Bin queries; normal Computer searches still skip the trash path. Existing confirmation-backed Delete, Restore, and Empty operations are unchanged.
- `packages/apps/explorer/src/searchStyle.test.ts` checks source dispatch for both Computer and Bin and the delay constant.
- `tests/e2e/bin-instant-search.spec.ts` covers a real trashed directory, source placeholder, matching/nonmatching results, breadcrumb, clearing, and restore.

## Limits / next work

This is a source **search-slot** inheritance checkpoint, not a claim that every legacy Bin search-index edge case, shell:search URI history transition, screenshot, or pixel is reproduced. The original source index skips `trashPath` while indexing; the React implementation deliberately retains mounted-trash search usability rather than silently returning fabricated results. Source `toolbar()` still exposes New Folder and a View popup with slider; the React presentation and source-state semantics remain to be investigated separately. Do not enable Cut/Copy/Paste/Rename in Bin without proving restore metadata safety.

Verification: [opt-in GitHub Actions run 43470482517 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43470482517), triggered by the implementation's `[run-ci]` commit: 267 Vitest unit tests (51 files), 260 desktop/mobile Chromium browser tests, TypeScript, source inventory, Contacts source audit and production Vite build all passed.

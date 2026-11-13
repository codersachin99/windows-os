# Pinned Win7 addressbar search-progress parity

Legacy baseline: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

## Source evidence

- `src/modules/apps/computer.js` constructs `window-addressbar` with `progress: e.searchProgress` alongside `location: e.location`. The `listSearch` method sets `searchProgress=0` before starting the search index walk, updates it with fractional `c / discoveredDirectories`, and sets `searchProgress=null` in `finally`. This progress belongs to the **address bar**, not Computer's toolbar or search-option row.
- `src/modules/themes/theme-win7-scss.js` defines `.win7 .window__addressbar-location-wrapper` as **25px high**, with white translucent background, dark border and inner white highlight. It defines `.win7 .window__addressbar-progress` with the exact gradient `linear-gradient(to bottom, #e6fbe8, #bbf9ca 30%, #7ade96 30%, #89f097 100%)`.
- `src/styles/system/vue-app.css` defines the addressbar refresh/search geometry; the source also uses a decorated breadcrumb navigation with original graphical back/forward states. Those graphical states are **not** fully reproduced by the current React Explorer, which still exposes plain Back/Forward/Up navigation buttons and a read-only address field. Do not mark screenshot/pixel parity complete.

## Implementation

- `packages/apps/explorer/src/ExplorerApp.tsx` moves progress out of the extra `.explorer-search-controls` row into `.explorer-address__location-wrapper`. It passes a fractional value to `SourceAddressProgress` while searchBusy, and null when the search finishes; no progress bar persists after completion. The underlying ranking, cache invalidation, disk scopes, cancellation and search results are unchanged.
- `packages/apps/explorer/src/SourceAddressProgress.tsx` is a reusable accessible presentation component with a pure percentage-clamping helper, `role=progressbar`, 0–100 ARIA bounds, and inline width. A null value renders nothing.
- `packages/apps/explorer/src/ExplorerApp.css` reproduces the source 25px location control, translucent background, dark border, white inner highlight and exact pinned Win7 progress gradient. The progress paint stays behind the readable text, does not receive pointer events, and obeys reduced-motion preferences.
- `packages/apps/explorer/src/SourceAddressProgress.test.tsx` adds 4 focused tests for numeric percentage mapping, out-of-range handling, null disappearance and accessible server-rendered markup; `tests/e2e/search-index-refresh.spec.ts` checks that a completed Find has a visible address wrapper but no active progressbar at desktop/mobile breakpoints.

## Verification and remaining work

- **Deliberate [run-ci] verification pending** on this checkpoint. Previous [CI 43370515230 — SUCCESS](https://github.com/codersachin99/windows-os/actions/runs/43370515230): 237 unit tests / 46 files, 228 Chromium desktop/mobile browser tests.
- This is **source-based component/style parity**, not an actual screenshot diff against a running copy of legacy-win7. Existing custom search options row, breadcrumb/path rendering, original back/forward sprite states and whole-window layout need visual comparison and migration.
- Continue visual/source parity in the modular Explorer package, then original missing applications. No premature merge/release: PR #1 remains draft, `main` unchanged.

## Test discovery correction — 2026-11-13

The first opt-in run [43373230742](https://github.com/codersachin99/windows-os/actions/runs/43373230742) was **green (237 unit / 228 browser)**, but the Vitest configuration only included `**/*.test.ts`, so the four newly authored `SourceAddressProgress.test.tsx` component tests were silently excluded. The shared `vite.config.ts` test include glob is now extended to `**/*.test.{ts,tsx}` (in both packages and web app). This is a real coverage correction; the prior green run must **not** be presented as having verified those four tests. The deliberate [run-ci] checkpoint now validates their actual execution along with the 228 browser tests.

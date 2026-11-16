# Original Control Panel source registry / tile mode / task search

Pinned: [legacy-win7](https://github.com/codersachin99/legacy-win7/tree/4e63290d783009e1293433c6ccf252abba9c1187)
at revision `4e63290d783009e1293433c6ccf252abba9c1187`.

## Original source contract (not a redesign)

- `src/modules/chunks/shared~cpanel~startmenu-base~startmenu-chromeos~startmenu-kubuntu~startmenu-launchpad~startmenu-win1~75cb2e76.js`
  webpack **3097** defines the Control Panel registry and its order.
  **a97a** creates items and root breadcrumb; **a682** resolves weighted
  search names, keywords and source task redirects.
- `src/modules/apps/cpanel.js` **a259/pa** renders the root via
  `listview-main viewMode="tiles"` and heading translation key
  `adjust-settings`, whose pinned en-US value is **"Adjust your device's settings"**.
  It uses the same registry to compute search results; it does not use
  a manually curated list of six apps. `5985` supplies name/keyword
  ranking and word-start matching. Full quoted/filter parser parity is pending.
- `src/modules/system/testmode.js` **c170** controls whether source
  `target.type === "program"` IDs are present. A source program target
  is part of the registry even if its React implementation is pending.
- The 24 original IDs, in source order:

  `data, datetime, default, storage, display, action-center, backup, access,
  gadgets, keyboard, mouse, notification, personalize, power, programs,
  region, sound, speech, sync, system, taskbar, accounts, defender, update`.

  The registry includes **66 exact en-US task labels** plus keyword metadata.
  Some task items redirect to another source registry entry, notably
  Taskbar "Customize icons on the taskbar" -> Notification Area Icons.
- The pinned Win7 source images have now been imported byte-for-byte:
  21 additional icon assets (including backup, action-center-headline,
  notification, system and power) plus three earlier imports
  (display, programs and accounts) cover all 24 source tile keys.
  The "personalize" registry key maps to the source "personal" artwork.
  Original filenames are preserved under
  `apps/web/public/assets/images/`; the imported Git blobs were checked
  against original source SHA values.

## React migration

- `packages/apps/cpanel/src/sourceRegistry.ts` is the portable typed
  registry with 24 entries, their 66 tasks, category/target/icon metadata,
  and source-backed heading labels. The original weighted search now lives
  in reusable `packages/engine/src/sourceSearch.ts`, preserving pinned
  webpack 5985 normalization, quoted phrases, `name:value` and
  `name:"quoted value"` filters, Unicode/CJK word starts, and relevance
  scores (10/1 weights, +1000 exact, +100 prefix, +5 ordered words).
  Control Panel filters are parsed and retained, but source a682 does not
  use them to filter item results; a filter-only search therefore shows
  root tiles instead of a fabricated "No items" state.
- The original 1902 helper in the same pinned shared webpack chunk defines
  a **300 ms** debounce for nonempty search text. React now uses the reusable
  `sourceCreateDelayedSearch` engine helper and preserves immediate empty
  input updates, pending-query cancellation, forced `now()` behavior and
  unmount cleanup. A dedicated Vitest suite tests the helper with fake
  timers. In the original `src/modules/shell/win7-ui.js`,
  `WinuiSearchbox instant` emits the input event immediately, but the
  `a259` `search(t)` handler dispatches it to `1902.type(t)`;
  consequently the input remains directly responsive while results wait
  for exactly 300 ms. The `a259.openLocation` method does **not** clear
  `searchText` or `searchedText`, so Back from a matching panel
  returns to the same search results until the input is explicitly emptied.
  This was confirmed in pinned source and is now covered by browser tests.
- `ControlPanelApp.tsx` renders **all 24** tiles in original source order.
  A root item is enabled only for the six genuinely implemented panel
  destinations: Display, Programs and Features, Guest User Accounts,
  Notification Area Icons, Action Center and Backup and Restore.
  Source setting/program targets stay visible but disabled; no host settings
  or program execution is fabricated. Search shows original task labels;
  a task redirect to one of those six real pages is functional.
- Control Panel's history bar now uses
  `packages/ui/src/SourceWin7HistoryNav.tsx`, a reusable source-backed
  control shared with File Explorer. Its sprite CSS was moved byte-for-byte
  from the already pinned Explorer Win7 address bar to
  `packages/ui/src/sourceWin7HistoryNav.css`. The exact embedded original
  WebP background and 27x108 arrow sprite retain normal, hover (-27px),
  pressed (-54px), disabled (-81px) and mirrored Forward states.
  Both applications keep their own history state, accessible roles and
  previous browser-test markers; there are no substitute text arrows on
  the Win7 Control Panel surface. New shared unit and desktop/mobile
  Control Panel browser regressions are committed but await an acceptance
  CI checkpoint.
- `packages/assets/src/index.ts` exposes `legacyCpanelTileArtwork`
  with source-locked artwork for every entry. Existing source image
  bytes are reused, not synthesized icons.
- `sourceRegistry.test.ts` checks original order, target metadata,
  task redirects, icon coverage, keyword/search, filter and phrase behavior.
  `packages/engine/src/sourceSearch.test.ts` tests the original generic
  parser and weights independently. Browser tests cover all 24 root tiles,
  disabled unsupported targets, source artwork, taskbar-to-notification
  navigation, quoted phrases, filter-only root and mobile/desktop layouts.

**Scope/acceptance:** registry and asset import implemented, but do not mark
Control Panel visually/source-parity accepted until a successful opted-in
test run and fixed original/React screenshot comparison. Remaining gaps:
exact source CSS/listview tile geometry, source search host-filter consumers, translated locales beyond pinned en-US, program/setting host adapters,
theme-specific asset maps, and full screenshot comparison. PR stays draft.

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
  source-backed heading labels and word-start search ranking.
- `ControlPanelApp.tsx` renders **all 24** tiles in original source order.
  A root item is enabled only for the six genuinely implemented panel
  destinations: Display, Programs and Features, Guest User Accounts,
  Notification Area Icons, Action Center and Backup and Restore.
  Source setting/program targets stay visible but disabled; no host settings
  or program execution is fabricated. Search shows original task labels;
  a task redirect to one of those six real pages is functional.
- `packages/assets/src/index.ts` exposes `legacyCpanelTileArtwork`
  with source-locked artwork for every entry. Existing source image
  bytes are reused, not synthesized icons.
- `sourceRegistry.test.ts` checks original order, target metadata,
  task redirects, icon coverage and keyword/search behavior. Browser tests
  cover all 24 root tiles, disabled unsupported targets, source artwork,
  taskbar-to-notification navigation and mobile/desktop layouts.

**Scope/acceptance:** registry and asset import implemented, but do not mark
Control Panel visually/source-parity accepted until a successful opted-in
test run and fixed original/React screenshot comparison. Remaining gaps:
exact source CSS/listview tile geometry, original complete search grammar and
timing, translated locales beyond pinned en-US, program/setting host adapters,
theme-specific asset maps, and full screenshot comparison. PR stays draft.

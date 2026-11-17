# Source Personalization / Desktop Background — 17 November 2026

## Immutable original checkpoint

Reference: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

- `src/modules/system/personalize.js` has distinct ChangeTheme and
  ChangeBackground views. The latter reads `assetStore.bgs`, displays
  a `data-test-bg-list="system"` thumbnail gallery, and stages selection
  through `selectBackground(t)` (does **not** apply immediately).
- The original Save button (`data-test-button="save"`) saves a background
  via `ae["a"].save(selectedBg, user)`, commits Background, and navigates
  back. The Cancel button (`data-test-button="cancel"`) navigates back
  without committing. This is separate from ChangeTheme, whose `save`
  also changes the theme's matching default wallpaper.
- Original gallery also supports uploaded images, animated items and
  video backgrounds; external APIs and ads govern some options. Those
  are **not** present in this first system-only React slice.

## Implemented React slice

- `packages/assets/src/index.ts`: seven source-imported system
  wallpapers only: five original Windows 7 variants plus imported XP/11
  backgrounds. No generated artwork and no invented remote URLs.
- `packages/apps/personalize/src/PersonalizeApp.tsx`: separate
  background view, source `data-test-bg-list="system"`, selected item
  state, Save and Cancel, responsive thumbnail layout.
- `packages/engine/src/index.ts`: validated source image path and active
  Guest theme stored at `windows-os:guest:wallpaper:v1`. Corrupt storage,
  unknown URLs and mismatched themes fall back to the theme wallpaper.
- `apps/web/src/App.tsx`: persists a supported system selection;
  changing theme deletes its previous wallpaper override. In-memory
  behavior survives restricted local-storage access. Unknown URLs are
  ignored by the shared dispatch.
- `packages/ui/src/DesktopShell.tsx`: both standard and special
  window layers forward active wallpaper and Save to the shared
  desktop reducer. Neither path writes to the host OS filesystem.

## Tests and limits

- Unit checks assert exact original image paths, reject unrecognized URLs,
  validate saved-background shape/active theme, and confirm theme reset.
- `tests/e2e/source-personalize-background.spec.ts` covers source
  system gallery count and artwork, Cancel without a desktop mutation,
  Save, Guest browser reload, and theme replacement on desktop/mobile.
  Explicit opt-in CI through `[run-ci]` is required before acceptance.
- The original system assetStore may contain additional images that
  have not been imported. Uploaded image/video and animated previews,
  background positioning, Theme Studio, sound, cursors, appearance,
  side pane and pixel-perfect original viewport screenshot pairing remain
  outstanding. This implementation is **not complete Personalization
  or full original visual parity**.

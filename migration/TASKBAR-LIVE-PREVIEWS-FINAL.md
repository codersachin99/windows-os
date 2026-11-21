# Final legacy-win7 taskbar grouping and live window previews

Canonical source: `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
Previous `4e63290d` behavior is historical; this feature was added in the
40-commit delta pin.

## Exact source trace

- `app.config.json` `features.showStackedIcons=true` and
  `features.showPeekPreviews=true` (independent of
  `taskbar.useAeroPeek=false`, the separate **Show desktop** control).
- `src/modules/shell/taskbar-base.js` `loadItems` groups running
  instance IDs under their base program key when stacking is enabled,
  keeps pinned programs in order, and exposes `isStacked` when multiple
  windows belong to one group. `getWindowInstances` returns every live
  instance of that program.
- `toggle` minimizes every group window if the currently focused
  visible window belongs to the group; otherwise it restores its
  windows. A single-instance button continues to toggle.
- `handleItemMouseEnter` ignores touch-only hover devices; with an
  opened instance and hover previews enabled, starts a **200 ms**
  popup delay. `handleItemMouseLeave` cancels pending popup and
  schedules a **450 ms** dismissal so the pointer can reach the
  thumbnail strip.
- Source preview strip uses **220 px** cards, **8 px** gap, centered
  on the taskbar button with **10 px** viewport safety margin.
  Each card shows the instance title and icon, a close control, and a
  **206×125 px** window snapshot. `mountLivePreview` uses
  `cloneNode(true)` of the mounted window DOM, scales it to
  **min(206/windowWidth,125/windowHeight,0.35)** and centers it.
- Hovering an individual thumbnail highlights/peeks the matching
  window; clicking it restores/focuses that instance; clicking its
  close control closes only that instance. These are different from
  the original **Show desktop** Aero Peek action.

## React migration

- `packages/ui/src/sourceTaskbarGroups.ts`: source-feature defaults,
  pure grouping by stable React `DesktopWindow.appId` (React IDs are
  `computer-1`, not the original `computer__1`), 200/450 ms timing,
  original 220×8 geometry, responsive viewport clamping. The caller
  retains the existing pinned item order and window IDs.
- `packages/ui/src/DesktopShell.tsx`: pinned and unpinned running
  applications share the grouping, stacked marker, and taskbar
  activate/minimize behavior. Pointer-hover schedules the preview;
  leaving the popup cancels after 450 ms. The display target is a
  *specific mounted Guest window*, not the whole desktop. Closing
  calls the existing per-window close hook, preserving unsaved
  document confirmation rules when applicable.
- `packages/ui/src/SourceTaskbarLivePreview.tsx`: inert scaled DOM
  snapshots; no duplicate app instance, no second React render tree,
  no host API access. To avoid causing untrusted iframe reloads,
  the copy replaces iframe/video/audio/script/object/embed nodes
  with neutral placeholder elements before insertion, removes
  duplicate DOM IDs and input names, and blocks pointer input.
- `packages/ui/src/sourceTaskbarLivePreview.css`: source dimensions,
  window peek isolation and overflow-safe card strip. The cloned
  window is excluded from the CSS that hides unrelated original
  windows during peek.
- Unit test `sourceTaskbarGroups.test.ts`, desktop/mobile Chromium
  tests `source-taskbar-live-preview-final.spec.ts`, and opt-in
  focused acceptance gate in `.github/workflows/react-checks.yml`.

## Explicit remaining gaps

- CSS is an original-behavior **adapter**, not pixel-perfect source
  evidence: measure against captured source screenshot colors,
  margins, arrows, stacked indicator and animated entrances for
  Win7, XP and Win11 themes.
- React Sticky Notes is implemented as a separate floating panel and
  therefore uses the safe title fallback, not a DOM-cloned preview.
  Windows with active iframe/video content also use a neutral
  placeholder for the live media surface, not a duplicate external
  network connection.
- App-config editor support for toggling `showStackedIcons` and
  `showPeekPreviews` after startup is not yet ported. The source
  default-on flags are pinned; the pure grouping model supports
  disabled stacking for future configuration.
- The original source also has theme-specific taskbar popup alignment
  and context menu handling. Window-group close semantics, screen
  reader semantics and source screenshots are not yet fully verified.
- Source dual-panel hover-card thumbnail animation is not yet
  continuously refreshed after mount; `cloneNode` matches the
  source snapshot-at-hover behavior.

## Validation

Check the exact-head `[run-ci]` run for TypeScript, Vitest, source
inventory, byte-exact assets, Vite, focused Playwright and complete
desktop/mobile Chromium. The earlier new-baseline
[CI #44243971212](https://github.com/codersachin99/windows-os/actions/runs/44243971212)
passed the focused tests but was **cancelled at its 25-minute job
timeout** while running the full browser suite. Its result is not an
overall green acceptance. New builds extend the job timeout only for
deliberate `[run-ci]` runs. The branch remains draft PR #1.

# System Properties → Performance Options (source-faithful React migration in progress)

Checkpoint: 18 November 2026. Pinned original:
`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

## Source evidence

`src/modules/shell/system.js` original `System` program (Webpack 508f),
and nested `SystemPerformance` component, use:
- `System Properties` window `w=500,h=500,resizable=false`, Advanced tab;
- Advanced → Performance → `Settings...` opens independent
  `Performance Options` child, `w=420,h=500,resizable=false`;
- Performance Options tabs: Visual Effects, Advanced, Data Execution
  Prevention; the first page has source radio values
  `auto | appearance | performance | custom`;
- Visual-effects checkboxes dispatch `handleOptionChange`, which switches
  the preset to `custom`; source `Apply` saves but stays open,
  `OK` saves and closes, `Cancel` closes without saving;
- Source effect state/presets originate in Vuex module `554d`. Original
  theme CSS also expects `data-effect-enable-glass` and
  `data-effect-show-window-shadows` on its shell parent.

The original `Control Panel` registry (`src/modules/apps/cpanel.js`,
Webpack 3097) marks System as a **program**, not a Control Panel history
page, and original program manifest c170 includes hidden `system`
with `sysdm.cpl` executable alias.

## Implemented now

- `packages/apps/cpanel/src/SystemPropertiesApp.tsx` and matching CSS:
  System Properties with all five navigable source tabs (Computer
  Name, Hardware, Advanced, System Protection and Remote), plus the
  source-named Performance Options child modal; tab/radio/checkbox
  structure. Read-only Computer Name uses a clearly Guest-scoped
  display name, while source Hardware, Protection and Remote instructions
  and controls are visible but host-changing operations stay disabled. Fixed 500×500 parent and
  420×500 child source geometries (responsive viewport clamping).
  The nested dialog implements source `Apply`, `OK`, `Cancel`
  dirty-state semantics. Only original `enableGlass` and
  `showWindowShadows` are editable. Original host CPU, processor
  scheduling, virtual memory and DEP changes stay visibly disabled;
  no fabricated host capability or system telemetry.
- `packages/apps/cpanel/src/sourceVisualEffects.ts` models the four
  original preset names, two migrated visual effects, strict Guest
  `localStorage` validation, and safe denied-storage behavior.
  Auto/Appearance enable both visual effects; Performance disables
  both; Custom retains the current selection. **These are a first
  subset/preset mapping, not the complete Vuex preset inventory.**
- `packages/sdk/src/index.ts` registers the real `system` window.
  `sourceRegistry.ts` enables the original System program target
  only because the React adapter actually exists. It opens its
  own Guest window from Control Panel, not a fabricated root page.
- `apps/web/src/App.tsx` loads Guest visual effects when starting
  and saves committed changes to a dedicated versioned preference
  key. `DesktopShell` renders the two source
  `data-effect-...` attributes depending on those settings, thus
  driving the already migrated original Aero CSS gates.
- `sourceVisualEffects.test.ts`: presets, custom selection,
  persistent strict read/write, corrupted/denied storage.
  `tests/e2e/source-system-performance.spec.ts`:
  Control Panel launch, nested Performance Options,
  Cancel discard, Apply/OK persistence, on/off frame attributes
  and browser reload. Unsupported host features are visibly
  disabled. Included in the opt-in focused shell CI gate.

## Explicitly not migrated

The full Vuex `554d` effects inventory, automatic hardware-based
preset determination, host-specific CPU/memory and System Properties
operations, source System tab illustration artwork, and source Win7/XP/11 screenshot-paired rendering,
host DEP or scheduling, and original preference storage service
remain pending. Do not infer that a browser can modify a host OS.

The modal is a bounded React adaptation in the System Properties
window rather than a distinct Guest-window entry, preserving
independent Save/Cancel behavior while reducing risk of synthetic
extra global windows. Full source window stacking is deferred.

No main merge or release until all required source parity is proven;
PR #1 remains draft.

## 18 November 2026: navigable original System Properties tabs

Pinned source `src/modules/shell/system.js` module `508f` exposes the
five-tab `winui-tabs` screen, defaulting to Advanced. The initial React
milestone rendered four of these tabs as disabled controls. Commit
`f538611` enables all five while preserving source tab order and original
English labels/instructions from pinned `assets/locales/en-US.json`.
The Guest-only Computer Name page displays a simulation label rather
than probing the user's hardware, Hardware and Remote remain read-only,
and System Protection intentionally has **no invented device drives**.
Advanced retains the working Performance Options child.

`52f057f` adds scoped content rows, section separators and protection
list geometry. `f91a3c5` adds Playwright desktop/mobile navigation and
explicitly disabled host-operation regressions to the existing
`source-system-performance.spec.ts`. Browser source-paired pixel proof,
original per-tab icon artwork, and host-backed actions are **not**
claimed complete. CI is requested on the follow-up `[run-ci]` handoff
commit; validation must be attributed to its exact SHA.

# Windows 7 taskbar Aero Peek — source-backed first slice

Pinned source: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.
Checkpoint: 18 November 2026. The React destination is the draft
`feat/0001-faithful-react-foundation` branch; no main-branch parity claim.

## Original evidence

- `src/modules/shell/taskbar-base.js` has a Show Desktop entry with
  `click: showDesktop` dispatching `MinimizeAll`. The visual taskbar
  button receives `mouseover → handleAeroPeek(true)`,
  `mouseout → handleAeroPeek(false)`, and a
  `longpress → peekByHold()` pointer release reset.
- Its namespaced `taskbar` store defaults to `useAeroPeek: false`,
  `isAeroPeeking: false`. The `SetIsAeroPeeking` mutation gates the
  preview on the saved `useAeroPeek` preference, while
  `UpdateConfigs` persists `useAeroPeek` with other taskbar options.
- `src/modules/shell/taskbar.js` exposes `taskbarDraft.useAeroPeek`
  in Taskbar Properties. Its checkbox is only editable when original
  `canAeroPeek` theme-capability check succeeds. Its Save method
  commits taskbar preferences and updates original
  `effects.enableAeroPeek`.
- `src/modules/themes/theme-win7-scss.js` renders
  `.window__main.is-aero-peeking`: `pointer-events:none`,
  `backdrop-filter:none`, fade non-background children to
  `opacity:0` with `.3s` transition, and keep a transparent
  gradient frame (including reversed RTL highlights).
- Pinned `assets/locales/en-US.json` supplies:
  `Preview desktop with Aero Peek`,
  `Temporarily view the desktop when you move your mouse to the Show desktop button at the end of the taskbar.`,
  and `Use Aero Peek to preview the desktop`.

## Migrated React subset

- `packages/sdk/src/sourceTaskbarPreferences.ts` extends the existing
  Guest `windows-os:guest:taskbar-preferences:v1` record with a strictly
  validated `useAeroPeek:boolean` field, default `false`. Existing
  pre-migration records containing only `type` load unchanged with
  Aero Peek disabled. A read or write failure preserves the current
  private Guest session without modifying the real host.
- `packages/apps/taskbar-settings/src/TaskbarSettingsApp.tsx`
  exposes the source-labeled checkbox for the migrated Win7 theme,
  committed through the existing taskbar Apply/OK/Cancel workflow.
  XP/Win11 are disabled pending verified theme-specific preview
  rendering, rather than inventing cross-theme support.
- `packages/ui/src/DesktopShell.tsx` subscribes to committed
  preferences and distinguishes pointer hover preview from the
  existing explicit click-to-minimize operation. Touch press and
  release are also supported. Preview never dispatches minimize,
  close, focus, move or resize events.
- `packages/ui/src/sourceWindowChrome.css` adapts the Win7 source
  peek frame for the React `WindowFrame`, retaining the mounted
  windows and their positions, hiding frame children visually while
  hovering, disabling window pointer events, and restoring them
  after hover. The source WindowMain has a separate
  `.window__background` pseudo-texture that this React frame
  does not yet reproduce exactly.
- Unit tests verify default-off behavior, old records, strict
  boolean validation, storage denial, persistence and notifications.
  `tests/e2e/source-taskbar-settings.spec.ts` covers
  Cancel/Apply, preview/no-minimize, click minimize, reload and the
  guarded Win11 control on both desktop and mobile Chromium.

## Remaining differences

The exact `AeroPeek.test(theme)` feature matrix for all original
themes remains to be isolated before enabling WinXP/Win11. Other
original VFX controls (including `enableAeroPeek` in the general
Visual Effects Vuex inventory), the full original Win7
`window__background` preview texture, and source-paired screenshot
pixel comparison are not included. These are not assumed complete.

## Verification

Only the `[run-ci]` exact-head workflow can be cited for acceptance:
TypeScript, Vitest, source/artwork audits, Vite build, focused Playwright,
and full desktop/mobile Chromium tests must be checked separately.
Older green runs do not cover this change. Keep PR #1 draft; no release.

# Final legacy-win7 source lock and reconciliation

**Immutable source of truth**: `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.

Previous source checkpoint: `4e63290d783009e1293433c6ccf252abba9c1187`.
Exact GitHub comparison: [40 commits](https://github.com/codersachin99/legacy-win7/compare/4e63290d783009e1293433c6ccf252abba9c1187...26b9f0ce7a1665dee89a7c81824bec09e2c75776).
The reproducible machine-readable 40-commit/215-path changelog is
[`final-upstream-delta.json`](final-upstream-delta.json). All 3,414 source
blobs, including 291 `src/modules/` blobs, are recorded by immutable
Git blob SHA and byte size in [`legacy-files.tsv`](legacy-files.tsv).
[`module-tracker.json`](module-tracker.json) includes the newly added
`src/modules/system/close-effects.js`; all 76 previously tracked
modules whose source blobs changed have new SHA entries. Modules
previously called `implemented` or `verified` that changed were moved
back to `in-progress` pending acceptance of the new source behavior.

**Lock means pin a commit in the migration**, not restrict pushes to
`legacy-win7/main`, freeze a live working branch, or copy Vue bundle
files into the modular React application. Historical documents citing
`4e63290d` remain historical artifacts; do not interpret them as
the active source checkpoint. `audit-legacy.mjs`,
`import-source-theme-assets.py`, `capture-visual-parity.mjs` and
the opted-in visual CI checkout now point to the new SHA.

## Upstream delta by feature family

| Final source changes (40 commits) | React reconciliation | Remaining parity |
| --- | --- | --- |
| Desktop menu: Sort by Name/Size/Type/Modified and Ascending/Descending; reflow icon x/y | `sourceDesktopSort.ts`, `DesktopPositionStore.arrange`, Desktop background menu + unit/browser tests | Multi-key sort and drag/auto-arrange combinations still need paired visual acceptance |
| `showMenuCopyPath=false`, `showUploadFiles=true`; locale changes to Copy Path / Upload Files | Shared SDK flags; Desktop and Explorer hide Copy Path, show Upload Files, retain safe Guest import | Runtime configuration editing is not ported; hidden Copy Path engine remains for future opt-in |
| `showMapDirectory=true`, `showNetworkMap=true`; mapped folders, disconnect and Computer Network pane | Map Directory appears disabled in Desktop/Explorer instead of inventing host access | Permissioned directory picker, scoped persistence, mapped-root VFS, network pane and Disconnect action **not implemented** |
| `allowMultipleWindows=true`, default `maxWindowsPerApp=3`, registry/shortcut per-app overrides; singleton alias fixes | Engine supports default cap, optional per-app unlimited/singleton policy, frontmost focus and Guest `SourceMessageDialog` error; unit/browser tests | Alias-based identity and full source override precedence remain pending |
| Taskbar `showStackedIcons=true`, `showPeekPreviews=true`; grouped multiple windows and live window hover previews | New grouped running buttons, source 200/450 ms hover timing, cloned inert window thumbnails, per-window activate/close and temporary peek migrated; old Win7 **Show desktop** Aero Peek remains separate. Single-window accessible title now tracks unsaved document updates | Source theme screenshot/pixel matching, full keyboard and taskbar menu grouping details, and media-host thumbnail fidelity remain unverified; do not conflate with Show desktop Aero Peek |
| Webapp fullscreen vs maximized, frameless/headerless, caption visibility, safe iframe drag/resize, `checkOnlineStatus` | Existing basic webapp/frame and window maximization are preserved | Source config semantics and iframe capture fixes require dedicated migration and regression tests |
| Computer/Explorer item checkbox default `false`; touch selection change | Shared final source SDK flag now disables touch checkboxes in Computer/Bin listview by default while leaving regular selected-row and Ctrl+click behavior; desktop/mobile Playwright coverage updated | Runtime feature-flag toggling (optional future source config UI) and all-theme paired visual acceptance still pending |
| `src/config/app.registry.json`, `app.shortcut.json`, `desktop.shortcut.json`, `storage.folder.json`, `icons.registry.json`, `sounds.registry.json` | Added the locked source's 13 alias-bearing app entries, with safe alias resolution for migrated apps only; `sticky.allowMultipleWindows=false` is explicit; collision and non-ported-app tests added. Immutable source files remain in inventory and delta | Remaining source registry metadata, non-ported apps, special Computer folder aliases, install/shortcut/icon/sound definitions need validated declarative contracts |
| Full theme catalog and boot/logon screen mapping, Win31 selectors and distinct UI personalities | Exact 36-entry/19-family source catalog plus canonical `win7`; routed source screens and original-family Guest logon adapters for **Win7, Win31/95/98/2000, XP, Win8/8.1, Win10 and Win11** (9 of 19 screen families), with byte-identical original XP/2000 logo, Win8 avatar, Win10 background and Win11 avatar. The original Guest lifecycle and source theme IDs survive | The **10 remaining** original logon screen families still use explicitly labelled Win7 fallback; all family-specific boot animations, original login account backend, complete desktop/Start/taskbar/Explorer skins, screenshots and variant themes remain pending; no theme claimed pixel-perfect |
| Hardware power/disconnect overlays and in-place BIOS reboot; `defaults.skipBoot=true` and `nativeCursor=true` | Source startup defaults now match: `skipBoot=true` enters **unauthenticated Logon**, browser-native cursor is default, and disabled skipBoot retains animated boot. Full source **theme family selection** now resolves via catalog on boot/logon/switch screens, with explicit fallback where the real renderer is not ported. Unit/browser tests cover Guest boundary | XP and Win11 Guest login layouts and original artwork are now adapted; source-paired screenshots, complete authentication/backend behavior, remaining screen families and all original boot animations, BIOS and power/disconnect overlays still pending |
| PWA service worker, manifest, runtime injected configuration, new `windows.os` URLs | No superficial service worker copied into Tauri build | Browser-ready PWA/service-worker build strategy and environment-specific URLs pending |
| Python backend moved under archive; new PHP Slim 4 `service/api/server.php` | Optional visual-source CI launcher changed from removed Python start command to pinned PHP router | Backend feature parity, dependencies and source-vs-target visual screenshot pairing remain unverified |
| New WebGL window-close effect engine/shaders, default feature flags disabled | Default disabled state recorded; no unapproved WebGL engine introduced | Should be implemented only when feature is explicitly enabled and source behavior/worker performance can be tested |
| Other fixes: Task Manager column arrows, sounds, clock/currency gadgets, window dock stacking, audio/online states | Tracked as changed source modules, no false verification | App-by-app acceptance after higher-priority desktop, menus, Start and Computer/Bin |

## Win7 Start menu recent-program reconciliation — 18 November 2026

Source `src/modules/shell/startmenu-base.js` renders
`data-test-list-recent` when not searching or showing All Programs.
The React Start menu previously omitted the section for Win7, showing it
only for XP/Win11. The Win7 Start menu now uses the existing Guest-local
`sourceRecentPrograms` history store and source-theme program artwork,
shows a bounded recent section above the compatibility launcher grid, and
hides the section during All Programs or search. The Win7 entry order,
persisted session history, click-to-launch and All Programs separation
are exercised in desktop/mobile Playwright.

This is an incremental functional migration, **not full pixel/structure
parity**: the existing compatibility launcher list remains alongside the
recent list until the pinned Win7 original Start layout, source-installed
shortcuts and search results are fully reconciled. CSS style values are
explicit interim adapters pending side-by-side source screenshots.

## Accepted priorities after rebaseline

1. Stabilize **new exact-head CI** (TypeScript, unit, fixed source inventory,
   byte-for-byte artwork, Vite build, focused desktop/menu/window tests and
   complete desktop/mobile browser tests), repairing any real regression.
2. Finish Win7/XP/11 theme frames, original taskbar/Start/icon assets,
   background/icon context submenu semantics including new sorting,
   safe mapped-directory permission boundary, and Computer/Bin behavior.
3. Port new window taskbar thumbnail groups, per-app source registry
   overrides, labels and popup stack behavior.
4. Integrate new source declarative registry/shortcuts/icons/sounds
   without replacing existing working Guest VFS or shell abstractions.
5. Verify source-paired screenshots at fixed viewports before any
   claim of pixel-perfect or complete functionality.

`main` remains untouched; draft PR #1 is not a release. Documentation,
a matching filename or a successful old CI run never constitutes proof
of feature acceptance at this new pinned source SHA.

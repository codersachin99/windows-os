# Win7 Classic Basic 2/3/4 source RTL menu bevel — 21 November 2026

**Immutable original:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `codersachin99/windows-os` `feat/0001-faithful-react-foundation`, draft PR #1. The original source and target `main` remain untouched.

## Verified frozen source rule

Pinned `src/modules/themes/theme-win7-classic-scss.js` uses the
`.win7-classic .winui-menu` classic high-contrast palette and **directional
3D bevel**. Source exact rules:

```css
[dir="ltr"] .win7-classic .winui-menu {
  box-shadow:inset -1px -1px var(--border-color,#393c39),
    inset 1px 1px var(--border-color--contrast,#fff),
    inset -2px -2px var(--text-color--disabled,#7b7b7b);
}
[dir="rtl"] .win7-classic .winui-menu {
  box-shadow:inset 1px -1px var(--border-color,#393c39),
    inset -1px 1px var(--border-color--contrast,#fff),
    inset 2px -2px var(--text-color--disabled,#7b7b7b);
}
```

In the source, `basic-2` inherits the Win7 Classic base,
`basic-3` is High Contrast Black and `basic-4` High Contrast White.
Do not group these with the Aero/Basic 1 `#f1f1f1` WinUI popup or the
Win95/98/2k menu family.

The target had already ported three source-specific palette sets and
the *LTR* 3D bevel for actual Desktop/taskbar context menus in
`packages/ui/src/sourceWin7ClassicContrast.css` and the original
RTL mirrored bevel for Computer/Bin root and child View/Send To menus in
`packages/apps/explorer/src/sourceExplorerContextTheme.css`. The
Classic **Desktop and taskbar popups still retained the LTR bevel when
the active document direction was RTL**.

## Small source-backed change

- `packages/ui/src/sourceWin7ClassicContrast.css` adds the missing
  RTL selector for exactly `basic-2`, `basic-3`, `basic-4`, mapping
  the **three original inset bevel offsets** to actual Desktop and taskbar
  context menus. The source palette, taskbar layout, hover styling, and
  all existing menu commands remain untouched. LTR CSS is unchanged.
- `tests/e2e/source-win7-classic-rtl-context-themes.spec.ts`
  adds **12 Playwright scenarios × desktop/mobile**:
  each of the three Classic theme IDs gets a genuine Desktop
  background popup tested in both LTR and RTL (source palette,
  contrast hover, first bevel offset, View radio submenu, Escape,
  icon Open); a genuine RTL taskbar background popup tested for
  Task Manager launch, surface/bevel and source accent hover; and
  separate Computer and Recycle Bin background/View-child tests
  checking the existing source classic RTL bevel and eight view modes.
  Assertions inspect computed live CSS and invoke real Guest actions,
  not compiled selectors alone.
- New file is included in the **opt-in** focused Chromium CI gate.
  No test path was removed and no extra automatic CI trigger added.

## Acceptance constraints

Previous [CI #44880039033](https://github.com/codersachin99/windows-os/actions/runs/44880039033)
on `5bd0109` **SUCCESS**: TypeScript, unit, original source/artwork/Contacts
audits, Vite production build, focused and full desktop/mobile Chromium;
paired original-versus-React visual job **skipped**. This classic
RTL change is newer than that successful SHA and therefore needs a
new exact-head `[run-ci]` before calling it verified. An individual
RTL test failure must be diagnosed/fixed; do not remove tests, invent
source behavior, or claim complete theme or shell parity. Screenshot
pairing to the frozen private source still requires approved
`LEGACY_SOURCE_READ_TOKEN`. Keep PR draft, no merge or release.

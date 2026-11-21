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

## Follow-up: source Classic disabled popup command paint

The same frozen `theme-win7-classic-scss.js` immediately after the
`.winui-menu` hover rules also styles
`[role=menuitem][aria-disabled]` with **opacity:1** and text
`var(--text-color--disabled,#7b7b7b)`. Its disabled command/button
emboss reverses horizontally:
`[dir=ltr] text-shadow:1px 1px var(--border-color--contrast,#fff)`;
`[dir=rtl] text-shadow:-1px 1px var(--border-color--contrast,#fff)`.

The React taskbar context menu already has four genuinely disabled
source actions (Toolbars/Cascade/Stack/Side), but generic
`windows7.css` uses `button:disabled { opacity:.52 }` and no
directional disabled text-shadow. That washes out source Classic
contrast themes. `sourceWin7ClassicContrast.css` now restores
source `#7b7b7b` disabled text, full opacity and direction-aware
emboss for **only** Basic2/3/4 Desktop/taskbar popup buttons, mapping
the original Vue `aria-disabled` menuitem to React native
`button:disabled`. `source-win7-classic-rtl-context-themes.spec.ts`
now checks the live disabled `toolbar` row under **both** LTR and
RTL for each of the three palettes (including its disabled state,
computed color, full opacity and exact 1px embossed horizontal offset).
The enabled Task Manager still launches in RTL. No action is falsely
enabled, and high-contrast source palettes remain independent.

These follow-up changes are newer than the initial Basic Classic
`[run-ci]` checkpoint. A **new exact-head CI** after this follow-up
must verify both the root menu beveled paint and disabled text.

## Computer and Recycle Bin disabled menu source follow-up

The source `.win7-classic .winui-menu [role=menuitem][aria-disabled]`
rule is **shared across all menu surfaces**, including the Explorer
root/item popup and its nested Send To and View/New menu controls.
The React Explorer Classic menu already used full-opacity disabled
`#7b7b7b` text, but did not apply the original *directional*
embossing. On High Contrast Black/White backgrounds this is a
source-visible difference.

- `packages/apps/explorer/src/sourceExplorerContextTheme.css` now
  gives `button:disabled` in Basic2/3/4 live Explorer menu roots
  `text-shadow:1px 1px var(--border-color--contrast)` in LTR
  and `text-shadow:-1px 1px var(--border-color--contrast)` in RTL.
  The existing `opacity:1`, text `var(--text-color--disabled)`,
  native disabled state, and root/submenu styling are retained.
  This selector also reaches the real detached child submenu buttons.
- `tests/e2e/source-classic-explorer-disabled-rtl.spec.ts` adds
  **6 scenarios × desktop/mobile** (Basic2/3/4 × LTR/RTL).
  Every scenario exercises the actual empty Bin background menu
  (disabled Empty Recycle Bin, Upload Files, Properties), Computer
  background Properties, a real file uploaded to the Guest Documents
  volume, the file-item Properties and disabled Compressed (zipped)
  folder action in Send To child. It asserts disabled state,
  `opacity=1`, color `rgb(123,123,123)`,
  **signed** computed text-shadow offset, and that the enabled
  Desktop shortcut action stays available. It never replaces disabled
  source services with fake handlers.
- New suite is in the existing opt-in focused browser CI.
  Frozen original unmodified, product main untouched. Source screenshot
  pairing still pending.

Do not call this second follow-up verified until an exact-head
`[run-ci]` including these new source tests succeeds.

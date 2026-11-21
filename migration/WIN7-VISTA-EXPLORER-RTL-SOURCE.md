# Original Win7/Vista Explorer RTL menu parity — 21 November 2026

**Reference locked:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
**Target:** `codersachin99/windows-os`, `feat/0001-faithful-react-foundation`, draft PR #1.

## Source and defect

The pinned `src/modules/themes/theme-win7-scss.js` and
`src/modules/themes/theme-winvista-scss.js` contain explicit
`[dir="rtl"] .winui-menu` overrides. The menu's drop shadow
changes from +4px to **-4px**, the vertical 2px icon/check
gutter moves from `left:calc(var(--menu-offset) + var(--menu-padding))`
to `right:calc(...)`, the gutter inset bevel reverses, and
menuitem action padding moves to the right. This source base
Win7 menu is inherited by `win7`, `aero-1`–`aero-4` and
`basic-1`; Vista shares this popup palette.

The React `sourceExplorerContextTheme.css` already painted
the *LTR* Win7/Vista source menu correctly, including real
background/item/child popups, but it did **not** provide RTL
gutter/shadow/row overrides. So selecting an RTL document
direction left the menu painted like LTR despite original
WinUI explicitly mirroring it. The React Desktop/Start menu
already had matching source RTL rules; the discrepancy was
specific to Explorer and Recycle Bin.

## Bounded change

- `packages/apps/explorer/src/sourceExplorerContextTheme.css`
  adds RTL-only, source-ID-scoped menu rules for Win7,
  Vista, Aero1–4 and Basic1: -4px shadow and unchanged
  2px `#f5f5f5` bevel; `::before` gutter moved from
  `left:27px` to `right:27px` with reversed inset
  shadow; direct and nested menu command row
  `padding-right:34px`, `padding-left:10px` and
  `text-align:right`. Existing LTR rules, menu order
  and backing file actions are unchanged. No host-native
  menu, machine filesystem access, or invented theme.
- New `tests/e2e/source-win7-vista-explorer-rtl.spec.ts`
  contains **9 real Chromium browser scenarios × desktop/mobile**:
  eight `(win7,aero-2,basic-1,winvista) × (Computer,Bin)`
  cases selecting the pinned source theme, logging into
  the Guest desktop, switching actual root `html dir=rtl`,
  right-clicking the Explorer background, inspecting
  painted computed root AND detached View submenu:
  source surface/border, -4px directional shadow,
  gutter width and right offset, row padding and
  alignment, live View radio items and Escape focus
  return. A ninth Win7 case toggles the same Explorer
  from RTL back to LTR and asserts gutter returns to
  `left:27px` and +4px drop shadow. Tests drive
  real menus and Guest desktop, not source/CSS-text mocks.
  The spec is in the opt-in focused GitHub Actions gate.
- This **does not** mark complete RTL support across
  every source theme or the whole desktop platform.

## Acceptance

At the time of this commit, previous
[taskbar keyboard CI #44877278653](https://github.com/codersachin99/windows-os/actions/runs/44877278653)
at `0b5fd0f` was still running the source shell
targeted Chromium gate. It does not include this new RTL
source change.

A fresh exact-head `[run-ci]` is required to verify
typechecking, source/theme artwork audits, unit and
desktop/mobile Chromium focused + full browser regressions
after applying these RTL rules. Source-vs-React paired
pixel screenshots remain separately blocked pending
approved read-only frozen private source access
(`LEGACY_SOURCE_READ_TOKEN`) and scene comparisons.
No main merge or versioned release is authorized.

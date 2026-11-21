# Original window appearance effects / RTL frame contract

Checkpoint: 18 November 2026.
Pinned reference: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

## Source evidence

From `src/modules/themes/theme-win7-scss.js`, the original Aero
`.window__main` frame uses two different colors:
`var(--theme-color--inactive)` on background windows and
`var(--theme-color)` on the focused one.

It also activates two **independent** effects only under these
source flags:

- `data-effect-enable-glass`: sets `backdrop-filter:blur(4px)`.
- `data-effect-show-window-shadows`: draws inactive 10px shadow
  and focused `2px 2px 15px 1px` outer shadow, plus white inset.
  Source `[dir=rtl]` mirrors the focused offset to `-2px`.

The original RTL frame also uses `-140deg` and `-225deg`
opposed Aero highlights, plus `-135deg` active corner highlight.
The original XP titlebar text shadow mirrors from `1px 1px`
to `-1px 1px`. Original Win11 RTL titlebar gets 6px right padding
instead of left padding.

From `src/modules/themes/theme-win11-scss.js`,
`.window__main.active` uses dynamic `var(--theme-accent)`
for its frame border/background, not a fixed generic tint.

## Implemented in the React port

- `packages/ui/src/sourceWindowChrome.css`: Win7 inactive and
  active tints map to the respective source custom properties;
  the original glass/shadow effects are guarded by their source
  attribute names. The Win7 gradients and source focused shadow
  mirror under inherited `:dir(rtl)`. XP/Win11 caption alignment
  follows those source RTL rules. Win11 now prefers its original
  `--theme-accent`, with the current theme color/surface fallbacks
  retained until the full original palette engine is migrated.
- `packages/ui/src/DesktopShell.tsx` exposes both original effect
  flags on the shell root with enabled visual defaults. Removing one
  flag disables only that effect, not the other. No host OS setting
  or native window compositor is modified.
- `tests/e2e/source-window-appearance-effects.spec.ts`: real
  Chromium CSS-computed appearance tests for both flags separately;
  a foreground/background window with distinct user-supplied
  `--theme-color` and `--theme-color--inactive`; RTL Aero
  gradients/shadow direction; RTL XP/Win11 titlebar alignment;
  and the original Win11 accent property. These tests run in
  desktop/mobile focused shell CI only on `[run-ci]` commits.

## Acceptance and remaining scope

**This milestone migrates the CSS/DOM effect contract, not the
complete original Performance Options dialog.** The pinned source
`src/modules/shell/system.js` has a System Properties → Advanced →
Performance Options UI that manages `effects.preset` and per-effect
values; that UI and persistence have **not** yet been ported. The
React shell enables the two visual defaults and exposes the
attribute-based effect switch points. They are not yet user-editable.

The default Aero tint remains a conservative prior React fallback
until original palette selection is wired. CSS values, layout effects
and original SVG shapes are not proof of pixel-matched screenshots.
Keep draft PR #1 unmerged; no release until end-to-end parity.

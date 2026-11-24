# Onebit source Guest logon — bounded 24 November 2026 slice

**Frozen source of truth:** `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. React candidate: `feat/0001-faithful-react-foundation` (draft PR #1).

## Original evidence, not invented theme design

- `src/modules/themes/logon-onebit.js` webpack module `41fc7` mounts `base-logon.is-onebit`, supplies its own avatar component, enables the source instruction/error/captcha paths, and provides bottom Shutdown and Restart `winui-button` controls. Buttons emit the existing `Shutdown` and `Restart` view actions.
- `src/styles/themes/logon-onebit.css` defines a dark root (`var(--theme-accent)`) with sand text (`var(--theme-surface)`), flat square Guest avatar and button borders: 2px surface outlines, 4px bottom button shadow, sand fill and inset dark frame when focused/pressed, and dark/sand inverse on avatar hover.
- `src/modules/themes/theme-onebit-scss.js` defines exact `--theme-accent: #352b30`, `--theme-surface: #e6d4bf`, and a 48px theme taskbar token. These values must not be replaced by Windows 7 or Windows 11 colors.
- Source `app.config.json` maps `defaults.themeScreens.onebit.logon="onebit"`. It is an independent screen family, not a Win7 alias.

## React scope and boundaries

`packages/ui/src/SourceOnebitLogon.tsx`, `sourceOnebitLogon.css` and the `LogonScreen.tsx` theme dispatch now render a separately marked `data-source-logon-renderer="onebit"` screen. Users can sign in as Guest and use the existing shutdown/restart lifecycle; Switch User leads to the existing honest unavailable-authentication dialog rather than a pretend login. The source dark/sand palette and flat 2px/4px interaction treatment are isolated from other themes. The existing original Guest artwork is an **explicit temporary fallback**: the special source `avatarComponent` (webpack `a2e5`) is not yet ported. Original captcha/error/input UX, pixel art power glyphs, entire Onebit desktop shell, screen-level source screenshots and timing also remain unverified. `sourceThemeShellStatus("onebit")` correctly stays `pending`, and `module-tracker.json` must be `in-progress`, never implemented/verified.

`packages/ui/src/sourceOnebitLogon.test.tsx` checks theme dispatch, Guest, power actions and non-Onebit fallback. `tests/e2e/source-onebit-logon.spec.ts` runs real desktop/mobile Chromium, asserts source exact computed palette and square avatar/pressed styling, the pending shell label, viewport bounds, unavailable account dialog and Guest desktop entry. The focused opt-in Actions suite includes this test file, and the full desktop/mobile suite runs it as well.

## Verification/release gate

The previous **green** [Actions #45144237553](https://github.com/codersachin99/windows-os/actions/runs/45144237553) at `0ddcfb62` passed 127+704 units, 863 focused browsers (3 skipped), 1313 full browsers (5 skipped), source inventory/artwork/Contacts audits, TS and Vite, **before** Onebit changes. A separate exact-head opt-in `[run-ci]` verification is required for this new slice. Original-vs-React 37-theme paired screenshot parity remains blocked by Actions missing `LEGACY_SOURCE_READ_TOKEN`. Keep source, `main`, draft PR #1 and releases unchanged.

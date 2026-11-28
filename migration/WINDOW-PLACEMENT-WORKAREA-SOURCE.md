# Guest window placement: source work-area parity (28 November 2026)

Immutable source: `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`.
Continuation branch: `feat/0001-faithful-react-foundation`, draft PR #1.
Never merge/release until original paired screenshot and behavior acceptance.

The Guest window placement registry was ported in earlier commits and retains
normal bounds, maximized state and shared Explorer identity. The previous
focused keyboard/vertical snapping checkpoint (CI 46168643808 at d3781a2)
passed; the newer placement persistence was **not** part of that run.

This slice aligns restored and newly opened normal window bounds, as well as
ordinary pointer moves, with the source shell's reserved workspace:
Win7/XP default 40px taskbar; Win11/ChromeOS 48px; classic Win95/98/2k 36px;
macOS top 28px and bottom 74px; Ubuntu top 32px and left 64px.
The engine uses a pure geometry helper; the React window frame retains
its CSS-computed work area, preserving app/engine/ui separation. Existing
Win7 cascade and normal restore storage layout remain unchanged.

Regression coverage: pure work-area and clamping tests; ordinary Ubuntu move;
real browser Guest reopen bounds for Ubuntu, macOS, Win11, ChromeOS and Win95,
in addition to existing Win7 shared Explorer/reload checks.
This is a compatibility boundary for the currently migrated shells, not a
claim that every source theme, RTL/zoom, responsive dock, modal, and original
screen-pixel comparison is complete.

Verification requested once at the exact new head with
`[run-ci] [taskbar-check]`: TypeScript, complete unit suite, immutable
source/artwork/Contacts audits, Vite build and focused real desktop/mobile
window chrome + taskbar browser tests. Do not claim green before run completes.
Next: inspect this CI and fix any actual failures; audit window arrangement
against remaining theme variants, RTL, dynamic work-area resizing and touch.

Verification note: CI #46169411308 at 3a6be9c failed TypeScript TS2322
in a new unit test before any browser execution. The follow-up a811ef2
corrected the test's inferred state type without weakening assertions.
An exact new-head focused CI is requested in the handoff checkpoint.

## Theme preview paint continuation

The frozen `src/modules/themes/theme-winvista-scss.js` and
`theme-win7-scss.js` contain identical seven snap-preview rules (rounded
border, LTR/RTL highlights, optional glass blur/texture and attachment).
Apply the existing source Aero rules to Vista as well. XP, Win31, Win9x,
Win7 classic and Whistler have explicit white/black outline rules; the
existing outline is retained. Other theme families still require auditing
the shared window stylesheet before claiming exact paint parity.
Browser regressions exercise actual drag preview for Vista, Win7 and XP.
Focused CI requested; visual comparison against the running original remains
unverified. Next audit shared preview defaults and theme effect/RTL mapping.

## Fractional snap geometry

Frozen shared window wrapper chunk `dcfced3e`, helper c(), divides the
work-area width by two without integer rounding. Preserve equal fractional
halves for odd viewport/dock widths. Add unit coverage for odd widths and
offset work-area touch thresholds at zoom 2. The physical-coordinate adapter
remains unchanged; this is not a complete RTL or responsive dock audit.
No additional CI marker while Vista focused run 46170565431 is active;
these new tests are not covered by that earlier run.

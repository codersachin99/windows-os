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

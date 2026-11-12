# Calculator migration — pinned Standard mode checkpoint

Original pinned source: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

Original application: `src/modules/apps/calc.js` (source webpack chunk, ~128 KB). Original stylesheet: `src/styles/apps/calc.css` (Git blob SHA `e4a76c147d6f10c7153c6448a67a2802da0767c5`).

## Source behavior and mapped implementation

| Original source feature | React implementation |
|---|---|
| Source default `mode: standard`, `layout: basic`, `digitGrouping: false`, `showHistory: false` | Native `CalculatorApp` starts in source Standard mode with initial `0` |
| Source `bt.buttons` array, exact 28 key labels and their order, 5-column and 6-row grid | `STANDARD_BUTTONS` in `standard.ts` rendered in 5-column CSS grid, with widened 0 and two-row equals |
| `Vt.inputDigit/inputDecimal` with 16-digit Standard entry ceiling | `StandardCalculator` handles digit, decimal and new-entry behavior |
| `Vt.setOperator/evaluate` Standard calculations done left-to-right | Isolated arithmetic model with source +, -, *, / and original 0/0 vs x/0 errors |
| `Vt.runFunction` and `v` map | Standard ±, sqrt, percent (divide by 100) and reciprocal |
| `Vt.runCommand` | Backspace, clear entry, clear all, MS/MR/MC/M+/M-, equals and history |
| `digitGrouping`, `showHistory` state and View menu | Checkable native View menu controls, grouped display and history list |
| Original menu Copy/Paste | Clipboard text handling, with access-denied status rather than silent failure |
| Keyboard digit/operation interactions | Focused calculator keyboard support for digits, + - * /, Enter, Backspace, Delete and Escape |
| Original `calc.css` | Byte-exact `packages/apps/calculator/src/source.css`; extra scoped React shell styles in `CalculatorApp.css` |
| `c170` installed program ID `calc`, Calculator.lnk, `Windows/System32/calc.exe` MZ stub | Registry launches native Calculator through Start menu, All Programs and Explorer source shortcut |

The Standard component is not an iframe or a generic web calculator. It is isolated in `packages/apps/calculator` so other application modes can be implemented without changing the window manager or global file contracts.

## Tests and explicit remaining gaps

Unit tests cover original Standard button sequence, simple left-to-right operations, changing operators, CE/C, signs/decimals/backspace, 16-digit cap, unary operations, divide-by-zero vs undefined, memory, history and subscription boundaries. Playwright adds keypad/memory/history/keyboard and `Calculator.lnk` launch tests, and adjusts the previously pending Calculator shortcut expectation to functional.

**Not implemented yet**: Scientific, Programmer/BigInt, Statistics/datasets, unit conversion, date calculation, worksheets (mortgage/vehicle lease/fuel economy), original extended expression parser/parentheses, angular modes, number notation, advanced user config persistence, complete original keyboard/edit/history views, exact original rich UI and screenshot comparison. Other mode menu options are disabled instead of falsely pretending to work. The Calculator module tracker is `in-progress`, **not** `verified`.

The original source artwork `assets/images/calc.1733a9a0.webp` is referenced by its exact name but must be imported through the verified pinned asset importer before a distributable build can claim visual parity.

**CI verified for this bounded slice:** [GitHub Actions 43171852845](https://github.com/codersachin99/windows-os/actions/runs/43171852845) passed TypeScript, 13 unit-test files, original source fidelity checks, Vite production build and **48 Chromium desktop/mobile tests**. The full Calculator source remains unverified and incomplete.

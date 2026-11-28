# Rollup native optional package install recovery — 21 November 2026

## Failure observed on the exact RTL Explorer CI run

[GitHub Actions run #44878279959](https://github.com/codersachin99/windows-os/actions/runs/44878279959)
at source branch head `0bb8e5e92d7ad0b9d683c002934b90bfb1cb93f5`
**FAILED during the Unit tests step**, *before any RTL browser assertions
or source audits started*. The runner did `npm install` on
Ubuntu Linux x64 / Node 22.23.5 (npm 10.9.9), and **TypeScript
passed**, but `vitest run` aborted on:

```text
Error: Cannot find module @rollup/rollup-linux-x64-gnu.
npm has a bug related to optional dependencies.
```

The root package has **no committed package-lock.json**; Rollup
is installed transitively through Vite/Vitest. The browser workflow
previously used `npm install --no-audit --no-fund` with no native
optional dependency guard. This is a dependency-install/runtime
failure, not a false source CSS or keyboard assertion. Do not
skip Vitest or remove any source-specific browser tests.

## Minimal CI-only fix

The `.github/workflows/react-checks.yml` opt-in
`browser-and-contracts` and visual-capture jobs now install
with `npm install --include=optional`, then verify that the
real Linux x64 native package
`@rollup/rollup-linux-x64-gnu` loads. **Only if missing**,
they read the installed `node_modules/rollup/package.json`
version and explicitly install exactly the corresponding
`@rollup/rollup-linux-x64-gnu@<version>` using
`--no-save --no-package-lock`. A final native package load
is mandatory and causes CI to fail if recovery is unsuccessful.

This does not change application source, the dependency
version range, `package.json`, a lockfile, source theme
assets or CI trigger policy. Jobs still execute only for
`[run-ci]` push commits / approved manual dispatch, and
visual-capture remains separately opt-in.

## Verification and constraints

A fresh exact-head `[run-ci]` must successfully complete
TypeScript, full unit tests, original source/style/artwork
audits, Vite build, focused and complete desktop/mobile
Playwright, including both taskbar keyboard and Explorer
RTL context regressions. If the native module is still
missing, inspect npm registry/network/runner causes rather
than silently suppressing tests. CI green does not equate
to original React pixel-perfect screenshot parity; that
remains blocked until the locked private source checkout
and paired visual tests run. Original `legacy-win7`
and target `main` remain unchanged; PR remains draft,
no product release is authorized.

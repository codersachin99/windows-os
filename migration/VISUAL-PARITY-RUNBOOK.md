# Visual parity runbook — original WindowsOS versus React

Source of truth: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.
Target: `codersachin99/windows-os`, feature branch `feat/0001-faithful-react-foundation`.

## Purpose and acceptance

Functional parity is necessary but not sufficient. A passing browser test only establishes its asserted behavior. Original visual appearance must also be compared for the same viewport, theme, user, window placement and application state. Until source and destination screenshots have been captured in the same environment, **do not claim pixel equality**, even for the source-backed View/Organize menus.

A visual checkpoint becomes verified only when:
1. Both applications render their respective screenshots using a **matched** viewport and device scale factor; source revision, target commit, timing, fixture, fonts and locale are recorded.
2. All expected controls are present and functional. Do not delete or hide implemented functionality simply to force a superficial pixel match.
3. Paired source/React screenshots and a difference analysis are preserved as traceable artifacts. Record any known gaps and any excluded dynamic regions.
4. Browser interaction tests for each altered feature pass, including desktop/mobile when relevant. Release readiness additionally requires accepted product-wide functional coverage, not just these snapshots.

## Source server: local source-backed baseline

The original repository contains `start.py`, a Python HTTP server that integrates static UI assets and backend APIs; `index.html` references packaged runtime JS/CSS from the source tree. On a *separate temporary checkout* at the pinned commit, the source launch command is:

```sh
python start.py --host 127.0.0.1 --port 8099 --no-browser
```

The server initializes a local database according to `db.config.json` and may access the original app's network-backed services or cache. Do not modify the source revision or point it at production data. Confirm boot/logon, mapped assets, backend requests and Guest access in the isolated environment *before* treating a captured image as authoritative. No claim is made here that this command was exercised in CI.

For the React migration, start the Vite development server using `npm run dev` from `windows-os` (Playwright currently expects `127.0.0.1:1420`). Both apps should be opened using the same Chromium version and fixed browser profile.

## Ordered capture matrix

Use the same browser width/height (initially 1920×1080 desktop and the repository's Pixel 7 Playwright profile) and Win7 theme for both sides:

| Scene | Original location | React counterpart | What must match |
| --- | --- | --- | --- |
| Guest desktop | Win7 Guest session | Guest desktop | Wallpaper, source icons, taskbar and initial window state |
| Computer root | Computer | Computer | Address bar, toolbar, navigation pane, content area, footer |
| Computer disk | System disk | System (C:) | Breadcrumbs, icons, history and file listing |
| Organize menu | Computer Organize open | Computer Organize open | Menu order, dividers, disabled states, hover and geometry |
| View popup | Computer View open | SourceViewMenu open | Exact eight labels/icons/order, 0–7 slider, current value, popup geometry |
| Recycle Bin | Bin (empty and populated) | Bin | Hoisted Computer chrome, deleted file metadata, confirmation and Restore |
| Search results | Scoped Computer/Bin search | Instant search | Placeholder, results breadcrumb, disabled Save search, file layout |
| New folder | Writable folder | Writable folder | Toolbar, creation/rename interaction and resulting listing |

Capture with *deterministic file names and folder fixtures* in both applications, and do not compare incidental network data or clock-dependent values as though they are layout bugs.

## Current source-backed facts

- `computer.js` renders the Win7 address bar with Back/Forward, non-classic instant search, and toolbar entries driven by `toolbar()`.
- `bin.js` delegates to the Computer component with `id="bin"` and the source `trashPath`.
- `computer.js#toolbar()` includes Organize, non-classic disabled Save search when searching, New folder on a non-null non-search active path, and a right-aligned View control.
- Shared webpack module `cb81` defines exactly eight modes in this order: XL/LG/MD/SM icons, List, Details, Tiles, Content; default is Tiles.
- All **36** current imported `apps/web/public/assets/images` files were compared against the pinned source tree and had matching Git blob SHA values. The source inventory audit has an automated recheck verified by [CI 43484632290](https://github.com/codersachin99/windows-os/actions/runs/43484632290): all 36 imported images passed byte verification.

### Verified first opt-in run — target-only React baseline

[GitHub Actions run #43490774615](https://github.com/codersachin99/windows-os/actions/runs/43490774615) successfully captured **10 of 10** target screenshots, zero errors, for the five initial scenes across desktop and mobile. It uploaded artifact `visual-parity-0e1ea5752982b84905e8381b5e41ff2158988f41` (ID `14067939886`). The visual job's JavaScript check and 36-image audit passed; the normal long browser-and-contracts suite was correctly skipped.

**No original screenshots were captured.** The runner had no `LEGACY_SOURCE_READ_TOKEN`; `manifest.json` reports `sourceConfigured:false`, `sourceCaptured:0`, and `parityStatus:"not-assessed"`. This proves the React capture workflow and upload work, not pixel-level parity. The original source checkout, Python server, source selectors, paired image diff and full acceptance review remain unverified. Source access should be supplied through a GitHub Actions repository secret with only read-only access to the original repository, never in chat, committed code or workflow logs.

## Important known differences

The React writable filesystem root `"/"` is not identical to original Computer's null root sentinel. `New folder` therefore remains usable at React root to preserve existing document, clipboard and search workflows. The Win7 toolbar still has migration-era file operation controls. The View popup uses source exact icons and source order/default but has not been screenshot-matched for pixels or all theme variants. Do not enable destructive or metadata-corrupting Bin clipboard operations simply to satisfy visual parity.

## Implemented opt-in capture tooling (source comparison not yet verified)

- `scripts/capture-visual-parity.mjs` opens an isolated Chromium context for each scene, using fixed UTC time (`2026-11-11T12:00:00Z`), en-US locale, 1920×1080 desktop and Playwright Pixel 7 mobile profile. It captures Guest desktop, Computer root, Organize, View and Recycle Bin as separate PNGs, along with a machine-readable `manifest.json`, screenshot SHA-256 values and explicit capture errors. An error makes the capture job fail, never "pass" by silently omitting a scene.
- `scripts/compare-visual-parity.py` creates overlay/diff PNGs and counts changed pixels above the documented grayscale threshold (20/255) only when **both** original and target PNGs actually exist. Its output is always `requires-human-review`, never an automatic acceptance or equality claim.
- `.github/workflows/react-checks.yml` has a separate `visual-capture` job **only** when a push commit message contains `[capture-visual]` or an explicitly selected manual dispatch has `capture_visual=true`. Existing full CI is still gated behind `[run-ci]` or manual dispatch with `capture_visual=false`. Ordinary doc/source pushes skip both.
- Source checkout is optional, via a user-managed, **read-only** repository-access secret named `LEGACY_SOURCE_READ_TOKEN`. The job pins `codersachin99/legacy-win7` to `4e63290d783009e1293433c6ccf252abba9c1187` and checks the checked-out Git HEAD. If the secret is absent, the job captures only React and labels `sourceConfigured=false`, `parityStatus=not-assessed`; **never call that source parity**. No GitHub token or database credential is written into artifacts. The original Python server is only started in the optional source branch.
- Captures live in the ignored `artifacts/visual-parity/` folder. GitHub Actions uploads that folder for 14 days regardless of job outcome, rather than committing generated PNGs. Both server endpoints must be loopback-only HTTP and must be distinct.

### Running it locally

With the React Vite server running at `127.0.0.1:1420`:

```sh
npm run visual:capture -- --target-url http://127.0.0.1:1420
```

For a genuine paired comparison, run the **isolated pinned** `legacy-win7` Python server on port 8099 (without production credentials or databases) and use:

```sh
npm run visual:capture -- --target-url http://127.0.0.1:1420 --source-url http://127.0.0.1:8099 --source-sha 4e63290d783009e1293433c6ccf252abba9c1187
python -m pip install Pillow
npm run visual:compare
```

Check `manifest.json`, `comparison-report.json`, paired images, and every capture error before assessing visual parity. The source desktop selectors and original-server startup must pass a **real paired run** before being considered verified. The current automated capture covers five fundamental scenes; disk breadcrumb, populated Recycle Bin, search results and New Folder fixture capture from the full matrix remain future work.

## Next executable step

Run the opt-in `[capture-visual]` job to verify React screenshot capture and artifact upload. If source read access is not configured, document its target-only limitation and do not fabricate comparisons. Then capture a genuine paired baseline against the pinned source and fix source-specific selector/server issues before accepting any visual differences. The remaining matrix scenes and visual assertions require separate verified milestones.

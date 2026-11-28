# Original Aero ChangeAppearance — unsaved preview discard on window close

Reference: immutable `codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776`. React feature branch `feat/0001-faithful-react-foundation`.

## Frozen source semantics

`src/modules/system/personalize.js`, webpack extended component `$` around lines 679–734, has `selectColor` (lines 710–713) call source CSS variable preview `68d0` immediately; `enableTransparency` watcher (lines 700–703) also applies live preview. Only `save()` (lines 714–729) sends the selected color/transparency to the source store; `back()` (lines 730–733) explicitly **restores the stored color/transparency** and exits the appearance view. The React equivalent must not accidentally persist an unsaved preview when closing the entire Personalize window via titlebar Close or Alt+F4.

## Actual regression and correction

[CI #45330433060](https://github.com/codersachin99/windows-os/actions/runs/45330433060) at head `096d6c38` passed TypeScript, 130+711 units, original inventory and artwork, Contacts audit, Vite, **869 focused browser (3 skipped)**, and **1,318 full browser (5 skipped)**, but failed exactly one desktop browser check: `tests/e2e/source-personalize-appearance.spec.ts` expected default `rgba(89,134,202,0.65)` after titlebar Close and read stale unsaved preview `rgba(0,178,148,0.65)`. User-visible CSS is checked immediately after the window DOM is removed. Previously React deferred rollback to the `PersonalizeApp` passive `useEffect` cleanup, which can occur **after** the close completed.

`packages/ui/src/DesktopShell.tsx` now calls stable `onAeroAppearanceDiscard()` **synchronously** inside centralized `requestClose(id)` whenever the corresponding live window appId is `personalize`, before invoking a registered close handler or dispatching `CLOSE_WINDOW`. This closes the gap for both titlebar Close and keyboard Alt+F4 (the source shell routes them through `requestClose`). The `PersonalizeApp` unmount cleanup stays intact as a safety net for independent removal paths, and Save remains the only persistence pathway.

The old full Playwright test is unchanged and remains a required regression. A new companion `Alt+F4` test opens Appearance, applies an unsaved turquoise preview, closes the window with Alt+F4 and demands that default Aero blue is restored. The source color palette, live preview, and window geometry are not changed.

## Separate CSS-normalization test repair

[Aero Noir CI #45333920227](https://github.com/codersachin99/windows-os/actions/runs/45333920227) at head `0cbb5a2d` passed TS, **132+715 units**, source/artwork/Contacts checks, Vite, and **871 focused browsers**; 2 dedicated desktop/mobile tests failed because they expected literal computed `background-size: 300%`. Source CSS `background-size:300%` computes canonically to **`300% auto`** in Chromium; the underlying rendered source value was correct. Updated only the assertion in `tests/e2e/source-aeronoir-logon.spec.ts` to expect `300% auto`. Neither the original 300% CSS nor viewport layouts were weakened.

## Unfinished acceptance

A new exact-head opt-in `[run-ci]` must re-run TS, full units, source inventory/binary integrity/Contacts, Vite, focused browser and full desktop/mobile browser. Previous separate [WinW CI #45333123563](https://github.com/codersachin99/windows-os/actions/runs/45333123563) was **green** (131+713 units, 871 focused and 1321 full browsers, skips excluded), but predates these fixes. Keep original reference, main, draft PR #1 and releases unchanged. `LEGACY_SOURCE_READ_TOKEN` is still needed for original-vs-React screenshots and no full theme visual parity is claimed.

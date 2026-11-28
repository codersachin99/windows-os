# Win7/Vista Start library artwork and delayed avatar preview — frozen source

Date: 22 November 2026. Immutable source: codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776. Candidate: codersachin99/windows-os, branch feat/0001-faithful-react-foundation, draft PR #1.

## Source evidence

Frozen src/modules/shell/startmenu-base.js defines the three right-pane `shortcuts()` entries `documents`, `pictures`, `music` with original icons `this.icon['start-docs']`, `this.icon['start-pics']`, `this.icon['start-music']`. Its rendered right pane uses `data-test-startmenu-link` on each text button. A `showItemPreview()` predicate returns false for base/custom/useBaseAssets themes. Otherwise an avatar preview region contains an icon for `hoveredLink===key`, replacing the avatar while a link is hovered. `showLinkIcon(key)` clears the prior timeout and defers `hoveredLink=key` and `showAccountLink=!key` by 400 ms. Mouseover and mouseout call `showLinkIcon(key)` and `showLinkIcon('')` respectively. This is not an instant hover image and must not be rendered as an extra icon inside each text button.

## Immutable assets imported

Six blobs were fetched from the exact source SHA as base64, created in the target via GitHub Git blobs and compared SHA-for-SHA before a single commit to the feature branch. Their original filenames and SHA-1 Git blob IDs are:

| Original file in assets/images | Pinned Git blob SHA-1 |
| --- | --- |
| start-docs.68e567fd.webp | a82934c9371838320975f1c909bb2f4389a1c079 |
| start-pics.90cdea88.webp | 5285250096ad9a789020a51f6b00a08548205465 |
| start-music.7d1b9e60.webp | b0a08bc345b84669b8d16505b85bdb88508c2d65 |
| start-docs-base.d4ace145.svg | fe868511c13fdb1c4c10e16d3784b1f3bf6e0b60 |
| start-pics-base.b5f2d859.svg | 0567f7ac8f8483e8e0857dda99bf2685d97acd4e |
| start-music-base.74611945.svg | 0670bea5472a2c9169fba7f269028656922489ef |

Target path: `apps/web/public/assets/images/<original filename>`. Atomic asset-import Git commit was `7ec98fca`. `scripts/import-source-theme-assets.py` now enforces these six original hashes under its Win7 source-artwork manifest; target-only CI verify mode checks each image without requiring read access to the private source repo. No image generated, renamed, recompressed, or substituted.

## Candidate implementation

`packages/assets/src/index.ts` exports `sourceWin7StartLibraryArtwork` for both exact standard and Basic SVG paths plus `sourceWin7StartLibraryIcon(theme,key)`. `packages/ui/src/StartMenu.tsx` applies a 400-ms cancellable hover timeout to the three existing Win7/Vista/Aero/Basic Guest link buttons and swaps the Guest avatar for the exact original standard image for non-Basic themes. On pointer leave it restores the avatar after the same delay. Basic themes retain original available source SVG mapping via a nonvisual `data-source-library-icon` attribute but do not show an avatar hover-preview: frozen `showItemPreview` excludes base themes. The CSS keeps the current shell's avatar dimensions until paired original screenshot comparison determines the right-pane geometry and styles. No change to Win10/11, WinXP or other Start families, nor to the filesystem permissioned navigation introduced in the prior Guest links slice.

## Verification

`packages/assets/src/sourceWin7StartLibraries.test.ts` checks pinned library icon filenames and standard/Basic mappings. `tests/e2e/source-win7-start-library-artwork.spec.ts` checks the actual standard Win7/Vista preview images load, have correct original asset URLs and data markers, and return to Guest avatar on mouseout on Chromium desktop/mobile (using mouseover dispatch so mobile emulation does not require a physical hover device). It also checks Basic-1 uses SVG source URL attributes without showing the forbidden avatar preview. The focused GitHub Actions browser list includes this new spec. Existing source Guest link navigation tests remain. Exact-head `[run-ci]` must pass TypeScript, all unit tests, original source inventory, byte-identical source theme asset audit, Contacts audit, Vite and focused/full desktop/mobile browser before this slice is accepted.

## Still unverified

Original source conditional `showItemPreview` also depends on custom themes and `useBaseAssets`, which are not yet exhaustively matched to all 37 final theme IDs. This slice does not assert full image positioning/easing, menu width, avatar frame/hover transitions, search-place previews, mobile pointer parity, nor visual pixel equivalence. Paired visual capture still requires `LEGACY_SOURCE_READ_TOKEN`. PR #1 remains draft; original SHA and windows-os/main untouched; no product release.

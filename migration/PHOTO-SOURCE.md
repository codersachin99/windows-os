# Windows Photo Viewer — pinned source migration

## Immutable reference

- Original repository: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.
- Source file: `src/modules/apps/photo.js` (Git blob `9df699034854fb6bcda027c0c2d8ab61ac6a01b2`), webpack component `273a`.
- Original icon sources: `assets/images/photo.db6c5f81.webp` (Windows 7) and `assets/images/photo-base.b5f2d859.svg` (base-theme fallback).
- The initial React implementation uses the **exact source SVG fallback** (Git blob `0567f7ac8f8483e8e0857dda99bf2685d97acd4e`); the Win7-specific WebP has **not** yet been transported. This is an explicit visual-fidelity gap rather than a reconstructed or fabricated icon.

## Source behavior and React mapping

| Pinned original photo.js behavior | React implementation |
| --- | --- |
| Source file path drives window title and image | `PhotoApp` reads bytes from `fileStore.readBytes(path)`, uses a local object URL, updates shared WindowFrame title; revokes object URLs |
| `listPhotos(folderPath)` filters same-folder picture files using source kind | `sourcePhotoList` uses the original de73 picture extensions and filters directories |
| `navigate(±1)` wraps and refuses to move with fewer than two photos | `sourcePhotoNextPath` + Next/Previous controls |
| Disabled File/Print/Email/Burn/Open menubar entries | Read-only disabled toolbar items, never invented file operations |
| `rotate(±90)`, automatic `save()` before navigate or close | Canvas rotation for PNG/JPEG/WebP, saved back to virtual file bytes before navigation/close |
| `fitToWindow`, `zoomLevel` from 100 to 800 in increments of 20 | Fit/actual-size control and native range slider |
| `toggleSlideshow`, 3000 ms navigation, fullscreen | 3-second timer, optional browser fullscreen on user click; source-equivalent geometry and fullscreen race handling still require verification |

The original `photo.js#save()` attempts `image/<extension>` encoding for all source picture formats; browsers do not support canvas export to GIF/SVG/ICO/APNG/BMP equally. The React port **does not overwrite an unsupported original file with PNG bytes under the old extension**. Unsupported rotation displays an error and refuses to navigate/close while there are unsaved changes. This deliberately preserves data but is a source-behavior divergence to resolve with an explicit compatible conversion strategy later.

## Integration

- `packages/sdk/src/index.ts` registers hidden source `photo` program as **Windows Photo Viewer**, matching `sourceProgramManifest.json` (`Program Files/Windows Photo Viewer/PhotoViewer.exe`). Source still treats the app as hidden from Start.
- `packages/ui/src/DesktopShell.tsx` mounts `PhotoApp` with original `filePath`, shared title updates, close interceptor, file lifecycle.
- `packages/apps/explorer/src/ExplorerApp.tsx` opens image files with Photo Viewer, reusing original `matchesSourceKind(...,"picture")`, and does not change Recycle Bin safety.
- New E2E `tests/e2e/photo.spec.ts` uploads **real binary PNG** files via the existing Explorer UI, opens one by double-click, checks source-disabled menu, original image dimensions, next/wrap, rotation save, zoom and close. A pure model test checks extensions, filtering, source wrap and 90-degree rotation.

## Acceptance boundary

This is a **working source-backed functional slice**; it is not full legacy equivalence. The Windows 7 icon variant, source window geometry and media-control glyphs, image-save behavior for other formats, source original slideshow placement, all theme variants, and original-versus-React screenshot parity remain unverified. Run opt-in `[run-ci]` to confirm TypeScript, tests and source-art inventory before calling it CI-verified. PR stays draft and `main` is unchanged.

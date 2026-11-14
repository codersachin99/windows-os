# Original Snipping Tool — source and React migration

- Immutable source: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187/src/modules/apps/snipping.js`, webpack module `331a`; original CSS `src/styles/apps/snipping.css` pinned blob `ff198a8674af962f395ca484791463e67fa1d54a`.
- Source ID `snipping`, program installed by original manifest as Windows Snipping Tool.
- Source default: `showResult:false`, `showDialog:false`, text key `select-snip`, fileName `Capture`, `isSnipping:false`.
- Exact original base-icon SVG `assets/images/snipping-base.9d1d8a3f.svg` blob `b9bbe1779e0f0e21418a84cc364cea2048edcf31` copied byte-identically.
- Original Win7-specific `assets/images/snipping.2c25345c.webp` blob `3f83537a4a0503a10941fed592eb1cba4b3540c0` still inaccessible via text-only connector.

## Source contract mapping

| Source | React |
| --- | --- |
| New → Free-form Snip disabled | `SOURCE_SNIP_MODES` and disabled menu button |
| Rectangular Snip: crosshair, red selection, 5px min re-arm | Portal selection overlay, normalized/clamped rectangle with min 5px |
| Window Snip: identify hovered window, highlight it, click | `document.elementsFromPoint` finds window, highlight and capture |
| Full-screen Snip: capture root OS canvas | `captureDesktop(root)` captures `.windows-desktop` |
| Source `domToImage(rootEl)`, crop and render canvas | Direct Canvas2D DOM rasterization (computed colors/gradients, text ranges, same-origin images, visible canvases), crop to actual HTMLCanvasElement |
| Cancel: clear preview/result and reset | Restores initial message and clears active capture state |
| Result Toolbar Save: `dialog-save`, PNG/JPG, default Capture | Shared `VirtualFileDialog` and real binary Guest VFS PNG/JPEG |
| Window lock during save modal | `onRegisterClose` guards closing while Save As visible |

## Acceptance and gaps

The virtual screenshot draws currently visible WindowsOS DOM into a local Canvas2D; it does not use the Chromium-tainted SVG foreignObject output (reproduced `SecurityError` during pre-verify testing). Live text, CSS colors/gradients, borders, same-origin wallpaper/icon assets and canvases can be painted, while cross-origin iframes, DRM/video, CSS pseudo-elements, filters and advanced transforms cannot be reconstructed at exact native pixels. The original `domToImage` renderer remains distinct, so screenshot pixel equivalence needs side-by-side source verification.

Original source window grows from `h:auto` to `h:300` when showing a result; shared WindowFrame retains provisional `370×185` until dynamic sizing or verified paired screenshots are available. The exact source Win7 icon is outstanding; full source virtual save-dialog implementation, focus modes and thumbnail styling require visual parity work.

Snipping stays **in-progress** for original feature/pixel parity even though the implemented slice passed [full opt-in CI #43583547737](https://github.com/codersachin99/windows-os/actions/runs/43583547737): 293/293 unit tests (58 files), 300/300 browser cases, 44 exact source image audits, TypeScript and Vite build. Original pixel fidelity, source Win7 icon and native renderer are outstanding. PR #1 draft, main untouched, no release.

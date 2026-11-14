# Windows Camera — source-backed migration

## Immutable source

- Reference: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`
- Original: `src/modules/apps/camera.js`, Git blob `c87c1df95b581d8dedc8eb3ce490516f5901d995`, webpack `2164`.
- Source manifest: `camera`, **Camera**, Accessories, `Program Files/WindowsOS/Camera/camera.exe`.
- Original Win7 image: `assets/images/camera.5e0b513d.webp`, Git blob `db662ea103b74fd7d903f7910383c07d93b824ae`. The current GitHub text-only connector cannot retrieve this WebP; do not claim its visual fidelity.
- Original base-theme icon: `assets/images/camera-base.3c876d62.svg` (Git blob `23ce3c1e95d9a0dcf9a7f3a9f2655d07c90b4c9f`), imported **byte-identically** under its original path as a documented interim icon.

## Original behavior mapped to React

| Pinned `camera.js` behavior | React implementation |
| --- | --- |
| On component mount, request `getUserMedia({video:{width:1280,height:720,facingMode:"user"}})` | `CameraApp` automatically requests the same video constraints on mount; browser permission is authoritative |
| Front/rear switch toggles `user` / `environment` and calls `getCamera()` again | React reruns its camera request, stops the previous stream and discards stale asynchronous permission results |
| Preview video gets `srcObject` and calls `play()` after metadata loads | Managed `video` element with `muted`/`playsInline`, sets ready only after successful playback |
| `captureImage()` uses video track `getSettings()` dimensions and source capture helper `0fbc.j` | Canvas `drawImage(video)` at track dimensions; quality 1 JPEG; verifies real JPEG MIME and SOI signature before persistence |
| Image save dialog uses `fileName: Date.now().toString()`, `jpeg: "JPEG file (*.jpeg)"` | Exact JPEG-only filter on shared VFS `VirtualFileDialog`; writes binary bytes, no host-disk access |
| Information modal shows fixed Resolution 1280×720, Format JPEG, Quality 100% | Modal shows the same fixed values with source OK/Cancel flow |
| `isLocked = !!error || showConfig || canSave` | Shell close interception protects active error/settings/save overlays; camera capture/switch disabled when locked |
| `destroyed(): clearStream()` | Cleanup stops all video tracks on switch/close/unmount; epoch guards late grants after close |

The React window currently uses a shared `760×540` resizable `WindowFrame` as a provisional geometry: original `camera.js` inherits the source WindowMain default. Neither dimensions nor control glyph geometry are yet claimed pixel-identical.

## Automated evidence and limits

- Model tests `packages/apps/camera/src/model.test.ts` check exactly 1280×720 and `facingMode`, JPEG-only export and safe capture dimensions.
- Chromium `tests/e2e/camera.spec.ts` mocks **only** the hardware video source via `HTMLCanvasElement.captureStream()`. It tests the actual app/window, gets stream constraints, changes facing mode, confirms previous tracks stopped, opens source settings, uses real browser Canvas JPEG encoding, saves bytes via the shared VFS, verifies JPEG markers and opens the result in the Photo Viewer. A separate browser case tests `getUserMedia` permission rejection and error dismissal. Both desktop and mobile tests must pass in opt-in CI before this slice is called integrated verified.
- The simulated video stream is *not* live camera-hardware acceptance. The original source's `0fbc.j` JPEG converter, browser/device-specific facing selection, all themes, source static help window and actual screenshot parity require review against the pinned executable.
- The Camera entry stays **in-progress** until full original functional/visual equivalence is demonstrated. No main merge or release.

## Verification command gate

Executable code changes warrant one `[run-ci]` commit to run TypeScript, Vitest, byte-exact source-art audit, Contacts contracts, Vite build and Playwright desktop/mobile. Documentation commits must not trigger full CI.

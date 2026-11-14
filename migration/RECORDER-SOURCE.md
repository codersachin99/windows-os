# Sound Recorder migration — pinned legacy source

Source of truth: `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.
Program module: `src/modules/apps/recorder.js` (Git blob `449ee11457fafdbea1f61052a5417a3e85cee022`), webpack `01ef`.
Source manifest: `recorder`, **Sound Recorder**, Accessories, `Windows/System32/SoundRecorder.exe`.

## Original behavior

The pinned original has `WindowMain` with `w=480`, `h=90`, centered, non-resizable, with no maximize/minimize. A one-row interface shows a Start/Stop control, elapsed time (`a146.b`), a microphone frequency progress meter, and Help. It requests `navigator.mediaDevices.getUserMedia({audio:true,video:false})` on Start; constructs a `MediaRecorder` preferring `audio/webm`; and uses a WebAudio `AnalyserNode` with `fftSize=32`. Stopping resets time and meter and converts the captured audio through original shared module `0fbc.d` before presenting **Save As** with only `Waveform Audio File (*.wav)`. The source displays an error modal when the microphone is unsupported/denied. Closing must stop recording and microphone tracks.

## React source-backed slice

- `packages/apps/recorder/src/RecorderApp.tsx` implements the source control flow, permission request only on Start, Start/Stop state, second counter, the 32-FFT optional level meter, MediaRecorder WebM preference, cleanup of media tracks/audio context and a WAV-only Save As dialog. Audio never leaves the browser except when explicitly persisted to the virtual filesystem.
- `packages/apps/recorder/src/wav.ts` decodes browser-supported MediaRecorder audio using `AudioContext.decodeAudioData` and encodes **RIFF/WAVE signed 16-bit PCM** with accurate channel count, sample rate, sizes, block alignment and little-endian samples. This avoids silently writing WebM bytes under a WAV extension. The pure model tests verify headers, sample extremes, time formatting and rejection of invalid dimensions.
- `packages/apps/shared/src/VirtualFileDialog.tsx` now accepts an optional `fileTypes` array, defaulting to its unchanged Notepad TXT/HTML selectors. Recorder supplies only `wav`, with overwrite confirmation and file persistence handled by existing shared VFS plumbing. The save dialog is hoisted above the compact source-inspired recorder window, avoiding clipping.
- `packages/sdk/src/index.ts`, `packages/ui/src/DesktopShell.tsx` and Vite/TypeScript aliases register the source `recorder` in the Start Menu and shell without host process APIs.
- The icon fallback is the **exact original source file** `assets/images/recorder-onebit.110a9439.svg` (same Git blob `c50b4787b12261d501cf62091d71685947b8e079`). The source Windows 7 icon `assets/images/recorder.519283f8.webp` still requires binary import; the appearance is not pixel-parity verified.
- `tests/e2e/recorder.spec.ts` uses an explicit simulated microphone/MediaRecorder test fixture to exercise real WebAudio decode, WAV conversion, virtual-file save and persisted RIFF headers without granting live CI hardware access. It separately verifies microphone permission rejection and error dismissal. A real browser microphone acceptance check remains outstanding.

## Known divergences and acceptance

- Exact original viewport coordinates/chrome (source `h=90` versus an interim shared `115px` titlebar/body), Win7 icon, level-meter art, Help icon, and waveform visual design are not screenshot-matched.
- Original `0fbc.d` media conversion may differ in sample-rate/channel mix and quality settings from the React WAV 16-bit PCM implementation. No byte-parity is claimed for separately encoded recordings.
- Browser WebAudio/MediaRecorder capabilities and live microphone permission vary. A deterministic mocked Chromium recording test does not prove real hardware availability; browser-level device testing is a separate acceptance gate.
- The original is allowed to close while recording; React stops and releases all media resources on close. When conversion or Save As is active, the shell close is held to prevent losing in-flight audio.
- Source audio-duration formatting (`a146.b`) and one-row window height require original browser visual acceptance.
- Do **not** mark `recorder.js` fully source-verified until exact original behavior, real permissions, themes, and screenshot pairs are checked.

## CI requirement

This is executable source code, so use **one** opt-in `[run-ci]` commit to run TypeScript, Vitest, Vite build, original source-art byte audit, and the desktop/mobile Playwright suites. Keep `main` untouched and PR #1 draft.

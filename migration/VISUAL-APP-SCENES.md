# Application window screenshot evidence expansion

## Capture purpose

The migration needs visual evidence as well as passing functional tests. The original capture script only photographed the Guest desktop and Computer/Recycle Bin scenes. This expansion adds target-only initial WindowsOS app screenshots for Calculator, Notepad, Chrome, Internet Explorer, Media Player, Snipping Tool and Sound Recorder at the deterministic Win7 desktop and mobile profiles.

The source application selectors have not yet been validated inside the original pinned Vue runtime, so these scenes are deliberately **target-only**, excluded from source-comparison eligibility. They cannot be used to claim 1:1 parity.

## Reproduction and artifacts

- The explicit visual workflow is gated by a commit message containing [capture-visual] or manual capture_visual dispatch.
- The workflow runs node --check and original source-asset audit before screenshots.
- Source SHA remains pinned to 4e63290d783009e1293433c6ccf252abba9c1187.
- Source screenshots are attempted only with a configured LEGACY_SOURCE_READ_TOKEN and an exact checkout; absent source access, the manifest explicitly states parityStatus:not-assessed.
- Screenshots are attached as workflow artifacts for visual inspection and iteration, not committed as proof of equality. Reusable program code continues to be verified with the separate [run-ci] workflow.

The original Chrome T-Rex, native browser restrictions, real microphone/camera hardware, source dimensions and every missing application still need true source-backed behavior and paired screenshot coverage.

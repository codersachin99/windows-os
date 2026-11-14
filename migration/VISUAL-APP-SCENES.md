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

## Actual capture results — 2026-11-14

- [Opt-in visual workflow #43586693913](https://github.com/codersachin99/windows-os/actions/runs/43586693913) **SUCCESS** on commit 1694520.
- 34/34 React screenshots created: 17 Win7 desktop scenes and 17 Pixel 7 mobile scenes, including all seven new application baselines. 0 capture errors.
- Source captured: 0. The workflow explicitly reported NO legacy read token, so sourceConfigured:false, targetOnlyCaptured:24, parityStatus:not-assessed. Five existing common scenes per profile are source-comparison-eligible, but cannot be compared without actual original source captures.
- [Screenshot artifact 14110837735](https://github.com/codersachin99/windows-os/actions/runs/43586693913/artifacts/14110837735) contains the generated images and manifest; it is not a claim of visual parity.
- Do not mark any app or source module as source-verified based on these images. Explicit source evidence and pixel comparison remain blocked by read access to the immutable original application in the visual workflow.


## New Details/Tiles and Message target-only scene plan — 2026-11-14

- Three target-only scenes have been authored in scripts/capture-visual-parity.mjs: computer-details-metadata, computer-tiles-metadata, computer-message-confirm. Each creates a real Guest VFS folder before capturing. Details selects original View menu, Tiles uses original default view, and Confirm opens the source-style modal.
- These scenes will add six target screenshots (desktop/mobile) to the prior 34. This is planned evidence, **not yet an observed capture result**. They remain sourceComparisonEligible:false until original pinned Vue fixtures and source server are available.
- Run only with the gated [capture-visual] workflow; do not treat these screenshots as original pixel-parity verification.

## Actual expanded visual workflow result — 2026-11-14

- [Visual job #43591033519](https://github.com/codersachin99/windows-os/actions/runs/43591033519) **SUCCESS** for [capture-visual] commit e1697bb. **40/40** target screenshots captured: 20 desktop + 20 mobile, including all three new source listview/message scenes. 0 capture errors.
- Artifact [14112935185](https://github.com/codersachin99/windows-os/actions/runs/43591033519/artifacts/14112935185), approx. 19.7MB, contains the 40 scene PNGs and manifest.
- Manifest reports sourceConfigured:false, sourceCaptured:0, targetOnlyCaptured:30, parityStatus:not-assessed. Original legacy read token was absent. No original/React pixel-diff evidence exists. Do not claim complete source parity.
- The same run's independent browser-and-contracts CI job was still in progress at this documentation checkpoint. Its result must be checked separately.

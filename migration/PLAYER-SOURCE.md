# Windows Media Player — pinned source reconstruction

## Immutable source

- `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187/src/modules/apps/player.js` Git blob `bea751030d06d2fa11558b6487d99a8ae2383c33`, webpack main `9b15`.
- Source installation manifest: `player`, Windows Media Player, `Program Files/Windows Media Player/wmplayer.exe`, alias `wmplayer`.
- Exact source base icon `player-base.3e5b35e3.svg` Git blob `b78f94a72bb7191c63fb4080a9965fd18eaec4fa` byte-for-byte copied to public assets.
- Original Windows 7 WebP `player.d45d301d.webp` Git blob `3355030754e1019e19b0169f16070f45752e45c7` imported byte-identically via the GitHub Base64 source/target blob channel; WindowsOS now uses the original Win7 icon.

## Behavior mapping

| Source `9b15` | React |
| --- | --- |
| `library=music`, `current=-1`, `state=Stop`, muted false, volume 100 | `SOURCE_PLAYER_INITIAL` |
| Organize → Manage libraries → Music, Videos, Pictures; Stream/Options disabled | Source menu state and linked Guest Open dialog |
| `dialog-open` and `load`: read virtual file, select music/video/picture player | Shared `VirtualFileDialog`, `fileStore.readBytes`, browser Blob URL |
| `State` Stop/Play/Pause; audio/video/picture refs | Actual `<audio>`, `<video>`, `<img>` and source control buttons |
| Play/pause, stop, prev/next, random/repeat toggle | Source control UI and single-file state; future playlist still pending |
| Seek range, progress, duration/timeupdate | Browser media metadata and playback seek slider |
| `volume=(local/100)*(sysVolume/100)`, muted flag | Local 0..100 slider and mute; source system-level volume remains pending |
| resize `showAllControls` at width 400 | Responsive `ResizeObserver` threshold |
| Playlist Name, Length, Size, Modified, Type | Single active loaded file with source column labels and live metadata |

## Verification boundary

The exact original Win7 icon is now imported and registered. The currently implemented slice opens a single real file at a time. Source media type filter `7f29` (not yet fully ported), full playlist/metadata scanning, disabled/unsupported codecs, original in-feed ad widget, OS system volume, local library persistence, source title chrome and theme screenshots remain unimplemented or unverified.

Browser HTMLMediaElement codec support and playback/autoplay policy determine whether a file can actually play; no fake playback success is shown. Guest VirtualFileStore is used, never the host disk. The virtual Open dialog is generic and does not yet match original filter/layout exactly. Source File Explorer still opens pictures in Photo Viewer; music/video is newly associated with Media Player.

First opt-in [CI #43584290348](https://github.com/codersachin99/windows-os/actions/runs/43584290348): 297/297 unit tests (59 files), 300/306 browser tests passed; six browser failures were test-selector ambiguity for `Play` inside the named Windows Media Player window and a responsive slider hidden as the pinned original requires below 400px. No source player behavioral failure was identified in this run. The repaired assertions need the next full opt-in run; original source visual parity remains pending. Draft PR #1 remains open, `main` unchanged, no release.

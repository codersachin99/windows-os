## Tetris 13bc original input mapping correction — 17 November 2026

The original Tetris engine handles keyboard aliases (A/D/S,
W/X/K and Z/L), Space once per keydown without repeat, P/Esc
pause, non-passive canvas wheel with positive delta clockwise
and negative delta anticlockwise, primary tap clockwise and
secondary tap opposite, continuous captured pointer drag
based on bounding boxes of the *current piece* and source
canvas grid, and a 500ms/10px tap threshold. The original
move/rotate sound fires inside the game engine **after**
successfully moving/rotating, not when the key is pressed.

Added reusable pure helpers in `sourceTetrisControls.ts`,
unit coverage, native non-passive canvas wheel, captured
pointermove/up/cancel, and state-driven actual movement
sound. The user-facing game now exposes rotation and position
test attributes for deterministic browser checks. Pointer
dragging computes the source same/left/right and down-enable
from the source piece's cell bounds; simply looking at
drag-end distance, as the earlier adapter did, was not source
accurate. Right mouse button tap rotates counterclockwise.
In the React adaptation inputs are still consumed at next
60fps tick and the pointer uses capture rather than raw
document listeners; no absolute input-timing pixel parity
claim is made.

The accepted Tetris 460/460 browser and 516/516 unit tests
were from [CI #43939723976](https://github.com/codersachin99/windows-os/actions/runs/43939723976),
SHA `88e489555c5023a04fc16098336e68034bca2cb4`.
The 68/68 React-only screenshots from
[visual #43941143525](https://github.com/codersachin99/windows-os/actions/runs/43941143525)
had zero errors but `sourceCaptured=0` and parity `not-assessed`.
This input correction is later than either accepted run and
requires another explicit opt-in acceptance. No main merge
or release.

---

## Byte-locked source Tetris shell styling — 17 November 2026

The original `src/styles/system/tetris.css` (pinned blob
`fe03219ede8f47a0f74163781e4d25a557fbc9ed`) is now
preserved byte-for-byte at `migration/source-css/tetris.css`.
It specifies the game's source `#9edbf2` 3px button border,
and source Tetris statistics width of 300px, among inherited
WinUI dialog styles. The React implementation uses the same
button border and 300px parented child width while retaining
its own scoped styles. `npm run audit:legacy` now hashes
the preserved original Tetris CSS independently of Minesweeper's
existing byte-locked CSS and all original game image/audio files.
No original-side screenshot parity is claimed by this integrity gate.

---

## Original 13bc GAME_OVER animation and stats handoff — 17 November 2026

The pinned Classic Tetris engine's `_triggerGameOver()` emits
`GAME_OVER_START`, sets `gameOverLine=1` and enters
`STATE_GAME_OVER`. `_processGameOver()` advances every
eighth frame, fills the next of 22 rows with white color index 7
and, once all rows are exhausted, emits `GAME_OVER_END`.
The pinned Vue handler saves the score at start and automatically
opens Statistics on end.

The React model now retains this original stepped wipe rather
than generic instant game-over. Its snapshot exposes
`gameOverComplete`, the RAF continues through the wipe and
the parented Statistics child automatically opens on completion.
A deterministic model test exercises top-out and the final
all-white bottom row. Exact source canvas pixel parity and
input timing still need original runtime reference.

---

## First playable Classic Tetris integration — 17 November 2026

Committed real `TetrisApp` using source 13bc's 10×22 board,
Fisher-Yates is NOT substituted: the original 8-outcome/7-piece
source random picker, seven exact source piece rotations/initial
positions, source frame gravity and score formula, 60 FPS request
animation loop, soft/hard drop, no wall kicks, ghost and next piece
preview, responsive source canvas wide/narrow layout. The original
CSS chrome includes the black background, cyan `#9edbf2`
border and fixed fullscreen non-resizable window. The original
`tetris-bg.abd0ff80.webp` and all eight original Tetris audio
MP3s are source/target Git blob SHA matches; all imported assets
are audited against pinned `migration/legacy-files.tsv`.

Original 13bc controls: left/right arrows or drag, up/X clockwise,
Z counterclockwise, down soft drop, space hard drop, P/Esc pause,
canvas tap rotates, Play/Pause and New Game buttons. Original
Help content and a browser-backed Statistics/highscore adapter are
implemented via reusable parented shell child windows. The
statistics adapter and current burn/game-over rendering are not
claimed byte-identical to the original GameStats store and full
original animation engine. Source parity requires source paired
visual evidence and input/audio acceptance.

`tetris` is now registered in the Games AppRegistry and has a
fullscreen fixed `WindowMain`. Four other built-in game engines
(Chess, Mahjong, Purble Place, Solitaire, Spider Solitaire: five
other engine families) stay disabled. New Vitest and desktop/mobile
browser cases cover engine layout and gameplay, Win7 source shell
launch, fixed fullscreen, keyboard hard drop, Help and Statistics
child windows. This is **unverified code until a deliberate CI pass**.

---

# Pinned Tetris 13bc source contract — 17 November 2026

Legacy pinned revision `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`
contains a full Classic Tetris game in `src/modules/games/tetris.js`.
It is not a generic 10×20 implementation: source engine has an actual
**10×22** board with **two hidden rows**, original Z/S/O/L/J/T/I
piece rotations and spawn positions, 60 FPS fixed-frame advancement,
250 ms catch-up limit, seven-piece original random selection, no
wall kick rotation, score table `40/100/300/1200 × (level+1)`,
soft-drop +1 and hard-drop +2 scoring, gravity table beginning at
96 frames per grid cell and reducing to 2, line-burn animation with
center-out 8-frame column clearing, state machine
DROP/BURN/ARE/PAUSE/GAME_OVER and ghost piece preview.

Original UI is fullscreen and non-resizable. Its canvas has play/
pause and new-game buttons positioned by original responsive
canvas layout; keyboard arrows, X/Z, space, P/Esc, pointer
drag/tap/wheel, ResizeObserver, audio and parented Help/Statistics
child windows. `GameStats("tetris")` stores score/level/lines
and original end-of-game statistics. Original Help names
Albert Lobo's Classic Tetris as MIT licensed; original assets,
sound files and music have separate provenance to clear.

`packages/apps/games/src/sourceTetris.ts` now ports the original
shapes, random picker, gravity/level/scoring formulas, board snapshots,
hard-drop/move/rotate, and foundational state transition frames.
The complete canvas rendering/layout, game-over animation,
audio, pointer controls, statistics, help,
and browser tests are **not implemented**. The Games tile must
remain disabled until an end-to-end playable/verified port exists.
This is explicitly an **in-progress source engine**, not a completed
or playable second game. Unit coverage verifies source constants
and fundamental transitions.

The engine now retains the source lock-height ARE delay across line
burn instead of a fixed delay, with a transition regression test.
Next: implement responsive original canvas projection, keyboard/
pointer input and animation loop, integrate audio and stats child
windows, then enable the game via shared app registry only after
functional Playwright acceptance. Never replace source code rules
with typical modern Tetris SRS or 7-bag random generator.


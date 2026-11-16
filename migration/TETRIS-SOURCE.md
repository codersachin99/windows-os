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


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
The complete canvas rendering/layout, game-over animation, exact
burn-to-ARE timing, audio, pointer controls, statistics, help,
and browser tests are **not implemented**. The Games tile must
remain disabled until an end-to-end playable/verified port exists.
This is explicitly an **in-progress source engine**, not a completed
or playable second game. Unit coverage verifies source constants
and fundamental transitions.

Next: finish source ARE frame delay after line burn (retain lock
height), implement responsive original canvas projection, keyboard/
pointer input and animation loop, integrate audio and stats child
windows, then enable the game via shared app registry only after
functional Playwright acceptance. Never replace source code rules
with typical modern Tetris SRS or 7-bag random generator.


# Pinned Solitaire e202 + shared 5ea1 source rules — 17 November 2026

Legacy source pinned SHA `4e63290d783009e1293433c6ccf252abba9c1187`.
Read `src/modules/games/solitaire.js` webpack e202 and shared
`src/modules/chunks/shared~solitaire~spidersolitaire.js` webpack 5ea1.

Source model is Klondike: a 52-card deck, 7 tableau piles dealt
1..7 cards with just the final card exposed, stock remainder 24,
waste, 4 suit foundations, drag one card or a descending
alternating-red/black face-up tableau run. Foundation accepts one
Ace or one higher same-suit card; tableau accepts King on empty,
otherwise one lower alternating-color card. A click-to-auto
target attempts foundations first unless source is foundation,
then eligible tableaus, skipping a redundant whole exposed
tableau-to-empty-tableau move.

Original stock deals 3 by default (or 1 by preference). An
empty stock recycles waste in reverse order and charges -20 for
draw 3 or -100 for draw 1, clamped at score 0. Source score
constants: flip +5, Waste→Tableau +5, Foundation +10,
Foundation→Tableau -15, every 10 seconds -2. Undo is a capped
50-state snapshot of game board plus score but does NOT rewind
the elapsed timer. Change Draw One/Three starts a new game.
Win occurs when every foundation has 13 cards.

Reusable `sourceCards.ts` holds the original shared card shape,
last-card and alternating-color helpers; `sourceSolitaire.ts`
implements the source model and transitions as a pure engine,
with deterministic Vitest tests. Both are independent of the
future card UI/drag renderer so Spider Solitaire can reuse them.
**The original ec2b suit ordering and 2f7e deck shuffle still
need source tracing:** this first-pass default suit order and
Fisher–Yates RNG are explicit adapters, not verified matching
shuffle bitstreams. No card image or sound has been imported
for Solitaire in this slice, and the Solitaire Games tile stays
disabled. Do not claim Solitaire is playable, visually matched,
or accepted by Tetris-only CI #43945990957. A future Solitaire
package must port source card sprites/appearance preferences,
pile rendering/geometry, drag behavior, sound and parented
Help/Statistics/Appearance child windows, card win animation,
and tests before the tile is enabled.


## Shared 0510 card drag/drop behavior — 17 November 2026

Traced `src/modules/chunks/shared~solitaire~spidersolitaire.js`,
webpack 0510/5ea1. Source `startCardDrag` ignores non-primary
mousedown, saves start screen and board offsets, then promotes
a pending click into a drag after a **4px move on either axis**
(not a 4px radial distance). A pending mouseup invokes
click-to-auto-placement; dragged mouseup drops onto the legal
zone with maximum **positive rectangle overlap** (first
zone wins ties), or plays Drop if none. Board-relative pointer
geometry corrects for CSS scale by
`(clientX - bounds.left)/(bounds.width/offsetWidth)`.
Shared `sourceCardDrag.ts` ports these as pure functions,
with deterministic tests, ready for both Solitaire and Spider.

This is deliberately not yet wired to a Solitaire board window;
do not claim card dragging exists or that the Solitaire tile is
playable. The upcoming UI must call these rather than invent
distance/nearest-center/touch heuristics.

---

## Klondike e202 original sprite, pile layout and CSS — 17 November 2026

Decoded pinned source `cards-spritesheet.f136d9d3.webp`:
**949×490 pixels** = **13×5** exact source cells of **73×98**.
Visual source verifies four ordered suit rows clubs, diamonds,
hearts, spades; final row has three card backs and an empty-slot
marker in columns 0,1,2,3. Source 5ea1 CSS references this sheet
and applies `round(width*98/73)` card height, 13×5 scaled
background size and rank/suit or back/empty cell offsets.
`sourceCardArtwork.ts` recreates these calculations.

`sourceSolitaireLayout.ts` ports e202 board geometry:
7 columns, 0.14-width gaps, width clamped 40–96, 0.28-height
vertical tableau gap, 0.09-height face-down and 0.2-height
face-up offsets, scaled down if stacks overflow available height.
Stock, waste, four foundations and seven tableau rectangles are
computed as the original. Deterministic tests check sprite
positions, 660×500 geometry and mobile stack compression.

Also preserved original `src/styles/games/solitaire.css` and
`src/styles/games/shared~solitaire~spidersolitaire.css`
byte-for-byte in `migration/source-css`; the source audit now
checks both Git blob hashes. No replacement artwork or generic
card CSS is claimed equal to source. The playable Solitaire
UI and its source-accurate drag interactions are still pending.

---

## Shared card art and exact 2f7e shuffle — 17 November 2026

Source tracing `src/modules/chunks/shared~solitaire~spidersolitaire.js`
verified webpack module 2f7e uses standard Fisher–Yates swapping
from the final card to the first, selecting index
`Math.floor(Math.random()*(i+1))` and returning a copied array.
`sourceCardsDeck` uses the same shuffle and allows injected
deterministic RNG for tests. Source ec2b suit order remains
to be confirmed and must not be claimed byte-parity.

Imported 10 original shared card assets by copying exact original
Git blobs from pinned legacy-win7, source and target SHA matched:
3 WebP images (`cards-spritesheet.f136d9d3.webp`,
`cards-bg-klondike.85b0dfcd.webp`,
`cards-bg-spider.48a00ea1.webp`) and 7 original
`cards-*.mp3` effects (complete, drop, fireworks, home,
pick, place, warning). They're exported as typed
`legacyCardArtwork` and `legacyCardAudio` in the reusable
assets package. Existing source audit SHA-checks every imported
WebP and MP3 against the pinned migration inventory. No card UI
or audio playback is claimed yet. The same assets can serve
Solitaire and Spider Solitaire without duplicate imports.

---

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


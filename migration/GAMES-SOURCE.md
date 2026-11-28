## Minesweeper parented source child window migration — 17 November 2026

Pinned `src/modules/games/minesweeper.js` webpack 245c has **three
sibling windows** in its root fragment: fixed main `WindowMain`
(`lock: result<0 || stats`), result `WindowMain`
(`id=window-minesweeper-result`, `parent=minesweeper`,
`centered:true`, `resizable:false`, `w=280`), and a static
statistics `WindowMainStatic` (`id=window-minesweeper-stats`,
`parent=minesweeper`). Both children have a native-looking titlebar
and WindowControls hiding maximize/minimize. The result's titlebar
Close calls `exitGame`; the stats titlebar Close calls `toggleStats`.

React's reusable `SourceChildWindow` now portals these child windows
to the desktop canvas as **separate window siblings**, reusing the
real shell Aero titlebar/buttons and preserving 280px result and
260px original statistics CSS width. The parent shell window's own
`data-test-window-id` determines which exact instance is locked
using `HTMLElement.inert`; other desktop applications remain usable.
The child hides with its minimized parent and restores with it.
The in-game reset-confirmation appears inside the statistics child,
and Escape/Tab are managed within each child. The titlebar
close action, replay, Exit, Close, and Reset controls retain their
functional behavior. The child never creates another taskbar entry.

No claim that React's child-window stacking, original Vue
`WindowMainStatic` animations, position offsets, or close-window
events have passed pixel parity. React portals are an explicit shell
adapter, not host OS windows. New browser tests verify separate
siblings, parent-instance linkage and inert lock/restore.

Latest accepted before this batch:
[Advanced CI #43876750158](https://github.com/codersachin99/windows-os/actions/runs/43876750158)
**454 browser tests / 507 Vitest tests passed** at exact SHA
`8fe240ca8b505cf2d39ea9ab75d024abceb2c075`.
[visual #43877288974](https://github.com/codersachin99/windows-os/actions/runs/43877288974)
collected **60/60 React-only scenes**, zero errors,
`sourceCaptured=0`, `parityStatus=not-assessed`.
This new child-window code needs independent opt-in verification.

---

## Advanced level fullscreen viewport contract — 16 November 2026

Pinned original `src/modules/games/minesweeper.js` 245c defines
`level===2` as `WindowMain fullscreen:true` but keeps
`resizable:false`. Its watcher measures `$refs.grid.scrollWidth`
and `scrollHeight` after `nextTick`, subtracts one from each
dimension, divides by **22px** (21px source cell + 1px gutter),
then computes `rows=floor(height/22)`, `cols=floor(width/22)`,
`mines=floor((width/22)*(height/22)/2)`. This is significantly
different from fixed Beginner 8×9/10 and Intermediate 12×12/30.

New React `sourceMineAdvancedOptions` preserves the exact source
arithmetic for normal viewports and bounds pathological tiny/huge
dimensions to the 9538 engine's valid nonempty <=20,000-cell domain.
`MinesweeperApp` requests a **game-specific fullscreen action**
from the shell; regular nonresizable WindowFrame maximize remains
disabled. After fullscreen layout is committed, a hidden measurement
plane tracks the source grid content-box area, then derives a real
board with the source generator. New Game in Advanced reuses the
selected dimensions, while selecting Beginner/Intermediate restores
fixed window geometry. Advanced statistics row is selectable.

**Source fidelity boundary:** exact original grid.scrollWidth may
differ from the current React measurement plane because React's
temporary accessory controls, titlebar and shell geometry are not
identical; this is a measured fullscreen adapter, **not accepted
original pixel parity**. No invented generic mine counts/preset or
resizable titlebar are introduced. Test viewport geometry in both
Chromium desktop and mobile, plus reducer/unit constraints.
This code is after accepted #43856185812 and needs a new opt-in
acceptance gate. Keep PR #1 draft and no main merge/release.

---

## Source Minesweeper CSS and sound — 16 November 2026

The original source CSS `src/styles/games/minesweeper.css` (blob
`51e624fd88af6940655c2cb98b433bbcd6754866`) was copied
byte-identically to `migration/source-css/minesweeper.css`. Source
245c draws the board on a cyan/navy gradient, with 45% opaque
closed tiles, pale-blue raised open tiles and **bottom** stats row
(timer icon, elapsed seconds, fixed mine count, mine icon).
React now applies those source values in locally scoped CSS. The
temporary face/restart and touch flag UI are moved into a separate
accessible adapter strip outside the source board. Original window
geometry and screenshot pairing remain outstanding.

Copied pinned source `minesweeper-new.60909dd9.mp3` and
`minesweeper-lose.b3b70bbb.mp3` with source=target Git blob hashes.
React plays original new-game music and loss SFX, catching blocked
browser autoplay. Source audit now hashes the imported audio bytes
against `migration/legacy-files.tsv`, as it already does for images.
No audio transcoding, substituted music or fake assets.

This CSS/audio work was committed after the deliberate result/stats
CI and needs independent verification before acceptance.

---

## Minesweeper 245c result and statistics lifecycle — 16 November 2026

Source-traced the original Vue 245c result and statistics branches
from pinned `src/modules/games/minesweeper.js` and the English source
strings in `assets/locales/en-US.json`:

- After a loss, original 245c exposes all mine cells and calls
  `gameStats.complete()`; after a safe-cell win it calls
  `gameStats.win()` and `saveScore({time:count,date:Date.now()})`.
  Both outcomes clear the timer and show the result child window
  **1,000 ms later**. React now reveals all mine sprites immediately,
  schedules the matching delayed result, and renders the original
  English text and **Exit / Play again** actions.
- The pinned original's `Game > Statistics` is an active item and
  opens a static child window with Beginner, Intermediate, Advanced
  rows, best-times listing, total games, wins and integer win
  percentage. React now implements this actual panel for the two
  currently supported levels, with persisted per-difficulty browser
  statistics, Cancel/Reset confirmation and Close.
- Browser statistics storage at
  `windows-os:minesweeper:guest:statistics:v1` is an **adaptation**,
  not an assertion that the original `e0b8` user account persistence
  byte format has been copied. Stats engine and reset behavior need
  original account-store trace before claiming full data parity.
  Advanced still cannot be selected in the playable React game.
- Result/stats are currently responsive **in-window overlays** rather
  than independent OS child-window instances. True window geometry,
  parent locking, source stat reset confirmation artwork, music/sfx,
  and original-versus-target pixel acceptance remain outstanding.

Browser tests cover deterministic lost gameplay, source-delay result
actions, statistics and reset; unit tests cover state transitions,
per-difficulty grouping, score order and invalid persisted data.
This commit is a functional expansion **after** successful original
Games artwork [CI #43838335106](https://github.com/codersachin99/windows-os/actions/runs/43838335106).
CI acceptance for this later code must be separately checked.

---

## Verified original Games/Minesweeper artwork — 16 November 2026

Restored eleven original WebP files from the exact pinned private
`legacy-win7@4e63290` Git blobs into the React public assets directory.
Each asset's source Git blob SHA was independently compared with the
newly uploaded target Git blob SHA; **all eleven matched exactly**.
The import uses the authenticated repository contents in Base64 rather
than attempting cross-repository object reuse.

Original virtual Games folder icon: `games.e71bd970.webp`.
Original c170 entries: `chess.92e3ebb6.webp`,
`mahjong.129fbf1a.webp`, `minesweeper.d2b56ae5.webp`,
`purbleplace.55ae3611.webp`, `solitaire.35c75495.webp`,
`spidersolitaire.2d281206.webp`, `tetris.7ea2464e.webp`.
Original Minesweeper sprite files:
`minesweeper-cell.a0c15d1c.webp`,
`minesweeper-mine.cbba8bd0.webp`,
`minesweeper-timer.663f9d44.webp`.

`legacySourceIconArtwork` now serves all eight Games icons without
generic-file fallback. The in-game covered-cell, opened-mine and timer/mine
markers use original source artwork while retaining the existing live React
game engine. Tests guard mapping and desktop/mobile rendered paths. The
source 245c's other UI, sound, stats dialog, result dialog, viewport
geometry and six missing game engines are **not** declared complete.
Original-vs-target pixel comparison remains **not assessed**; no
claim about the whole game's screenshot parity is made.

---

## First real game engine: Minesweeper source 9538/245c

The original `src/modules/games/minesweeper.js` contains a
standalone webpack **9538** board engine and a Vue **245c** game.
`packages/apps/games/src/minesweeper.ts` ports the actual source
engine (not a generic invented ruleset): rectangular 0/1 mine board
validation, Fisher–Yates mine layout, coordinates/8-neighbor counts,
cloned cell snapshots, CLOSED/OPEN states, NONE/EXCLAMATION/QUESTION
flag cycle, numbered-cell flood fill, LOST/WON board-state semantics.
The source `9538` Board.WON requires all covered mines correctly
flagged, whereas the outer `245c` game declares a win after all
**safe cells are open**. React preserves that separation.

`MinesweeperApp.tsx` supplies the actual playable native game:
source Beginner **8 rows × 9 columns, 10 mines**; Intermediate
**12×12, 30 mines**; source 21px square grid; restart, first-click
mine reroll, timer, right-click source flag cycling, source result
check, and Exit from Game menu. Specifically, the original `245c.open()`
starts its interval only if the board is **PRISTINE**. Flagging first
transitions `9538` to IN_PROGRESS; subsequent opening therefore
leaves the clock stopped in the original source. The React handler
now preserves this quirk using `sourceMineShouldStartTimer`, with
a focused unit test instead of silently starting a generic timer. A visible touch-flag toggle is an
**accessibility adapter** for mobile devices, not a claimed original
visual control. Original Advanced mode depends on measured
`scrollWidth/scrollHeight` at 21px+1 gutters, and remains
disabled until proper source viewport sizing is ported. Original
Statistics, sound effects/BGM, exact 21px WebP cell/mine/timer
artwork, face sprites, rich menus and source screenshot geometry
remain **pending**; interim neutral CSS/text is visibly not pixel
parity and uses no invented emoji artwork.

`minesweeper` is registered as an actual native `game` kind in
the shared AppRegistry; its tile in the Games library launches that
window while the other six tiles remain safely disabled. Unit tests
verify the board, source preset sizes, axes, adjacency, flags,
flood fill, win/loss and deterministic mine generator. Browser
tests check live gameplay, right-click and touch flag controls,
new game/difficulty/Exit and Games→Minesweeper lifecycle at desktop
and mobile sizes. Physical input and source audiovisual parity
have **not** been accepted yet.

**Validated functional checkpoint:** the combined
[opt-in CI #43814952314](https://github.com/codersachin99/windows-os/actions/runs/43814952314)
on exact SHA `760fa39a1246d3cb164c2b690157bb6820301967`
completed **SUCCESS: 450 / 450 desktop+mobile Chromium tests**,
TypeScript, all Vitest units, original source/Contacts audits and
Vite build. This validates the initial Games virtual shell pane and
Minesweeper's core beginner/intermediate gameplay, including
the real Games→Minesweeper launch, but it does **not** prove visual
or complete feature parity. The later source PRISTINE-only timer
fix and mobile Intermediate final-row scroll assertion were
committed **after** the successful CI snapshot and require another
deliberate opt-in checkpoint.

# Pinned Games shell:games library — React first slice

Original source revision:
`codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`.

## Source contract

- `src/modules/apps/games.js` webpack **24d9** renders the existing
  `computer` component with `id="games"` and
  `hoistedPath=explorer.getGamesPath()`. This is a *virtual Computer*
  location, not a standalone fake game portal.
- The pinned `src/modules/chunks/shared~plugin-embed~sandbox~system-cache~vue-app~vue-store.js`
  webpack **5401** declares special folder
  `Games: {path:"shell:games",icon:"games",label:"games"}`.
  `getGamesPath()` returns exactly that path.
  It is **not** the physical
  `%APPDATA%/WindowsOS/Windows/Start Menu/Programs/Games` directory
  populated with .lnk shortcuts. Mixing those two sources would break
  original navigation and source search.
- `src/modules/apps/computer.js` renders
  `computer__pane-games` when the active location is `shell:games`.
  It uses two `collapse-list` components and `listview-main
  viewMode="tiles"`: **Games** with offline entries and **Online
  games**. In the pinned browser source `onlineGames` is explicitly
  reset to `[]` following its optional network load. Thus there are
  no pinned online game tiles to claim.
- The pinned **c170** installed program manifest contains seven local
  game entries: Chess Titans, Mahjong Titans, Minesweeper, Purble Place,
  Solitaire, Spider Solitaire and Classic Tetris. Original publishers
  are retained, including Albert Lobo for Classic Tetris. The source
  `computer.js` disables the normal Organize/View toolbar for the
  virtual Games folder.

## Implemented first slice

- `packages/apps/games/src/model.ts` carries
  `SOURCE_GAMES_PATH="shell:games"` and reads the pinned c170
  manifest, without interpreting synthetic Guest `.exe` files as
  implemented games.
- `packages/apps/games/src/GamesApp.tsx` renders an in-window
  virtual Games pane with both collapsible groups and shared
  `SourceListView variant="tiles"`. The online group is empty,
  and its toolbar is disabled, as in the source.
- `games` is now registered in the shared `AppRegistry` and
  `DesktopShell`, with the Start-menu right-column **Games**
  launch (present in original WinXP/Win10 source menu definitions).
  This avoids duplicating the filesystem engine or mapping
  `shell:games` to an unrelated Guest Start-menu folder.
- Entries only activate when a real React game has been registered.
  **Minesweeper** now has an actual React board/gameplay implementation
  registered under `minesweeper`. The other **six** original game
  runtimes remain unported and their entries are disabled with a
  truthful tooltip. Installed source `.exe` stubs are not mistaken for
  playable engines. The app/game distinction remains modular.
- SSR/unit tests verify the virtual URI, exact seven manifest
  entries and publishers, empty online pane, and unavailable action
  state when no runtime callback is supplied. Paired desktop/mobile
  Playwright cases open the Games window from Start in Win7 and XP,
  check catalog and collapse actions, activate the real Minesweeper
  window, and check absence of borrowed Win7 sprite in XP.

## Outstanding parity and acceptance

The original Games library is **partially implemented only**. Full
`computer.js` shell navigation, original `collapse-list` CSS,
game icons, online catalog dynamics, original exact game icon bytes,
and alternate skin visual acceptance are still pending. The original
source images `games.e71bd970.webp`, `chess.92e3ebb6.webp`,
`mahjong.129fbf1a.webp`, `minesweeper.d2b56ae5.webp`,
`purbleplace.55ae3611.webp`, `solitaire.35c75495.webp`,
`spidersolitaire.2d281206.webp`, and `tetris.7ea2464e.webp`
are tracked source dependencies, **not yet imported in the target**.
The current source icon adapter consequently uses its established
generic fallback; this is **not** visual parity.

Complete gameplay in `src/modules/games/{chess,mahjong,
purbleplace,solitaire,spidersolitaire,tetris}.js` remains **pending**.
The separate `minesweeper.js` engine/UI slice is implemented below,
but is still short of full source feature, audio, artwork and screenshot
parity.
Do not label this library first slice a finished game implementation.

The Games work is **after** the exact SHA under
[CI #43813132144](https://github.com/codersachin99/windows-os/actions/runs/43813132144)
and must be validated in a later opted-in `[run-ci]` checkpoint.
Keep PR #1 draft, main unchanged, no release.

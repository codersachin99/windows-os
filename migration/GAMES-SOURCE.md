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
check, and Exit from Game menu. A visible touch-flag toggle is an
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

**Verification boundary:** this feature was added after CI
#43813132144's exact snapshot, and requires a fresh opted-in
combined TypeScript/unit/build/Chromium batch. Neither the initial
Games library nor the Minesweeper board/UI should be called
CI-accepted until that run completes.

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

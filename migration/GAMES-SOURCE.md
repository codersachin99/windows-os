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
  **Currently none of the seven game runtimes is ported**, so each
  entry is disabled with a truthful tooltip, rather than opening a
  fake game, performing host execution or claiming working gameplay.
  The app/game distinction remains modular.
- SSR/unit tests verify the virtual URI, exact seven manifest
  entries and publishers, empty online pane, and unavailable action
  state. Paired desktop/mobile Playwright cases open the Games window
  from Start in Win7 and XP, check catalog, collapse actions and
  absence of borrowed Win7 sprite in XP.

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

Gameplay in `src/modules/games/{chess,mahjong,minesweeper,
purbleplace,solitaire,spidersolitaire,tetris}.js` remains **pending**.
Do not label this library first slice a finished game implementation.

The Games work is **after** the exact SHA under
[CI #43813132144](https://github.com/codersachin99/windows-os/actions/runs/43813132144)
and must be validated in a later opted-in `[run-ci]` checkpoint.
Keep PR #1 draft, main unchanged, no release.

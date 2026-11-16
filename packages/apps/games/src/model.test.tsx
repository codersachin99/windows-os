import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {sourceProgramsById} from "@windows-os/filesystem";
import {GamesApp} from "./GamesApp";
import {SOURCE_GAMES_PATH,SOURCE_ONLINE_GAMES,sourceOfflineGames} from "./model";

describe("pinned source 24d9 Games/5401 shell:games",()=>{
  it("keeps virtual shell URI distinct from installed Start Menu shortcuts",()=>{
    expect(SOURCE_GAMES_PATH).toBe("shell:games");
    expect(SOURCE_GAMES_PATH).not.toContain("Start Menu");
    expect(sourceProgramsById.get("games")?.hidden).toBe(true);
  });
  it("renders seven c170-installed original games in manifest order",()=>{
    const games=sourceOfflineGames();
    expect(games.map(g=>g.id)).toEqual([
      "chess","mahjong","minesweeper","purbleplace",
      "solitaire","spidersolitaire","tetris"
    ]);
    expect(games.every(game=>game.publisher==="Microsoft Corporation"||
      game.publisher.length===0)).toBe(true);
    expect(games.every(game=>game.available===false)).toBe(true);
    expect(sourceOfflineGames(id=>id==="minesweeper")
      .find(game=>game.id==="minesweeper")?.available).toBe(true);
  });
  it("honors pinned computer.js pane-games intentionally empty online list",()=>{
    expect(SOURCE_ONLINE_GAMES).toHaveLength(0);
  });
  it("has source listview tile panels but disables unported game engines",()=>{
    const html=renderToStaticMarkup(<GamesApp theme="win7"/>);
    expect(html).toContain('data-source-path="shell:games"');
    expect(html).toContain('data-test-source-listview="offline-games"');
    expect(html).toContain('data-test-source-listview="online-games"');
    expect(html).toContain("Online games (0)");
    expect((html.match(/data-test-offline-game=/g)||[])).toHaveLength(7);
    expect((html.match(/title="Original game engine is not yet migrated"/g)||[]))
      .toHaveLength(7);
    expect(html).toContain('aria-label="Games history"');
  });
});

import {describe,it,expect} from "vitest";
import {legacyArt,legacyMineArtwork,legacySourceIconArtwork} from "./index";
/** Pinned exact Win7 theme image choices, never fallback glyph approximations. */
describe("source Windows 7 application icon assets",()=>{
  it("selects all seven original themed WebP icons",()=>{
    expect({
      camera:legacyArt.camera,recorder:legacyArt.recorder,photo:legacyArt.photo,
      ie:legacyArt.ie,chrome:legacyArt.chrome,snipping:legacyArt.snipping,
      player:legacyArt.player
    }).toEqual({
      camera:"/assets/images/camera.5e0b513d.webp",
      recorder:"/assets/images/recorder.519283f8.webp",
      photo:"/assets/images/photo.db6c5f81.webp",
      ie:"/assets/images/ie.66b8418d.webp",
      chrome:"/assets/images/chrome.0eddc17a.webp",
      snipping:"/assets/images/snipping.2c25345c.webp",
      player:"/assets/images/player.d45d301d.webp"
    });
  });
  it("routes each c170 Games entry through its pinned image rather than a file fallback",()=>{
    const games={
      games:"games.e71bd970",chess:"chess.92e3ebb6",
      mahjong:"mahjong.129fbf1a",minesweeper:"minesweeper.d2b56ae5",
      purbleplace:"purbleplace.55ae3611",solitaire:"solitaire.35c75495",
      spidersolitaire:"spidersolitaire.2d281206",tetris:"tetris.7ea2464e"
    };
    for(const [key,file] of Object.entries(games)){
      const src="/assets/images/"+file+".webp";
      expect(legacySourceIconArtwork(key)).toEqual({src,exactSourceArtwork:true});
    }
    expect(legacyMineArtwork).toEqual({
      cell:"/assets/images/minesweeper-cell.a0c15d1c.webp",
      mine:"/assets/images/minesweeper-mine.cbba8bd0.webp",
      timer:"/assets/images/minesweeper-timer.663f9d44.webp"
    });
  });
  it("uses byte-pinned original CMD artwork rather than the generic file fallback",()=>{
    expect(legacyArt.cmd).toBe("/assets/images/cmd.a2c1d19b.webp");
    expect(legacySourceIconArtwork("cmd")).toEqual({
      src:"/assets/images/cmd.a2c1d19b.webp",exactSourceArtwork:true
    });
  });
});

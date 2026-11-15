import {describe,it,expect} from "vitest";
import {legacyArt,legacySourceIconArtwork} from "./index";
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
  it("uses byte-pinned original CMD artwork rather than the generic file fallback",()=>{
    expect(legacyArt.cmd).toBe("/assets/images/cmd.a2c1d19b.webp");
    expect(legacySourceIconArtwork("cmd")).toEqual({
      src:"/assets/images/cmd.a2c1d19b.webp",exactSourceArtwork:true
    });
  });
});

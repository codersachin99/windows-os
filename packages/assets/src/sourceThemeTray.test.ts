import {describe,expect,it} from "vitest";
import {sourceThemeTrayArtwork,sourceThemeProgramArt} from "./index";
describe("source XP notification artwork from exact pinned Git blobs",()=>{
  it("selects source XP Action Center, Network and Battery independently",()=>{
    expect(sourceThemeTrayArtwork("winxp","TaskbarActionCenter"))
      .toBe("/assets/images/action-center-winxp.52f44912.webp");
    expect(sourceThemeTrayArtwork("winxp","TaskbarNetwork"))
      .toBe("/assets/images/network-winxp.744648d4.webp");
    expect(sourceThemeTrayArtwork("winxp","TaskbarBattery"))
      .toBe("/assets/images/battery-winxp.af8edd8a.webp");
  });
  it("retains honest fallback for unported variants and other themes",()=>{
    expect(sourceThemeTrayArtwork("winxp","TaskbarVolume")).toBeNull();
    expect(sourceThemeTrayArtwork("win11","TaskbarNetwork")).toBeNull();
    expect(sourceThemeTrayArtwork("win7","TaskbarActionCenter")).toBeNull();
    expect(sourceThemeTrayArtwork("winxp","unknown")).toBeNull();
  });
  it("registers pinned XP date/time settings icon without using it as clock",()=>{
    expect(sourceThemeProgramArt("winxp","datetime"))
      .toBe("/assets/images/datetime-winxp.d62f4ef6.webp");
  });
});

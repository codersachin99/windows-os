import {describe,it,expect} from "vitest";
import {legacyArt,legacyShellThemeAssets,legacyXpPowerArtwork,sourceShellAsset} from "./index";

describe("pinned source XP/Win11 shell artwork mapping",()=>{
  it("binds each source theme to its own immutable Start, Computer, empty and full Bin",()=>{
    for(const theme of ["winxp","win11"] as const){
      for(const kind of ["start","computer","bin","binFull","folder","file","theme"] as const){
        expect(sourceShellAsset(theme,kind)).toBe(legacyShellThemeAssets[theme][kind]);
        expect(sourceShellAsset(theme,kind)).toMatch(/^\/assets\/images\/.*\.webp$/);
      }
      expect(sourceShellAsset(theme,"binFull")).not.toBe(sourceShellAsset(theme,"bin"));
    }
  });
  it("never substitutes XP or Win11 artwork for the Win7 and other supported themes",()=>{
    for(const theme of ["win7","win10","winvista","win31","win95","win98","unknown"]){
      expect(sourceShellAsset(theme,"start")).toBeNull();
      expect(sourceShellAsset(theme,"computer")).toBeNull();
      expect(sourceShellAsset(theme,"bin")).toBeNull();
    }
    expect(legacyArt.startOrb).toBe("/assets/images/start-button.b35eae12.webp");
  });
  it("uses pinned XP logoff/shutdown artwork instead of generated icons",()=>{
    expect(legacyXpPowerArtwork.logoff).toMatch(/logoff-winxp\.71dc5ab2\.webp$/);
    expect(legacyXpPowerArtwork.shutdown).toMatch(/shutdown-winxp\.f3312ea0\.webp$/);
  });
});

import {describe,it,expect} from "vitest";
import {legacyArt,legacyShellThemeAssets,legacyXpPowerArtwork,sourceShellAsset,sourceThemeProgramArt,sourceThemeLogonArtwork} from "./index";

describe("pinned source XP/Win10/Win11 shell artwork mapping",()=>{
  it("binds each source theme to its own immutable Start, Computer, empty and full Bin",()=>{
    for(const theme of ["winxp","win11"] as const){
      for(const kind of ["start","computer","bin","binFull","folder","file","theme"] as const){
        expect(sourceShellAsset(theme,kind)).toBe(legacyShellThemeAssets[theme][kind]);
        expect(sourceShellAsset(theme,kind)).toMatch(/^\/assets\/images\/.*\.webp$/);
      }
      expect(sourceShellAsset(theme,"binFull")).not.toBe(sourceShellAsset(theme,"bin"));
    }
  });
  it("binds Win10 to the exact original shell icons rather than Win7 substitutes",()=>{
    const art=legacyShellThemeAssets.win10;
    expect(art.start).toBe("/assets/images/start-button-win8.2e5214cc.svg");
    expect(art.computer).toBe("/assets/images/computer-win10.2212df79.webp");
    expect(art.bin).toBe("/assets/images/bin-win10.e0f739cc.webp");
    expect(art.binFull).toBe("/assets/images/bin-full-win10.857c2cab.webp");
    expect(art.folder).toBe("/assets/images/folder-win10.294665f0.webp");
    expect(art.file).toBe("/assets/images/file-win10.036601ed.webp");
    expect(art.theme).toBe("/assets/images/win10.743e8c13.webp");
    for(const kind of ["start","computer","bin","binFull","folder","file","theme"] as const){
      expect(sourceShellAsset("win10",kind)).toBe(art[kind]);
    }
    expect(sourceShellAsset("win10","binFull")).not.toBe(sourceShellAsset("win10","bin"));
    expect(sourceThemeProgramArt("win10","computer")).toBe(art.computer);
    expect(sourceThemeProgramArt("win10","bin")).toBe(art.bin);
    expect(sourceThemeProgramArt("win10","games"))
      .toBe("/assets/images/games-win10.63f82076.webp");
    expect(sourceThemeProgramArt("win10","cpanel"))
      .toBe("/assets/images/cpanel-win10.d3d1d446.webp");
    expect(sourceThemeLogonArtwork.win10.background).toBe(art.theme);
    expect(sourceThemeProgramArt("win10","notepad")).toBeNull();
  });
  it("never substitutes source artwork for Win7 and unported shell themes",()=>{
    for(const theme of ["win7","winvista","win31","win95","win98","unknown"]){
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

describe("verified XP/Win11 installed program art",()=>{
  it("maps exactly the source theme images without leaking into Win7",()=>{
    for(const theme of ["winxp","win11"] as const){
      for(const key of ["notepad","games","cpanel","cmd"]){
        expect(sourceThemeProgramArt(theme,key)).toContain(key+"-"+theme+".");
      }
      expect(sourceThemeProgramArt(theme,"unported")).toBeNull();
    }
    expect(sourceThemeProgramArt("winxp","calc")).toContain("calc-winxp.");
    expect(sourceThemeProgramArt("win11","photo")).toContain("photo-win11.");
    expect(sourceThemeProgramArt("win7","notepad")).toBeNull();
  });
});


describe("byte-identical original WinXP/Win11 login artwork contracts",()=>{
  it("uses the source logo and guest-win10 avatar, not substitute theme icons",()=>{
    expect(sourceThemeLogonArtwork.winxp.logo)
      .toBe("/assets/images/logoxp.9b034658.png");
    expect(sourceThemeLogonArtwork.winxp.guest).toBe(legacyArt.guestAvatar);
    expect(sourceThemeLogonArtwork.win11.guest)
      .toBe("/assets/images/guest-win10.a110df5a.webp");
    expect(sourceThemeLogonArtwork.win11.background)
      .toBe(legacyShellThemeAssets.win11.theme);
    expect(sourceThemeLogonArtwork.win11.guest)
      .not.toBe(sourceThemeLogonArtwork.winxp.guest);
  });
});

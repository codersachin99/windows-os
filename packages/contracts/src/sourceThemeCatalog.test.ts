import {describe,expect,it} from "vitest";
import {
  SOURCE_THEME_CATALOG_IDS,SOURCE_THEME_SCREENS,SOURCE_XP_THEME_IDS,sourceIsXpFamily,
  SOURCE_AERO_THEME_IDS,sourceIsAeroFamily,
  SOURCE_THEME_SCREEN_DEFAULTS,sourceIsKnownTheme,
  sourceThemeScreens,sourceThemeShellStatus
} from "./sourceThemeCatalog";

describe("immutable final source app.config themeScreens",()=>{
  it("contains all 36 exact config keys and canonical Win7 without collapsing aliases",()=>{
    expect(Object.keys(SOURCE_THEME_SCREENS)).toHaveLength(36);
    expect(SOURCE_THEME_CATALOG_IDS).toHaveLength(37);
    expect(new Set(SOURCE_THEME_CATALOG_IDS).size).toBe(37);
    for(const id of ["base","aero-1","aero-4","basic-1","basic-4",
      "win31","win95","win98","win2k","winxp","winxpE","winxpG",
      "winxpN","winxpR","winxpS","winxpZ","winvista","win8","win81",
      "win10","win11","win11dark","macos","chromeos","ubuntu","kubuntu",
      "winLS","winLP","aeroNoir","oxygen","winW","onebit","win7"])
      expect(sourceIsKnownTheme(id),id).toBe(true);
  });
  it("retains original per-theme boot/logon screen variants and case",()=>{
    expect(sourceThemeScreens("win7")).toEqual({boot:"win7",logon:"win7"});
    expect(sourceThemeScreens("base")).toEqual({boot:"win7",logon:"win7"});
    expect(sourceThemeScreens("aero-4")).toEqual({boot:"win7",logon:"win7"});
    expect(sourceThemeScreens("winxpE")).toEqual({boot:"winxp",logon:"winxp"});
    expect(sourceThemeScreens("winxpZ")).toEqual({boot:"winxp",logon:"winxp"});
    expect(sourceThemeScreens("win81")).toEqual({boot:"win8",logon:"win8"});
    expect(sourceThemeScreens("win11dark")).toEqual({boot:"win11",logon:"win11"});
    expect(sourceThemeScreens("winLP")).toEqual({boot:"winLS",logon:"winLS"});
    expect(sourceThemeScreens("aeroNoir")).toEqual({boot:"aeroNoir",logon:"aeroNoir"});
    expect(sourceThemeScreens("onebit")).toEqual({boot:"onebit",logon:"onebit"});
    for(const id of Object.keys(SOURCE_THEME_SCREENS)){
      const screens=sourceThemeScreens(id);
      expect(screens.boot,id).toBeTruthy();
      expect(screens.logon,id).toBeTruthy();
    }
  });
  it("rejects invented or unsafe names and distinguishes unported skins",()=>{
    for(const id of ["","winXP","../winxp","win11/../../etc","foobar",
      "__proto__","toString","win7;alert(1)"]){
      expect(sourceIsKnownTheme(id),id).toBe(false);
      expect(sourceThemeScreens(id)).toEqual(SOURCE_THEME_SCREEN_DEFAULTS);
    }
    for(const theme of ["win31","win95","win98","win2k"]){
      expect(sourceThemeShellStatus(theme)).toBe("partial");
    }
    expect(sourceThemeShellStatus("win7")).toBe("partial");
    expect([...SOURCE_AERO_THEME_IDS]).toEqual(["aero-1","aero-2","aero-3","aero-4"]);
    for(const theme of SOURCE_AERO_THEME_IDS){
      expect(sourceIsAeroFamily(theme),theme).toBe(true);
      expect(sourceThemeShellStatus(theme),theme).toBe("partial");
      expect(sourceThemeScreens(theme)).toEqual({boot:"win7",logon:"win7"});
    }
    for(const theme of ["win7","aeroNoir","aero-5","basic-1","../aero-1"])
      expect(sourceIsAeroFamily(theme),theme).toBe(false);
    expect(sourceThemeShellStatus("basic-3")).toBe("partial");
    expect(sourceThemeShellStatus("basic-4")).toBe("partial");
    expect(sourceThemeShellStatus("basic-1")).toBe("partial");
    expect(sourceThemeShellStatus("basic-2")).toBe("partial");
    expect(sourceThemeShellStatus("winxp")).toBe("partial");
    expect([...SOURCE_XP_THEME_IDS]).toEqual([
      "winxp","winxpE","winxpG","winxpN","winxpR","winxpS","winxpZ"
    ]);
    for(const theme of SOURCE_XP_THEME_IDS){
      expect(sourceIsXpFamily(theme),theme).toBe(true);
      expect(sourceThemeShellStatus(theme),theme).toBe("partial");
    }
    for(const theme of ["winXP","winxpQ","../winxp","win7","win11"]){
      expect(sourceIsXpFamily(theme),theme).toBe(false);
    }
    expect(sourceThemeShellStatus("win8")).toBe("partial");
    expect(sourceThemeShellStatus("win81")).toBe("partial");
    expect(sourceThemeShellStatus("win10")).toBe("partial");
    expect(sourceThemeShellStatus("win11")).toBe("partial");
    expect(sourceThemeShellStatus("macos")).toBe("pending");
    expect(sourceThemeShellStatus("aeroNoir")).toBe("pending");
    expect(sourceThemeShellStatus("win11dark")).toBe("partial");
  });
});

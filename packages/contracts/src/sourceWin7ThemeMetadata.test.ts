import {describe,it,expect} from "vitest";
import {
 SOURCE_WIN7_THEME_METADATA,sourceWin7VariantMetadata,
 sourceWin7ThemeColor,sourceWin7ThemeChromeColors
} from "./sourceWin7ThemeMetadata";

describe("immutable 3b8c theme names and 2299 color indexes",()=>{
  it("keeps exactly four Aero and four Basic entries, names and category",()=>{
    expect(Object.keys(SOURCE_WIN7_THEME_METADATA)).toEqual([
      "aero-1","aero-2","aero-3","aero-4",
      "basic-1","basic-2","basic-3","basic-4"
    ]);
    expect(Object.values(SOURCE_WIN7_THEME_METADATA).map(x=>x.name)).toEqual([
      "Windows 7","Architecture","Landscape","Nature",
      "Windows 7 Basic","Windows Classic","High Contrast Black",
      "High Contrast White"
    ]);
    expect(Object.values(SOURCE_WIN7_THEME_METADATA).map(x=>x.background)).toEqual([
      null,"architecture","landscape","nature",null,
      "#3b6ea4","#000","#fff"
    ]);
    expect(Object.values(SOURCE_WIN7_THEME_METADATA).map(x=>x.color)).toEqual([
      "#aad1fb","#5986ca","#ababab","#9f81bf","#a7c0dc",
      null,null,null
    ]);
    expect(Object.values(SOURCE_WIN7_THEME_METADATA).map(x=>x.sound)).toEqual([
      "Windows Default","Cityscape","Landscape","Garden",
      "Windows Default","Windows Default","Windows Default","Windows Default"
    ]);
  });
  it("derives transparent active/idle variables only for Aero, opaque Basic1",()=>{
    expect(sourceWin7ThemeChromeColors("aero-1"))
      .toEqual({active:"rgba(170, 209, 251, 0.65)",
        inactive:"rgba(170, 209, 251, 0.3)"});
    expect(sourceWin7ThemeChromeColors("aero-2"))
      .toEqual({active:"rgba(89, 134, 202, 0.65)",
        inactive:"rgba(89, 134, 202, 0.3)"});
    expect(sourceWin7ThemeChromeColors("aero-3"))
      .toEqual({active:"rgba(171, 171, 171, 0.65)",
        inactive:"rgba(171, 171, 171, 0.3)"});
    expect(sourceWin7ThemeChromeColors("aero-4"))
      .toEqual({active:"rgba(159, 129, 191, 0.65)",
        inactive:"rgba(159, 129, 191, 0.3)"});
    expect(sourceWin7ThemeChromeColors("basic-1"))
      .toEqual({active:"#a7c0dc",inactive:null});
    for(const id of ["basic-2","basic-3","basic-4"])
      expect(sourceWin7ThemeChromeColors(id)).toBeNull();
  });
  it("rejects unknown IDs and prototype keys, including canonical Win7 alias",()=>{
    for(const id of ["","win7","aero-5","__proto__",
      "constructor","toString","../basic-2","basic-1!"]){
      expect(sourceWin7VariantMetadata(id)).toBeNull();
      expect(sourceWin7ThemeColor(id)).toBeNull();
      expect(sourceWin7ThemeChromeColors(id)).toBeNull();
    }
    expect(sourceWin7ThemeColor("aero-1")).toBe("#aad1fb");
    expect(sourceWin7ThemeColor("basic-1")).toBe("#a7c0dc");
  });
});

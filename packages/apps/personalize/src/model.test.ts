import {describe,it,expect} from "vitest";
import {
 SOURCE_PERSONALIZE_THEMES,SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS,
 sourcePersonalizeGroup
} from "./model";
import {
 sourceIsSystemWallpaper,sourceIsSolidThemeWallpaper,sourceShellWallpaper
} from "@windows-os/assets";
import {SOURCE_XP_THEME_IDS,SOURCE_WIN7_THEME_METADATA} from "@windows-os/contracts";

describe("original built-in source 3b8c registry and 2299 gallery",()=>{
 it("offers the exact four Aero and four Basic cards and 15 existing Windows cards",()=>{
   expect(SOURCE_PERSONALIZE_THEMES.map(x=>x.id)).toEqual([
     "aero-1","aero-2","aero-3","aero-4",
     "basic-1","basic-2","basic-3","basic-4",
     "win95","win98","win2k","winxp","winxpE","winxpG",
     "winxpN","winxpR","winxpS","winxpZ",
     "win8","win81","win10","win11","win11dark"
   ]);
   expect(sourcePersonalizeGroup("aero").map(x=>x.id))
     .toEqual(["aero-1","aero-2","aero-3","aero-4"]);
   expect(sourcePersonalizeGroup("basic").map(x=>x.id))
     .toEqual(["basic-1","basic-2","basic-3","basic-4"]);
   expect(sourcePersonalizeGroup("wins")).toHaveLength(15);
   expect(SOURCE_PERSONALIZE_THEMES.filter(x=>x.id.startsWith("winxp")).map(x=>x.id))
     .toEqual([...SOURCE_XP_THEME_IDS]);
 });
 it("uses source-metadata names and source wallpaper assets or solid colors",()=>{
   const ids=["aero-1","aero-2","aero-3","aero-4",
     "basic-1","basic-2","basic-3","basic-4"] as const;
   const previews=[
     "/assets/images/default.deccec52.webp",
     "/assets/images/architecture.e651db26.webp",
     "/assets/images/landscape.1626b82c.webp",
     "/assets/images/nature.e05e4ec0.webp",
     "/assets/images/default.deccec52.webp",
     "#3b6ea4","#000","#fff"
   ];
   expect(ids.map(id=>SOURCE_PERSONALIZE_THEMES.find(x=>x.id===id)?.label))
     .toEqual(ids.map(id=>SOURCE_WIN7_THEME_METADATA[id].name));
   expect(ids.map(id=>SOURCE_PERSONALIZE_THEMES.find(x=>x.id===id)?.preview))
     .toEqual(previews);
   expect(ids.map(id=>sourceShellWallpaper(id))).toEqual(previews);
   // Source canonical win7 direct URL still maps to its original default art.
   expect(sourceShellWallpaper("win7"))
     .toBe("/assets/images/default.deccec52.webp");
 });
});

describe("source ChangeBackground system gallery and solid theme defaults",()=>{
 it("exposes only byte-imported, whitelisted original wallpaper paths",()=>{
   expect(SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS).toEqual([
     "/assets/images/win95.fcef1b3b.webp",
     "/assets/images/default-win2k.1c1f7fa2.png",
     "/assets/images/default.deccec52.webp",
     "/assets/images/win7-1.5c44223b.webp",
     "/assets/images/win7-2.bf7d7452.webp",
     "/assets/images/win7-3.64168120.webp",
     "/assets/images/win7-4.53fed3fd.webp",
     "/assets/images/architecture.e651db26.webp",
     "/assets/images/landscape.1626b82c.webp",
     "/assets/images/nature.e05e4ec0.webp",
     "/assets/images/win8.3a5f11f3.webp",
     "/assets/images/win81.7b80787e.webp",
     "/assets/images/win10.743e8c13.webp",
     "/assets/images/winxp.3e41719f.webp",
     "/assets/images/win11.fc00c43d.webp",
     "/assets/images/win11dark.af52a1ca.webp"
   ]);
   expect(new Set(SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS).size)
     .toBe(SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS.length);
   for(const bg of SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS)
     expect(sourceIsSystemWallpaper(bg)).toBe(true);
   for(const unknown of ["https://example.com/x.webp",
     "javascript:alert(1)","/assets/images/missing.webp","data:image/png;base64,AAAA"])
     expect(sourceIsSystemWallpaper(unknown)).toBe(false);
 });
 it("accepts exact three solid Basic defaults but not arbitrary CSS inputs",()=>{
   for(const value of ["#3b6ea4","#000","#fff"])
     expect(sourceIsSolidThemeWallpaper(value)).toBe(true);
   for(const value of ["url(https://evil.test/x)","#ff0000","transparent",
     "#fff;opacity:0","https://example.com",""])
     expect(sourceIsSolidThemeWallpaper(value)).toBe(false);
 });
});

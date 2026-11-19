import {describe,it,expect} from "vitest";
import {SOURCE_PERSONALIZE_THEMES,SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS,
  sourcePersonalizeGroup} from "./model";
import {sourceIsSystemWallpaper} from "@windows-os/assets";
describe("source personalize.js ChangeTheme grouped first shell chooser",()=>{
  it("exposes six source-backed Windows personalities",()=>{
    expect(SOURCE_PERSONALIZE_THEMES.map(x=>x.id))
      .toEqual(["win7","winxp","win8","win81","win10","win11"]);
    expect(sourcePersonalizeGroup("aero").map(x=>x.id)).toEqual(["win7"]);
    expect(sourcePersonalizeGroup("wins").map(x=>x.id))
      .toEqual(["winxp","win8","win81","win10","win11"]);
  });
  it("theme cards display pinned original artwork, not generated substitutes",()=>{
    expect(SOURCE_PERSONALIZE_THEMES.map(x=>x.preview)).toEqual([
      "/assets/images/default.deccec52.webp",
      "/assets/images/winxp.3e41719f.webp",
      "/assets/images/win8.3a5f11f3.webp",
      "/assets/images/win81.7b80787e.webp",
      "/assets/images/win10.743e8c13.webp",
      "/assets/images/win11.fc00c43d.webp"
    ]);
  });
});

describe("source ChangeBackground imported system gallery",()=>{
  it("only exposes original pinned backgrounds already present as assets",()=>{
    expect(SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS).toEqual([
      "/assets/images/win95.fcef1b3b.webp",
      "/assets/images/default-win2k.1c1f7fa2.png",
      "/assets/images/default.deccec52.webp",
      "/assets/images/win7-1.5c44223b.webp",
      "/assets/images/win7-2.bf7d7452.webp",
      "/assets/images/win7-3.64168120.webp",
      "/assets/images/win7-4.53fed3fd.webp",
      "/assets/images/win8.3a5f11f3.webp",
      "/assets/images/win81.7b80787e.webp",
      "/assets/images/win10.743e8c13.webp",
      "/assets/images/winxp.3e41719f.webp",
      "/assets/images/win11.fc00c43d.webp"
    ]);
    expect(new Set(SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS).size)
      .toBe(SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS.length);
    for(const background of SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS)
      expect(sourceIsSystemWallpaper(background)).toBe(true);
    for(const uri of ["https://example.com/background.png","javascript:alert(1)",
      "/assets/images/missing.webp","data:image/png;base64,AAAA"])
      expect(sourceIsSystemWallpaper(uri)).toBe(false);
  });
});

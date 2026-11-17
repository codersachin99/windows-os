import {describe,it,expect} from "vitest";
import {SOURCE_PERSONALIZE_THEMES,sourcePersonalizeGroup} from "./model";
describe("source personalize.js ChangeTheme grouped first shell chooser",()=>{
  it("only exposes the three implemented original Windows theme IDs",()=>{
    expect(SOURCE_PERSONALIZE_THEMES.map(x=>x.id))
      .toEqual(["win7","winxp","win11"]);
    expect(sourcePersonalizeGroup("aero").map(x=>x.id)).toEqual(["win7"]);
    expect(sourcePersonalizeGroup("wins").map(x=>x.id))
      .toEqual(["winxp","win11"]);
  });
  it("theme cards display pinned original artwork, not generated substitutes",()=>{
    expect(SOURCE_PERSONALIZE_THEMES.map(x=>x.preview)).toEqual([
      "/assets/images/default.deccec52.webp",
      "/assets/images/winxp.3e41719f.webp",
      "/assets/images/win11.fc00c43d.webp"
    ]);
  });
});

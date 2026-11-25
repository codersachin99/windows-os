import {describe,it,expect} from "vitest";
import {sourceGuestVolume,sourceMacOSVolumeArt,sourceXPVolumeArt,sourceRetroVolumeArt,sourceOnebitVolumeArt} from "./sourceGuestAudio";
describe("original macOS volume artwork",()=>{
  it("uses exact threshold boundaries",()=>{
    for(const [volume,expected] of [[0,"0"],[31,"0"],[32,"32"],[64,"32"],[65,"65"],[99,"65"],[100,"100"]] as const)
      expect(sourceMacOSVolumeArt({volume,muted:false})).toContain("volume-"+expected+"-win10.");
    expect(sourceMacOSVolumeArt({volume:65,muted:true})).toContain("volume-muted-win10.");
  });
  it("normalizes the shared volume",()=>{
    expect(sourceGuestVolume(-1)).toBe(0);
    expect(sourceGuestVolume(101)).toBe(100);
    expect(sourceGuestVolume(64.9)).toBe(65);
    expect(sourceGuestVolume(NaN)).toBe(100);
  });
});

it("XP registry uses the same unmuted speaker at every threshold",()=>{
  for(const volume of [0,32,65,100])expect(sourceXPVolumeArt({volume,muted:false})).toBe("/assets/images/sound-winxp.1ff35c0e.webp");
  expect(sourceXPVolumeArt({volume:100,muted:true})).toBe("/assets/images/volume-muted-winxp.70d8b244.webp");
});

it("historical Windows uses the original 2000 speaker for every unmuted threshold",()=>{
  for(const volume of [0,32,65,100])expect(sourceRetroVolumeArt({volume,muted:false})).toBe("/assets/images/sound-win2k.6b4cee4c.webp");
  expect(sourceRetroVolumeArt({volume:100,muted:true})).toBe("/assets/images/sound-muted-win2k.c4df5325.png");
});

it("Onebit maps source thresholds to exact artwork",()=>{
  for(const value of [0,31,32,64])expect(sourceOnebitVolumeArt({volume:value,muted:false})).toContain("volume-0-onebit.");
  for(const value of [65,99])expect(sourceOnebitVolumeArt({volume:value,muted:false})).toContain("volume-1-onebit.");
  expect(sourceOnebitVolumeArt({volume:100,muted:false})).toContain("volume-onebit.");
  expect(sourceOnebitVolumeArt({volume:100,muted:true})).toContain("volume-off-onebit.");
});

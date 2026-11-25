import {describe,it,expect} from "vitest";
import {sourceGuestVolume,sourceMacOSVolumeArt,sourceXPVolumeArt,sourceRetroVolumeArt,sourceOnebitVolumeArt,sourceThemeVolumeArt} from "./sourceGuestAudio";
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

it("resolves frozen source icon-pack inheritance for base and override themes",()=>{
  const audio={volume:40,muted:false};
  for(const theme of ["win7","aero-1","aero-2","aero-3","aero-4","basic-1","basic-2","basic-3","basic-4","winvista","win8","win81","oxygen","aeroNoir"])
    expect(sourceThemeVolumeArt(theme,audio)).toBe("/assets/images/volume-32.1859a18f.webp");
  for(const theme of ["win10","win11","win11dark","macos","chromeos","ubuntu","kubuntu"])
    expect(sourceThemeVolumeArt(theme,audio)).toContain("volume-32-win10.");
  for(const theme of ["winLP","winLS","winW","winxpZ"])
    expect(sourceThemeVolumeArt(theme,audio)).toContain("sound-winxp.");
  for(const theme of ["win31","win95","win98","win2k"])
    expect(sourceThemeVolumeArt(theme,audio)).toContain("sound-win2k.");
  expect(sourceThemeVolumeArt("onebit",audio)).toContain("volume-0-onebit.");
  expect(sourceThemeVolumeArt("win7",{volume:0,muted:false})).toContain("volume-0.8c249580");
  expect(sourceThemeVolumeArt("win7",{volume:65,muted:false})).toContain("volume-65.bf0b7991");
  expect(sourceThemeVolumeArt("win7",{volume:100,muted:false})).toContain("volume-100.fb90d926");
  expect(sourceThemeVolumeArt("win7",{volume:100,muted:true})).toContain("volume-muted.e186b3c5");
});

import {describe,it,expect} from "vitest";
import {sourceGuestVolume,sourceMacOSVolumeArt} from "./sourceGuestAudio";
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

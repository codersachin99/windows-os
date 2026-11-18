import {describe,expect,it} from "vitest";
import {
  SOURCE_VISUAL_EFFECTS_KEY,SOURCE_DEFAULT_VISUAL_EFFECTS,
  sourceVisualEffectsPreset,sourceVisualEffectsToggle,
  sourceVisualEffectsRead,sourceVisualEffectsSave
} from "./sourceVisualEffects";

describe("source SystemPerformance Visual Effects (two supported original effects)",()=>{
  it("uses source auto defaults and appearance/performance/custom radio behavior",()=>{
    const initial={...SOURCE_DEFAULT_VISUAL_EFFECTS};
    expect(initial).toEqual({
      preset:"auto",enableGlass:true,showWindowShadows:true
    });
    const fast=sourceVisualEffectsPreset(initial,"performance");
    expect(fast).toEqual({
      preset:"performance",enableGlass:false,showWindowShadows:false
    });
    const custom=sourceVisualEffectsToggle(fast,"enableGlass",true);
    expect(custom).toEqual({
      preset:"custom",enableGlass:true,showWindowShadows:false
    });
    expect(sourceVisualEffectsToggle(custom,"showWindowShadows",true).preset)
      .toBe("custom");
    expect(sourceVisualEffectsPreset(custom,"custom")).toEqual(custom);
    expect(sourceVisualEffectsPreset(fast,"appearance")).toEqual({
      preset:"appearance",enableGlass:true,showWindowShadows:true
    });
    expect(sourceVisualEffectsPreset(fast,"auto")).toEqual(initial);
  });
  it("round-trips only known effects under the Guest preference key",()=>{
    const saved=new Map<string,string>();
    const storage={
      getItem:(key:string)=>saved.get(key)??null,
      setItem:(key:string,value:string)=>{saved.set(key,value);}
    };
    expect(sourceVisualEffectsRead(storage)).toEqual(
      SOURCE_DEFAULT_VISUAL_EFFECTS);
    const draft={preset:"custom" as const,enableGlass:false,
      showWindowShadows:true};
    expect(sourceVisualEffectsSave(storage,draft)).toBe(true);
    expect(saved.get(SOURCE_VISUAL_EFFECTS_KEY)).toBe(
      JSON.stringify(draft));
    expect(sourceVisualEffectsRead(storage)).toEqual(draft);
  });
  it("rejects corrupt, unexpected or unsafe storage without throwing",()=>{
    for(const raw of [
      "garbage","null","[]","{}",
      '{"preset":"invalid","enableGlass":true,"showWindowShadows":true}',
      '{"preset":"custom","enableGlass":"false","showWindowShadows":true}',
      '{"preset":"custom","enableGlass":false}'
    ]){
      expect(sourceVisualEffectsRead({getItem:()=>raw})).toEqual(
        SOURCE_DEFAULT_VISUAL_EFFECTS);
    }
    expect(sourceVisualEffectsRead({getItem:()=>{throw Error("blocked");}}))
      .toEqual(SOURCE_DEFAULT_VISUAL_EFFECTS);
    expect(sourceVisualEffectsSave({setItem:()=>{throw Error("blocked");}},
      {...SOURCE_DEFAULT_VISUAL_EFFECTS})).toBe(false);
  });
});

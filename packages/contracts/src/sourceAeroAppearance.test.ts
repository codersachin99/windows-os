import {describe,it,expect} from "vitest";
import {SOURCE_AERO_COLORS,SOURCE_AERO_APPEARANCE_KEY,
  sourceWin7ThemeChromeColors,sourceAeroAppearanceRead,
  sourceAeroAppearanceSave} from "./sourceWin7ThemeMetadata";

describe("pinned Aero ChangeAppearance",()=>{
  it("copies the exact source webpack 2299 32-color list",()=>{
    expect(SOURCE_AERO_COLORS).toEqual([
      "#aad1fb","#5986ca","#61d4d7","#6bc35b","#b3e165","#fcec8a",
      "#f0b85b","#d35352","#fb83cb","#fbd7f9","#9f81bf","#d9c8db",
      "#cbc2a5","#8c6a6b","#ababab","#e9e9e9","#ffb900","#f7630c",
      "#da3b01","#d13438","#e74856","#ea005e","#e3008c","#c239b3",
      "#0078d7","#8e8cd8","#8764b8","#b146c2","#0099bc","#00b7c3",
      "#00b294","#00cc6a"
    ]);
  });
  it("gates custom Aero color by transparency and enableGlass",()=>{
    const custom={color:"#d13438",transparent:true};
    expect(sourceWin7ThemeChromeColors("aero-2",custom))
      .toEqual({active:"rgba(209, 52, 56, 0.65)",
        inactive:"rgba(209, 52, 56, 0.3)"});
    expect(sourceWin7ThemeChromeColors("aero-2",{...custom,transparent:false}))
      .toEqual({active:"#d13438",inactive:"#d13438"});
    expect(sourceWin7ThemeChromeColors("aero-2",custom,false))
      .toEqual({active:"#d13438",inactive:"#d13438"});
    expect(sourceWin7ThemeChromeColors("basic-1",custom))
      .toEqual({active:"#a7c0dc",inactive:null});
    expect(sourceWin7ThemeChromeColors("aero-2",
      {color:"url(x)",transparent:true}))
      .toEqual({active:"rgba(89, 134, 202, 0.65)",
        inactive:"rgba(89, 134, 202, 0.3)"});
  });
  it("persists only whitelisted colors and Boolean transparency",()=>{
    const saved=new Map<string,string>();
    const storage={
      getItem:(key:string)=>saved.get(key)??null,
      setItem:(key:string,value:string)=>{saved.set(key,value);}
    };
    expect(sourceAeroAppearanceRead(storage))
      .toEqual({color:null,transparent:true});
    expect(sourceAeroAppearanceSave(storage,
      {color:"#d13438",transparent:false})).toBe(true);
    expect(sourceAeroAppearanceRead(storage))
      .toEqual({color:"#d13438",transparent:false});
    expect(sourceAeroAppearanceSave(storage,
      {color:"url(https://evil.test)",transparent:true})).toBe(false);
    saved.set(SOURCE_AERO_APPEARANCE_KEY,'{"color":"red","transparent":"no"}');
    expect(sourceAeroAppearanceRead(storage))
      .toEqual({color:null,transparent:true});
  });
});

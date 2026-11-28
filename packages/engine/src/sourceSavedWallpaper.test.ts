import {describe,expect,it} from "vitest";
import {sourceSystemWallpapers,sourceShellWallpaper} from "@windows-os/assets";
import {
  SOURCE_ACTIVE_WALLPAPER_KEY,sourceSavedWallpaper,
  desktopReducer,initialDesktopState
} from "./index";

const saved=(theme:string,path:string)=>JSON.stringify({theme,path});
const storage=(value:string|null)=>({getItem:(key:string)=>
  key===SOURCE_ACTIVE_WALLPAPER_KEY?value:null});

describe("source personalized Guest system-background storage",()=>{
  it("restores only byte-imported wallpaper paths for the matching theme",()=>{
    const image=sourceSystemWallpapers[1];
    expect(sourceSavedWallpaper(storage(saved("win7",image)),"win7")).toBe(image);
    expect(sourceSavedWallpaper(storage(saved("win7",image)),"winxp")).toBeNull();
    expect(sourceSavedWallpaper(storage(saved("winxp",image)),"winxp")).toBe(image);
  });
  it("does not restore corrupt, unknown, or unsafe backgrounds",()=>{
    for(const value of [
      null,"not-json","[]","null","{}",
      saved("win7","https://example.com/remote.png"),
      saved("win7","javascript:alert(1)"),
      saved("win7","/assets/images/nonexistent.webp")
    ])expect(sourceSavedWallpaper(storage(value),"win7")).toBeNull();
    expect(sourceSavedWallpaper({getItem(){throw Error("storage unavailable");}},"win7"))
      .toBeNull();
  });
  it("commits background independently, then changing theme resets it",()=>{
    const initial=initialDesktopState();
    const changed=desktopReducer(initial,{
      type:"SET_WALLPAPER",path:sourceSystemWallpapers[2]
    });
    expect(changed.wallpaper).toBe(sourceSystemWallpapers[2]);
    expect(changed.theme).toBe(initial.theme);
    const xp=desktopReducer(changed,{type:"SET_THEME",theme:"winxp"});
    expect(xp.wallpaper).toBe(sourceShellWallpaper("winxp"));
    expect(xp.theme).toBe("winxp");
  });
});

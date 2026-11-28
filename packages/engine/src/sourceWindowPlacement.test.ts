import {describe,it,expect} from "vitest";
import {sourceWindowPlacementKey,sourceRemembersPlacement,sourceReadWindowPlacements,sourceCaptureWindowPlacement,sourceApplyWindowPlacement,sourceWindowWorkAreaForTheme} from "./sourceWindowPlacement";
import {desktopReducer,initialDesktopState} from "./index";
import {appRegistry} from "@windows-os/sdk";
describe("frozen Guest placement registry e4c9",()=>{
  it("shares Explorer placement across instances",()=>{
    for(const id of ["computer","bin","games","computer__2"])expect(sourceWindowPlacementKey(id)).toBe("explorer");
    expect(sourceWindowPlacementKey("notepad__abc")).toBe("notepad");
  });
  it("excludes centered, explicit location and fullscreen windows",()=>{
    for(const id of ["run","about","tetris"])expect(sourceRemembersPlacement(appRegistry.get(id)!)).toBe(false);
    expect(sourceRemembersPlacement(appRegistry.get("computer")!)).toBe(true);
  });
  it("clamps saved bounds and retains fixed size",()=>{
    const p={x:900,y:700,width:700,height:500,maximized:true};
    expect(sourceApplyWindowPlacement(p,{width:320,height:240},true,{width:500,height:400})).toEqual({x:0,y:0,width:500,height:400,maximized:true});
    expect(sourceApplyWindowPlacement(p,{width:320,height:240},false,{width:500,height:400})).toEqual({x:180,y:160,width:320,height:240,maximized:false});
  });
  it("rejects corrupt storage and malformed entries",()=>{
    expect(sourceReadWindowPlacements({getItem:()=>"{oops"})).toEqual({});
    expect(sourceReadWindowPlacements({getItem:()=>JSON.stringify({bad:{x:-1,y:0,maximized:false},explorer:{x:20,y:30,maximized:false}})})).toEqual({explorer:{x:20,y:30,maximized:false}});
  });
  it("mirrors source work-area reservations for modern, classic and dock shells",()=>{
    const viewport={width:1000,height:750};
    expect(sourceWindowWorkAreaForTheme("win7",viewport)).toEqual({x:0,y:0,width:1000,height:710});
    expect(sourceWindowWorkAreaForTheme("win11",viewport)).toEqual({x:0,y:0,width:1000,height:702});
    expect(sourceWindowWorkAreaForTheme("chromeos",viewport)).toEqual({x:0,y:0,width:1000,height:702});
    expect(sourceWindowWorkAreaForTheme("win95",viewport)).toEqual({x:0,y:0,width:1000,height:714});
    expect(sourceWindowWorkAreaForTheme("macos",viewport)).toEqual({x:0,y:28,width:1000,height:648});
    expect(sourceWindowWorkAreaForTheme("ubuntu",viewport)).toEqual({x:64,y:32,width:936,height:718});
  });
  it("clamps persisted physical bounds above menus and to the right of docks",()=>{
    const saved={x:0,y:0,width:960,height:800,maximized:false};
    expect(sourceApplyWindowPlacement(saved,{width:760,height:490},true,
      sourceWindowWorkAreaForTheme("ubuntu",{width:1000,height:750})))
      .toEqual({x:64,y:32,width:936,height:718,maximized:false});
    expect(sourceApplyWindowPlacement(saved,{width:760,height:490},true,
      sourceWindowWorkAreaForTheme("macos",{width:1000,height:750})))
      .toEqual({x:0,y:28,width:960,height:648,maximized:false});
  });
  it("clamps ordinary window moves to the active themed workspace",()=>{
    const initial={...desktopReducer(initialDesktopState(),{type:"GUEST_LOGIN"}),theme:"ubuntu" as const};
    const opened=desktopReducer(initial,{type:"OPEN_APP",app:appRegistry.get("computer")!});
    const moved=desktopReducer(opened,{type:"MOVE_WINDOW",id:opened.windows[0].id,x:0,y:0});
    expect(moved.windows[0].x).toBe(64);
    expect(moved.windows[0].y).toBe(32);
  });
  it("stores completed resize and shares saved geometry on reopen",()=>{
    let state=desktopReducer(initialDesktopState(),{type:"GUEST_LOGIN"});
    state=desktopReducer(state,{type:"OPEN_APP",app:appRegistry.get("computer")!});
    const id=state.windows[0].id;
    state=desktopReducer(state,{type:"RESIZE_WINDOW",id,x:100,y:80,width:600,height:400});
    expect(state.windowPlacements?.explorer).toBeUndefined();
    state=desktopReducer(state,{type:"SAVE_WINDOW_PLACEMENT",id});
    expect(state.windowPlacements?.explorer).toEqual({x:100,y:80,width:600,height:400,maximized:false});
    state=desktopReducer(state,{type:"CLOSE_WINDOW",id});
    state=desktopReducer(state,{type:"OPEN_APP",app:appRegistry.get("bin")!});
    expect(state.windows[0]).toMatchObject({x:100,y:80,width:600,height:400});
    expect(sourceCaptureWindowPlacement({...state.windows[0],resizable:false})).toEqual({x:100,y:80,maximized:false});
    expect(sourceCaptureWindowPlacement({...state.windows[0],restoreBounds:{x:40,y:50,width:500,height:300},maximized:true})).toEqual({x:40,y:50,width:500,height:300,maximized:true});
  });
});

import {describe,it,expect} from "vitest";
import {sourceWindowPlacementKey,sourceRemembersPlacement,sourceReadWindowPlacements,sourceCaptureWindowPlacement,sourceApplyWindowPlacement} from "./sourceWindowPlacement";
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

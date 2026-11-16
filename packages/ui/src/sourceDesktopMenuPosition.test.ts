import {describe,expect,it} from "vitest";
import {sourceDesktopMenuPosition} from "./sourceDesktopMenuPosition";

describe("pinned main.js desktop context measured menu placement",()=>{
  const desktop={width:960,height:660};
  const popup={width:194,height:320};
  it("anchors to cursor if menu fits both axes",()=>{
    expect(sourceDesktopMenuPosition({x:30,y:60},popup,desktop))
      .toEqual({x:30,y:60});
  });
  it("flips to previous side when menu reaches the right/bottom edges",()=>{
    expect(sourceDesktopMenuPosition({x:900,y:620},popup,desktop))
      .toEqual({x:706,y:300});
  });
  it("remeasures nested popup height against original click anchor",()=>{
    expect(sourceDesktopMenuPosition({x:800,y:580},
      {width:194,height:450},desktop)).toEqual({x:606,y:130});
    expect(sourceDesktopMenuPosition({x:800,y:580},popup,desktop))
      .toEqual({x:606,y:260});
  });
  it("clamps oversized popups entirely inside narrow mobile desktop",()=>{
    expect(sourceDesktopMenuPosition({x:280,y:130},
      {width:420,height:700},{width:393,height:480}))
      .toEqual({x:0,y:0});
  });
});

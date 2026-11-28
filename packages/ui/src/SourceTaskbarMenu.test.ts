import {describe,expect,it} from "vitest";
import {sourceTaskbarPopupPosition,sourceTaskbarBackgroundPosition} from "./SourceTaskbarMenu";
describe("source taskbar item menu upward popup clamping",()=>{
  it("centers on taskbar button and stays above taskbar",()=>{
    expect(sourceTaskbarPopupPosition({x:150,y:700},
      {width:240,height:100},{width:1000,height:750})).toEqual({
        left:30,top:600
      });
  });
  it("clamps left/right and small screen top boundaries",()=>{
    expect(sourceTaskbarPopupPosition({x:0,y:48},
      {width:240,height:180},{width:300,height:250})).toEqual({
        left:4,top:4
      });
    expect(sourceTaskbarPopupPosition({x:295,y:240},
      {width:240,height:180},{width:300,height:250})).toEqual({
        left:56,top:60
      });
  });
});

describe("source taskbar background pointer placement",()=>{
  const size={width:240,height:180},viewport={width:1000,height:750};
  it("starts at pointer instead of centering",()=>{
    expect(sourceTaskbarBackgroundPosition({x:150,y:710},size,viewport)).toEqual({left:150,top:530});
  });
  it("flips left at the right edge",()=>{
    expect(sourceTaskbarBackgroundPosition({x:900,y:710},size,viewport)).toEqual({left:660,top:530});
  });
  it("clamps narrow and short viewports",()=>{
    expect(sourceTaskbarBackgroundPosition({x:120,y:80},size,{width:250,height:200})).toEqual({left:0,top:0});
  });
});

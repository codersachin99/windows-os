import {describe,expect,it} from "vitest";
import {sourceCascadingSubmenuPlacement} from "./sourceCascadingSubmenuPlacement";

describe("shared source BaseMenu cascade: Desktop, Explorer, Bin and apps",()=>{
  const child={width:194,height:132};
  const viewport={width:1366,height:768};
  it("opens the measured child to the right when the viewport has room",()=>{
    const placement=sourceCascadingSubmenuPlacement(
      {left:120,top:160,width:194,height:320},{top:210},child,viewport);
    expect(placement).toEqual({left:192,top:50,side:"right"});
  });
  it("flips left near the right screen edge without leaving the viewport",()=>{
    const parent={left:1150,top:140,width:194,height:320};
    const placement=sourceCascadingSubmenuPlacement(
      parent,{top:190},child,viewport);
    expect(placement).toEqual({left:-192,top:50,side:"left"});
    expect(parent.left+placement.left).toBeGreaterThanOrEqual(4);
    expect(parent.left+placement.left+child.width).toBeLessThanOrEqual(1366-4);
  });
  it("stacks below the parent on a narrow screen where neither side fits",()=>{
    const parent={left:8,top:120,width:194,height:200};
    const placement=sourceCascadingSubmenuPlacement(
      parent,{top:145},child,{width:360,height:720});
    expect(placement).toEqual({left:0,top:202,side:"right"});
    expect(parent.top+placement.top).toBeGreaterThanOrEqual(parent.top+parent.height);
  });
  it("clamps tall child vertically when trigger is near bottom",()=>{
    const parent={left:40,top:530,width:194,height:220};
    const placement=sourceCascadingSubmenuPlacement(
      parent,{top:720},{width:194,height:210},viewport);
    expect(placement.side).toBe("right");
    expect(parent.top+placement.top+210).toBeLessThanOrEqual(viewport.height-4);
  });
});

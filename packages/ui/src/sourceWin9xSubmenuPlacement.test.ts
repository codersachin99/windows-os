import {describe,expect,it} from "vitest";
import {sourceWin9xSubmenuPlacement} from "./sourceWin9xSubmenuPlacement";

const root={left:2,top:2,right:232,bottom:631};
describe("original classic Start cascading menu placement",()=>{
  it("keeps the source right-side cascade when room exists",()=>{
    const result=sourceWin9xSubmenuPlacement(
      {left:230,top:90,right:430,bottom:128},root,
      {width:224,height:288},{width:1024,height:768});
    expect(result).toMatchObject({direction:"right",left:428,top:90});
  });
  it("flips adjacent to the left before stacking on desktop",()=>{
    const result=sourceWin9xSubmenuPlacement(
      {left:500,top:100,right:700,bottom:138},root,
      {width:224,height:288},{width:720,height:768});
    expect(result).toMatchObject({direction:"left",left:278,top:100});
  });
  it("stacks fully below Programs when neither horizontal side fits",()=>{
    const trigger={left:27,top:80,right:228,bottom:118};
    const result=sourceWin9xSubmenuPlacement(trigger,root,
      {width:224,height:288},{width:375,height:667});
    expect(result).toMatchObject({direction:"below",left:149,top:120});
    expect(result.top).toBeGreaterThan(trigger.bottom);
    expect(result.top+result.maxHeight).toBeLessThanOrEqual(root.bottom);
  });
  it("stacks fully above Shutdown and preserves a clickable trigger",()=>{
    const trigger={left:27,top:550,right:228,bottom:588};
    const result=sourceWin9xSubmenuPlacement(trigger,root,
      {width:224,height:288},{width:375,height:667});
    expect(result.direction).toBe("above");
    expect(result.top+result.maxHeight).toBeLessThan(trigger.top);
    expect(result.top).toBeGreaterThanOrEqual(root.top);
  });
  it("reduces flyout height on a short phone without crossing the taskbar",()=>{
    const smallRoot={left:2,top:2,right:232,bottom:260};
    const trigger={left:27,top:90,right:228,bottom:128};
    const result=sourceWin9xSubmenuPlacement(trigger,smallRoot,
      {width:224,height:288},{width:320,height:300});
    expect(result.direction).toBe("below");
    expect(result.maxHeight).toBe(130);
    expect(result.top+result.maxHeight).toBe(260);
  });
});

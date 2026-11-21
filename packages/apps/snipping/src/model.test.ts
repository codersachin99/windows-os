import {describe,expect,it} from "vitest";
import {
  SOURCE_SNIP_MODES,SOURCE_SNIP_FILE_TYPES,SOURCE_SNIP_FILE_NAME,SOURCE_SNIP_MIN_SIZE,
  rectangularSnip,clampSnipRect,sourceSnipMime
} from "./model";
describe("pinned source snipping (331a)",()=>{
  it("retains original New dropdown order and disabled Free-form",()=>{
    expect(SOURCE_SNIP_MODES.map(m=>[m.id,m.enabled])).toEqual([
      ["free-form",false],["rectangular",true],["window",true],["full-screen",true]
    ]);
    expect(SOURCE_SNIP_FILE_NAME).toBe("Capture");
  });
  it("normalizes reverse drag, clips to viewport, rejects tiny snips",()=>{
    expect(rectangularSnip({x:220,y:150},{x:30,y:20},{width:400,height:200}))
      .toEqual({x:30,y:20,width:190,height:130});
    expect(rectangularSnip({x:-10,y:-10},{x:100,y:60},{width:80,height:50}))
      .toEqual({x:0,y:0,width:80,height:50});
    expect(rectangularSnip({x:5,y:5},{x:5+SOURCE_SNIP_MIN_SIZE-1,y:100},
      {width:500,height:500})).toBeNull();
    expect(rectangularSnip({x:10,y:10},{x:10,y:20},{width:100,height:100})).toBeNull();
  });
  it("clips window bounds at the desktop edge",()=>{
    expect(clampSnipRect({x:-15,y:10,width:200,height:100},{width:120,height:80}))
      .toEqual({x:0,y:10,width:120,height:70});
  });
  it("keeps source PNG/JPG formats with real encode MIME values",()=>{
    expect(SOURCE_SNIP_FILE_TYPES.map(x=>x.extension)).toEqual(["png","jpg"]);
    expect(sourceSnipMime("PNG")).toBe("image/png");
    expect(sourceSnipMime("jpg")).toBe("image/jpeg");
    expect(sourceSnipMime("exe")).toBeNull();
  });
});

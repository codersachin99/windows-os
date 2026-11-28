import {describe,expect,it} from "vitest";
import {sourceDragSnap,sourceSnapBounds,sourceDragRestoreBounds} from "./sourceWindowSnap";
describe("frozen window snapping",()=>{
  const area={x:0,y:0,width:1280,height:860},origin={x:100,y:80,width:600,height:400};
  it("detects mouse edges and prioritizes top",()=>{
    expect(sourceDragSnap(8,200,area)).toBe("left");
    expect(sourceDragSnap(1272,200,area)).toBe("right");
    expect(sourceDragSnap(0,8,area)).toBe("maximize");
    expect(sourceDragSnap(9,200,area)).toBeNull();
  });
  it("applies source touch margin and zoom",()=>{
    expect(sourceDragSnap(48,200,area,true)).toBe("left");
    expect(sourceDragSnap(25,200,area,true,2)).toBeNull();
    expect(sourceDragSnap(24,200,area,true,2)).toBe("left");
  });
  it("produces physical half-screen and vertical bounds",()=>{
    expect(sourceSnapBounds("left",area,origin)).toEqual({x:0,y:0,width:640,height:860});
    expect(sourceSnapBounds("right",area,origin)).toEqual({x:640,y:0,width:640,height:860});
    expect(sourceSnapBounds("vertical",area,origin)).toEqual({x:100,y:0,width:600,height:860});
  });
  it("keeps the pointer fraction on restore",()=>{
    expect(sourceDragRestoreBounds(origin,area,area,640,200,640,10)).toEqual({x:340,y:190,width:600,height:400});
  });
  it("clamps restored bounds to a smaller work area",()=>{
    expect(sourceDragRestoreBounds(origin,area,{x:64,y:32,width:256,height:200},0,0,640,10)).toEqual({x:64,y:32,width:256,height:200});
  });
});

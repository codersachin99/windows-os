import {describe,expect,it} from "vitest";
import {sourceDragSnap,sourceSnapBounds,sourceDragRestoreBounds,sourceKeyboardSnap,sourceVerticalResizeSnap,sourceShellPointerSpace} from "./sourceWindowSnap";
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

describe("source keyboard and vertical edge arrangement",()=>{
  it("cycles repeated directions and restores on the opposite direction",()=>{
    expect(sourceKeyboardSnap(undefined,"left")).toBe("left");
    expect(sourceKeyboardSnap("left","left")).toBe("right");
    expect(sourceKeyboardSnap("right","left")).toBeNull();
    expect(sourceKeyboardSnap("right","right")).toBe("left");
    expect(sourceKeyboardSnap("vertical","right")).toBe("right");
  });
  it("only triggers vertical snap on the two middle resize handles",()=>{
    const area={x:0,y:0,width:1280,height:860};
    expect(sourceVerticalResizeSnap("n",8,area)).toBe(true);
    expect(sourceVerticalResizeSnap("n",9,area)).toBe(false);
    expect(sourceVerticalResizeSnap("s",852,area)).toBe(true);
    expect(sourceVerticalResizeSnap("se",860,area)).toBe(false);
    expect(sourceVerticalResizeSnap("s",837,area,true,2)).toBe(true);
  });
});

describe("source fractional half-screen geometry",()=>{
  it("divides odd-width work areas equally without rounding or a seam",()=>{
    const area={x:64,y:32,width:1001,height:701};
    const origin={x:100,y:80,width:600,height:400};
    expect(sourceSnapBounds("left",area,origin)).toEqual({x:64,y:32,width:500.5,height:701});
    expect(sourceSnapBounds("right",area,origin)).toEqual({x:564.5,y:32,width:500.5,height:701});
  });
  it("uses reserved work-area edges for zoomed touch and mouse snapping",()=>{
    const area={x:64,y:32,width:1001,height:701};
    expect(sourceDragSnap(88,300,area,true,2)).toBe("left");
    expect(sourceDragSnap(89,300,area,true,2)).toBeNull();
    expect(sourceDragSnap(1041,300,area,true,2)).toBe("right");
    expect(sourceDragSnap(500,56,area,true,2)).toBe("maximize");
    expect(sourceVerticalResizeSnap("s",709,area,true,2)).toBe(true);
    expect(sourceVerticalResizeSnap("s",708,area,true,2)).toBe(false);
  });
});

describe("shell pointer coordinate space",()=>{
  it("uses the shell origin and scale independently of fractional window geometry",()=>{
    const shell={getBoundingClientRect:()=>({left:20,top:40,width:1500,height:900}),
      offsetWidth:1000,offsetHeight:600,clientLeft:0,clientTop:0} as unknown as HTMLElement;
    expect(sourceShellPointerSpace(shell)).toEqual({left:20,top:40,scaleX:1.5,scaleY:1.5});
  });
});

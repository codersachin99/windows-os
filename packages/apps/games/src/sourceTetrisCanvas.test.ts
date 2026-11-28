import {describe,it,expect} from "vitest";
import {
 sourceTetrisCanvasLayout,sourceTetrisGhostY,sourceTetrisCanPlace
} from "./sourceTetrisCanvas";
import {SourceTetrisEngine} from "./sourceTetris";

describe("pinned 13bc responsive Tetris canvas projection",()=>{
  it("uses exact source wide/narrow layout branches",()=>{
    const desktop=sourceTetrisCanvasLayout(1920,1080);
    expect(desktop.isWide).toBe(true);
    expect(desktop.side).toBe(51);
    expect(desktop.board).toEqual({x:705,y:30,width:510,height:1020});
    expect(desktop.boardY).toBe(desktop.board.y-2*desktop.side);
    const mobile=sourceTetrisCanvasLayout(393,915);
    expect(mobile.isWide).toBe(false);
    expect(mobile.side).toBe(35);
    expect(mobile.board.width).toBe(350);
    expect(mobile.next.y).toBeLessThan(mobile.board.y);
    expect(()=>sourceTetrisCanvasLayout(0,400)).toThrow("canvas size");
  });
  it("calculates original ghost until bottom or collision without mutating board",()=>{
    const engine=new SourceTetrisEngine(()=>0.5);
    engine.start();
    const state=engine.snapshot(),ghost=sourceTetrisGhostY(state);
    expect(ghost).toBeGreaterThan(state.position[1]);
    expect(sourceTetrisCanPlace(state,state.position[0],ghost)).toBe(true);
    expect(sourceTetrisCanPlace(state,state.position[0],ghost+1)).toBe(false);
    expect(sourceTetrisCanPlace(state,-100,ghost)).toBe(false);
    expect(engine.snapshot().position).toEqual(state.position);
  });
});

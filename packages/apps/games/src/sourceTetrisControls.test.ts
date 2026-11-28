import {describe,it,expect} from "vitest";
import {
  sourceTetrisKeyInput,sourceTetrisTapInput,sourceTetrisWheelInput,
  sourceTetrisPointerMoveInput
} from "./sourceTetrisControls";
import {SourceTetrisEngine} from "./sourceTetris";
import {sourceTetrisCanvasLayout} from "./sourceTetrisCanvas";

describe("pinned source Tetris 13bc input adapter",()=>{
  it("maps original keyboard aliases and ignores Space autorepeat",()=>{
    for(const code of ["ArrowLeft","KeyA"])
      expect(sourceTetrisKeyInput(code)).toEqual({left:true});
    for(const code of ["ArrowRight","KeyD"])
      expect(sourceTetrisKeyInput(code)).toEqual({right:true});
    for(const code of ["ArrowDown","KeyS"])
      expect(sourceTetrisKeyInput(code)).toEqual({down:true});
    for(const code of ["ArrowUp","KeyW","KeyX","KeyK"])
      expect(sourceTetrisKeyInput(code)).toEqual({clockwise:true});
    for(const code of ["KeyZ","KeyL"])
      expect(sourceTetrisKeyInput(code)).toEqual({counterClockwise:true});
    expect(sourceTetrisKeyInput("Space")).toEqual({hardDrop:true});
    expect(sourceTetrisKeyInput("Space",true)).toBeNull();
    expect(sourceTetrisKeyInput("KeyP")).toEqual({pause:true});
    expect(sourceTetrisKeyInput("Escape")).toEqual({pause:true});
    expect(sourceTetrisKeyInput("KeyQ")).toBeNull();
  });
  it("keeps source wheel direction and primary/right-click tap semantics",()=>{
    expect(sourceTetrisWheelInput(120)).toEqual({clockwise:true});
    expect(sourceTetrisWheelInput(-120)).toEqual({counterClockwise:true});
    expect(sourceTetrisWheelInput(0)).toBeNull();
    expect(sourceTetrisTapInput(0,10,500)).toEqual({clockwise:true});
    expect(sourceTetrisTapInput(2,0,30)).toEqual({counterClockwise:true});
    expect(sourceTetrisTapInput(0,11,30)).toBeNull();
    expect(sourceTetrisTapInput(0,1,501)).toBeNull();
  });
  it("tracks source piece bounds and down-enable across pointer dragging",()=>{
    const game=new SourceTetrisEngine(()=>0.5);game.start();
    const snapshot=game.snapshot(),layout=sourceTetrisCanvasLayout(1000,700);
    const side=layout.side;
    const left=sourceTetrisPointerMoveInput(snapshot,layout,
      layout.boardX,layout.boardY+side*1);
    expect(left.input.left).toBe(true);
    expect(left.downEnabled).toBe(true);
    const lower=sourceTetrisPointerMoveInput(snapshot,layout,
      layout.boardX+side*8,layout.boardY+side*18,left.downEnabled);
    expect(lower.input).toEqual({right:true,down:true});
    expect(lower.downEnabled).toBe(true);
    const fresh=sourceTetrisPointerMoveInput(snapshot,layout,
      layout.boardX+side*8,layout.boardY+side*18,false);
    expect(fresh.input.down).toBeUndefined();
  });
});

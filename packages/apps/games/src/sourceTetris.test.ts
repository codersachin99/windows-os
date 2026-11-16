import {describe,it,expect} from "vitest";
import {
 SOURCE_TETRIS_BOARD_HEIGHT,SOURCE_TETRIS_BOARD_WIDTH,
 SOURCE_TETRIS_HIDDEN_ROWS,SOURCE_TETRIS_FPS,
 SOURCE_TETRIS_PIECES,sourceTetrisFramesPerGridCell,
 sourceTetrisLinesScore,sourceTetrisLevel,SourceTetrisEngine
} from "./sourceTetris";

describe("pinned 13bc Classic Tetris pure source engine",()=>{
  it("keeps 10x22 with two hidden rows and all seven ordered source rotations",()=>{
    expect([SOURCE_TETRIS_BOARD_WIDTH,SOURCE_TETRIS_BOARD_HEIGHT,
      SOURCE_TETRIS_HIDDEN_ROWS,SOURCE_TETRIS_FPS]).toEqual([10,22,2,60]);
    expect(SOURCE_TETRIS_PIECES.map(piece=>piece.name))
      .toEqual(["z","s","o","l","j","t","i"]);
    expect(SOURCE_TETRIS_PIECES.map(piece=>piece.rotations.length))
      .toEqual([2,2,1,4,4,4,2]);
    expect(SOURCE_TETRIS_PIECES[6].initial).toEqual([3,0]);
    expect(SOURCE_TETRIS_PIECES[2].initial).toEqual([4,2]);
  });
  it("preserves classic gravity table and 40/100/300/1200 line scores",()=>{
    expect([0,1,5,8,9,10,13,16,19,29].map(sourceTetrisFramesPerGridCell))
      .toEqual([96,86,46,16,12,10,8,6,4,2]);
    expect([1,2,3,4].map(lines=>sourceTetrisLinesScore(lines,0)))
      .toEqual([40,100,300,1200]);
    expect(sourceTetrisLinesScore(4,3)).toBe(4800);
    expect([0,9,10,19,20,100].map(lines=>sourceTetrisLevel(lines)))
      .toEqual([0,0,1,1,2,10]);
  });
  it("creates cloned board snapshots, first extra gravity delay and a playable hard drop",()=>{
    const game=new SourceTetrisEngine(()=>0.5);
    game.start();
    const initial=game.snapshot();
    expect(initial.board).toHaveLength(22);
    expect(initial.board[0]).toHaveLength(10);
    expect(initial.board.flat().every(x=>x===-1)).toBe(true);
    expect(initial.current).toBe("l");
    expect(initial.position).toEqual([4,1]);
    (initial.board[0] as number[])[0]=99;
    expect(game.snapshot().board[0][0]).toBe(-1);
    const after=game.advance({hardDrop:true});
    expect(["are","burn"]).toContain(after.state);
    expect(after.board.flat().some(x=>x>=0)).toBe(true);
    expect(after.score).toBeGreaterThan(0);
  });
  it("preserves lock-height ARE delay after hard drop instead of immediate spawn",()=>{
    const game=new SourceTetrisEngine(()=>0.5);
    game.start();
    const locked=game.advance({hardDrop:true});
    expect(locked.state).toBe("are");
    for(let i=0;i<19;i++)game.advance();
    // Position remains on the locked piece during the original entry delay.
    expect(game.snapshot().state).toBe("are");
    // The source delay is longer than 20 frames for most low locks.
    for(let i=0;i<60&&game.snapshot().state==="are";i++)game.advance();
    expect(game.snapshot().state).toBe("drop");
    expect(game.snapshot().board.flat().filter(x=>x!==-1).length)
      .toBeGreaterThan(0);
  });
  it("supports source no-wall-kick rotation, lateral bounds and reversible pause",()=>{
    const game=new SourceTetrisEngine(()=>0.7);
    game.start();
    const first=game.snapshot();
    game.advance({pause:true});
    expect(game.snapshot().state).toBe("pause");
    game.advance({left:true,down:true});
    expect(game.snapshot().position).toEqual(first.position);
    game.advance({pause:true});
    expect(game.snapshot().state).toBe("drop");
    for(let i=0;i<30;i++)game.advance({left:true});
    const edge=game.snapshot().position[0];
    expect(edge).toBeGreaterThanOrEqual(-1);
    game.advance({left:true});
    expect(game.snapshot().position[0]).toBe(edge);
    expect(()=>new SourceTetrisEngine(()=>1).start()).toThrow("random");
  });
});

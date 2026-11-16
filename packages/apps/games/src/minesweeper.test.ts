import {describe,it,expect} from "vitest";
import {
  SourceMineBoard,sourceGenerateMineArray,sourceMineShouldStartTimer,
  sourceMineAdvancedOptions,SOURCE_MINE_BEGINNER,
  SOURCE_MINE_INTERMEDIATE,SOURCE_MINE_BOARD_STATE,
  SOURCE_MINE_CELL_STATE,SOURCE_MINE_CELL_FLAG
} from "./minesweeper";

describe("pinned minesweeper.js 9538 source Board",()=>{
  it("rejects jagged, empty and non-binary mine arrays",()=>{
    expect(()=>new SourceMineBoard([])).toThrow("not valid");
    expect(()=>new SourceMineBoard([[]])).toThrow("not valid");
    expect(()=>new SourceMineBoard([[0,1],[1]])).toThrow("not valid");
    expect(()=>new SourceMineBoard([[0,2]])).toThrow("not valid");
  });
  it("preserves source axis order and eight adjacent mine counts",()=>{
    const board=new SourceMineBoard([[1,0],[0,0]]);
    expect(board.numRows()).toBe(2);
    expect(board.numCols()).toBe(2);
    expect(board.numMines()).toBe(1);
    expect(board.state()).toBe(SOURCE_MINE_BOARD_STATE.PRISTINE);
    expect(board.cell(1,1)).toMatchObject({x:1,y:1,isMine:false,numAdjacentMines:1});
    expect(board.cell(0,0)?.isMine).toBe(true);
    expect(board.cell(-1,0)).toBeUndefined();
    expect(board.cell(2,0)).toBeUndefined();
  });
  it("copies visible cells, rather than leaking private mutable game state",()=>{
    const board=new SourceMineBoard([[0,1]]);
    const snapshot=board.cell(0,0);
    if(snapshot)Object.assign(snapshot,{isMine:true,state:1});
    expect(board.cell(0,0)?.isMine).toBe(false);
    expect(board.cell(0,0)?.state).toBe(SOURCE_MINE_CELL_STATE.CLOSED);
  });
  it("retains the original three-state flag cycle and flag blocks opening",()=>{
    const board=new SourceMineBoard([[1,0],[0,0]]);
    board.cycleCellFlag(0,0);
    expect(board.cell(0,0)?.flag).toBe(SOURCE_MINE_CELL_FLAG.EXCLAMATION);
    expect(board.state()).toBe(SOURCE_MINE_BOARD_STATE.IN_PROGRESS);
    board.openCell(0,0);
    expect(board.cell(0,0)?.state).toBe(SOURCE_MINE_CELL_STATE.CLOSED);
    board.cycleCellFlag(0,0);
    expect(board.cell(0,0)?.flag).toBe(SOURCE_MINE_CELL_FLAG.QUESTION);
    board.cycleCellFlag(0,0);
    expect(board.cell(0,0)?.flag).toBe(SOURCE_MINE_CELL_FLAG.NONE);
  });
  it("keeps source flood-fill from numbered safe clicks, and original flag-required Board WON",()=>{
    const board=new SourceMineBoard([[1,0],[0,0]]);
    board.openCell(1,1);
    expect(board.grid().flat().filter(cell=>cell.state===SOURCE_MINE_CELL_STATE.OPEN))
      .toHaveLength(3);
    // Original 9538 Board.WON requires flagging mines too. Vue's wrapper
    // separately decides when all safe cells are open.
    expect(board.state()).toBe(SOURCE_MINE_BOARD_STATE.IN_PROGRESS);
    board.cycleCellFlag(0,0);
    expect(board.state()).toBe(SOURCE_MINE_BOARD_STATE.WON);
    board.cycleCellFlag(0,0);
    expect(board.cell(0,0)?.flag).toBe(SOURCE_MINE_CELL_FLAG.EXCLAMATION);
  });
  it("loses upon opening a mine and rejects further flag/open mutations",()=>{
    const board=new SourceMineBoard([[1,0],[0,0]]);
    board.openCell(0,0);
    expect(board.state()).toBe(SOURCE_MINE_BOARD_STATE.LOST);
    board.openCell(1,1);
    board.cycleCellFlag(0,1);
    expect(board.cell(1,1)?.state).toBe(SOURCE_MINE_CELL_STATE.CLOSED);
    expect(board.cell(0,1)?.flag).toBe(SOURCE_MINE_CELL_FLAG.NONE);
  });
  it("uses source board sizes and deterministic Fisher-Yates mine generator",()=>{
    expect(SOURCE_MINE_BEGINNER).toEqual({rows:8,cols:9,mines:10});
    expect(SOURCE_MINE_INTERMEDIATE).toEqual({rows:12,cols:12,mines:30});
    const create=()=>sourceGenerateMineArray(SOURCE_MINE_BEGINNER,()=>0.5);
    const a=create(),b=create();
    expect(a).toEqual(b);
    expect(a).toHaveLength(8);
    expect(a.every(row=>row.length===9)).toBe(true);
    expect(a.flat().filter(x=>x===1)).toHaveLength(10);
    expect(new SourceMineBoard(a).numMines()).toBe(10);
  });
  it("follows source 245c pristine-only timer, even after flag before reveal",()=>{
    const board=new SourceMineBoard([[1,0],[0,0]]);
    expect(sourceMineShouldStartTimer(board.state())).toBe(true);
    board.cycleCellFlag(0,0);
    expect(sourceMineShouldStartTimer(board.state())).toBe(false);
    board.openCell(1,1);
    expect(sourceMineShouldStartTimer(board.state())).toBe(false);
    expect(sourceMineShouldStartTimer(SOURCE_MINE_BOARD_STATE.WON)).toBe(false);
    expect(sourceMineShouldStartTimer(SOURCE_MINE_BOARD_STATE.LOST)).toBe(false);
  });
});

describe("pinned source 245c Advanced viewport sizing",()=>{
  it("uses original 22px gutter/21px tile and continuous mine density math",()=>{
    expect(sourceMineAdvancedOptions(220,176)).toEqual({rows:7,cols:9,mines:39});
    expect(sourceMineAdvancedOptions(398,398)).toEqual({rows:18,cols:18,mines:162});
    expect(sourceMineAdvancedOptions(595,485)).toEqual({rows:22,cols:27,mines:297});
  });
  it("bounds impossible host viewport sizes without changing normal source math",()=>{
    const tiny=sourceMineAdvancedOptions(1,1);
    expect(tiny).toEqual({rows:2,cols:2,mines:1});
    const wide=sourceMineAdvancedOptions(16000,9000);
    expect(wide.rows*wide.cols).toBeLessThanOrEqual(20000);
    expect(wide.mines).toBeGreaterThan(0);
    expect(wide.mines).toBeLessThan(wide.rows*wide.cols);
    expect(()=>sourceMineAdvancedOptions(NaN,100)).toThrow("viewport");
  });
});

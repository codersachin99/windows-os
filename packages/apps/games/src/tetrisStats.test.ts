import {describe,it,expect} from "vitest";
import {
 emptyTetrisStats,sourceTetrisStarted,sourceTetrisFinished
} from "./tetrisStats";
describe("Tetris per-Guest browser statistics adapter",()=>{
  it("records game start and sorts completed highscores",()=>{
    const base=emptyTetrisStats(),first=sourceTetrisStarted(base);
    const won=sourceTetrisFinished(first,{level:0,score:100,lines:1});
    const later=sourceTetrisFinished(sourceTetrisStarted(won),
      {level:1,score:500,lines:3});
    expect(base.total).toBe(0);
    expect(later).toEqual({total:2,completed:2,scores:[
      {level:1,score:500,lines:3},{level:0,score:100,lines:1}]});
  });
});

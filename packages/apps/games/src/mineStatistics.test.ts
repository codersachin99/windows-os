import {describe,it,expect} from "vitest";
import {
  emptyMineStatistics,parseMineStatistics,sourceMineRoundStarted,
  sourceMineRoundWon,sourceMineWinPercentage
} from "./mineStatistics";

describe("source 245c per-difficulty game statistics browser adapter",()=>{
  it("tracks start at PRISTINE reveal and wins with best-time ordering",()=>{
    const base=emptyMineStatistics();
    const begun=sourceMineRoundStarted(base,0);
    const won=sourceMineRoundWon(begun,0,25,1000000);
    const later=sourceMineRoundWon(sourceMineRoundStarted(won,0),0,12,1100000);
    expect(base[0].total).toBe(0);
    expect(later[0]).toEqual({
      total:2,won:2,
      scores:[{time:12,date:1100000},{time:25,date:1000000}]
    });
    expect(later[1].total).toBe(0);
    expect(later[2].won).toBe(0);
    expect(sourceMineWinPercentage(later[0])).toBe("100%");
  });
  it("records lost games as started but not won, and resets all difficulty levels",()=>{
    const data=sourceMineRoundStarted(emptyMineStatistics(),1);
    expect(data[1]).toEqual({total:1,won:0,scores:[]});
    expect(sourceMineWinPercentage(data[1])).toBe("0%");
    expect(emptyMineStatistics()[1].total).toBe(0);
  });
  it("roundtrips valid browser storage and rejects malformed or abusive input",()=>{
    const data=sourceMineRoundWon(sourceMineRoundStarted(emptyMineStatistics(),0),0,4,12345);
    expect(parseMineStatistics(JSON.stringify(data))).toEqual(data);
    expect(parseMineStatistics("{")).toEqual(emptyMineStatistics());
    expect(parseMineStatistics(JSON.stringify({"0":{total:5,won:6,scores:[]}}))[0])
      .toEqual({total:0,won:0,scores:[]});
    expect(parseMineStatistics(JSON.stringify({"0":{
      total:1,won:1,scores:[{time:-1,date:0},{time:2,date:1234}]
    }}))[0].scores).toEqual([{time:2,date:1234}]);
    expect(()=>sourceMineRoundWon(data,0,-1,0)).toThrow("Invalid Minesweeper score");
  });
});

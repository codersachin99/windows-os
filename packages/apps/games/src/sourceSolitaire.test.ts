import {describe,it,expect} from "vitest";
import {
  SOURCE_SOLITAIRE_SCORE,SOURCE_SOLITAIRE_HISTORY_LIMIT,
  SourceSolitaireEngine,sourceSolitaireCanDrop,sourceSolitaireMovableRun,
  sourceSolitaireAutoTarget,sourceSolitaireWon,sourceSolitaireDeal
} from "./sourceSolitaire";
import {sourceCardsDeck,type SourceCard} from "./sourceCards";

const card=(suit:SourceCard["suit"],rank:number,faceUp=true):SourceCard=>({
  id:`${suit}-${rank}-0`,suit,rank,faceUp
});
const state=()=>({
  stock:[] as SourceCard[],
  waste:[] as SourceCard[],
  foundations:[[],[],[],[]] as SourceCard[][],
  tableau:[[],[],[],[],[],[],[]] as SourceCard[][]
});
describe("pinned e202 Solitaire card rules and scoring",()=>{
  it("deals source 7 tableau columns, 24 stock and 4 foundations",()=>{
    const game=new SourceSolitaireEngine(()=>0.5);
    const s=game.snapshot();
    expect(s.state.tableau.map(x=>x.length)).toEqual([1,2,3,4,5,6,7]);
    expect(s.state.stock).toHaveLength(24);
    expect(s.state.waste).toHaveLength(0);
    expect(s.state.foundations.every(x=>x.length===0)).toBe(true);
    expect(s.state.tableau.every(pile=>pile.filter(c=>c.faceUp).length===1))
      .toBe(true);
    expect(s.started).toBe(false);
    expect(s.drawThree).toBe(true);
    expect(s.historyLength).toBe(0);
    expect(s.state.tableau.flat().length+s.state.stock.length).toBe(52);
  });
  it("draws three, recycles waste in reverse and undo restores score and deck",()=>{
    const game=new SourceSolitaireEngine(()=>0.5);
    const before=game.snapshot();
    expect(game.dealFromStock()).toBe(true);
    const after=game.snapshot();
    expect(after.state.stock).toHaveLength(21);
    expect(after.state.waste).toHaveLength(3);
    expect(after.state.waste.every(c=>c.faceUp)).toBe(true);
    expect(after.historyLength).toBe(1);
    expect(game.undo()).toBe(true);
    expect(game.snapshot().state).toEqual(before.state);
    expect(game.snapshot().score).toBe(before.score);
    expect(game.snapshot().started).toBe(true);
    for(let i=0;i<8;i++)game.dealFromStock();
    expect(game.snapshot().state.stock).toHaveLength(0);
    expect(game.snapshot().state.waste).toHaveLength(24);
    game.dealFromStock();
    expect(game.snapshot().state.waste).toHaveLength(0);
    expect(game.snapshot().state.stock).toHaveLength(24);
    expect(game.snapshot().state.stock.every(c=>!c.faceUp)).toBe(true);
    expect(game.snapshot().score).toBe(0); // -20 clamps at zero
    expect(SOURCE_SOLITAIRE_SCORE.RecycleOne).toBe(-100);
  });
  it("resets the source game on draw-one/draw-three preference change",()=>{
    const game=new SourceSolitaireEngine(()=>0.5);
    game.dealFromStock();
    expect(game.setDrawThree(false)).toBe(true);
    expect(game.snapshot()).toMatchObject({score:0,time:0,drawThree:false,
      historyLength:0,started:false});
    game.dealFromStock();
    expect(game.snapshot().state.waste).toHaveLength(1);
    expect(game.setDrawThree(false)).toBe(false);
    expect(game.snapshot().historyLength).toBe(1);
  });
  it("enforces alternating-color descending runs and only single-card foundations",()=>{
    const s=state();
    const king=card("spades",13),queen=card("hearts",12),
      jack=card("clubs",11),redJack=card("diamonds",11);
    s.tableau[0]=[king,queen,jack];
    expect(sourceSolitaireMovableRun(s,"tableau-0",0)).toEqual([king,queen,jack]);
    expect(sourceSolitaireMovableRun(s,"tableau-0",1)).toEqual([queen,jack]);
    s.tableau[0]=[king,queen,redJack];
    expect(sourceSolitaireMovableRun(s,"tableau-0",0)).toEqual([]);
    s.tableau[0]=[king,queen,jack];
    expect(sourceSolitaireCanDrop(s,"tableau-1",[king])).toBe(true);
    expect(sourceSolitaireCanDrop(s,"tableau-1",[queen])).toBe(false);
    s.tableau[1]=[card("diamonds",13)];
    expect(sourceSolitaireCanDrop(s,"tableau-1",[queen])).toBe(false);
    s.tableau[1]=[card("clubs",13)];
    expect(sourceSolitaireCanDrop(s,"tableau-1",[queen])).toBe(true);
    expect(sourceSolitaireCanDrop(s,"foundation-0",[queen,jack])).toBe(false);
    expect(sourceSolitaireCanDrop(s,"foundation-0",[card("hearts",1)])).toBe(true);
    s.foundations[0]=[card("hearts",1)];
    expect(sourceSolitaireCanDrop(s,"foundation-0",[card("hearts",2)])).toBe(true);
    expect(sourceSolitaireCanDrop(s,"foundation-0",[card("diamonds",2)])).toBe(false);
  });
  it("prefers auto-foundations and skips moving a whole tableau to empty tableau",()=>{
    const s=state();
    s.tableau[0]=[card("hearts",1)];
    expect(sourceSolitaireAutoTarget(s,"tableau-0",s.tableau[0]))
      .toBe("foundation-0");
    s.tableau[0]=[card("spades",13)];
    expect(sourceSolitaireAutoTarget(s,"tableau-0",s.tableau[0])).toBeNull();
    s.waste=[card("spades",13)];
    expect(sourceSolitaireAutoTarget(s,"waste",s.waste)).toBe("tableau-1");
  });
  it("tracks source 10-second scoring decay, capped history and valid win",()=>{
    const game=new SourceSolitaireEngine(()=>0.5);
    game.tick(50);expect(game.snapshot().time).toBe(0);
    game.dealFromStock();game.tick(10);
    expect(game.snapshot().time).toBe(10);
    expect(game.snapshot().score).toBe(0);
    for(let i=0;i<70;i++)game.dealFromStock();
    expect(game.snapshot().historyLength).toBe(SOURCE_SOLITAIRE_HISTORY_LIMIT);
    const s=state();
    expect(sourceSolitaireWon(s)).toBe(false);
    for(const pile of s.foundations)
      for(let rank=1;rank<=13;rank++)pile.push(card("spades",rank));
    expect(sourceSolitaireWon(s)).toBe(true);
    const deck=sourceCardsDeck(()=>0.5);
    expect(sourceSolitaireDeal(deck).tableau).toHaveLength(7);
  });
});

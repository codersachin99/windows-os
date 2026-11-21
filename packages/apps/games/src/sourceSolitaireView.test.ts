import {describe,it,expect} from "vitest";
import {SourceSolitaireEngine} from "./sourceSolitaire";
import {sourceSolitaireLayout} from "./sourceSolitaireLayout";
import {
  sourceSolitaireRenderedCards,sourceSolitaireDropZones,
  sourceSolitaireDraggedRect
} from "./sourceSolitaireView";
import {sourceCardBestDropTarget} from "./sourceCardDrag";
import type {SourceCard} from "./sourceCards";
import type {SourceSolitaireState} from "./sourceSolitaire";
const ace:SourceCard={id:"clubs-1-0",suit:"clubs",rank:1,faceUp:true};
function emptyState():SourceSolitaireState{
  return {stock:[],waste:[],foundations:[[],[],[],[]],
    tableau:[[],[],[],[],[],[],[]]};
}
describe("pinned e202 Solitaire rendered card board",()=>{
  it("draws all 52 dealt cards in source stack order with only face-up cards playable",()=>{
    const state=new SourceSolitaireEngine(()=>.5).snapshot().state;
    const layout=sourceSolitaireLayout(660,410,state);
    const cards=sourceSolitaireRenderedCards(state,layout,true);
    expect(cards).toHaveLength(52);
    expect(cards.slice(0,24).every(c=>c.key==="stock"&&!c.draggable))
      .toBe(true);
    const last=cards.filter(c=>c.key==="tableau-6");
    expect(last).toHaveLength(7);
    expect(last.map(c=>c.z)).toEqual([1,2,3,4,5,6,7]);
    expect(last.map(c=>c.draggable)).toEqual([
      false,false,false,false,false,false,true
    ]);
    expect(last[6].y).toBeGreaterThan(last[0].y);
    const hidden=sourceSolitaireRenderedCards(state,layout,true,[last[6].card.id]);
    expect(hidden.find(c=>c.card.id===last[6].card.id)?.hidden).toBe(true);
    expect(hidden.filter(c=>c.hidden)).toHaveLength(1);
  });
  it("fans the last three waste cards by source .22 width and one-card draw stacks",()=>{
    const game=new SourceSolitaireEngine(()=>.5);
    game.dealFromStock();
    const state=game.snapshot().state;
    const layout=sourceSolitaireLayout(660,410,state);
    const cards=sourceSolitaireRenderedCards(state,layout,true)
      .filter(c=>c.key==="waste");
    expect(cards).toHaveLength(3);
    const spread=Math.round(layout.cardWidth*.22);
    expect(cards.map(c=>c.x)).toEqual([
      cards[0].x,cards[0].x+spread,cards[0].x+spread*2
    ]);
    expect(cards.map(c=>c.draggable)).toEqual([false,false,true]);
    const one=sourceSolitaireRenderedCards(state,layout,false)
      .filter(c=>c.key==="waste");
    expect(one.every(c=>c.x===one[0].x)).toBe(true);
    expect(one.filter(c=>c.draggable)).toHaveLength(1);
  });
  it("filters drop destinations with e202 rules and preserves source priority",()=>{
    const state=emptyState();
    state.waste=[ace];
    const layout=sourceSolitaireLayout(660,410,state);
    const zones=sourceSolitaireDropZones(state,layout,"waste",0);
    expect(zones.map(z=>z.key)).toEqual([
      "foundation-0","foundation-1","foundation-2","foundation-3"
    ]);
    const chosen=sourceCardBestDropTarget(
      {...zones[0],x:zones[0].x+1},zones);
    expect(chosen).toBe("foundation-0");
    expect(sourceSolitaireDropZones(state,layout,"stock",0)).toEqual([]);
  });
  it("includes every visible card in the dragged run overlap rectangle",()=>{
    expect(sourceSolitaireDraggedRect(10,20,73,98,4,20)).toEqual({
      x:10,y:20,width:73,height:158
    });
    expect(sourceSolitaireDraggedRect(10,20,73,98,1,20).height).toBe(98);
  });
});

import {describe,it,expect} from "vitest";
import {
  sourceCardsDeck,sourceCardsLast,sourceCardsDifferentColor
} from "./sourceCards";
describe("pinned shared 5ea1 card-model primitives",()=>{
  it("generates 52 distinct ranked cards and supports multi-decks",()=>{
    const cards=sourceCardsDeck(()=>0.5);
    expect(cards).toHaveLength(52);
    expect(new Set(cards.map(c=>c.id)).size).toBe(52);
    expect(cards.every(c=>!c.faceUp)).toBe(true);
    expect(sourceCardsDeck(()=>0.5,2)).toHaveLength(104);
    expect(()=>sourceCardsDeck(()=>1)).toThrow("random");
    expect(()=>sourceCardsDeck(()=>0.5,0)).toThrow("deck");
  });
  it("uses source different-color and last-card rules",()=>{
    const cards=sourceCardsDeck(()=>0.5);
    const hearts=cards.find(c=>c.suit==="hearts")!;
    const spades=cards.find(c=>c.suit==="spades")!;
    const diamonds=cards.find(c=>c.suit==="diamonds")!;
    expect(sourceCardsDifferentColor(hearts,spades)).toBe(true);
    expect(sourceCardsDifferentColor(hearts,diamonds)).toBe(false);
    expect(sourceCardsLast(cards)).toEqual(cards[cards.length-1]);
    expect(sourceCardsLast([])).toBeUndefined();
  });
});

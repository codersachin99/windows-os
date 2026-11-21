import {describe,it,expect} from "vitest";
import {sourceCardsDeck} from "./sourceCards";
import {sourceSolitaireDeal} from "./sourceSolitaire";
import {
  sourceCardSpriteStyle,SOURCE_CARD_COLUMNS,SOURCE_CARD_ROWS,
  SOURCE_CARD_SPRITE_WIDTH,SOURCE_CARD_SPRITE_HEIGHT
} from "./sourceCardArtwork";
import {sourceSolitaireLayout,sourceSolitairePileRect}
  from "./sourceSolitaireLayout";
describe("pinned shared cards 5ea1 sprite and Solitaire e202 pile layout",()=>{
  it("uses original 949×490 card-sheet geometry and exact face/back cells",()=>{
    expect(SOURCE_CARD_SPRITE_WIDTH*SOURCE_CARD_COLUMNS).toBe(949);
    expect(SOURCE_CARD_SPRITE_HEIGHT*SOURCE_CARD_ROWS).toBe(490);
    const card=sourceCardsDeck(()=>0.5).find(c=>c.suit==="hearts"&&c.rank===12)!;
    // Source deck cards are face-down until exposed in Solitaire.
    // Face sprite coordinates must use a deliberately opened card.
    expect(sourceCardSpriteStyle({...card,faceUp:true},73)).toMatchObject({
      width:"73px",height:"98px",
      backgroundSize:"949px 490px",
      backgroundPosition:"-803px -196px"
    });
    expect(sourceCardSpriteStyle({...card,faceUp:false},73,1)
      .backgroundPosition).toBe("-73px -392px");
    expect(sourceCardSpriteStyle(null,73).backgroundPosition)
      .toBe("-219px -392px");
    expect(()=>sourceCardSpriteStyle(card,0)).toThrow("card width");
  });
  it("matches source e202 660×500 board and source 7-pile coordinates",()=>{
    const state=sourceSolitaireDeal(sourceCardsDeck(()=>0.5));
    const l=sourceSolitaireLayout(660,500,state);
    expect(l.cardWidth).toBe(81);
    expect(l.cardHeight).toBe(109);
    expect(l.gap).toBe(11);
    expect(l.boardOffset).toBe(14);
    expect(l.tableauY).toBe(151);
    expect(l.tableauOffsets[6]).toEqual([0,10,20,30,40,50,60]);
    expect(sourceSolitairePileRect("stock",l)).toEqual({
      x:14,y:11,width:81,height:109
    });
    expect(sourceSolitairePileRect("waste",l).x).toBe(106);
    expect(sourceSolitairePileRect("foundation-0",l).x).toBe(290);
    expect(sourceSolitairePileRect("tableau-6",l).y).toBe(151);
    expect(sourceSolitairePileRect("tableau-6",l).height).toBe(169);
  });
  it("scales tall card stacks to available mobile viewport height",()=>{
    const state=sourceSolitaireDeal(sourceCardsDeck(()=>0.5));
    state.tableau[6]=Array.from({length:40},(_,i)=>({
      ...state.tableau[6][0],id:String(i),faceUp:i>=5
    }));
    const l=sourceSolitaireLayout(393,300,state);
    const pos=l.tableauOffsets[6];
    expect(pos.at(-1)).toBeLessThanOrEqual(
      Math.max(0,300-l.tableauY-l.cardHeight-l.gap));
    expect(l.cardWidth).toBe(48);
    expect(()=>sourceSolitaireLayout(0,100,state)).toThrow("dimensions");
  });
});

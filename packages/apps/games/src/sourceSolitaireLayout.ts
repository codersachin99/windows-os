import type {SourceSolitaireState,SourceSolitairePile} from "./sourceSolitaire";
import {sourceSolitairePile} from "./sourceSolitaire";
import {SOURCE_CARD_SPRITE_HEIGHT,SOURCE_CARD_SPRITE_WIDTH}
  from "./sourceCardArtwork";
export interface SourceSolitaireLayout{
  readonly cardWidth:number;
  readonly cardHeight:number;
  readonly gap:number;
  readonly boardOffset:number;
  readonly topRowY:number;
  readonly tableauY:number;
  readonly runOffset:number;
  readonly tableauOffsets:readonly (readonly number[])[];
}
export interface SourceSolitaireRect{
  x:number;y:number;width:number;height:number;
}
export function sourceSolitaireLayout(
  width:number,height:number,state:SourceSolitaireState
):SourceSolitaireLayout{
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)
    throw Error("Invalid Solitaire board dimensions");
  // Source e202: rt=.14, ot=.28, nt=.09, ct=.2,
  // card width clamped 40..96, card height from shared 5ea1.
  const cardWidth=Math.min(96,Math.max(40,Math.floor(width/(7+8*.14))));
  const cardHeight=Math.round(cardWidth*SOURCE_CARD_SPRITE_HEIGHT/
    SOURCE_CARD_SPRITE_WIDTH);
  const gap=Math.round(cardWidth*.14);
  const boardOffset=Math.max(gap,
    Math.round((width-(7*cardWidth+6*gap))/2));
  const topRowY=gap;
  const tableauY=topRowY+cardHeight+Math.round(cardHeight*.28);
  const runOffset=Math.round(cardHeight*.2);
  const closedOffset=Math.round(cardHeight*.09);
  const available=Math.max(0,height-tableauY-cardHeight-gap);
  const tableauOffsets=state.tableau.map(pile=>{
    const raw=pile.slice(0,-1).map(card=>
      card.faceUp?runOffset:closedOffset);
    const total=raw.reduce((sum,value)=>sum+value,0);
    const scale=total>available&&total>0?available/total:1;
    const offsets=[0];
    for(const value of raw)
      offsets.push(offsets[offsets.length-1]+value*scale);
    return offsets.map(Math.round);
  });
  return {cardWidth,cardHeight,gap,boardOffset,topRowY,tableauY,
    runOffset,tableauOffsets};
}
export function sourceSolitairePileRect(
  key:SourceSolitairePile,
  layout:SourceSolitaireLayout
):SourceSolitaireRect{
  const [kind,indexText]=key.split("-");
  const index=Number(indexText);
  const x=(col:number)=>layout.boardOffset+
    col*(layout.cardWidth+layout.gap);
  const top={y:layout.topRowY,width:layout.cardWidth,
    height:layout.cardHeight};
  switch(kind){
    case "stock":return {...top,x:x(0)};
    case "waste":return {...top,x:x(1)};
    case "foundation":return {...top,x:x(3+index)};
    case "tableau": {
      const offsets=layout.tableauOffsets[index]??[0];
      return {x:x(index),y:layout.tableauY,
        width:layout.cardWidth,
        height:layout.cardHeight+(offsets[offsets.length-1]??0)};
    }
    default:throw Error("Invalid Solitaire pile geometry");
  }
}

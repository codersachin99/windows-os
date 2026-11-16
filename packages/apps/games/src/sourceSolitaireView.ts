import type {SourceCard} from "./sourceCards";
import {
  sourceSolitaireCanDrop,sourceSolitairePile,sourceSolitaireMovableRun,
  type SourceSolitairePile,type SourceSolitaireState
} from "./sourceSolitaire";
import {
  sourceSolitairePileRect,
  type SourceSolitaireLayout
} from "./sourceSolitaireLayout";
import type {SourceCardTarget,SourceCardRect} from "./sourceCardDrag";

/** e202 renderedCards(): keep source stacking, waste fan, face-up
 * affordances and drag invisibility separate from the React component.
 * Draw order is the source order: stock, waste, foundations, tableaus.
 */
export interface SourceSolitaireRenderedCard {
  readonly card:SourceCard;
  readonly key:SourceSolitairePile;
  readonly index:number;
  readonly x:number;
  readonly y:number;
  readonly z:number;
  readonly draggable:boolean;
  readonly hidden:boolean;
}
export function sourceSolitaireRenderedCards(
  state:SourceSolitaireState,layout:SourceSolitaireLayout,
  drawThree:boolean,draggedIds:readonly string[]=[]
):SourceSolitaireRenderedCard[]{
  const hidden=new Set(draggedIds);
  const cards:SourceSolitaireRenderedCard[]=[];
  const push=(card:SourceCard,key:SourceSolitairePile,index:number,
    x:number,y:number,z:number,draggable:boolean)=>{
    cards.push({card,key,index,x,y,z,draggable,hidden:hidden.has(card.id)});
  };
  const stock=sourceSolitairePileRect("stock",layout);
  state.stock.forEach((card,index)=>
    push(card,"stock",index,stock.x,stock.y,index+1,false));
  const waste=sourceSolitairePileRect("waste",layout);
  const fan=drawThree?3:1;
  const spread=Math.round(layout.cardWidth*.22);
  state.waste.forEach((card,index)=>{
    const fanIndex=Math.min(fan-1,
      Math.max(0,index-(state.waste.length-fan)));
    push(card,"waste",index,waste.x+fanIndex*spread,waste.y,index+1,
      index===state.waste.length-1);
  });
  state.foundations.forEach((pile,index)=>{
    const key=`foundation-${index}` as SourceSolitairePile;
    const rect=sourceSolitairePileRect(key,layout);
    pile.forEach((card,i)=>push(card,key,i,rect.x,rect.y,i+1,
      i===pile.length-1));
  });
  state.tableau.forEach((pile,index)=>{
    const key=`tableau-${index}` as SourceSolitairePile;
    const rect=sourceSolitairePileRect(key,layout);
    pile.forEach((card,i)=>
      push(card,key,i,rect.x,rect.y+(layout.tableauOffsets[index]?.[i]??0),
        i+1,card.faceUp));
  });
  return cards;
}
/** e202 dropZones(): foundation first, then tableau, with the
 * original source's first-greatest-overlap tie behavior downstream. */
export function sourceSolitaireDropZones(
  state:SourceSolitaireState,layout:SourceSolitaireLayout,
  from:SourceSolitairePile,index:number
):SourceCardTarget[]{
  const cards=sourceSolitaireMovableRun(state,from,index);
  if(!cards.length)return [];
  const zones:SourceCardTarget[]=[];
  for(let i=0;i<4;i++){
    const key=`foundation-${i}` as SourceSolitairePile;
    if(key!==from&&sourceSolitaireCanDrop(state,key,cards))
      zones.push({key,...sourceSolitairePileRect(key,layout)});
  }
  for(let i=0;i<7;i++){
    const key=`tableau-${i}` as SourceSolitairePile;
    if(key!==from&&sourceSolitaireCanDrop(state,key,cards))
      zones.push({key,...sourceSolitairePileRect(key,layout)});
  }
  return zones;
}
/** Source card drag covers the entire run's visible extent. */
export function sourceSolitaireDraggedRect(
  x:number,y:number,width:number,height:number,runLength:number,
  runOffset:number
):SourceCardRect{
  return {x,y,width,height:height+Math.max(0,runLength-1)*runOffset};
}

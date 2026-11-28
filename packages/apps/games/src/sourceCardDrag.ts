/** Shared source 0510 Card Drag mixin + 5ea1 overlap helper
 * extracted without DOM or UI dependencies for both Solitaire and Spider.
 */
export interface SourceCardRect{
  readonly x:number;readonly y:number;
  readonly width:number;readonly height:number;
}
export interface SourceCardTarget extends SourceCardRect{readonly key:string;}
export const SOURCE_CARD_DRAG_THRESHOLD=4;
/** Source 0510 pendingDrag promotes if EITHER axis moves 4px or more. */
export function sourceCardDragShouldBegin(
  startX:number,startY:number,currentX:number,currentY:number
):boolean{
  return Math.abs(currentX-startX)>=SOURCE_CARD_DRAG_THRESHOLD||
    Math.abs(currentY-startY)>=SOURCE_CARD_DRAG_THRESHOLD;
}
export function sourceCardRectOverlap(a:SourceCardRect,b:SourceCardRect):number{
  const w=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x);
  const h=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);
  return w>0&&h>0?w*h:0;
}
/** Original 0510 findDropTarget takes the first legal drop zone with
 * maximum *positive* overlap, not the nearest pile center.
 * Eligible zone filtering remains the caller's source game-rule job.
 */
export function sourceCardBestDropTarget(
  dragged:SourceCardRect,zones:readonly SourceCardTarget[]
):string|null{
  let best:string|null=null,area=0;
  for(const target of zones){
    const overlap=sourceCardRectOverlap(dragged,target);
    if(overlap>area){best=target.key;area=overlap;}
  }
  return best;
}
/** Original CardDrag getBoardPoint uses CSS zoom correction:
 * (client - bounds.left/top) / (bounds.width / board.offsetWidth).
 */
export function sourceCardBoardPoint(
  clientX:number,clientY:number,bounds:{left:number;top:number;width:number},
  offsetWidth:number
):{x:number;y:number}{
  const scale=bounds.width/offsetWidth||1;
  return {x:(clientX-bounds.left)/scale,
    y:(clientY-bounds.top)/scale};
}

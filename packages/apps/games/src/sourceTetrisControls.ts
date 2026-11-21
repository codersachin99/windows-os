import {
  SOURCE_TETRIS_PIECES,type SourceTetrisInput,
  type SourceTetrisSnapshot
} from "./sourceTetris";
import type {SourceTetrisCanvasLayout} from "./sourceTetrisCanvas";

/** Source src/modules/games/tetris.js 13bc _handleKeyDown/_handleWheel:
 * KeyZ/KeyL and negative wheel turn opposite of ArrowUp/KeyX/KeyK.
 * Original hard-drop ignores auto-repeated Space input.
 */
export function sourceTetrisKeyInput(
  code:string,repeat=false
):SourceTetrisInput|null{
  switch(code){
    case "ArrowLeft":case "KeyA":return {left:true};
    case "ArrowRight":case "KeyD":return {right:true};
    case "ArrowDown":case "KeyS":return {down:true};
    case "ArrowUp":case "KeyW":case "KeyX":case "KeyK":
      return {clockwise:true};
    case "KeyZ":case "KeyL":return {counterClockwise:true};
    case "Space":return repeat?null:{hardDrop:true};
    case "KeyP":case "Escape":return {pause:true};
    default:return null;
  }
}
export function sourceTetrisWheelInput(deltaY:number):SourceTetrisInput|null{
  return deltaY>0?{clockwise:true}:
    deltaY<0?{counterClockwise:true}:null;
}
/** Source tap is <=10px movement within <=500ms.
 * Primary tap rotates clockwise; other mouse buttons counterclockwise.
 */
export function sourceTetrisTapInput(
  button:number,distance:number,durationMs:number
):SourceTetrisInput|null{
  if(distance>10||durationMs>500||distance<0||durationMs<0)
    return null;
  return button===0?{clockwise:true}:{counterClockwise:true};
}
export interface SourceTetrisPointerMove{
  readonly input:SourceTetrisInput;
  readonly downEnabled:boolean;
}
/** Exact 13bc _handlePointerMove uses boardXY, square side and occupied
 * piece bounds with bitwise truncation toward 0 for pointer cell coords.
 * Once pointer-down below the piece begins, down remains enabled until
 * pointerup/pointercancel, as in the original engine.
 */
export function sourceTetrisPointerMoveInput(
  snapshot:SourceTetrisSnapshot,
  layout:SourceTetrisCanvasLayout,
  localX:number,localY:number,
  previousDownEnabled=false
):SourceTetrisPointerMove{
  const shape=SOURCE_TETRIS_PIECES.find(p=>p.name===snapshot.current)!
    .rotations[snapshot.rotation];
  let top=22,bottom=0,left=10,right=0;
  for(let y=0;y<shape.length;y++)
    for(let x=0;x<shape[y].length;x++)if(shape[y][x]){
      const cellX=snapshot.position[0]+x;
      const cellY=snapshot.position[1]+y;
      top=Math.min(top,cellY);bottom=Math.max(bottom,cellY);
      left=Math.min(left,cellX);right=Math.max(right,cellX);
    }
  const pointerRow=((localY-layout.boardY)/layout.side)|0;
  const pointerCol=((localX-layout.boardX)/layout.side)|0;
  const middleRow=((top+bottom)/2)|0;
  const middleCol=((left+right)/2)|0;
  const downEnabled=previousDownEnabled||pointerRow<=bottom;
  const input:SourceTetrisInput={
    ...(pointerCol<middleCol?{left:true}:
      pointerCol>middleCol?{right:true}:{}),
    ...(downEnabled&&pointerRow>middleRow?{down:true}:{})
  };
  return {input,downEnabled};
}

import type {SourceResizeBounds} from "./sourceWindowResize";
import type {SourceWindowSnap} from "@windows-os/contracts";
/** Frozen window wrapper dcfced3e: z/c/m/f and edge margin p.
 * Physical viewport coordinates, including reserved Guest dock/taskbar. */
export type SourceDragSnap=Exclude<SourceWindowSnap,"vertical">|"maximize";
export function sourceDragSnap(x:number,y:number,area:SourceResizeBounds,touch=false,zoom=1):SourceDragSnap|null{
  const margin=touch?48/Math.max(zoom,0.01):8;
  if(y<=area.y+margin)return "maximize";
  if(x<=area.x+margin)return "left";
  if(x>=area.x+area.width-margin)return "right";
  return null;
}
export function sourceSnapBounds(mode:SourceWindowSnap|"maximize",area:SourceResizeBounds,current:SourceResizeBounds):SourceResizeBounds{
  if(mode==="maximize")return {...area};
  if(mode==="vertical")return {x:current.x,y:area.y,width:current.width,height:area.height};
  const half=Math.floor(area.width/2);
  return {x:area.x+(mode==="right"?half:0),y:area.y,width:mode==="left"?half:area.width-half,height:area.height};
}
/** Keep the titlebar under the pointer when leaving snapped/maximized state. */
export function sourceDragRestoreBounds(saved:SourceResizeBounds,current:SourceResizeBounds,area:SourceResizeBounds,x:number,y:number,grabX:number,grabY:number):SourceResizeBounds{
  const width=Math.min(saved.width,area.width),height=Math.min(saved.height,area.height);
  const fraction=Math.max(0,Math.min(1,(grabX-current.x)/Math.max(1,current.width)));
  return {x:Math.round(Math.max(area.x,Math.min(x-width*fraction,area.x+area.width-width))),
    y:Math.round(Math.max(area.y,Math.min(y-Math.max(0,grabY-current.y),area.y+area.height-height))),
    width,height};
}

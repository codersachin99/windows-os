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
  const half=area.width/2;
  return {x:area.x+(mode==="right"?half:0),y:area.y,width:half,height:area.height};
}
/** Keep the titlebar under the pointer when leaving snapped/maximized state. */
export function sourceDragRestoreBounds(saved:SourceResizeBounds,current:SourceResizeBounds,area:SourceResizeBounds,x:number,y:number,grabX:number,grabY:number):SourceResizeBounds{
  const width=Math.min(saved.width,area.width),height=Math.min(saved.height,area.height);
  const fraction=Math.max(0,Math.min(1,(grabX-current.x)/Math.max(1,current.width)));
  return {x:Math.round(Math.max(area.x,Math.min(x-width*fraction,area.x+area.width-width))),
    y:Math.round(Math.max(area.y,Math.min(y-Math.max(0,grabY-current.y),area.y+area.height-height))),
    width,height};
}

/** Source f(): repeat same direction moves to opposite side; opposing
 * direction from a half-screen returns to the saved normal bounds. */
export function sourceKeyboardSnap(current:SourceWindowSnap|undefined,direction:"left"|"right"):SourceWindowSnap|null{
  if(current!=="left"&&current!=="right")return direction;
  return current===direction?(direction==="left"?"right":"left"):null;
}
export function sourceVerticalResizeSnap(edge:string,y:number,area:SourceResizeBounds,touch=false,zoom=1):boolean{
  const margin=touch?48/Math.max(zoom,0.01):8;
  return edge==="n"?y<=area.y+margin:edge==="s"&&y>=area.y+area.height-margin;
}
export function sourceWindowWorkArea(shell:HTMLElement,theme:string):SourceResizeBounds{
  const styles=getComputedStyle(shell);
  const taskbar=parseFloat(styles.getPropertyValue("--taskbar-height"))||40;
  const top=theme==="ubuntu"||theme==="macos"?taskbar:0;
  const left=theme==="ubuntu"?(parseFloat(styles.getPropertyValue("--source-ubuntu-dock-width"))||64):0;
  const bottom=theme==="macos"?(parseFloat(styles.getPropertyValue("--source-macos-dock-reserve"))||74):theme==="ubuntu"?0:taskbar;
  return {x:left,y:top,width:Math.max(1,shell.clientWidth-left),height:Math.max(1,shell.clientHeight-top-bottom)};
}

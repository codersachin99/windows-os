/** Frozen Window wrapper dcfced3e + drag-resize eec2253e: eight handles,
 * minWidth 320 / minHeight 240. Guest work-area clamp is the responsive adapter.
 * Direction names denote physical edges, also when the UI language is RTL. */
export const SOURCE_WINDOW_RESIZE_EDGES=["nw","n","ne","e","se","s","sw","w"] as const;
export type SourceResizeEdge=typeof SOURCE_WINDOW_RESIZE_EDGES[number];
export interface SourceResizeBounds{x:number;y:number;width:number;height:number}
export function sourceResizeBounds(origin:SourceResizeBounds,edge:SourceResizeEdge,
  dx:number,dy:number,area:SourceResizeBounds):SourceResizeBounds{
  const clamp=(value:number,min:number,max:number)=>Math.min(Math.max(value,min),max);
  const right=area.x+area.width,bottom=area.y+area.height;
  const minW=Math.min(320,area.width),minH=Math.min(240,area.height);
  let l=clamp(origin.x,area.x,right-minW),t=clamp(origin.y,area.y,bottom-minH);
  let r=clamp(origin.x+origin.width,l+minW,right),b=clamp(origin.y+origin.height,t+minH,bottom);
  if(edge.includes("w"))l=clamp(l+dx,area.x,r-minW);
  if(edge.includes("e"))r=clamp(r+dx,l+minW,right);
  if(edge.includes("n"))t=clamp(t+dy,area.y,b-minH);
  if(edge.includes("s"))b=clamp(b+dy,t+minH,bottom);
  return {x:Math.round(l),y:Math.round(t),width:Math.max(1,Math.round(r-l)),height:Math.max(1,Math.round(b-t))};
}

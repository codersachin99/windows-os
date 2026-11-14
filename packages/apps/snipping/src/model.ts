/** Pinned legacy-win7/src/modules/apps/snipping.js (module 331a). */
export const SOURCE_SNIP_MODES = [
  {id:"free-form",label:"Free-form Snip",enabled:false},
  {id:"rectangular",label:"Rectangular Snip",enabled:true},
  {id:"window",label:"Window Snip",enabled:true},
  {id:"full-screen",label:"Full-screen Snip",enabled:true}
] as const;
export type SourceSnipMode="rectangular"|"window"|"full-screen";
export const SOURCE_SNIP_FILE_TYPES=[
  {extension:"png",label:"Portable Network Graphic file (*.PNG)"},
  {extension:"jpg",label:"JPEG file (*.JPG)"}
] as const;
export const SOURCE_SNIP_FILE_NAME="Capture";
export const SOURCE_SNIP_MIN_SIZE=5;
export type SnipPoint={x:number;y:number};
export type SnipRectangle={x:number;y:number;width:number;height:number};
export function clampSnipRect(rect:SnipRectangle,area:{width:number;height:number}):SnipRectangle{
  const x=Math.max(0,Math.min(area.width,rect.x));
  const y=Math.max(0,Math.min(area.height,rect.y));
  const right=Math.max(x,Math.min(area.width,rect.x+rect.width));
  const bottom=Math.max(y,Math.min(area.height,rect.y+rect.height));
  return {x,y,width:right-x,height:bottom-y};
}
export function rectangularSnip(start:SnipPoint,end:SnipPoint,area:{width:number;height:number}):SnipRectangle|null{
  const rect=clampSnipRect({
    x:Math.min(start.x,end.x),y:Math.min(start.y,end.y),
    width:Math.abs(end.x-start.x),height:Math.abs(end.y-start.y)
  },area);
  return rect.width>=SOURCE_SNIP_MIN_SIZE && rect.height>=SOURCE_SNIP_MIN_SIZE ? rect:null;
}
export function sourceSnipMime(extension:string):"image/png"|"image/jpeg"|null{
  if(extension.toLowerCase()==="png")return "image/png";
  if(["jpg","jpeg"].includes(extension.toLowerCase()))return "image/jpeg";
  return null;
}

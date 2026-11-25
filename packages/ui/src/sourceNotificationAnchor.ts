/** Position the original f0ed right-aligned balloon within the desktop.
 * Coordinates are desktop-local CSS pixels. Keep the tail pointed toward
 * the icon when the viewport forces the balloon away from its source edge. */
export type SourceBalloonRect={left:number;top:number;width:number;height:number};
export function sourceNotificationAnchor(anchor:SourceBalloonRect,balloon:{width:number;height:number},desktop:{width:number;height:number},direction:"top"|"bottom",rtl=false,tailWidth=18){
  const margin=8;
  const clamp=(value:number,min:number,max:number)=>Math.min(Math.max(min,max),Math.max(min,value));
  const preferredLeft=rtl?anchor.left:anchor.left+anchor.width-balloon.width;
  const left=clamp(preferredLeft,margin,desktop.width-balloon.width-margin);
  const preferredTop=direction==="top"?anchor.top-balloon.height-tailWidth:anchor.top+anchor.height+tailWidth;
  const top=clamp(preferredTop,margin,desktop.height-balloon.height-margin);
  const tailLeft=clamp(anchor.left+anchor.width/2-left-tailWidth/2,8,balloon.width-tailWidth-8);
  return {left,top,tailLeft};
}

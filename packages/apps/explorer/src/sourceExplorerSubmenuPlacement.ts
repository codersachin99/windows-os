/** Pinned legacy-win7 ExplorerMenu submenu: open beside its parent row,
 * flip to the opposite side when the next menu would cross the desktop.
 * Unlike the previous inline child list, these coordinates leave the
 * original parent item order and height unchanged. All coordinates are CSS
 * pixels in the parent menu's local space (including transformed windows).
 */
export interface SourceMenuRect{
  left:number;top:number;width:number;height:number;
}
export interface SourceSubmenuPlacement{
  left:number;top:number;side:"left"|"right";
}
export function sourceExplorerSubmenuPlacement(
  parent:SourceMenuRect,
  trigger:Pick<SourceMenuRect,"top">,
  child:Pick<SourceMenuRect,"width"|"height">,
  viewport:{width:number;height:number},
  margin=4
):SourceSubmenuPlacement{
  const overlap=2;
  const preferRight=parent.left+parent.width-overlap+child.width<=
    viewport.width-margin;
  const fitsLeft=parent.left-child.width+overlap>=margin;
  // A 205px parent and a 205px child cannot fit side-by-side in a
  // 320-390px mobile viewport. The source flip/clamp fallback used to
  // overlap the parent row, so simply hovering Send to opened a child
  // above its own trigger and trapped pointer clicks until timeout.
  // Preserve original left/right source layout whenever either fits;
  // only when neither side can fit, stack the child fully below or
  // above the root menu if that fits vertically. This is the narrow
  // viewport adaptation, not a source desktop layout change.
  if(!preferRight&&!fitsLeft){
    const gap=2;
    const below=parent.top+parent.height+gap+child.height<=viewport.height-margin;
    const above=parent.top-child.height-gap>=margin;
    if(below||above){
      const maxWorldLeft=Math.max(margin,viewport.width-margin-child.width);
      const worldLeft=Math.max(margin,Math.min(parent.left,maxWorldLeft));
      return {
        left:worldLeft-parent.left,
        top:below?parent.height+gap:-child.height-gap,
        side:"right"
      };
    }
  }
  const side:SourceSubmenuPlacement["side"]=preferRight?"right":
    fitsLeft?"left":
    (viewport.width-(parent.left+parent.width)>=parent.left?"right":"left");
  const idealLeft=side==="right"?parent.width-overlap:-child.width+overlap;
  const minLeft=margin-parent.left;
  const maxLeft=viewport.width-margin-parent.left-child.width;
  const left=maxLeft<minLeft?minLeft:Math.max(minLeft,Math.min(idealLeft,maxLeft));
  const idealTop=trigger.top-parent.top;
  const minTop=margin-parent.top;
  const maxTop=viewport.height-margin-parent.top-child.height;
  const top=maxTop<minTop?minTop:Math.max(minTop,Math.min(idealTop,maxTop));
  return {left,top,side};
}

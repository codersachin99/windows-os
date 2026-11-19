/**
 * Responsive adapter for the pinned Windows 95/98/2000 cascading Start menu.
 * On a desktop preserve the original adjacent flyout. If neither side fits,
 * place the flyout fully above/below its trigger; it must not intercept the
 * parent button (a real narrow-viewport regression in nested menus).
 *
 * Coordinates are in viewport CSS pixels for a position:fixed submenu.
 * The root bottom excludes the classic taskbar's reserved vertical space.
 */
export interface ClassicStartRect {
  readonly left:number;readonly top:number;
  readonly right:number;readonly bottom:number;
}
export interface ClassicStartSize {
  readonly width:number;readonly height:number;
}
export interface ClassicStartSubmenuPlacement {
  readonly left:number;readonly top:number;readonly maxHeight:number;
  readonly direction:"right"|"left"|"below"|"above";
}
export function sourceWin9xSubmenuPlacement(
  trigger:ClassicStartRect,root:ClassicStartRect,
  menu:ClassicStartSize,viewport:ClassicStartSize
):ClassicStartSubmenuPlacement{
  const gap=2;
  const width=Math.min(menu.width,Math.max(0,viewport.width-2*gap));
  const topBoundary=Math.max(gap,root.top);
  const bottomBoundary=Math.max(topBoundary,Math.min(root.bottom,viewport.height-gap));
  const fullHeight=Math.min(menu.height,bottomBoundary-topBoundary);
  const right=trigger.right-gap;
  const left=trigger.left-width+gap;
  if(right+width<=viewport.width-gap){
    return {left:right,top:Math.max(topBoundary,Math.min(trigger.top,bottomBoundary-fullHeight)),
      maxHeight:fullHeight,direction:"right"};
  }
  if(left>=gap){
    return {left,top:Math.max(topBoundary,Math.min(trigger.top,bottomBoundary-fullHeight)),
      maxHeight:fullHeight,direction:"left"};
  }
  const below=Math.max(0,bottomBoundary-trigger.bottom-gap);
  const above=Math.max(0,trigger.top-topBoundary-gap);
  const direction=below>=above?"below":"above";
  const maxHeight=Math.min(menu.height,Math.max(below,above));
  const top=direction==="below"?trigger.bottom+gap:trigger.top-gap-maxHeight;
  return {left:Math.max(gap,viewport.width-width-gap),
    top:Math.max(topBoundary,top),maxHeight,direction};
}

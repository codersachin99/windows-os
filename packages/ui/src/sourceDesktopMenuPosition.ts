/** Source main.js DesktopMenu B watcher positions the popup on the
 * clicked side unless the measured menu would cross the desktop edge.
 * Keep the original anchor when submenus expand, and clamp on screens
 * smaller than the menu so mobile never loses the last action.
 */
export interface SourceMenuPoint {readonly x:number;readonly y:number;}
export interface SourceMenuSize {readonly width:number;readonly height:number;}
export function sourceDesktopMenuPosition(
  anchor:SourceMenuPoint, menu:SourceMenuSize, desktop:SourceMenuSize
):SourceMenuPoint{
  const x=anchor.x+menu.width<desktop.width?
    anchor.x:anchor.x-menu.width;
  const y=anchor.y+menu.height<desktop.height?
    anchor.y:anchor.y-menu.height;
  return {
    x:Math.max(0,Math.min(x,Math.max(0,desktop.width-menu.width))),
    y:Math.max(0,Math.min(y,Math.max(0,desktop.height-menu.height)))
  };
}

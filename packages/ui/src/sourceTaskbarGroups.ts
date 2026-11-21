import type {DesktopWindow} from "@windows-os/contracts";

/** Final pinned source: legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * src/modules/shell/taskbar-base.js loadItems/getWindowInstances.
 * app.config.json features defaults both true. This is separate from
 * Taskbar Properties useAeroPeek (Show desktop), which defaults false.
 */
export const SOURCE_TASKBAR_FINAL_FEATURES=Object.freeze({
  showStackedIcons:true,
  showPeekPreviews:true
});
export const SOURCE_TASKBAR_PEEK_SHOW_DELAY_MS=200;
export const SOURCE_TASKBAR_PEEK_HIDE_DELAY_MS=450;
export const SOURCE_TASKBAR_PEEK_CARD_WIDTH=220;
export const SOURCE_TASKBAR_PEEK_CARD_GAP=8;

export interface SourceTaskbarGroup{
  key:string;
  appId:string;
  pinned:boolean;
  windows:DesktopWindow[];
}
/** Pinned applications retain their original order; running unpinned apps
 * are grouped by program ID on first encounter (source loadItems).
 * The React window instance id (computer-12) is not a source __suffix,
 * so group by the stable appId, never split the generated window ID. */
export function sourceTaskbarGroups(
  windows:readonly DesktopWindow[],pinned:readonly string[],
  stacked:boolean=SOURCE_TASKBAR_FINAL_FEATURES.showStackedIcons
):SourceTaskbarGroup[]{
  const result:SourceTaskbarGroup[]=pinned.map(appId=>({
    key:"pin:"+appId,appId,pinned:true,
    windows:windows.filter(w=>w.appId===appId)
  }));
  for(const win of windows){
    if(pinned.includes(win.appId))continue;
    const key=stacked?"app:"+win.appId:"window:"+win.id;
    const existing=result.find(group=>group.key===key);
    if(existing)existing.windows.push(win);
    else result.push({key,appId:win.appId,pinned:false,windows:[win]});
  }
  return result;
}
/** Final source preview card width 220, gap 8 and at least 10px margin.
 * Constrain a 3-card strip to narrow mobile viewports without clipping. */
export function sourceTaskbarPreviewLeft(
  button:{left:number;width:number},count:number,viewport:number
):number{
  const width=Math.min(Math.max(0,viewport-20),
    Math.max(0,count)*SOURCE_TASKBAR_PEEK_CARD_WIDTH+
    Math.max(0,count-1)*SOURCE_TASKBAR_PEEK_CARD_GAP);
  return Math.max(10,Math.min(Math.max(10,viewport-width-10),
    button.left+button.width/2-width/2));
}

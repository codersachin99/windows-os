import type {AppDefinition,DesktopWindow,SourceWindowPlacement,ThemeId} from "@windows-os/contracts";
/** Frozen d493ad97/e4c9 placement registry: shared Explorer key, base instance
 * ID and opt-out for parent/explicit location/non-draggable/fullscreen. */
export const SOURCE_WINDOW_PLACEMENTS_KEY="windows-os:guest:window-placements:v1";
export function sourceWindowPlacementKey(appId:string):string{
  const base=appId.split("__")[0];
  return ["computer","bin","games"].includes(base)?"explorer":base;
}
export function sourceRemembersPlacement(app:AppDefinition):boolean{
  return !!app.id&&!app.window.centered&&!app.window.location&&!app.window.fullscreen;
}
export function sourceReadWindowPlacements(storage:Pick<Storage,"getItem">|undefined):Record<string,SourceWindowPlacement>{
  try{
    const raw:unknown=JSON.parse(storage?.getItem(SOURCE_WINDOW_PLACEMENTS_KEY)??"{}");
    if(!raw||typeof raw!=="object"||Array.isArray(raw))return {};
    return Object.fromEntries(Object.entries(raw).filter(([key,value])=>{
      if(!/^[a-z][a-z0-9_-]*$/.test(key)||["constructor","prototype"].includes(key)||!value||typeof value!=="object")return false;
      const p=value as Partial<SourceWindowPlacement>;
      return Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x!>=0&&p.y!>=0&&typeof p.maximized==="boolean"&&
        ((p.width===undefined&&p.height===undefined)||(Number.isFinite(p.width)&&Number.isFinite(p.height)&&p.width!>0&&p.height!>0));
    })) as Record<string,SourceWindowPlacement>;
  }catch{return {};}
}
export function sourceCaptureWindowPlacement(win:DesktopWindow):SourceWindowPlacement{
  const {x,y,width,height}=win.restoreBounds??win;
  return win.resizable===false?{x,y,maximized:false}:{x,y,width,height,maximized:win.maximized};
}
/** Source shells reserve different edges: Win11/ChromeOS 48px shelf, classic
 * Win9x 36px taskbar, macOS 28px menu + 74px dock and Ubuntu 32px menu
 * + 64px dock. Mirror the UI sourceWindowWorkArea in this pure reducer layer. */
export interface SourcePlacementArea {x:number;y:number;width:number;height:number}
export function sourceWindowWorkAreaForTheme(theme:ThemeId,viewport:{width:number;height:number}):SourcePlacementArea{
  const left=theme==="ubuntu"?64:0;
  const top=theme==="ubuntu"?32:theme==="macos"?28:0;
  const bottom=theme==="macos"?74:theme==="ubuntu"?0:
    ["win11","win11dark","chromeos"].includes(theme)?48:
    ["win95","win98","win2k"].includes(theme)?36:40;
  const x=Math.min(left,Math.max(0,viewport.width-1));
  const y=Math.min(top,Math.max(0,viewport.height-1));
  return {x,y,width:Math.max(1,viewport.width-x),height:Math.max(1,viewport.height-y-bottom)};
}
/** Saved normal bounds are desktop coordinates, not work-area offsets. */
export function sourceApplyWindowPlacement(saved:SourceWindowPlacement,defaults:{width:number;height:number},resizable:boolean,area:{x?:number;y?:number;width:number;height:number}){
  const x=area.x??0,y=area.y??0;
  const width=Math.min(resizable?saved.width??defaults.width:defaults.width,area.width);
  const height=Math.min(resizable?saved.height??defaults.height:defaults.height,area.height);
  return {x:Math.max(x,Math.min(saved.x,x+area.width-width)),y:Math.max(y,Math.min(saved.y,y+area.height-height)),width,height,maximized:resizable&&saved.maximized};
}

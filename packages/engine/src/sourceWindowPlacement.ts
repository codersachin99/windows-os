import type {AppDefinition,DesktopWindow,SourceWindowPlacement} from "@windows-os/contracts";
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
export function sourceApplyWindowPlacement(saved:SourceWindowPlacement,defaults:{width:number;height:number},resizable:boolean,area:{width:number;height:number}){
  const width=Math.min(resizable?saved.width??defaults.width:defaults.width,area.width);
  const height=Math.min(resizable?saved.height??defaults.height:defaults.height,area.height);
  return {x:Math.max(0,Math.min(saved.x,area.width-width)),y:Math.max(0,Math.min(saved.y,area.height-height)),width,height,maximized:resizable&&saved.maximized};
}

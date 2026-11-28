import {browserStorage} from "./files";
import type {SourceRecentStorage} from "./recentPrograms";

/** Pinned original taskbar.js startmenuDraft: powerButtonAction and
 * storeRecentApps. Only these two settings are wired in the React shell.
 * Keep the rest of taskbar configs visible but disabled until ported.
 */
export type SourceStartPowerAction="switchuser"|"logoff"|"restart"|"shutdown";
export interface SourceStartPreferences{
  powerButtonAction:SourceStartPowerAction;
  storeRecentApps:boolean;
}
export const SOURCE_START_PREFERENCES_KEY="windows-os:guest:start-preferences:v1";
export const SOURCE_DEFAULT_START_PREFERENCES:SourceStartPreferences=Object.freeze({
  powerButtonAction:"shutdown",storeRecentApps:true
});
export function isSourceStartPowerAction(value:unknown):value is SourceStartPowerAction{
  return value==="switchuser"||value==="logoff"||value==="restart"||value==="shutdown";
}
export class SourceStartPreferenceStore{
  private value:SourceStartPreferences;
  private listeners=new Set<(value:SourceStartPreferences)=>void>();
  constructor(private readonly storage:SourceRecentStorage|undefined=undefined,
    private readonly key=SOURCE_START_PREFERENCES_KEY){
    let parsed:unknown=null;
    try{parsed=JSON.parse(storage?.getItem(key)??"null");}catch{parsed=null;}
    const cfg=parsed&&typeof parsed==="object"?parsed as Record<string,unknown>:{};
    this.value={
      powerButtonAction:isSourceStartPowerAction(cfg.powerButtonAction)
        ?cfg.powerButtonAction:"shutdown",
      storeRecentApps:typeof cfg.storeRecentApps==="boolean"?cfg.storeRecentApps:true
    };
  }
  snapshot():SourceStartPreferences{return {...this.value};}
  subscribe(callback:(value:SourceStartPreferences)=>void):()=>void{
    this.listeners.add(callback);
    return ()=>{this.listeners.delete(callback);};
  }
  apply(value:SourceStartPreferences):void{
    const next={
      powerButtonAction:isSourceStartPowerAction(value.powerButtonAction)
        ?value.powerButtonAction:"shutdown" as SourceStartPowerAction,
      storeRecentApps:Boolean(value.storeRecentApps)
    };
    if(next.powerButtonAction===this.value.powerButtonAction
      &&next.storeRecentApps===this.value.storeRecentApps)return;
    this.value=next;
    try{this.storage?.setItem(this.key,JSON.stringify(next));}
    catch{/* Private browsers retain settings in this active Guest session. */}
    for(const callback of this.listeners)callback(this.snapshot());
  }
}
export const sourceStartPreferences=new SourceStartPreferenceStore(browserStorage());

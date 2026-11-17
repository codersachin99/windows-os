import {browserStorage} from "./files";
import type {SourceRecentStorage} from "./recentPrograms";

/** Pinned taskbar.js taskbarDraft.type + taskbar-base.js taskbar-item:
 * `combine` renders icon-only, the two non-combine modes render a
 * full-size button with a label. The source does not actually change
 * loadItems() when selecting these options: it keeps each window id.
 * Lock, auto-hide and small-icon checkboxes are source-disabled.
 */
export type SourceTaskbarButtonMode=
  "combine"|"combine-when-full"|"no-combine";
export interface SourceTaskbarPreferences{
  type:SourceTaskbarButtonMode;
}
export const SOURCE_TASKBAR_PREFERENCES_KEY=
  "windows-os:guest:taskbar-preferences:v1";
export const SOURCE_DEFAULT_TASKBAR_PREFERENCES:SourceTaskbarPreferences=
  Object.freeze({type:"combine"});
export function isSourceTaskbarButtonMode(value:unknown):value is SourceTaskbarButtonMode{
  return value==="combine"||value==="combine-when-full"||value==="no-combine";
}
export class SourceTaskbarPreferenceStore{
  private value:SourceTaskbarPreferences;
  private listeners=new Set<(value:SourceTaskbarPreferences)=>void>();
  constructor(private readonly storage:SourceRecentStorage|undefined=undefined,
    private readonly key=SOURCE_TASKBAR_PREFERENCES_KEY){
    let parsed:unknown=null;
    try{parsed=JSON.parse(storage?.getItem(key)??"null");}catch{parsed=null;}
    const cfg=parsed&&typeof parsed==="object"?parsed as Record<string,unknown>:{};
    this.value={type:isSourceTaskbarButtonMode(cfg.type)?cfg.type:"combine"};
  }
  snapshot():SourceTaskbarPreferences{return {...this.value};}
  subscribe(listener:(value:SourceTaskbarPreferences)=>void):()=>void{
    this.listeners.add(listener);
    return ()=>{this.listeners.delete(listener);};
  }
  apply(value:SourceTaskbarPreferences):void{
    const type=isSourceTaskbarButtonMode(value.type)?value.type:"combine";
    if(this.value.type===type)return;
    this.value={type};
    try{this.storage?.setItem(this.key,JSON.stringify(this.value));}
    catch{/* The active Guest session continues in private-storage mode. */}
    for(const listener of this.listeners)listener(this.snapshot());
  }
}
export const sourceTaskbarPreferences=
  new SourceTaskbarPreferenceStore(browserStorage());

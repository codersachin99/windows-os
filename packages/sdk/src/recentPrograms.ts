import {browserStorage} from "./files";

/**
 * Source recentApps/ProgramEvent history used by the pinned startmenu-base,
 * startmenu-winxp (first seven) and startmenu-win11 (first six) modules.
 * Only program keys are stored; never paths, arguments or host processes.
 * Retention cap is an explicit local adapter until original Vuex persistence
 * has been source-paired. A new launch moves the app to the front.
 */
export const SOURCE_RECENT_PROGRAMS_KEY="windows-os:guest:recent-apps:v1";
export interface SourceRecentStorage{
  getItem(key:string):string|null;
  setItem(key:string,value:string):void;
}
export class SourceRecentPrograms{
  private entries:string[];
  private listeners=new Set<(ids:string[])=>void>();
  constructor(
    private readonly storage:SourceRecentStorage|undefined=undefined,
    private readonly key=SOURCE_RECENT_PROGRAMS_KEY,
    private readonly maxStored=32
  ){
    let raw:unknown=[];
    try{raw=JSON.parse(storage?.getItem(key)??"[]");}catch{raw=[];}
    this.entries=Array.isArray(raw)?[...new Set(raw.filter(
      (id):id is string=>typeof id==="string"&&/^[a-z][a-z0-9_-]*$/.test(id)
    ))].slice(0,maxStored):[];
  }
  snapshot():string[]{return [...this.entries];}
  subscribe(callback:(ids:string[])=>void):()=>void{
    this.listeners.add(callback);
    return ()=>{this.listeners.delete(callback);};
  }
  record(id:string):void{
    if(!/^[a-z][a-z0-9_-]*$/.test(id)||this.entries[0]===id)return;
    this.entries=[id,...this.entries.filter(value=>value!==id)]
      .slice(0,this.maxStored);
    try{this.storage?.setItem(this.key,JSON.stringify(this.entries));}catch{
      // Restricted browsers retain the active Guest session history in memory.
    }
    for(const listener of this.listeners)listener(this.snapshot());
  }
}
export const sourceRecentPrograms=new SourceRecentPrograms(browserStorage());

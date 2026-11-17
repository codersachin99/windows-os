import {browserStorage} from "@windows-os/sdk";

/**
 * Source taskbar-base.js pinnedPrograms / ProgramPin / ProgramUnpin state.
 * A permission-free browser-local shell preference: only registered app IDs
 * are accepted by callers. The host OS taskbar is never modified.
 */
export interface SourcePinStorage{
  getItem(key:string):string|null;
  setItem(key:string,value:string):void;
}
export const SOURCE_TASKBAR_PINS_KEY="windows-os:taskbar:pins:v1";

export class SourceTaskbarPins{
  private items:string[];
  private listeners=new Set<(pins:string[])=>void>();
  constructor(private readonly storage:SourcePinStorage|undefined=undefined,
    private readonly key=SOURCE_TASKBAR_PINS_KEY){
    let persisted:unknown=[];
    try{persisted=JSON.parse(storage?.getItem(key)??"[]");}catch{persisted=[];}
    this.items=Array.isArray(persisted)?[...new Set(persisted.filter(
      (id):id is string=>typeof id==="string"&&/^[a-z][a-z0-9_-]*$/.test(id)
    ))]:[];
  }
  snapshot():string[]{return [...this.items];}
  subscribe(listener:(pins:string[])=>void):()=>void{
    this.listeners.add(listener);
    return ()=>{this.listeners.delete(listener);};
  }
  contains(id:string):boolean{return this.items.includes(id);}
  toggle(id:string):boolean{
    if(!/^[a-z][a-z0-9_-]*$/.test(id))return false;
    this.items=this.items.includes(id)
      ?this.items.filter(value=>value!==id):[...this.items,id];
    try{this.storage?.setItem(this.key,JSON.stringify(this.items));}catch{
      // Storage can be unavailable in restricted browsing; keep session pins.
    }
    for(const notify of this.listeners)notify(this.snapshot());
    return this.items.includes(id);
  }
}
export const taskbarPins=new SourceTaskbarPins(browserStorage());

import {browserStorage} from "./files";
import type {SourceRecentStorage} from "./recentPrograms";
import {sourceSelectNotificationFeed,sourceNotificationVersionState,sourceNotificationStartSession,sourceNotificationShouldAskPush,type SourceFeedEntry,type SourceFeedContext,type SourceNotificationDeviceState} from "./sourceNotificationFeed";

/** Frozen vue-app 779a lifecycle. Persist device metadata and seen/read IDs, never remote
 * content. Trusted Guest publishers supply content; no feed is fetched here. */
export type SourceNotificationType="success"|"info"|"warning"|"error";
export type SourceNotificationInput={id:string;type:SourceNotificationType;title:string;body:string};
export type SourceNotification=Readonly<SourceNotificationInput&{seen:boolean;read:boolean}>;
export type SourceNotificationSnapshot=Readonly<{history:readonly SourceNotification[];queue:readonly string[]}>;
export const SOURCE_NOTIFICATION_TIMEOUT=8000;
export const SOURCE_NOTIFICATION_STORAGE_KEY="windows-os:device:notifications:v1";
const MAX_IDS=50;
type NotificationFlags=SourceNotificationDeviceState;

function appendIds(previous:readonly string[],ids:readonly string[]):string[]{
  return ids.reduce<string[]>((values,id)=>[...values.filter(value=>value!==id),id].slice(-MAX_IDS),[...previous]);
}
function readIds(value:unknown):string[]{
  return Array.isArray(value)?appendIds([],value.filter((id):id is string=>typeof id==="string"&&id.length>0)):[];
}
export function sourceNotificationCurrent(state:SourceNotificationSnapshot):SourceNotification|undefined{
  return state.history.find(message=>message.id===state.queue[0]);
}
export function sourceNotificationSeverity(state:SourceNotificationSnapshot):"error"|"warning"|undefined{
  return (["error","warning"] as const).find(type=>state.history.some(message=>!message.read&&message.type===type));
}
export class SourceNotificationStore{
  private state:SourceNotificationSnapshot={history:[],queue:[]};
  private listeners=new Set<()=>void>();
  private flags:NotificationFlags;
  private sessionStarted=false;
  constructor(private readonly storage:SourceRecentStorage|undefined=undefined,private readonly key=SOURCE_NOTIFICATION_STORAGE_KEY){
    let parsed:unknown=null;
    try{parsed=JSON.parse(storage?.getItem(key)??"null");}catch{/* unavailable or invalid */}
    const data=parsed&&typeof parsed==="object"?parsed as Record<string,unknown>:{};
    this.flags={seen:readIds(data.seen),read:readIds(data.read),
      ...(typeof data.version==="string"?{version:data.version}:{}),
      ...(typeof data.announced==="string"||data.announced===null?{announced:data.announced}:{}),
      ...(typeof data.announcedOn==="string"||data.announcedOn===null?{announcedOn:data.announcedOn}:{}),
      ...(typeof data.sessions==="number"&&Number.isSafeInteger(data.sessions)&&data.sessions>=0?{sessions:data.sessions}:{}),
      ...(typeof data.pushAsked==="boolean"?{pushAsked:data.pushAsked}:{})};
  }
  snapshot=()=>this.state;
  subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
  private update(next:SourceNotificationSnapshot){
    this.state=next;
    for(const listener of this.listeners)listener();
  }
  private remember(ids:readonly string[],read=false){
    if(!ids.length)return;
    this.flags={...this.flags,seen:appendIds(this.flags.seen,ids),read:read?appendIds(this.flags.read,ids):this.flags.read};
    this.persist();
  }
  private persist(){
    try{this.storage?.setItem(this.key,JSON.stringify(this.flags));}catch{/* Session works without storage. */}
  }
  /** Source load counts once per runtime, not every feed refresh. */
  prepareFeedSession(version:string,now:string):SourceNotificationDeviceState{
    this.flags=sourceNotificationVersionState(this.flags,version,now);
    if(!this.sessionStarted){this.sessionStarted=true;this.flags=sourceNotificationStartSession(this.flags);}
    this.persist();
    return {...this.flags,seen:[...this.flags.seen],read:[...this.flags.read]};
  }
  shouldAskPush(force=false):boolean{return sourceNotificationShouldAskPush(this.flags,force);}
  markPushAsked(){this.flags={...this.flags,pushAsked:true};this.persist();}
  /** Explicit source SetEntries boundary; replaces active feed, not an implicit network call. */
  replaceFeed(entries:readonly SourceFeedEntry[],context:SourceFeedContext){
    this.update(sourceSelectNotificationFeed(entries,context,this.flags));
  }
  publish(input:SourceNotificationInput):boolean{
    if(!input.id||!input.title||this.state.history.some(message=>message.id===input.id))return false;
    const seen=this.flags.seen.includes(input.id);
    const message:SourceNotification=Object.freeze({...input,seen,read:this.flags.read.includes(input.id)});
    this.update({history:[message,...this.state.history],queue:seen?this.state.queue:[...this.state.queue,message.id]});
    return true;
  }
  dismiss(id:string){
    if(!this.state.queue.includes(id))return;
    this.remember([id]);
    this.update({history:this.state.history.map(message=>message.id===id?{...message,seen:true}:message),queue:this.state.queue.filter(value=>value!==id)});
  }
  markRead(id:string){
    if(!this.state.history.some(message=>message.id===id))return;
    this.remember([id],true);
    this.update({history:this.state.history.map(message=>message.id===id?{...message,seen:true,read:true}:message),queue:this.state.queue.filter(value=>value!==id)});
  }
  markAllSeen(){
    const ids=this.state.queue;
    if(!ids.length)return;
    this.remember(ids);
    this.update({history:this.state.history.map(message=>ids.includes(message.id)?{...message,seen:true}:message),queue:[]});
  }
  markAllRead(){
    const ids=this.state.history.map(message=>message.id);
    if(!ids.length)return;
    this.remember(ids,true);
    if(!this.state.queue.length&&this.state.history.every(message=>message.read&&message.seen))return;
    this.update({history:this.state.history.map(message=>({...message,seen:true,read:true})),queue:[]});
  }
  promote(id:string):boolean{
    if(!this.state.history.some(message=>message.id===id))return false;
    this.update({...this.state,queue:[id,...this.state.queue.filter(value=>value!==id)]});
    return true;
  }
  /** Clear active session content, retaining original device-level ID flags. */
  reset(){this.update({history:[],queue:[]});}
}
export const sourceNotifications=new SourceNotificationStore(browserStorage());

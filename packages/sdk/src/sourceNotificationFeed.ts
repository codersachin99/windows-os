import type {SourceNotificationSnapshot,SourceNotificationType} from "./sourceNotifications";

/** Frozen vue-app.js 779a: deterministic selection, no network side effects. */
export type SourceLocalizedMessage=string|Readonly<Record<string,string>>;
export type SourceFeedTarget=Readonly<{
  platform?:readonly string[];minVersion?:string;maxVersion?:string;paid?:boolean;locale?:readonly string[];
}>;
export type SourceFeedEntry=Readonly<{
  id:string;type?:SourceNotificationType;title?:SourceLocalizedMessage;body?:SourceLocalizedMessage;
  from?:string;to?:string;target?:SourceFeedTarget;
}>;
export type SourceFeedContext=Readonly<{
  now:string;version:string;platform:string;locale:string;paid:boolean;
}>;
export type SourceFeedFlags=Readonly<{seen:readonly string[];read:readonly string[]}>;
export type SourceNotificationDeviceState=SourceFeedFlags&Readonly<{
  version?:string;announced?:string|null;announcedOn?:string|null;sessions?:number;pushAsked?:boolean;
}>;
const language=(locale:string)=>String(locale||"").split("-")[0];
export function sourceNotificationText(value:SourceLocalizedMessage|undefined,locale:string):string{
  if(!value)return "";
  if(typeof value==="string")return value;
  return value[locale]||value[language(locale)]||value.en||Object.values(value)[0]||"";
}
/** Numeric dotted segments, as in original g(); absent segments are zero. */
export function sourceNotificationCompareVersion(left:string,right:string):number{
  const a=String(left).split("."),b=String(right).split(".");
  for(let i=0;i<Math.max(a.length,b.length);i++){
    const diff=(parseInt(a[i])||0)-(parseInt(b[i])||0);
    if(diff)return diff;
  }
  return 0;
}
export function sourceFeedEligible(entry:SourceFeedEntry,ctx:SourceFeedContext):boolean{
  if(!entry?.id)return false;
  const {from,to,target={}}=entry;
  if(from&&from>ctx.now||to&&to<ctx.now)return false;
  if(target.platform&&!target.platform.includes(ctx.platform))return false;
  if(target.minVersion&&sourceNotificationCompareVersion(ctx.version,target.minVersion)<0)return false;
  if(target.maxVersion&&sourceNotificationCompareVersion(ctx.version,target.maxVersion)>0)return false;
  if(typeof target.paid==="boolean"&&target.paid!==ctx.paid)return false;
  if(target.locale&&!target.locale.some(value=>value===ctx.locale||value===language(ctx.locale)))return false;
  return true;
}
export function sourceSelectNotificationFeed(entries:readonly SourceFeedEntry[],ctx:SourceFeedContext,flags:SourceFeedFlags):SourceNotificationSnapshot{
  // A unique stable id is required by the React history/queue contract.
  const unique=new Set<string>();
  const selected=entries.filter(entry=>{
    if(!sourceFeedEligible(entry,ctx)||unique.has(entry.id))return false;
    unique.add(entry.id);return true;
  }).map(entry=>({
    id:entry.id,type:entry.type||"success" as const,
    title:sourceNotificationText(entry.title,ctx.locale),body:sourceNotificationText(entry.body,ctx.locale),
    from:entry.from||"",seen:flags.seen.includes(entry.id),read:flags.read.includes(entry.id)
  }));
  const history=[...selected].sort((a,b)=>b.from.localeCompare(a.from)).map(({from,...message})=>message);
  const queue=selected.filter(message=>!message.seen).sort((a,b)=>a.from.localeCompare(b.from)).map(message=>message.id);
  return {history,queue};
}
/** First installation does not announce; subsequent version changes do.
 * The caller increments sessions once per real runtime, not per reload call. */
export function sourceNotificationVersionState(state:SourceNotificationDeviceState|undefined,version:string,now:string):SourceNotificationDeviceState{
  const flags={seen:state?.seen||[],read:state?.read||[]};
  if(!state?.version)return {...flags,version,announced:null,announcedOn:null};
  if(state.version===version)return {...state,...flags};
  return {...state,...flags,version,announced:version,announcedOn:now};
}
export function sourceNotificationStartSession(state:SourceNotificationDeviceState):SourceNotificationDeviceState{
  return {...state,sessions:(state.sessions||0)+1};
}
export function sourceNotificationShouldAskPush(state:SourceNotificationDeviceState,force=false):boolean{
  return !state.pushAsked&&(force||(state.sessions||0)>=2);
}
export function sourceNotificationUpdateEntry(state:SourceNotificationDeviceState,update:{title:SourceLocalizedMessage;body:SourceLocalizedMessage}|undefined,now:string):SourceFeedEntry|undefined{
  if(!state.announced||!update)return undefined;
  return {id:"update-"+state.announced,type:"success",title:update.title,body:update.body,from:state.announcedOn||now};
}

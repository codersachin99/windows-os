import type {SourceRecentStorage} from "./recentPrograms";
import type {SourceNotificationStore,SourceNotificationSnapshot} from "./sourceNotifications";
import {sourceNotificationUpdateEntry,type SourceFeedEntry,type SourceFeedContext,type SourceLocalizedMessage} from "./sourceNotificationFeed";

/** Original 779a A(): injected feed, five-second timeout and cache fallback.
 * No implicit endpoint, automatic permission request or analytics. */
export const SOURCE_NOTIFICATION_FETCH_TIMEOUT=5000;
export type SourceNotificationCache={
  read(url:string):Promise<unknown>;
  write(url:string,entries:readonly SourceFeedEntry[]):Promise<void>;
};
export type SourceNotificationFetch=(url:string,init:{cache:"no-cache";signal:AbortSignal})=>Promise<{ok:boolean;json():Promise<unknown>}>;
export type SourceNotificationServiceOptions={
  url?:string;fetch?:SourceNotificationFetch;cache?:SourceNotificationCache;
  store:SourceNotificationStore;
};
const record=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==="object"&&!Array.isArray(value);
const stringList=(value:unknown)=>Array.isArray(value)&&value.every(v=>typeof v==="string");
const localized=(value:unknown)=>typeof value==="string"||(record(value)&&Object.values(value).every(v=>typeof v==="string"));
const optionalString=(value:unknown)=>value===undefined||typeof value==="string";
function validEntry(value:unknown):value is SourceFeedEntry{
  if(!record(value)||typeof value.id!=="string"||!value.id)return false;
  if(value.type!==undefined&&!["success","info","warning","error"].includes(String(value.type)))return false;
  if(value.title!==undefined&&!localized(value.title)||value.body!==undefined&&!localized(value.body))return false;
  if(!optionalString(value.from)||!optionalString(value.to))return false;
  const t=value.target;
  if(t===undefined)return true;
  return record(t)&&(t.platform===undefined||stringList(t.platform))&&(t.locale===undefined||stringList(t.locale))&&
    optionalString(t.minVersion)&&optionalString(t.maxVersion)&&(t.paid===undefined||typeof t.paid==="boolean");
}
export function sourceDecodeNotificationFeed(value:unknown):SourceFeedEntry[]{
  if(!Array.isArray(value))throw new Error("Notification feed is not a list");
  return value.filter(validEntry);
}
/** URL-scoped cache so one publisher cannot inherit another feed's content. */
export class SourceNotificationStorageCache implements SourceNotificationCache{
  constructor(private readonly storage:SourceRecentStorage,private readonly prefix="windows-os:device:notification-feed:v1:"){}
  async read(url:string):Promise<unknown>{return JSON.parse(this.storage.getItem(this.prefix+url)??"null");}
  async write(url:string,entries:readonly SourceFeedEntry[]){this.storage.setItem(this.prefix+url,JSON.stringify(entries));}
}
export class SourceNotificationService{
  private loadId=0;
  constructor(private readonly options:SourceNotificationServiceOptions){}
  private async entries():Promise<SourceFeedEntry[]>{
    const {url,fetch,cache}=this.options;
    if(!url)return [];
    const controller=new AbortController();
    let timer:ReturnType<typeof setTimeout>|undefined;
    try{
      if(!fetch)throw new Error("No feed transport");
      const timeout=new Promise<never>((_,reject)=>{
        timer=setTimeout(()=>{controller.abort();reject(new Error("Notification feed timed out"));},SOURCE_NOTIFICATION_FETCH_TIMEOUT);
      });
      const request=(async()=>{
        const response=await fetch(url,{cache:"no-cache",signal:controller.signal});
        if(!response.ok)throw new Error("Notification feed request failed");
        return sourceDecodeNotificationFeed(await response.json());
      })();
      const entries=await Promise.race([request,timeout]);
      try{await cache?.write(url,entries);}catch{/* A successful live response remains usable. */}
      return entries;
    }catch{
      try{return sourceDecodeNotificationFeed(await cache?.read(url));}catch{return [];}
    }finally{if(timer!==undefined)clearTimeout(timer);}
  }
  /** Most recent load wins. Explicit caller controls when a feed is replaced. */
  async load(context:SourceFeedContext,update?:{title:SourceLocalizedMessage;body:SourceLocalizedMessage}):Promise<SourceNotificationSnapshot>{
    const id=++this.loadId;
    const state=this.options.store.prepareFeedSession(context.version,context.now);
    const announcement=sourceNotificationUpdateEntry(state,update,context.now);
    const entries=await this.entries();
    if(id===this.loadId)this.options.store.replaceFeed(announcement?[announcement,...entries]:entries,context);
    return this.options.store.snapshot();
  }
}

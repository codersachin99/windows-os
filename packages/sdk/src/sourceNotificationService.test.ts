import {describe,it,expect,vi} from "vitest";
import {SourceNotificationStore} from "./sourceNotifications";
import {SourceNotificationService,SourceNotificationStorageCache,sourceDecodeNotificationFeed,SOURCE_NOTIFICATION_FETCH_TIMEOUT} from "./sourceNotificationService";
import type {SourceFeedContext} from "./sourceNotificationFeed";
const context:SourceFeedContext={now:"2026-11-25",version:"1.0",platform:"web",locale:"en-US",paid:false};
const feed=[{id:"news",title:"News",body:"Body"}];
const memory=()=>{const data=new Map<string,string>();return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};};
describe("source 779a notification service",()=>{
  it("caches valid feed and falls back offline, retaining seen flags",async()=>{
    const storage=memory(),store=new SourceNotificationStore(storage),cache=new SourceNotificationStorageCache(storage);
    const fetch=vi.fn(async()=>({ok:true,json:async()=>feed}));
    const service=new SourceNotificationService({store,url:"/feed",fetch,cache});
    expect((await service.load(context)).queue).toEqual(["news"]);
    expect(fetch).toHaveBeenCalledWith("/feed",expect.objectContaining({cache:"no-cache",signal:expect.any(AbortSignal)}));
    store.dismiss("news");
    const offline=new SourceNotificationService({store,url:"/feed",fetch:async()=>{throw Error("offline");},cache});
    const result=await offline.load(context);
    expect(result.queue).toEqual([]);
    expect(result.history[0]).toMatchObject({id:"news",seen:true,read:false});
    expect(await cache.read("/other")).toBeNull();
  });
  it("aborts a stalled transport at five seconds even if it ignores the signal",async()=>{
    vi.useFakeTimers();
    try{
      const store=new SourceNotificationStore();
      let signal:AbortSignal|undefined;
      const service=new SourceNotificationService({store,url:"/feed",fetch:(_url,init)=>{
        signal=init.signal;return new Promise(()=>{});
      },cache:{read:async()=>feed,write:async()=>{}}});
      const pending=service.load(context);
      await vi.advanceTimersByTimeAsync(SOURCE_NOTIFICATION_FETCH_TIMEOUT);
      expect(signal?.aborted).toBe(true);
      expect((await pending).queue).toEqual(["news"]);
    }finally{vi.useRealTimers();}
  });
  it("filters malformed entries and treats non-array as a failed feed",async()=>{
    expect(sourceDecodeNotificationFeed([...feed,null,{id:"bad",target:{locale:1}},{id:"bad2",title:{en:3}}])).toEqual(feed);
    expect(()=>sourceDecodeNotificationFeed({entries:feed})).toThrow();
    const service=new SourceNotificationService({store:new SourceNotificationStore(),url:"/feed",
      fetch:async()=>({ok:true,json:async()=>({})}),cache:{read:async()=>feed,write:async()=>{}}});
    expect((await service.load(context)).queue).toEqual(["news"]);
  });
  it("persists version and session metadata, counts once per runtime and suppresses seen update",async()=>{
    const storage=memory(),first=new SourceNotificationStore(storage);
    const fetch=vi.fn(async()=>({ok:true,json:async()=>feed}));
    const service=new SourceNotificationService({store:first,fetch});
    const update={title:"Updated",body:"Changes"};
    expect((await service.load(context,update)).history).toEqual([]);
    await service.load(context,update);
    expect(fetch).not.toHaveBeenCalled();
    expect(first.shouldAskPush()).toBe(false);
    const second=new SourceNotificationStore(storage);
    const secondService=new SourceNotificationService({store:second});
    const next={...context,version:"1.1"};
    expect((await secondService.load(next,update)).queue).toEqual(["update-1.1"]);
    expect(second.shouldAskPush()).toBe(true);
    second.markRead("update-1.1");second.markPushAsked();
    const third=new SourceNotificationStore(storage);
    expect((await new SourceNotificationService({store:third}).load(next,update)).queue).toEqual([]);
    expect(third.shouldAskPush(true)).toBe(false);
    expect(third.snapshot().history[0]).toMatchObject({read:true,seen:true});
  });
  it("does not replace a newer selection when an older request completes",async()=>{
    const store=new SourceNotificationStore();
    let finish:()=>void=()=>{};
    let calls=0;
    const service=new SourceNotificationService({store,url:"/feed",fetch:async()=>{
      if(++calls===1)await new Promise<void>(resolve=>{finish=resolve;});
      return {ok:true,json:async()=>[{id:calls===1?"old":"new"}]};
    }});
    const old=service.load(context);
    await service.load(context);
    store.dismiss("new");
    finish();await old;
    expect(store.snapshot().queue).toEqual([]);
  });
});

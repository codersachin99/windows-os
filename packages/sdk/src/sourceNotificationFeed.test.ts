import {describe,it,expect} from "vitest";
import {sourceNotificationText,sourceNotificationCompareVersion,sourceFeedEligible,sourceSelectNotificationFeed,sourceNotificationVersionState,sourceNotificationStartSession,sourceNotificationShouldAskPush,sourceNotificationUpdateEntry,type SourceFeedContext,type SourceFeedEntry} from "./sourceNotificationFeed";
const context:SourceFeedContext={now:"2026-11-25",version:"1.10.2",platform:"web",locale:"en-IN",paid:false};
const entry:SourceFeedEntry={id:"sample",title:"Title",body:"Body"};
describe("frozen 779a feed selection",()=>{
  it("uses numeric dotted segments and inclusive date/version bounds",()=>{
    expect(sourceNotificationCompareVersion("1.10","1.9")).toBeGreaterThan(0);
    expect(sourceNotificationCompareVersion("1.0","1")).toBe(0);
    expect(sourceFeedEligible({...entry,from:context.now,to:context.now,target:{minVersion:context.version,maxVersion:context.version}},context)).toBe(true);
    for(const excluded of [
      {...entry,from:"2026-11-26"},{...entry,to:"2026-11-24"},
      {...entry,target:{minVersion:"1.11"}},{...entry,target:{maxVersion:"1.9"}},
      {...entry,target:{platform:["android"]}},{...entry,target:{paid:true}},
      {...entry,target:{locale:["hi"]}},{...entry,id:""}
    ])expect(sourceFeedEligible(excluded,context)).toBe(false);
    expect(sourceFeedEligible({...entry,target:{platform:["web"],paid:false,locale:["en"]}},context)).toBe(true);
    expect(sourceFeedEligible({...entry,target:{locale:["en-IN"]}},context)).toBe(true);
  });
  it("localizes exact, language, English, first translation and empty values",()=>{
    const value={"en-IN":"India",en:"English",hi:"Hindi"};
    expect(sourceNotificationText(value,"en-IN")).toBe("India");
    expect(sourceNotificationText(value,"hi-IN")).toBe("Hindi");
    expect(sourceNotificationText(value,"de-DE")).toBe("English");
    expect(sourceNotificationText({fr:"French"},"de-DE")).toBe("French");
    expect(sourceNotificationText("Literal","en")).toBe("Literal");
    expect(sourceNotificationText(undefined,"en")).toBe("");
  });
  it("sorts history newest first and unseen queue oldest first without dropping read history",()=>{
    const entries:SourceFeedEntry[]=[
      {...entry,id:"new",from:"2026-11-25",type:"error"},
      {...entry,id:"old",from:"2026-11-01"},
      {...entry,id:"middle",from:"2026-11-10",title:{en:"Localized"}},
      {...entry,id:"seen",from:"2026-11-20"},
      {...entry,id:"read",from:"2026-11-21"},
      {...entry,id:"future",from:"2026-11-26"},
      {...entry,id:"old",from:"2026-11-01"}
    ];
    const snapshot=sourceSelectNotificationFeed(entries,context,{seen:["seen","read"],read:["read"]});
    expect(snapshot.history.map(m=>m.id)).toEqual(["new","read","seen","middle","old"]);
    expect(snapshot.queue).toEqual(["old","middle","new"]);
    expect(snapshot.history.find(m=>m.id==="middle")).toMatchObject({title:"Localized",type:"success",seen:false,read:false});
    expect(snapshot.history.find(m=>m.id==="read")).toMatchObject({seen:true,read:true});
  });
  it("does not announce first install, keeps announcement on same version, and creates version-specific update",()=>{
    const initial=sourceNotificationVersionState(undefined,"1.0","2026-11-01");
    expect(initial.announced).toBeNull();
    expect(sourceNotificationUpdateEntry(initial,{title:"Update",body:"New"},"2026-11-01")).toBeUndefined();
    const upgraded=sourceNotificationVersionState({...initial,seen:["a"],read:["a"]},"1.1","2026-11-25");
    expect(upgraded).toMatchObject({version:"1.1",announced:"1.1",announcedOn:"2026-11-25",seen:["a"],read:["a"]});
    expect(sourceNotificationVersionState(upgraded,"1.1","2026-11-26")).toEqual(upgraded);
    expect(sourceNotificationUpdateEntry(upgraded,{title:"Update",body:"New"},"2026-11-26")).toEqual({id:"update-1.1",type:"success",title:"Update",body:"New",from:"2026-11-25"});
    expect(sourceNotificationUpdateEntry(upgraded,undefined,"2026-11-26")).toBeUndefined();
  });
  it("only becomes push-eligible on second session or forced, never after asking",()=>{
    const initial=sourceNotificationVersionState(undefined,"1","2026-11-25");
    const first=sourceNotificationStartSession(initial),second=sourceNotificationStartSession(first);
    expect(sourceNotificationShouldAskPush(first)).toBe(false);
    expect(sourceNotificationShouldAskPush(first,true)).toBe(true);
    expect(sourceNotificationShouldAskPush(second)).toBe(true);
    expect(sourceNotificationShouldAskPush({...second,pushAsked:true},true)).toBe(false);
  });
  it("applies selected feed to the notification store using its persisted seen flags",async()=>{
    const {SourceNotificationStore}=await import("./sourceNotifications");
    const store=new SourceNotificationStore();
    store.replaceFeed([{...entry,id:"a"},{...entry,id:"b",from:"2026-11-25"}],context);
    expect(store.snapshot().queue).toEqual(["a","b"]);
    store.markRead("a");
    store.replaceFeed([{...entry,id:"a"},{...entry,id:"b",from:"2026-11-25"}],context);
    expect(store.snapshot().queue).toEqual(["b"]);
    expect(store.snapshot().history.find(m=>m.id==="a")).toMatchObject({read:true,seen:true});
  });
});

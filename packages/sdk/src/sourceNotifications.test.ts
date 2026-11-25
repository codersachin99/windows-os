import {describe,it,expect} from "vitest";
import {SourceNotificationStore,sourceNotificationCurrent,sourceNotificationSeverity,SOURCE_NOTIFICATION_TIMEOUT} from "./sourceNotifications";
describe("Guest notification history and toast queue",()=>{
  it("deduplicates, queues and retains dismissed messages",()=>{
    const store=new SourceNotificationStore();
    const message={id:"a",type:"warning",title:"Warning",body:"A"} as const;
    expect(store.publish(message)).toBe(true);
    expect(store.publish(message)).toBe(false);
    store.publish({id:"b",type:"error",title:"Error",body:"B"});
    expect(sourceNotificationCurrent(store.snapshot())?.id).toBe("a");
    store.dismiss("a");
    expect(sourceNotificationCurrent(store.snapshot())?.id).toBe("b");
    expect(store.snapshot().history.find(m=>m.id==="a")).toMatchObject({seen:true,read:false});
    expect(store.snapshot().history.map(m=>m.id)).toEqual(["b","a"]);
    expect(SOURCE_NOTIFICATION_TIMEOUT).toBe(8000);
  });
  it("distinguishes seen and read, cleans up session and subscribers",()=>{
    const store=new SourceNotificationStore();
    let updates=0;
    const stop=store.subscribe(()=>updates++);
    store.publish({id:"a",type:"warning",title:"Warning",body:"A"});
    store.markAllSeen();
    expect(store.snapshot().history[0]).toMatchObject({seen:true,read:false});
    expect(store.snapshot().queue).toEqual([]);
    expect(sourceNotificationSeverity(store.snapshot())).toBe("warning");
    store.markAllRead();
    expect(store.snapshot().history[0]).toMatchObject({seen:true,read:true});
    expect(store.snapshot().queue).toEqual([]);
    expect(sourceNotificationSeverity(store.snapshot())).toBeUndefined();
    expect(updates).toBe(3);
    stop();
    store.reset();
    expect(store.snapshot().history).toEqual([]);
    expect(updates).toBe(3);
  });
});

const message=(id:string,type:"success"|"info"|"warning"|"error"="success")=>({id,type,title:id,body:"Body"});
it("only unread errors and warnings affect source severity",()=>{
  const store=new SourceNotificationStore();
  store.publish(message("success"));store.publish(message("info","info"));
  expect(sourceNotificationSeverity(store.snapshot())).toBeUndefined();
  store.publish(message("warning","warning"));store.publish(message("error","error"));
  expect(sourceNotificationSeverity(store.snapshot())).toBe("error");
  store.markRead("error");
  expect(sourceNotificationSeverity(store.snapshot())).toBe("warning");
  expect(store.snapshot().queue).not.toContain("error");
  store.markAllRead();
  expect(sourceNotificationSeverity(store.snapshot())).toBeUndefined();
  expect(store.snapshot().queue).toEqual([]);
});
it("promotes an existing item without duplicating pending entries",()=>{
  const store=new SourceNotificationStore();
  store.publish(message("a"));store.publish(message("b"));
  expect(store.promote("missing")).toBe(false);
  expect(store.promote("b")).toBe(true);
  expect(store.snapshot().queue).toEqual(["b","a"]);
  store.dismiss("b");
  expect(store.promote("b")).toBe(true);
  expect(store.snapshot().queue).toEqual(["b","a"]);
  store.markAllSeen();
  expect(store.snapshot().queue).toEqual([]);
  expect(store.snapshot().history.every(m=>m.seen&&!m.read)).toBe(true);
});
it("persists only the last 50 seen/read IDs, restores on republish and survives session reset",()=>{
  let raw:string|null=null;
  const storage={getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}};
  const store=new SourceNotificationStore(storage);
  for(let i=0;i<52;i++){store.publish(message("id"+i));store.markRead("id"+i);}
  const flags=JSON.parse(raw??"{}");
  expect(flags.seen).toHaveLength(50);
  expect(flags.read).toEqual(flags.seen);
  expect(flags.seen[0]).toBe("id2");
  expect(flags.seen[49]).toBe("id51");
  expect(Object.keys(flags).sort()).toEqual(["read","seen"]);
  store.reset();store.publish(message("id51"));
  expect(store.snapshot().queue).toEqual([]);
  const restored=new SourceNotificationStore(storage);
  restored.publish(message("id51"));restored.publish(message("id0"));
  expect(restored.snapshot().history.find(m=>m.id==="id51")).toMatchObject({seen:true,read:true});
  expect(restored.snapshot().queue).toEqual(["id0"]);
});
it("handles corrupt or restricted storage without losing active-session behavior",()=>{
  const store=new SourceNotificationStore({getItem:()=>"{broken",setItem:()=>{throw Error("blocked");}});
  store.publish(message("a","warning"));
  store.dismiss("a");
  expect(store.snapshot().history[0]).toMatchObject({seen:true,read:false});
  expect(store.snapshot().queue).toEqual([]);
});

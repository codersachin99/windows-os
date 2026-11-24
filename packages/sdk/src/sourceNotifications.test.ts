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
    expect(sourceNotificationSeverity(store.snapshot())).toBe("warning");
    store.markAllRead();
    expect(store.snapshot().history[0]).toMatchObject({seen:true,read:true});
    expect(sourceNotificationSeverity(store.snapshot())).toBeUndefined();
    expect(updates).toBe(3);
    stop();
    store.reset();
    expect(store.snapshot().history).toEqual([]);
    expect(updates).toBe(3);
  });
});

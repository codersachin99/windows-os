import {describe,it,expect} from "vitest";
import {sourceNotificationAnchor} from "./sourceNotificationAnchor";
describe("f0ed notification balloon geometry",()=>{
  const desktop={width:1280,height:720},balloon={width:360,height:100};
  it("aligns above the tray item with the tail pointing toward its center",()=>{
    expect(sourceNotificationAnchor({left:1120,top:680,width:20,height:32},balloon,desktop,"top")).toEqual({left:780,top:562,tailLeft:334});
  });
  it("aligns below the source top-bar icon",()=>{
    const p=sourceNotificationAnchor({left:1130,top:0,width:20,height:30},balloon,desktop,"bottom");
    expect(p).toEqual({left:790,top:48,tailLeft:334});
  });
  it("keeps narrow viewport and RTL placements bounded",()=>{
    expect(sourceNotificationAnchor({left:5,top:680,width:20,height:32},{width:290,height:100},{width:320,height:720},"top",true)).toEqual({left:8,top:562,tailLeft:8});
    const p=sourceNotificationAnchor({left:1260,top:680,width:20,height:32},balloon,desktop,"top");
    expect(p.left).toBe(912);expect(p.tailLeft).toBe(334);
  });
  it("supports the original 24px Onebit tail",()=>{
    const p=sourceNotificationAnchor({left:1120,top:680,width:24,height:32},balloon,desktop,"top",false,24);
    expect(p.top).toBe(556);expect(p.tailLeft).toBe(328);
  });
});

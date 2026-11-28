import {describe,it,expect} from "vitest";
import {sourceChromeOSLauncherItems,sourceChromeOSRecentItems} from "./sourceChromeOSLauncher";
describe("original ChromeOS launcher program lists",()=>{
  it("merges three core programs without duplicating, then sorts",()=>{
    const items=[{id:"z",label:"Z",available:false},{id:"computer",label:"Computer",available:false}];
    const core=[{id:"computer",label:"Computer",available:true},{id:"cpanel",label:"Control Panel",available:true}];
    const all=sourceChromeOSLauncherItems(items,core);
    expect(all.map(item=>item.id)).toEqual(["computer","cpanel","z"]);
    expect(all[0].available).toBe(true);
  });
  it("limits recent list to five available unique entries in history order",()=>{
    const all=Array.from({length:7},(_,i)=>({id:String(i),label:String(i),available:i!==0}));
    expect(sourceChromeOSRecentItems(all,["0","6","6","5","4","3","2","1"]).map(item=>item.id)).toEqual(["6","5","4","3","2"]);
  });
});

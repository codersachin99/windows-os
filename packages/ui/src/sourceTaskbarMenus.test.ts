import {describe,expect,it} from "vitest";
import {sourceTaskbarBackgroundMenu,sourceTaskbarItemMenu} from "./sourceTaskbarMenus";
describe("source taskbar-base.js menu order and executable actions",()=>{
  it("pinned closed apps offer Open and Unpin, running apps offer Unpin and Close",()=>{
    expect(sourceTaskbarItemMenu(true,false)).toEqual([
      {id:"open",label:"Open",disabled:false},
      {id:"pin",label:"Unpin from taskbar",disabled:false}
    ]);
    expect(sourceTaskbarItemMenu(false,true)).toEqual([
      {id:"pin",label:"Pin to taskbar",disabled:false},
      {id:"close",label:"Close window",disabled:false}
    ]);
    expect(sourceTaskbarItemMenu(false,false).map(v=>v.id)).toEqual(["open","pin"]);
  });
  it("keeps genuine original background menu order and only working actions enabled",()=>{
    const menu=sourceTaskbarBackgroundMenu();
    expect(menu.map(v=>v.id)).toEqual([
      "toolbar","cascade","stack","side","show-desktop","taskmgr","properties"
    ]);
    expect(menu.filter(v=>v.dividerAfter).map(v=>v.id)).toEqual(["toolbar","show-desktop"]);
    expect(menu.filter(v=>!v.disabled).map(v=>v.id)).toEqual([
      "show-desktop","taskmgr","properties"
    ]);
  });
});

import {describe,expect,it,vi} from "vitest";
import {
  SOURCE_RECENT_PROGRAMS_KEY,SourceRecentPrograms
} from "./recentPrograms";
function backing(initial:string|null=null){
  let current=initial;
  return {
    getItem:vi.fn((key:string)=>key===SOURCE_RECENT_PROGRAMS_KEY?current:null),
    setItem:vi.fn((key:string,v:string)=>{
      if(key===SOURCE_RECENT_PROGRAMS_KEY)current=v;
    })
  };
}
describe("pinned startmenu-base/winxp/win11 source recentApps history",()=>{
  it("records actual launches in most-recent-first unique order",()=>{
    const store=backing();
    const recent=new SourceRecentPrograms(store);
    const notify=vi.fn();
    const stop=recent.subscribe(notify);
    recent.record("notepad");recent.record("calc");recent.record("notepad");
    expect(recent.snapshot()).toEqual(["notepad","calc"]);
    expect(notify).toHaveBeenCalledTimes(3);
    const restored=new SourceRecentPrograms(store);
    expect(restored.snapshot()).toEqual(["notepad","calc"]);
    recent.record("notepad");
    expect(notify).toHaveBeenCalledTimes(3);
    stop();recent.record("cmd");
    expect(notify).toHaveBeenCalledTimes(3);
  });
  it("caps history without corrupt keys and keeps subscriber values isolated",()=>{
    const recent=new SourceRecentPrograms(backing(),SOURCE_RECENT_PROGRAMS_KEY,3);
    for(const key of ["notepad","calc","cmd","run","not valid","../hack"]){
      recent.record(key);
    }
    expect(recent.snapshot()).toEqual(["run","cmd","calc"]);
    const snapshot=recent.snapshot();snapshot.push("spoof");
    expect(recent.snapshot()).toEqual(["run","cmd","calc"]);
  });
  it("restores only valid serialized keys and handles forbidden storage",()=>{
    const recent=new SourceRecentPrograms(backing(
      '["notepad","notepad",3,"NO SPACE","cmd"]'));
    expect(recent.snapshot()).toEqual(["notepad","cmd"]);
    expect(new SourceRecentPrograms(backing("invalid json")).snapshot()).toEqual([]);
    const restricted=new SourceRecentPrograms({
      getItem:()=>null,
      setItem:()=>{throw Error("Forbidden");}
    });
    restricted.record("calc");
    expect(restricted.snapshot()).toEqual(["calc"]);
  });
});

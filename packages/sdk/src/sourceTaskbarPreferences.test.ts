import {describe,expect,it,vi} from "vitest";
import {
  SourceTaskbarPreferenceStore,SOURCE_TASKBAR_PREFERENCES_KEY,
  SOURCE_DEFAULT_TASKBAR_PREFERENCES,isSourceTaskbarButtonMode
} from "./sourceTaskbarPreferences";
describe("pinned taskbar.js taskbarDraft.type",()=>{
  it("starts with the original icon-only combine mode",()=>{
    expect(new SourceTaskbarPreferenceStore().snapshot())
      .toEqual(SOURCE_DEFAULT_TASKBAR_PREFERENCES);
    for(const type of ["combine","combine-when-full","no-combine"])
      expect(isSourceTaskbarButtonMode(type)).toBe(true);
    for(const type of ["","always","center",true,null])
      expect(isSourceTaskbarButtonMode(type)).toBe(false);
  });
  it("persists the full-size labels mode with subscriber update and no duplicates",()=>{
    let stored:string|null=null;
    const storage={
      getItem:(key:string)=>key===SOURCE_TASKBAR_PREFERENCES_KEY?stored:null,
      setItem:(key:string,value:string)=>{
        expect(key).toBe(SOURCE_TASKBAR_PREFERENCES_KEY);stored=value;
      }
    };
    const settings=new SourceTaskbarPreferenceStore(storage);
    const listener=vi.fn(),unsubscribe=settings.subscribe(listener);
    settings.apply({type:"no-combine"});
    expect(settings.snapshot()).toEqual({type:"no-combine"});
    expect(new SourceTaskbarPreferenceStore(storage).snapshot()).toEqual({
      type:"no-combine"
    });
    settings.apply({type:"no-combine"});
    expect(listener).toHaveBeenCalledTimes(1);
    settings.apply({type:"combine-when-full"});
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    settings.apply({type:"combine"});
    expect(listener).toHaveBeenCalledTimes(2);
  });
  it("ignores unknown and malformed settings and survives restricted storage",()=>{
    for(const raw of ["not json","null","[]",
      '{"type":"unknown"}','{"type":42}']){
      const prefs=new SourceTaskbarPreferenceStore({
        getItem:()=>raw,setItem:()=>{throw Error("read-only");}
      });
      expect(prefs.snapshot()).toEqual({type:"combine"});
      expect(()=>prefs.apply({type:"no-combine"})).not.toThrow();
      expect(prefs.snapshot().type).toBe("no-combine");
      prefs.apply({type:"other" as "combine"});
      expect(prefs.snapshot().type).toBe("combine");
    }
  });
});

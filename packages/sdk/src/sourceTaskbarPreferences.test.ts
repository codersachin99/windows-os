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
    settings.apply({type:"no-combine",useAeroPeek:false});
    expect(settings.snapshot()).toEqual({type:"no-combine",useAeroPeek:false});
    expect(new SourceTaskbarPreferenceStore(storage).snapshot()).toEqual({
      type:"no-combine",useAeroPeek:false
    });
    settings.apply({type:"no-combine",useAeroPeek:false});
    expect(listener).toHaveBeenCalledTimes(1);
    settings.apply({type:"combine-when-full",useAeroPeek:false});
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    settings.apply({type:"combine",useAeroPeek:false});
    expect(listener).toHaveBeenCalledTimes(2);
  });
  it("ignores unknown and malformed settings and survives restricted storage",()=>{
    for(const raw of ["not json","null","[]",
      '{"type":"unknown"}','{"type":42}']){
      const prefs=new SourceTaskbarPreferenceStore({
        getItem:()=>raw,setItem:()=>{throw Error("read-only");}
      });
      expect(prefs.snapshot()).toEqual({type:"combine",useAeroPeek:false});
      expect(()=>prefs.apply({type:"no-combine",useAeroPeek:false})).not.toThrow();
      expect(prefs.snapshot().type).toBe("no-combine");
      prefs.apply({type:"other" as "combine",useAeroPeek:false});
      expect(prefs.snapshot().type).toBe("combine");
    }
  });
  it("keeps legacy v1 button-only records and reads strict Aero Peek booleans",()=>{
    const older=new SourceTaskbarPreferenceStore({
      getItem:()=>JSON.stringify({type:"no-combine"}),
      setItem:()=>{}
    });
    expect(older.snapshot()).toEqual({type:"no-combine",useAeroPeek:false});
    for(const raw of [
      '{"type":"combine","useAeroPeek":"true"}',
      '{"type":"combine","useAeroPeek":1}',
      '{"type":"combine","useAeroPeek":null}'
    ]){
      const prefs=new SourceTaskbarPreferenceStore({getItem:()=>raw,setItem:()=>{}});
      expect(prefs.snapshot().useAeroPeek).toBe(false);
    }
    const persisted=new SourceTaskbarPreferenceStore({
      getItem:()=>JSON.stringify({type:"combine",useAeroPeek:true}),
      setItem:()=>{}
    });
    expect(persisted.snapshot().useAeroPeek).toBe(true);
  });
  it("notifies and saves only on effective Aero Peek state changes",()=>{
    let record:string|null=null;
    const storage={
      getItem:()=>record,
      setItem:(_key:string,value:string)=>{record=value;}
    };
    const store=new SourceTaskbarPreferenceStore(storage);
    const notified=vi.fn();
    store.subscribe(notified);
    store.apply({type:"combine",useAeroPeek:true});
    expect(JSON.parse(record!)).toEqual({type:"combine",useAeroPeek:true});
    expect(notified).toHaveBeenCalledTimes(1);
    store.apply({type:"combine",useAeroPeek:true});
    expect(notified).toHaveBeenCalledTimes(1);
    store.apply({type:"combine",useAeroPeek:false});
    expect(notified).toHaveBeenCalledTimes(2);
  });

});

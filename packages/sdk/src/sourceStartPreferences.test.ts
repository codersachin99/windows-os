import {describe,expect,it,vi} from "vitest";
import {SourceStartPreferenceStore,SOURCE_START_PREFERENCES_KEY} from "./sourceStartPreferences";
describe("source taskbar.js startmenuDraft preference persistence",()=>{
  it("defaults to source shutdown button and recent apps history enabled",()=>{
    expect(new SourceStartPreferenceStore().snapshot()).toEqual({
      powerButtonAction:"shutdown",storeRecentApps:true
    });
  });
  it("persists a working Start power action and recent apps toggle",()=>{
    let payload:string|null=null;
    const storage={
      getItem:(key:string)=>key===SOURCE_START_PREFERENCES_KEY?payload:null,
      setItem:(key:string,value:string)=>{expect(key).toBe(SOURCE_START_PREFERENCES_KEY);payload=value;}
    };
    const prefs=new SourceStartPreferenceStore(storage);
    const cb=vi.fn();const unsubscribe=prefs.subscribe(cb);
    prefs.apply({powerButtonAction:"restart",storeRecentApps:false});
    expect(prefs.snapshot()).toEqual({
      powerButtonAction:"restart",storeRecentApps:false
    });
    expect(new SourceStartPreferenceStore(storage).snapshot()).toEqual(prefs.snapshot());
    prefs.apply({powerButtonAction:"restart",storeRecentApps:false});
    expect(cb).toHaveBeenCalledTimes(1);
    unsubscribe();
    prefs.apply({powerButtonAction:"shutdown",storeRecentApps:true});
    expect(cb).toHaveBeenCalledTimes(1);
  });
  it("ignores malformed storage, unknown power action and restricted storage",()=>{
    const prefs=new SourceStartPreferenceStore({
      getItem:()=>'{"powerButtonAction":"invented","storeRecentApps":7}',
      setItem:()=>{throw Error("blocked");}
    });
    expect(prefs.snapshot()).toEqual({powerButtonAction:"shutdown",storeRecentApps:true});
    expect(()=>{
      prefs.apply({powerButtonAction:"logoff",storeRecentApps:false});
    }).not.toThrow();
    expect(prefs.snapshot().powerButtonAction).toBe("logoff");
  });
});

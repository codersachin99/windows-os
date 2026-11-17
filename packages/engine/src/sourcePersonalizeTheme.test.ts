import {describe,expect,it} from "vitest";
import {SOURCE_ACTIVE_THEME_KEY,sourceSavedTheme} from "./index";
describe("original ChangeTheme persisted XP/7/11 skin",()=>{
  it("recovers only the currently migrated source skin IDs",()=>{
    expect(sourceSavedTheme({getItem:key=>
      key===SOURCE_ACTIVE_THEME_KEY?"win11":null})).toBe("win11");
    expect(sourceSavedTheme({getItem:()=> "winxp"})).toBe("winxp");
    expect(sourceSavedTheme({getItem:()=> "win7"})).toBe("win7");
    expect(sourceSavedTheme({getItem:()=> "bad_theme"})).toBeNull();
    expect(sourceSavedTheme({getItem:()=>null})).toBeNull();
  });
  it("handles denied browser storage",()=>{
    expect(sourceSavedTheme({getItem:()=>{throw Error("blocked");}})).toBeNull();
    expect(sourceSavedTheme(undefined)).toBeNull();
  });
});

import {describe,expect,it} from "vitest";
import {SOURCE_ACTIVE_THEME_KEY,sourceSavedTheme} from "./index";
describe("source-pinned theme persistence from full original catalog",()=>{
  it("validates saved names against all original source themes, not only the first three skins",()=>{
    expect(sourceSavedTheme({getItem:key=>
      key===SOURCE_ACTIVE_THEME_KEY?"win11":null})).toBe("win11");
    expect(sourceSavedTheme({getItem:()=> "winxp"})).toBe("winxp");
    expect(sourceSavedTheme({getItem:()=> "win7"})).toBe("win7");
    expect(sourceSavedTheme({getItem:()=> "aeroNoir"})).toBe("aeroNoir");
    expect(sourceSavedTheme({getItem:()=> "winxpE"})).toBe("winxpE");
    expect(sourceSavedTheme({getItem:()=> "win11dark"})).toBe("win11dark");
    expect(sourceSavedTheme({getItem:()=> "__proto__"})).toBeNull();
    expect(sourceSavedTheme({getItem:()=> "bad_theme"})).toBeNull();
    expect(sourceSavedTheme({getItem:()=>null})).toBeNull();
  });
  it("handles denied browser storage",()=>{
    expect(sourceSavedTheme({getItem:()=>{throw Error("blocked");}})).toBeNull();
    expect(sourceSavedTheme(undefined)).toBeNull();
  });
});

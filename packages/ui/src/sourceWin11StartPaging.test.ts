import {describe,expect,it} from "vitest";
import {
  SOURCE_WIN11_START_PAGE_SIZE,sourceWin11PageCount,
  sourceWin11StartPage,sourceWin11NextStartPage
} from "./sourceWin11StartPaging";
describe("original startmenu-win11 18ee twelve-program paged grid",()=>{
  it("uses source pageItemCount=12, with no empty trailing page",()=>{
    expect(SOURCE_WIN11_START_PAGE_SIZE).toBe(12);
    expect(sourceWin11PageCount(0)).toBe(1);
    expect(sourceWin11PageCount(12)).toBe(1);
    expect(sourceWin11PageCount(13)).toBe(2);
    expect(sourceWin11PageCount(24)).toBe(2);
    expect(sourceWin11PageCount(25)).toBe(3);
  });
  it("returns exact stable slices, clamping malformed or out of range pages",()=>{
    const ids=Array.from({length:26},(_,i)=>"program-"+i);
    expect(sourceWin11StartPage(ids,1)).toEqual(ids.slice(0,12));
    expect(sourceWin11StartPage(ids,2)).toEqual(ids.slice(12,24));
    expect(sourceWin11StartPage(ids,3)).toEqual(ids.slice(24));
    expect(sourceWin11StartPage(ids,42)).toEqual(ids.slice(24));
    expect(sourceWin11StartPage(ids,Number.NaN)).toEqual(ids.slice(0,12));
    expect(sourceWin11StartPage(ids,-2)).toEqual(ids.slice(0,12));
  });
  it("maps original wheel/swipe direction without wrapping",()=>{
    expect(sourceWin11NextStartPage(1,3,1)).toBe(2);
    expect(sourceWin11NextStartPage(2,3,1)).toBe(3);
    expect(sourceWin11NextStartPage(3,3,1)).toBe(3);
    expect(sourceWin11NextStartPage(3,3,-1)).toBe(2);
    expect(sourceWin11NextStartPage(1,3,-1)).toBe(1);
    expect(sourceWin11NextStartPage(2,3,0)).toBe(2);
  });
});

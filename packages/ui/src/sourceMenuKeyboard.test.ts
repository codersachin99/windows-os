import {describe,it,expect} from "vitest";
import {sourceMenuArrowIndex} from "./sourceMenuKeyboard";
describe("shared source menu roving arrow keys",()=>{
  it("focuses first/last when entering and wraps around",()=>{
    expect(sourceMenuArrowIndex(-1,4,"ArrowDown")).toBe(0);
    expect(sourceMenuArrowIndex(-1,4,"ArrowUp")).toBe(3);
    expect(sourceMenuArrowIndex(3,4,"ArrowDown")).toBe(0);
    expect(sourceMenuArrowIndex(0,4,"ArrowUp")).toBe(3);
    expect(sourceMenuArrowIndex(1,4,"ArrowDown")).toBe(2);
    expect(sourceMenuArrowIndex(2,4,"ArrowUp")).toBe(1);
  });
  it("never focuses an item when the menu has no enabled choices",()=>{
    expect(sourceMenuArrowIndex(-1,0,"ArrowDown")).toBe(-1);
    expect(sourceMenuArrowIndex(0,0,"ArrowUp")).toBe(-1);
  });
});

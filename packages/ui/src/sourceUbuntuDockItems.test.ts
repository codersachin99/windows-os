import {describe,it,expect} from "vitest";
import {sourceUbuntuDockItems} from "./sourceUbuntuDockItems";
describe("original Ubuntu dock item ordering",()=>{
  it("uses only the first three recents followed by unique running apps",()=>{
    expect(sourceUbuntuDockItems(["calc","notepad","computer","cmd"],["notepad","bin","calc","cmd"]))
      .toEqual(["calc","notepad","computer","bin","cmd"]);
  });
  it("does not invent pinned or fixed programs",()=>{
    expect(sourceUbuntuDockItems([],[])).toEqual([]);
    expect(sourceUbuntuDockItems([],["computer","computer"])).toEqual(["computer"]);
  });
});

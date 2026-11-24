import {expect,it} from "vitest";
import {sourceMacOSDockGroups} from "./sourceMacOSDockGroups";
it("keeps the original fixed shortcuts and three dock groups",()=>{
  expect(sourceMacOSDockGroups([],[],[])).toEqual([
    ["computer","launchpad","cpanel"],[],["bin"]
  ]);
});
it("preserves pin order, recent limit and stable running order without duplicate entries",()=>{
  expect(sourceMacOSDockGroups(
    ["computer","notepad","cpanel","bin","notepad"],
    ["calc","notepad","chrome","camera"],
    ["computer","calc","player","bin","player","notepad"]
  )).toEqual([["computer","launchpad","notepad","cpanel"],
    ["calc","chrome","player"],["bin"]]);
});

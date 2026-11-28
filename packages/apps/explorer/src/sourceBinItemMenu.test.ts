import {describe,expect,it} from "vitest";
import {sourceBinItemMenu,SOURCE_BIN_ITEM_ACTIONS} from "./sourceBinItemMenu";
describe("source main.js Bin ExplorerItemMenu host===bin",()=>{
  it("is exactly Restore / Delete / disabled Properties, no Open folder",()=>{
    expect(SOURCE_BIN_ITEM_ACTIONS.map(x=>x.id))
      .toEqual(["restore","delete","properties"]);
    expect(sourceBinItemMenu(true)).toEqual([
      {id:"restore",label:"Restore",disabled:false},
      {id:"delete",label:"Delete",disabled:false},
      {id:"properties",label:"Properties",disabled:true}
    ]);
  });
  it("protects malformed entries lacking the original restore path",()=>{
    expect(sourceBinItemMenu(false)).toEqual([
      {id:"restore",label:"Restore",disabled:true},
      {id:"delete",label:"Delete",disabled:false},
      {id:"properties",label:"Properties",disabled:true}
    ]);
  });
});

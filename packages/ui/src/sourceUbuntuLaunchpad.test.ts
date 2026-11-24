import {describe,it,expect} from "vitest";
import {sourceUbuntuProgramMatches,sourceUbuntuPageSize} from "./sourceUbuntuLaunchpad";
describe("Ubuntu overview",()=>{
  it("uses source word matching and ranks exact names, excluding unavailable apps",()=>{
    expect(sourceUbuntuProgramMatches([{id:"a",label:"Notepad Plus",available:true},{id:"b",label:"Notepad",available:true},{id:"c",label:"Notepad",available:false},{id:"d",label:"MyNotepad",available:true}],"notepad").map(item=>item.id)).toEqual(["b","a"]);
  });
  it("uses 7 by 3 source grid and compact 3 by 3 adaptation",()=>{expect(sourceUbuntuPageSize(false)).toBe(21);expect(sourceUbuntuPageSize(true)).toBe(9);});
});

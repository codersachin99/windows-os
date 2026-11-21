import {describe,expect,it} from "vitest";
import type {AppDefinition} from "@windows-os/contracts";
import {sourceWin11AllAppItems} from "./sourceWin11AllApps";
const app=(id:string,label:string,showInStart=true):AppDefinition=>({
  id,label,showInStart,desktop:false,kind:"utility",
  icon:"/fake",window:{width:400,height:300}
});
describe("source Win11 18ee allProgramItems alphabetical flat pane",()=>{
  it("sorts c170 programs and separate device apps, deduplicating by id",()=>{
    const list=sourceWin11AllAppItems([
      {id:"wordpad",name:"WordPad"},
      {id:"notepad",name:"Notepad"},
      {id:"bin",name:"Recycle Bin",hidden:true},
      {id:"calc",name:"Calculator"}
    ],[app("notepad","Notepad"),app("calc","Calculator"),
      app("web_contacts","Contacts"),app("hidden","Internal",false)]);
    expect(list).toEqual([
      {id:"calc",label:"Calculator",available:true},
      {id:"web_contacts",label:"Contacts",available:true},
      {id:"notepad",label:"Notepad",available:true},
      {id:"wordpad",label:"WordPad",available:false}
    ]);
  });
  it("does not turn an unavailable original source app into a fake launcher",()=>{
    const list=sourceWin11AllAppItems([
      {id:"wordpad",name:"WordPad"},
      {id:"mahjong",name:"Mahjong Titans"},
      {id:"wordpad",name:"WordPad"}
    ],[]);
    expect(list).toEqual([
      {id:"mahjong",label:"Mahjong Titans",available:false},
      {id:"wordpad",label:"WordPad",available:false}
    ]);
  });
});

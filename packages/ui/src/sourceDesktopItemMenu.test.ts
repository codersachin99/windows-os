import {describe,expect,it} from "vitest";
import {sourceDesktopItemMenu} from "./sourceDesktopItemMenu";

describe("pinned main.js DesktopItemMenu source order and predicates",()=>{
  it("system Computer has Open/Pin/Properties, without destructive file actions",()=>{
    expect(sourceDesktopItemMenu({id:"computer",multiple:false,isFile:false}))
      .toEqual([
        {id:"open",label:"Open",disabled:false},
        {id:"pin",label:"Pin to taskbar",disabled:true},
        {id:"properties",label:"Properties",disabled:true}
      ]);
  });
  it("Recycle Bin Empty is visible and enabled only with mounted trash entries",()=>{
    const empty=sourceDesktopItemMenu({id:"bin",multiple:false,isFile:false,trashCount:0});
    const nonempty=sourceDesktopItemMenu({id:"bin",multiple:false,isFile:false,trashCount:2});
    expect(empty.map(action=>action.id)).toEqual([
      "open","empty-bin","pin","properties"
    ]);
    expect(empty[1].disabled).toBe(true);
    expect(nonempty[1].disabled).toBe(false);
  });
  it("non-system installed source program offers true source desktop shortcut creation",()=>{
    expect(sourceDesktopItemMenu({
      id:"notepad",isFile:false,multiple:false,programInstalled:true
    }).map(action=>action.id)).toEqual([
      "open","pin","send-desktop","properties"
    ]);
  });
  it("file TXT shows only source file actions with download",()=>{
    expect(sourceDesktopItemMenu({
      id:"file:/Guest/Desktop/notes.txt",isFile:true,multiple:false,
      fileType:"file",fileName:"notes.txt"
    }).map(action=>action.id)).toEqual([
      "open","send-to","download","cut","copy","delete","rename","properties"
    ]);
  });
  it("folder and .lnk omit source download and multiple selection omits Open/Rename",()=>{
    for(const type of [
      {fileName:"Projects",fileType:"directory" as const},
      {fileName:"Notepad.lnk",fileType:"file" as const}
    ]){
      const actions=sourceDesktopItemMenu({
        id:"file:/Guest/Desktop/"+type.fileName,multiple:false,isFile:true,...type
      });
      expect(actions.some(a=>a.id==="download")).toBe(false);
    }
    expect(sourceDesktopItemMenu({
      id:"file:/Guest/Desktop/a.txt",multiple:true,isFile:true,
      fileType:"file",fileName:"a.txt"
    }).map(a=>a.id)).toEqual([
      "send-to","download","cut","copy","delete"
    ]);
  });
});

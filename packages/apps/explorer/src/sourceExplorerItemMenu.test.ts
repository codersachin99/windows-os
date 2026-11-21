import {describe,it,expect} from "vitest";
import type {FileEntry} from "@windows-os/filesystem";
import {
  sourceExplorerItemMenu,sourceExplorerDownloadableItems,
  SOURCE_EXPLORER_SEND_TO,sourceExplorerSendToMenu
} from "./sourceExplorerItemMenu";

const file=(name:string,type:"file"|"directory"="file"):FileEntry=>({
  uri:"/EXTERNAL/computer/drive0/Users/Guest/Documents/"+name,
  name,type,size:21,mtime:0
});
describe("pinned main.js ExplorerItemMenu, ordinary Computer files",()=>{
  it("follows original context order for ordinary TXT",()=>{
    const menu=sourceExplorerItemMenu({selected:[file("memo.txt")],canRecycle:true});
    expect(menu.map(item=>item.id)).toEqual([
      "open","send-to","download","cut","copy","delete","rename","properties"
    ]);
    expect(menu.filter(item=>item.disabled).map(item=>item.id))
      .toEqual(["properties"]);
  });
  it("keeps Send to source order and enables Desktop only for valid Guest mount",()=>{
    expect(SOURCE_EXPLORER_SEND_TO.map(item=>item.id))
      .toEqual(["compress","desktop"]);
    expect(sourceExplorerSendToMenu(false).every(item=>item.disabled)).toBe(true);
    expect(sourceExplorerSendToMenu(true).map(item=>[item.id,item.disabled]))
      .toEqual([["compress",true],["desktop",false]]);
    expect(sourceExplorerSendToMenu(true,true).map(item=>[item.id,item.disabled]))
      .toEqual([["compress",false],["desktop",false]]);
    expect(sourceExplorerSendToMenu(false,true).map(item=>[item.id,item.disabled]))
      .toEqual([["compress",false],["desktop",true]]);
  });
  it("does not download a directory or shortcut binary",()=>{
    expect(sourceExplorerItemMenu({
      selected:[file("Pictures","directory")],canRecycle:true
    }).map(item=>item.id)).toEqual([
      "open","send-to","cut","copy","delete","rename","properties"
    ]);
    expect(sourceExplorerDownloadableItems([
      file("Pictures","directory"),file("desktop.lnk"),file("memo.txt"),
      file("logo.webp")
    ]).map(item=>item.name)).toEqual(["memo.txt","logo.webp"]);
  });
  it("hides Open and Rename for multi-select and retains usable clipboard",()=>{
    expect(sourceExplorerItemMenu({
      selected:[file("a.txt"),file("b.rtf")],canRecycle:true
    }).map(item=>item.id)).toEqual([
      "send-to","download","cut","copy","delete","properties"
    ]);
  });
  it("shows but disables source extraction until an actual archive service exists",()=>{
    const menu=sourceExplorerItemMenu({
      selected:[file("compressed.zip")],canRecycle:true
    });
    expect(menu[0].id).toBe("open");
    expect(menu[1]).toEqual({
      id:"extract-here",label:"Extract here",disabled:true
    });
  });
  it("mirrors archive/Android restrictions without fake actions",()=>{
    expect(sourceExplorerItemMenu({
      selected:[file("memo.txt")],canRecycle:true,inArchive:true
    }).map(item=>[item.id,item.disabled])).toEqual([
      ["open",false],["download",false],["cut",true],["copy",true],
      ["delete",true],["properties",true]
    ]);
    expect(sourceExplorerItemMenu({
      selected:[file("memo.txt")],canRecycle:true,isAndroidFile:true
    }).some(item=>item.id==="download")).toBe(false);
  });
  it("disables deletion when no actual Guest Recycle Bin is mounted",()=>{
    expect(sourceExplorerItemMenu({
      selected:[file("a.txt")],canRecycle:false
    }).find(item=>item.id==="delete")?.disabled).toBe(true);
    expect(sourceExplorerItemMenu({selected:[],canRecycle:true})).toEqual([]);
  });
});

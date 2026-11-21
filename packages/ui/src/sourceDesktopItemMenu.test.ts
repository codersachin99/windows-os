import {describe,expect,it} from "vitest";
import {sourceDesktopItemMenu} from "./sourceDesktopItemMenu";

describe("pinned main.js DesktopItemMenu source order and predicates",()=>{
  it("system Computer has Open/Pin/Properties, without destructive file actions",()=>{
    expect(sourceDesktopItemMenu({id:"computer",multiple:false,isFile:false,canPin:true}))
      .toEqual([
        {id:"open",label:"Open",disabled:false},
        {id:"pin",label:"Pin to taskbar",disabled:false},
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
  it("enables source Desktop compressed submenu only for mounted Guest selection",()=>{
    const input={id:"file:/EXTERNAL/computer/drive0/Users/Guest/Desktop/Test.txt",
      isFile:true,multiple:false,fileType:"file" as const,fileName:"Test.txt"};
    expect(sourceDesktopItemMenu(input).find(a=>a.id==="send-to")?.disabled).toBe(true);
    expect(sourceDesktopItemMenu({...input,canCompressGuest:true})
      .find(a=>a.id==="send-to")).toEqual({
        id:"send-to",label:"Send to ▸",disabled:false
      });
    expect(sourceDesktopItemMenu({...input,canCompressGuest:false,multiple:true})
      .find(a=>a.id==="send-to")?.disabled).toBe(true);
    expect(sourceDesktopItemMenu({...input,canCompressGuest:true,multiple:true})
      .find(a=>a.id==="send-to")?.disabled).toBe(false);
    expect(sourceDesktopItemMenu({id:"computer",isFile:false,multiple:false,
      canCompressGuest:true}).some(a=>a.id==="send-to")).toBe(false);
  });
  it("uses every selected file for Download even when the clicked icon is a .lnk",()=>{
    const clicked={
      id:"file:/Desktop/shortcut.lnk",isFile:true,
      fileType:"file" as const,fileName:"shortcut.lnk",multiple:true
    };
    expect(sourceDesktopItemMenu(clicked).some(a=>a.id==="download")).toBe(false);
    expect(sourceDesktopItemMenu({...clicked,downloadableCount:1})
      .some(a=>a.id==="download")).toBe(true);
    expect(sourceDesktopItemMenu({...clicked,downloadableCount:0})
      .some(a=>a.id==="download")).toBe(false);
    expect(sourceDesktopItemMenu({id:"computer",isFile:false,
      multiple:false,downloadableCount:5})
      .some(a=>a.id==="download")).toBe(false);
  });

  it("hides source Cut/Copy for a program-only shortcut without a path",()=>{
    const link={id:"file:/Desktop/Notepad.lnk",isFile:true,
      fileType:"file" as const,fileName:"Notepad.lnk",multiple:false};
    const noPaths=sourceDesktopItemMenu({...link,hasClipboardSourcePaths:false});
    expect(noPaths.some(a=>a.id==="cut"||a.id==="copy")).toBe(false);
    expect(noPaths.some(a=>a.id==="send-to")).toBe(false);
    expect(noPaths.find(a=>a.id==="delete")?.disabled).toBe(true);
    const actualTarget=sourceDesktopItemMenu({...link,hasClipboardSourcePaths:true});
    expect(actualTarget.some(a=>a.id==="cut")).toBe(true);
    expect(actualTarget.find(a=>a.id==="send-to")?.disabled).toBe(true);
    expect(sourceDesktopItemMenu({...link,hasClipboardSourcePaths:true,
      canCompressGuest:true}).find(a=>a.id==="send-to")?.disabled).toBe(false);
    expect(actualTarget.some(a=>a.id==="copy")).toBe(true);
    expect(actualTarget.find(a=>a.id==="delete")?.disabled).toBe(false);
    expect(sourceDesktopItemMenu({id:"computer",isFile:false,multiple:false,
      hasClipboardSourcePaths:true}).some(a=>a.id==="copy")).toBe(false);
  });

  it("original Desktop Extract here precedes Send to and enables only a real Guest ZIP",()=>{
    const input={
      id:"file:/EXTERNAL/computer/drive0/Users/Guest/Desktop/Bundle.zip",
      isFile:true,multiple:false,fileType:"file" as const,fileName:"Bundle.zip"
    };
    expect(sourceDesktopItemMenu(input).map(item=>item.id)).toEqual([
      "open","extract-here","send-to","download","cut","copy",
      "delete","rename","properties"
    ]);
    expect(sourceDesktopItemMenu(input).find(a=>a.id==="extract-here"))
      .toEqual({id:"extract-here",label:"Extract here",disabled:true});
    expect(sourceDesktopItemMenu({...input,canExtractGuestZip:true})
      .find(a=>a.id==="extract-here")?.disabled).toBe(false);
    expect(sourceDesktopItemMenu({
      ...input,multiple:true,canExtractGuestZip:true
    }).some(a=>a.id==="extract-here")).toBe(false);
  });
  it("original Desktop path-backed shortcut can extract a real Guest ZIP target",()=>{
    const link={
      id:"file:/EXTERNAL/computer/drive0/Users/Guest/Desktop/Project.lnk",
      isFile:true,multiple:false,fileType:"file" as const,
      fileName:"Project.lnk",archiveName:"Project.zip",canExtractGuestZip:true
    };
    expect(sourceDesktopItemMenu(link).find(a=>a.id==="extract-here"))
      .toMatchObject({label:"Extract here",disabled:false});
    expect(sourceDesktopItemMenu({...link,archiveName:"Notes.txt"})
      .some(a=>a.id==="extract-here")).toBe(false);
    for(const archiveName of ["Project.rar","Project.7z","Project.tar","Project.gz"]){
      expect(sourceDesktopItemMenu({...link,archiveName})
        .find(a=>a.id==="extract-here")?.disabled).toBe(true);
    }
    expect(sourceDesktopItemMenu({id:"computer",isFile:false,multiple:false,
      archiveName:"Fake.zip",canExtractGuestZip:true})
      .some(a=>a.id==="extract-here")).toBe(false);
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

describe("source taskbar Pin/Unpin menu gating",()=>{
  it("enables registered app entries and flips label after pin",()=>{
    const first=sourceDesktopItemMenu({id:"computer",isFile:false,multiple:false,canPin:true});
    expect(first.find(a=>a.id==="pin")).toEqual({
      id:"pin",label:"Pin to taskbar",disabled:false
    });
    const second=sourceDesktopItemMenu({
      id:"computer",isFile:false,multiple:false,canPin:true,pinned:true
    });
    expect(second.find(a=>a.id==="pin")).toEqual({
      id:"pin",label:"Unpin from taskbar",disabled:false
    });
  });
  it("keeps unregistered apps and file-backed shortcut Pins disabled/hidden",()=>{
    const builtin=sourceDesktopItemMenu({id:"notepad",isFile:false,multiple:false});
    expect(builtin.find(a=>a.id==="pin")?.disabled).toBe(true);
    const file=sourceDesktopItemMenu({
      id:"file:/User/Notepad.lnk",isFile:true,multiple:false,fileName:"Notepad.lnk"
    });
    expect(file.find(a=>a.id==="pin")).toBeUndefined();
  });
});

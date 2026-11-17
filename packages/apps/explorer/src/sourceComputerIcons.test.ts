import {describe,expect,it} from "vitest";
import {legacyArt} from "@windows-os/assets";
import {sourceComputerIconArtwork,sourceShortcutCustomIconURL} from "./sourceComputerIcons";
const icon=(name:string,type:"file"|"directory"="file")=>sourceComputerIconArtwork({name,type});

describe("source 4cca icons with only verified pinned artwork",()=>{
  it("uses already imported exact images for source photos, folders and installed applications",()=>{
    expect(icon("sunset.PNG")).toEqual({
      sourceType:"photo",src:legacyArt.photo,exactSourceArtwork:true
    });
    expect(icon("Folder","directory")).toEqual({
      sourceType:"folder",src:legacyArt.folder,exactSourceArtwork:true
    });
    expect(icon("notepad.exe")).toEqual({
      sourceType:"notepad",src:legacyArt.notepad,exactSourceArtwork:true
    });
  });
  it("retains source type while clearly falling back for missing original art",()=>{
    expect(icon("notes.txt")).toEqual({
      sourceType:"text",src:legacyArt.file,exactSourceArtwork:false
    });
    expect(icon("music.mp3")).toEqual({
      sourceType:"media",src:legacyArt.file,exactSourceArtwork:false
    });
    expect(icon("archive.zip")).toEqual({
      sourceType:"zip",src:legacyArt.file,exactSourceArtwork:false
    });
  });
});

describe("original .lnk JSON icon override",()=>{
  it("honors the JSON icon even when its executable is different",()=>{
    expect(sourceComputerIconArtwork({name:"File.lnk",type:"file"},"calc")).toEqual({
      sourceType:"file",src:legacyArt.calculator,exactSourceArtwork:true
    });
    expect(sourceComputerIconArtwork({name:"File.lnk",type:"file"},"notepad")).toEqual({
      sourceType:"file",src:legacyArt.notepad,exactSourceArtwork:true
    });
    expect(sourceComputerIconArtwork({name:"File.lnk",type:"file"},"missing")).toEqual({
      sourceType:"file",src:legacyArt.file,exactSourceArtwork:false
    });
    expect(sourceComputerIconArtwork({name:"Broken.lnk",type:"file"},"file")).toEqual({
      sourceType:"file",src:legacyArt.file,exactSourceArtwork:true
    });
  });
  it("allows source custom image URLs, never script schemes",()=>{
    expect(sourceShortcutCustomIconURL("https://example.org/icon.png"))
      .toBe("https://example.org/icon.png");
    expect(sourceShortcutCustomIconURL("data:image/png;base64,aGVsbG8="))
      .toBe("data:image/png;base64,aGVsbG8=");
    expect(sourceShortcutCustomIconURL("javascript:alert(1)")).toBeNull();
    expect(sourceShortcutCustomIconURL("data:text/html;base64,PHNjcmlwdD4=")).toBeNull();
  });
});

describe("XP/Win11 themed source icon classification",()=>{
  it("uses the exact imported folder and generic file art without losing source type",()=>{
    expect(sourceComputerIconArtwork({name:"Documents",type:"directory"},null,"winxp"))
      .toMatchObject({sourceType:"folder",
        src:"/assets/images/folder-winxp.ff1b00c5.webp",exactSourceArtwork:true});
    expect(sourceComputerIconArtwork({name:"readme.txt",type:"file"},null,"win11"))
      .toEqual({sourceType:"text",
        src:"/assets/images/file-win11.8b2c3723.webp",exactSourceArtwork:false});
    expect(sourceComputerIconArtwork({name:"unknown.bin",type:"file"},null,"winxp"))
      .toEqual({sourceType:"file",
        src:"/assets/images/file-winxp.c130b357.webp",exactSourceArtwork:true});
  });
  it("preserves installed/custom shortcut art and uses themed generic for unknown keys",()=>{
    for(const theme of ["winxp","win11"] as const){
      expect(sourceComputerIconArtwork({name:"Editor.lnk",type:"file"},"calc",theme))
        .toMatchObject({src:theme==="winxp"
          ?"/assets/images/calc-winxp.f79aee6b.webp":legacyArt.calculator,
          exactSourceArtwork:true});
      expect(sourceComputerIconArtwork({name:"Editor.lnk",type:"file"},
        "https://example.org/custom.png",theme))
        .toMatchObject({src:"https://example.org/custom.png",exactSourceArtwork:false});
      const unknown=sourceComputerIconArtwork({name:"Editor.lnk",type:"file"},"unknown",theme);
      expect(unknown.src).toContain("file-"+theme+".");
      expect(unknown.exactSourceArtwork).toBe(false);
    }
  });
});

describe("original theme-specific installed program art",()=>{
  it("uses pinned source application images but preserves unknown custom shortcut URLs",()=>{
    expect(sourceComputerIconArtwork({name:"Notepad.lnk",type:"file"},"notepad","winxp"))
      .toMatchObject({src:"/assets/images/notepad-winxp.82037fb1.webp",exactSourceArtwork:true});
    expect(sourceComputerIconArtwork({name:"Notepad.lnk",type:"file"},"notepad","win11"))
      .toMatchObject({src:"/assets/images/notepad-win11.2e4af294.webp",exactSourceArtwork:true});
    expect(sourceComputerIconArtwork({name:"Calculator.lnk",type:"file"},"calc","winxp"))
      .toMatchObject({src:"/assets/images/calc-winxp.f79aee6b.webp",exactSourceArtwork:true});
    expect(sourceComputerIconArtwork({name:"Link.lnk",type:"file"},
      "https://example.org/icon.webp","win11"))
      .toMatchObject({src:"https://example.org/icon.webp",exactSourceArtwork:false});
    expect(sourceComputerIconArtwork({name:"Notepad.lnk",type:"file"},"notepad","win7"))
      .toMatchObject({src:legacyArt.notepad,exactSourceArtwork:true});
  });
});

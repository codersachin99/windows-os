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

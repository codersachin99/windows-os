import {describe,expect,it} from "vitest";
import {legacyArt} from "@windows-os/assets";
import {sourceComputerIconArtwork} from "./sourceComputerIcons";
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

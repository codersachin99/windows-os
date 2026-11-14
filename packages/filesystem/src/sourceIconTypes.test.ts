import {describe,expect,it} from "vitest";
import {sourceFileIconType} from "./sourceIconTypes";
import type { FileEntry } from "./index";
const icon=(name:string,type:FileEntry["type"]="file")=>sourceFileIconType({name,type});

describe("pinned 4cca.getIconType / 0e9a / 8c25 icon selection",()=>{
  it("prioritizes directories, pictures, audio and video exactly as source",()=>{
    expect(icon("holiday.png")).toBe("photo");
    expect(icon("photo.JPEG")).toBe("photo");
    expect(icon("picture.fakejpg")).toBe("photo"); // original suffix matcher
    expect(icon("clip.webm")).toBe("media");  // original shared audio/video suffix
    expect(icon("recording.mp3")).toBe("media");
    expect(icon("holiday.png","directory")).toBe("folder");
  });
  it("preserves source playlist/RTF/text ordering and real extension fallbacks",()=>{
    expect(icon("list.wpl")).toBe("wpl");
    expect(icon("note.rtf")).toBe("richtext");
    expect(icon("memo.txt")).toBe("text");
    expect(icon("book.md")).toBe("text");
    expect(icon("document.pdf")).toBe("file"); // no PDF category in 4cca
    expect(icon("unknown.xlsx")).toBe("file");
    expect(icon("archive.zip")).toBe("zip");
    expect(icon("archive.7z")).toBe("file"); // original ^zip$ only
    expect(icon("README")).toBe("folder"); // source extensionless fallback
    expect(icon(".config")).toBe("file");
  });
  it("maps recognized executable names via pinned c170 manifest / 8c25",()=>{
    expect(icon("notepad.exe")).toBe("notepad");
    expect(icon("CALC.EXE")).toBe("calc");
    expect(icon("iexplore.exe")).toBe("ie");
    expect(icon("unknown.exe")).toBe("executable");
    expect(icon("installer.msi")).toBe("executable");
    expect(icon("main.cpl")).toBe("file"); // not an 0e9a executable
  });
});

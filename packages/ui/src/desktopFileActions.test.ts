import { describe, expect, it } from "vitest";
import { FileClipboard, VirtualFileStore } from "@windows-os/filesystem";
import { desktopSelectedFilePaths,desktopDownloadableFiles } from "./desktopFileActions";

const icons = [
  { id: "computer" },
  { id: "bin" },
  { id: "file:/Desktop/one.txt", file: { entry: { uri: "/Desktop/one.txt" } } },
  { id: "file:/Desktop/Folder", file: { entry: { uri: "/Desktop/Folder" } } }
];

describe("source desktop file selection and shared clipboard", () => {
  it("selects real file-backed entries only, never system icons or stale keys", () => {
    expect(desktopSelectedFilePaths(icons, ["computer", "bin", "file:/Desktop/one.txt", "stale"]))
      .toEqual(["/Desktop/one.txt"]);
    expect(desktopSelectedFilePaths(icons, ["computer", "bin"])).toEqual([]);
    expect(desktopSelectedFilePaths(icons, ["file:/Desktop/Folder", "file:/Desktop/Folder"]))
      .toEqual(["/Desktop/Folder"]);
  });

  it("downloads every selected real file with an extension, excluding .lnk, folders and system icons",()=>{
    const selected=[
      {id:"computer"},
      {id:"file:/Desktop/one.txt",file:{entry:{uri:"/Desktop/one.txt",name:"one.txt",type:"file" as const}}},
      {id:"file:/Desktop/second.bin",file:{entry:{uri:"/Desktop/second.bin",name:"second.bin",type:"file" as const}}},
      {id:"file:/Desktop/shortcut.lnk",file:{entry:{uri:"/Desktop/shortcut.lnk",name:"shortcut.lnk",type:"file" as const}}},
      {id:"file:/Desktop/Folder",file:{entry:{uri:"/Desktop/Folder",name:"Folder",type:"directory" as const}}}
    ];
    const result=desktopDownloadableFiles(selected,[
      "computer","file:/Desktop/one.txt","file:/Desktop/second.bin",
      "file:/Desktop/shortcut.lnk","file:/Desktop/Folder","file:/Desktop/second.bin"
    ]);
    expect(result.map(entry=>entry.uri)).toEqual([
      "/Desktop/one.txt","/Desktop/second.bin"
    ]);
    expect(desktopDownloadableFiles(selected,["computer","file:/Desktop/shortcut.lnk"]))
      .toEqual([]);
  });

  it("moves and copies between Explorer and Desktop through one shared clipboard", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/Desktop");
    await fs.mkdir("/Documents");
    await fs.mkdir("/Desktop/Folder");
    await fs.write("Hello", "/Desktop/Folder/hello.txt");
    const clipboard = new FileClipboard();
    clipboard.prepare(desktopSelectedFilePaths(icons, ["file:/Desktop/Folder", "computer"]), "copy");
    await clipboard.paste(fs, "/Documents");
    expect(await fs.read("/Documents/Folder/hello.txt")).toBe("Hello");
    expect(await fs.read("/Desktop/Folder/hello.txt")).toBe("Hello");
    clipboard.prepare(["/Documents/Folder"], "cut");
    await clipboard.paste(fs, "/");
    expect(await fs.read("/Folder/hello.txt")).toBe("Hello");
    expect(await fs.stat("/Documents/Folder")).toBeNull();
    expect(clipboard.snapshot().operation).toBeNull();
  });

  it("keeps clipboard state intact when destination exists; never overwrites files", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/Desktop");
    await fs.mkdir("/Documents");
    await fs.write("original", "/Desktop/report.txt");
    await fs.write("existing", "/Documents/report.txt");
    const clipboard = new FileClipboard();
    clipboard.prepare(["/Documents/report.txt"], "cut");
    await expect(clipboard.paste(fs, "/Desktop")).rejects.toMatchObject({ code: "EEXIST" });
    expect(clipboard.snapshot().operation).toBe("cut");
    expect(await fs.read("/Desktop/report.txt")).toBe("original");
    expect(await fs.read("/Documents/report.txt")).toBe("existing");
  });
});

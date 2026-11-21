import { describe, expect, it } from "vitest";
import { FileClipboard, VirtualFileStore } from "@windows-os/filesystem";
import { desktopSelectedFilePaths,desktopDownloadableFiles,desktopSourceClipboardPaths,desktopSourceArchiveSelection } from "./desktopFileActions";

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

  it("downloads the mounted Guest target of source path-backed .lnk rather than the link JSON",()=>{
    const doc="/EXTERNAL/computer/drive0/Users/Guest/Documents/Target Archive.zip";
    const link={
      id:"file:/EXTERNAL/computer/drive0/Users/Guest/Desktop/Target Archive - Shortcut.lnk",
      file:{
        entry:{uri:"/EXTERNAL/computer/drive0/Users/Guest/Desktop/Target Archive - Shortcut.lnk",
          name:"Target Archive - Shortcut.lnk",type:"file" as const},
        targetPath:doc
      }
    };
    expect(desktopDownloadableFiles([link],[link.id])).toEqual([{
      uri:doc,name:"Target Archive.zip",type:"file"
    }]);
    // Source shortcut target may not gain permission for a host URI, even
    // if a malformed caller bypassed the validated .lnk parser.
    const invalid={...link,file:{...link.file,targetPath:"/etc/passwd.zip"}};
    expect(desktopDownloadableFiles([invalid],[link.id])).toEqual([]);
    const traversal={...link,file:{...link.file,
      targetPath:"/EXTERNAL/computer/drive0/Users/Guest/../../escape.zip"}};
    expect(desktopDownloadableFiles([traversal],[link.id])).toEqual([]);
    const programOnly={...link,file:{entry:link.file.entry,targetPath:null}};
    expect(desktopDownloadableFiles([programOnly],[link.id])).toEqual([]);
    const targetLink={...link,file:{...link.file,
      targetPath:"/EXTERNAL/computer/drive0/Users/Guest/Documents/Other.lnk"}};
    expect(desktopDownloadableFiles([targetLink],[link.id])).toEqual([]);
  });

  it("uses frozen shortcut.path for clipboard, excluding program-only links and unsafe targets",()=>{
    const target="/EXTERNAL/computer/drive0/Users/Guest/Documents/Real Folder";
    const alias="/EXTERNAL/computer/drive0/Users/Guest/Desktop/Real Folder - Shortcut.lnk";
    const a={id:"file:"+alias,file:{entry:{
      uri:alias,name:"Real Folder - Shortcut.lnk",type:"file" as const
    },targetPath:target}};
    const b={id:"file:"+target,file:{entry:{
      uri:target,name:"Real Folder",type:"directory" as const
    }}};
    const ordinary={id:"file:/Desktop/Note.txt",file:{entry:{
      uri:"/Desktop/Note.txt",name:"Note.txt",type:"file" as const
    }}};
    const executable={id:"file:/Desktop/App.lnk",file:{entry:{
      uri:"/Desktop/App.lnk",name:"App.lnk",type:"file" as const
    },targetPath:null}};
    const host={...executable,id:"host",file:{...executable.file,
      targetPath:"/host/Desktop/stolen.txt"}};
    const traversal={...executable,id:"traversal",file:{...executable.file,
      targetPath:"/EXTERNAL/computer/drive0/Users/Guest/../../etc/config.txt"}};
    const items=[{id:"computer"},a,b,ordinary,executable,host,traversal];
    expect(desktopSourceClipboardPaths(items,[
      a.id,b.id,ordinary.id,executable.id,"computer",host.id,traversal.id,a.id
    ])).toEqual([target,"/Desktop/Note.txt"]);
    expect(desktopSourceClipboardPaths(items,[executable.id,"computer"])).toEqual([]);
  });

  it("archives path-backed shortcut TARGET in its real Guest parent folder",()=>{
    const root="/EXTERNAL/computer/drive0/Users/Guest";
    const doc=root+"/Documents/Exact Data.bin";
    const zipShortcut=root+"/Desktop/Exact Data - Shortcut.lnk";
    const alias={
      id:"file:"+zipShortcut,file:{entry:{
        uri:zipShortcut,name:"Exact Data - Shortcut.lnk",type:"file" as const
      },targetPath:doc}
    };
    const a=desktopSourceArchiveSelection([alias],[alias.id]);
    expect(a).toEqual({folder:root+"/Documents",paths:[doc]});
    const desktopFile={id:"desktop",file:{entry:{
      uri:root+"/Desktop/Other.txt",name:"Other.txt",type:"file" as const
    }}};
    expect(desktopSourceArchiveSelection([alias,desktopFile],
      [alias.id,desktopFile.id])).toBeNull();
    const doc2={id:"second",file:{entry:{
      uri:root+"/Documents/Second.txt",name:"Second.txt",type:"file" as const
    }}};
    expect(desktopSourceArchiveSelection([alias,doc2],
      [alias.id,doc2.id])).toEqual({
      folder:root+"/Documents",paths:[doc,root+"/Documents/Second.txt"]
    });
    const programOnly={...alias,file:{entry:alias.file.entry,targetPath:null}};
    expect(desktopSourceArchiveSelection([programOnly],[alias.id])).toBeNull();
    const outside={...alias,file:{...alias.file,targetPath:"/host/Data.bin"}};
    expect(desktopSourceArchiveSelection([outside],[alias.id])).toBeNull();
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

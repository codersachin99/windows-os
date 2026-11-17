import {describe,expect,it} from "vitest";
import {
  VirtualFileStore, FileStoreError,parseSourceShortcut,
  ensureSourceGuestDirectories,SOURCE_GUEST_PROFILE,SOURCE_COMPUTER_ROOT,
  createSourcePathDesktopShortcuts,parseSourcePathShortcut
} from "./index";

const desktop=SOURCE_GUEST_PROFILE+"/Desktop";
const docs=SOURCE_GUEST_PROFILE+"/Documents";
async function setup(){
  const store=new VirtualFileStore();
  await ensureSourceGuestDirectories(store);
  await store.write("source data",docs+"/Memo.txt");
  await store.mkdir(docs+"/Projects");
  return store;
}
describe("pinned main.js ExplorerItemMenu.sendToDesktop .lnk",()=>{
  it("creates original exe/icon/path JSON for a live file and folder",async()=>{
    const fs=await setup();
    const paths=await createSourcePathDesktopShortcuts(fs,desktop,[
      docs+"/Memo.txt",docs+"/Projects"
    ]);
    expect(paths).toEqual([
      desktop+"/Memo - Shortcut.lnk",desktop+"/Projects - Shortcut.lnk"
    ]);
    const memo=await fs.read(paths[0]);
    const folder=await fs.read(paths[1]);
    expect(parseSourcePathShortcut(memo)).toEqual({
      exe:"text",icon:"text",path:docs+"/Memo.txt"
    });
    expect(parseSourcePathShortcut(folder)).toEqual({
      exe:"folder",icon:"folder",path:docs+"/Projects"
    });
    expect(parseSourceShortcut(memo)).toBeNull();
    expect(await fs.read(docs+"/Memo.txt")).toBe("source data");
    expect((await fs.stat(docs+"/Projects"))?.type).toBe("directory");
  });
  it("protects existing Guest shortcuts and chooses case-insensitive suffixes",async()=>{
    const fs=await setup();
    await fs.createFile("existing",desktop+"/memo - shortcut.lnk");
    expect(await createSourcePathDesktopShortcuts(fs,desktop,[docs+"/Memo.txt"]))
      .toEqual([desktop+"/Memo - Shortcut (2).lnk"]);
    expect(await fs.read(desktop+"/memo - shortcut.lnk")).toBe("existing");
    expect(await createSourcePathDesktopShortcuts(fs,desktop,[
      docs+"/Memo.txt",docs+"/Projects"
    ])).toEqual([
      desktop+"/Memo - Shortcut (3).lnk",desktop+"/Projects - Shortcut.lnk"
    ]);
  });
  it("rejects host paths, traversal, missing targets and recursive .lnk links",async()=>{
    const fs=await setup();
    await fs.write(JSON.stringify({exe:"calc",icon:"calc"}),docs+"/App.lnk");
    for(const bad of [
      "/etc/passwd","C:\\Windows\\system32",
      SOURCE_COMPUTER_ROOT+"/drive0/../../escape.txt",
      docs+"/Missing.txt",docs+"/App.lnk"
    ]){
      await expect(createSourcePathDesktopShortcuts(fs,desktop,[bad]))
        .rejects.toBeInstanceOf(FileStoreError);
    }
    expect(await fs.list(desktop)).toEqual([]);
  });
  it("fails all-or-nothing on mixed valid and missing selections",async()=>{
    const fs=await setup();
    await expect(createSourcePathDesktopShortcuts(fs,desktop,[
      docs+"/Memo.txt",docs+"/no-exists.txt"
    ])).rejects.toMatchObject({code:"EINVAL"});
    expect(await fs.list(desktop)).toEqual([]);
    await expect(createSourcePathDesktopShortcuts(fs,"/not-a-desktop",[
      docs+"/Memo.txt"
    ])).rejects.toMatchObject({code:"EINVAL"});
  });
  it("parses only canonical bounded source paths even when a malicious exe is present",()=>{
    const source={exe:"text",icon:"text",path:docs+"/Memo.txt"};
    expect(parseSourcePathShortcut(JSON.stringify(source))).toEqual(source);
    for(const candidate of [
      {...source,path:"/etc/passwd"},
      {...source,path:docs+"/../Secret.txt"},
      {...source,path:"https://evil.invalid/a"},
      {...source,path:docs+"/App.lnk"},
      {...source,path:"C:\\Users\\Guest\\readme.txt"},
      {...source,exe:"../cmd"},
      {...source,icon:""},
      {...source,path:42},
      {exe:"calc",icon:"calc"}
    ]){
      const json=JSON.stringify(candidate);
      expect(parseSourcePathShortcut(json)).toBeNull();
      expect(parseSourceShortcut(json)).toBeNull();
    }
  });
});

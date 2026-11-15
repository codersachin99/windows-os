import {describe,it,expect} from "vitest";
import {zipSync} from "fflate";
import {VirtualFileStore} from "./index";
import {ensureSourceGuestDirectories,SOURCE_GUEST_PROFILE} from "./sourceGuest";
import {
  SOURCE_BACKUP_FOLDERS,sourceBackupDestination,sourceBackupTextFile,sourceCreateBackupArchive,
  sourceParseBackupArchive,sourceRestoreBackupArchive
} from "./sourceBackup";

const text=(value:string)=>new TextEncoder().encode(value);
const manifest=(fileCount=1)=>text(JSON.stringify({
  createdAt:"2026-11-15T13:00:00.000Z",target:"all",
  folders:[...SOURCE_BACKUP_FOLDERS],fileCount,source:"win7-simu"
}));
function makeZip(files:Record<string,Uint8Array>,level:0|6=0){
  return zipSync({...files,"manifest.json":manifest(
    Object.keys(files).filter(name=>!name.endsWith("/")).length)},{level});
}
async function guest(){
  const store=new VirtualFileStore();
  await ensureSourceGuestDirectories(store);
  return store;
}
describe("original f106 backup scope and safe ZIP path contract",()=>{
  it("pins seven source folders, including AppData, in their exact order",()=>{
    expect(SOURCE_BACKUP_FOLDERS).toEqual([
      "Desktop","Downloads","Documents","Music","Pictures","Videos","AppData"
    ]);
    expect(sourceBackupDestination("Documents/notes.txt"))
      .toBe(SOURCE_GUEST_PROFILE+"/Documents/notes.txt");
    expect(sourceBackupTextFile("README.md")).toBe(true);
    expect(sourceBackupTextFile("Notes.lnk")).toBe(true);
    expect(sourceBackupTextFile("picture.png")).toBe(false);
    expect(sourceBackupDestination("AppData/Roaming/sub/file.dat"))
      .toBe(SOURCE_GUEST_PROFILE+"/AppData/Roaming/sub/file.dat");
  });
  it.each([
    "../Windows/System32/a","Documents/../Windows/a","/Documents/a",
    "Documents\\evil.txt","C:/Windows/a","Program Files/app.exe",
    "document/notes","Documents//file","Documents/./a","Documents/x\u0000a",
    "AppData//","Documents/a/../../Pictures/p"
  ])("rejects archive path traversal/out-of-scope %s",name=>{
    expect(()=>sourceBackupDestination(name)).toThrow(/unsafe path/);
  });
});
describe("source Ie backup / je safe Guest restore",()=>{
  it("produces a standard ZIP, exact original manifest and binary roundtrip",async()=>{
    const store=await guest();
    await store.write("hello Guest",SOURCE_GUEST_PROFILE+"/Documents/example.txt");
    await store.writeBytes(new Uint8Array([0,255,8,0,128]),
      SOURCE_GUEST_PROFILE+"/Pictures/pic.bin");
    await store.write("private settings",SOURCE_GUEST_PROFILE+"/AppData/Roaming/settings.json");
    // Non-profile installed system file must never be included.
    await store.write("outside", "/EXTERNAL/computer/drive0/Windows/exclude.txt");
    const steps:string[]=[];
    const archive=await sourceCreateBackupArchive(store,{
      now:new Date("2026-11-15T13:00:00.000Z"),
      onProgress:event=>steps.push(event.phase)
    });
    expect(archive.name).toBe("win7simu-backup-1794747600000.zip");
    expect(archive.manifest).toMatchObject({
      source:"win7-simu",target:"all",folders:SOURCE_BACKUP_FOLDERS,fileCount:3
    });
    expect(steps[0]).toBe("start");
    expect(steps.at(-1)).toBe("done");
    const parsed=sourceParseBackupArchive(archive.archive);
    expect(parsed.files.map(file=>file.name).sort()).toEqual([
      "AppData/Roaming/settings.json","Documents/example.txt","Pictures/pic.bin"
    ]);
    const other=await guest();
    expect(await sourceRestoreBackupArchive(other,archive.archive))
      .toEqual({restored:3,skipped:0});
    expect(await other.read(SOURCE_GUEST_PROFILE+"/Documents/example.txt"))
      .toBe("hello Guest");
    expect(await other.readBytes(SOURCE_GUEST_PROFILE+"/Pictures/pic.bin"))
      .toEqual(new Uint8Array([0,255,8,0,128]));
    expect(await other.read(SOURCE_GUEST_PROFILE+"/AppData/Roaming/settings.json"))
      .toBe("private settings");
  });
  it("reads a regular deflated ZIP and never overwrites existing user files",async()=>{
    const store=await guest();
    await store.write("keep original",SOURCE_GUEST_PROFILE+"/Documents/a.txt");
    const archive=makeZip({
      "Documents/a.txt":text("untrusted replacement"),
      "Downloads/b.txt":text("new file")
    },6);
    expect(await sourceRestoreBackupArchive(store,archive))
      .toEqual({restored:1,skipped:1});
    expect(await store.read(SOURCE_GUEST_PROFILE+"/Documents/a.txt"))
      .toBe("keep original");
    expect(await store.read(SOURCE_GUEST_PROFILE+"/Downloads/b.txt"))
      .toBe("new file");
  });
  it("refuses missing/invalid manifest and archive ZIP-bomb claims before writes",async()=>{
    const store=await guest();
    const noManifest=zipSync({"Documents/evil.txt":text("evil")});
    await expect(sourceRestoreBackupArchive(store,noManifest))
      .rejects.toThrow(/missing manifest/);
    const badManifest=zipSync({
      "Documents/evil.txt":text("evil"),
      "manifest.json":text(JSON.stringify({source:"other",fileCount:1}))
    });
    await expect(sourceRestoreBackupArchive(store,badManifest))
      .rejects.toThrow(/invalid manifest/);
    const bomb=makeZip({"Documents/evil.txt":text("evil")});
    // Central directory uncompressed file-size is tampered beyond 25 MiB.
    const bytes=bomb.slice();
    const view=new DataView(bytes.buffer);
    let found=false;
    for(let i=0;i<bytes.length-46;i++){
      if(view.getUint32(i,true)===0x02014b50){
        view.setUint32(i+24,26*1024*1024,true);found=true;break;
      }
    }
    expect(found).toBe(true);
    await expect(sourceRestoreBackupArchive(store,bytes))
      .rejects.toThrow(/expanded size/);
    expect(await store.stat(SOURCE_GUEST_PROFILE+"/Documents/evil.txt")).toBeNull();
  });
  it("rejects duplicate-case ZIP names, traversal entries and symlink headers",async()=>{
    const dup=makeZip({
      "Documents/A.txt":text("one"),"Documents/a.txt":text("two")
    });
    expect(()=>sourceParseBackupArchive(dup)).toThrow(/duplicate path/);
    const traversal=makeZip({"Documents/../../Windows/evil.exe":text("no")});
    expect(()=>sourceParseBackupArchive(traversal)).toThrow(/unsafe path/);
    const zip=makeZip({"Documents/ok.txt":text("one")});
    const symlink=zip.slice(),view=new DataView(symlink.buffer);
    let found=false;
    for(let i=0;i<symlink.length-46;i++){
      if(view.getUint32(i,true)===0x02014b50){
        view.setUint32(i+38,0xa0000000,true);found=true;break;
      }
    }
    expect(found).toBe(true);
    expect(()=>sourceParseBackupArchive(symlink)).toThrow(/ZIP symlink/);
  });
  it("rejects inconsistent payload CRC and keeps Guest data intact",async()=>{
    const bytes=makeZip({"Documents/ok.txt":text("abc")}).slice();
    const view=new DataView(bytes.buffer);
    for(let i=0;i<bytes.length-46;i++){
      if(view.getUint32(i,true)===0x02014b50){
        view.setUint32(i+16,12345,true);break;
      }
    }
    const store=await guest();
    await expect(sourceRestoreBackupArchive(store,bytes))
      .rejects.toThrow(/corrupt ZIP data/);
    expect(await store.stat(SOURCE_GUEST_PROFILE+"/Documents/ok.txt")).toBeNull();
  });
});

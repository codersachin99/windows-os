import {describe,it,expect} from "vitest";
import {strFromU8,unzipSync} from "fflate";
import {
  VirtualFileStore,FileStoreError,sourceCanCompressSelection,
  createSourceGuestArchive,SOURCE_GUEST_ZIP_MAX_BYTES
} from "./index";
import {SOURCE_GUEST_PROFILE} from "./sourceGuest";

const DOCUMENTS=SOURCE_GUEST_PROFILE+"/Documents";
async function guest(){
  const fs=new VirtualFileStore();
  let path="";
  for(const part of DOCUMENTS.split("/").filter(Boolean)){
    path+="/"+part;
    await fs.mkdir(path);
  }
  return fs;
}

describe("frozen main.js ExplorerItemMenu Send to Compressed (zipped) folder",()=>{
  it("archives a selected file with exact UTF-8 bytes, not a host file path",async()=>{
    const fs=await guest();
    await fs.write("Hello 👋 world",DOCUMENTS+"/Reminder.txt");
    const uri=await createSourceGuestArchive(fs,DOCUMENTS,[DOCUMENTS+"/Reminder.txt"]);
    expect(uri).toBe(DOCUMENTS+"/Reminder.zip");
    const zipped=unzipSync(await fs.readBytes(uri));
    expect(Object.keys(zipped)).toEqual(["Reminder.txt"]);
    expect(strFromU8(zipped["Reminder.txt"])).toBe("Hello 👋 world");
    expect(await fs.read(DOCUMENTS+"/Reminder.txt")).toBe("Hello 👋 world");
  });
  it("retains folders, empty directories and binary source bytes",async()=>{
    const fs=await guest();
    await fs.mkdir(DOCUMENTS+"/Mixed");
    await fs.mkdir(DOCUMENTS+"/Mixed/Empty");
    const bytes=Uint8Array.from([0,1,0,255,0,100,15]);
    await fs.writeBytes(bytes,DOCUMENTS+"/Mixed/Binary.dat");
    const uri=await createSourceGuestArchive(fs,DOCUMENTS,[DOCUMENTS+"/Mixed"]);
    expect(uri).toBe(DOCUMENTS+"/Mixed.zip");
    const zipped=unzipSync(await fs.readBytes(uri));
    expect(Object.keys(zipped).sort()).toEqual([
      "Mixed/","Mixed/Binary.dat","Mixed/Empty/"
    ].sort());
    expect(zipped["Mixed/Binary.dat"]).toEqual(bytes);
  });
  it("supports multiple selected paths and collision-safe create-only archives",async()=>{
    const fs=await guest();
    await fs.write("one",DOCUMENTS+"/one.txt");
    await fs.write("two",DOCUMENTS+"/two.txt");
    await fs.writeBytes(Uint8Array.from([9]),DOCUMENTS+"/Archive.zip");
    const selected=[DOCUMENTS+"/one.txt",DOCUMENTS+"/two.txt"];
    const first=await createSourceGuestArchive(fs,DOCUMENTS,selected);
    const second=await createSourceGuestArchive(fs,DOCUMENTS,selected);
    expect(first).toBe(DOCUMENTS+"/Archive (2).zip");
    expect(second).toBe(DOCUMENTS+"/Archive (3).zip");
    expect(await fs.readBytes(DOCUMENTS+"/Archive.zip"))
      .toEqual(Uint8Array.from([9]));
    const zipped=unzipSync(await fs.readBytes(first));
    expect(strFromU8(zipped["one.txt"])).toBe("one");
    expect(strFromU8(zipped["two.txt"])).toBe("two");
    expect(await fs.stat(second)).toMatchObject({type:"file"});
  });
  it("rejects virtual Computer root, parent escape, foreign folder and empty selection",async()=>{
    const fs=await guest();
    const item=DOCUMENTS+"/safe.txt";
    await fs.write("safe",item);
    expect(sourceCanCompressSelection(DOCUMENTS,[item])).toBe(true);
    expect(sourceCanCompressSelection("/",[item])).toBe(false);
    expect(sourceCanCompressSelection(DOCUMENTS,[])).toBe(false);
    expect(sourceCanCompressSelection(DOCUMENTS,[DOCUMENTS+"/../evil"])).toBe(false);
    await expect(createSourceGuestArchive(fs,"/",[item]))
      .rejects.toMatchObject({code:"EINVAL"});
    await expect(createSourceGuestArchive(fs,DOCUMENTS,["/tmp/outside.txt"]))
      .rejects.toMatchObject({code:"EINVAL"});
    await expect(createSourceGuestArchive(fs,DOCUMENTS,[DOCUMENTS+"/absent.txt"]))
      .rejects.toMatchObject({code:"ENOENT"});
    expect((await fs.list(DOCUMENTS)).map(e=>e.name)).toEqual(["safe.txt"]);
  });
  it("does not publish a partial ZIP if any selected guest item disappears",async()=>{
    const fs=await guest();
    await fs.write("present",DOCUMENTS+"/exists.txt");
    await expect(createSourceGuestArchive(fs,DOCUMENTS,[
      DOCUMENTS+"/exists.txt",DOCUMENTS+"/missing.txt"
    ])).rejects.toBeInstanceOf(FileStoreError);
    expect((await fs.list(DOCUMENTS)).map(e=>e.name)).toEqual(["exists.txt"]);
  });
  it("declares a bounded archive byte budget instead of unbounded main-thread ZIP",()=>{
    expect(SOURCE_GUEST_ZIP_MAX_BYTES).toBe(32*1024*1024);
  });
});

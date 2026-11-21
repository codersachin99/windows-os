import {describe,it,expect} from "vitest";
import {zipSync} from "fflate";
import {
  VirtualFileStore,sourceCanExtractGuestZip,
  extractSourceGuestZip,createSourceGuestArchive
} from "./index";
import {SOURCE_GUEST_PROFILE} from "./sourceGuest";

const FOLDER=SOURCE_GUEST_PROFILE+"/Documents";
async function guest(storage?:{getItem(key:string):string|null;setItem(key:string,value:string):void}){
  const fs=new VirtualFileStore(storage);
  let uri="";
  for(const part of FOLDER.split("/").filter(Boolean)){
    uri+="/"+part;
    await fs.mkdir(uri);
  }
  return fs;
}
function zipped(members:Record<string,Uint8Array|string>){
  const zip=Object.create(null) as Record<string,Uint8Array>;
  for(const [name,value] of Object.entries(members)){
    zip[name]=typeof value==="string"?new TextEncoder().encode(value):value;
  }
  return zipSync(zip);
}

describe("frozen main.js Extract here / mounted Guest ZIP",()=>{
  it("unpacks nested binary files, UTF-8 text and empty directories atomically",async()=>{
    const fs=await guest();
    const binary=Uint8Array.from([0,255,1,2,0,250]);
    await fs.writeBytes(zipped({
      "Bundle/":new Uint8Array(0),
      "Bundle/Bytes.bin":binary,
      "Bundle/Nested/Hello.txt":"Hi 👋",
      "Bundle/Empty/":new Uint8Array(0)
    }),FOLDER+"/Bundle.zip");
    expect(sourceCanExtractGuestZip(FOLDER,FOLDER+"/Bundle.zip")).toBe(true);
    expect(await extractSourceGuestZip(fs,FOLDER,FOLDER+"/Bundle.zip"))
      .toEqual([FOLDER+"/Bundle"]);
    expect(await fs.readBytes(FOLDER+"/Bundle/Bytes.bin")).toEqual(binary);
    expect(await fs.read(FOLDER+"/Bundle/Nested/Hello.txt")).toBe("Hi 👋");
    expect(await fs.stat(FOLDER+"/Bundle/Empty")).toMatchObject({type:"directory"});
    expect(await fs.stat(FOLDER+"/Bundle.zip")).toMatchObject({type:"file"});
  });
  it("reads ZIP bytes produced by the matching Guest compression service",async()=>{
    const fs=await guest();
    await fs.write("roundtrip",FOLDER+"/Before.txt");
    const zippedPath=await createSourceGuestArchive(fs,FOLDER,[FOLDER+"/Before.txt"]);
    await fs.remove(FOLDER+"/Before.txt");
    expect(await extractSourceGuestZip(fs,FOLDER,zippedPath))
      .toEqual([FOLDER+"/Before.txt"]);
    expect(await fs.read(FOLDER+"/Before.txt")).toBe("roundtrip");
  });
  it("rejects existing files and folder conflicts without leaving partial output",async()=>{
    const fs=await guest();
    await fs.write("preserve",FOLDER+"/existing.txt");
    await fs.writeBytes(zipped({
      "Fresh/New.txt":"new","existing.txt":"clobber"
    }),FOLDER+"/Conflict.zip");
    await expect(extractSourceGuestZip(fs,FOLDER,FOLDER+"/Conflict.zip"))
      .rejects.toMatchObject({code:"EEXIST"});
    expect(await fs.stat(FOLDER+"/Fresh")).toBeNull();
    expect(await fs.read(FOLDER+"/existing.txt")).toBe("preserve");
  });
  it("rejects traversal, absolute Windows separators, duplicate case-folded names",async()=>{
    const fs=await guest();
    const invalid=[
      {"../escape.txt":"unsafe"},
      {"/absolute.txt":"unsafe"},
      {"folder\\bad.txt":"unsafe"},
      {"Dup.txt":"a","dup.txt":"b"}
    ];
    for(let i=0;i<invalid.length;i++){
      const archive=FOLDER+"/Bad"+i+".zip";
      await fs.writeBytes(zipped(invalid[i]),archive);
      await expect(extractSourceGuestZip(fs,FOLDER,archive))
        .rejects.toBeInstanceOf(Error);
      expect(await fs.stat(FOLDER+"/escape.txt")).toBeNull();
      expect(await fs.stat(FOLDER+"/Dup.txt")).toBeNull();
    }
  });
  it("denies missing, foreign or unsupported archive paths and bad ZIP data",async()=>{
    const fs=await guest();
    expect(sourceCanExtractGuestZip("/",FOLDER+"/Broken.zip")).toBe(false);
    expect(sourceCanExtractGuestZip(FOLDER,FOLDER+"/../Broken.zip")).toBe(false);
    expect(sourceCanExtractGuestZip(FOLDER,FOLDER+"/Broken.rar")).toBe(false);
    await expect(extractSourceGuestZip(fs,FOLDER,FOLDER+"/Missing.zip"))
      .rejects.toMatchObject({code:"ENOENT"});
    await fs.writeBytes(Uint8Array.from([1,2,3]),FOLDER+"/Broken.zip");
    await expect(extractSourceGuestZip(fs,FOLDER,FOLDER+"/Broken.zip"))
      .rejects.toBeInstanceOf(Error);
    expect((await fs.list(FOLDER)).map(file=>file.name)).toEqual(["Broken.zip"]);
  });
  it("rolls back a full extracted tree if Guest persistence runs out of space",async()=>{
    let fail=false;
    const fs=await guest({
      getItem:()=>null,
      setItem:()=>{if(fail)throw new Error("storage full");}
    });
    await fs.writeBytes(zipped({"Dir/Child.txt":"content"}),FOLDER+"/Quota.zip");
    fail=true;
    await expect(extractSourceGuestZip(fs,FOLDER,FOLDER+"/Quota.zip"))
      .rejects.toThrow("storage full");
    expect(await fs.stat(FOLDER+"/Dir")).toBeNull();
    expect(await fs.stat(FOLDER+"/Dir/Child.txt")).toBeNull();
  });
  it("does not enable extraction for a virtual root or other extensions",()=>{
    expect(sourceCanExtractGuestZip(FOLDER,FOLDER+"/Ready.zip")).toBe(true);
    expect(sourceCanExtractGuestZip(FOLDER,FOLDER+"/Ready.7z")).toBe(false);
    expect(sourceCanExtractGuestZip(FOLDER,FOLDER+"/Ready.rar")).toBe(false);
    expect(sourceCanExtractGuestZip(FOLDER,FOLDER+"/Nested/Ready.zip")).toBe(false);
    expect(sourceCanExtractGuestZip("/tmp","/tmp/Ready.zip")).toBe(false);
  });
});

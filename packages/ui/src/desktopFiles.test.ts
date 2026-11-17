import { describe, it, expect } from "vitest";
import { VirtualFileStore } from "@windows-os/filesystem";
import { legacyArt } from "@windows-os/assets";
import {listSourceDesktopFiles,sourceDesktopFileArtwork} from "./desktopFiles";

describe("legacy main.js file-backed Guest desktop shortcuts",()=>{
  it("lists real filesystem entries without fabricated desktop defaults",async()=>{
    const fs = new VirtualFileStore();
    await fs.mkdir("/Volume"); await fs.mkdir("/Volume/Desktop");
    await fs.mkdir("/Volume/Desktop/Work");
    await fs.write("notes", "/Volume/Desktop/note.txt");
    const files=await listSourceDesktopFiles(fs,"/Volume/Desktop");
    expect(files.map(f=>f.id)).toEqual([
      "file:/Volume/Desktop/Work","file:/Volume/Desktop/note.txt"
    ]);
    expect(files[0]).toMatchObject({label:"Work",entry:{type:"directory"},programId:null});
    expect(files[1]).toMatchObject({label:"note.txt",entry:{type:"file"},programId:null});
  });
  it("parses source JSON .lnk and strips only the visible shortcut extension",async()=>{
    const fs=new VirtualFileStore();await fs.mkdir("/Desktop");
    await fs.write('{"exe":"notepad","icon":"notepad"}',"/Desktop/Notepad.lnk");
    const [entry]=await listSourceDesktopFiles(fs,"/Desktop");
    expect(entry).toMatchObject({
      id:"file:/Desktop/Notepad.lnk",label:"Notepad",programId:"notepad"
    });
  });
  it("accepts imported UTF-8 JSON shortcut bytes but never treats unknown programs as runnable",async()=>{
    const fs=new VirtualFileStore();await fs.mkdir("/Desktop");
    await fs.writeBytes(new TextEncoder().encode(
      '{"exe":"calc","icon":"calc"}'
    ),"/Desktop/Calculator.lnk");
    await fs.writeBytes(new Uint8Array([0,255,2]),"/Desktop/random.lnk");
    await fs.write('{"exe":"shell-command","icon":"cmd"}',"/Desktop/unsafe.lnk");
    const entries=await listSourceDesktopFiles(fs,"/Desktop");
    const byName=new Map(entries.map(e=>[e.label,e]));
    expect(byName.get("Calculator")?.programId).toBe("calc");
    expect(byName.get("random")?.programId).toBeNull();
    expect(byName.get("unsafe")?.programId).toBeNull();
  });
  it("reflects changed source VFS inventory only and rejects missing mounted paths",async()=>{
    const fs=new VirtualFileStore();await fs.mkdir("/Mounted");
    expect(await listSourceDesktopFiles(fs,"/Mounted")).toEqual([]);
    await fs.write("hello","/Mounted/hello.txt");
    expect(await listSourceDesktopFiles(fs,"/Mounted")).toHaveLength(1);
    await fs.remove("/Mounted/hello.txt");
    expect(await listSourceDesktopFiles(fs,"/Mounted")).toEqual([]);
    await expect(listSourceDesktopFiles(fs,"/Unknown")).rejects.toMatchObject({
      code:"ENOENT"
    });
  });
});

describe("pinned desktop source 4cca filename and 0f35 shortcut display icons",()=>{
  it("classifies real file/folder entries using the original imported artwork",async()=>{
    const fs=new VirtualFileStore();await fs.mkdir("/Desktop");
    await fs.write("hi","/Desktop/readme.txt");
    await fs.writeBytes(new Uint8Array([0x89,0x50]),"/Desktop/photo.png");
    await fs.mkdir("/Desktop/Folder");
    const files=await listSourceDesktopFiles(fs,"/Desktop");
    const byName=new Map(files.map(file=>[file.label,file]));
    expect(byName.get("readme.txt")).toMatchObject({
      iconType:"text",icon:legacyArt.file,artwork:"fallback"
    });
    expect(byName.get("photo.png")).toMatchObject({
      iconType:"photo",icon:legacyArt.photo,artwork:"original"
    });
    expect(byName.get("Folder")).toMatchObject({
      iconType:"folder",icon:legacyArt.folder,artwork:"original"
    });
  });
  it("preserves custom shortcut icons independently of source executable",async()=>{
    const fs=new VirtualFileStore();await fs.mkdir("/Desktop");
    await fs.write('{"exe":"notepad","icon":"calc"}',"/Desktop/Calculator Look.lnk");
    await fs.write('{"exe":"unknown","icon":"notepad"}',"/Desktop/Unsafe.lnk");
    await fs.write("{invalid","/Desktop/Broken.lnk");
    const files=await listSourceDesktopFiles(fs,"/Desktop");
    const byName=new Map(files.map(file=>[file.label,file]));
    expect(byName.get("Calculator Look")).toMatchObject({
      programId:"notepad",iconType:"file",iconOverride:"calc",
      icon:legacyArt.calculator,artwork:"original"
    });
    expect(byName.get("Unsafe")).toMatchObject({
      programId:null,iconOverride:"notepad",icon:legacyArt.notepad,
      artwork:"original"
    });
    expect(byName.get("Broken")).toMatchObject({
      programId:null,iconOverride:"file",icon:legacyArt.file,artwork:"original"
    });
  });
});

describe("shared original theme Desktop and Explorer artwork",()=>{
  it("selects original XP/Win11 file and folder imagery without breaking Win7",async()=>{
    const fs=new VirtualFileStore();await fs.mkdir("/Desktop");
    await fs.mkdir("/Desktop/Folder");
    await fs.write("hello","/Desktop/notes.txt");
    await fs.writeBytes(new Uint8Array([1]),"/Desktop/raw.bin");
    const found=await listSourceDesktopFiles(fs,"/Desktop");
    const byName=new Map(found.map(f=>[f.label,f]));
    expect(sourceDesktopFileArtwork(byName.get("Folder")!,"winxp")).toEqual({
      icon:"/assets/images/folder-winxp.ff1b00c5.webp",artwork:"original"});
    expect(sourceDesktopFileArtwork(byName.get("notes.txt")!,"win11")).toEqual({
      icon:"/assets/images/text-win11.d9d08eae.webp",artwork:"original"});
    expect(sourceDesktopFileArtwork(byName.get("raw.bin")!,"winxp")).toEqual({
      icon:"/assets/images/file-winxp.c130b357.webp",artwork:"original"});
    expect(sourceDesktopFileArtwork(byName.get("Folder")!,"win7")).toEqual({
      icon:legacyArt.folder,artwork:"original"});
  });
  it("preserves shortcut program icon overrides, custom URLs and fallback state",async()=>{
    const fs=new VirtualFileStore();await fs.mkdir("/Desktop");
    await fs.write('{"exe":"notepad","icon":"notepad"}',"/Desktop/Notepad.lnk");
    await fs.write('{"exe":"notepad","icon":"https://example.org/icon.png"}',
      "/Desktop/Custom.lnk");
    await fs.write('{"exe":"missing","icon":"unknown"}',"/Desktop/Unknown.lnk");
    const found=await listSourceDesktopFiles(fs,"/Desktop");
    const byName=new Map(found.map(f=>[f.label,f]));
    expect(sourceDesktopFileArtwork(byName.get("Notepad")!,"winxp")).toEqual({
      icon:"/assets/images/notepad-winxp.82037fb1.webp",artwork:"original"});
    expect(sourceDesktopFileArtwork(byName.get("Notepad")!,"win11")).toEqual({
      icon:"/assets/images/notepad-win11.2e4af294.webp",artwork:"original"});
    expect(sourceDesktopFileArtwork(byName.get("Custom")!,"win11")).toEqual({
      icon:"https://example.org/icon.png",artwork:"custom"});
    expect(sourceDesktopFileArtwork(byName.get("Unknown")!,"winxp")).toEqual({
      icon:"/assets/images/file-winxp.c130b357.webp",artwork:"fallback"});
  });
});

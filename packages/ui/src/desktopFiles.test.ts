import { describe, it, expect } from "vitest";
import { VirtualFileStore } from "@windows-os/filesystem";
import { listSourceDesktopFiles } from "./desktopFiles";

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

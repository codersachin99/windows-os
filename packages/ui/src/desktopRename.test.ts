import {describe,it,expect} from "vitest";
import {VirtualFileStore} from "@windows-os/filesystem";
import {desktopEditableName,desktopFileExtension,renameSourceDesktopFile} from "./desktopRename";

const setup=async()=>{
  const fs=new VirtualFileStore();
  await fs.mkdir("/Guest");await fs.mkdir("/Guest/Desktop");
  return fs;
};
describe("source c5f4 desktop FileRename contract",()=>{
 it("keeps the source hidden extension for TXT and .lnk, preserving original bytes",async()=>{
   const fs=await setup();
   await fs.write("hello","/Guest/Desktop/Notes.txt");
   await fs.writeBytes(new Uint8Array([12,255,0]),"/Guest/Desktop/Tool.lnk");
   const text=(await fs.stat("/Guest/Desktop/Notes.txt"))!;
   const shortcut=(await fs.stat("/Guest/Desktop/Tool.lnk"))!;
   expect(desktopEditableName(text)).toBe("Notes");
   expect(desktopFileExtension(text)).toBe(".txt");
   expect(desktopEditableName(shortcut)).toBe("Tool");
   expect(await renameSourceDesktopFile(fs,text,"Meeting Notes"))
     .toBe("/Guest/Desktop/Meeting Notes.txt");
   expect(await fs.read("/Guest/Desktop/Meeting Notes.txt")).toBe("hello");
   expect(await fs.stat(text.uri)).toBeNull();
   await renameSourceDesktopFile(fs,shortcut,"New Tool");
   expect(Array.from(await fs.readBytes("/Guest/Desktop/New Tool.lnk"))).toEqual([12,255,0]);
 });
 it("renames folders atomically with every descendant and no host path write",async()=>{
   const fs=await setup();
   await fs.mkdir("/Guest/Desktop/Folder");
   await fs.write("nested","/Guest/Desktop/Folder/note.txt");
   const folder=(await fs.stat("/Guest/Desktop/Folder"))!;
   expect(desktopEditableName(folder)).toBe("Folder");
   await renameSourceDesktopFile(fs,folder,"Projects");
   expect(await fs.read("/Guest/Desktop/Projects/note.txt")).toBe("nested");
   expect(await fs.stat(folder.uri)).toBeNull();
 });
 it("refuses duplicates, invalid Windows characters and reserved filenames",async()=>{
   const fs=await setup();
   await fs.write("one","/Guest/Desktop/one.txt");
   await fs.write("two","/Guest/Desktop/Two.txt");
   const first=(await fs.stat("/Guest/Desktop/one.txt"))!;
   await expect(renameSourceDesktopFile(fs,first,"two")).rejects.toMatchObject({code:"EEXIST"});
   for(const bad of ["", "../escape", "a/b", "bad:", "bad?", "con", "LPT9", "trailing.", "a".repeat(31)]){
     await expect(renameSourceDesktopFile(fs,first,bad)).rejects.toMatchObject({code:"EINVAL"});
   }
   expect(await fs.read(first.uri)).toBe("one");
   expect(await fs.read("/Guest/Desktop/Two.txt")).toBe("two");
 });
 it("supports case-only edits and no-op renames",async()=>{
   const fs=await setup();
   await fs.write("yes","/Guest/Desktop/hello.txt");
   const file=(await fs.stat("/Guest/Desktop/hello.txt"))!;
   expect(await renameSourceDesktopFile(fs,file,"hello")).toBe(file.uri);
   expect(await renameSourceDesktopFile(fs,file,"HELLO")).toBe("/Guest/Desktop/HELLO.txt");
   expect(await fs.read("/Guest/Desktop/HELLO.txt")).toBe("yes");
 });
 it("does not rename stale source files",async()=>{
   const fs=await setup();await fs.write("x","/Guest/Desktop/missing.txt");
   const file=(await fs.stat("/Guest/Desktop/missing.txt"))!;
   await fs.remove(file.uri);
   await expect(renameSourceDesktopFile(fs,file,"new")).rejects.toMatchObject({code:"ENOENT"});
 });
});

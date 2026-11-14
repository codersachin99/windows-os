import { describe, expect, it } from "vitest";
import { VirtualFileStore } from "./index";
import { FileDragSession, importDroppedFiles } from "./drag";

describe("Explorer's in-process shell drag and dropped file parser", () => {
  it("moves and copies selected virtual files without changing clipboard contents", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/From");await fs.mkdir("/To");
    await fs.write("hello", "/From/a.txt");
    const drag=new FileDragSession();
    const token=drag.begin(["/From/a.txt"]);
    expect(drag.snapshot("invalid-token")).toBeNull();
    expect(drag.snapshot(token)).toEqual(["/From/a.txt"]);
    await drag.drop(fs,token,"/To","copy");
    expect(await fs.read("/From/a.txt")).toBe("hello");
    expect(await fs.read("/To/a.txt")).toBe("hello");
    drag.end(token);
    await expect(drag.drop(fs,token,"/To","move")).rejects.toMatchObject({code:"EINVAL"});
    const moving=drag.begin(["/From/a.txt"]);
    await drag.drop(fs,moving,"/","move");
    expect(await fs.stat("/From/a.txt")).toBeNull();
    expect(await fs.read("/a.txt")).toBe("hello");
  });
  it("prevents recursion and collisions before any drag move", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/A");await fs.mkdir("/A/Inner");
    await fs.mkdir("/B");await fs.write("first","/A/first.txt");
    await fs.write("other","/B/first.txt");
    const drag=new FileDragSession();
    const tok=drag.begin(["/A"]);
    await expect(drag.drop(fs,tok,"/A/Inner","move")).rejects.toMatchObject({code:"EINVAL"});
    drag.end(tok);
    const next=drag.begin(["/A/first.txt"]);
    await expect(drag.drop(fs,next,"/B","move")).rejects.toMatchObject({code:"EEXIST"});
    expect(await fs.read("/A/first.txt")).toBe("first");
  });
  it("imports a text file and binary file without pretending to move host files", async () => {
    const fs=new VirtualFileStore();
    await fs.mkdir("/Uploads");
    const textFile=new File(["hello from desktop"],"note.txt",{type:"text/plain"});
    const png=new File([new Uint8Array([0,1,255,2])],"pixel.png",{type:"image/png"});
    const result=await importDroppedFiles(fs,[textFile,png],"/Uploads");
    expect(result.map(x=>x.name)).toEqual(["note.txt","pixel.png"]);
    expect(await fs.read("/Uploads/note.txt")).toBe("hello from desktop");
    expect(Array.from(await fs.readBytes("/Uploads/pixel.png"))).toEqual([0,1,255,2]);
  });
  it("rejects existing files and duplicate names before importing any data", async () => {
    const fs=new VirtualFileStore();
    await fs.mkdir("/Uploads");await fs.write("unchanged","/Uploads/old.txt");
    await expect(importDroppedFiles(fs,[
      new File(["new"],"new.txt"),new File(["bad"],"old.txt")
    ],"/Uploads")).rejects.toMatchObject({code:"EEXIST"});
    expect(await fs.stat("/Uploads/new.txt")).toBeNull();
    expect(await fs.read("/Uploads/old.txt")).toBe("unchanged");
    await expect(importDroppedFiles(fs,[
      new File(["a"],"Same.txt"),new File(["b"],"same.txt")
    ],"/Uploads")).rejects.toMatchObject({code:"EEXIST"});
  });
});

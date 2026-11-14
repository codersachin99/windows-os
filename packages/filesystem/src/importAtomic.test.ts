import { describe, expect, it } from "vitest";
import { VirtualFileStore, type FileStoreChange } from "./index";
import { importDroppedFiles } from "./drag";

function persistent() {
  let data: string | null = null;
  let writes = 0;
  let fail = false;
  const storage = {
    getItem: (_: string) => data,
    setItem: (_: string, value: string) => {
      if (fail) throw new Error("QuotaExceededError: simulated");
      data = value;
      writes++;
    }
  };
  return { storage, writes: () => writes, data: () => data,
    block: () => { fail = true; }, unblock: () => { fail = false; } };
}
async function fixture() {
  const memory = persistent();
  const fs = new VirtualFileStore(memory.storage);
  await fs.mkdir("/Uploads");
  await fs.mkdir("/Other");
  return { fs, memory };
}

describe("atomic browser File selection import", () => {
  it("saves mixed Unicode text and exact binary data with one Guest snapshot and ordered events", async () => {
    const { fs, memory } = await fixture();
    const before = memory.writes();
    const events: FileStoreChange[] = [];
    fs.subscribe(change => events.push(change));
    const files = [
      new File(["Hello 😀\n漢字"], "notes.TXT", {type:"text/plain"}),
      new File([new Uint8Array([0, 1, 254, 255, 0])], "picture.png", {type:"image/png"})
    ];
    const result = await importDroppedFiles(fs, files, "/Uploads");
    expect(result.map(entry => [entry.uri, entry.size]))
      .toEqual([["/Uploads/notes.TXT", 17], ["/Uploads/picture.png", 5]]);
    expect(memory.writes() - before).toBe(1);
    expect(events).toEqual([
      {type:"created",path:"/Uploads/notes.TXT"},
      {type:"created",path:"/Uploads/picture.png"}
    ]);
    expect(await fs.read("/Uploads/notes.TXT")).toBe("Hello 😀\n漢字");
    expect([...await fs.readBytes("/Uploads/picture.png")]).toEqual([0, 1, 254, 255, 0]);
    const reopened = new VirtualFileStore(memory.storage);
    expect(await reopened.read("/Uploads/notes.TXT")).toBe("Hello 😀\n漢字");
    expect([...await reopened.readBytes("/Uploads/picture.png")]).toEqual([0, 1, 254, 255, 0]);
  });

  it("does not create any file if the storage/quota write rejects; retries cleanly", async () => {
    const { fs, memory } = await fixture();
    const before = memory.data();
    const beforeWrites = memory.writes();
    const events: FileStoreChange[] = [];
    fs.subscribe(change => events.push(change));
    const files = [new File(["hello"], "first.txt"),
      new File([new Uint8Array([0, 255])], "second.dat")];
    memory.block();
    await expect(importDroppedFiles(fs,files,"/Uploads")).rejects.toThrow("QuotaExceededError");
    expect(memory.data()).toBe(before);
    expect(memory.writes()).toBe(beforeWrites);
    expect(events).toEqual([]);
    expect(await fs.list("/Uploads")).toEqual([]);
    memory.unblock();
    await importDroppedFiles(fs, files, "/Uploads");
    expect(memory.writes()).toBe(beforeWrites + 1);
    expect((await fs.list("/Uploads")).map(x => x.name)).toEqual(["first.txt","second.dat"]);
  });

  it("does not commit when the second browser File fails to decode", async () => {
    const { fs, memory } = await fixture();
    const broken = new File(["failed"],"bad.txt",{type:"text/plain"});
    Object.defineProperty(broken, "text", {
      value: async () => { throw new Error("File read aborted"); }
    });
    const before = memory.data();
    const events:FileStoreChange[] = [];
    fs.subscribe(event => events.push(event));
    await expect(importDroppedFiles(fs,[
      new File(["good"],"good.txt"),broken
    ],"/Uploads")).rejects.toThrow("File read aborted");
    expect(memory.data()).toBe(before);
    expect(events).toEqual([]);
    expect(await fs.list("/Uploads")).toEqual([]);
  });

  it("preflights all targets and refuses to overwrite an existing file", async () => {
    const {fs,memory} = await fixture();
    await fs.write("original","/Uploads/exists.txt");
    const before=memory.writes();
    await expect(importDroppedFiles(fs, [
      new File(["safe"],"new.txt"),new File(["bad"],"exists.txt")
    ],"/Uploads")).rejects.toMatchObject({code:"EEXIST"});
    expect(await fs.stat("/Uploads/new.txt")).toBeNull();
    expect(await fs.read("/Uploads/exists.txt")).toBe("original");
    expect(memory.writes()).toBe(before);
    await expect(importDroppedFiles(fs,[
      new File(["first"],"DUP.txt"),new File(["second"],"dup.TXT")
    ],"/Uploads")).rejects.toMatchObject({code:"EEXIST"});
    expect(memory.writes()).toBe(before);
  });

  it("rechecks targets at commit after a concurrent file creation during host decoding", async () => {
    const {fs,memory}=await fixture();
    const delayed = new File(["later"],"race.txt");
    Object.defineProperty(delayed,"text",{
      value:async()=> {
        await fs.write("earlier", "/Uploads/race.txt");
        return "later";
      }
    });
    const before=memory.writes();
    await expect(importDroppedFiles(fs,[delayed],"/Uploads"))
      .rejects.toMatchObject({code:"EEXIST"});
    expect(memory.writes()-before).toBe(1);
    expect(await fs.read("/Uploads/race.txt")).toBe("earlier");
  });

  it("refuses malformed names before reading any payload and preserves existing state", async () => {
    const {fs,memory}=await fixture();
    const before=memory.writes();
    await expect(importDroppedFiles(fs,[new File(["bad"],"wrong/path.txt")],"/Uploads"))
      .rejects.toMatchObject({code:"EINVAL"});
    expect(memory.writes()).toBe(before);
    expect(await fs.list("/Uploads")).toEqual([]);
  });

  it("atomic create-only API rejects duplicate normalized paths and non-file content", async () => {
    const {fs,memory}=await fixture();
    const before=memory.writes();
    await expect(fs.createFilesAtomic([
      {path:"/Uploads/Same.txt",content:"a"},
      {path:"/Uploads/same.TXT",content:"b"}
    ])).rejects.toMatchObject({code:"EEXIST"});
    await expect(fs.createFilesAtomic([
      {path:"/Uploads/good.txt",content:"okay"},
      {path:"/Uploads/bad.txt",content:99 as unknown as string}
    ])).rejects.toMatchObject({code:"EINVAL"});
    expect(memory.writes()).toBe(before);
    expect(await fs.list("/Uploads")).toEqual([]);
  });
});

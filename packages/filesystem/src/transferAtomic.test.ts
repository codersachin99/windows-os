import { describe, expect, it } from "vitest";
import { VirtualFileStore, type FileStoreChange } from "./index";
import { FileClipboard } from "./clipboard";
import { FileDragSession } from "./drag";
import { transferFiles } from "./transfer";

function persistent() {
  let data: string | null = null;
  let writes = 0;
  let blocked = false;
  const storage = {
    getItem: () => data,
    setItem: (_:string, next:string) => {
      if (blocked) throw new Error("QuotaExceededError: cannot persist");
      writes++;
      data = next;
    }
  };
  return {
    storage, writes: () => writes, serialized: () => data,
    fail: () => { blocked = true; },
    recover: () => { blocked = false; }
  };
}
async function seeded() {
  const memory = persistent();
  const store = new VirtualFileStore(memory.storage);
  await store.mkdir("/From");
  await store.mkdir("/To");
  await store.mkdir("/From/Alpha");
  await store.mkdir("/From/Beta");
  await store.write("alpha contents", "/From/Alpha/a.txt");
  await store.writeBytes(new Uint8Array([0,255,1]), "/From/Beta/b.bin");
  return {store,memory};
}
describe("one-snapshot multi-item source FileCopy/FileMove", () => {
  it("makes a multi-root nested move in one persisted write with ordered notifications", async () => {
    const {store,memory}=await seeded();
    const before=memory.writes();
    const changes: FileStoreChange[]=[];
    store.subscribe(change => { changes.push(change); });
    const entries=await transferFiles(store, ["/From/Beta", "/From/Alpha"], "/To", "move");
    expect(entries.map(item => item.uri)).toEqual(["/To/Beta","/To/Alpha"]);
    expect(memory.writes()-before).toBe(1);
    expect(changes).toEqual([
      {type:"moved",from:"/From/Beta",to:"/To/Beta"},
      {type:"moved",from:"/From/Alpha",to:"/To/Alpha"}
    ]);
    expect(await store.stat("/From/Alpha")).toBeNull();
    expect(await store.read("/To/Alpha/a.txt")).toBe("alpha contents");
    expect(Array.from(await store.readBytes("/To/Beta/b.bin"))).toEqual([0,255,1]);
    const restored=new VirtualFileStore(memory.storage);
    expect(await restored.read("/To/Alpha/a.txt")).toBe("alpha contents");
  });
  it("stages every copied subtree with a single commit and preserves original bytes", async () => {
    const {store,memory}=await seeded();
    const before=memory.writes();
    const result=await transferFiles(store,["/From/Alpha","/From/Beta"],"/To","copy");
    expect(result.map(entry=>entry.uri)).toEqual(["/To/Alpha","/To/Beta"]);
    expect(memory.writes()-before).toBe(1);
    expect(await store.read("/From/Alpha/a.txt")).toBe("alpha contents");
    expect(await store.read("/To/Alpha/a.txt")).toBe("alpha contents");
    expect(Array.from(await store.readBytes("/To/Beta/b.bin"))).toEqual([0,255,1]);
  });
  for(const mode of ["copy","move"] as const) {
    it("survives a simulated quota failure without publishing any partial "+mode,async()=>{
      const {store,memory}=await seeded();
      const before=memory.serialized();
      const writes=memory.writes();
      const events:FileStoreChange[]=[];
      store.subscribe(change=>events.push(change));
      memory.fail();
      await expect(transferFiles(store,
        ["/From/Alpha","/From/Beta"],"/To",mode
      )).rejects.toThrow("QuotaExceededError");
      expect(memory.serialized()).toBe(before);
      expect(memory.writes()).toBe(writes);
      expect(events).toEqual([]);
      expect(await store.stat("/To/Alpha")).toBeNull();
      expect(await store.stat("/To/Beta")).toBeNull();
      expect(await store.read("/From/Alpha/a.txt")).toBe("alpha contents");
      expect(Array.from(await store.readBytes("/From/Beta/b.bin"))).toEqual([0,255,1]);
      memory.recover();
      await transferFiles(store,["/From/Alpha","/From/Beta"],"/To",mode);
      expect(await store.stat("/To/Alpha")).not.toBeNull();
    });
  }
  it("preflights collisions before any persisted writes", async () => {
    const {store,memory}=await seeded();
    await store.mkdir("/To/Beta");
    const before=memory.writes();
    await expect(transferFiles(store,["/From/Alpha","/From/Beta"],"/To","move"))
      .rejects.toMatchObject({code:"EEXIST"});
    expect(memory.writes()).toBe(before);
    expect(await store.stat("/To/Alpha")).toBeNull();
    expect(await store.read("/From/Alpha/a.txt")).toBe("alpha contents");
  });
  it("uses atomicity for cut clipboard and drag sessions without clearing clipboard on failed storage", async () => {
    const {store,memory}=await seeded();
    const clipboard=new FileClipboard();
    clipboard.prepare(["/From/Alpha","/From/Beta"],"cut");
    const token=new FileDragSession();
    const id=token.begin(["/From/Alpha","/From/Beta"]);
    memory.fail();
    await expect(clipboard.paste(store,"/To")).rejects.toThrow("QuotaExceededError");
    expect(clipboard.snapshot().paths).toHaveLength(2);
    await expect(token.drop(store,id,"/To","copy")).rejects.toThrow("QuotaExceededError");
    expect(await store.stat("/To/Alpha")).toBeNull();
    memory.recover();
    await clipboard.paste(store,"/To");
    expect(clipboard.snapshot().paths).toEqual([]);
    expect(await store.stat("/From/Alpha")).toBeNull();
    token.end(id);
  });
});

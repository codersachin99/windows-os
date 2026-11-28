import { describe, expect, it } from "vitest";
import { VirtualFileStore, type FileStoreStorage } from "./index";

async function mounted(storage?: FileStoreStorage) {
  const fs = new VirtualFileStore(storage);
  await fs.mkdir("/Volume");
  await fs.mkdir("/Volume/Desktop");
  await fs.mkdir("/Volume/Trash");
  return fs;
}
describe("source desktop file group drag to mounted Recycle Bin", () => {
  it("recycles files and non-empty directories as one group and restores their original paths", async () => {
    const fs = await mounted();
    await fs.write("one", "/Volume/Desktop/One.txt");
    await fs.mkdir("/Volume/Desktop/My Folder");
    await fs.write("inside", "/Volume/Desktop/My Folder/inside.txt");
    const result = await fs.trashMany(
      ["/Volume/Desktop/One.txt", "/Volume/Desktop/My Folder"], "/Volume/Trash"
    );
    expect(result).toHaveLength(2);
    expect(result[0].originalPath).toBe("/Volume/Desktop/One.txt");
    expect(result[1].originalPath).toBe("/Volume/Desktop/My Folder");
    expect(await fs.list("/Volume/Desktop")).toEqual([]);
    expect(await fs.read("/Volume/Trash/My Folder/inside.txt")).toBe("inside");
    await fs.restore(result[0].uri, "/Volume/Trash");
    await fs.restore(result[1].uri, "/Volume/Trash");
    expect(await fs.read("/Volume/Desktop/One.txt")).toBe("one");
    expect(await fs.read("/Volume/Desktop/My Folder/inside.txt")).toBe("inside");
  });
  it("renames duplicate destination filenames without corrupting any original source", async () => {
    const fs = await mounted();
    await fs.mkdir("/Volume/Other");
    await fs.write("first", "/Volume/Desktop/Duplicate.txt");
    await fs.write("second", "/Volume/Other/Duplicate.txt");
    const result = await fs.trashMany(
      ["/Volume/Desktop/Duplicate.txt", "/Volume/Other/Duplicate.txt"], "/Volume/Trash"
    );
    expect(result.map(item => item.name)).toEqual(["Duplicate.txt", "Duplicate (1).txt"]);
    expect(await fs.read("/Volume/Trash/Duplicate.txt")).toBe("first");
    expect(await fs.read("/Volume/Trash/Duplicate (1).txt")).toBe("second");
  });
  it("preflights nested parents and missing paths before removing anything", async () => {
    const fs = await mounted();
    await fs.mkdir("/Volume/Desktop/Parent");
    await fs.write("child", "/Volume/Desktop/Parent/Child.txt");
    await expect(fs.trashMany([
      "/Volume/Desktop/Parent", "/Volume/Desktop/Parent/Child.txt"
    ], "/Volume/Trash")).rejects.toMatchObject({ code: "EINVAL" });
    await expect(fs.trashMany([
      "/Volume/Desktop/Parent", "/Volume/Desktop/Missing"
    ], "/Volume/Trash")).rejects.toMatchObject({ code: "ENOENT" });
    await expect(fs.trashMany([
      "/Volume/Desktop/Parent", "/Volume/Desktop/Parent"
    ], "/Volume/Trash")).rejects.toMatchObject({ code: "EINVAL" });
    expect(await fs.read("/Volume/Desktop/Parent/Child.txt")).toBe("child");
    expect(await fs.list("/Volume/Trash")).toEqual([]);
  });
  it("does not mutate memory or notify observers if persistence fails", async () => {
    const records = new Map<string, string>();
    let fail = false;
    const storage: FileStoreStorage = {
      getItem: key => records.get(key) ?? null,
      setItem: (key,value) => {
        if (fail) throw new Error("storage limit");
        records.set(key,value);
      }
    };
    const fs = await mounted(storage);
    await fs.write("A", "/Volume/Desktop/A.txt");
    await fs.write("B", "/Volume/Desktop/B.txt");
    const events: string[] = [];
    fs.subscribe(change => events.push(change.type));
    fail = true;
    await expect(fs.trashMany([
      "/Volume/Desktop/A.txt","/Volume/Desktop/B.txt"
    ], "/Volume/Trash")).rejects.toThrow("storage limit");
    expect(await fs.read("/Volume/Desktop/A.txt")).toBe("A");
    expect(await fs.read("/Volume/Desktop/B.txt")).toBe("B");
    expect(await fs.list("/Volume/Trash")).toEqual([]);
    expect(events).toEqual([]);
  });
});

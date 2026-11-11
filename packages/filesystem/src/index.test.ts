import { describe, expect, it } from "vitest";
import {
  FileStoreError, getFileName, getParentDirectory, normalizeFileUri,
  VirtualFileStore, type FileStoreStorage
} from "./index";
class MemoryStorage implements FileStoreStorage {
  private data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
}
describe("source URI compatibility", () => {
  it("normalizes absolute paths and parent directories without escaping root", () => {
    expect(normalizeFileUri("/users//Guest/../Guest/Documents/./notes.txt"))
      .toBe("/users/Guest/Documents/notes.txt");
    expect(normalizeFileUri("/../../users\\Guest")).toBe("/users/Guest");
    expect(getParentDirectory("/users/Guest/notes.txt")).toBe("/users/Guest");
    expect(getParentDirectory("/")).toBe("/");
    expect(getFileName("/users/Guest/notes.txt")).toBe("notes.txt");
    expect(() => normalizeFileUri("C:\\Users\\Guest")).toThrow(FileStoreError);
    expect(() => normalizeFileUri("/a\0b")).toThrow(FileStoreError);
  });
});
describe("VirtualFileStore", () => {
  it("creates, reads, edits and enumerates text files with byte size", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/users");
    await fs.mkdir("/users/Guest");
    expect(await fs.write("hello 😀", "/users/Guest/note.txt"))
      .toMatchObject({ name: "note.txt", type: "file", size: 10 });
    expect(await fs.read("/users/Guest/note.txt")).toBe("hello 😀");
    expect((await fs.list("/users/Guest")).map(item => item.name)).toEqual(["note.txt"]);
    await fs.write("changed", "/users/Guest/note.txt");
    expect(await fs.read("/users/Guest/note.txt")).toBe("changed");
    expect(await fs.stat("/users/Guest/missing.txt")).toBeNull();
    expect(await fs.isExisting("/users/Guest/missing.txt")).toBe(false);
  });
  it("sorts folders first and returns precise errors", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/Docs");
    await fs.write("z", "/z.txt");
    await fs.write("a", "/a.txt");
    expect((await fs.list("/")).map(item => item.name)).toEqual(["Docs", "a.txt", "z.txt"]);
    await expect(fs.list("/a.txt")).rejects.toMatchObject({ code: "ENOTDIR" });
    await expect(fs.read("/Docs")).rejects.toMatchObject({ code: "EISDIR" });
    await expect(fs.write("x", "/missing/x.txt")).rejects.toMatchObject({ code: "ENOENT" });
    await expect(fs.mkdir("/Docs")).rejects.toMatchObject({ code: "EEXIST" });
    await expect(fs.remove("/")).rejects.toMatchObject({ code: "EINVAL" });
  });
  it("copies and moves nested folders without losing content", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/from");
    await fs.mkdir("/from/inner");
    await fs.write("hello", "/from/inner/file.txt");
    await fs.copy("/from", "/copy");
    await fs.move("/from", "/renamed");
    expect(await fs.read("/copy/inner/file.txt")).toBe("hello");
    expect(await fs.read("/renamed/inner/file.txt")).toBe("hello");
    expect(await fs.stat("/from")).toBeNull();
    await expect(fs.move("/renamed", "/renamed/inner/nested"))
      .rejects.toMatchObject({ code: "EINVAL" });
    await expect(fs.copy("/copy", "/renamed")).rejects.toMatchObject({ code: "EEXIST" });
  });
  it("protects non-empty directories and deletes empty ones", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/Docs");
    await fs.write("content", "/Docs/note.txt");
    await expect(fs.remove("/Docs")).rejects.toMatchObject({ code: "ENOTEMPTY" });
    await fs.remove("/Docs/note.txt");
    await fs.remove("/Docs");
    expect(await fs.list("/")).toEqual([]);
  });
  it("persists and restores user files through injected storage", async () => {
    const storage = new MemoryStorage();
    const fs = new VirtualFileStore(storage);
    await fs.mkdir("/Docs");
    await fs.write("persisted", "/Docs/letter.txt");
    const restored = new VirtualFileStore(storage);
    expect(await restored.read("/Docs/letter.txt")).toBe("persisted");
    expect((await restored.list("/Docs"))[0]).toMatchObject({ size: 9, name: "letter.txt" });
  });
  it("does not mutate memory on failed storage writes", async () => {
    const fs = new VirtualFileStore({
      getItem: () => null,
      setItem: () => { throw new Error("Quota exceeded"); }
    });
    await expect(fs.mkdir("/Docs")).rejects.toThrow("Quota exceeded");
    expect(await fs.stat("/Docs")).toBeNull();
  });
  it("does not overwrite corrupt persisted files", () => {
    const storage = new MemoryStorage();
    const bad = '{"version":1,"entries":[{"uri":"/missing/file","type":"file","content":"x","mtime":1}]}';
    storage.setItem("windows-os:vfs:guest:v1", bad);
    expect(() => new VirtualFileStore(storage)).toThrow("Stored file data cannot be loaded");
    expect(storage.getItem("windows-os:vfs:guest:v1")).toBe(bad);
  });
});

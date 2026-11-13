import { describe, expect, it, vi } from "vitest";
import { VirtualFileStore } from "./index";
import { searchFiles } from "./search";
import { SourceSearchIndex } from "./sourceSearchIndex";

async function fixture() {
  const store = new VirtualFileStore();
  await store.mkdir("/data");
  await store.mkdir("/data/Docs");
  await store.mkdir("/data/Docs/Deep");
  await store.mkdir("/bin");
  await store.write("sample", "/data/Docs/Report.txt");
  await store.write("alpha", "/data/Docs/Deep/Notes.txt");
  await store.write("hidden metadata", "/data/.meta");
  await store.write("separate", "/bin/Ignore.txt");
  return store;
}
const ranked = { scope: "/data", text: "report", subfolders: true, sourceRanked: true };

describe("pinned 2e2c.b source per-Computer cached search index", () => {
  it("caches searched directory listings across different queries, and hides .meta", async () => {
    const store = await fixture();
    const list = vi.spyOn(store, "list");
    const index = new SourceSearchIndex(store);
    try {
      const first = await searchFiles(index, ranked);
      const second = await searchFiles(index, { ...ranked, text: "notes" });
      expect(first.files.map(entry => entry.name)).toEqual(["Report.txt"]);
      expect(second.files.map(entry => entry.name)).toEqual(["Notes.txt"]);
      expect(list).toHaveBeenCalledTimes(3);
      expect(list.mock.calls.map(([path]) => path)).toEqual([
        "/data", "/data/Docs", "/data/Docs/Deep"
      ]);
      const all = await searchFiles(index, { scope: "/data", subfolders: false });
      expect(all.files.map(entry => entry.name)).toEqual(["Docs"]);
      expect((await searchFiles(store, { scope: "/data", subfolders: false }))
        .files.map(entry => entry.name)).toContain(".meta");
    } finally { index.dispose(); }
  });

  it("invalidates affected parent after create, update and delete, but retains unrelated folders", async () => {
    const store = await fixture();
    const list = vi.spyOn(store, "list");
    const index = new SourceSearchIndex(store);
    try {
      await searchFiles(index, ranked);
      expect(list).toHaveBeenCalledTimes(3);
      await store.write("new", "/data/Docs/Report-New.txt");
      const created = await searchFiles(index, ranked);
      expect(created.files.map(entry => entry.name).sort())
        .toEqual(["Report-New.txt", "Report.txt"]);
      expect(list).toHaveBeenCalledTimes(4); // only /data/Docs is invalidated

      await store.write("updated longer text", "/data/Docs/Report.txt");
      const updated = await searchFiles(index, ranked);
      expect(updated.files.find(entry => entry.name === "Report.txt")?.size)
        .toBe("updated longer text".length);
      expect(list).toHaveBeenCalledTimes(5);

      await store.remove("/data/Docs/Report-New.txt");
      const removed = await searchFiles(index, ranked);
      expect(removed.files.map(entry => entry.name)).toEqual(["Report.txt"]);
      expect(list).toHaveBeenCalledTimes(6);

      await store.write("x", "/bin/Ignore-2.txt");
      await searchFiles(index, ranked);
      expect(list).toHaveBeenCalledTimes(6);
    } finally { index.dispose(); }
  });

  it("invalidates old/new parent and cached descendants when folders move", async () => {
    const store = await fixture();
    const list = vi.spyOn(store, "list");
    const index = new SourceSearchIndex(store);
    try {
      await searchFiles(index, { ...ranked, text: "notes" });
      expect(list).toHaveBeenCalledTimes(3);
      await store.move("/data/Docs/Deep", "/data/Deep-Moved");
      const after = await searchFiles(index, { ...ranked, text: "notes" });
      expect(after.files.map(entry => entry.uri))
        .toEqual(["/data/Deep-Moved/Notes.txt"]);
      expect(list).toHaveBeenCalledTimes(6);
      expect(list.mock.calls.at(-1)?.[0]).toBe("/data/Deep-Moved");
    } finally { index.dispose(); }
  });

  it("notifies listeners only for changed cached listings and stops after dispose", async () => {
    const store = await fixture();
    const index = new SourceSearchIndex(store);
    const listener = vi.fn();
    index.subscribeInvalidation(listener);
    await searchFiles(index, { scope: "/data", subfolders: false });
    await store.write("unrelated", "/bin/not-in-search.txt");
    expect(listener).not.toHaveBeenCalled();

    await store.write("new", "/data/recent.txt");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(index.invalidate(["/not-cached"])).toBe(false);
    await searchFiles(index, { scope: "/data", subfolders: false });
    expect(index.invalidate(["/data"])).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    index.dispose();
    await store.write("after", "/data/after.txt");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("does not cache a rejected transaction or expose stale data after recycle/restore", async () => {
    const store = await fixture();
    await store.mkdir("/Trash");
    const index = new SourceSearchIndex(store);
    try {
      await searchFiles(index, ranked);
      await store.trash("/data/Docs/Report.txt", "/Trash");
      expect((await searchFiles(index, ranked)).files).toEqual([]);
      const trashed = (await store.list("/Trash"))[0];
      await store.restore(trashed.uri, "/Trash");
      expect((await searchFiles(index, ranked)).files.map(x => x.name))
        .toEqual(["Report.txt"]);
    } finally { index.dispose(); }
  });

  it("deduplicates concurrent list calls, keeps a cached fallback for unreadable folders", async () => {
    const store = await fixture();
    const list = vi.spyOn(store, "list");
    const index = new SourceSearchIndex(store);
    try {
      const [first, second] = await Promise.all([
        index.list("/data/Docs"), index.list("/data/Docs")
      ]);
      expect(list).toHaveBeenCalledTimes(1);
      first.pop();
      expect(second).toHaveLength(2);
      expect((await index.list("/data/Docs"))).toHaveLength(2);
      expect((await index.list("/missing"))).toEqual([]);
      expect((await index.list("/missing"))).toEqual([]);
      expect(list).toHaveBeenCalledTimes(2);
      await expect(searchFiles(index, { scope: "/missing" }))
        .rejects.toMatchObject({ code: "ENOENT" });
    } finally { index.dispose(); }
  });

  it("emits source-style c/discovered fractional progress across multiple disk roots", async () => {
    const store = new VirtualFileStore();
    await store.mkdir("/disk0");
    await store.mkdir("/disk1");
    await store.mkdir("/disk0/Child");
    await store.write("target", "/disk0/Child/Report.txt");
    const index = new SourceSearchIndex(store);
    try {
      const fractions: number[] = [];
      const results = await searchFiles(index, {
        scope: "/disk0", rootScopes: ["/disk0", "/disk1"],
        subfolders: true, text: "report"
      }, { onProgress: value => fractions.push(value.fraction ?? 0) });
      expect(fractions).toEqual([1/3,2/3,1]);
      expect(results.progress.foldersScanned).toBe(3);
      expect(results.files.map(item => item.name)).toEqual(["Report.txt"]);
      const shallow: number[] = [];
      await searchFiles(index, {
        scope: "/disk0", rootScopes: ["/disk0","/disk1"], subfolders: false
      }, { onProgress: value => shallow.push(value.fraction ?? 0) });
      expect(shallow).toEqual([0.5,1]);
    } finally { index.dispose(); }
  });

  it("excluded and .meta subtrees never expand progress denominators", async () => {
    const store = await fixture();
    await store.mkdir("/data/Trash");
    await store.mkdir("/data/Trash/Unseen");
    const index = new SourceSearchIndex(store);
    try {
      const fractions: number[] = [];
      const result = await searchFiles(index, {
        scope: "/data", subfolders: true, skipPaths: ["/data/Trash"]
      }, { onProgress: value => fractions.push(value.fraction ?? 0) });
      expect(result.progress.foldersScanned).toBe(3);
      expect(fractions).toEqual([1/2,2/3,1]);
      expect(result.files.some(item => item.name === ".meta")).toBe(false);
    } finally { index.dispose(); }
  });
});

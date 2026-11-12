import { describe, expect, it } from "vitest";
import { VirtualFileStore } from "./index";
import { matchFilePattern, searchFiles } from "./search";

async function fixture() {
  const fs = new VirtualFileStore();
  await fs.mkdir("/data");
  await fs.mkdir("/data/Documents");
  await fs.mkdir("/data/Documents/Deep");
  await fs.mkdir("/data/Trash");
  await fs.write("a", "/data/Draft.TXT");
  await fs.write("b", "/data/Documents/readme.txt");
  await fs.write("c", "/data/Documents/Deep/notes.txt");
  await fs.write("d", "/data/Trash/deleted.txt");
  return fs;
}
describe("source Computer search scope/pattern/subfolder contract", () => {
  it("supports case-insensitive DOS wildcards without regex injection", () => {
    expect(matchFilePattern("README.TXT", "*.txt")).toBe(true);
    expect(matchFilePattern("readme.txt", "read?e.txt")).toBe(true);
    expect(matchFilePattern("readme.txt", "readme.tx?")).toBe(true);
    expect(matchFilePattern("readme.txt", "*.jpg")).toBe(false);
    expect(matchFilePattern("test[1].txt", "test[1].txt")).toBe(true);
    expect(matchFilePattern("test1.txt", "test[1].txt")).toBe(false);
  });
  it("distinguishes current-folder search and subfolder walking", async () => {
    const fs = await fixture();
    const shallow = await searchFiles(fs, { scope: "/data", namePattern: "*.txt" });
    expect(shallow.files.map(x => x.name)).toEqual(["Draft.TXT"]);
    const deep = await searchFiles(fs, { scope: "/data", namePattern: "*.txt", subfolders: true });
    expect(deep.files.map(x => x.name).sort()).toEqual(["Draft.TXT","deleted.txt","notes.txt","readme.txt"].sort());
    expect(deep.progress.foldersScanned).toBe(4);
  });
  it("supports source-style excluded trash roots and text-name filters", async () => {
    const fs = await fixture();
    const searched = await searchFiles(fs, {
      scope: "/data", text: "note", namePattern: "*.txt", subfolders: true,
      skipPaths: ["/data/Trash"]
    });
    expect(searched.files.map(x => x.uri)).toEqual(["/data/Documents/Deep/notes.txt"]);
    expect(searched.progress.foldersScanned).toBe(3);
  });
  it("emits folder progress, caps results and permits cancellation", async () => {
    const fs = await fixture();
    const updates: number[] = [];
    const result = await searchFiles(fs, {
      scope: "/data", subfolders: true, maxResults: 3
    }, { onProgress: p => updates.push(p.foldersScanned) });
    expect(result.files).toHaveLength(3);
    expect(updates).toEqual([1,2]);
    const controller = new AbortController();
    controller.abort();
    await expect(searchFiles(fs, { scope: "/data", subfolders: true },
      { signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" });
  });
  it("rejects invalid scopes and limits", async () => {
    const fs = await fixture();
    await expect(searchFiles(fs, { scope: "/missing" })).rejects.toMatchObject({ code: "ENOENT" });
    await expect(searchFiles(fs, { scope: "/data/Draft.TXT" })).rejects.toMatchObject({ code: "ENOTDIR" });
    await expect(searchFiles(fs, { scope: "/data", maxResults: 0 })).rejects.toMatchObject({ code: "EINVAL" });
  });
});

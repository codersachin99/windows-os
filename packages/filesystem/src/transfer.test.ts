import { describe, it, expect } from "vitest";
import { VirtualFileStore } from "./index";
import { transferFiles } from "./transfer";

describe("source Explorer FileCopy/FileMove transfer", () => {
  it("moves folders with children and copies files without altering the shell clipboard", async () => {
    const files = new VirtualFileStore();
    await files.mkdir("/From");
    await files.mkdir("/To");
    await files.mkdir("/From/Folder");
    await files.write("nested", "/From/Folder/readme.txt");
    const moved = await transferFiles(files, ["/From/Folder"], "/To", "move");
    expect(moved.map(item => item.uri)).toEqual(["/To/Folder"]);
    expect(await files.read("/To/Folder/readme.txt")).toBe("nested");
    expect(await files.stat("/From/Folder")).toBeNull();
    const copied = await transferFiles(files, ["/To/Folder/readme.txt"], "/From", "copy");
    expect(copied.map(x => x.uri)).toEqual(["/From/readme.txt"]);
    expect(await files.read("/To/Folder/readme.txt")).toBe("nested");
  });
  it("prevents self moves, descendant recursion, collisions and missing sources", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/A"); await fs.mkdir("/B"); await fs.mkdir("/A/Child");
    await fs.write("one", "/A/one.txt");
    await fs.write("existing", "/B/one.txt");
    await expect(transferFiles(fs, ["/A"], "/A/Child", "move"))
      .rejects.toMatchObject({code:"EINVAL"});
    await expect(transferFiles(fs, ["/A/one.txt"], "/A", "copy"))
      .rejects.toMatchObject({code:"EINVAL"});
    await expect(transferFiles(fs, ["/A/one.txt"], "/B", "move"))
      .rejects.toMatchObject({code:"EEXIST"});
    await expect(transferFiles(fs, ["/missing.txt"], "/B", "move"))
      .rejects.toMatchObject({code:"ENOENT"});
    expect(await fs.read("/A/one.txt")).toBe("one");
    expect(await fs.read("/B/one.txt")).toBe("existing");
  });
  it("preflights the whole multi-selection before any destination changes", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/From");await fs.mkdir("/Other");await fs.mkdir("/To");
    await fs.write("one", "/From/one.txt");
    await fs.write("two", "/From/two.txt");
    await fs.write("two-existing", "/To/two.txt");
    await expect(transferFiles(fs, ["/From/one.txt", "/From/two.txt"], "/To", "move"))
      .rejects.toMatchObject({code:"EEXIST"});
    expect(await fs.stat("/To/one.txt")).toBeNull();
    expect(await fs.read("/From/one.txt")).toBe("one");
    await fs.write("third", "/Other/one.txt");
    await expect(transferFiles(fs, ["/From/one.txt", "/Other/one.txt"], "/To", "copy"))
      .rejects.toMatchObject({code:"EEXIST"});
    expect(await fs.stat("/To/one.txt")).toBeNull();
  });
  it("deduplicates nested source paths", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/From");await fs.mkdir("/To");await fs.mkdir("/From/Folder");
    await fs.write("x", "/From/Folder/child.txt");
    const result=await transferFiles(fs, ["/From/Folder","/From/Folder/child.txt"], "/To", "move");
    expect(result).toHaveLength(1);
    expect(await fs.read("/To/Folder/child.txt")).toBe("x");
  });
});

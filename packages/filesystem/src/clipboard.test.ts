import { describe, expect, it } from "vitest";
import { VirtualFileStore } from "./index";
import { FileClipboard } from "./clipboard";

describe("Explorer shell file clipboard", () => {
  it("copies and moves files between Explorer windows with shared contents", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/A");
    await fs.mkdir("/B");
    await fs.write("hello", "/A/readme.txt");
    const clipboard = new FileClipboard();
    clipboard.prepare(["/A/readme.txt"], "copy");
    await clipboard.paste(fs, "/B");
    expect(await fs.read("/B/readme.txt")).toBe("hello");
    expect(clipboard.snapshot()).toMatchObject({ operation: "copy", paths: ["/A/readme.txt"] });
    clipboard.prepare(["/B/readme.txt"], "cut");
    await clipboard.paste(fs, "/");
    expect(await fs.stat("/B/readme.txt")).toBeNull();
    expect(await fs.read("/readme.txt")).toBe("hello");
    expect(clipboard.snapshot()).toEqual({ operation: null, paths: [] });
  });
  it("rejects collisions before mutating any selected files", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/A");
    await fs.mkdir("/B");
    await fs.write("one", "/A/one.txt");
    await fs.write("two", "/A/two.txt");
    await fs.write("existing", "/B/two.txt");
    const clipboard = new FileClipboard();
    clipboard.prepare(["/A/one.txt", "/A/two.txt"], "cut");
    await expect(clipboard.paste(fs, "/B")).rejects.toMatchObject({ code: "EEXIST" });
    expect(await fs.stat("/B/one.txt")).toBeNull();
    expect(await fs.read("/A/one.txt")).toBe("one");
    expect(clipboard.snapshot().operation).toBe("cut");
  });
  it("prevents partial multi-selection copy when names collide", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/A");
    await fs.mkdir("/B");
    await fs.mkdir("/Target");
    await fs.write("a", "/A/readme.txt");
    await fs.write("b", "/B/readme.txt");
    const clipboard = new FileClipboard();
    clipboard.prepare(["/A/readme.txt", "/B/readme.txt"], "cut");
    await expect(clipboard.paste(fs, "/Target")).rejects.toMatchObject({ code: "EEXIST" });
    expect(await fs.list("/Target")).toHaveLength(0);
    expect(await fs.read("/A/readme.txt")).toBe("a");
    expect(await fs.read("/B/readme.txt")).toBe("b");
  });
  it("rejects folder self-paste, descendant paste, and empty clipboard", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/Folder");
    await fs.mkdir("/Folder/Child");
    const clipboard = new FileClipboard();
    await expect(clipboard.paste(fs, "/")).rejects.toMatchObject({ code: "EINVAL" });
    clipboard.prepare(["/Folder", "/Folder/Child"], "copy");
    expect(clipboard.snapshot().paths).toEqual(["/Folder"]);
    await expect(clipboard.paste(fs, "/Folder/Child")).rejects.toMatchObject({ code: "EINVAL" });
    clipboard.prepare(["/Folder"], "cut");
    await expect(clipboard.paste(fs, "/")).rejects.toMatchObject({ code: "EINVAL" });
  });
  it("announces changes and handles removal of a copied source", async () => {
    const fs = new VirtualFileStore();
    await fs.write("x", "/old.txt");
    const clipboard = new FileClipboard();
    const events: string[] = [];
    const unsub = clipboard.subscribe(s => events.push(s.operation ?? "empty"));
    clipboard.prepare(["/old.txt"], "copy");
    await fs.remove("/old.txt");
    await expect(clipboard.paste(fs, "/")).rejects.toMatchObject({ code: "ENOENT" });
    clipboard.clear();
    unsub();
    expect(events).toEqual(["copy", "empty"]);
  });
});

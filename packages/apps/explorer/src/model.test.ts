import { describe, it, expect } from "vitest";
import { VirtualFileStore } from "@windows-os/filesystem";
import { ExplorerSession } from "./model";

describe("source-following Explorer navigation contract", () => {
  it("navigates folders with history, back, forward and up", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/users");
    await fs.mkdir("/users/Guest");
    const explorer = new ExplorerSession(fs);
    await explorer.refresh();
    expect(explorer.visible().map(x => x.name)).toEqual(["users"]);
    await explorer.open("/users");
    await explorer.open("/users/Guest");
    expect(explorer.snapshot()).toMatchObject({ path: "/users/Guest", canGoBack: true, canGoForward: false });
    await explorer.back();
    expect(explorer.snapshot().path).toBe("/users");
    await explorer.back();
    expect(explorer.snapshot()).toMatchObject({ path: "/", canGoBack: false, canGoForward: true });
    await explorer.forward();
    expect(explorer.snapshot().path).toBe("/users");
    await explorer.up();
    expect(explorer.snapshot().path).toBe("/");
    explorer.close();
  });
  it("filters actual files and supports source view modes and selection", async () => {
    const fs = new VirtualFileStore();
    await fs.write("a", "/alpha.txt");
    await fs.write("b", "/beta.txt");
    const explorer = new ExplorerSession(fs);
    await explorer.refresh();
    // Original webpack cb81 initializes every Computer session in Tiles.
    expect(explorer.snapshot().viewMode).toBe("tiles");
    explorer.search("ALP");
    expect(explorer.visible().map(x => x.name)).toEqual(["alpha.txt"]);
    explorer.selectAll();
    expect(explorer.snapshot().selected).toEqual(["/alpha.txt"]);
    explorer.setViewMode("tiles");
    expect(explorer.snapshot().viewMode).toBe("tiles");
    explorer.setViewMode("extra-large-icons");
    expect(explorer.snapshot().viewMode).toBe("extra-large-icons");
    explorer.select("/alpha.txt");
    explorer.select("/beta.txt", true);
    expect(explorer.snapshot().selected).toEqual(["/alpha.txt", "/beta.txt"]);
    explorer.select("/alpha.txt", true);
    expect(explorer.snapshot().selected).toEqual(["/beta.txt"]);
    explorer.close();
  });
  it("refreshes automatically when a shared Notepad document is written", async () => {
    const fs = new VirtualFileStore();
    const explorer = new ExplorerSession(fs);
    const disconnect = explorer.connect();
    await explorer.refresh();
    const states: number[] = [];
    explorer.subscribe(s => { if (!s.busy) states.push(s.items.length); });
    await fs.write("Notepad content", "/written.txt");
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(explorer.visible().map(x => x.name)).toEqual(["written.txt"]);
    expect(states).toContain(1);
    disconnect();
    explorer.close();
  });
  it("creates and renames folders without writing to host filesystem", async () => {
    const fs = new VirtualFileStore();
    const explorer = new ExplorerSession(fs);
    await explorer.createFolder("Documents");
    await explorer.rename("/Documents", "Notes");
    expect(await fs.stat("/Notes")).toMatchObject({ name: "Notes", type: "directory" });
    expect(await fs.stat("/Documents")).toBeNull();
    await expect(explorer.createFolder("../bad")).rejects.toMatchObject({ code: "EINVAL" });
    explorer.close();
  });
  it("keeps source Recycle Bin Explorer within its hoisted trashPath", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/system");
    await fs.mkdir("/system/trash");
    await fs.mkdir("/system/trash/Sub");
    const explorer = new ExplorerSession(fs, "/system/trash", "/system/trash");
    await explorer.refresh();
    await explorer.up();
    expect(explorer.snapshot().path).toBe("/system/trash");
    await expect(explorer.open("/system")).rejects.toMatchObject({ code: "EINVAL" });
    await explorer.open("/system/trash/Sub");
    await explorer.up();
    expect(explorer.snapshot().path).toBe("/system/trash");
    explorer.close();
  });
  it("rejects opening files as folders without changing active path", async () => {
    const fs = new VirtualFileStore();
    await fs.write("text", "/note.txt");
    const explorer = new ExplorerSession(fs);
    await explorer.refresh();
    await expect(explorer.open("/note.txt")).rejects.toMatchObject({ code: "ENOTDIR" });
    expect(explorer.snapshot().path).toBe("/");
    explorer.close();
  });
});

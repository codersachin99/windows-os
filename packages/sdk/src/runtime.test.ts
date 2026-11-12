import { describe, expect, it } from "vitest";
import { VirtualFileStore } from "@windows-os/filesystem";
import { SourceFilesystemRuntime } from "./runtime";

const source = {
  root: "/data/system",
  desktopPath: "/data/system/disk1/users/Guest/Desktop",
  trashPath: "/data/system/disk1/Trash",
  disks: [{ letter: "C", path: "/data/system/disk1", label: "System" }],
  user: { folder: "Guest", name: "Guest" }
};

describe("source filesystem runtime", () => {
  it("mounts only supplied paths and makes source trash available to Explorer/Bin", async () => {
    const files = new VirtualFileStore();
    const runtime = new SourceFilesystemRuntime(files);
    expect(runtime.snapshot()).toBeNull();
    const events: string[] = [];
    const unsub = runtime.subscribe(session => events.push(session?.trashPath ?? "absent"));
    await runtime.configure(source);
    expect(runtime.snapshot()?.trashPath).toBe(source.trashPath);
    expect(await files.stat(source.trashPath)).toMatchObject({ type: "directory" });
    await files.write("test", source.desktopPath + "/note.txt");
    const trashed = await files.trash(source.desktopPath + "/note.txt", runtime.snapshot()!.trashPath);
    expect(trashed.originalPath).toBe(source.desktopPath + "/note.txt");
    expect((await files.list(source.trashPath)).map(e => e.name)).toEqual(["note.txt"]);
    runtime.clear();
    expect(events).toEqual([source.trashPath, "absent"]);
    unsub();
  });
  it("does not expose source path after failed mount", async () => {
    const fs = new VirtualFileStore();
    const runtime = new SourceFilesystemRuntime(fs);
    await expect(runtime.configure({ ...source, trashPath: "/not-the-system/bin" }))
      .rejects.toThrow("outside source system root");
    expect(runtime.snapshot()).toBeNull();
  });
});

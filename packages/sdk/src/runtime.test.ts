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
  it("persists only source-supplied metadata and restores after a new Guest session", async () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value); }
    };
    const fs = new VirtualFileStore(storage);
    const first = new SourceFilesystemRuntime(fs, storage);
    await first.configure(source);
    const newSession = new SourceFilesystemRuntime(new VirtualFileStore(storage), storage);
    await newSession.restorePersisted();
    expect(newSession.snapshot()?.trashPath).toBe(source.trashPath);
    await newSession.snapshot()?.store.write("persisted", source.desktopPath + "/saved.txt");
    expect(await fs.stat(source.desktopPath + "/saved.txt")).toBeNull();
    expect((await newSession.snapshot()?.store.read(source.desktopPath + "/saved.txt"))).toBe("persisted");
  });
  it("auto-installs exact source drive0 C: and Guest folders on first login", async () => {
    const storageMap = new Map<string, string>();
    const storage = {
      getItem: (key: string) => storageMap.get(key) ?? null,
      setItem: (key: string, data: string) => { storageMap.set(key, data); }
    };
    const files = new VirtualFileStore(storage);
    const runtime = new SourceFilesystemRuntime(files, storage);
    await runtime.startGuest();
    const session = runtime.snapshot()!;
    expect(session.pathConfig.root).toBe("/EXTERNAL/computer");
    expect(session.pathConfig.drives).toEqual([expect.objectContaining({
      path: "drive0", letter: "C", label: "System"
    })]);
    expect(session.desktopPath).toBe("/EXTERNAL/computer/drive0/Users/Guest/Desktop");
    expect(session.trashPath).toBe(
      "/EXTERNAL/computer/drive0/Users/Guest/AppData/Roaming/WindowsOS/Windows/RecycleBin"
    );
    expect(await files.stat("/EXTERNAL/computer/drive0/Windows/System32"))
      .toMatchObject({ type: "directory" });
    expect(await files.stat("/EXTERNAL/computer/drive0/Users/Guest/Documents"))
      .toMatchObject({ type: "directory" });
    expect(await files.stat("/EXTERNAL/computer/drive0/Users/Guest/AppData/Roaming/WindowsOS/Windows/Start Menu/Programs/Games"))
      .toMatchObject({ type: "directory" });
    await files.write("safe", session.desktopPath + "/saved.txt");
    await runtime.startGuest();
    expect(await files.read(session.desktopPath + "/saved.txt")).toBe("safe");
    const reopened = new SourceFilesystemRuntime(new VirtualFileStore(storage), storage);
    await reopened.startGuest();
    expect(reopened.snapshot()?.trashPath).toBe(session.trashPath);
  });
  it("prefers an existing explicit source runtime without overwriting it on login", async () => {
    const storageMap = new Map<string, string>();
    const storage = {
      getItem: (key: string) => storageMap.get(key) ?? null,
      setItem: (key: string, value: string) => { storageMap.set(key, value); }
    };
    const first = new SourceFilesystemRuntime(new VirtualFileStore(storage), storage);
    await first.configure(source);
    const nextFiles = new VirtualFileStore(storage);
    const next = new SourceFilesystemRuntime(nextFiles, storage);
    await next.startGuest();
    expect(next.snapshot()?.pathConfig.root).toBe("/data/system");
    expect(await nextFiles.stat("/EXTERNAL/computer")).toBeNull();
  });
  it("does not expose source path after failed mount", async () => {
    const fs = new VirtualFileStore();
    const runtime = new SourceFilesystemRuntime(fs);
    await expect(runtime.configure({ ...source, trashPath: "/not-the-system/bin" }))
      .rejects.toThrow("outside source system root");
    expect(runtime.snapshot()).toBeNull();
  });
});

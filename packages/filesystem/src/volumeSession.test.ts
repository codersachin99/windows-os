import { describe, it, expect } from "vitest";
import { FileStoreError, VirtualFileStore } from "./index";
import { LegacyVolumeSession, createProfileFileStore } from "./volumeSession";
const runtime = {
  root: "/storage/system",
  desktopPath: "/storage/system/disk-1/users/guest-folder/Desktop",
  trashPath: "/storage/system/disk-1/$trash",
  disks: [{ letter: "C", path: "/storage/system/disk-1", label: "Main" }],
  user: { folder: "guest-folder", name: "Guest" }
};
describe("legacy volume/session boundary", () => {
  it("mounts only configured source drive/profile paths and remains idempotent", async () => {
    const store = new VirtualFileStore();
    const session = new LegacyVolumeSession(store, runtime);
    await session.mount();
    await session.mount();
    expect((await store.list("/storage/system")).map(e => e.name)).toEqual(["disk-1"]);
    expect(await store.stat(runtime.desktopPath)).toMatchObject({ type: "directory" });
    expect(await store.stat(runtime.trashPath)).toMatchObject({ type: "directory" });
    expect(session.toUri("C:\\users\\Guest\\Desktop\\note.txt"))
      .toBe(runtime.desktopPath + "/note.txt");
    expect(session.toWindowsPath(runtime.desktopPath + "/note.txt"))
      .toBe("C:\\users\\Guest\\Desktop\\note.txt");
    await store.write("file content", runtime.desktopPath + "/note.txt");
    expect(await store.read(runtime.desktopPath + "/note.txt")).toBe("file content");
  });
  it("allows empty source disks but never invents C:", async () => {
    const store = new VirtualFileStore();
    const session = new LegacyVolumeSession(store, { ...runtime, disks: [] });
    await session.mount();
    expect(session.pathConfig.drives).toEqual([]);
    expect(session.toUri("C:\\file.txt")).toBeNull();
  });
  it("rejects duplicates, paths outside source root and occupied mounts", async () => {
    expect(() => new LegacyVolumeSession(new VirtualFileStore(), {
      ...runtime, disks: [runtime.disks[0], runtime.disks[0]]
    })).toThrow("Duplicate source disk");
    expect(() => new LegacyVolumeSession(new VirtualFileStore(), {
      ...runtime, desktopPath: "/outside/Desktop"
    })).toThrow("outside source system root");
    expect(() => new LegacyVolumeSession(new VirtualFileStore(), {
      ...runtime, disks: [runtime.disks[0], {
        letter: "D", path: "/elsewhere/disk-2"
      }]
    })).toThrow("do not belong to source system root");
    const store = new VirtualFileStore();
    await store.mkdir("/storage");
    await store.write("taken", "/storage/system");
    const session = new LegacyVolumeSession(store, runtime);
    await expect(session.mount()).rejects.toMatchObject({ code: "ENOTDIR" });
  });
  it("creates isolated profile stores without migrating or overwriting Guest", async () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => { memory.set(key, value); }
    };
    const guest = createProfileFileStore(storage, { kind: "guest" });
    const alice = createProfileFileStore(storage, { kind: "user", id: "alice" });
    const bob = createProfileFileStore(storage, { kind: "user", id: "bob" });
    await guest.write("Guest", "/notes.txt");
    await alice.write("Alice", "/notes.txt");
    await bob.write("Bob", "/notes.txt");
    expect(await createProfileFileStore(storage, { kind: "guest" }).read("/notes.txt")).toBe("Guest");
    expect(await createProfileFileStore(storage, { kind: "user", id: "alice" }).read("/notes.txt")).toBe("Alice");
    expect(await bob.read("/notes.txt")).toBe("Bob");
    expect(() => createProfileFileStore(storage, { kind: "user", id: " " })).toThrow(FileStoreError);
  });
});

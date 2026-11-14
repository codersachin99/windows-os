import { describe, expect, it } from "vitest";
import {
  FileStoreError, VirtualFileStore, parseSourceShortcut
} from "@windows-os/filesystem";
import { createSourceDesktopItem, createSourceDesktopShortcut } from "./desktopCreate";

async function setup() {
  const store = new VirtualFileStore();
  await store.mkdir("/Mounted");
  await store.mkdir("/Mounted/Guest");
  await store.mkdir("/Mounted/Guest/Desktop");
  return store;
}
const desktop = "/Mounted/Guest/Desktop";

describe("source desktop New submenu / FileCreate", () => {
  it("creates actual file-backed folders and valid TXT/RTF documents", async () => {
    const store = await setup();
    expect(await createSourceDesktopItem(store, desktop, "folder"))
      .toBe(desktop + "/New folder");
    expect(await createSourceDesktopItem(store, desktop, "text"))
      .toBe(desktop + "/New Text Document.txt");
    expect(await createSourceDesktopItem(store, desktop, "richtext"))
      .toBe(desktop + "/New Rich Text Document.rtf");
    expect((await store.stat(desktop + "/New folder"))?.type).toBe("directory");
    expect(await store.read(desktop + "/New Text Document.txt")).toBe("");
    expect(await store.read(desktop + "/New Rich Text Document.rtf"))
      .toMatch(/^\{\\rtf1\\ansi/);
  });
  it("selects a collision-free source-style suffix, including case-insensitive names", async () => {
    const store = await setup();
    await store.mkdir(desktop + "/new FOLDER");
    await store.mkdir(desktop + "/New folder (2)");
    expect(await createSourceDesktopItem(store, desktop, "folder"))
      .toBe(desktop + "/New folder (3)");
    await store.createFile("existing", desktop + "/New Text Document.txt");
    expect(await createSourceDesktopItem(store, desktop, "text"))
      .toBe(desktop + "/New Text Document (2).txt");
    expect(await store.read(desktop + "/New Text Document.txt")).toBe("existing");
  });
  it("writes original JSON .lnk shortcut pointing to the chosen source app", async () => {
    const store = await setup();
    const path = await createSourceDesktopShortcut(store, desktop, "notepad", "Notes shortcut");
    expect(path).toBe(desktop + "/Notes shortcut.lnk");
    expect(parseSourceShortcut(await store.read(path))).toEqual({
      exe: "notepad", icon: "notepad"
    });
    const duplicate = await createSourceDesktopShortcut(store, desktop, "notepad", "notes SHORTCUT");
    expect(duplicate).toBe(desktop + "/notes SHORTCUT (2).lnk");
    expect(parseSourceShortcut(await store.read(duplicate))?.exe).toBe("notepad");
    expect(parseSourceShortcut(await store.read(path))?.exe).toBe("notepad");
    await expect(createSourceDesktopShortcut(store, desktop, "notepad", "Notes shortcut",
      { collision: "reject" })).rejects.toMatchObject({ code: "EEXIST" });
  });
  it("does not execute or accept host paths, unknown programs, reserved names or bad extensions", async () => {
    const store = await setup();
    for (const id of ["not-a-program", "../notepad", "bin", "shell-cmd"]) {
      await expect(createSourceDesktopShortcut(store, desktop, id, "test"))
        .rejects.toMatchObject({ code: "EINVAL" });
    }
    for (const name of ["", "CON", "LPT1", "Bad/Path", "x\\y", "bad:", "a".repeat(31), "Name.lnk"]) {
      await expect(createSourceDesktopShortcut(store, desktop, "calc", name))
        .rejects.toMatchObject({ code: "EINVAL" });
    }
    expect(await store.list(desktop)).toEqual([]);
  });
  it("fails closed if the mounted Desktop is missing", async () => {
    const store = new VirtualFileStore();
    await expect(createSourceDesktopItem(store, "/nonexistent/Desktop", "text"))
      .rejects.toMatchObject({ code: "ENOENT" });
    await expect(createSourceDesktopShortcut(store, "/nonexistent/Desktop", "calc", "Calculator"))
      .rejects.toMatchObject({ code: "ENOENT" });
  });
  it("offers create-only shared VFS semantics: no accidental overwrite", async () => {
    const store = await setup();
    await store.createFile("original", desktop + "/Important.txt");
    await expect(store.createFile("replacement", desktop + "/Important.txt"))
      .rejects.toBeInstanceOf(FileStoreError);
    expect(await store.read(desktop + "/Important.txt")).toBe("original");
    await store.createFile("another", desktop + "/another.txt");
    await expect(store.createFile("bad", desktop + "/another.txt"))
      .rejects.toMatchObject({ code: "EEXIST" });
  });
});

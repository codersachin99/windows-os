import { describe, it, expect } from "vitest";
import { VirtualFileStore } from "@windows-os/filesystem";
import {
  NotepadDocument, SOURCE_NOTEPAD_DEFAULT_FONT, formatNotepadDateTime
} from "./document";

describe("source-mapped native Notepad document engine", () => {
  it("retains source default title, font, word-wrap and status settings", () => {
    const d = new NotepadDocument(new VirtualFileStore());
    expect(d.snapshot()).toMatchObject({
      fileName: "Untitled", content: "", path: null, isChanged: false,
      cursor: [1, 1], isWrapped: false, isStatusVisible: true,
      font: SOURCE_NOTEPAD_DEFAULT_FONT
    });
    expect(d.title()).toBe("Untitled - Notepad");
    expect(d.requestClose()).toBe("close");
  });

  it("tracks dirty state against last saved content and emits updates", () => {
    const d = new NotepadDocument(new VirtualFileStore());
    const updates: string[] = [];
    const unsubscribe = d.subscribe(s => updates.push(s.content));
    d.changeContent("Hello");
    expect(d.title()).toBe("*Untitled - Notepad");
    expect(d.requestClose()).toBe("confirm-save");
    d.changeContent("");
    expect(d.requestClose()).toBe("close");
    unsubscribe();
    d.changeContent("later");
    expect(updates).toEqual(["Hello", ""]);
  });

  it("opens, saves and saves-as using the same shared file store", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/Documents");
    await fs.write("before", "/Documents/test.txt");
    const d = new NotepadDocument(fs);
    await d.open("/Documents/test.txt");
    expect(d.snapshot()).toMatchObject({
      fileName: "test.txt", content: "before", path: "/Documents/test.txt", isChanged: false
    });
    d.changeContent("after");
    expect(await d.save()).toBe("saved");
    expect(d.snapshot().initial.content).toBe("after");
    expect(await fs.read("/Documents/test.txt")).toBe("after");
    expect(d.saveAsLocation()).toBe("/Documents");
    await d.saveAs("/Documents/renamed.html");
    expect(d.title()).toBe("renamed.html - Notepad");
    expect(await fs.read("/Documents/renamed.html")).toBe("after");
  });

  it("requires the source Save As dialog for a document without a path", async () => {
    const d = new NotepadDocument(new VirtualFileStore());
    d.changeContent("unsaved");
    expect(await d.save()).toBe("save-as-required");
    expect(d.saveAsLocation()).toBeNull();
    expect(d.requestClose()).toBe("confirm-save");
  });

  it("keeps original New behavior including its existing document path quirk", async () => {
    const fs = new VirtualFileStore();
    await fs.write("old", "/note.txt");
    const d = new NotepadDocument(fs);
    await d.open("/note.txt");
    d.changeContent("changed");
    d.create();
    expect(d.snapshot()).toMatchObject({
      content: "", fileName: "Untitled", path: "/note.txt", isChanged: false
    });
    // The original compiled create() leaves path assigned.
    expect(await d.save()).toBe("saved");
    expect(await fs.read("/note.txt")).toBe("");
  });

  it("does not erase a document when opening a missing file fails", async () => {
    const d = new NotepadDocument(new VirtualFileStore());
    d.changeContent("keep me");
    await expect(d.open("/missing.txt")).rejects.toMatchObject({ code: "ENOENT" });
    expect(d.snapshot()).toMatchObject({ content: "keep me", isChanged: true });
  });

  it("matches source font/wrap/status toggles, cursor and date/time text", () => {
    const d = new NotepadDocument(new VirtualFileStore(), { untitled: "Unbenannt" });
    d.setFont({ font: "Consolas", size: 12, style: "italic,bold" });
    d.setWordWrap(true);
    d.setStatusVisible(false);
    d.changeCursor(12, 8);
    expect(d.snapshot()).toMatchObject({
      cursor: [12, 8], font: { font: "Consolas", size: 12, style: "italic,bold" },
      isWrapped: true, isStatusVisible: false
    });
    expect(formatNotepadDateTime(new Date(2026, 10, 12, 9, 5))).toBe("09:05 12/11/2026");
  });
});

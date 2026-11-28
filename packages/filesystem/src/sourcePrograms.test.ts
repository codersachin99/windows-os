import { describe, expect, it } from "vitest";
import { VirtualFileStore } from "./index";
import { ensureSourceGuestDirectories, SOURCE_GUEST_PROFILE } from "./sourceGuest";
import {
  sourcePrograms, sourceProgramsById, sourceShortcut,
  sourceShortcutPath, sourceExecutablePath, sourceExecutableStub,
  parseSourceShortcut, installSourceGuestPrograms, SOURCE_START_MENU_PROGRAMS
} from "./sourcePrograms";

describe("pinned original c170 program manifest and 760d installer", () => {
  it("preserves all source programs, installer entries, hidden flags and categories", () => {
    expect(sourcePrograms).toHaveLength(42);
    expect(sourcePrograms.filter(p => p.installPath)).toHaveLength(34);
    expect(sourceProgramsById.get("notepad")).toMatchObject({
      name: "Notepad", category: "accessories",
      installPath: "Windows/System32/notepad.exe"
    });
    expect(sourceProgramsById.get("calc")).toMatchObject({
      name: "Calculator", aliases: ["calculator"],
      installPath: "Windows/System32/calc.exe"
    });
    expect(sourceProgramsById.get("wordpad")?.installPath)
      .toBe("Program Files/Windows NT/Accessories/wordpad.exe");
    expect(sourceProgramsById.get("chrome")?.installPath)
      .toBe("Program Files/Google/Chrome/Application/chrome.exe");
    expect(sourceProgramsById.get("chess")).toMatchObject({
      category: "games", kind: "game", name: "Chess Titans"
    });
    expect(sourceProgramsById.get("bin")).toMatchObject({
      name: "Recycle Bin", hidden: true
    });
    expect(sourceProgramsById.get("bin")?.installPath).toBeUndefined();
  });

  it("uses the source filename, category and exe/icon JSON shortcut contract", () => {
    const notepad = sourceProgramsById.get("notepad")!;
    const chess = sourceProgramsById.get("chess")!;
    const chrome = sourceProgramsById.get("chrome")!;
    expect(sourceShortcutPath(notepad)).toBe(
      SOURCE_START_MENU_PROGRAMS + "/Accessories/Notepad.lnk"
    );
    expect(sourceShortcutPath(chess)).toBe(
      SOURCE_START_MENU_PROGRAMS + "/Games/Chess Titans.lnk"
    );
    expect(sourceShortcutPath(chrome)).toBe(
      SOURCE_START_MENU_PROGRAMS + "/Chrome.lnk"
    );
    expect(sourceShortcutPath(sourceProgramsById.get("computer")!)).toBeNull();
    expect(sourceExecutablePath(notepad)).toBe(
      "/EXTERNAL/computer/drive0/Windows/System32/notepad.exe"
    );
    expect(sourceShortcut(notepad)).toEqual({ exe: "notepad", icon: "notepad" });
    expect(parseSourceShortcut('{"exe":"notepad","icon":"notepad"}')).toEqual({
      exe: "notepad", icon: "notepad"
    });
    expect(parseSourceShortcut('{"exe":"unknown","icon":"unknown"}')).toBeNull();
    expect(parseSourceShortcut("this is not JSON")).toBeNull();
    expect(parseSourceShortcut('{"exe":4,"icon":"notepad"}')).toBeNull();
  });

  it("creates source 1024-byte MZ stubs and all installed program shortcuts", async () => {
    const fs = new VirtualFileStore();
    await ensureSourceGuestDirectories(fs);
    const result = await installSourceGuestPrograms(fs);
    expect(result).toEqual({ installedExecutables: 34, installedShortcuts: 34 });
    for (const program of sourcePrograms.filter(p => p.installPath)) {
      const exe = sourceExecutablePath(program)!;
      const shortcut = sourceShortcutPath(program)!;
      expect(await fs.stat(exe)).toMatchObject({ type: "file", size: 1024 });
      expect(await fs.readBytes(exe)).toEqual(sourceExecutableStub());
      expect(JSON.parse(await fs.read(shortcut))).toEqual(sourceShortcut(program));
    }
    expect((await fs.readBytes(
      "/EXTERNAL/computer/drive0/Windows/System32/notepad.exe"
    )).slice(0, 2)).toEqual(new Uint8Array([77, 90]));
    expect(await fs.stat(
      SOURCE_GUEST_PROFILE + "/AppData/Roaming/WindowsOS/Windows/Start Menu/Programs/Accessories"
    )).toMatchObject({ type: "directory" });
    const again = await installSourceGuestPrograms(fs);
    expect(again).toEqual({ installedExecutables: 0, installedShortcuts: 0 });
  });

  it("keeps user-edited .lnk file and executable unchanged on repeat install", async () => {
    const fs = new VirtualFileStore();
    await ensureSourceGuestDirectories(fs);
    const original = sourceProgramsById.get("notepad")!;
    const link = sourceShortcutPath(original)!;
    const exe = sourceExecutablePath(original)!;
    await fs.write('{"exe":"calc","icon":"calc"}', link);
    await fs.writeBytes(new Uint8Array([1, 2, 3]), exe);
    await installSourceGuestPrograms(fs);
    expect(await fs.read(link)).toBe('{"exe":"calc","icon":"calc"}');
    expect(await fs.readBytes(exe)).toEqual(new Uint8Array([1, 2, 3]));
  });
});

import { describe, expect, it } from "vitest";
import {
  drivesFromLegacyStats, fromStorageUri, parseWindowsPath,
  resolveWindowsPath, toStorageUri, windowsFileName,
  windowsParentDirectory, windowsPath, type LegacyPathConfig
} from "./drivePaths";
const config: LegacyPathConfig = {
  root: "/storage/system",
  drives: [
    { letter: "C", path: "disk-1", label: "Local Disk" },
    { letter: "D", path: "disk-2", label: "Removable Disk" }
  ],
  user: { folder: "guest-internal", name: "Guest" }
};
describe("CMD-compatible Windows paths from pinned legacy source", () => {
  it("turns filesystem getStats data into drive letters and last URI segment", () => {
    expect(drivesFromLegacyStats([
      { letter: "c", path: "/storage/system/disk-1", size: 100 },
      { letter: "d", path: "/storage/system/disk-2", label: "USB" },
      { path: "/no-letter" }
    ])).toEqual([
      { letter: "C", path: "disk-1", label: "", size: 100, used: 0 },
      { letter: "D", path: "disk-2", label: "USB", size: 0, used: 0 }
    ]);
  });
  it("parses drive paths and resolves rooted and relative segments", () => {
    expect(parseWindowsPath("c:/users/Guest")).toEqual({
      letter: "C", segments: ["users", "Guest"], rooted: true
    });
    expect(resolveWindowsPath("..\\Documents\\note.txt", { cwd: "C:\\users\\Guest\\Desktop" }))
      .toBe("C:\\users\\Guest\\Documents\\note.txt");
    expect(resolveWindowsPath("\\Windows", { cwd: "D:\\data" })).toBe("D:\\Windows");
    expect(resolveWindowsPath("C:notes.txt", { cwd: "D:\\data",
      driveCwd: { C: "C:\\users\\Guest" } })).toBe("C:\\users\\Guest\\notes.txt");
    expect(windowsPath("c", ["users", "Guest"])).toBe("C:\\users\\Guest");
    expect(windowsParentDirectory("C:\\users\\Guest\\note.txt")).toBe("C:\\users\\Guest");
    expect(windowsFileName("C:\\users\\Guest\\note.txt")).toBe("note.txt");
  });
  it("maps source guest display name to stored user folder in both directions", () => {
    expect(toStorageUri("C:\\users\\Guest\\Desktop\\note.txt", config))
      .toBe("/storage/system/disk-1/users/guest-internal/Desktop/note.txt");
    expect(fromStorageUri("/storage/system/disk-1/users/guest-internal/Desktop/note.txt", config))
      .toBe("C:\\users\\Guest\\Desktop\\note.txt");
    expect(toStorageUri("D:\\Photos", config)).toBe("/storage/system/disk-2/Photos");
    expect(fromStorageUri("/storage/system/disk-2/Photos", config)).toBe("D:\\Photos");
  });
  it("refuses unknown drives and unrelated filesystem roots", () => {
    expect(toStorageUri("Z:\\anything", config)).toBeNull();
    expect(fromStorageUri("/other/disk-1/file.txt", config)).toBeNull();
    expect(fromStorageUri("/storage/system/missing/file.txt", config)).toBeNull();
  });
});

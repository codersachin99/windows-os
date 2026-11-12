import { describe, expect, it } from "vitest";
import { VirtualFileStore } from "./index";
import {
  ensureSourceGuestDirectories, sourceGuestMounts,
  SOURCE_COMPUTER_ROOT, SOURCE_SYSTEM_DISK, SOURCE_GUEST_PROFILE,
  SOURCE_GUEST_TRASH, SOURCE_SYSTEM_FOLDERS, SOURCE_GUEST_FOLDERS
} from "./sourceGuest";
import { LegacyVolumeSession } from "./volumeSession";

describe("pinned legacy source Guest disk and special folders", () => {
  it("maps source drive0 to System (C:) and Guest profile under Users/Guest", () => {
    const runtime = sourceGuestMounts();
    expect(runtime.root).toBe("/EXTERNAL/computer");
    expect(runtime.disks).toEqual([{
      letter: "C", path: "/EXTERNAL/computer/drive0",
      label: "System", size: 0, used: 0
    }]);
    expect(runtime.desktopPath).toBe("/EXTERNAL/computer/drive0/Users/Guest/Desktop");
    expect(runtime.trashPath).toBe(
      "/EXTERNAL/computer/drive0/Users/Guest/AppData/Roaming/WindowsOS/Windows/RecycleBin"
    );
    const session = new LegacyVolumeSession(new VirtualFileStore(), runtime);
    expect(session.toUri("C:\\Users\\Guest\\Documents\\notes.txt"))
      .toBe(SOURCE_GUEST_PROFILE + "/Documents/notes.txt");
    expect(session.toWindowsPath(SOURCE_GUEST_TRASH)).toBe(
      "C:\\Users\\Guest\\AppData\\Roaming\\WindowsOS\\Windows\\RecycleBin"
    );
    expect(session.pathConfig.drives).toHaveLength(1);
  });

  it("seeds only source-defined folders without deleting or overwriting user files", async () => {
    const fs = new VirtualFileStore();
    await ensureSourceGuestDirectories(fs);
    const sourceFolders = [
      ...SOURCE_SYSTEM_FOLDERS.map(p => SOURCE_SYSTEM_DISK + "/" + p),
      ...SOURCE_GUEST_FOLDERS.map(p => SOURCE_GUEST_PROFILE + "/" + p)
    ];
    for (const path of sourceFolders) {
      expect(await fs.stat(path)).toMatchObject({ type: "directory" });
    }
    await fs.write("preserved", SOURCE_GUEST_PROFILE + "/Documents/work.txt");
    await ensureSourceGuestDirectories(fs);
    expect(await fs.read(SOURCE_GUEST_PROFILE + "/Documents/work.txt")).toBe("preserved");
    expect(await fs.list(SOURCE_COMPUTER_ROOT)).toEqual([
      expect.objectContaining({ name: "drive0", type: "directory" })
    ]);
    expect(await fs.list(SOURCE_GUEST_TRASH)).toEqual([]);
  });

  it("rejects a source folder conflicting with a real file instead of overwriting", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/EXTERNAL");
    await fs.mkdir(SOURCE_COMPUTER_ROOT);
    await fs.write("occupied", SOURCE_SYSTEM_DISK);
    await expect(ensureSourceGuestDirectories(fs)).rejects.toMatchObject({
      code: "ENOTDIR"
    });
    expect(await fs.read(SOURCE_SYSTEM_DISK)).toBe("occupied");
  });
});

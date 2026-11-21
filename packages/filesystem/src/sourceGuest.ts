import {
  FileStoreError, getParentDirectory, normalizeFileUri,
  type VirtualFileStore
} from "./index";
import type { LegacyRuntimeMounts } from "./volumeSession";

/**
 * Source reconstruction from:
 * legacy-win7/src/modules/chunks/
 * shared~plugin-embed~sandbox~system-cache~vue-app~vue-store.js
 *
 * webpack modules 5401, 4cca, 757f, 760d:
 *   EXTERNAL/computer/drive0; System C:; Users/Guest;
 *   system directories; %USERPROFILE% and %APPDATA% special folders.
 *
 * The original Capacitor Filesystem.getUri may return a device-specific URI.
 * This is its canonical virtual EXTERNAL URI; never an actual host disk.
 */
export const SOURCE_COMPUTER_ROOT = "/EXTERNAL/computer";
export const SOURCE_SYSTEM_DISK = SOURCE_COMPUTER_ROOT + "/drive0";
export const SOURCE_GUEST_PROFILE = SOURCE_SYSTEM_DISK + "/Users/Guest";
export const SOURCE_GUEST_APPDATA = SOURCE_GUEST_PROFILE + "/AppData/Roaming";
export const SOURCE_GUEST_TRASH =
  SOURCE_GUEST_APPDATA + "/WindowsOS/Windows/RecycleBin";

export const SOURCE_SYSTEM_FOLDERS: readonly string[] = Object.freeze([
  "Program Files",
  "Program Files/Common Files",
  "ProgramData",
  "Users",
  "Users/Public",
  "Windows",
  "Windows/System32"
]);

export const SOURCE_GUEST_FOLDERS: readonly string[] = Object.freeze([
  "AppData",
  "AppData/Roaming",
  "AppData/Roaming/WindowsOS",
  "AppData/Roaming/WindowsOS/Windows",
  "AppData/Roaming/WindowsOS/Windows/RecycleBin",
  "AppData/Roaming/WindowsOS/Windows/Recent",
  "AppData/Roaming/WindowsOS/Windows/SendTo",
  "AppData/Roaming/WindowsOS/Windows/Start Menu",
  "AppData/Roaming/WindowsOS/Windows/Start Menu/Programs",
  "AppData/Roaming/WindowsOS/Windows/Start Menu/Programs/Accessories",
  "AppData/Roaming/WindowsOS/Windows/Start Menu/Programs/Games",
  "Favorites",
  "Desktop",
  "Downloads",
  "Documents",
  "Music",
  "Pictures",
  "Videos"
]);

/**
 * The source first boot g.init() creates drive0 as System C:, and
 * g.ensureUser(null) creates the Guest profile at Users/Guest.
 *
 * Do not invent C: capacity; original getStats() obtains quota/usage from
 * navigator.storage. An optical Z: drive is a non-writable virtual device and
 * must not be mounted as a regular VFS directory.
 */
export function sourceGuestMounts(): LegacyRuntimeMounts {
  return {
    root: SOURCE_COMPUTER_ROOT,
    disks: [{
      letter: "C",
      path: SOURCE_SYSTEM_DISK,
      label: "System",
      size: 0,
      used: 0
    }],
    desktopPath: SOURCE_GUEST_PROFILE + "/Desktop",
    trashPath: SOURCE_GUEST_TRASH,
    user: { folder: "Guest", name: "Guest" }
  };
}

/** Idempotent directory seeding only. Installed programs and .lnk files
 * require the separate source program manifest/install pathway. */
export async function ensureSourceGuestDirectories(
  filesystem: Pick<VirtualFileStore, "stat" | "mkdir">
): Promise<void> {
  const wanted = [
    SOURCE_SYSTEM_DISK,
    ...SOURCE_SYSTEM_FOLDERS.map(p => SOURCE_SYSTEM_DISK + "/" + p),
    SOURCE_GUEST_PROFILE,
    ...SOURCE_GUEST_FOLDERS.map(p => SOURCE_GUEST_PROFILE + "/" + p)
  ];
  const created = new Set<string>();
  const ensure = async (input: string): Promise<void> => {
    const path = normalizeFileUri(input);
    if (path === "/" || created.has(path)) return;
    await ensure(getParentDirectory(path));
    const existing = await filesystem.stat(path);
    if (existing?.type === "file") {
      throw new FileStoreError("ENOTDIR", "Source guest folder is occupied by a file: " + path);
    }
    if (!existing) await filesystem.mkdir(path);
    created.add(path);
  };
  for (const p of wanted) await ensure(p);
}

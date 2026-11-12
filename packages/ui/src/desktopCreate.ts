import {
  FileStoreError, normalizeFileUri, sourceProgramsById, sourceShortcut,
  type VirtualFileStore
} from "@windows-os/filesystem";

/**
 * Pinned legacy src/modules/system/main.js New submenu:
 * Folder, Shortcut, Rich Text Document, Text Document.
 * The original file-backed desktop uses the session's desktopPath.
 */
export type DesktopNewItem = "folder" | "text" | "richtext";
type DesktopCreationStore = Pick<VirtualFileStore, "list" | "mkdir" | "createFile">;

const definitions: Record<DesktopNewItem, { name: string; ext: string; content: string }> = {
  folder: { name: "New folder", ext: "", content: "" },
  text: { name: "New Text Document", ext: ".txt", content: "" },
  richtext: { name: "New Rich Text Document", ext: ".rtf", content: "{\\rtf1\\ansi\n}\n" }
};

function validDesktopName(name: string): string {
  if (typeof name !== "string") throw new FileStoreError("EINVAL", "Invalid desktop file name");
  const value = name.trim();
  if (!value || value.length > 30 || /[\\/:*?"<>|\0-\x1f]/.test(value)
    || value === "." || value === ".." || value.endsWith(".")
    || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(value)) {
    throw new FileStoreError("EINVAL", "Invalid desktop file name");
  }
  return value;
}

/** Always look at the actual Guest directory; never invent Desktop state. */
export async function createSourceDesktopItem(
  store: DesktopCreationStore, desktopPath: string, kind: DesktopNewItem
): Promise<string> {
  const folder = normalizeFileUri(desktopPath);
  const spec = definitions[kind];
  if (!spec) throw new FileStoreError("EINVAL", "Unknown desktop item type");
  const names = new Set((await store.list(folder)).map(entry => entry.name.toLocaleLowerCase()));
  for (let number = 1; number <= 9999; number++) {
    const suffix = number === 1 ? "" : " (" + number + ")";
    const name = spec.name + suffix + spec.ext;
    if (names.has(name.toLocaleLowerCase())) continue;
    const path = folder === "/" ? "/" + name : folder + "/" + name;
    try {
      if (kind === "folder") await store.mkdir(path);
      else await store.createFile(spec.content, path);
      return path;
    } catch (cause) {
      // Another desktop instance may have just created the same name.
      if (cause instanceof FileStoreError && cause.code === "EEXIST") {
        names.add(name.toLocaleLowerCase());
        continue;
      }
      throw cause;
    }
  }
  throw new FileStoreError("EEXIST", "No available desktop item name");
}

/**
 * The source 757f/760d shortcut format is JSON {exe,icon} in a .lnk file.
 * Only pinned source programs may be chosen; no host commands, executable
 * strings or arbitrary file paths are accepted from the browser wizard.
 */
export async function createSourceDesktopShortcut(
  store: Pick<VirtualFileStore, "list" | "createFile">,
  desktopPath: string, programId: string, displayName: string
): Promise<string> {
  const program = sourceProgramsById.get(programId);
  if (!program?.installPath) {
    throw new FileStoreError("EINVAL", "Not an installed source program");
  }
  const name = validDesktopName(displayName);
  if (/\.lnk$/i.test(name)) {
    throw new FileStoreError("EINVAL", "Enter a shortcut name without the .lnk extension");
  }
  const folder = normalizeFileUri(desktopPath);
  const filename = name + ".lnk";
  const entries = await store.list(folder);
  if (entries.some(entry => entry.name.toLocaleLowerCase() === filename.toLocaleLowerCase())) {
    throw new FileStoreError("EEXIST", "A desktop item with that name already exists");
  }
  const path = folder === "/" ? "/" + filename : folder + "/" + filename;
  await store.createFile(JSON.stringify(sourceShortcut(program)), path);
  return path;
}

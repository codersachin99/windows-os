import { SHELL_DRAG_TYPE } from "@windows-os/filesystem";

/**
 * A native Explorer drag may drop onto a real Guest folder or the built-in
 * Recycle Bin, but never onto a system app shortcut, file icon or an
 * arbitrary DOM-provided path. Only the existing in-process shell token
 * can authorize a Recycle Bin move; host File objects are import-only.
 */
export type NativeDesktopIconDrop =
  | { kind: "folder"; directory: string }
  | { kind: "recycle" };

export function nativeDesktopIconDropTarget(
  item: { id: string; file?: { entry: { type: "file" | "directory"; uri: string } } },
  dataTypes: readonly string[]
): NativeDesktopIconDrop | null {
  const shell = dataTypes.includes(SHELL_DRAG_TYPE);
  const external = dataTypes.includes("Files");
  if (item.id === "bin") return shell ? { kind: "recycle" } : null;
  if (item.file?.entry.type === "directory" && (shell || external)) {
    return { kind: "folder", directory: item.file.entry.uri };
  }
  return null;
}

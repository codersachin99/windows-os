import type { FileEntry } from "@windows-os/filesystem";

/** Pinned legacy-win7 photo.js delegates its directory filter to the 0e9a/de73
 * picture kind. These are the extensions in that original source predicate. */
const SOURCE_PHOTO_EXTENSIONS = new Set([
  "bmp", "gif", "svg", "png", "jpg", "jpeg", "jfif",
  "webp", "ico", "apng"
]);

export function isSourcePhotoFile(name: string): boolean {
  // Source de73 uses suffix matching, even for names like customjpg.
  return [...SOURCE_PHOTO_EXTENSIONS].some(ext=>name.toLowerCase().endsWith(ext));
}
export function sourcePhotoMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "jpg" || ext === "jfif") return "image/jpeg";
  if (ext === "svg") return "image/svg+xml";
  if (ext === "ico") return "image/x-icon";
  if (ext === "apng") return "image/apng";
  return SOURCE_PHOTO_EXTENSIONS.has(ext) ? "image/" + ext : "application/octet-stream";
}
export function sourceWritablePhotoMime(name: string): string | null {
  const mime = sourcePhotoMime(name);
  return ["image/png", "image/jpeg", "image/webp"].includes(mime) ? mime : null;
}
/** Source photo.js#listPhotos includes only pictures in the current directory. */
export function sourcePhotoList(entries: readonly FileEntry[]): FileEntry[] {
  return entries.filter(entry => entry.type === "file" && isSourcePhotoFile(entry.name));
}
/** Source photo.js#navigate wraps at either end of the current folder listing. */
export function sourcePhotoNextPath(
  files: readonly Pick<FileEntry, "uri">[], currentPath: string, delta: -1 | 1
): string | null {
  const at = files.findIndex(file => file.uri === currentPath);
  if (files.length < 2 || at < 0) return null;
  return files[(at + delta + files.length) % files.length].uri;
}
export function sourcePhotoAngle(angle: number, delta: -90 | 90): number {
  return (angle + delta) % 360;
}

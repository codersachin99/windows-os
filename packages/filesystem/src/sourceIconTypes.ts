import type { FileEntry } from "./index";
import { matchesSourceKind } from "./search";
import { sourcePrograms } from "./sourcePrograms";

/**
 * Exact branch precedence of pinned webpack 4cca.getIconType(name,type):
 * directory, 0e9a image, video/audio, wpl, rtf, text, known executable,
 * zip, any extension => file, no extension => folder.
 *
 * Use the already-pinned 0e9a/de73 search-kind predicates instead of
 * duplicating extension lists. Source executable detection delegates to
 * the c170 manifest as original 8c25.getInstalledProgram(name) does.
 * No second URI decode: VFS FileEntry names are already decoded.
 */
export type SourceFileIconKey =
  | "folder" | "photo" | "media" | "wpl" | "richtext"
  | "text" | "executable" | "zip" | "file" | string;
/** Original 0e9a.m matches any final extension ending in lnk. */
export function sourceIsShortcutEntry(entry:Pick<FileEntry,"name"|"type">):boolean{
  return entry.type==="file" && /\.[^.]*lnk$/i.test(entry.name);
}
export function sourceFileIconType(entry: Pick<FileEntry,"name"|"type">):SourceFileIconKey {
  if(entry.type==="directory")return "folder";
  if(matchesSourceKind(entry,"picture"))return "photo";
  if(matchesSourceKind(entry,"music")||matchesSourceKind(entry,"video"))return "media";
  if(matchesSourceKind(entry,"playlist"))return "wpl";
  const dot=entry.name.lastIndexOf(".");
  const ext=dot>=0?entry.name.slice(dot+1).toLowerCase():"";
  if(ext.endsWith("rtf"))return "richtext";
  if(matchesSourceKind(entry,"text"))return "text";
  if(matchesSourceKind(entry,"program")){
    const lower=entry.name.toLowerCase();
    const program=sourcePrograms.find(p=>p.installPath?.split("/").pop()?.toLowerCase()===lower);
    return program?.id??"executable";
  }
  if(ext==="zip")return "zip";
  return ext?"file":"folder";
}

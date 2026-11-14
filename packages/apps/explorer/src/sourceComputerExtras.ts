import { sourceComputerSearchLocation, sourceSizeFromBytes, type FileEntry, type LegacyVolumeSession } from "@windows-os/filesystem";
import { sourceRenameParts } from "@windows-os/ui/rename";
import type { ExplorerViewMode } from "./model";

/** Pinned computer.js at legacy-win7@4e63290, contentItems/getFileType.
 * The original builds date, extension-derived type and size in that order;
 * Tiles and Content conditionally slice the same array, instead of
 * independently guessing Windows file descriptions per view.
 */
type ComputerFile = Pick<FileEntry,"name"|"type"|"mtime"|"size"|"uri">;

export function sourceComputerFileType(entry:Pick<ComputerFile,"name"|"type">):string{
  const ext=entry.type==="directory"?"":sourceRenameParts(entry.name).ext;
  // The original source even labels extensionless regular files this way.
  return ext?ext.toUpperCase()+" File":"File folder";
}

/** Date/type/size selection follows original computer.js contentItems().
 * Byte display is currently the Guest VFS's simple 'B' representation;
 * legacy 4cca.getSizeFrom formatting is a separately tracked parity gap.
 */
export function sourceComputerItemExtras(
  entry:ComputerFile,view:ExplorerViewMode,isSearch=false,volume:LegacyVolumeSession|null=null
):string[]{
  if(view!=="details"&&view!=="tiles"&&view!=="content")return [];
  const date=new Date(entry.mtime).toLocaleString();
  const type=sourceComputerFileType(entry);
  const size=sourceSizeFromBytes(entry.size);
  const directory=entry.type==="directory";
  if(view==="tiles")return directory?[type]:[type,size];
  if(view==="details")return [date,type,directory?"":size];
  if(isSearch){
    // Source Content search replaces ordinary extras with date, location,
    // and (for files only) size; en-US keys date-modified-value/size-value.
    const location=sourceComputerSearchLocation(entry.uri,volume);
    return directory?["Date modified: "+date,location]:
      ["Date modified: "+date,location,"Size: "+size];
  }
  return directory?[date]:[date,type,size];
}

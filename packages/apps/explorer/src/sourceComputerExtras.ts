import { sourceComputerSearchLocation, sourceSizeFromBytes, type FileEntry, type LegacyVolumeSession } from "@windows-os/filesystem";
import { sourceRenameParts } from "@windows-os/ui/rename";
import type { ExplorerViewMode } from "./model";

/** Pinned computer.js at legacy-win7@4e63290, contentItems/getFileType.
 * The original builds date, extension-derived type and size in that order;
 * Tiles and Content conditionally slice the same array, instead of
 * independently guessing Windows file descriptions per view.
 */
type ComputerFile = Pick<FileEntry,"name"|"type"|"mtime"|"size"|"uri">;

/** Pinned computer.js constants se=16, ae=220, ne=ae-se, re=24.
 * Source item labelWidth loses exactly the checkbox width when touch
 * selection exposes item.toggle. Keep source widths in one source adapter.
 */
export const SOURCE_COMPUTER_DETAILS_COLUMN_WIDTH=220;
export const SOURCE_COMPUTER_DETAILS_ICON_WIDTH=16;
export const SOURCE_COMPUTER_DETAILS_CHECKBOX_WIDTH=24;
export function sourceComputerDetailsLabelWidth(showCheckboxes:boolean):number{
  return SOURCE_COMPUTER_DETAILS_COLUMN_WIDTH-SOURCE_COMPUTER_DETAILS_ICON_WIDTH-
    (showCheckboxes?SOURCE_COMPUTER_DETAILS_CHECKBOX_WIDTH:0);
}

export function sourceComputerFileType(entry:Pick<ComputerFile,"name"|"type">):string{
  const ext=entry.type==="directory"?"":sourceRenameParts(entry.name).ext;
  // The original source even labels extensionless regular files this way.
  return ext?ext.toUpperCase()+" File":"File folder";
}

/** Date/type/size selection follows original computer.js contentItems().
 * Size is formatted by the exact reusable 4cca.getSizeFrom helper.
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

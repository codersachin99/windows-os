import {legacySourceCustomIconURL,legacySourceIconArtwork} from "@windows-os/assets";
import {sourceFileIconType,type FileEntry} from "@windows-os/filesystem";

/**
 * Original computer.js.describe -> 4cca.getIconType -> this.icon[type].
 * The source type is always preserved separately from the fallback artwork.
 * Only expose artwork byte-imported from the pinned legacy tree. Missing
 * source image assets must not be replaced with invented fake originals.
 */
export interface SourceComputerIconArtwork {
  sourceType:string;
  src:string;
  exactSourceArtwork:boolean;
}
/** Original 0f35.c resolves either a theme icon ID or a full URL.
 * Restrict data URLs to images, never executable or HTML schemes.
 */
export const sourceShortcutCustomIconURL=legacySourceCustomIconURL;
export function sourceComputerIconArtwork(
  entry:Pick<FileEntry,"name"|"type">,shortcutIcon?:string|null
):SourceComputerIconArtwork{
  const sourceType=sourceFileIconType(entry);
  return {sourceType,...legacySourceIconArtwork(shortcutIcon??sourceType)};
}

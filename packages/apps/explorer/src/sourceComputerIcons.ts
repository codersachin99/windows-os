import {legacySourceCustomIconURL,sourceThemeFileIconArtwork} from "@windows-os/assets";
import type {ThemeId} from "@windows-os/contracts";
import {sourceFileIconType,type FileEntry} from "@windows-os/filesystem";

/**
 * Original computer.js.describe -> 4cca.getIconType -> this.icon[type].
 * Keep the classified original type and JSON .lnk artwork independent.
 * Imported theme folder/file images are original bytes, while unported
 * type-specific variants remain visible as fallbacks rather than fabricated.
 */
export interface SourceComputerIconArtwork {
  sourceType:string;
  src:string;
  exactSourceArtwork:boolean;
}
/** Original 0f35.c resolves either a theme icon ID or a full URL. */
export const sourceShortcutCustomIconURL=legacySourceCustomIconURL;
export function sourceComputerIconArtwork(
  entry:Pick<FileEntry,"name"|"type">,shortcutIcon?:string|null,theme:ThemeId="win7"
):SourceComputerIconArtwork{
  const sourceType=sourceFileIconType(entry);
  return {sourceType,...sourceThemeFileIconArtwork(theme,sourceType,shortcutIcon)};
}

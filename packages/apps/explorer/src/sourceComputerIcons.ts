import {legacyArt} from "@windows-os/assets";
import {sourceFileIconType,type FileEntry} from "@windows-os/filesystem";

/**
 * Original computer.js.describe -> 4cca.getIconType -> this.icon[type].
 * The source type is always preserved separately from the fallback artwork.
 * Only expose artwork byte-imported from the pinned legacy tree. Missing
 * source image assets must not be replaced with invented fake originals.
 */
const importedSourceArt:Readonly<Record<string,string>>={
  folder:legacyArt.folder,
  file:legacyArt.file,
  photo:legacyArt.photo,
  notepad:legacyArt.notepad,
  calc:legacyArt.calculator,
  chrome:legacyArt.chrome,
  ie:legacyArt.ie,
  paint:legacyArt.paint,
  camera:legacyArt.camera,
  player:legacyArt.player,
  recorder:legacyArt.recorder,
  magnifier:legacyArt.magnifier,
  snipping:legacyArt.snipping,
  taskmgr:legacyArt.taskmgr,
  sticky:legacyArt.sticky,
  run:legacyArt.run,
  computer:legacyArt.computer
};

export interface SourceComputerIconArtwork {
  sourceType:string;
  src:string;
  exactSourceArtwork:boolean;
}
/** Original 0f35.c resolves either a theme icon ID or a full URL.
 * Restrict data URLs to images, never executable or HTML schemes.
 */
export function sourceShortcutCustomIconURL(icon:string):string|null{
  if(/^https?:\/\//i.test(icon))return icon;
  if(/^data:image\/(?:png|jpeg|gif|webp|bmp|svg\+xml|avif);base64,[a-z0-9+/]+={0,2}$/i.test(icon))
    return icon;
  return null;
}
export function sourceComputerIconArtwork(
  entry:Pick<FileEntry,"name"|"type">,
  shortcutIcon?:string|null
):SourceComputerIconArtwork{
  const sourceType=sourceFileIconType(entry);
  const custom=shortcutIcon?sourceShortcutCustomIconURL(shortcutIcon):null;
  if(custom)return {sourceType,src:custom,exactSourceArtwork:false};
  const key=shortcutIcon??sourceType;
  const imported=Object.prototype.hasOwnProperty.call(importedSourceArt,key)
    ?importedSourceArt[key]:undefined;
  return {sourceType,src:imported??legacyArt.file,exactSourceArtwork:imported!==undefined};
}

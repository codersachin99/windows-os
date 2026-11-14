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
  taskmgr:legacyArt.taskmgr
};

export interface SourceComputerIconArtwork {
  sourceType:string;
  src:string;
  exactSourceArtwork:boolean;
}
export function sourceComputerIconArtwork(
  entry:Pick<FileEntry,"name"|"type">
):SourceComputerIconArtwork{
  const sourceType=sourceFileIconType(entry);
  const imported=importedSourceArt[sourceType];
  return {
    sourceType,
    src:imported??legacyArt.file,
    exactSourceArtwork:imported!==undefined
  };
}

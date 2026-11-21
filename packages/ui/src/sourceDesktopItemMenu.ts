/**
 * Pinned legacy-win7 src/modules/system/main.js, component M:
 * DesktopItemMenu computed items() and watcher(data).
 *
 * Original order and hide predicates are independent from React DOM,
 * while unavailable actions remain visibly disabled until their source-backed
 * services have been migrated (including Properties).
 */
export type SourceDesktopItemMenuAction =
  "open"|"empty-bin"|"pin"|"extract-here"|"send-desktop"|"send-to"|"download"|
  "cut"|"copy"|"delete"|"rename"|"properties";
export interface SourceDesktopItemMenuInput{
  id:string;
  multiple:boolean;
  isFile:boolean;
  fileName?:string;
  fileType?:"file"|"directory";
  programInstalled?:boolean;
  pinned?:boolean;
  canPin?:boolean;
  canCompressGuest?:boolean;
  /** Path-backed .lnk shortcuts use the archive target name, not .lnk. */
  archiveName?:string;
  canExtractGuestZip?:boolean;
  /** Number of eligible selected path-backed files, not just the clicked icon. */
  downloadableCount?:number;
  /** Original DesktopItemMenu hides Cut/Copy without any selected shortcut.path. */
  hasClipboardSourcePaths?:boolean;
  trashCount?:number;
}
export interface SourceDesktopItemMenuEntry{
  id:SourceDesktopItemMenuAction;
  label:string;
  disabled:boolean;
}
export function sourceDesktopItemMenu(
  input:SourceDesktopItemMenuInput
):SourceDesktopItemMenuEntry[]{
  const sourceIsSystem=input.id==="computer"||input.id==="bin";
  const archiveName=input.archiveName??input.fileName??"";
  const isArchiveFile=input.isFile&&input.fileType==="file"&&
    /\.(zip|rar|7z|tar|gz)$/i.test(archiveName);
  const clickedFileDownloadable=input.isFile&&input.fileType==="file"&&
    Boolean(input.fileName&&/\.[^.]+$/.test(input.fileName))&&
    !/\.lnk$/i.test(input.fileName??"");
  const canDownload=input.downloadableCount===undefined
    ?clickedFileDownloadable:input.downloadableCount>0;
  const result:SourceDesktopItemMenuEntry[]=[];
  const add=(id:SourceDesktopItemMenuAction,label:string,disabled=false)=>{
    result.push({id,label,disabled});
  };
  if(!input.multiple)add("open","Open");
  if(input.id==="bin"&&!input.multiple)
    add("empty-bin","Empty Recycle Bin",!input.trashCount);
  if(!input.multiple&&!input.isFile)
    add("pin",input.pinned?"Unpin from taskbar":"Pin to taskbar",!input.canPin);
  if(!input.multiple&&!input.isFile&&!sourceIsSystem&&input.programInstalled)
    add("send-desktop","Send to Desktop");
  if(input.isFile){
    // Source main.js DesktopItemMenu: after Pin, before Send to Desktop.
    // Only supported ZIP has actual Guest extraction behind its action.
    if(!input.multiple&&isArchiveFile)
      add("extract-here","Extract here",
        !(input.canExtractGuestZip&&/\.zip$/i.test(archiveName)));
    add("send-to","Send to ▸",!input.canCompressGuest); // original has compressed ZIP child
    if(canDownload)add("download","Download");
    if(input.hasClipboardSourcePaths!==false){
      add("cut","Cut");
      add("copy","Copy");
    }
    add("delete","Delete");
    if(!input.multiple)add("rename","Rename");
  }
  if(!input.multiple)add("properties","Properties",true);
  return result;
}

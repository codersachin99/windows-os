/**
 * Pinned legacy-win7 src/modules/system/main.js, component M:
 * DesktopItemMenu computed items() and watcher(data).
 *
 * Original order and hide predicates are independent from React DOM,
 * while safety-disabled actions remain visible until the corresponding
 * source engine (pinning, archives and Properties) has been migrated.
 */
export type SourceDesktopItemMenuAction =
  "open"|"empty-bin"|"pin"|"send-desktop"|"send-to"|"download"|
  "cut"|"copy"|"delete"|"rename"|"properties";
export interface SourceDesktopItemMenuInput{
  id:string;
  multiple:boolean;
  isFile:boolean;
  fileName?:string;
  fileType?:"file"|"directory";
  programInstalled?:boolean;
  pinned?:boolean;
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
  const canDownload=input.isFile&&input.fileType==="file"&&
    Boolean(input.fileName&&/\.[^.]+$/.test(input.fileName))&&
    !/\.lnk$/i.test(input.fileName??"");
  const result:SourceDesktopItemMenuEntry[]=[];
  const add=(id:SourceDesktopItemMenuAction,label:string,disabled=false)=>{
    result.push({id,label,disabled});
  };
  if(!input.multiple)add("open","Open");
  if(input.id==="bin"&&!input.multiple)
    add("empty-bin","Empty Recycle Bin",!input.trashCount);
  if(!input.multiple&&!input.isFile)
    add("pin",input.pinned?"Unpin from taskbar":"Pin to taskbar",true);
  if(!input.multiple&&!input.isFile&&!sourceIsSystem&&input.programInstalled)
    add("send-desktop","Send to Desktop");
  if(input.isFile){
    add("send-to","Send to ▸",true); // source Compressed Folder requires archive engine
    if(canDownload)add("download","Download");
    add("cut","Cut");
    add("copy","Copy");
    add("delete","Delete");
    if(!input.multiple)add("rename","Rename");
  }
  if(!input.multiple)add("properties","Properties",true);
  return result;
}

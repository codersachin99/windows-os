import type {FileEntry} from "@windows-os/filesystem";

/**
 * Source: pinned legacy-win7/src/modules/system/main.js ExplorerItemMenu
 * component G.items(). File/folder menu is not the Bin item menu: Bin
 * remains Restore / Delete / Properties, handled by sourceBinItemMenu.
 *
 * Keep source ordering and hidden predicates without tying them to React.
 * Original archive extraction, compression and desktop-path shortcuts need
 * independent backing services. Until then, show their source menu
 * affordances only as disabled actions, never as dummy operations.
 */
export type SourceExplorerItemAction=
  "open"|"extract-here"|"send-to"|"download"|
  "cut"|"copy"|"delete"|"rename"|"properties";
export type SourceExplorerSendToAction="compress"|"desktop";
export interface SourceExplorerItemMenuEntry{
  id:SourceExplorerItemAction;
  label:string;
  disabled:boolean;
}
export interface SourceExplorerSendToEntry{
  id:SourceExplorerSendToAction;
  label:string;
  disabled:boolean;
}
export interface SourceExplorerItemMenuInput{
  selected:readonly FileEntry[];
  canRecycle:boolean;
  inArchive?:boolean;
  isAndroidFile?:boolean;
}
/** Original 0e9a item download predicate requires an extension and refuses
 * special shortcut entries. Never attempt to download a folder as a byte file.
 * The archive and Android predicates are passed from source path adapters.
 */
export function sourceExplorerDownloadableItems(
  selected:readonly FileEntry[],isAndroidFile=false
):FileEntry[]{
  if(isAndroidFile)return [];
  return selected.filter(entry=>
    entry.type==="file"&&/\.[^.]+$/.test(entry.name)&&
    !/\.lnk$/i.test(entry.name)
  );
}
export const SOURCE_EXPLORER_SEND_TO:readonly SourceExplorerSendToEntry[]=[
  {id:"compress",label:"Compressed (zipped) folder",disabled:true},
  {id:"desktop",label:"Desktop (create shortcut)",disabled:true}
];
export function sourceExplorerItemMenu(
  input:SourceExplorerItemMenuInput
):SourceExplorerItemMenuEntry[]{
  const count=input.selected.length;
  if(!count)return [];
  const multiple=count>1;
  const inArchive=Boolean(input.inArchive);
  const first=input.selected[0];
  const isArchiveFile=Boolean(first&&first.type==="file"&&
    /\.(zip|rar|7z|tar|gz)$/i.test(first.name));
  const downloadable=sourceExplorerDownloadableItems(
    input.selected,input.isAndroidFile
  ).length>0;
  const options:SourceExplorerItemMenuEntry[]=[];
  const add=(id:SourceExplorerItemAction,label:string,disabled=false)=>{
    options.push({id,label,disabled});
  };
  if(!multiple)add("open","Open");
  if(!multiple&&!inArchive&&isArchiveFile)
    add("extract-here","Extract here",true);
  if(!inArchive)add("send-to","Send to ▸");
  if(downloadable)add("download","Download");
  add("cut","Cut",inArchive);
  add("copy","Copy",inArchive);
  add("delete","Delete",inArchive||!input.canRecycle);
  if(!multiple&&!inArchive)add("rename","Rename");
  add("properties","Properties",true);
  return options;
}

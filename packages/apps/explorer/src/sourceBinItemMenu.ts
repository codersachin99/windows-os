/**
 * Pinned legacy-win7 src/modules/system/main.js ExplorerItemMenu
 * component C items(), host===bin:
 *
 * Restore -> Delete -> Properties (disabled).
 *
 * Bin must NEVER show normal Explorer "Open", "Send to", Cut,
 * Copy or Rename for a deleted item. The VFS requires originalPath
 * metadata to restore, so a malformed legacy entry safely disables
 * Restore without turning it into an unrelated Open action.
 */
export const SOURCE_BIN_ITEM_ACTIONS=[
  {id:"restore",label:"Restore"},
  {id:"delete",label:"Delete"},
  {id:"properties",label:"Properties"}
] as const;
export type SourceBinItemAction=typeof SOURCE_BIN_ITEM_ACTIONS[number]["id"];
export interface SourceBinItemMenuEntry{
  id:SourceBinItemAction;
  label:string;
  disabled:boolean;
}
export function sourceBinItemMenu(hasOriginalPath:boolean):SourceBinItemMenuEntry[]{
  return SOURCE_BIN_ITEM_ACTIONS.map(item=>({
    ...item,
    disabled:item.id==="properties"||
      (item.id==="restore"&&!hasOriginalPath)
  }));
}

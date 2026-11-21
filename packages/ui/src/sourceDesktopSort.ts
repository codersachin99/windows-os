/**
 * Pinned legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * src/modules/system/main.js DesktopMenu B, sortDesktop/applyDesktopSort.
 * Stable comparison of source name/size/type/date columns; display
 * positions are committed separately by DesktopPositionStore.
 */
export type SourceDesktopSortKey="name"|"size"|"type"|"date";
export interface SourceDesktopSortable{
  id:string;
  label:string;
  size?:number;
  type?:string;
  mtime?:number;
}
export interface SourceDesktopSortChoice{
  key:SourceDesktopSortKey;
  asc:boolean;
}
export const SOURCE_DESKTOP_DEFAULT_SORT:SourceDesktopSortChoice=
  Object.freeze({key:"name",asc:true});
export function sourceNextDesktopSort(
  current:SourceDesktopSortChoice,key:SourceDesktopSortKey
):SourceDesktopSortChoice{
  return {key,asc:current.key===key?!current.asc:true};
}
export function sourceSortDesktopItems<T extends SourceDesktopSortable>(
  entries:readonly T[],sort:SourceDesktopSortChoice
):T[]{
  const value=(item:T):string|number=>{
    switch(sort.key){
      case "name":return item.label.toLowerCase();
      case "size":return item.size??0;
      case "type":return (item.type??"").toLowerCase();
      case "date":return item.mtime??0;
    }
  };
  return entries.map((item,index)=>({item,index})).sort((a,b)=>{
    const left=value(a.item),right=value(b.item);
    const comparison=typeof left==="number"&&typeof right==="number"
      ?Math.sign(left-right):String(left)<String(right)?-1:String(left)>String(right)?1:0;
    return comparison?(sort.asc?comparison:-comparison):a.index-b.index;
  }).map(x=>x.item);
}

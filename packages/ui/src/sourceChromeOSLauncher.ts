import type {SourceWin11AllApp} from "./sourceWin11AllApps";
/** Source f5a6 explicitly adds the three system entries, then sorts. */
export function sourceChromeOSLauncherItems(items:readonly SourceWin11AllApp[],core:readonly SourceWin11AllApp[]):SourceWin11AllApp[]{
  const byId=new Map(items.map(item=>[item.id,item]));
  for(const item of core)byId.set(item.id,item);
  return [...byId.values()].sort((a,b)=>a.label.localeCompare(b.label));
}
export function sourceChromeOSRecentItems(items:readonly SourceWin11AllApp[],ids:readonly string[]){
  return [...new Set(ids)].flatMap(id=>items.filter(item=>item.id===id&&item.available)).slice(0,5);
}

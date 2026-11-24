import {sourceParseSearch,sourceScoreSearch,SOURCE_SEARCH_WEIGHT} from "@windows-os/engine";
import type {SourceWin11AllApp} from "./sourceWin11AllApps";
export function sourceUbuntuProgramMatches(items:readonly SourceWin11AllApp[],text:string){
  const query=sourceParseSearch(text);
  return items.filter(item=>item.available).map(item=>({item,score:sourceScoreSearch([{text:item.label,weight:SOURCE_SEARCH_WEIGHT.Name}],query)}))
    .filter(result=>result.score>0).sort((a,b)=>b.score-a.score).map(result=>result.item);
}
export function sourceUbuntuPageSize(compact:boolean){return compact?9:21;}

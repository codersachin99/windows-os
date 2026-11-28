import {matchesSourceKind,type FileEntry} from "@windows-os/filesystem";
export type SourceModernFileGroup="documents"|"folders"|"photos"|"music"|"videos";
export type SourceModernGroupKey="best"|"apps"|"settings"|SourceModernFileGroup;
export interface SourceModernEntry{key:string;label:string;icon:string;kind:"app"|"setting"|"file";detail:string;open:()=>void;disabled?:boolean}
export function sourceModernFileGroup(file:FileEntry):SourceModernFileGroup{
  if(file.type==="directory")return "folders";
  if(matchesSourceKind(file,"picture"))return "photos";
  if(matchesSourceKind(file,"music"))return "music";
  if(matchesSourceKind(file,"video"))return "videos";
  return "documents";
}
/** Frozen 8f99.p modern: promote the first app, setting or ranked file; no duplication. */
export function sourceModernGroups(apps:readonly SourceModernEntry[],settings:readonly SourceModernEntry[],files:readonly {file:FileEntry;entry:SourceModernEntry}[],home:string){
  const libraries=new Set(["Documents","Music","Pictures","Videos"].map(name=>home+"/"+name));
  const eligible=files.filter(({file})=>!libraries.has(file.uri));
  const groups:Record<SourceModernGroupKey,SourceModernEntry[]>={best:[],apps:[...apps],settings:[...settings],documents:[],folders:[],photos:[],music:[],videos:[]};
  for(const {file,entry} of eligible)groups[sourceModernFileGroup(file)].push(entry);
  const best=groups.apps.shift()??groups.settings.shift()??(eligible[0]?groups[sourceModernFileGroup(eligible[0].file)].shift():undefined);
  if(best)groups.best.push(best);
  return (Object.keys(groups) as SourceModernGroupKey[]).filter(key=>groups[key].length).map(key=>({key,entries:groups[key]}));
}

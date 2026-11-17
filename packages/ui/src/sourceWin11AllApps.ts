import type {AppDefinition} from "@windows-os/contracts";
import type {SourceProgram} from "@windows-os/filesystem";

/**
 * Original pinned Win11 18ee f0aa/698d:
 * allProgramItems = [...programItems,...appItems]
 *   .sort((a,b)=>a.lbl.localeCompare(b.lbl)).
 *
 * Program entries are from c170's installed program manifest. Web/device
 * app entries are registered separately. Hidden c170 system helpers are
 * not inserted into the ordinary user program list.
 * A source program without a migrated AppDefinition remains visible but
 * disabled: its presence does not imply it has been implemented.
 */
export interface SourceWin11AllApp{
  id:string;
  label:string;
  available:boolean;
}
export function sourceWin11AllAppItems(
  originalPrograms:readonly Pick<SourceProgram,"id"|"name"|"hidden">[],
  registered:readonly AppDefinition[]
):SourceWin11AllApp[]{
  const byId=new Map(registered.map(app=>[app.id,app] as const));
  const seen=new Set<string>();
  const result:SourceWin11AllApp[]=[];
  for(const p of originalPrograms){
    if(p.hidden||seen.has(p.id))continue;
    seen.add(p.id);
    result.push({id:p.id,label:byId.get(p.id)?.label??p.name,
      available:byId.has(p.id)});
  }
  for(const app of registered){
    if(!app.showInStart||seen.has(app.id))continue;
    seen.add(app.id);
    result.push({id:app.id,label:app.label,available:true});
  }
  return result.sort((a,b)=>a.label.localeCompare(b.label));
}

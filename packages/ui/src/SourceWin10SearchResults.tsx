import {useEffect,useLayoutEffect,useMemo,useRef,useState,type Dispatch} from "react";
import type {DesktopAction} from "@windows-os/contracts";
import {sourceParseSearch,sourceScoreSearch,SOURCE_SEARCH_WEIGHT,sourceCreateDelayedSearch} from "@windows-os/engine";
import {getParentDirectory,searchFiles,sourcePrograms,type FileEntry} from "@windows-os/filesystem";
import {appRegistry,fileStore,sourceFilesystemRuntime} from "@windows-os/sdk";
import {legacyArt,sourceThemeProgramArt,legacySourceIconArtwork} from "@windows-os/assets";
import {sourceCpanelSearchRegistry,sourceCpanelIsSupported,sourceCpanelIsMigratedProgram,sourceCpanelCanOpenTask,sourceCpanelProgramTaskView} from "@windows-os/apps/cpanel";
import {openGuestSearchFile} from "./sourceGuestSearchOpen";
import {sourceSearchFileArtwork} from "./sourceSearchFileArtwork";
import {sourceModernGroups,type SourceModernEntry} from "./sourceModernSearchGroups";
import {sourceWin11AllAppItems} from "./sourceWin11AllApps";

const labels={best:"Best match",apps:"Apps",settings:"Settings",documents:"Documents",folders:"Folders",photos:"Photos",music:"Music",videos:"Videos"};
export function SourceWin10SearchResults({query,dispatch}:{query:string;dispatch:Dispatch<DesktopAction>}){
  const desktop=sourceFilesystemRuntime.snapshot()?.desktopPath;
  const userPath=desktop?getParentDirectory(desktop):"";
  const [results,setResults]=useState<{query:string;files:{file:FileEntry;artwork:Awaited<ReturnType<typeof sourceSearchFileArtwork>>}[]}>({query:"",files:[]});
  const [revision,setRevision]=useState(0);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [selection,setSelection]=useState<{query:string;index:number}>({query:"",index:0});
  const pane=useRef<HTMLDivElement>(null);
  const [publishedQuery,setPublishedQuery]=useState("");
  const delayed=useMemo(()=>sourceCreateDelayedSearch(setPublishedQuery),[]);
  useLayoutEffect(()=>{delayed.type(query);return()=>delayed.cancel();},[query,delayed]);
  useEffect(()=>fileStore.subscribe(()=>setRevision(value=>value+1)),[]);
  useEffect(()=>{
    setError("");
    const query=publishedQuery;
    if(!userPath||!sourceParseSearch(query).terms.length){setBusy(false);setResults({query,files:[]});return;}
    const controller=new AbortController();
    setBusy(true);
    void searchFiles(fileStore,{scope:userPath,text:query,subfolders:true,skipPaths:[userPath+"/AppData"],maxResults:500},{signal:controller.signal})
        .then(async found=>{
          if(controller.signal.aborted)return;
          const files=await Promise.all(found.files.filter(file=>!file.originalPath).map(async file=>({
            file,artwork:await sourceSearchFileArtwork(fileStore,"win10",file)
          })));
          if(!controller.signal.aborted){setResults({query,files});setBusy(false);}
        })
        .catch(cause=>{if(!controller.signal.aborted){setResults({query,files:[]});setBusy(false);setError(String(cause));}});
    return()=>controller.abort();
  },[publishedQuery,userPath,revision]);
  const launch=(id:string,path?:string)=>{
    const app=appRegistry.get(id);
    if(!app){setError("The original application has not been migrated yet.");return;}
    dispatch({type:"OPEN_APP",app,...(path?{file:{path}}:{})});dispatch({type:"CLOSE_START"});
  };
  const icon=(id:string)=>sourceThemeProgramArt("win10",id)??legacySourceIconArtwork(id).src;
  // Frozen f0aa.searchablePrograms starts from allProgramItems, not the
  // pinned/recent Start list. Keep unmigrated source apps visible, disabled.
  const apps:SourceModernEntry[]=sourceWin11AllAppItems(sourcePrograms,appRegistry.list()).map(app=>({
    key:app.id,label:app.label,
    icon:sourceThemeProgramArt("win10",app.id)??appRegistry.get(app.id)?.icon??icon(app.id),
    kind:"app",detail:"App",disabled:!app.available,open:()=>launch(app.id)
  }));
  for(const [id,label] of [["computer","Computer"],["cpanel","Control Panel"]]){
    if(!apps.some(entry=>entry.key===id)){
      apps.push({key:id,label,icon:icon(id),kind:"app",detail:"App",
        disabled:!appRegistry.get(id),open:()=>launch(id)});
    }
  }
  if(userPath)for(const [name,iconKey] of [["Documents","folder-docs"],["Pictures","folder-pics"],["Music","folder-music"],["Videos","folder-videos"]]){
    const key=name.toLowerCase();
    if(!apps.some(entry=>entry.key===key))
      apps.push({key,label:name,icon:sourceThemeProgramArt("win10",iconKey)??legacyArt.folder,kind:"app",detail:"App",open:()=>launch("computer",userPath+"/"+name)});
  }
  const buildGroups=(text:string)=>{
  const parsed=sourceParseSearch(text);
  const ranked=apps.map(entry=>({entry,score:sourceScoreSearch([{text:entry.label,weight:SOURCE_SEARCH_WEIGHT.Name},{text:entry.key,weight:SOURCE_SEARCH_WEIGHT.Keyword}],parsed)}))
    .filter(hit=>hit.score).sort((a,b)=>b.score-a.score).map(hit=>hit.entry);
  const settings:SourceModernEntry[]=sourceCpanelSearchRegistry(text).flatMap(({item,tasks})=>[
    {key:"setting:"+item.id,label:item.label,icon:icon(item.iconKey),kind:"setting" as const,detail:"Control Panel",disabled:!sourceCpanelIsSupported(item.id)&&!sourceCpanelIsMigratedProgram(item.id),open:()=>sourceCpanelIsSupported(item.id)?launch("cpanel",item.id):launch(item.id)},
    ...tasks.map(task=>({key:"task:"+item.id+":"+task.label,label:task.label,icon:icon(item.iconKey),kind:"setting" as const,detail:"Control Panel",disabled:!sourceCpanelCanOpenTask(task),open:()=>sourceCpanelIsSupported(task.id)?launch("cpanel",task.id):launch(task.id,sourceCpanelProgramTaskView(task)==="background"?"background":undefined)}))
  ]);
  const files=(results.query===text?results.files:[]).map(({file,artwork})=>({file,entry:{key:file.uri,label:file.name,icon:artwork.src,kind:"file" as const,detail:file.type==="directory"?"Folder":"File",open:()=>{void openGuestSearchFile(dispatch,file).then(failure=>{if(failure)setError(failure);else dispatch({type:"CLOSE_START"});});}}}));
  return sourceModernGroups(ranked,settings,files,userPath);
  };
  const groups=buildGroups(publishedQuery);
  const entries=groups.flatMap(group=>group.entries);
  const selected=selection.query===publishedQuery&&selection.index<entries.length?selection.index:0;
  const pending=query!==publishedQuery||busy||(Boolean(userPath)&&sourceParseSearch(publishedQuery).terms.length>0&&results.query!==publishedQuery);
  useLayoutEffect(()=>{
    const handle=(event:KeyboardEvent)=>{
      if(!(event.target instanceof Element)||!event.target.closest("[data-test-taskbar-search-input]"))return;
      if(event.key==="ArrowDown"||event.key==="ArrowUp"){
        event.preventDefault();
        if(!entries.length)return;
        const index=(selected+(event.key==="ArrowDown"?1:-1)+entries.length)%entries.length;
        setSelection({query:publishedQuery,index});pane.current?.querySelectorAll("[data-test-start-result]")[index]?.scrollIntoView({block:"nearest"});
      }else if(event.key==="Enter"){
        event.preventDefault();
        // Frozen f0aa.handleSearchKey flushes 1902.now() before opening
        // the new query\u2019s default; never launch an older visible selection.
        const changed=delayed.now(query);
        const entry=changed?buildGroups(query).flatMap(group=>group.entries)[0]:entries[selected];
        if(entry&&!entry.disabled)entry.open();
      }
    };
    document.addEventListener("keydown",handle);return()=>document.removeEventListener("keydown",handle);
  });
  let index=0;
  return <div ref={pane} className="source-win10-search-panel" data-test-start-results="" data-search-state={pending?"pending":"ready"}>
    <div className="source-win10-search-results">{groups.map(group=><section key={group.key}>
      <h3 data-test-start-group={group.key}>{labels[group.key]}</h3>
      <div>{group.entries.map(entry=>{
        const current=index++;
        return <button key={entry.key} type="button" data-test-start-result={current}
          data-test-search-kind={entry.kind} data-test-program={entry.kind==="app"?entry.key:undefined}
          data-test-search-key={entry.key} className={current===selected?"is-selected":""}
          aria-current={current===selected?true:undefined} disabled={entry.disabled}
          title={entry.disabled?"Original destination not yet migrated":undefined}
          onMouseEnter={()=>setSelection({query:publishedQuery,index:current})} onClick={entry.open}>
          <img src={entry.icon} alt="" width={group.key==="best"?32:24} height={group.key==="best"?32:24}/>
          <span>{entry.label}{group.key==="best"&&<small>{entry.detail}</small>}</span>
        </button>;
      })}</div>
    </section>)}
    {!groups.length&&!pending&&<p>No items match your search.</p>}
    {pending&&<p role="status">Searching…</p>}
    {error&&<p role="alert">{error}</p>}</div>
  </div>;
}

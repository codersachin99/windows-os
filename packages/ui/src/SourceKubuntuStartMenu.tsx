import {useEffect,useRef,useState,type MouseEvent as ReactMouseEvent,type RefObject,type Dispatch} from "react";
import type {DesktopAction} from "@windows-os/contracts";
import {appRegistry,fileStore,sourceFilesystemRuntime} from "@windows-os/sdk";
import {searchFiles,sourceMountedSearchRoots,type FileEntry} from "@windows-os/filesystem";
import {legacyArt,legacySourceIconArtwork,sourceThemeLogonArtwork,sourceThemeProgramArt,sourceShellAsset} from "@windows-os/assets";
import {sourceCpanelSearchRegistry,sourceCpanelIsSupported} from "@windows-os/apps/cpanel";
import type {SourceWin11AllApp} from "./sourceWin11AllApps";
import {sourceUbuntuProgramMatches} from "./sourceUbuntuLaunchpad";
import "./sourceKubuntuStartMenu.css";

interface Props{
  theme?:"kubuntu"|"oxygen";
  rootRef:RefObject<HTMLElement|null>;items:readonly SourceWin11AllApp[];recentIds:readonly string[];
  dispatch:Dispatch<DesktopAction>;onLaunch(id:string):void;
  onOpenFile(file:FileEntry):Promise<string|null>;
  onContext(event:ReactMouseEvent<HTMLButtonElement>,id:string):void;
}
/** Frozen startmenu-kubuntu.js 8753 / shared f0aa, bfe9.
 * Oxygen's source theme explicitly styles this same launcher. */
export function SourceKubuntuStartMenu({theme="kubuntu",rootRef,items,recentIds,dispatch,onLaunch,onOpenFile,onContext}:Props){
  const [query,setQuery]=useState("");
  const [found,setFound]=useState<{text:string;files:FileEntry[]}>({text:"",files:[]});
  const [revision,setRevision]=useState(0);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [selected,setSelected]=useState(0);
  const search=useRef<HTMLInputElement>(null);
  const results=useRef<HTMLDivElement>(null);
  const text=query.trim();
  const all=[...items].sort((a,b)=>a.label.localeCompare(b.label));
  const recent=[...new Set(recentIds)].flatMap(id=>all.filter(item=>item.id===id&&item.available));
  const apps=text?sourceUbuntuProgramMatches(all,text):[];
  const settings=text?sourceCpanelSearchRegistry(text).filter(result=>sourceCpanelIsSupported(result.item.id)):[];
  const files=found.text===text?found.files:[];
  const count=apps.length+settings.length+files.length;
  const active=Math.min(selected,Math.max(0,count-1));
  useEffect(()=>{
    if(!navigator.maxTouchPoints&&!window.matchMedia("(pointer:coarse)").matches)search.current?.focus({preventScroll:true});
    return fileStore.subscribe(()=>setRevision(value=>value+1));
  },[]);
  useEffect(()=>{
    if(!text){setFound({text:"",files:[]});setBusy(false);return;}
    const volume=sourceFilesystemRuntime.snapshot(),roots=sourceMountedSearchRoots(volume);
    if(!roots.length){setFound({text,files:[]});setBusy(false);return;}
    const controller=new AbortController();
    setBusy(true);
    const timer=window.setTimeout(()=>{
      void searchFiles(fileStore,{scope:roots[0]!,rootScopes:roots,text,subfolders:true,maxResults:40,
        skipPaths:volume?.trashPath?[volume.trashPath]:[]},{signal:controller.signal})
        .then(result=>{if(!controller.signal.aborted){setFound({text,files:result.files.filter(file=>!file.originalPath)});setBusy(false);}})
        .catch(cause=>{if(!controller.signal.aborted){setBusy(false);setError(cause instanceof Error?cause.message:"Guest search failed.");}});
    },120);
    return()=>{window.clearTimeout(timer);controller.abort();};
  },[text,revision]);
  const icon=(id:string)=>sourceThemeProgramArt(theme,id)??appRegistry.get(id)?.icon??legacySourceIconArtwork(id).src;
  const openSetting=(id:string)=>{const app=appRegistry.get("cpanel");if(app)dispatch({type:"OPEN_APP",app,file:{path:id}});};
  const openFile=async(file:FileEntry)=>{const failure=await onOpenFile(file);if(failure)setError(failure);};
  const openResult=(i:number)=>{
    if(apps[i])onLaunch(apps[i]!.id);
    else if(settings[i-apps.length])openSetting(settings[i-apps.length]!.item.id);
    else if(files[i-apps.length-settings.length])void openFile(files[i-apps.length-settings.length]!);
  };
  const tile=(item:SourceWin11AllApp,isRecent=false)=><button type="button" key={item.id}
    data-test-program={isRecent?undefined:item.id} data-test-recent-program={isRecent?item.id:undefined}
    disabled={!item.available} title={item.available?item.label:item.label+" — migration pending"}
    onClick={()=>onLaunch(item.id)} onContextMenu={event=>onContext(event,item.id)}>
    <img src={icon(item.id)} width={isRecent?48:32} height={isRecent?48:32} alt=""/><span>{item.label}</span>
  </button>;
  const result=(index:number,label:string,src:string,detail?:string,program?:string)=><button type="button" key={index}
    data-test-start-result={index} data-test-program={program} className={active===index?"is-selected":""}
    onMouseEnter={()=>setSelected(index)} onClick={()=>openResult(index)}
    onContextMenu={program?event=>onContext(event,program):undefined}>
    <img src={src} width={32} height={32} alt=""/><span>{label}{detail&&<small>{detail}</small>}</span>
  </button>;
  return <nav ref={rootRef} id="start-menu" className="source-kubuntu-start"
    data-test-start-menu="" data-test-kubuntu-start={theme==="kubuntu"?"":undefined} data-test-oxygen-start={theme==="oxygen"?"":undefined} data-source-start-theme={theme} aria-label="Start menu">
    <header>
      <button type="button" aria-label="Guest account" onClick={()=>openSetting("accounts")}>
        <img src={sourceThemeLogonArtwork[theme].guest} width={32} height={32} alt=""/><span>Guest</span>
      </button>
      <input ref={search} type="search" aria-label="Search programs and files" placeholder="Search programs"
        data-test-start-search="" data-test-start-menu-search="" value={query}
        onChange={event=>{setQuery(event.target.value);setSelected(0);setError("");}}
        onKeyDown={event=>{
          if(!count)return;
          if(event.key==="Enter"){event.preventDefault();openResult(active);}
          else if(event.key==="ArrowDown"||event.key==="ArrowUp"){
            event.preventDefault();const next=(active+(event.key==="ArrowDown"?1:-1)+count)%count;
            setSelected(next);results.current?.querySelector('[data-test-start-result="'+next+'"]')?.scrollIntoView({block:"nearest"});
          }
        }}/>
    </header>
    <div className="source-kubuntu-start-body">
      <section className="source-kubuntu-program-list" aria-label="All applications" data-test-start-menu-all="" hidden={Boolean(text)}>
        {all.map(item=>tile(item))}
      </section>
      <section className="source-kubuntu-recent-grid" aria-label="Recent applications" data-test-start-menu-recent="" hidden={Boolean(text)}>
        {recent.map(item=>tile(item,true))}
      </section>
      {text&&<div ref={results} className="source-kubuntu-results" data-test-start-results="">
        {apps.length>0&&<section data-test-start-group="apps"><h3>Applications</h3>{apps.map((item,i)=>result(i,item.label,icon(item.id),undefined,item.id))}</section>}
        {settings.length>0&&<section data-test-start-group="settings"><h3>System Settings</h3>{settings.map((item,i)=>result(apps.length+i,item.item.label,icon("cpanel")))}</section>}
        {files.length>0&&<section data-test-start-group="files"><h3>Files</h3>{files.map((file,i)=>result(apps.length+settings.length+i,file.name,sourceShellAsset(theme,file.type==="directory"?"folder":"file")??legacyArt.file,file.uri))}</section>}
        {busy&&<p role="status">Searching…</p>}{!busy&&!count&&!error&&<p>No items match your search.</p>}{error&&<p role="alert">{error}</p>}
      </div>}
    </div>
    <footer>
      <button type="button" onClick={()=>onLaunch("computer")}><span aria-hidden="true">▤</span>Documents</button>
      <button type="button" data-test-startmenu-link="games" onClick={()=>onLaunch("games")}><span aria-hidden="true">♧</span>Games</button>
      <button type="button" onClick={()=>onLaunch("cpanel")}><span aria-hidden="true">⚙</span>Settings</button>
      <button type="button" onClick={()=>dispatch({type:"RESTART"})}><span aria-hidden="true">↻</span>Restart</button>
      <button type="button" onClick={()=>dispatch({type:"SHUTDOWN"})}><span aria-hidden="true">⏻</span>Shutdown</button>
      <button type="button" aria-label="Log off" title="Log off" onClick={()=>dispatch({type:"LOG_OFF"})}><span aria-hidden="true">⇥</span></button>
    </footer>
  </nav>;
}

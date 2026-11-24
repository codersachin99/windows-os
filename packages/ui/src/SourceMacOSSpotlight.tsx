import {useEffect,useRef,useState,type Dispatch} from "react";
import type {DesktopAction,AppDefinition} from "@windows-os/contracts";
import {appRegistry,fileStore,sourceFilesystemRuntime} from "@windows-os/sdk";
import {searchFiles,sourceMountedSearchRoots,type FileEntry} from "@windows-os/filesystem";
import {legacyArt,sourceThemeProgramArt} from "@windows-os/assets";
import {openGuestSearchFile} from "./sourceGuestSearchOpen";

type Hit={kind:"app";app:AppDefinition}|{kind:"file";file:FileEntry};
function SearchIcon({size=18}:{size?:number}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>
  </svg>;
}

/** Source taskbar-macos.js Spotlight adapter. Real mounted Guest roots only,
 * bounded asynchronous search, shared result launching and no host access. */
export function SourceMacOSSpotlight({dispatch}:{dispatch:Dispatch<DesktopAction>}){
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState("");
  const [result,setResult]=useState<{text:string;files:FileEntry[]}>({text:"",files:[]});
  const [revision,setRevision]=useState(0);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [selected,setSelected]=useState(0);
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const input=useRef<HTMLInputElement>(null);
  const pane=useRef<HTMLDivElement>(null);
  const text=query.trim();
  const apps=text?appRegistry.startMenu().filter(app=>app.label.toLowerCase().includes(text.toLowerCase())):[];
  const files=result.text===text?result.files:[];
  const hits:Hit[]=[...apps.map(app=>({kind:"app" as const,app})),...files.map(file=>({kind:"file" as const,file}))];
  const close=(restore=false)=>{setOpen(false);if(restore)trigger.current?.focus({preventScroll:true});};
  const show=()=>{dispatch({type:"CLOSE_START"});setOpen(true);};
  useEffect(()=>{
    if(!open)return;
    if(navigator.maxTouchPoints===0&&!window.matchMedia("(pointer: coarse)").matches)
      input.current?.focus({preventScroll:true});
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false);
    };
    document.addEventListener("pointerdown",outside);
    const unsubscribe=fileStore.subscribe(()=>setRevision(n=>n+1));
    return()=>{document.removeEventListener("pointerdown",outside);unsubscribe();};
  },[open]);
  useEffect(()=>{
    if(!open||!text){setBusy(false);setResult({text:"",files:[]});return;}
    const volume=sourceFilesystemRuntime.snapshot();
    const roots=sourceMountedSearchRoots(volume);
    if(!roots.length){setResult({text,files:[]});setBusy(false);return;}
    const controller=new AbortController();
    let active=true;
    setBusy(true);setError("");
    const timer=window.setTimeout(()=>{
      void searchFiles(fileStore,{scope:roots[0]!,rootScopes:roots,text,subfolders:true,
        maxResults:40,skipPaths:volume?.trashPath?[volume.trashPath]:[]},{signal:controller.signal})
        .then(found=>{if(active){setResult({text,files:found.files.filter(file=>!file.originalPath)});setBusy(false);}})
        .catch(cause=>{if(active&&!controller.signal.aborted){setResult({text,files:[]});setBusy(false);
          setError(cause instanceof Error?cause.message:"Guest search failed.");}});
    },120);
    return()=>{active=false;window.clearTimeout(timer);controller.abort();};
  },[open,text,revision]);
  const launch=async(hit:Hit)=>{
    if(hit.kind==="app"){dispatch({type:"OPEN_APP",app:hit.app});close();return;}
    const failure=await openGuestSearchFile(dispatch,hit.file);
    if(failure)setError(failure);else close();
  };
  const render=(hit:Hit,index:number)=>{
    const app=hit.kind==="app"?hit.app:null;
    const file=hit.kind==="file"?hit.file:null;
    return <button type="button" key={app?.id??file?.uri}
      role="option" aria-selected={index===selected}
      data-test-spotlight-app={app?.id} data-test-spotlight-file={file?.uri}
      onPointerEnter={()=>setSelected(index)} onClick={()=>void launch(hit)}>
      <img width={24} height={24} alt="" src={app?(sourceThemeProgramArt("macos",app.id)??app.icon):
        (file?.type==="directory"?(sourceThemeProgramArt("macos","folder")??legacyArt.folder):(sourceThemeProgramArt("macos","file")??legacyArt.file))}/>
      <span><strong>{app?.label??file?.name}</strong>{file&&<small>{file.uri}</small>}</span>
    </button>;
  };
  return <div ref={root} className="source-macos-spotlight-root" onKeyDown={event=>{
    if(event.key==="Escape"&&open){event.preventDefault();event.stopPropagation();close(true);}
  }}>
    <button ref={trigger} type="button" data-test-spotlight-button="" className="source-macos-spotlight-trigger"
      aria-label="Spotlight" aria-expanded={open} onClick={()=>open?close():show()}><SearchIcon/></button>
    {open&&<div ref={pane} role="search" aria-label="Spotlight search" data-test-spotlight=""
      className="source-macos-spotlight" data-test-spotlight-query-state={busy?"pending":"ready"}>
      <label><SearchIcon size={24}/><input ref={input} type="search" aria-label="Spotlight search"
        data-test-spotlight-input="" placeholder="Spotlight Search" value={query}
        onChange={event=>{setQuery(event.target.value);setSelected(0);setError("");}}
        onKeyDown={event=>{
          if(event.key==="ArrowDown"||event.key==="ArrowUp"){
            event.preventDefault();if(!hits.length)return;
            const next=(selected+(event.key==="ArrowDown"?1:-1)+hits.length)%hits.length;
            setSelected(next);pane.current?.querySelectorAll('[role="option"]')[next]?.scrollIntoView({block:"nearest"});
          }
          if(event.key==="Enter"&&hits[selected]){event.preventDefault();void launch(hits[selected]);}
        }}/></label>
      {text&&<div className="source-macos-spotlight-results" role="listbox" aria-label="Search results">
        {apps.length>0&&<section aria-label="Applications"><h3>Applications</h3>{apps.map((app,i)=>render({kind:"app",app},i))}</section>}
        {files.length>0&&<section aria-label="Files and folders"><h3>Files and folders</h3>{files.map((file,i)=>render({kind:"file",file},apps.length+i))}</section>}
        {busy&&<p role="status">Searching…</p>}
        {!busy&&!hits.length&&!error&&<p>No results found.</p>}
      </div>}
      {error&&<p role="alert">{error}</p>}
    </div>}
  </div>;
}

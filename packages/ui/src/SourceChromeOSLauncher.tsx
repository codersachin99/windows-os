import {useEffect,useRef,useState,type MouseEvent as ReactMouseEvent,type RefObject,type Dispatch} from "react";
import type {DesktopAction} from "@windows-os/contracts";
import {appRegistry,fileStore,sourceFilesystemRuntime} from "@windows-os/sdk";
import {searchFiles,sourceMountedSearchRoots,type FileEntry} from "@windows-os/filesystem";
import {legacyArt,legacySourceIconArtwork,sourceThemeLogonArtwork,sourceThemeProgramArt,sourceShellAsset} from "@windows-os/assets";
import type {SourceWin11AllApp} from "./sourceWin11AllApps";
import {sourceChromeOSLauncherItems,sourceChromeOSRecentItems} from "./sourceChromeOSLauncher";
import {sourceMenuArrowFocus} from "./sourceMenuKeyboard";
import "./sourceChromeOSLauncher.css";

interface Props{
  rootRef:RefObject<HTMLElement|null>;items:readonly SourceWin11AllApp[];
  recentIds:readonly string[];dispatch:Dispatch<DesktopAction>;
  onLaunch(id:string):void;onOpenFile(file:FileEntry):Promise<string|null>;
  onContext(event:ReactMouseEvent<HTMLButtonElement>,id:string):void;
}
export function SourceChromeOSLauncher({rootRef,items,recentIds,dispatch,onLaunch,onOpenFile,onContext}:Props){
  const [query,setQuery]=useState("");
  const [found,setFound]=useState<{text:string;files:FileEntry[]}>({text:"",files:[]});
  const [revision,setRevision]=useState(0);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [selected,setSelected]=useState(0);
  const [power,setPower]=useState(false);
  const search=useRef<HTMLInputElement>(null);
  const powerRoot=useRef<HTMLDivElement>(null);
  const powerButton=useRef<HTMLButtonElement>(null);
  const menu=useRef<HTMLDivElement>(null);
  const all=sourceChromeOSLauncherItems(items,["computer","games","cpanel"].flatMap(id=>{
    const app=appRegistry.get(id);
    return app?[{id,label:app.label,available:true}]:[];
  }));
  const recent=sourceChromeOSRecentItems(all,recentIds);
  const text=query.trim();
  const matches=text?all.filter(item=>item.available&&item.label.toLocaleLowerCase().includes(text.toLocaleLowerCase())):[];
  const files=found.text===text?found.files:[];
  const count=matches.length+files.length;
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
  useEffect(()=>{
    if(!power)return;
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node&&!powerRoot.current?.contains(event.target))setPower(false);
    };
    document.addEventListener("pointerdown",outside);
    return()=>document.removeEventListener("pointerdown",outside);
  },[power]);
  const icon=(item:SourceWin11AllApp)=>sourceThemeProgramArt("chromeos",item.id)??appRegistry.get(item.id)?.icon??legacySourceIconArtwork(item.id).src;
  const openFile=async(file:FileEntry)=>{const failure=await onOpenFile(file);if(failure)setError(failure);};
  const tile=(item:SourceWin11AllApp,isRecent=false)=><button key={item.id} type="button"
    data-test-program={isRecent?undefined:item.id} data-test-recent-program={isRecent?item.id:undefined}
    disabled={!item.available} title={item.available?item.label:item.label+" — migration pending"}
    onClick={()=>onLaunch(item.id)} onContextMenu={event=>onContext(event,item.id)}>
    <img src={icon(item)} width={32} height={32} alt=""/><span>{item.label}</span>
  </button>;
  return <nav ref={rootRef} id="start-menu" className="source-chromeos-launcher"
    data-test-start-menu="" data-test-chromeos-launcher="" data-source-start-theme="chromeos" aria-label="Start menu"
    onKeyDown={event=>{
      if(event.key==="Escape"&&power){event.preventDefault();event.stopPropagation();setPower(false);powerButton.current?.focus();}
    }}>
    <header>
      <img src="/assets/images/google.d3503fb1.svg" width={24} height={24} alt=""/>
      <input ref={search} type="text" placeholder="Search" aria-label="Search programs and files"
        data-test-start-menu-search="" data-test-start-search="" value={query}
        onChange={event=>{setQuery(event.target.value);setSelected(0);setError("");setPower(false);}}
        onKeyDown={event=>{
          if((event.key==="ArrowDown"||event.key==="ArrowUp")&&count){
            event.preventDefault();setSelected((active+(event.key==="ArrowDown"?1:-1)+count)%count);
          }else if(event.key==="Enter"&&count){
            event.preventDefault();const app=matches[active];
            if(app)onLaunch(app.id);else if(files[active-matches.length])void openFile(files[active-matches.length]!);
          }
        }}/>
      <button type="button" aria-label="Guest account" data-test-chromeos-account=""
        onClick={()=>{const app=appRegistry.get("cpanel");if(app)dispatch({type:"OPEN_APP",app,file:{path:"accounts"}});}}>
        <img src={sourceThemeLogonArtwork.chromeos.guest} width={32} height={32} alt=""/>
      </button>
      <div className="source-chromeos-power" ref={powerRoot}>
        <button type="button" ref={powerButton} aria-label="Power options" aria-expanded={power}
          data-test-chromeos-power="" onClick={()=>setPower(value=>!value)}
          onKeyDown={event=>{if(event.key==="ArrowDown"){event.preventDefault();setPower(true);requestAnimationFrame(()=>menu.current?.querySelector("button")?.focus());}}}>⏻</button>
        {power&&<div ref={menu} role="menu" aria-label="Power options" data-test-chromeos-power-menu=""
          onKeyDown={event=>{if(sourceMenuArrowFocus(menu.current,event.target,event.key))event.preventDefault();}}>
          {([{type:"LOG_OFF",label:"Log off"},{type:"SHUTDOWN",label:"Shut down"},{type:"RESTART",label:"Restart"}] as const).map(action=>
            <button type="button" role="menuitem" key={action.type} onClick={()=>dispatch({type:action.type})}>{action.label}</button>)}
        </div>}
      </div>
    </header>
    {text?<div className="source-chromeos-results" data-test-start-results="">
      {matches.length>0&&<section><h3>Programs</h3>{matches.map((item,i)=><button key={item.id} type="button"
        data-test-program={item.id} data-test-start-result={i} className={active===i?"is-selected":""}
        onMouseEnter={()=>setSelected(i)} onClick={()=>onLaunch(item.id)} onContextMenu={event=>onContext(event,item.id)}>
        <img src={icon(item)} width={32} height={32} alt=""/><span>{item.label}</span></button>)}</section>}
      {files.length>0&&<section><h3>Files</h3>{files.map((file,i)=><button key={file.uri} type="button"
        data-test-start-result={matches.length+i} className={active===matches.length+i?"is-selected":""}
        onMouseEnter={()=>setSelected(matches.length+i)} onClick={()=>void openFile(file)}>
        <img src={sourceShellAsset("chromeos",file.type==="directory"?"folder":"file")??legacyArt.file} width={32} height={32} alt=""/>
        <span>{file.name}<small>{file.uri}</small></span></button>)}</section>}
      {busy&&<p role="status">Searching…</p>}
      {!busy&&!count&&!error&&<p>No items match your search.</p>}
      {error&&<p role="alert">{error}</p>}
    </div>:<>
      <section className="source-chromeos-recent" aria-label="Recent applications" data-test-start-menu-recent="">
        <div className="source-chromeos-grid">{recent.map(item=>tile(item,true))}</div>
      </section>
      <hr/>
      <section className="source-chromeos-all" aria-label="All applications" data-test-start-menu-all="">
        <div className="source-chromeos-grid">{all.map(item=>tile(item))}</div>
      </section>
    </>}
  </nav>;
}

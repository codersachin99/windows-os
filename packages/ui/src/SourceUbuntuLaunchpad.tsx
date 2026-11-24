import {useEffect,useRef,useState,type MouseEvent as ReactMouseEvent,type RefObject,type Dispatch} from "react";
import type {DesktopAction} from "@windows-os/contracts";
import {appRegistry,fileStore,sourceFilesystemRuntime} from "@windows-os/sdk";
import {searchFiles,sourceMountedSearchRoots,type FileEntry} from "@windows-os/filesystem";
import {legacyArt,legacySourceIconArtwork,sourceThemeProgramArt,sourceShellAsset} from "@windows-os/assets";
import {sourceCpanelSearchRegistry,sourceCpanelIsSupported} from "@windows-os/apps/cpanel";
import type {SourceWin11AllApp} from "./sourceWin11AllApps";
import {sourceUbuntuProgramMatches,sourceUbuntuPageSize} from "./sourceUbuntuLaunchpad";
import "./sourceUbuntuLaunchpad.css";

interface Props{
  rootRef:RefObject<HTMLElement|null>;items:readonly SourceWin11AllApp[];
  dispatch:Dispatch<DesktopAction>;onLaunch(id:string):void;
  onOpenFile(file:FileEntry):Promise<string|null>;
  onContext(event:ReactMouseEvent<HTMLButtonElement>,id:string):void;onClose():void;
}
export function SourceUbuntuLaunchpad({rootRef,items,dispatch,onLaunch,onOpenFile,onContext,onClose}:Props){
  const [query,setQuery]=useState("");
  const [page,setPage]=useState(0);
  const [selected,setSelected]=useState(0);
  const [compact,setCompact]=useState(()=>typeof window!=="undefined"&&window.matchMedia("(max-width:760px)").matches);
  const [found,setFound]=useState<{text:string;files:FileEntry[]}>({text:"",files:[]});
  const [revision,setRevision]=useState(0);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const search=useRef<HTMLInputElement>(null);
  const touch=useRef<number|null>(null);
  const wheel=useRef(0);
  const text=query.trim();
  const size=sourceUbuntuPageSize(compact);
  const count=Math.max(1,Math.ceil(items.length/size));
  const current=Math.min(page,count-1);
  const apps=text?sourceUbuntuProgramMatches(items,text):[];
  const settings=text?sourceCpanelSearchRegistry(text).filter(result=>sourceCpanelIsSupported(result.item.id)):[];
  const files=found.text===text?found.files:[];
  const total=apps.length+settings.length+files.length;
  const active=Math.min(selected,Math.max(0,total-1));
  useEffect(()=>{
    const media=window.matchMedia("(max-width:760px)");
    const resize=()=>{setCompact(media.matches);setPage(0);};
    media.addEventListener("change",resize);
    if(!navigator.maxTouchPoints&&!window.matchMedia("(pointer:coarse)").matches)search.current?.focus({preventScroll:true});
    const unsubscribe=fileStore.subscribe(()=>setRevision(value=>value+1));
    return()=>{media.removeEventListener("change",resize);unsubscribe();};
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
  const icon=(id:string)=>sourceThemeProgramArt("ubuntu",id)??appRegistry.get(id)?.icon??legacySourceIconArtwork(id).src;
  const change=(next:number)=>setPage(Math.max(0,Math.min(count-1,next)));
  const openSetting=(id:string)=>{const app=appRegistry.get("cpanel");if(app)dispatch({type:"OPEN_APP",app,file:{path:id}});};
  const openFile=async(file:FileEntry)=>{const failure=await onOpenFile(file);if(failure)setError(failure);};
  const openResult=(i:number)=>{
    if(apps[i])onLaunch(apps[i]!.id);
    else if(settings[i-apps.length])openSetting(settings[i-apps.length]!.item.id);
    else if(files[i-apps.length-settings.length])void openFile(files[i-apps.length-settings.length]!);
  };
  return <nav ref={rootRef} id="start-menu" className="source-ubuntu-launchpad"
    data-test-start-menu="" data-test-launchpad="" data-test-ubuntu-launchpad="" data-source-start-theme="ubuntu" aria-label="Activities"
    onWheel={event=>{if(text||!event.deltaY)return;const now=Date.now();if(now-wheel.current<220)return;wheel.current=now;change(current+(event.deltaY>0?1:-1));}}
    onTouchStart={event=>{touch.current=event.touches[0]?.clientX??null;}}
    onTouchEnd={event=>{if(touch.current===null)return;const delta=touch.current-(event.changedTouches[0]?.clientX??touch.current);touch.current=null;if(!text&&Math.abs(delta)>45)change(current+(delta>0?1:-1));}}>
    <div className="source-ubuntu-launchpad-backdrop" aria-hidden="true" onClick={onClose}/>
    <input ref={search} type="search" aria-label="Search programs and files" placeholder="Type to search"
      data-test-start-search="" value={query}
      onChange={event=>{setQuery(event.target.value);setPage(0);setSelected(0);setError("");}}
      onKeyDown={event=>{if(!total)return;if(event.key==="Enter"){event.preventDefault();openResult(active);}
        else if(["ArrowDown","ArrowUp","ArrowRight","ArrowLeft"].includes(event.key)){event.preventDefault();setSelected((active+(event.key==="ArrowDown"||event.key==="ArrowRight"?1:-1)+total)%total);}}}/>
    {text?<div className="source-ubuntu-results" data-test-start-results="">
      {apps.length>0&&<section data-test-start-group="apps" aria-label="Applications"><div className="source-ubuntu-result-apps">{apps.map((item,i)=><button key={item.id}
        type="button" data-test-start-result={i} data-test-program={item.id} className={active===i?"is-selected":""}
        onMouseEnter={()=>setSelected(i)} onClick={()=>openResult(i)} onContextMenu={event=>onContext(event,item.id)}>
        <img src={icon(item.id)} width={48} height={48} alt=""/><span>{item.label}</span></button>)}</div></section>}
      {settings.length>0&&<section data-test-start-group="settings" className="source-ubuntu-result-group"><header><img src={icon("cpanel")} width={48} height={48} alt=""/>Settings</header><div>
        {settings.map((result,i)=>{const n=apps.length+i;return <button key={result.item.id} type="button"
          data-test-start-result={n} className={active===n?"is-selected":""} onMouseEnter={()=>setSelected(n)} onClick={()=>openResult(n)}>
          <span>{result.item.label}</span></button>;})}</div></section>}
      {files.length>0&&<section data-test-start-group="files" className="source-ubuntu-result-group"><header><img src={icon("computer")} width={48} height={48} alt=""/>Files</header><div>
        {files.map((file,i)=>{const n=apps.length+settings.length+i;return <button key={file.uri} type="button"
          data-test-start-result={n} className={active===n?"is-selected":""} onMouseEnter={()=>setSelected(n)} onClick={()=>openResult(n)}>
          <img src={sourceShellAsset("ubuntu",file.type==="directory"?"folder":"file")??legacyArt.file} width={24} height={24} alt=""/><span>{file.name}</span></button>;})}</div></section>}
      {busy&&<p role="status">Searching…</p>}{!busy&&!total&&!error&&<p>No items match your search</p>}{error&&<p role="alert">{error}</p>}
    </div>:<>
      <div className="source-ubuntu-launchpad-grid" data-test-launchpad-page={current+1} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
        {items.slice(current*size,(current+1)*size).map(item=><button key={item.id} type="button"
          data-test-launchpad-program={item.id} data-test-program={item.id} disabled={!item.available}
          title={item.available?item.label:item.label+" — migration pending"} onClick={()=>onLaunch(item.id)} onContextMenu={event=>onContext(event,item.id)}>
          <img src={icon(item.id)} width={64} height={64} alt="" draggable={false}/><span>{item.label}</span></button>)}
      </div>
      {count>1&&<div className="source-ubuntu-launchpad-paging" aria-label="Launchpad pages">{Array.from({length:count},(_,i)=><button key={i} type="button"
        data-test-launchpad-paging-item="" aria-label={"Page "+(i+1)} aria-current={i===current?"page":undefined} onClick={()=>change(i)}/>)}</div>}
    </>}
  </nav>;
}

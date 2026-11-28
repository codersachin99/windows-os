import {useEffect,useRef,useState,type MouseEvent as ReactMouseEvent,type RefObject} from "react";
import {legacySourceIconArtwork,sourceShellWallpaper,sourceThemeProgramArt} from "@windows-os/assets";
import {appRegistry} from "@windows-os/sdk";
import type {SourceWin11AllApp} from "./sourceWin11AllApps";
import "./sourceMacOSLaunchpad.css";

interface Props{
  rootRef:RefObject<HTMLElement|null>;
  wallpaper?:string;
  items:readonly SourceWin11AllApp[];
  onLaunch(id:string):void;
  onContext(event:ReactMouseEvent<HTMLButtonElement>,id:string):void;
  onClose():void;
}

// Frozen startmenu-launchpad.js + theme-macos-scss.js: program-only
// sorted grid, five columns/four rows, 52px artwork, search and paging.
export function SourceMacOSLaunchpad({rootRef,wallpaper,items,onLaunch,onContext,onClose}:Props){
  const [query,setQuery]=useState("");
  const [page,setPage]=useState(0);
  const [selected,setSelected]=useState<string|null>(null);
  const [compact,setCompact]=useState(()=>typeof window!=="undefined"&&window.matchMedia("(max-width:650px)").matches);
  const input=useRef<HTMLInputElement>(null);
  const touch=useRef<number|null>(null);
  const lastWheel=useRef(0);
  useEffect(()=>{
    const media=window.matchMedia("(max-width:650px)");
    const resize=()=>{setCompact(media.matches);setPage(0);setSelected(null);};
    media.addEventListener("change",resize);
    if(!navigator.maxTouchPoints&&!window.matchMedia("(pointer:coarse)").matches)
      input.current?.focus({preventScroll:true});
    return()=>media.removeEventListener("change",resize);
  },[]);
  const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered=items.filter(item=>terms.every(term=>item.label.toLocaleLowerCase().includes(term)));
  const columns=compact?3:5;
  const size=columns*4;
  const count=Math.max(1,Math.ceil(filtered.length/size));
  const current=Math.min(page,count-1);
  const visible=filtered.slice(current*size,(current+1)*size);
  const enabled=visible.filter(item=>item.available);
  const active=enabled.find(item=>item.id===selected)??enabled[0];
  const change=(next:number)=>{
    setPage(Math.max(0,Math.min(count-1,next)));setSelected(null);
  };
  return <nav ref={rootRef} id="start-menu" className="source-macos-launchpad"
    data-test-start-menu="" data-test-launchpad="" data-source-start-theme="macos"
    aria-label="Launchpad"
    onWheel={event=>{
      if(!event.deltaY&&!event.deltaX)return;
      const now=Date.now();
      if(now-lastWheel.current<220)return;
      lastWheel.current=now;
      change(current+((event.deltaY||event.deltaX)>0?1:-1));
    }}
    onTouchStart={event=>{touch.current=event.touches[0]?.clientX??null;}}
    onTouchEnd={event=>{
      if(touch.current===null)return;
      const delta=touch.current-(event.changedTouches[0]?.clientX??touch.current);
      touch.current=null;
      if(Math.abs(delta)>45)change(current+(delta>0?1:-1));
    }}>
    <div className="source-macos-launchpad-wallpaper" aria-hidden="true"
      style={{backgroundImage:"url("+JSON.stringify(wallpaper??sourceShellWallpaper("macos"))+")"}}
      onClick={onClose}/>
    <input ref={input} type="search" aria-label="Search applications" placeholder="Search"
      data-test-start-search="" value={query}
      onChange={event=>{setQuery(event.target.value);setPage(0);setSelected(null);}}
      onKeyDown={event=>{
        if(event.key==="Enter"){
          if(active){event.preventDefault();onLaunch(active.id);}
        }else if(["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"].includes(event.key)&&enabled.length){
          event.preventDefault();
          const index=enabled.findIndex(item=>item.id===active?.id);
          const step=event.key==="ArrowDown"?columns:event.key==="ArrowUp"?-columns:event.key==="ArrowLeft"?-1:1;
          setSelected(enabled[(index+step+enabled.length*2)%enabled.length]?.id??null);
        }
      }}/>
    <div className="source-macos-launchpad-grid" data-test-launchpad-page={current+1}
      onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
      {visible.map(item=><button key={item.id} type="button"
        data-test-launchpad-program={item.id} data-test-program={item.id}
        disabled={!item.available} className={query&&active?.id===item.id?"is-selected":""}
        title={item.available?item.label:item.label+" — migration pending"}
        onClick={()=>onLaunch(item.id)} onContextMenu={event=>onContext(event,item.id)}>
        <img src={sourceThemeProgramArt("macos",item.id)??appRegistry.get(item.id)?.icon??legacySourceIconArtwork(item.id).src}
          alt="" width={52} height={52} draggable={false}/>
        <span>{item.label}</span>
      </button>)}
      {!visible.length&&<p>No items match your search</p>}
    </div>
    {count>1&&<div className="source-macos-launchpad-paging" aria-label="Launchpad pages">
      {Array.from({length:count},(_,index)=><button key={index} type="button"
        data-test-launchpad-paging-item="" aria-label={"Page "+(index+1)}
        aria-current={index===current?"page":undefined} onClick={()=>change(index)}/>)}
    </div>}
  </nav>;
}

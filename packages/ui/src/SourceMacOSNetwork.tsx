import {useEffect,useRef,useState} from "react";

/** Browser connectivity is not an internet reachability probe or native
 * Wi-Fi control. Source's native network adapter is not available here. */
type BrowserNetwork=EventTarget&{type?:string};
function connection():BrowserNetwork|undefined{
  return (navigator as Navigator&{connection?:BrowserNetwork}).connection;
}
function readNetwork(){
  return {online:navigator.onLine,type:connection()?.type??"unknown"};
}
function WifiGlyph({size=20}:{size?:number}){
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M2 8a16 16 0 0 1 20 0M5.5 11.5a10.5 10.5 0 0 1 13 0M9 15a5 5 0 0 1 6 0"/>
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>
  </svg>;
}
export function SourceMacOSNetwork({onOpen,open,setOpen,baseArtwork=false}:{onOpen:()=>void;open:boolean;setOpen:(open:boolean)=>void;baseArtwork?:boolean}){
  const [status,setStatus]=useState(readNetwork);
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const update=()=>setStatus(readNetwork());
    const net=connection();
    window.addEventListener("online",update);
    window.addEventListener("offline",update);
    net?.addEventListener("change",update);
    update();
    return()=>{
      window.removeEventListener("online",update);
      window.removeEventListener("offline",update);
      net?.removeEventListener("change",update);
    };
  },[]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false);
    };
    document.addEventListener("pointerdown",outside);
    return()=>document.removeEventListener("pointerdown",outside);
  },[open]);
  return <div ref={root} className="source-macos-network windows-taskbar__tray-icon"
    data-test-tray-icon="TaskbarNetwork" onKeyDown={event=>{
      if(event.key==="Escape"&&open){
        event.preventDefault();event.stopPropagation();setOpen(false);
        trigger.current?.focus({preventScroll:true});
      }
    }}>
    <button ref={trigger} type="button" className="source-macos-network-trigger"
      aria-label="Network" aria-haspopup="dialog" aria-expanded={open} title="Network"
      data-test-network="" data-network-online={status.online}
      onClick={()=>{if(open)setOpen(false);else{onOpen();setOpen(true);}}}>
      {baseArtwork?<img width={16} height={16} alt="" src={status.online?"/assets/images/network.21b75845.webp":"/assets/images/network-off.2d8dfd51.webp"}/>:<WifiGlyph/>}
    </button>
    {open&&<div className="source-macos-network-popup" role="dialog"
      aria-label="Network" data-test-network-popup="">
      <div>{status.online?"Currently connected to":"Not connected"}</div>
      <div className="source-macos-network-status" role="status">
        {baseArtwork?<img width={32} height={32} alt="" src={!status.online?"/assets/images/network-off.2d8dfd51.webp":/wifi|cellular/.test(status.type)?"/assets/images/network-signal.4305a101.webp":"/assets/images/network-wired.c19a6640.webp"}/>:<WifiGlyph size={32}/> }
        <div>
          <strong data-test-network-name="">{!status.online?"Offline":status.type==="wifi"?"Wireless network connection":status.type==="cellular"?"Mobile broadband connection":"Network"}</strong>
          <p>{status.online?"Browser reports online":"Browser reports offline"}</p>
          {status.online&&<small>Internet access has not been verified.</small>}
        </div>
      </div>
      <button type="button" disabled title="Native network settings are not available in the browser build">Open Network Settings</button>
    </div>}
  </div>;
}

import {useEffect,useRef,type Dispatch} from "react";
import {legacyArt} from "@windows-os/assets";
import {appRegistry} from "@windows-os/sdk";
import type {DesktopAction} from "@windows-os/contracts";

/** Original f0ed summary and Control Panel destination. Notification feed
 * migration is separate: until a genuine provider is connected, both this
 * summary and the existing Control Panel page contain no messages. */
export function SourceMacOSActionCenter({dispatch,open,setOpen}:{
  dispatch:Dispatch<DesktopAction>;open:boolean;setOpen:(open:boolean)=>void
}){
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false);
    };
    document.addEventListener("pointerdown",outside);
    return()=>document.removeEventListener("pointerdown",outside);
  },[open,setOpen]);
  const openCenter=()=>{
    setOpen(false);
    const app=appRegistry.get("cpanel");
    if(app)dispatch({type:"OPEN_APP",app,file:{path:"action-center"}});
  };
  return <div ref={root} className="source-macos-action-center windows-taskbar__tray-icon"
    data-test-tray-icon="TaskbarActionCenter"
    onKeyDown={event=>{
      if(event.key==="Escape"&&open){
        event.preventDefault();event.stopPropagation();setOpen(false);
        trigger.current?.focus({preventScroll:true});
      }
    }}>
    <button ref={trigger} type="button" className="source-macos-action-center-trigger"
      data-test-action-center="" aria-label="Action Center" aria-haspopup="dialog"
      aria-expanded={open} title="Action Center"
      onClick={()=>{if(!open)dispatch({type:"CLOSE_START"});setOpen(!open);}}>
      <img src={legacyArt.trayActionCenter} width={16} height={16} alt=""/>
    </button>
    {open&&<div className="source-macos-action-center-popup" role="dialog"
      aria-label="Action Center" data-test-action-center-popup="">
      <div className="source-macos-action-center-summary">
        <img src="/assets/images/action-center-headline.27cc6d83.webp" width={32} height={32} alt=""/>
        <span data-test-notification-summary="">No new messages</span>
      </div>
      <button type="button" data-test-open-action-center="" onClick={openCenter}>Open Action Center</button>
    </div>}
  </div>;
}

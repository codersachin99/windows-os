import {useEffect,useRef,type Dispatch} from "react";
import {legacyArt} from "@windows-os/assets";
import {appRegistry,type SourceNotificationSnapshot,sourceNotificationSeverity} from "@windows-os/sdk";
import type {DesktopAction} from "@windows-os/contracts";

/** Original f0ed summary and history, backed by shared Guest notification state. */
export function SourceMacOSActionCenter({dispatch,open,setOpen,notifications,onSeen,xpArtwork=false}:{
  dispatch:Dispatch<DesktopAction>;open:boolean;setOpen:(open:boolean)=>void;
  notifications:SourceNotificationSnapshot;onSeen:()=>void;xpArtwork?:boolean
}){
  const severity=sourceNotificationSeverity(notifications);
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
      data-test-action-center="" data-notification-severity={severity} aria-label="Action Center" aria-haspopup="dialog"
      aria-expanded={open} title="Action Center"
      onClick={()=>{if(!open){dispatch({type:"CLOSE_START"});onSeen();}setOpen(!open);}}>
      <img src={xpArtwork?"/assets/images/action-center-winxp.52f44912.webp":legacyArt.trayActionCenter} width={16} height={16} alt=""/>
    </button>
    {open&&<div className="source-macos-action-center-popup" role="dialog"
      aria-label="Action Center" data-test-action-center-popup="">
      <div className="source-macos-action-center-summary">
        <img src="/assets/images/action-center-headline.27cc6d83.webp" width={32} height={32} alt=""/>
        <span data-test-notification-summary="">{notifications.history.length===0?"No new messages":notifications.history.length===1?"1 message":notifications.history.length+" messages"}</span>
      </div>
      {notifications.history.length>0&&<div className="source-macos-notification-history">
        {notifications.history.map(message=><button key={message.id} type="button" data-test-notification-item="" onClick={openCenter}>{message.title}</button>)}
      </div>}
      <button type="button" data-test-open-action-center="" onClick={openCenter}>Open Action Center</button>
    </div>}
  </div>;
}

import {useEffect,useRef,type Dispatch} from "react";
import {sourceActionCenterArt,sourceActionCenterHeadlineArt} from "./sourceTrayArtwork";
import {appRegistry,type SourceNotificationSnapshot,sourceNotificationSeverity} from "@windows-os/sdk";
import type {DesktopAction} from "@windows-os/contracts";

/** Original f0ed summary and history, backed by shared Guest notification state. */
export function SourceMacOSActionCenter({dispatch,open,setOpen,notifications,onSeen,xpArtwork=false,onebitArtwork=false}:{
  dispatch:Dispatch<DesktopAction>;open:boolean;setOpen:(open:boolean)=>void;
  notifications:SourceNotificationSnapshot;onSeen:()=>void;xpArtwork?:boolean;onebitArtwork?:boolean
}){
  const severity=sourceNotificationSeverity(notifications);
  const headline=sourceActionCenterHeadlineArt(severity,onebitArtwork);
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
      <img src={sourceActionCenterArt(severity,xpArtwork,onebitArtwork)} width={16} height={16} alt=""/>
    </button>
    {open&&<div className="source-macos-action-center-popup" role="dialog"
      aria-label="Action Center" data-test-action-center-popup="" style={{width:"min(280px,calc(100vw - 24px))"}}>
      <div className="source-macos-action-center-summary" style={{gap:8,padding:12}}>
        {headline&&<img data-test-action-center-headline="" src={headline} width={24} height={24} alt="" style={{flex:"0 0 24px",width:24,height:24,objectFit:"contain"}}/>}
        <span data-test-notification-summary="">{notifications.history.length===0?"No new messages":notifications.history.length===1?"1 message":notifications.history.length+" messages"}</span>
      </div>
      {notifications.history.length>0&&<div className="source-macos-notification-history" style={{alignItems:"flex-start",gap:12,padding:"16px 24px"}}>
        {notifications.history.map(message=><button key={message.id} type="button" data-test-notification-item="" style={{padding:0,maxWidth:"100%"}} onClick={openCenter}>{message.title}</button>)}
      </div>}
      <button type="button" data-test-open-action-center="" style={{padding:12}} onClick={openCenter}>Open Action Center</button>
    </div>}
  </div>;
}

import {useEffect,useLayoutEffect,useRef} from "react";
import {sourceNotificationAnchor} from "./sourceNotificationAnchor";
import {SOURCE_NOTIFICATION_TIMEOUT,type SourceNotification} from "@windows-os/sdk";
import {sourceNotificationArt} from "./sourceTrayArtwork";
import "./sourceNotificationToast.css";

/** Source f0ed taskbar notification: 8-second dismissal, retained history.
 * Plain text only, never source HTML or externally supplied executable markup. */
export function SourceMacOSNotificationToast({message,onDismiss,theme="macos",anchorRevision=""}:{
  message:SourceNotification;onDismiss:(id:string)=>void;theme?:string;anchorRevision?:string
}){
  useEffect(()=>{
    const id=message.id;
    const timer=window.setTimeout(()=>onDismiss(id),SOURCE_NOTIFICATION_TIMEOUT);
    return()=>window.clearTimeout(timer);
  },[message.id,onDismiss]);
  const artwork=sourceNotificationArt(theme,message.type);
  const direction=["win10","win11","win11dark","chromeos"].includes(theme)?"card":
    ["macos","ubuntu"].includes(theme)?"bottom":"top";
  const toastRef=useRef<HTMLElement>(null);
  useLayoutEffect(()=>{
    const toast=toastRef.current;
    const desktop=toast?.closest<HTMLElement>(".windows-desktop");
    if(!toast||!desktop||direction==="card")return;
    const tray=desktop.querySelector<HTMLElement>(".windows-taskbar__tray");
    if(!tray)return;
    const measure=()=>{
      const icon=tray.querySelector<HTMLElement>("[data-test-action-center]");
      const toggle=tray.querySelector<HTMLElement>("[data-test-tray-hidden-toggle]");
      const anchor=icon&&icon.getBoundingClientRect().width>0?icon:toggle;
      if(!anchor||anchor.getBoundingClientRect().width===0){
        delete toast.dataset.notificationAnchor;
        toast.style.removeProperty("--source-balloon-left");
        toast.style.removeProperty("--source-balloon-top");
        toast.style.removeProperty("--source-balloon-tail-left");
        return;
      }
      const root=desktop.getBoundingClientRect(),rect=anchor.getBoundingClientRect();
      const scaleX=root.width/desktop.clientWidth||1,scaleY=root.height/desktop.clientHeight||1;
      const tail=theme==="onebit"?24:18;
      const placement=sourceNotificationAnchor({
        left:(rect.left-root.left)/scaleX,top:(rect.top-root.top)/scaleY,
        width:rect.width/scaleX,height:rect.height/scaleY
      },{width:toast.offsetWidth,height:toast.offsetHeight},
      {width:desktop.clientWidth,height:desktop.clientHeight},direction,getComputedStyle(desktop).direction==="rtl",tail);
      toast.style.setProperty("--source-balloon-left",placement.left+"px");
      toast.style.setProperty("--source-balloon-top",placement.top+"px");
      toast.style.setProperty("--source-balloon-tail-left",placement.tailLeft+"px");
      toast.dataset.notificationAnchor=anchor===icon?"icon":"hidden-toggle";
    };
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(desktop);observer.observe(tray);observer.observe(toast);
    const icon=tray.querySelector<HTMLElement>("[data-test-action-center]");
    if(icon)observer.observe(icon);
    window.addEventListener("resize",measure);
    return()=>{
      observer.disconnect();window.removeEventListener("resize",measure);
      delete toast.dataset.notificationAnchor;
      toast.style.removeProperty("--source-balloon-left");
      toast.style.removeProperty("--source-balloon-top");
      toast.style.removeProperty("--source-balloon-tail-left");
    };
  },[direction,theme,anchorRevision]);
  return <aside ref={toastRef} className={"source-macos-notification source-notification-balloon is-"+message.type} data-test-system-notification="" data-notification-balloon={direction}
    data-notification-id={message.id} role="status">
    {artwork&&<img className="source-notification-artwork" data-test-notification-artwork="" width={32} height={32} alt="" src={artwork}/>} 
    <div className="source-notification-copy"><strong>{message.title}</strong><p>{message.body}</p></div>
    <button type="button" aria-label="Dismiss notification" data-test-notification-close=""
      onClick={()=>onDismiss(message.id)}>×</button>
  </aside>;
}

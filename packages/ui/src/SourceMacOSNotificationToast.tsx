import {useEffect} from "react";
import {SOURCE_NOTIFICATION_TIMEOUT,type SourceNotification} from "@windows-os/sdk";
import {sourceNotificationArt} from "./sourceTrayArtwork";
import "./sourceNotificationToast.css";

/** Source f0ed taskbar notification: 8-second dismissal, retained history.
 * Plain text only, never source HTML or externally supplied executable markup. */
export function SourceMacOSNotificationToast({message,onDismiss,theme="macos"}:{
  message:SourceNotification;onDismiss:(id:string)=>void;theme?:string
}){
  useEffect(()=>{
    const id=message.id;
    const timer=window.setTimeout(()=>onDismiss(id),SOURCE_NOTIFICATION_TIMEOUT);
    return()=>window.clearTimeout(timer);
  },[message.id,onDismiss]);
  const artwork=sourceNotificationArt(theme,message.type);
  const direction=["win10","win11","win11dark","chromeos"].includes(theme)?"card":
    ["macos","ubuntu"].includes(theme)?"bottom":"top";
  return <aside className={"source-macos-notification source-notification-balloon is-"+message.type} data-test-system-notification="" data-notification-balloon={direction}
    data-notification-id={message.id} role="status">
    {artwork&&<img className="source-notification-artwork" data-test-notification-artwork="" width={32} height={32} alt="" src={artwork}/>} 
    <div className="source-notification-copy"><strong>{message.title}</strong><p>{message.body}</p></div>
    <button type="button" aria-label="Dismiss notification" data-test-notification-close=""
      onClick={()=>onDismiss(message.id)}>×</button>
  </aside>;
}

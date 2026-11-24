import {useEffect} from "react";
import {SOURCE_NOTIFICATION_TIMEOUT,type SourceNotification} from "@windows-os/sdk";
import {legacyArt} from "@windows-os/assets";

/** Source f0ed taskbar notification: 8-second dismissal, retained history.
 * Plain text only, never source HTML or externally supplied executable markup. */
export function SourceMacOSNotificationToast({message,onDismiss}:{
  message:SourceNotification;onDismiss:(id:string)=>void
}){
  useEffect(()=>{
    const id=message.id;
    const timer=window.setTimeout(()=>onDismiss(id),SOURCE_NOTIFICATION_TIMEOUT);
    return()=>window.clearTimeout(timer);
  },[message.id,onDismiss]);
  return <aside className={"source-macos-notification is-"+message.type} data-test-system-notification=""
    data-notification-id={message.id} role="status">
    {message.type==="error"||message.type==="warning"?<img width={32} height={32} alt=""
      src={message.type==="error"?legacyArt.messageError:legacyArt.messageWarning}/>:null}
    <div><strong>{message.title}</strong><p>{message.body}</p></div>
    <button type="button" aria-label="Dismiss notification" data-test-notification-close=""
      onClick={()=>onDismiss(message.id)}>×</button>
  </aside>;
}

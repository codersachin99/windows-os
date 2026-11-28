import {useEffect,useState} from "react";
import {sourceEmbedUrl} from "@windows-os/sdk";
import "./WebAppViewer.css";

interface SourceWebAppViewerProps{url?:string;onClose?():void;}
/** Source src/modules/apps/webapp.js webpack 99c7.
 * The source iframe cannot override remote CSP/X-Frame-Options.
 * Uses a sandbox so a hosted third party never gains host same-origin access.
 */
export function WebAppViewer({url,onClose}:SourceWebAppViewerProps){
  const [offline,setOffline]=useState(()=>!navigator.onLine);
  useEffect(()=>{
    const sync=()=>setOffline(!navigator.onLine);
    window.addEventListener("offline",sync);
    window.addEventListener("online",sync);
    return()=>{window.removeEventListener("offline",sync);window.removeEventListener("online",sync);};
  },[]);
  const safeUrl=url?sourceEmbedUrl(url):null;
  return <div className="source-webapp" data-test-source-webapp="">
    {offline||!safeUrl
      ?<section className="source-webapp__offline" role="alert">
        <p>{!safeUrl?"This web application address is invalid.":"Network error"}</p>
        <button type="button" onClick={onClose}>OK</button>
       </section>
      :<iframe data-test-source-webapp-frame="" title="Web application"
        referrerPolicy="no-referrer"
        sandbox="allow-forms allow-scripts allow-popups allow-downloads"
        src={safeUrl}/>}
  </div>;
}

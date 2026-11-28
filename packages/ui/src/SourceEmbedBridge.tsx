import {useEffect,useRef,type Dispatch} from "react";
import type {AppDefinition,DesktopAction,DesktopWindow} from "@windows-os/contracts";
import {legacyArt} from "@windows-os/assets";
import {
  sourceEmbedOrigins,sourceEmbedCommand,SOURCE_EMBED_PREFIX,SOURCE_EMBED_VERSION,
  sourceWebAppWindow
} from "@windows-os/sdk";

/** Source plugin-embed.js bcdb, disabled without an explicit parent origin allowlist.
 * Unlike unrestricted postMessage, both parent source AND exact origin are
 * validated before a command may open or close web_ windows.
 */
const ALLOWED_ORIGINS=sourceEmbedOrigins(import.meta.env.VITE_EMBED_ORIGINS);

interface Props{windows:readonly DesktopWindow[];dispatch:Dispatch<DesktopAction>;}
export function SourceEmbedBridge({windows,dispatch}:Props){
  const windowsRef=useRef(windows);
  windowsRef.current=windows;
  const previouslyOpen=useRef<Set<string>|null>(null);
  const active=ALLOWED_ORIGINS.length>0;
  // Match original watch() of web_ window IDs. Report closed when the window
  // disappears through the window X, task manager or parent close message.
  useEffect(()=>{
    if(!active||window.parent===window)return;
    const current=new Set(windows.filter(w=>w.appId.startsWith(SOURCE_EMBED_PREFIX))
      .map(w=>w.appId));
    const prev=previouslyOpen.current;
    if(prev){
      for(const id of prev){
        if(!current.has(id))
          for(const origin of ALLOWED_ORIGINS)window.parent.postMessage({type:"closed",id},origin);
      }
    }
    previouslyOpen.current=current;
  },[windows,active]);
  useEffect(()=>{
    if(!active||window.parent===window)return;
    const send=(payload:object)=>{
      for(const origin of ALLOWED_ORIGINS)window.parent.postMessage(payload,origin);
    };
    const handle=(event:MessageEvent)=>{
      if(event.source!==window.parent||!ALLOWED_ORIGINS.includes(event.origin))return;
      const command=sourceEmbedCommand(event.data);
      if(!command)return;
      if(command.type==="open"){
        const existing=windowsRef.current.find(w=>w.appId===command.id);
        if(existing){
          dispatch({type:"FOCUS_WINDOW",id:existing.id});
        }else{
          const app:AppDefinition={
            id:command.id,label:command.label,icon:legacyArt.internet,
            kind:"web",desktop:false,showInStart:false,
            window:sourceWebAppWindow({})
          };
          dispatch({type:"OPEN_APP",app,file:{path:command.url}});
        }
        send({type:"opened",id:command.id});
        return;
      }
      for(const instance of windowsRef.current.filter(w=>w.appId===command.id))
        dispatch({type:"CLOSE_WINDOW",id:instance.id});
    };
    window.addEventListener("message",handle);
    send({type:"ready",version:SOURCE_EMBED_VERSION});
    return()=>window.removeEventListener("message",handle);
  },[active,dispatch]);
  return null;
}

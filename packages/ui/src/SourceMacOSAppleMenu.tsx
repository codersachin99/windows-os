import {useEffect,useLayoutEffect,useRef,useState,type Dispatch} from "react";
import type {DesktopAction} from "@windows-os/contracts";
import {appRegistry} from "@windows-os/sdk";
import {sourceMenuArrowFocus} from "./sourceMenuKeyboard";

export const SOURCE_MACOS_APPLE_MENU=[
  {id:"settings",label:"Settings"},
  {id:"about",label:"About",divider:true},
  {id:"help",label:"Help and Support",divider:true,disabled:true},
  {id:"account",label:"Account"},
  {id:"logoff",label:"Log off"},
  {id:"restart",label:"Restart"},
  {id:"shutdown",label:"Shut down"}
] as const;
type Command=typeof SOURCE_MACOS_APPLE_MENU[number]["id"];

/** Source taskbar-macos.js + shared 98a6 menuItems. All actions are
 * Guest-local; unverified external support destination stays disabled. */
export function SourceMacOSAppleMenu({dispatch}:{dispatch:Dispatch<DesktopAction>}){
  const [open,setOpen]=useState(false);
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const popup=useRef<HTMLDivElement>(null);
  const close=(restore=false)=>{
    setOpen(false);
    if(restore)trigger.current?.focus({preventScroll:true});
  };
  const show=()=>{
    dispatch({type:"CLOSE_START"});
    setOpen(true);
  };
  useLayoutEffect(()=>{
    if(open)popup.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({preventScroll:true});
  },[open]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false);
    };
    document.addEventListener("pointerdown",outside);
    return()=>document.removeEventListener("pointerdown",outside);
  },[open]);
  const act=(id:Command)=>{
    close();
    if(id==="help")return;
    if(id==="logoff"){dispatch({type:"LOG_OFF"});return;}
    if(id==="restart"){dispatch({type:"RESTART"});return;}
    if(id==="shutdown"){dispatch({type:"SHUTDOWN"});return;}
    const app=appRegistry.get(id==="about"?"about":"cpanel");
    if(app)dispatch({type:"OPEN_APP",app,...(id==="account"?{file:{path:"accounts"}}:{})});
  };
  return <div className="source-macos-apple" ref={root}
    onKeyDown={event=>{
      if(event.key==="Escape"&&open){event.preventDefault();event.stopPropagation();close(true);}
    }}>
    <button type="button" ref={trigger} className="source-macos-apple-trigger"
      aria-label="Apple menu" aria-haspopup="menu" aria-expanded={open}
      data-test-menu-button=""
      onClick={()=>open?close():show()}
      onKeyDown={event=>{if(event.key==="ArrowDown"&&!open){event.preventDefault();show();}}}>
      <svg width="17" height="20" viewBox="0 0 1408 1664" aria-hidden="true">
        <path fill="currentColor" d="M1393 1215q-39 125-123 250q-129 196-257 196q-49 0-140-32q-86-32-151-32q-61 0-142 33q-81 34-132 34q-152 0-301-259Q0 1144 0 902q0-228 113-374q113-144 284-144q72 0 177 30q104 30 138 30q45 0 143-34q102-34 173-34q119 0 213 65q52 36 104 100q-79 67-114 118q-65 94-65 207q0 124 69 223t158 126M1017 42q0 61-29 136q-30 75-93 138q-54 54-108 72q-37 11-104 17q3-149 78-257Q835 41 1011 0q1 3 2.5 11t2.5 11q0 4 .5 10t.5 10"/>
      </svg>
    </button>
    {open&&<div ref={popup} role="menu" aria-label="Apple menu"
      className="source-macos-apple-popup" data-test-menu-popup=""
      onKeyDown={event=>{
        if(sourceMenuArrowFocus(popup.current,event.target,event.key))event.preventDefault();
        if(event.key==="Tab")close();
      }}>
      {SOURCE_MACOS_APPLE_MENU.map(item=><div key={item.id}>
        <button type="button" role="menuitem" data-test-macos-apple-action={item.id}
          disabled={item.id==="help"} onClick={()=>act(item.id)}>{item.label}</button>
        {"divider" in item&&item.divider&&<hr role="separator"/>}
      </div>)}
    </div>}
  </div>;
}

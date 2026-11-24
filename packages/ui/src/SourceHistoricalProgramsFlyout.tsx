import {useEffect,useLayoutEffect,useRef,useState,type RefObject,type MouseEvent as ReactMouseEvent} from "react";
import {createPortal} from "react-dom";
import {legacySourceIconArtwork,sourceThemeProgramArt} from "@windows-os/assets";
import {appRegistry} from "@windows-os/sdk";
import type {ThemeId} from "@windows-os/contracts";
import {sourceCascadingSubmenuPlacement} from "./sourceCascadingSubmenuPlacement";
import type {SourceWin11AllApp} from "./sourceWin11AllApps";

interface Props{
  theme:ThemeId;
  triggerRef:RefObject<HTMLButtonElement|null>;
  menuRef:RefObject<HTMLElement|null>;
  open:boolean;
  onOpenChange(open:boolean):void;
  items:readonly SourceWin11AllApp[];
  contextOpen:boolean;
  onLaunch(id:string):void;
  onContext(event:ReactMouseEvent<HTMLButtonElement>,id:string):void;
}

/** Frozen startmenu-winxp.js allProgramItems is a flat sorted list.
 * Keep its parent visible; portal avoids the shared Start panel's clip.
 * Narrow viewport fallback reuses the shared cascading menu placement. */
export function SourceHistoricalProgramsFlyout({theme,triggerRef,menuRef,open,onOpenChange,items,contextOpen,onLaunch,onContext}:Props){
  const panel=useRef<HTMLDivElement>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const focusOnOpen=useRef(false);
  const [position,setPosition]=useState({left:4,top:4,side:"right"});
  const cancelClose=()=>{if(timer.current!==null){clearTimeout(timer.current);timer.current=null;}};
  const scheduleClose=()=>{
    cancelClose();
    if(!contextOpen)timer.current=setTimeout(()=>{
      if(!panel.current?.contains(document.activeElement)&&document.activeElement!==triggerRef.current)
        onOpenChange(false);
    },180);
  };
  useEffect(()=>()=>{if(timer.current!==null)clearTimeout(timer.current);},[]);
  useEffect(()=>{if(contextOpen)cancelClose();},[contextOpen]);
  useLayoutEffect(()=>{
    if(!open||!panel.current||!menuRef.current||!triggerRef.current)return;
    const align=()=>{
      const p=panel.current,m=menuRef.current,t=triggerRef.current;
      if(!p||!m||!t)return;
      const root=m.getBoundingClientRect(),trigger=t.getBoundingClientRect();
      const child=p.getBoundingClientRect();
      const placement=sourceCascadingSubmenuPlacement(root,{top:trigger.bottom-child.height},child,
        {width:window.innerWidth,height:window.innerHeight});
      setPosition({left:root.left+placement.left,top:root.top+placement.top,side:placement.side});
    };
    align();
    const observer=new ResizeObserver(align);
    observer.observe(panel.current);observer.observe(menuRef.current);
    window.addEventListener("resize",align);
    if(focusOnOpen.current){
      focusOnOpen.current=false;
      panel.current.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({preventScroll:true});
    }
    return()=>{observer.disconnect();window.removeEventListener("resize",align);};
  },[open,theme,menuRef,triggerRef]);
  const arrow=sourceThemeProgramArt(theme,"arrow");
  return <>
    <button ref={triggerRef} type="button" className="windows-startmenu__all-programs"
      data-test-all-programs="" aria-haspopup="menu" aria-expanded={open}
      onPointerEnter={event=>{cancelClose();if(event.pointerType==="mouse")onOpenChange(true);}}
      onPointerLeave={scheduleClose}
      onFocus={cancelClose}
      onClick={()=>{cancelClose();onOpenChange(true);}}
      onKeyDown={event=>{
        if(event.key==="ArrowDown"||event.key==="ArrowRight"||event.key==="Enter"||event.key===" "){
          event.preventDefault();cancelClose();
          if(open)panel.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
          else{focusOnOpen.current=true;onOpenChange(true);}
        }
      }}>
      All Programs {arrow?<img src={arrow} alt="" width={16} height={16}/>:<span aria-hidden="true">▸</span>}
    </button>
    {open&&createPortal(<div ref={panel} role="menu" aria-label="All Programs"
      data-test-historical-programs-flyout="" data-source-historical-programs-theme={theme}
      data-source-flyout-side={position.side} className="source-historical-programs"
      style={{left:position.left,top:position.top}}
      onPointerEnter={cancelClose} onPointerLeave={scheduleClose}
      onKeyDown={event=>{if(["ArrowDown","ArrowUp","Home","End"].includes(event.key)){
        const buttons=Array.from(panel.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")??[]);
        if(!buttons.length)return;
        event.preventDefault();
        const current=buttons.indexOf(document.activeElement as HTMLButtonElement);
        const next=event.key==="Home"?0:event.key==="End"?buttons.length-1:
          event.key==="ArrowDown"?(current+1)%buttons.length:(current+buttons.length-1)%buttons.length;
        buttons[next]?.focus();
      }}}>
      {items.map(item=><button key={item.id} type="button" role="menuitem"
        data-test-source-program={item.id} disabled={!item.available}
        title={item.available?item.label:item.label+" — migration pending"}
        onClick={()=>onLaunch(item.id)} onContextMenu={event=>onContext(event,item.id)}>
        <img src={sourceThemeProgramArt(theme,item.id)??appRegistry.get(item.id)?.icon??legacySourceIconArtwork(item.id).src} alt="" width={16} height={16}/>
        <span>{item.label}</span>
      </button>)}
    </div>,document.body)}
  </>;
}

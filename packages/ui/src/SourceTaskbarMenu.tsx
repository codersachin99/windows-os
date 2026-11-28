import {Fragment,useEffect,useLayoutEffect,useRef,useState,type Dispatch} from "react";
import type {DesktopAction,DesktopWindow} from "@windows-os/contracts";
import {appRegistry} from "@windows-os/sdk";
import {taskbarPins} from "./sourceTaskbarPins";
import {sourceMenuArrowFocus} from "./sourceMenuKeyboard";
import {
  sourceTaskbarBackgroundMenu,sourceTaskbarItemMenu,type SourceTaskbarAction
} from "./sourceTaskbarMenus";

export type SourceTaskbarContext =
  | {kind:"background";x:number;y:number}
  | {kind:"item";id:string;x:number;y:number};
interface SourceTaskbarMenuProps{
  context:SourceTaskbarContext;
  windows:readonly DesktopWindow[];
  pinned:readonly string[];
  dispatch:Dispatch<DesktopAction>;
  onRequestCloseWindow(id:string):void;
  onClose():void;
  /** Actual pinned/running button or taskbar background that opened the menu. */
  returnFocusTarget?:HTMLElement|null;
}

/** Pure viewport geometry for the source taskbar popup. Buttons are centered
 * on their taskbar anchor and pop *up* instead of covering the taskbar.
 */
export function sourceTaskbarPopupPosition(
  anchor:{x:number;y:number},size:{width:number;height:number},
  viewport:{width:number;height:number}
):{left:number;top:number}{
  const x=anchor.x-size.width/2;
  return {
    left:Math.max(4,Math.min(x,viewport.width-size.width-4)),
    top:Math.max(4,Math.min(anchor.y-size.height,
      viewport.height-size.height-4))
  };
}

/** Frozen taskbar-menu offset watcher: background menus begin at the
 * pointer or flip left when the right edge would exceed the viewport.
 * Keep the existing viewport safety clamp for very narrow Guest screens. */
export function sourceTaskbarBackgroundPosition(
  anchor:{x:number;y:number},size:{width:number;height:number},
  viewport:{width:number;height:number}
):{left:number;top:number}{
  const left=anchor.x+size.width<viewport.width?anchor.x:anchor.x-size.width;
  return {
    left:Math.max(0,Math.min(left,viewport.width-size.width)),
    top:Math.max(0,Math.min(anchor.y-size.height,viewport.height-size.height))
  };
}

export function SourceTaskbarMenu({
  context,windows,pinned,dispatch,onRequestCloseWindow,onClose,returnFocusTarget
}:SourceTaskbarMenuProps){
  const ref=useRef<HTMLDivElement>(null);
  const [position,setPosition]=useState({left:0,top:0});
  const app=context.kind==="item"?appRegistry.get(context.id):null;
  const running=context.kind==="item"
    ?windows.find(win=>win.appId===context.id):undefined;
  const options=context.kind==="item"
    ?sourceTaskbarItemMenu(pinned.includes(context.id),Boolean(running))
    :sourceTaskbarBackgroundMenu();
  useLayoutEffect(()=>{
    const node=ref.current;
    if(!node)return;
    const locate=context.kind==="background"?sourceTaskbarBackgroundPosition:sourceTaskbarPopupPosition;
    const align=()=>setPosition(locate(
      context,{width:node.offsetWidth,height:node.offsetHeight},
      {width:window.innerWidth,height:window.innerHeight}));
    align();
    window.addEventListener("resize",align);
    return ()=>window.removeEventListener("resize",align);
  },[context]);
  // The source arrow-navigation helper is already connected on the menu.
  // A real pointer-triggered popup must first focus its first enabled
  // direct command; otherwise ArrowUp/Down never reach that handler.
  // Do not focus again on a geometry-only rerender.
  useLayoutEffect(()=>{
    ref.current?.querySelector<HTMLButtonElement>(
      ':scope > button[role="menuitem"]:not(:disabled)'
    )?.focus({preventScroll:true});
  },[context.kind,context.x,context.y,context.kind==="item"?context.id:null]);

  useEffect(()=>{
    const outside=(event:PointerEvent)=>{
      if(!(event.target instanceof Node)||!ref.current?.contains(event.target))
        onClose();
    };
    const escape=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){
        event.preventDefault();
        onClose();
        window.requestAnimationFrame(()=>{
          if(returnFocusTarget?.isConnected)
            returnFocusTarget.focus({preventScroll:true});
          else document.querySelector<HTMLElement>(".windows-taskbar")
            ?.focus({preventScroll:true});
        });
      }
    };
    window.addEventListener("pointerdown",outside);
    window.addEventListener("keydown",escape);
    return ()=>{
      window.removeEventListener("pointerdown",outside);
      window.removeEventListener("keydown",escape);
    };
  },[onClose,returnFocusTarget]);
  const act=(id:SourceTaskbarAction)=>{
    if(id==="pin"&&app)taskbarPins.toggle(app.id);
    else if(id==="open"&&app)dispatch({type:"OPEN_APP",app});
    else if(id==="close"&&running)onRequestCloseWindow(running.id);
    else if(id==="show-desktop")for(const win of windows){
      if(!win.minimized)dispatch({type:"MINIMIZE_WINDOW",id:win.id});
    }
    else if(id==="taskmgr"){
      const manager=appRegistry.get("taskmgr");
      if(manager)dispatch({type:"OPEN_APP",app:manager});
    }
    else if(id==="properties"){
      const settings=appRegistry.get("taskbar");
      if(settings)dispatch({type:"OPEN_APP",app:settings});
    }
    onClose();
  };
  return <div ref={ref} className="windows-taskbar__context"
    data-test-taskbar-context={context.kind}
    role="menu" aria-label={context.kind==="item"?"Taskbar program actions":"Taskbar actions"}
    style={{left:position.left,top:position.top}}
    onKeyDown={event=>{
      if(sourceMenuArrowFocus(ref.current,event.target,event.key)){
        event.preventDefault();
      }
    }}>
    {options.map(item=><Fragment key={item.id}><button type="button"
      role="menuitem" disabled={item.disabled}
      data-test-taskbar-context-action={item.id}
      title={item.disabled?"Original action not yet migrated":undefined}
      onClick={()=>act(item.id)}>{item.label}</button>
      {item.dividerAfter&&<hr role="separator" data-test-taskbar-context-divider={item.id}/>}
    </Fragment>)}
  </div>;
}

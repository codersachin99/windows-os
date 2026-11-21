import {useEffect,useRef,type ReactNode,type KeyboardEvent} from "react";
import {createPortal} from "react-dom";
import "./SourceChildWindow.css";

/** Reusable browser-shell sibling for pinned Vue WindowMain parent=<appId>.
 * Source result/stats are independent windows, not overlays inside the game.
 * A portal attaches to the actual desktop canvas so game scroll/minimize
 * cannot clip its child window. This is still a browser window adapter.
 */
export interface SourceChildWindowProps{
  id:string;
  title:string;
  parentWindowId:string;
  width:number;
  hidden?:boolean;
  children:ReactNode;
  onClose():void;
}
export function SourceChildWindow({
  id,title,parentWindowId,width,hidden=false,children,onClose
}:SourceChildWindowProps){
  const frame=useRef<HTMLElement|null>(null);
  const root=typeof document==="undefined"?null:
    document.querySelector<HTMLElement>(".windows-desktop__magnify-target")??
      document.body;
  useEffect(()=>{
    if(hidden)return;
    const parent=Array.from(document.querySelectorAll<HTMLElement>(
      "[data-test-window-id]")).find(node=>
      node.getAttribute("data-test-window-id")===parentWindowId);
    // Source WindowMain locks only its parent program while child is open.
    const wasInert=parent?.inert??false;
    if(parent)parent.inert=true;
    const focusBefore=document.activeElement;
    (frame.current?.querySelector<HTMLElement>("[data-child-autofocus]")??
      frame.current?.querySelector<HTMLElement>("button:not([disabled])")??
      frame.current)?.focus();
    return ()=>{
      if(parent)parent.inert=wasInert;
      if(focusBefore instanceof HTMLElement && focusBefore.isConnected &&
        !focusBefore.closest("[inert]"))focusBefore.focus();
    };
  },[parentWindowId,hidden]);
  const handleKeyDown=(event:KeyboardEvent<HTMLElement>)=>{
    if(event.key==="Escape"){
      event.preventDefault();event.stopPropagation();onClose();return;
    }
    if(event.key!=="Tab")return;
    const focusable=Array.from(frame.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]),select:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')??[]);
    if(!focusable.length){event.preventDefault();frame.current?.focus();return;}
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&(document.activeElement===first||
      !frame.current?.contains(document.activeElement))){
      event.preventDefault();last.focus();
    }else if(!event.shiftKey&&(document.activeElement===last||
      !frame.current?.contains(document.activeElement))){
      event.preventDefault();first.focus();
    }
  };
  if(!root)return null;
  return createPortal(
    <section ref={frame} tabIndex={-1}
      role="dialog" aria-modal={!hidden} aria-label={title}
      data-test-child-window={id} data-test-child-parent={parentWindowId}
      className="windows-window windows-game-child-window"
      style={{width:`min(${width}px,calc(100vw - 16px))`,
        display:hidden?"none":undefined}}
      onKeyDown={handleKeyDown}>
      <div className="windows-window__titlebar windows-game-child-window__titlebar">
        <span className="windows-window__title">{title}</span>
        <div className="windows-window__buttons">
          <button type="button" className="windows-window__close"
            aria-label={`Close ${title}`} onClick={onClose}>×</button>
        </div>
      </div>
      <div className="windows-window__body windows-game-child-window__body">
        {children}
      </div>
    </section>,root
  );
}

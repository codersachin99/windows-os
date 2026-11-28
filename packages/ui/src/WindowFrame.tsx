import { useRef, useState, type CSSProperties, type Dispatch, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import type { DesktopAction, DesktopWindow, ThemeId } from "@windows-os/contracts";
import {sourceResizeBounds,SOURCE_WINDOW_RESIZE_EDGES,type SourceResizeEdge,type SourceResizeBounds} from "./sourceWindowResize";
import "./sourceWindowResize.css";
import {sourceDragSnap,sourceSnapBounds,sourceDragRestoreBounds,type SourceDragSnap} from "./sourceWindowSnap";
import "./sourceWindowSnap.css";
import { SourceWindowControlGlyph } from "./SourceWindowControlGlyph";

interface WindowFrameProps {
  window: DesktopWindow;
  theme: ThemeId;
  dispatch: Dispatch<DesktopAction>;
  children: ReactNode;
  onRequestClose?: () => void;
  /** Highest visible Guest window, mirrors source window__main.active. */
  active?: boolean;
  /** Final source taskbar thumbnail hover isolates this Guest window. */
  peekTarget?:boolean;
}

export function WindowFrame({ window: win, theme, dispatch, children, onRequestClose,active=false,peekTarget=false }: WindowFrameProps) {
  const frame=useRef<HTMLElement>(null);
  const resize=useRef<{edge:SourceResizeEdge;pointerId:number;startX:number;startY:number;origin:SourceResizeBounds;area:SourceResizeBounds;scaleX:number;scaleY:number}|null>(null);
  const drag=useRef<{pointerId:number;startX:number;startY:number;origin:SourceResizeBounds;area:SourceResizeBounds;scaleX:number;scaleY:number;shellLeft:number;shellTop:number;touch:boolean;restore:SourceResizeBounds|null;mode:SourceDragSnap|null;moved:boolean}|null>(null);
  const [snapPreview,setSnapPreview]=useState<{mode:SourceDragSnap;bounds:SourceResizeBounds}|null>(null);
  const workArea=()=>{
    const shell=frame.current?.closest<HTMLElement>(".windows-desktop");
    if(!shell)return null;
    const styles=getComputedStyle(shell);
    const taskbar=parseFloat(styles.getPropertyValue("--taskbar-height"))||40;
    const top=theme==="ubuntu"||theme==="macos"?taskbar:0;
    const left=theme==="ubuntu"?(parseFloat(styles.getPropertyValue("--source-ubuntu-dock-width"))||64):0;
    const bottom=theme==="macos"?(parseFloat(styles.getPropertyValue("--source-macos-dock-reserve"))||74):theme==="ubuntu"?0:taskbar;
    return {x:left,y:top,width:Math.max(1,shell.clientWidth-left),height:Math.max(1,shell.clientHeight-top-bottom)};
  };
  const style: CSSProperties = win.maximized
    ? { inset: theme==="macos"?"var(--taskbar-height, 28px) 0 var(--source-macos-dock-reserve, 74px) 0":theme==="ubuntu"?"var(--taskbar-height, 32px) 0 0 var(--source-ubuntu-dock-width, 64px)":"0 0 var(--taskbar-height, 40px) 0", zIndex: win.z }
    : theme==="ubuntu"
      ? {left:`clamp(var(--source-ubuntu-dock-width, 64px), ${win.x}px, max(var(--source-ubuntu-dock-width, 64px), calc(100% - min(${win.width}px, calc(100% - var(--source-ubuntu-dock-width, 64px))))))`,
          top:`clamp(var(--taskbar-height, 32px), ${win.y}px, max(var(--taskbar-height, 32px), calc(100% - min(${win.height}px, calc(100% - var(--taskbar-height, 32px))))))`,
          width:win.width,height:win.height,zIndex:win.z}
      : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z };

  const pointerDown=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const node=frame.current,area=workArea();
    if(!node||!area||event.button!==0||drag.current||(event.target as HTMLElement).closest("button"))return;
    const rect=node.getBoundingClientRect();
    const scaleX=rect.width/node.offsetWidth||1,scaleY=rect.height/node.offsetHeight||1;
    const origin={x:node.offsetLeft,y:node.offsetTop,width:node.offsetWidth,height:node.offsetHeight};
    const shellLeft=rect.left-origin.x*scaleX,shellTop=rect.top-origin.y*scaleY;
    drag.current={pointerId:event.pointerId,startX:(event.clientX-shellLeft)/scaleX,startY:(event.clientY-shellTop)/scaleY,
      origin,area,scaleX,scaleY,shellLeft,shellTop,touch:event.pointerType==="touch",
      restore:win.maximized||win.snapped?win.restoreBounds??{x:win.x,y:win.y,width:win.width,height:win.height}:null,mode:null,moved:false};
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({type:"FOCUS_WINDOW",id:win.id});
  };
  const pointerMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const session=drag.current;
    if(!session||session.pointerId!==event.pointerId)return;
    const x=(event.clientX-session.shellLeft)/session.scaleX,y=(event.clientY-session.shellTop)/session.scaleY;
    if(!session.moved&&Math.hypot(x-session.startX,y-session.startY)<3)return;
    session.moved=true;
    if(session.restore){
      const bounds=sourceDragRestoreBounds(session.restore,session.origin,session.area,x,y,session.startX,session.startY);
      dispatch({type:"RESTORE_WINDOW_FOR_DRAG",id:win.id,bounds});
      session.origin=bounds;session.startX=x;session.startY=y;session.restore=null;
    }else{
      dispatch({type:"MOVE_WINDOW",id:win.id,x:session.origin.x+x-session.startX,y:session.origin.y+y-session.startY});
    }
    const mode=win.resizable===false?null:sourceDragSnap(x,y,session.area,session.touch,session.scaleX);
    if(mode!==session.mode){
      session.mode=mode;
      setSnapPreview(mode?{mode,bounds:sourceSnapBounds(mode,session.area,session.origin)}:null);
    }
  };
  const finishDrag=(event:ReactPointerEvent<HTMLDivElement>,commit:boolean)=>{
    const session=drag.current;
    if(!session||session.pointerId!==event.pointerId)return;
    drag.current=null;setSnapPreview(null);
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
    if(!commit||!session.moved||!session.mode)return;
    if(session.mode==="maximize"){
      if(!win.maximized)dispatch({type:"TOGGLE_MAXIMIZE",id:win.id});
    }else{
      dispatch({type:"ARRANGE_WINDOW",id:win.id,mode:session.mode,bounds:sourceSnapBounds(session.mode,session.area,session.origin)});
    }
  };
  const verticalSnap=()=>{
    const area=workArea();
    if(!area||win.maximized||win.resizable===false)return;
    dispatch({type:"ARRANGE_WINDOW",id:win.id,mode:win.snapped==="vertical"?null:"vertical",bounds:sourceSnapBounds("vertical",area,win)});
  };

  const resizeDown=(edge:SourceResizeEdge,event:ReactPointerEvent<HTMLDivElement>)=>{
    const node=frame.current;
    if(!node||event.button!==0||win.maximized||win.resizable===false||resize.current)return;
    event.preventDefault();event.stopPropagation();
    const rect=node.getBoundingClientRect();
    const shell=node.closest<HTMLElement>(".windows-desktop");
    if(!shell)return;
    const styles=getComputedStyle(shell);
    const taskbar=parseFloat(styles.getPropertyValue("--taskbar-height"))||40;
    const top=theme==="ubuntu"||theme==="macos"?taskbar:0;
    const left=theme==="ubuntu"?(parseFloat(styles.getPropertyValue("--source-ubuntu-dock-width"))||64):0;
    const bottom=theme==="macos"?(parseFloat(styles.getPropertyValue("--source-macos-dock-reserve"))||74):theme==="ubuntu"?0:taskbar;
    resize.current={edge,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,
      origin:{x:node.offsetLeft,y:node.offsetTop,width:node.offsetWidth,height:node.offsetHeight},
      area:{x:left,y:top,width:Math.max(1,shell.clientWidth-left),height:Math.max(1,shell.clientHeight-top-bottom)},
      scaleX:rect.width/node.offsetWidth||1,scaleY:rect.height/node.offsetHeight||1};
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({type:"FOCUS_WINDOW",id:win.id});
  };
  const resizeMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const session=resize.current;
    if(!session||session.pointerId!==event.pointerId)return;
    const bounds=sourceResizeBounds(session.origin,session.edge,
      (event.clientX-session.startX)/session.scaleX,(event.clientY-session.startY)/session.scaleY,session.area);
    dispatch({type:"RESIZE_WINDOW",id:win.id,...bounds});
  };
  const resizeEnd=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(resize.current?.pointerId!==event.pointerId)return;
    resize.current=null;
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  };

  // Keep the app mounted while minimized so its unsaved document survives.
  return (<>
    {snapPreview&&<div aria-hidden="true" className="source-window-snap-preview" data-test-window-snap-preview={snapPreview.mode}
      style={{left:snapPreview.bounds.x,top:snapPreview.bounds.y,width:snapPreview.bounds.width,height:snapPreview.bounds.height,zIndex:win.z}}/>}
    <section ref={frame} role="dialog" aria-label={win.title} aria-hidden={win.minimized || undefined}
      data-test-window={win.minimized ? undefined : win.appId}
      data-test-window-id={win.id}
      data-source-window-snapped={win.snapped}
      data-source-taskbar-peek-active={peekTarget?"true":undefined}
      className={`windows-window${active?" is-active":""}${win.maximized?" is-maximized":""}`}
      data-source-window-active={active?"true":"false"}
      style={win.minimized ? { ...style, display: "none" } : style} onPointerDown={() => dispatch({ type: "FOCUS_WINDOW", id: win.id })}>
      <div className="windows-window__titlebar" onPointerDown={pointerDown} onPointerMove={pointerMove}
        onPointerUp={event=>finishDrag(event,true)} onPointerCancel={event=>finishDrag(event,false)} onLostPointerCapture={event=>finishDrag(event,false)} onDoubleClick={event => {
          if (win.resizable !== false&&!(event.target as HTMLElement).closest("button")) dispatch({ type: "TOGGLE_MAXIMIZE", id: win.id });
        }}>
        {win.titlebarIcon !== false &&
          <img src={win.icon} width={18} height={18} alt="" draggable={false} />}
        <span className="windows-window__title">{win.title}</span>
        <div className="windows-window__buttons">
          {(win.resizable !== false || win.minimizable === true) &&
            <button aria-label={`Minimize ${win.title}`} data-source-window-control="minimize"
              onClick={() => dispatch({ type: "MINIMIZE_WINDOW", id: win.id })}>
              <SourceWindowControlGlyph theme={theme} kind="minimize"/>
            </button>}
          {win.resizable !== false &&
            <button aria-label={`Maximize ${win.title}`}
              title={win.maximized?"Restore":"Maximize"}
              data-source-window-control={win.maximized?"restore":"maximize"}
              onClick={() => dispatch({ type: "TOGGLE_MAXIMIZE", id: win.id })}>
              <SourceWindowControlGlyph theme={theme}
                kind={win.maximized?"restore":"maximize"}/>
            </button>}
          <button className="windows-window__close" aria-label={`Close ${win.title}`}
            data-source-window-control="close"
            onClick={() => onRequestClose ? onRequestClose() : dispatch({ type: "CLOSE_WINDOW", id: win.id })}>
            <SourceWindowControlGlyph theme={theme} kind="close"/>
          </button>
        </div>
      </div>
      <div className="windows-window__body">{children}</div>
      {!win.maximized&&win.resizable!==false&&SOURCE_WINDOW_RESIZE_EDGES.map(edge=><div key={edge}
        className={"source-window-resize source-window-resize--"+edge} data-test-window-resize={edge} aria-hidden="true"
        onPointerDown={event=>resizeDown(edge,event)} onPointerMove={resizeMove}
        onPointerUp={resizeEnd} onPointerCancel={resizeEnd} onLostPointerCapture={resizeEnd}
        onDoubleClick={edge==="n"||edge==="s"?verticalSnap:undefined}/>)}
    </section>
  </>);
}

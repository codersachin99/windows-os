import { useRef, useState, type CSSProperties, type Dispatch, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import type { DesktopAction, DesktopWindow, ThemeId,SourceWindowSnap } from "@windows-os/contracts";
import {sourceResizeBounds,SOURCE_WINDOW_RESIZE_EDGES,type SourceResizeEdge,type SourceResizeBounds} from "./sourceWindowResize";
import "./sourceWindowResize.css";
import {sourceDragSnap,sourceSnapBounds,sourceDragRestoreBounds,sourceVerticalResizeSnap,sourceWindowWorkArea,sourceShellPointerSpace,type SourceDragSnap} from "./sourceWindowSnap";
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
  const resize=useRef<{edge:SourceResizeEdge;pointerId:number;startX:number;startY:number;origin:SourceResizeBounds;area:SourceResizeBounds;scaleX:number;scaleY:number;shellTop:number;touch:boolean;vertical:boolean;last:SourceResizeBounds}|null>(null);
  const drag=useRef<{pointerId:number;startX:number;startY:number;origin:SourceResizeBounds;area:SourceResizeBounds;scaleX:number;scaleY:number;shellLeft:number;shellTop:number;touch:boolean;restore:SourceResizeBounds|null;mode:SourceDragSnap|null;moved:boolean}|null>(null);
  const [snapPreview,setSnapPreview]=useState<{mode:SourceDragSnap|SourceWindowSnap;bounds:SourceResizeBounds}|null>(null);
  const workArea=()=>{
    const shell=frame.current?.closest<HTMLElement>(".windows-desktop");
    if(!shell)return null;
    return sourceWindowWorkArea(shell,theme);
  };
  const areaTop=theme==="macos"?"var(--taskbar-height, 28px)":theme==="ubuntu"?"var(--taskbar-height, 32px)":"0px";
  const areaLeft=theme==="ubuntu"?"var(--source-ubuntu-dock-width, 64px)":"0px";
  const areaBottom=theme==="macos"?"var(--source-macos-dock-reserve, 74px)":theme==="ubuntu"?"0px":"var(--taskbar-height, 40px)";
  const areaInset=`${areaTop} 0 ${areaBottom} ${areaLeft}`;
  const previewStyle:CSSProperties=snapPreview?{
    top:areaTop,bottom:areaBottom,zIndex:win.z,
    ...(snapPreview.mode==="vertical"
      ?{left:snapPreview.bounds.x,width:snapPreview.bounds.width}
      :snapPreview.mode==="maximize"?{left:areaLeft,right:0}
      :{left:snapPreview.mode==="left"?areaLeft:`calc((100% + ${areaLeft}) / 2)`,
        width:`calc((100% - ${areaLeft}) / 2)`})
  }:{};
  const style: CSSProperties = win.maximized
    ? { inset:areaInset, zIndex: win.z }
    : theme==="ubuntu"
      ? {left:`clamp(var(--source-ubuntu-dock-width, 64px), ${win.x}px, max(var(--source-ubuntu-dock-width, 64px), calc(100% - min(${win.width}px, calc(100% - var(--source-ubuntu-dock-width, 64px))))))`,
          top:`clamp(var(--taskbar-height, 32px), ${win.y}px, max(var(--taskbar-height, 32px), calc(100% - min(${win.height}px, calc(100% - var(--taskbar-height, 32px))))))`,
          width:win.width,height:win.height,zIndex:win.z}
      : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z };

  const pointerDown=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const node=frame.current,area=workArea(),shell=node?.closest<HTMLElement>(".windows-desktop");
    if(!node||!area||!shell||event.button!==0||drag.current||(event.target as HTMLElement).closest("button"))return;
    const rect=node.getBoundingClientRect();
    const {left:shellLeft,top:shellTop,scaleX,scaleY}=sourceShellPointerSpace(shell);
    const origin={x:(rect.left-shellLeft)/scaleX,y:(rect.top-shellTop)/scaleY,width:rect.width/scaleX,height:rect.height/scaleY};
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
    if(!commit||!session.moved)return;
    if(!session.mode){dispatch({type:"SAVE_WINDOW_PLACEMENT",id:win.id});return;}
    if(session.mode==="maximize"){
      if(!win.maximized)dispatch({type:"TOGGLE_MAXIMIZE",id:win.id});
    }else{
      dispatch({type:"ARRANGE_WINDOW",id:win.id,mode:session.mode,bounds:sourceSnapBounds(session.mode,workArea()??session.area,session.origin),restoreBounds:session.origin});
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
    const area=workArea(),shell=node.closest<HTMLElement>(".windows-desktop");
    if(!area||!shell)return;
    const {left:shellLeft,top:shellTop,scaleX,scaleY}=sourceShellPointerSpace(shell);
    const origin={x:(rect.left-shellLeft)/scaleX,y:(rect.top-shellTop)/scaleY,width:rect.width/scaleX,height:rect.height/scaleY};
    resize.current={edge,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,origin,area,scaleX,scaleY,
      shellTop,touch:event.pointerType==="touch",vertical:false,last:origin};
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({type:"FOCUS_WINDOW",id:win.id});
  };
  const resizeMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const session=resize.current;
    if(!session||session.pointerId!==event.pointerId)return;
    const bounds=sourceResizeBounds(session.origin,session.edge,
      (event.clientX-session.startX)/session.scaleX,(event.clientY-session.startY)/session.scaleY,session.area);
    session.last=bounds;
    const vertical=sourceVerticalResizeSnap(session.edge,(event.clientY-session.shellTop)/session.scaleY,session.area,session.touch,session.scaleY);
    if(vertical!==session.vertical){
      session.vertical=vertical;
      setSnapPreview(vertical?{mode:"vertical",bounds:sourceSnapBounds("vertical",session.area,bounds)}:null);
    }
    dispatch({type:"RESIZE_WINDOW",id:win.id,...bounds});
  };
  const resizeEnd=(event:ReactPointerEvent<HTMLDivElement>,commit:boolean)=>{
    const session=resize.current;
    if(!session||session.pointerId!==event.pointerId)return;
    resize.current=null;setSnapPreview(null);
    if(commit&&session.vertical)dispatch({type:"ARRANGE_WINDOW",id:win.id,mode:"vertical",bounds:sourceSnapBounds("vertical",workArea()??session.area,session.last),restoreBounds:session.origin});
    else if(commit&&(session.last.x!==session.origin.x||session.last.y!==session.origin.y||session.last.width!==session.origin.width||session.last.height!==session.origin.height))dispatch({type:"SAVE_WINDOW_PLACEMENT",id:win.id});
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  };

  // Keep the app mounted while minimized so its unsaved document survives.
  return (<>
    {snapPreview&&<div aria-hidden="true" className="source-window-snap-preview" data-test-window-snap-preview={snapPreview.mode}
      style={previewStyle}/>}
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
        onPointerUp={event=>resizeEnd(event,true)} onPointerCancel={event=>resizeEnd(event,false)} onLostPointerCapture={event=>resizeEnd(event,false)}
        onDoubleClick={edge==="n"||edge==="s"?verticalSnap:undefined}/>)}
    </section>
  </>);
}

import {useCallback,useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from "react";
import {createPortal} from "react-dom";
import {VirtualFileDialog} from "@windows-os/apps/shared";
import {fileStore} from "@windows-os/sdk";
import {
  SOURCE_SNIP_MODES,SOURCE_SNIP_FILE_TYPES,SOURCE_SNIP_FILE_NAME,
  rectangularSnip,clampSnipRect,sourceSnipMime,
  type SnipRectangle,type SnipPoint,type SourceSnipMode
} from "./model";
import {captureDesktop} from "./captureDesktop";
import "./SnippingApp.css";
interface Props{onClose():void;onRegisterClose?(handler:()=>void):()=>void;}
const desktop=()=>document.querySelector<HTMLElement>(".windows-desktop");
const canvasToBlob=(canvas:HTMLCanvasElement,type:"image/png"|"image/jpeg")=>
  new Promise<Blob>((resolve,reject)=>{
    canvas.toBlob(blob=>blob&&blob.type===type?resolve(blob):
      reject(new Error("Selected image format is not supported")),type,0.92);
  });
/** Pinned legacy snipping.js 331a toolbar and active capture modes. */
export function SnippingApp({onClose,onRegisterClose}:Props){
  const [mode,setMode]=useState<SourceSnipMode|null>(null);
  const [menu,setMenu]=useState(false);
  const [preview,setPreview]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [saveOpen,setSaveOpen]=useState(false);
  const [selection,setSelection]=useState<SnipRectangle|null>(null);
  const selectionOrigin=useRef<SnipPoint|null>(null);
  const overlayRef=useRef<HTMLDivElement|null>(null);
  const appRef=useRef<HTMLDivElement|null>(null);
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const sequence=useRef(0);
  const panelRef=useRef<HTMLDivElement|null>(null);
  const cancel=useCallback(()=>{
    ++sequence.current;setMode(null);setSelection(null);selectionOrigin.current=null;
    setPreview("");canvasRef.current=null;setError("");setSaveOpen(false);setBusy(false);
  },[]);
  const close=useCallback(()=>{if(saveOpen)return;cancel();onClose();},[onClose,cancel,saveOpen]);
  useEffect(()=>onRegisterClose?.(close),[onRegisterClose,close]);
  useEffect(()=>()=>{sequence.current++;},[]);
  useEffect(()=>{
    if(!mode)return;
    const key=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();event.stopPropagation();cancel();}
    };
    window.addEventListener("keydown",key,true);
    return()=>window.removeEventListener("keydown",key,true);
  },[mode,cancel]);
  const capture=async(rect?:SnipRectangle)=>{
    const root=desktop();
    if(!root){setError("Desktop is not available");setMode(null);return;}
    const id=++sequence.current;
    setBusy(true);setError("");
    const overlay=overlayRef.current;
    const win=appRef.current?.closest<HTMLElement>(".windows-window");
    const beforeOverlay=overlay?.style.display??"";
    const beforeWin=win?.style.visibility??"";
    if(overlay)overlay.style.display="none";
    if(win)win.style.visibility="hidden";
    try{
      // Allow pending pointer/React updates to complete without capturing the selector.
      await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
      const image=await captureDesktop(root,rect);
      if(id!==sequence.current)return;
      const data=image.toDataURL("image/png");
      canvasRef.current=image;setPreview(data);setMode(null);setSelection(null);
    }catch(cause){
      if(id===sequence.current){setMode(null);setSelection(null);
        setError(cause instanceof Error?cause.message:"Unable to capture the desktop");}
    }finally{
      if(overlay)overlay.style.display=beforeOverlay;
      if(win)win.style.visibility=beforeWin;
      if(id===sequence.current)setBusy(false);
    }
  };
  const start=(next:SourceSnipMode)=>{
    setMenu(false);setPreview("");canvasRef.current=null;setError("");
    setSelection(null);selectionOrigin.current=null;
    if(next==="full-screen"){void capture();return;}
    setMode(next);
  };
  const screenPoint=(e:ReactPointerEvent<HTMLDivElement>):SnipPoint=>{
    const box=desktop()?.getBoundingClientRect();
    return {x:e.clientX-(box?.left??0),y:e.clientY-(box?.top??0)};
  };
  const screenSize=()=>{
    const rect=desktop()?.getBoundingClientRect();
    return {width:rect?.width??window.innerWidth,height:rect?.height??window.innerHeight};
  };
  const selectWindow=(e:ReactPointerEvent<HTMLDivElement>):SnipRectangle=>{
    const picked=document.elementsFromPoint(e.clientX,e.clientY)
      .map(node=>node.closest<HTMLElement>('[data-test-window]'))
      .find(node=>node&&node!==appRef.current?.closest(".windows-window"));
    const rootRect=desktop()?.getBoundingClientRect();
    const nodeRect=(picked??desktop())?.getBoundingClientRect();
    const rect=nodeRect??new DOMRect(0,0,window.innerWidth,window.innerHeight);
    return clampSnipRect({x:rect.left-(rootRect?.left??0),y:rect.top-(rootRect?.top??0),
      width:rect.width,height:rect.height},screenSize());
  };
  const pointerDown=(e:ReactPointerEvent<HTMLDivElement>)=>{
    if(e.button!==0||busy)return;
    if(mode==="window"){void capture(selectWindow(e));return;}
    if(mode!=="rectangular")return;
    selectionOrigin.current=screenPoint(e);
    setSelection(null);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const pointerMove=(e:ReactPointerEvent<HTMLDivElement>)=>{
    if(mode==="window"){setSelection(selectWindow(e));return;}
    if(mode!=="rectangular"||!selectionOrigin.current)return;
    const a=selectionOrigin.current,b=screenPoint(e);
    setSelection(clampSnipRect({x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),
      width:Math.abs(a.x-b.x),height:Math.abs(a.y-b.y)},screenSize()));
  };
  const pointerUp=(e:ReactPointerEvent<HTMLDivElement>)=>{
    if(mode!=="rectangular"||!selectionOrigin.current)return;
    const end=screenPoint(e);
    const selected=rectangularSnip(selectionOrigin.current,end,screenSize());
    selectionOrigin.current=null;
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
    if(selected)void capture(selected);
    else setSelection(null); // Source re-arms rectangular mode when <5 pixels.
  };
  const save=async(path:string)=>{
    const canvas=canvasRef.current;
    if(!canvas)throw new Error("No screenshot to save");
    const ext=path.split(".").pop()??"";
    const mime=sourceSnipMime(ext);
    if(!mime)throw new Error("Snipping Tool supports PNG and JPG only");
    const blob=await canvasToBlob(canvas,mime);
    await fileStore.writeBytes(new Uint8Array(await blob.arrayBuffer()),path);
    setSaveOpen(false);
  };
  const toolbar=<div className="source-snipping__toolbar">
    <div className="source-snipping__new-host" ref={panelRef}>
      <button type="button" aria-label="New snip" aria-expanded={menu}
        data-test-snipping-new="" onClick={()=>setMenu(m=>!m)}>✂ New <span>▾</span></button>
      {menu&&<div role="menu" className="source-snipping__modes">
        {SOURCE_SNIP_MODES.map(item=><button type="button" role="menuitem"
          key={item.id} disabled={!item.enabled} onClick={()=>{
            if(item.enabled)start(item.id as SourceSnipMode);
          }}>{item.label}</button>)}
      </div>}
    </div>
    <button type="button" data-test-snipping-cancel="" onClick={cancel}>✕ Cancel</button>
    {preview&&<button type="button" aria-label="Save" data-test-snipping-save=""
      onClick={()=>setSaveOpen(true)}>▣ Save</button>}
  </div>;
  return <div className="source-snipping" ref={appRef} data-test-snipping="">
    {toolbar}
    <div className="source-snipping__result" data-test-snipping-result="">
      {busy?<span role="status">Capturing desktop...</span>:
        preview?<img src={preview} data-test-snipping-image="" alt="Captured snip"/>:
        <span>{error||"Select a snip"}</span>}
    </div>
    {error&&<div role="alert" className="source-snipping__error">{error}</div>}
    {mode&&createPortal(<div className="source-snipping__overlay" ref={overlayRef}
      data-test-snipping-overlay="" onPointerDown={pointerDown}
      onPointerMove={pointerMove} onPointerUp={pointerUp}
      onPointerCancel={()=>{selectionOrigin.current=null;setSelection(null);}}>
      {selection?<div className="source-snipping__highlight" style={{
        left:selection.x,top:selection.y,width:selection.width,height:selection.height
      }}/>:<div className="source-snipping__veil"/>}
      <div className="source-snipping__hint">Select an area to capture · Esc to cancel</div>
    </div>,document.body)}
    {saveOpen&&createPortal(<div className="source-snipping__dialog-host" data-test-snipping-save-dialog="">
      <VirtualFileDialog fileStore={fileStore} mode="save"
        suggestedName={SOURCE_SNIP_FILE_NAME} fileTypes={SOURCE_SNIP_FILE_TYPES}
        onCancel={()=>setSaveOpen(false)} onSelected={save}/>
    </div>,document.body)}
  </div>;
}

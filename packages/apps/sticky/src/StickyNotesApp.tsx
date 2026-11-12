import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as Pointer } from "react";
import { legacyArt } from "@windows-os/assets";
import { browserStorage } from "@windows-os/sdk";
import {
  loadSourceStickyNotes, saveSourceStickyNotes, sourceStickyDefault,
  sourceStickyMove, sourceStickyRandomColor, sourceStickyResize,
  type StickyNote, type StickyResizeEdge, type StickyViewport
} from "./model";
import "./StickyNotesApp.css";

export interface StickyNotesAppProps {
  zIndex: number; minimized: boolean; onClose(): void; onFocus(): void;
}
type Gesture = {
  id: number; pointerId: number; startX: number; startY: number;
  note: StickyNote; edge: StickyResizeEdge | "move";
};
const edges: readonly StickyResizeEdge[] = ["n","ne","e","se","s","sw","w","nw"];
const viewport = (): StickyViewport => ({width:window.innerWidth,height:window.innerHeight});

/** Original stickynotes.js is a fragment of floating notes, not a framed
 * window. One shell/taskbar app owns all panels and their persisted records. */
export function StickyNotesApp({zIndex,minimized,onClose,onFocus}:StickyNotesAppProps) {
  const storage = useRef(browserStorage());
  const [initial] = useState(() => {
    try {return {notes:loadSourceStickyNotes(storage.current,viewport()),error:""};}
    catch(cause) {return {
      notes:[{...sourceStickyDefault(viewport()),id:1}],
      error:cause instanceof Error?cause.message:"Unable to load Sticky Notes"
    };}
  });
  const [notes,setNotes] = useState<StickyNote[]>(initial.notes);
  const notesRef=useRef(notes);
  const nextId=useRef(Math.max(...initial.notes.map(x=>x.id))+1);
  const gesture=useRef<Gesture|null>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [error,setError]=useState(initial.error);
  const cancelTimer=()=>{
    if(timer.current!==null){window.clearTimeout(timer.current);timer.current=null;}
  };
  const write=(value:readonly StickyNote[])=>{
    try {saveSourceStickyNotes(storage.current,value);setError("");}
    catch(cause){setError(cause instanceof Error?cause.message:"Could not save Sticky Notes");}
  };
  const save=()=>{cancelTimer();write(notesRef.current);};
  const change=(fn:(value:StickyNote[])=>StickyNote[],immediate=false)=>{
    const next=fn(notesRef.current);
    if(next===notesRef.current)return;
    notesRef.current=next;setNotes(next);
    cancelTimer();
    if(immediate)write(next);
    else timer.current=window.setTimeout(()=>{timer.current=null;write(next);},600);
  };
  useEffect(()=>()=>{if(timer.current!==null){
    window.clearTimeout(timer.current);
    try{saveSourceStickyNotes(storage.current,notesRef.current);}catch{/* already unmounted */}
  }},[]);
  const focus=(id:number)=>{
    const current=notesRef.current;
    const note=current.find(x=>x.id===id);
    if(!note)return;
    onFocus();
    if(current[current.length-1].id!==id)
      change(value=>[...value.filter(x=>x.id!==id),note]);
  };
  const add=()=>change(value=>[...value,{
    ...sourceStickyDefault(viewport(),sourceStickyRandomColor()),id:nextId.current++
  }],true);
  const closeNote=(id:number)=>{
    const next=notesRef.current.filter(note=>note.id!==id);
    change(()=>next,true);
    if(!next.length)onClose();
  };
  const edit=(id:number,content:string)=>change(value=>value.map(note=>
    note.id===id?{...note,content}:note));
  const start=(event:Pointer<HTMLElement>,note:StickyNote,edge:Gesture["edge"])=>{
    if(event.button!==0)return;
    event.preventDefault();event.stopPropagation();
    focus(note.id);
    gesture.current={
      id:note.id,pointerId:event.pointerId,startX:event.clientX,
      startY:event.clientY,note:{...note},edge
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move=(event:Pointer<HTMLElement>)=>{
    const g=gesture.current;
    if(!g||g.pointerId!==event.pointerId)return;
    const dx=event.clientX-g.startX,dy=event.clientY-g.startY;
    const result=g.edge==="move"?sourceStickyMove(g.note,dx,dy,viewport()):
      sourceStickyResize(g.note,g.edge,dx,dy,viewport());
    change(value=>value.map(note=>note.id===g.id?{...note,...result}:note));
  };
  const end=(event:Pointer<HTMLElement>)=>{
    if(!gesture.current||gesture.current.pointerId!==event.pointerId)return;
    gesture.current=null;
    if(event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    save();
  };
  const layerStyle:CSSProperties={zIndex,display:minimized?"none":undefined,pointerEvents:"none"};
  return <div id="window-sticky" className="windows-sticky__layer"
    role="group" aria-label="Sticky Notes" aria-hidden={minimized||undefined}
    data-test-window={minimized?undefined:"sticky"} data-test-sticky-layer=""
    style={layerStyle}>
    {notes.map((note,index)=><article key={note.id}
      className={"note windows-sticky__note is-"+note.color}
      data-test-sticky-notes="" data-test-sticky-id={note.id}
      data-test-sticky-color={note.color}
      data-test-sticky-x={note.x} data-test-sticky-y={note.y}
      data-test-sticky-w={note.w} data-test-sticky-h={note.h}
      style={{left:note.x,top:note.y,width:note.w,height:note.h,
        backgroundColor:noteColor[note.color],zIndex:index+1,pointerEvents:"auto"}}
      onPointerDown={event=>{
        if(!(event.target as HTMLElement).closest(".note__control-list,.note__resize"))
          focus(note.id);
      }}>
      <div className="note__control-list windows-sticky__header" data-test-sticky-drag=""
        onPointerDown={event=>start(event,note,"move")}
        onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
        <button type="button" aria-label="Add note" title="Add note"
          data-test-sticky-add="" className="note__control-item"
          onPointerDown={event=>event.stopPropagation()}
          onClick={event=>{event.stopPropagation();add();}}>
          <img src={legacyArt.stickyAdd} alt="" draggable={false}/>
        </button>
        <button type="button" aria-label="Close note" title="Close note"
          data-test-sticky-close="" className="note__control-item"
          onPointerDown={event=>event.stopPropagation()}
          onClick={event=>{event.stopPropagation();closeNote(note.id);}}>
          <img src={legacyArt.stickyClose} alt="" draggable={false}/>
        </button>
      </div>
      <div className="note__content windows-sticky__content">
        <textarea className="note__textarea" aria-label="Sticky note text"
          spellCheck={false} value={note.content}
          onChange={event=>edit(note.id,event.target.value)}/>
      </div>
      {edges.map(edge=><div key={edge} data-test-sticky-resize={edge}
        role="separator" aria-label={"Resize note "+edge}
        className={"note__resize note__resize-"+edge}
        onPointerDown={event=>start(event,note,edge)}
        onPointerMove={move} onPointerUp={end} onPointerCancel={end}/>)}
    </article>)}
    {error&&<p role="alert" className="windows-sticky__error">{error}</p>}
  </div>;
}
// Exact source module 2299 export "b" in pinned testmode.js, in the
// same order as the original stickynotes.js note color names.
const noteColor:Record<StickyNote["color"],string>={
  blue:"#c3f3fa",green:"#c8fec0",pink:"#f9ccf8",
  purple:"#d2d7fc",white:"#eaeaea",yellow:"#fffeb3"
};

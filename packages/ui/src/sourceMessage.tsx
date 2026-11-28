import {useEffect,useRef,type ReactNode} from "react";
import {legacyArt} from "@windows-os/assets";
import "./sourceMessage.css";

/** Original messages.js webpack 7680, message-error 3780 and message-confirm.
 * A reusable source dialog surface; callers own their VFS/state action.
 */
export type SourceMessage =
  |{type:"error";message:string;title?:string}
  |{type:"confirm";message:string;header?:string}
  |{type:"progress";message:string;title?:string;header?:string;progress?:"indeterminate"|"determinate";percent?:number};
export const SOURCE_MESSAGE_TYPES=["error","confirm","progress"] as const;
/** Original source has no active Stop command for message-progress. */
export function sourceMessageProgressPercent(value:number|undefined):number|undefined{
  return typeof value==="number"&&Number.isFinite(value)
    ?Math.max(0,Math.min(100,value)):undefined;
}
export interface SourceMessageDialogProps{
  data:SourceMessage;
  label?:string;
  onClose?():void;
  onAnswer?(confirmed:boolean):void;
  children?:ReactNode;
}
export function SourceMessageDialog({
  data,label,onClose,onAnswer,children
}:SourceMessageDialogProps){
  const cancel=useRef<HTMLButtonElement|null>(null);
  useEffect(()=>{
    cancel.current?.focus();
  },[]);
  const reject=()=>{if(data.type==="confirm")onAnswer?.(false);else onClose?.();};
  const title=label??(data.type==="confirm"?(data.header||"Confirm"):
    data.type==="error"?(data.title||"Error"):(data.title||"Progress"));
  const progress=data.type==="progress"?sourceMessageProgressPercent(data.percent):undefined;
  return <div className="source-message__backdrop" data-test-source-message={data.type}>
    <section className={"source-message is-"+data.type}
      role="alertdialog" aria-label={title} aria-modal="true"
      onKeyDown={event=>{
        if(event.key==="Escape"&&data.type!=="progress"){
          event.stopPropagation();event.preventDefault();reject();
        }
      }}>
      <div className="source-message__header">
        <strong>{title}</strong>
        {data.type!=="progress"&&<button type="button" aria-label="Close message"
          onClick={reject}>×</button>}
      </div>
      <div className="source-message__body">
        {data.type==="error"&&<img src={legacyArt.messageError} alt="" aria-hidden="true" className="source-message__icon is-error"/>}
        {data.type==="confirm"&&<img src={legacyArt.messageWarning} alt="" aria-hidden="true" className="source-message__icon is-warning"/>}
        <div className="source-message__text">
          {data.type==="progress"&&data.header&&
            <div className="source-message__progress-header">{data.header}</div>}
          {/* Source used parseInline() with innerHTML. Never insert executable
              markup from messages supplied by programs or virtual files. */}
          <p>{data.message}</p>{children}
          {data.type==="progress"&&
            <progress aria-label="Operation progress"
              className="source-message__progress" max={100}
              value={data.progress==="determinate"?progress:undefined}/>}
        </div>
      </div>
      <div className="source-message__footer">
        {data.type==="confirm"?<>
          <button type="button" data-test-confirm-answer="yes"
            onClick={()=>onAnswer?.(true)}>Yes</button>
          <button type="button" className="default" data-test-confirm-answer="no"
            ref={cancel} onClick={()=>onAnswer?.(false)}>No</button>
        </>:data.type==="error"?
          <button type="button" className="default" ref={cancel}
            onClick={onClose}>OK</button>
        :<button type="button" className="default" disabled>Stop</button>}
      </div>
    </section>
  </div>;
}

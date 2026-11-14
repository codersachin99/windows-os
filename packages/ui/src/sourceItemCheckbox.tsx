import type {KeyboardEvent,MouseEvent,PointerEvent,TouchEvent} from "react";
import "./sourceItemCheckbox.css";

/** Exact fa65 item-checkbox (from pinned shared~bsod~games~main.js).
 * The checkbox never activates its parent list item: every pointer/click
 * event is stopped, then a toggle callback changes selected state.
 */
export interface SourceItemCheckboxProps{
  checked:boolean;label:string;onToggle():void;
}
export function SourceItemCheckbox({checked,label,onToggle}:SourceItemCheckboxProps){
  const stop=(event:MouseEvent<HTMLSpanElement>
    |PointerEvent<HTMLSpanElement>|TouchEvent<HTMLSpanElement>)=>{
    event.stopPropagation();
  };
  const keyboard=(event:KeyboardEvent<HTMLSpanElement>)=>{
    if(event.key!==" "&&event.key!=="Enter")return;
    event.stopPropagation();
    event.preventDefault();
    onToggle();
  };
  return <span role="checkbox" tabIndex={0}
    aria-checked={String(checked)} aria-label={label}
    data-test-item-checkbox=""
    className="inline-flex justify-center items-center py-1.5 w-6 shrink-0 winui-checkbox item-checkbox"
    onPointerDown={stop} onMouseDown={stop} onTouchStart={stop}
    onTouchEnd={stop} onDoubleClick={stop}
    onClick={event=>{event.stopPropagation();onToggle();}}
    onKeyDown={keyboard}>
    <input className="source-item-checkbox__native" type="checkbox"
      tabIndex={-1} checked={checked} readOnly aria-hidden="true"/>
    <label aria-hidden="true"/>
  </span>;
}

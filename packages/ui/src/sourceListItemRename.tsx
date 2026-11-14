import {useEffect,useRef,useState} from "react";

/** Original webpack 0616 listview-item renaming:
 * a 30-character label input selected when rename starts, Enter blurs,
 * and blur calls item.rename(newFullName). The caller owns the VFS change.
 */
export const SOURCE_LIST_RENAME_LIMIT=30;
export interface SourceListItemRenameProps{
  originalName:string;
  onCommit(name:string):void;
  onCancel():void;
}
export function SourceListItemRename({
  originalName,onCommit,onCancel
}:SourceListItemRenameProps){
  const [draft,setDraft]=useState(originalName);
  const input=useRef<HTMLInputElement>(null);
  const finished=useRef(false);
  useEffect(()=>{
    const field=input.current;
    field?.focus();
    field?.select();
  },[]);
  const finish=(save:boolean)=>{
    if(finished.current)return;
    finished.current=true;
    if(save)onCommit(draft);
    else onCancel();
  };
  return <input type="text" ref={input}
    className="listview__item-label is-input"
    aria-label="Rename item" data-test-source-listview-rename=""
    maxLength={SOURCE_LIST_RENAME_LIMIT}
    value={draft} onChange={event=>setDraft(event.target.value)}
    onBlur={()=>finish(true)}
    onPointerDown={event=>event.stopPropagation()}
    onClick={event=>event.stopPropagation()}
    onDoubleClick={event=>event.stopPropagation()}
    onKeyDown={event=>{
      event.stopPropagation();
      if(event.key==="Escape"){
        event.preventDefault();
        finish(false);
      }else if(event.key==="Enter"){
        event.preventDefault();
        event.currentTarget.blur();
      }
    }}/>;
}

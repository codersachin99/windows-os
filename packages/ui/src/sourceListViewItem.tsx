import {useEffect,useRef,type ButtonHTMLAttributes,type MouseEvent as ReactMouseEvent,type ReactNode} from "react";

/** Original 0616 uses v-tap:400 through vue-click-helper. The first click
 * selects immediately; only the second click inside the 400ms window opens.
 */
export const SOURCE_LIST_ITEM_DOUBLE_TAP_MS=400;
export function sourceListItemIsDoubleTap(previous:number|null,now:number):boolean{
  return previous!==null && Number.isFinite(previous)&&Number.isFinite(now)
    && now>=previous && now-previous<SOURCE_LIST_ITEM_DOUBLE_TAP_MS;
}

/** Source listview-item (webpack 0616), pinned in 49e2ebd6.js.
 * Keep click/context/drag handlers delegated to the VFS consumer.
 */
export interface SourceListViewItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,"type">{
  itemKey:string;
  itemType:string;
  itemLabel:string;
  active?:boolean;
  children:ReactNode;
}
export function SourceListViewItem({
  itemKey,itemType,itemLabel,active=false,className="",title,
  children,onClick,onDoubleClick,...buttonProps
}:SourceListViewItemProps){
  const previousClick=useRef<number|null>(null);
  const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timeout.current!==null)clearTimeout(timeout.current);},[]);
  const activate=(event:ReactMouseEvent<HTMLButtonElement>)=>{
    onClick?.(event);
    if(event.defaultPrevented)return;
    const twice=sourceListItemIsDoubleTap(previousClick.current,event.timeStamp);
    if(timeout.current!==null){clearTimeout(timeout.current);timeout.current=null;}
    if(twice){
      previousClick.current=null;
      const target=event.target;
      if(target instanceof Element && (
        target.tagName==="INPUT"||
        target.closest("input, textarea, select, [data-source-listview-toggle]")
      ))return;
      // Exactly the second-click action of original v-tap:400, not a
      // second native dblclick listener that could open the file twice.
      onDoubleClick?.(event);
    }else{
      previousClick.current=event.timeStamp;
      timeout.current=setTimeout(()=>{previousClick.current=null;timeout.current=null;},
        SOURCE_LIST_ITEM_DOUBLE_TAP_MS);
    }
  };
  return <button {...buttonProps} type="button"
    title={title??itemLabel}
    data-key={itemKey}
    data-test-listview-item={itemType}
    className={"listview__item"+(active?" is-active":"")+(className?" "+className:"")}
    onClick={activate}>
    {children}
  </button>;
}

/** Source 0616 labelParts alternates plain and marked name ranges.
 * Validate the supplied ranges before slicing untrusted virtual filenames.
 */
export interface SourceListItemHighlightPart{text:string;marked:boolean;}
export function sourceListItemHighlightParts(
  label:string,highlights:readonly (readonly [number,number])[]
):SourceListItemHighlightPart[]{
  if(!highlights.length)return [{text:label,marked:false}];
  const result:SourceListItemHighlightPart[]=[];
  let from=0;
  for(const [start,end] of highlights){
    if(!Number.isInteger(start)||!Number.isInteger(end)
      ||start<from||end>label.length||start>=end)continue;
    if(start>from)result.push({text:label.slice(from,start),marked:false});
    result.push({text:label.slice(start,end),marked:true});
    from=end;
  }
  if(from<label.length)result.push({text:label.slice(from),marked:false});
  return result;
}

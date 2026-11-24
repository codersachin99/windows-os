import {useEffect,useLayoutEffect,useRef,useState,type RefObject} from "react";
import {createPortal} from "react-dom";

interface Target{label:string;x:number;y:number}

/** Source dock tooltip is a sibling of each icon. Portal it in React
 * because the narrow-screen dock is a horizontal scroll container. */
export function SourceMacOSDockTooltip({dockRef,hidden}:{dockRef:RefObject<HTMLDivElement|null>;hidden:boolean}){
  const [target,setTarget]=useState<Target|null>(null);
  const [position,setPosition]=useState({left:0,arrow:0});
  const tooltip=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const dock=dockRef.current;
    if(!dock||hidden){setTarget(null);return;}
    const button=(value:EventTarget|null)=>value instanceof Element?
      value.closest<HTMLButtonElement>("[data-test-macos-dock-item]"):null;
    const show=(event:Event)=>{
      const item=button(event.target);
      if(!item||!dock.contains(item))return;
      if(event instanceof PointerEvent&&event.pointerType!=="mouse")return;
      if(event.type==="focusin"&&!item.matches(":focus-visible"))return;
      const label=item.dataset.sourceDockLabel;
      if(!label)return;
      const box=item.getBoundingClientRect();
      setTarget({label,x:box.left+box.width/2,y:box.top-24});
    };
    const leave=(event:Event)=>{
      const from=button(event.target);
      const to=button((event as FocusEvent|PointerEvent).relatedTarget);
      if(from&&from!==to)setTarget(null);
    };
    const clear=()=>setTarget(null);
    dock.addEventListener("pointerover",show);
    dock.addEventListener("pointerout",leave);
    dock.addEventListener("focusin",show);
    dock.addEventListener("focusout",leave);
    dock.addEventListener("click",clear);
    dock.addEventListener("contextmenu",clear);
    dock.addEventListener("scroll",clear);
    window.addEventListener("resize",clear);
    return()=>{
      dock.removeEventListener("pointerover",show);
      dock.removeEventListener("pointerout",leave);
      dock.removeEventListener("focusin",show);
      dock.removeEventListener("focusout",leave);
      dock.removeEventListener("click",clear);
      dock.removeEventListener("contextmenu",clear);
      dock.removeEventListener("scroll",clear);
      window.removeEventListener("resize",clear);
    };
  },[dockRef,hidden]);
  useLayoutEffect(()=>{
    if(!target||!tooltip.current)return;
    const width=tooltip.current.offsetWidth;
    const left=Math.max(4,Math.min(window.innerWidth-width-4,target.x-width/2));
    setPosition({left,arrow:Math.max(9,Math.min(width-9,target.x-left))});
  },[target]);
  return !hidden&&target?createPortal(<div ref={tooltip} className="source-macos-dock-tooltip"
    role="tooltip" data-test-macos-dock-tooltip="" style={{left:position.left,top:target.y}}>
    {target.label}<span aria-hidden="true" style={{left:position.arrow}}/>
  </div>,document.body):null;
}

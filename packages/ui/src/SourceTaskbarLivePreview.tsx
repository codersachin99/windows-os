import {useLayoutEffect,useRef} from "react";
import type {DesktopWindow,ThemeId} from "@windows-os/contracts";
import {SOURCE_TASKBAR_PEEK_CARD_WIDTH,SOURCE_TASKBAR_PEEK_CARD_GAP}
  from "./sourceTaskbarGroups";
import "./sourceTaskbarLivePreview.css";

interface SourceTaskbarLivePreviewProps{
  appId:string;
  windows:readonly DesktopWindow[];
  left:number;
  theme:ThemeId;
  onStay():void;
  onLeave():void;
  onPeek(id:string|null):void;
  onActivate(id:string):void;
  onClose(id:string):void;
}

/** Original source taskbar-base.js mountLivePreview appends a scaled
 * cloneNode(true) of the actual window DOM. Do not instantiate the
 * application twice or copy mounted React state into a second runtime.
 * Clones have no React handlers, and embedded active media/iframes are
 * explicitly replaced so hover cannot make another network connection.
 */
export function SourceTaskbarPreviewCard({
  win,onPeek,onActivate,onClose
}:{
  win:DesktopWindow;
  onPeek(id:string|null):void;
  onActivate(id:string):void;
  onClose(id:string):void;
}){
  const host=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{
    const container=host.current;
    if(!container)return;
    const source=[...document.querySelectorAll<HTMLElement>("[data-test-window-id]")]
      .find(node=>node.dataset.testWindowId===win.id);
    container.replaceChildren();
    if(!source){
      const placeholder=document.createElement("span");
      placeholder.className="windows-taskbar__preview-placeholder";
      placeholder.textContent=win.title;
      container.appendChild(placeholder);
      return;
    }
    const winWidth=source.offsetWidth>=100?source.offsetWidth:
      Math.max(100,win.width);
    const winHeight=source.offsetHeight>=80?source.offsetHeight:
      Math.max(80,win.height);
    const scale=Math.min(206/winWidth,125/winHeight,0.35);
    const clone=source.cloneNode(true) as HTMLElement;
    // The original window remains the only semantic dialog and only element
    // discoverable by app/engine test hooks. A DOM clone must not duplicate
    // IDs, programmatic window selectors, accessibility roles or form names.
    for(const element of [clone,...clone.querySelectorAll<HTMLElement>("*")]){
      element.removeAttribute("id");
      element.removeAttribute("name");
      element.removeAttribute("role");
      element.removeAttribute("aria-label");
      for(const attribute of [...element.attributes]){
        if(attribute.name.startsWith("data-test-"))
          element.removeAttribute(attribute.name);
      }
    }
    clone.querySelectorAll<HTMLElement>("iframe,video,audio,script,object,embed")
      .forEach(node=>{
        const placeholder=document.createElement("div");
        placeholder.className="windows-taskbar__preview-embedded";
        placeholder.textContent="Preview";
        node.replaceWith(placeholder);
      });
    clone.classList.add("is-preview-clone");
    clone.classList.remove("is-maximized");
    clone.setAttribute("aria-hidden","true");
    clone.style.cssText=[
      "position:absolute","inset:0 auto auto 0",
      "transform:none","margin:0","opacity:1","visibility:visible",
      "display:block","pointer-events:none","user-select:none",
      "width:"+winWidth+"px","height:"+winHeight+"px","z-index:auto"
    ].join(";");
    const frame=document.createElement("div");
    frame.className="windows-taskbar__preview-clone-frame";
    frame.style.width=winWidth+"px";
    frame.style.height=winHeight+"px";
    frame.style.left=Math.max(0,(206-winWidth*scale)/2)+"px";
    frame.style.top=Math.max(0,(125-winHeight*scale)/2)+"px";
    frame.style.transform="scale("+scale+")";
    frame.style.transformOrigin="top left";
    frame.appendChild(clone);
    container.appendChild(frame);
    return ()=>container.replaceChildren();
  },[win.id,win.title,win.width,win.height,win.minimized]);
  return <article className="windows-taskbar__preview-card"
      data-test-taskbar-preview-window={win.id}
      onMouseEnter={()=>onPeek(win.id)}
      onMouseLeave={()=>onPeek(null)}>
    <div className="windows-taskbar__preview-titlebar">
      <img src={win.icon} alt="" width={16} height={16} draggable={false}/>
      <span title={win.title}>{win.title}</span>
      <button type="button" className="windows-taskbar__preview-close"
        data-test-taskbar-preview-close={win.id}
        aria-label={"Close "+win.title}
        onClick={event=>{event.stopPropagation();onClose(win.id);}}>✕</button>
    </div>
    <div role="button" tabIndex={0}
      aria-label={"Switch to "+win.title}
      className="windows-taskbar__preview-body"
      data-test-taskbar-preview-activate={win.id}
      onClick={()=>onActivate(win.id)}
      onKeyDown={event=>{
        if(event.key==="Enter"||event.key===" "){
          event.preventDefault();onActivate(win.id);
        }
      }}>
      <div ref={host} className="windows-taskbar__preview-clone-host"
        aria-hidden="true"/>
    </div>
  </article>;
}

export function SourceTaskbarLivePreview({
  appId,windows,left,theme,onStay,onLeave,onPeek,onActivate,onClose
}:SourceTaskbarLivePreviewProps){
  const maxWidth=Math.max(0,windows.length*SOURCE_TASKBAR_PEEK_CARD_WIDTH+
    Math.max(0,windows.length-1)*SOURCE_TASKBAR_PEEK_CARD_GAP);
  return <div className="windows-taskbar__preview-group"
      role="group" aria-label={"Window previews for "+appId}
      data-test-taskbar-preview-group={appId}
      data-source-taskbar-preview-theme={theme}
      style={{left,maxWidth:"min("+maxWidth+"px,calc(100vw - 20px))"}}
      onMouseEnter={onStay} onMouseLeave={onLeave}>
    {windows.map(win=><SourceTaskbarPreviewCard key={win.id} win={win}
      onPeek={onPeek} onActivate={onActivate} onClose={onClose}/>)}
  </div>;
}

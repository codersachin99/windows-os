import {useEffect,useRef} from "react";
import {sourceGuestVolume,sourceMacOSVolumeArt,sourceXPVolumeArt,sourceRetroVolumeArt,sourceOnebitVolumeArt,type SourceGuestAudio} from "./sourceGuestAudio";

/** Source c561: vertical meter and mute toggle. Guest media output only. */
export function SourceMacOSVolume({audio,onAudio,open,setOpen,onOpen,xpArtwork=false,retroArtwork=false,onebitArtwork=false}:{
  audio:SourceGuestAudio;onAudio:(value:SourceGuestAudio)=>void;
  open:boolean;setOpen:(open:boolean)=>void;onOpen:()=>void;xpArtwork?:boolean;retroArtwork?:boolean;onebitArtwork?:boolean
}){
  const artwork=onebitArtwork?sourceOnebitVolumeArt:retroArtwork?sourceRetroVolumeArt:xpArtwork?sourceXPVolumeArt:sourceMacOSVolumeArt;
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false);
    };
    document.addEventListener("pointerdown",outside);
    return()=>document.removeEventListener("pointerdown",outside);
  },[open,setOpen]);
  return <div ref={root} className="source-macos-volume windows-taskbar__tray-icon"
    data-test-tray-icon="TaskbarVolume" onKeyDown={event=>{
      if(event.key==="Escape"&&open){
        event.preventDefault();event.stopPropagation();setOpen(false);
        trigger.current?.focus({preventScroll:true});
      }
    }}>
    <button ref={trigger} type="button" className="source-macos-volume-trigger"
      data-test-volume="" aria-label="System volume"
      title={audio.muted?"Muted":audio.volume+"%"} aria-expanded={open}
      aria-haspopup="dialog" onClick={()=>{if(!open)onOpen();setOpen(!open);}}>
      <img src={artwork(audio)} width={16} height={16} alt=""/>
    </button>
    {open&&<div className="source-macos-volume-popup" role="dialog"
      aria-label="System volume" data-test-volume-popup="">
      <div className="source-macos-volume-meter">
        <input type="range" aria-label="System volume" aria-orientation="vertical"
          min={0} max={100} step={1} value={audio.volume} disabled={audio.muted}
          onChange={event=>onAudio({volume:sourceGuestVolume(Number(event.currentTarget.value)),muted:false})}/>
      </div>
      <button type="button" className="source-macos-volume-mute"
        aria-label={audio.muted?"Unmute system":"Mute system"} aria-pressed={audio.muted}
        onClick={()=>onAudio({...audio,muted:!audio.muted})}>
        <img width={24} height={24} alt="" src={artwork({volume:100,muted:audio.muted})}/>
      </button>
    </div>}
  </div>;
}

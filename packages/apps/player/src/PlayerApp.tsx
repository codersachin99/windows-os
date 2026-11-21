import {useCallback,useEffect,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {fileStore} from "@windows-os/sdk";
import {VirtualFileDialog} from "@windows-os/apps/shared";
import {getFileName, type FileEntry} from "@windows-os/filesystem";
import {
 SOURCE_PLAYER_INITIAL,SOURCE_PLAYER_LIBRARIES,SOURCE_PLAYER_STATES,
 sourcePlayerKind,sourcePlayerMime,sourcePlayerClock,sourcePlayerStep,
 sourcePlayerEffectiveVolume,sourcePlayerShowsAllControls,
 type SourcePlayerKind,type SourcePlayerLibrary,type SourcePlayerState
} from "./model";
import "./PlayerApp.css";

interface PlayerFile {
 path:string; name:string; kind:SourcePlayerKind; src:string; entry:FileEntry;
}
interface PlayerAppProps {
 initialFilePath?:string;onClose():void;onRegisterClose?(handler:()=>void):()=>void;
}
const INITIAL_OPEN_TYPES=[
 {extension:"mp3",label:"Audio files (*.mp3; *.wav; *.ogg)"},
 {extension:"mp4",label:"Video files (*.mp4; *.webm)"},
 {extension:"png",label:"Picture files (*.png; *.jpg; *.gif)"}
] as const;

/** Source player.js 9b15: Music/Videos/Pictures, original state machine and controls.
 * Only Guest virtual files are played. Browser codecs/autoplay remain authoritative.
 */
export function PlayerApp({initialFilePath,onClose,onRegisterClose}:PlayerAppProps){
 const [library,setLibrary]=useState<SourcePlayerLibrary>(SOURCE_PLAYER_INITIAL.library);
 const [file,setFile]=useState<PlayerFile|null>(null);
 const [openDialog,setOpenDialog]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [menu,setMenu]=useState(false);
 const [managing,setManaging]=useState(false);
 const [state,setState]=useState<SourcePlayerState>(SOURCE_PLAYER_STATES.Stop);
 const [currentTime,setCurrentTime]=useState<number>(SOURCE_PLAYER_INITIAL.currentTime);
 const [duration,setDuration]=useState<number|null>(null);
 const [muted,setMuted]=useState(false);
 const [volume,setVolume]=useState(100);
 const [random,setRandom]=useState(false);
 const [loop,setLoop]=useState(false);
 const [showAll,setShowAll]=useState(true);
 const root=useRef<HTMLDivElement|null>(null);
 const mediaRef=useRef<HTMLAudioElement|HTMLVideoElement|null>(null);
 const objectUrl=useRef("");
 const epoch=useRef(0);
 const closeRef=useRef(onClose);
 closeRef.current=onClose;
 const stopCurrent=useCallback(()=>{
   const player=mediaRef.current;
   if(player){player.pause();player.removeAttribute("src");player.load();}
   if(objectUrl.current){URL.revokeObjectURL(objectUrl.current);objectUrl.current="";}
 },[]);
 const loadFile=useCallback(async(path:string)=>{
   const revision=++epoch.current;
   const kind=sourcePlayerKind(path),mime=sourcePlayerMime(path);
   if(!kind||!mime){setError("This file type is not supported by the source media library.");return;}
   setBusy(true);setError("");setOpenDialog(false);setMenu(false);setManaging(false);
   try{
     const [entry,bytes]=await Promise.all([fileStore.stat(path),fileStore.readBytes(path)]);
     if(!entry||entry.type!=="file")throw new Error("File not found");
     const exact=new Uint8Array(bytes.length);exact.set(bytes);
     const blob=new Blob([exact.buffer],{type:mime});
     const url=URL.createObjectURL(blob);
     if(revision!==epoch.current){URL.revokeObjectURL(url);return;}
     stopCurrent();
     setFile({path,name:getFileName(path),kind,src:url,entry});
     objectUrl.current=url;
     setLibrary(kind);setState(SOURCE_PLAYER_STATES.Stop);setCurrentTime(0);setDuration(null);
   }catch(cause){
     if(revision===epoch.current)setError(cause instanceof Error?cause.message:"Cannot open media file");
   }finally{if(revision===epoch.current)setBusy(false);}
 },[stopCurrent]);
 useEffect(()=>{
   if(initialFilePath)void loadFile(initialFilePath);
   return()=>{++epoch.current;stopCurrent();};
 },[initialFilePath,loadFile,stopCurrent]);
 useEffect(()=>{
   const node=root.current;if(!node)return;
   const update=()=>setShowAll(sourcePlayerShowsAllControls(node.clientWidth));
   update();const observer=new ResizeObserver(update);observer.observe(node);
   return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
   const player=mediaRef.current;if(!player)return;
   player.volume=sourcePlayerEffectiveVolume(volume);
   player.muted=muted;
 },[volume,muted,file]);
 const close=useCallback(()=>{
   if(openDialog)return;
   ++epoch.current;stopCurrent();closeRef.current();
 },[openDialog,stopCurrent]);
 useEffect(()=>onRegisterClose?.(close),[close,onRegisterClose]);
 const changeLibrary=(value:SourcePlayerLibrary)=>{
   setLibrary(value);setMenu(false);setManaging(false);setOpenDialog(true);
 };
 const togglePlay=async()=>{
   if(!file||file.kind==="pictures"){
     if(file)setState(previous=>previous===SOURCE_PLAYER_STATES.Play?
       SOURCE_PLAYER_STATES.Pause:SOURCE_PLAYER_STATES.Play);
     return;
   }
   const player=mediaRef.current;if(!player)return;
   if(state===SOURCE_PLAYER_STATES.Play){
     player.pause();setState(SOURCE_PLAYER_STATES.Pause);
     return;
   }
   try{
     if(player.ended){player.currentTime=0;}
     await player.play();
     setState(SOURCE_PLAYER_STATES.Play);setError("");
   }catch(cause){
     setState(SOURCE_PLAYER_STATES.Pause);
     setError(cause instanceof Error?cause.message:"Browser prevented media playback.");
   }
 };
 const stop=()=>{
   mediaRef.current?.pause();
   if(mediaRef.current)mediaRef.current.currentTime=0;
   setCurrentTime(0);setState(SOURCE_PLAYER_STATES.Stop);
 };
 const select=()=>{
   if(!file)return;
   stop();setState(SOURCE_PLAYER_STATES.Stop);
 };
 const labelForKind=(kind:SourcePlayerLibrary)=>kind==="music"?"Music":kind==="videos"?"Videos":"Pictures";
 const list=file?[file]:[];
 return <div className="source-player" ref={root} data-test-player="">
   <div className="source-player__location">‹　›　 Library　›　{labelForKind(library)}</div>
   <div className="source-player__menu">
     <div className="source-player__organize">
       <button type="button" aria-expanded={menu} aria-label="Organize"
         onClick={()=>{setMenu(!menu);setManaging(false);}}>Organize ▾</button>
       {menu&&<div className="source-player__popup" role="menu">
         <button type="button" role="menuitem" aria-expanded={managing}
           onClick={()=>setManaging(!managing)}>Manage libraries ▸</button>
         {managing&&SOURCE_PLAYER_LIBRARIES.map(kind=>
           <button key={kind} type="button" role="menuitem" className="source-player__sub"
             onClick={()=>changeLibrary(kind)}>{labelForKind(kind)}</button>)}
         <button type="button" disabled role="menuitem">Options</button>
       </div>}
     </div>
     <button type="button" disabled>Stream</button>
     <button type="button" className="source-player__open"
       onClick={()=>{setOpenDialog(true);setMenu(false);}}>Open file...</button>
   </div>
   <div className="source-player__body">
     {!file&&!busy&&<div className="source-player__empty">
       No items in this library.
       <span>Click Organize to manage your music, videos, or pictures.</span>
     </div>}
     {busy&&<p className="source-player__message" role="status">Please wait...</p>}
     {file&&<>
       <div className="source-player__columns" aria-hidden="true">
         <span>Name</span><span>Length</span><span>Size</span><span>Modified</span><span>Type</span>
       </div>
       <div className="source-player__playlist">
         {list.map(item=><button type="button" key={item.path}
           data-test-player-row="" className="source-player__row is-selected"
           onClick={select}>
           <span>{item.name}</span>
           <span>{sourcePlayerClock(duration)??""}</span>
           <span>{item.entry.size} B</span>
           <span>{new Date(item.entry.mtime).toLocaleDateString("en-US")}</span>
           <span>{item.name.split(".").pop()?.toLowerCase()}</span>
         </button>)}
       </div>
       <div className="source-player__stage">
         {file.kind==="pictures"&&<img src={file.src} data-test-player-picture=""
           alt={file.name} onError={()=>setError("Cannot render this picture")}/>}
         {file.kind==="music"&&<audio ref={mediaRef as React.Ref<HTMLAudioElement>}
           src={file.src} data-test-player-audio="" preload="metadata"
           onLoadedMetadata={event=>setDuration(event.currentTarget.duration)}
           onTimeUpdate={event=>setCurrentTime(event.currentTarget.currentTime)}
           onEnded={()=>setState(SOURCE_PLAYER_STATES.Stop)}
           onError={()=>setError("Browser cannot decode this audio format")}/>}
         {file.kind==="videos"&&<video ref={mediaRef as React.Ref<HTMLVideoElement>}
           src={file.src} data-test-player-video="" preload="metadata" playsInline
           onLoadedMetadata={event=>setDuration(event.currentTarget.duration)}
           onTimeUpdate={event=>setCurrentTime(event.currentTarget.currentTime)}
           onEnded={()=>setState(SOURCE_PLAYER_STATES.Stop)}
           onError={()=>setError("Browser cannot decode this video format")}/>}
       </div>
     </>}
   </div>
   {error&&<p role="alert" className="source-player__error">{error}
     <button aria-label="Dismiss media error" onClick={()=>setError("")}>×</button></p>}
   <footer className="source-player__footer">
     <input type="range" data-test-player-seek="" aria-label="Playback position" min={0}
       max={Math.max(1,Math.round(duration??0))} step="1" value={Math.max(0,currentTime)}
       disabled={!file||file.kind==="pictures"||!duration}
       onChange={event=>{
         if(mediaRef.current){mediaRef.current.currentTime=Number(event.target.value);}
         setCurrentTime(Number(event.target.value));
       }}/>
     <div className="source-player__controls">
       {showAll&&<>
         <button type="button" aria-label="Shuffle" aria-pressed={random}
           onClick={()=>setRandom(v=>!v)}>⇄</button>
         <button type="button" aria-label="Repeat" aria-pressed={loop}
           onClick={()=>setLoop(v=>!v)}>↻</button>
       </>}
       <button type="button" aria-label="Stop" disabled={!file||state===SOURCE_PLAYER_STATES.Stop}
         onClick={stop}>■</button>
       <button type="button" aria-label="Previous" disabled={!file}
         onClick={()=>{if(sourcePlayerStep(0,list.length,-1)>=0)select();}}>◀◀</button>
       <button type="button" aria-label={state===SOURCE_PLAYER_STATES.Play?"Pause":"Play"}
         disabled={!file} onClick={()=>{void togglePlay();}}>
         {state===SOURCE_PLAYER_STATES.Play?"Ⅱ":"▶"}
       </button>
       <button type="button" aria-label="Next" disabled={!file}
         onClick={()=>{if(sourcePlayerStep(0,list.length,1)>=0)select();}}>▶▶</button>
       <button type="button" aria-label={muted?"Unmute":"Mute"}
         onClick={()=>setMuted(v=>!v)}>{muted||volume===0?"◖":"◖))"}</button>
       {showAll&&<input type="range" aria-label="Volume" min={0} max={100} step={1}
         value={volume} onChange={event=>setVolume(Number(event.target.value))}/>}
     </div>
   </footer>
   {openDialog&&createPortal(<div className="source-player__dialog-host">
     <VirtualFileDialog fileStore={fileStore} mode="open"
       fileTypes={INITIAL_OPEN_TYPES}
       onCancel={()=>setOpenDialog(false)} onSelected={loadFile}/>
   </div>,document.body)}
 </div>;
}

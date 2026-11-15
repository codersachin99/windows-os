import {useEffect,useMemo,useRef,useState,type KeyboardEvent} from "react";
import {fileStore,sourceFilesystemRuntime} from "@windows-os/sdk";
import {SourceCmdSession,SOURCE_CMD_BANNER,type SourceCmdResult,
  type SourceCmdColorStyle,sourceCmdApplyCompletion,
  type SourceCmdCompletionTarget,sourceCmdTrimEntries,
  sourceCmdInterruptedEntries} from "./model";
import "./source.css";
import "./CmdApp.css";

interface ActiveCmdCompletion{
  target:SourceCmdCompletionTarget;
  matches:string[];
  index:number;
  output:string;
}
interface CmdAppProps{
  onClose():void;
  onTitleChange(title:string):void;
  onLaunchProgram?(programId:string):boolean;
  onListWindows?():readonly {id:string;appId:string}[];
  onTerminateWindow?(windowId:string):void;
}
/**
 * Pinned source cmd.js window b894 / Ht: black monospace console, one
 * banner and per-command prompt/output rows, editable keyboard input and
 * command history. Remaining commands and terminal pixel parity pending.
 */
export function CmdApp({
  onClose,onTitleChange,onLaunchProgram,onListWindows,onTerminateWindow
}:CmdAppProps){
  const launchRef=useRef(onLaunchProgram);
  launchRef.current=onLaunchProgram;
  const listRef=useRef(onListWindows);
  listRef.current=onListWindows;
  const terminateRef=useRef(onTerminateWindow);
  terminateRef.current=onTerminateWindow;
  const [entries,setEntries]=useState<SourceCmdResult[]>([]);
  const pendingEntry=useRef<SourceCmdResult|null>(null);
  const keyResolver=useRef<((key:string)=>void)|null>(null);
  const [volume,setVolume]=useState(()=>sourceFilesystemRuntime.snapshot());
  useEffect(()=>sourceFilesystemRuntime.subscribe(setVolume),[]);
  const shell=useMemo(()=>{
    if(!volume)return null;
    const parent=volume.toUri("C:\\Users\\Guest");
    const initial=parent??volume.desktopPath;
    try{return new SourceCmdSession(fileStore,volume,initial,()=>new Date(),
      async message=>{
        if(!pendingEntry.current)return "";
        // Original Ht.submit shows the prompt before a key is read.
        setEntries(current=>current.map((entry,index)=>
          index===current.length-1
            ?{...entry,output:[...entry.output,message]}:entry
        ));
        return new Promise<string>(resolve=>{keyResolver.current=resolve;});
      },programId=>launchRef.current?.(programId)??false,
      ()=>listRef.current?.()??[],
      windowId=>terminateRef.current?.(windowId));}
    catch{return null;}
  },[volume]);
  const [input,setInput]=useState("");
  const [showBanner,setShowBanner]=useState(true);
  const [echo,setEcho]=useState(true);
  const [consoleStyle,setConsoleStyle]=useState<SourceCmdColorStyle|null>(null);
  const [prompt,setPrompt]=useState(shell?.prompt??"");
  const [busy,setBusy]=useState(false);
  // The pinned b894 Ht.runId guards transcript updates after Ctrl+C.
  // Interrupting is a UI cancellation, not a rollback of Guest VFS writes.
  const runId=useRef(0);
  const completion=useRef<ActiveCmdCompletion|null>(null);
  const completionRequest=useRef(0);
  const history=useRef<string[]>([]);
  const index=useRef(0);
  const inputRef=useRef<HTMLInputElement>(null);
  const scroll=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    completion.current=null;
    completionRequest.current++;
    setPrompt(shell?.prompt??"");
    setEcho(shell?.echoEnabled??true);
    inputRef.current?.focus();
  },[shell]);
  useEffect(()=>()=>{ // Unmount releases an outstanding PAUSE key wait.
    runId.current++;
    const release=keyResolver.current;
    keyResolver.current=null;
    release?.("");
  },[]);
  useEffect(()=>{
    const container=scroll.current;
    if(container)container.scrollTop=container.scrollHeight;
  },[entries,input]);
  const complete=async()=>{
    if(!shell||busy)return;
    const previous=completion.current;
    if(previous&&previous.output===input&&previous.matches.length){
      previous.index=(previous.index+1)%previous.matches.length;
      const next=sourceCmdApplyCompletion(previous.target,previous.matches[previous.index]);
      previous.output=next;
      setInput(next);
      return;
    }
    const request=++completionRequest.current;
    const found=await shell.complete(input);
    if(request!==completionRequest.current||
      inputRef.current?.value!==input||!found.matches.length)return;
    const next=sourceCmdApplyCompletion(found.target,found.matches[0]);
    completion.current={...found,index:0,output:next};
    setInput(next);
  };
  const execute=async()=>{
    // The in-flight ref is set before React renders readOnly/busy.
    // This closes the small between-commits keyboard race on rapid commands.
    if(!shell||pendingEntry.current)return;
    completion.current=null;
    completionRequest.current++;
    const text=input;
    if(text.trim()){
      history.current.push(text);
      if(history.current.length>100)history.current.shift();
    }
    index.current=history.current.length;
    const token=++runId.current;
    // Source Ht.submit() adds the command row before the execution promise.
    // This gives an in-flight Ctrl+C a real row to append ^C to.
    const pending:SourceCmdResult={
      prompt:shell.echoEnabled?shell.prompt:"",
      input:text,output:[],echo:shell.echoEnabled,errorlevel:shell.errorlevel
    };
    pendingEntry.current=pending;
    setEntries(current=>sourceCmdTrimEntries([...current,pending]));
    setBusy(true);
    setInput("");
    try{
      const result=await shell.run(text);
      if(token!==runId.current)return;
      // PAUSE may have replaced the pending row reference while waiting.
      setEntries(current=>result.clear?[]:current.map((item,index)=>
        index===current.length-1?result:item
      ));
      if(result.clear)setShowBanner(false);
      if(result.title!==undefined)onTitleChange(result.title||"Command Prompt");
      if(result.style!==undefined)setConsoleStyle(result.style);
      setPrompt(shell.prompt);
      setEcho(result.echo);
      if(result.exit){onClose();return;}
    }catch(cause){
      if(token!==runId.current)return;
      setEntries(current=>current.map((item,index)=>
        index===current.length-1?{
          ...pending,output:[cause instanceof Error?cause.message:"Command failed"],
          errorlevel:1
        }:item));
    }finally{
      if(token===runId.current){
        pendingEntry.current=null;
        setBusy(false);
        inputRef.current?.focus();
      }
    }
  };
  const interrupt=()=>{
    if(!shell)return;
    // b894: cancel display of pending source output. Ongoing VFS
    // operations cannot be interrupted atomically, and may still finish.
    // React's busy state is only for the readonly/visual UI. The synchronous
    // ref is the authoritative running state: Ctrl+C must not produce an idle
    // row while a PAUSE prompt is visible but state render is lagging.
    const running=pendingEntry.current!==null;
    runId.current++;
    const release=keyResolver.current;
    keyResolver.current=null;
    release?.("");
    pendingEntry.current=null;
    completion.current=null;
    completionRequest.current++;
    setEntries(current=>sourceCmdInterruptedEntries(current,{
      busy:running,prompt:shell.prompt,input,
      echo:shell.echoEnabled,errorlevel:shell.errorlevel
    }));
    setInput("");
    setBusy(false);
    index.current=history.current.length;
    inputRef.current?.focus();
  };
  const onKeyDown=(event:KeyboardEvent<HTMLInputElement>)=>{
    if(event.key.toLowerCase()==="c"&&(event.ctrlKey||event.metaKey)){
      const selection=window.getSelection();
      // A running command's Ctrl+C must always interrupt even if a prior
      // selection still exists (including an active PAUSE key wait).
      // At the idle prompt, preserve the pinned source copy-selection rule.
      if(!pendingEntry.current&&selection&&!selection.isCollapsed)return;
      event.preventDefault();
      interrupt();
      return;
    }
    if(keyResolver.current){
      event.preventDefault();
      const release=keyResolver.current;
      keyResolver.current=null;
      release(event.key);
      return;
    }
    if(event.key!=="Tab"){
      completion.current=null;
      completionRequest.current++;
    }
    if(event.key==="Tab"){event.preventDefault();void complete();}
    else if(event.key==="Escape"){event.preventDefault();setInput("");}
    else if(event.key==="Enter"){event.preventDefault();void execute();}
    else if(event.key==="ArrowUp"){
      event.preventDefault();
      if(index.current>0){
        index.current--;
        setInput(history.current[index.current]??"");
      }
    }else if(event.key==="ArrowDown"){
      event.preventDefault();
      if(index.current<history.current.length)index.current++;
      setInput(history.current[index.current]??"");
    }
  };
  return <div className="cmd__body" data-test-cmd-container=""
    style={consoleStyle??undefined} onClick={()=>inputRef.current?.focus()} ref={scroll}>
    {showBanner&&<div className="cmd__banner">{SOURCE_CMD_BANNER.join("\n")}</div>}
    {entries.map((entry,i)=><div key={i} className="cmd__entry" data-test-cmd-entry="">
      <div className="cmd__line" data-test-cmd-line="">{entry.prompt+entry.input}</div>
      {entry.output.length>0&&<div className="cmd__output"
        data-test-cmd-output="">{entry.output.join("\n")}</div>}
    </div>)}
    {shell?<div className="cmd__line cmd__input-line" data-test-cmd-line="">
      {echo&&!busy&&<span className="cmd__prompt">{prompt}</span>}
      <input ref={inputRef} data-test-cmd-input="" aria-label="Command Prompt input"
        className="cmd__input" value={input} readOnly={busy}
        onChange={e=>{
          completion.current=null;
          completionRequest.current++;
          setInput(e.target.value);
        }} onKeyDown={onKeyDown}
        autoComplete="off" spellCheck={false}/>
    </div>:<p role="alert">The original Guest filesystem is not mounted.</p>}
  </div>;
}

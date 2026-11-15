import {useEffect,useMemo,useRef,useState,type KeyboardEvent} from "react";
import {fileStore,sourceFilesystemRuntime} from "@windows-os/sdk";
import {SourceCmdSession,SOURCE_CMD_BANNER,type SourceCmdResult,
  type SourceCmdColorStyle,sourceCmdApplyCompletion,
  type SourceCmdCompletionTarget} from "./model";
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
}
/**
 * Pinned source cmd.js window b894 / Ht: black monospace console, one
 * banner and per-command prompt/output rows, editable keyboard input and
 * command history. Remaining commands and terminal pixel parity pending.
 */
export function CmdApp({onClose,onTitleChange}:CmdAppProps){
  const [volume,setVolume]=useState(()=>sourceFilesystemRuntime.snapshot());
  useEffect(()=>sourceFilesystemRuntime.subscribe(setVolume),[]);
  const shell=useMemo(()=>{
    if(!volume)return null;
    const parent=volume.toUri("C:\\Users\\Guest");
    const initial=parent??volume.desktopPath;
    try{return new SourceCmdSession(fileStore,volume,initial);}
    catch{return null;}
  },[volume]);
  const [input,setInput]=useState("");
  const [entries,setEntries]=useState<SourceCmdResult[]>([]);
  const [showBanner,setShowBanner]=useState(true);
  const [echo,setEcho]=useState(true);
  const [consoleStyle,setConsoleStyle]=useState<SourceCmdColorStyle|null>(null);
  const [prompt,setPrompt]=useState(shell?.prompt??"");
  const [busy,setBusy]=useState(false);
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
    if(!shell||busy)return;
    completion.current=null;
    completionRequest.current++;
    const text=input;
    if(text.trim()){
      history.current.push(text);
      if(history.current.length>100)history.current.shift();
    }
    index.current=history.current.length;
    setBusy(true);
    setInput("");
    try{
      const result=await shell.run(text);
      setEntries(current=>result.clear?[]:[...current,result]);
      if(result.clear)setShowBanner(false);
      if(result.title!==undefined)onTitleChange(result.title||"Command Prompt");
      if(result.style!==undefined)setConsoleStyle(result.style);
      setPrompt(shell.prompt);
      setEcho(result.echo);
      if(result.exit){onClose();return;}
    }catch(cause){
      setEntries(current=>[...current,{
        prompt:shell.prompt,input:text,
        output:[cause instanceof Error?cause.message:"Command failed"],
        echo:shell.echoEnabled,errorlevel:1
      }]);
    }finally{
      setBusy(false);
      inputRef.current?.focus();
    }
  };
  const onKeyDown=(event:KeyboardEvent<HTMLInputElement>)=>{
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

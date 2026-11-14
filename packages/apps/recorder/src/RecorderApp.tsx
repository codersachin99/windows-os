import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fileStore } from "@windows-os/sdk";
import { VirtualFileDialog } from "@windows-os/apps/shared";
import { encodeSourceWave, sourceRecorderTime } from "./wav";
import "./RecorderApp.css";

export interface RecorderAppProps {
  onClose(): void;
  onRegisterClose?(handler:()=>void):()=>void;
}

type RecorderPhase = "idle" | "requesting" | "recording" | "processing" | "saving";

/**
 * Pinned legacy-win7/src/modules/apps/recorder.js (webpack 01ef):
 * Start/Stop -> MediaRecorder audio -> WAV conversion -> source WAV-only Save As.
 * Never requests a microphone until Start is clicked; all data stays in the
 * browser/permissioned virtual filesystem. The shell owns window chrome.
 */
export function RecorderApp({ onClose, onRegisterClose }: RecorderAppProps) {
  const [phase,setPhase] = useState<RecorderPhase>("idle");
  const [error,setError] = useState("");
  const [seconds,setSeconds] = useState(0);
  const [level,setLevel] = useState(0);
  const [wave,setWave] = useState<Uint8Array|null>(null);
  const [fileName] = useState(()=>String(Date.now()));
  const recorderRef=useRef<MediaRecorder|null>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const visualContextRef=useRef<AudioContext|null>(null);
  const frameRef=useRef<number|null>(null);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const chunksRef=useRef<Blob[]>([]);
  const closedRef=useRef(false);

  const stopResources=useCallback(()=>{
    if(timerRef.current!==null){clearInterval(timerRef.current);timerRef.current=null;}
    if(frameRef.current!==null){cancelAnimationFrame(frameRef.current);frameRef.current=null;}
    if(visualContextRef.current){
      void visualContextRef.current.close().catch(()=>{});
      visualContextRef.current=null;
    }
    if(streamRef.current){
      for(const track of streamRef.current.getTracks())track.stop();
      streamRef.current=null;
    }
    setLevel(0);
    setSeconds(0);
  },[]);

  useEffect(()=>{
    closedRef.current=false;
    return ()=>{
      closedRef.current=true;
      const recorder=recorderRef.current;
      recorderRef.current=null;
      if(recorder && recorder.state!=="inactive"){
        recorder.onstop=null;
        recorder.ondataavailable=null;
        recorder.stop();
      }
      if(timerRef.current!==null){clearInterval(timerRef.current);timerRef.current=null;}
      if(frameRef.current!==null){cancelAnimationFrame(frameRef.current);frameRef.current=null;}
      if(visualContextRef.current){
        void visualContextRef.current.close().catch(()=>{});
        visualContextRef.current=null;
      }
      for(const track of streamRef.current?.getTracks()??[])track.stop();
      streamRef.current=null;
    };
  },[]);

  const measure=(stream:MediaStream)=>{
    // Source audio FFT size is 32. The analyser is optional: recording remains
    // functional if the current browser does not expose WebAudio metering.
    try{
      const context=new AudioContext();
      const analyzer=context.createAnalyser();
      analyzer.fftSize=32;
      context.createMediaStreamSource(stream).connect(analyzer);
      visualContextRef.current=context;
      const bins=new Uint8Array(analyzer.frequencyBinCount);
      const frame=()=>{
        if(closedRef.current)return;
        analyzer.getByteFrequencyData(bins);
        const sum=bins.reduce((total,value)=>total+value,0);
        setLevel(Math.min(100,Math.round(sum/(2*bins.length))));
        frameRef.current=requestAnimationFrame(frame);
      };
      frame();
    }catch{
      // Unsupported/invalid meter never grants extra permissions or blocks WAV.
    }
  };

  const processCapture=async(blobs:readonly Blob[])=>{
    try{
      if(blobs.length===0)throw new Error("The microphone returned no audio.");
      const encoded=new Blob(blobs,{type:blobs[0].type||"audio/webm"});
      const context=new AudioContext();
      let decoded:AudioBuffer;
      try{
        decoded=await context.decodeAudioData(await encoded.arrayBuffer());
      }finally{
        await context.close().catch(()=>{});
      }
      const bytes=encodeSourceWave(decoded);
      if(closedRef.current)return;
      setWave(bytes);
      setPhase("saving");
    }catch(cause){
      if(closedRef.current)return;
      setError(cause instanceof Error?cause.message:"Unable to convert recording to WAV");
      setPhase("idle");
    }
  };

  const start=async()=>{
    if(phase!=="idle"||wave)return;
    setError("");
    setPhase("requesting");
    setSeconds(0);
    if(!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder==="undefined"){
      setError("Microphone is not supported on this device");
      setPhase("idle");
      return;
    }
    let stream:MediaStream|null=null;
    try{
      // Source getUserMedia: audio true, video false.
      stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
      if(closedRef.current){
        for(const track of stream.getTracks())track.stop();
        return;
      }
      streamRef.current=stream;
      const preferred="audio/webm";
      const opts=MediaRecorder.isTypeSupported?.(preferred)
        ? {mimeType:preferred} : undefined;
      const recorder=new MediaRecorder(stream,opts);
      recorderRef.current=recorder;
      chunksRef.current=[];
      recorder.ondataavailable=(event)=>{
        if(event.data.size>0)chunksRef.current.push(event.data);
      };
      recorder.onstop=()=>{
        recorderRef.current=null;
        stopResources();
        if(closedRef.current)return;
        const blobs=chunksRef.current;
        chunksRef.current=[];
        void processCapture(blobs);
      };
      recorder.onerror=()=>{
        recorderRef.current=null;
        stopResources();
        if(!closedRef.current){
          setError("Microphone recording failed.");
          setPhase("idle");
        }
      };
      recorder.start();
      setPhase("recording");
      timerRef.current=setInterval(()=>setSeconds(n=>n+1),1000);
      measure(stream);
    }catch(cause){
      for(const track of stream?.getTracks()??[])track.stop();
      recorderRef.current=null;
      stopResources();
      if(closedRef.current)return;
      setError(cause instanceof Error?cause.message:"Microphone access was denied.");
      setPhase("idle");
    }
  };

  const stop=()=>{
    if(phase!=="recording")return;
    setPhase("processing");
    const recorder=recorderRef.current;
    if(recorder && recorder.state!=="inactive"){
      recorder.stop();
    }else{
      stopResources();
      setError("No active microphone recording.");
      setPhase("idle");
    }
  };

  const close=useCallback(()=>{
    if(phase==="saving"||phase==="processing")return;
    closedRef.current=true;
    const recorder=recorderRef.current;
    if(recorder && recorder.state!=="inactive"){
      recorder.onstop=null;
      recorder.ondataavailable=null;
      recorder.stop();
    }
    recorderRef.current=null;
    stopResources();
    onClose();
  },[onClose,phase,stopResources]);
  useEffect(()=>{
    if(!onRegisterClose)return;
    return onRegisterClose(close);
  },[onRegisterClose,close]);

  const saveWav=async(path:string)=>{
    if(!wave)throw new Error("No recorded audio to save.");
    if(!/\.wav$/i.test(path))throw new Error("Sound Recorder saves Waveform Audio Files (*.wav).");
    await fileStore.writeBytes(wave,path);
    setWave(null);
    setPhase("idle");
  };
  const cancelSave=()=>{
    setWave(null);
    setPhase("idle");
  };

  return <div className="source-recorder" data-test-recorder="">
    <button type="button" className={"source-recorder__button"+(phase==="recording"?" is-recording":"")}
      onClick={()=>{if(phase==="recording")stop();else void start();}}
      disabled={phase!=="idle"&&phase!=="recording"}
      data-test-recorder-toggle="">
      {phase==="recording"?"Stop":"Start"}
    </button>
    <output className="source-recorder__clock" aria-label="Recording duration"
      data-test-recorder-clock="">{sourceRecorderTime(seconds)}</output>
    <progress className="source-recorder__meter" aria-label="Microphone level"
      value={level} max={100}/>
    <button type="button" disabled className="source-recorder__help" title="Help"
      aria-label="Help">?</button>

    {phase==="processing"&&<span className="source-recorder__status" role="status">
      Processing recording...
    </span>}
    {error&&<div className="source-recorder__error-overlay">
      <div role="alertdialog" aria-label="Sound Recorder error">
        <p>{error}</p>
        <button type="button" onClick={()=>setError("")}>Close</button>
      </div>
    </div>}
    {phase==="saving"&&wave&&createPortal(
      <div className="source-recorder__dialog-host" data-test-recorder-save="">
        <VirtualFileDialog fileStore={fileStore} mode="save"
          suggestedName={fileName}
          fileTypes={[{extension:"wav",label:"Waveform Audio File (*.wav)"}]}
          onCancel={cancelSave} onSelected={saveWav}/>
      </div>,document.body)}
  </div>;
}

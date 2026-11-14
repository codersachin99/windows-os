import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fileStore } from "@windows-os/sdk";
import { VirtualFileDialog } from "@windows-os/apps/shared";
import {
  SOURCE_CAMERA_RESOLUTION, SOURCE_CAMERA_FORMAT, SOURCE_CAMERA_QUALITY,
  SOURCE_CAMERA_TYPES, sourceCameraConstraints, sourceCameraCaptureDimensions
} from "./model";
import "./CameraApp.css";

export interface CameraAppProps {
  onClose():void;
  onRegisterClose?(handler:()=>void):()=>void;
}

/** Pinned legacy-win7 camera.js (webpack 2164): on-mount 1280×720
 * getUserMedia, front/rear switch, JPEG capture at quality 100%, static
 * information dialog, JPEG-only Save As. Camera access is never privileged:
 * it uses the browser's own permissioned media API and the virtual file store.
 */
export function CameraApp({onClose,onRegisterClose}:CameraAppProps){
  const videoRef=useRef<HTMLVideoElement|null>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const generation=useRef(0);
  const closed=useRef(false);
  const [front,setFront]=useState(true);
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [showConfig,setShowConfig]=useState(false);
  const [image,setImage]=useState<Uint8Array|null>(null);
  const [fileName]=useState(()=>Date.now().toString());

  const clearStream=useCallback(()=>{
    const element=videoRef.current;
    if(element){element.pause();element.srcObject=null;element.onloadedmetadata=null;}
    const stream=streamRef.current;
    streamRef.current=null;
    if(stream)for(const track of stream.getTracks())track.stop();
    setReady(false);
  },[]);

  // Source getCamera() runs on mount and after each facing-mode toggle.
  // The generation token also prevents a late permission resolution from
  // resurrecting a camera after switch or window close.
  useEffect(()=>{
    closed.current=false;
    const id=++generation.current;
    clearStream();
    setBusy(true);
    setError("");
    const start=async()=>{
      if(!navigator.mediaDevices?.getUserMedia){
        setBusy(false);
        setError("Camera is not supported on this device");
        return;
      }
      let stream:MediaStream|null=null;
      try{
        stream=await navigator.mediaDevices.getUserMedia(sourceCameraConstraints(front));
        if(closed.current || id!==generation.current){
          for(const track of stream.getTracks())track.stop();
          return;
        }
        streamRef.current=stream;
        const element=videoRef.current;
        if(!element)throw new Error("Camera preview is unavailable");
        element.srcObject=stream;
        element.onloadedmetadata=()=>{
          if(closed.current || id!==generation.current)return;
          void element.play().then(()=>{
            if(!closed.current && id===generation.current)setReady(true);
          }).catch(cause=>{
            if(closed.current || id!==generation.current)return;
            setError(cause instanceof Error?cause.message:"Cannot play camera preview");
          }).finally(()=>{
            if(!closed.current && id===generation.current)setBusy(false);
          });
        };
        // A stream without metadata cannot be captured until a real video
        // frame arrives; do not pretend it is ready.
      }catch(cause){
        if(stream)for(const track of stream.getTracks())track.stop();
        if(!closed.current && id===generation.current){
          streamRef.current=null;
          setBusy(false);
          setError(cause instanceof Error?cause.message:"Camera access denied");
        }
      }
    };
    void start();
    return ()=>{
      generation.current++;
      clearStream();
    };
  },[front,clearStream]);

  const captureImage=async()=>{
    if(!ready||busy||image || showConfig || error)return;
    const video=videoRef.current;
    const track=streamRef.current?.getVideoTracks()[0];
    if(!video||!track)return;
    setBusy(true);
    try{
      const dimensions=sourceCameraCaptureDimensions(track.getSettings(),video);
      const canvas=document.createElement("canvas");
      canvas.width=dimensions.width;
      canvas.height=dimensions.height;
      const ctx=canvas.getContext("2d");
      if(!ctx)throw new Error("Canvas is unavailable");
      ctx.drawImage(video,0,0,canvas.width,canvas.height);
      const jpeg=await new Promise<Blob>((resolve,reject)=>{
        canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("JPEG encoding failed")),
          "image/jpeg",SOURCE_CAMERA_QUALITY);
      });
      if(jpeg.type!=="image/jpeg")throw new Error("JPEG is not supported by this browser");
      const bytes=new Uint8Array(await jpeg.arrayBuffer());
      if(bytes[0]!==0xff||bytes[1]!==0xd8)
        throw new Error("Invalid JPEG image");
      if(!closed.current)setImage(bytes);
    }catch(cause){
      if(!closed.current)setError(cause instanceof Error?cause.message:"Cannot capture image");
    }finally{
      if(!closed.current)setBusy(false);
    }
  };

  const requestClose=useCallback(()=>{
    // Source WindowMain lock prevents close while save/config/error is shown.
    if(image || showConfig || error)return;
    closed.current=true;
    generation.current++;
    clearStream();
    onClose();
  },[image,showConfig,error,clearStream,onClose]);
  useEffect(()=>{
    if(!onRegisterClose)return;
    return onRegisterClose(requestClose);
  },[onRegisterClose,requestClose]);

  const save=async(path:string)=>{
    if(!image)throw new Error("No captured image");
    if(!/\.jpeg$/i.test(path))throw new Error("Camera saves JPEG files (*.jpeg)");
    await fileStore.writeBytes(image,path);
    setImage(null);
  };

  return <div className="source-camera" data-test-camera="">
    <div className="source-camera__preview">
      <video ref={videoRef} autoPlay muted playsInline
        aria-label="Live camera preview" data-test-camera-video=""/>
      {busy&&!ready&&<span role="status" className="source-camera__status">
        Opening camera...
      </span>}
    </div>
    <div className="source-camera__controls">
      <button type="button" className="source-camera__switch"
        aria-label="Switch camera" title="Switch camera"
        data-test-camera-switch=""
        disabled={busy||!!image||showConfig||!!error}
        onClick={()=>setFront(value=>!value)}>
        <span aria-hidden="true">⟳</span>
      </button>
      <button type="button" className="source-camera__capture"
        aria-label="Take photo" title="Take photo" data-test-camera-capture=""
        disabled={!ready||busy||!!image||showConfig||!!error}
        onClick={()=>{void captureImage();}}>
        <span aria-hidden="true">●</span>
      </button>
      <button type="button" className="source-camera__info"
        aria-label="Camera information" title="Camera information"
        disabled={!!image||!!error}
        onClick={()=>setShowConfig(true)}>
        <span aria-hidden="true">i</span>
      </button>
    </div>
    {error&&<div className="source-camera__error-backdrop">
      <section role="alertdialog" aria-label="Camera error">
        <p>{error}</p>
        <button type="button" onClick={()=>setError("")}>Close</button>
      </section>
    </div>}
    {showConfig&&createPortal(<div className="source-camera__dialog-host">
      <section className="source-camera__config" role="dialog"
        aria-modal="true" aria-label="Camera settings">
        <header>Camera <button type="button" aria-label="Close camera settings"
          onClick={()=>setShowConfig(false)}>×</button></header>
        <div className="source-camera__config-body">
          <dl>
            <div><dt>Resolution:</dt><dd>
              {SOURCE_CAMERA_RESOLUTION.width}x{SOURCE_CAMERA_RESOLUTION.height}</dd></div>
            <div><dt>Format:</dt><dd>{SOURCE_CAMERA_FORMAT}</dd></div>
            <div><dt>Quality:</dt><dd>100%</dd></div>
          </dl>
          <footer>
            <button type="button" onClick={()=>setShowConfig(false)}>OK</button>
            <button type="button" onClick={()=>setShowConfig(false)}>Cancel</button>
          </footer>
        </div>
      </section>
    </div>,document.body)}
    {image&&createPortal(<div className="source-camera__dialog-host" data-test-camera-save="">
      <VirtualFileDialog fileStore={fileStore} mode="save"
        suggestedName={fileName} fileTypes={SOURCE_CAMERA_TYPES}
        onCancel={()=>setImage(null)} onSelected={save}/>
    </div>,document.body)}
  </div>;
}

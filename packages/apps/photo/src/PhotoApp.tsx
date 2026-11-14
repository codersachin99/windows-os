import { useCallback, useEffect, useRef, useState } from "react";
import { fileStore } from "@windows-os/sdk";
import { getFileName, getParentDirectory, type FileEntry } from "@windows-os/filesystem";
import {
  sourcePhotoList, sourcePhotoNextPath, sourcePhotoMime,
  sourceWritablePhotoMime, sourcePhotoAngle
} from "./model";
import "./PhotoApp.css";

export interface PhotoAppProps {
  initialFilePath?: string;
  onTitleChange?(title: string): void;
  onClose?(): void;
  onRegisterClose?(handler: () => void): () => void;
}

/**
 * Pinned legacy-win7 photo.js (webpack 273a): File/Print/Email/Burn/Open
 * disabled menu, photo-only sibling listing, wrapped Prev/Next, fit, 90-degree
 * rotation, 100..800% zoom and 3-second slideshow. Uses the existing virtual
 * file store; never reads host files or opens user media without an image.
 */
export function PhotoApp({
  initialFilePath, onTitleChange, onClose, onRegisterClose
}: PhotoAppProps) {
  const [filePath,setFilePath] = useState(initialFilePath ?? "");
  const [src,setSrc] = useState("");
  const [files,setFiles] = useState<FileEntry[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [angle,setAngle] = useState(0);
  const [zoom,setZoom] = useState(100);
  const [fit,setFit] = useState(true);
  const [slide,setSlide] = useState(false);
  const [imageSize,setImageSize] = useState<{width:number;height:number}|null>(null);
  const [frameSize,setFrameSize] = useState<{width:number;height:number}|null>(null);
  const imageRef=useRef<HTMLImageElement|null>(null);
  const frameRef=useRef<HTMLDivElement|null>(null);
  const urlRef=useRef("");
  const loadEpoch=useRef(0);
  // Shell dispatch updates must not re-open the same file or reset rotation.
  const titleChanged=useRef(onTitleChange);
  titleChanged.current=onTitleChange;

  const load=useCallback(async (path:string)=>{
    const epoch=++loadEpoch.current;
    setLoading(true);
    setError("");
    try{
      const bytes=await fileStore.readBytes(path);
      const safeBytes=new Uint8Array(bytes.length);
      safeBytes.set(bytes);
      const newUrl=URL.createObjectURL(new Blob([safeBytes.buffer],{type:sourcePhotoMime(path)}));
      const listing=sourcePhotoList(await fileStore.list(getParentDirectory(path)));
      if(epoch!==loadEpoch.current){URL.revokeObjectURL(newUrl);return;}
      if(urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current=newUrl;
      setSrc(newUrl);
      setFilePath(path);
      setFiles(listing);
      setImageSize(null);
      setAngle(0);
      setZoom(100);
      setFit(true);
      titleChanged.current?.(getFileName(path));
    }catch(cause){
      if(epoch!==loadEpoch.current)return;
      setLoading(false);
      setError(cause instanceof Error?cause.message:"Unable to open photo");
    }
  },[]);

  useEffect(()=>{
    if(initialFilePath) void load(initialFilePath);
    return ()=>{++loadEpoch.current;if(urlRef.current){URL.revokeObjectURL(urlRef.current);urlRef.current="";}};
  },[initialFilePath,load]);

  useEffect(()=>{
    const node=frameRef.current;
    if(!node)return;
    const update=()=>{
      const {width,height}=node.getBoundingClientRect();
      setFrameSize({width,height});
    };
    update();
    const observer=new ResizeObserver(update);
    observer.observe(node);
    return ()=>observer.disconnect();
  },[]);

  const saveRotation=useCallback(async():Promise<boolean>=>{
    if(!angle)return true;
    const mime=sourceWritablePhotoMime(filePath);
    const img=imageRef.current;
    if(!mime || !img || !imageSize){
      setError("The original file format cannot be safely rotated and saved.");
      return false;
    }
    const sideways=Math.abs(angle)%180!==0;
    const canvas=document.createElement("canvas");
    canvas.width=sideways?imageSize.height:imageSize.width;
    canvas.height=sideways?imageSize.width:imageSize.height;
    const context=canvas.getContext("2d");
    if(!context){setError("Unable to edit this picture");return false;}
    context.translate(canvas.width/2,canvas.height/2);
    context.rotate(angle*Math.PI/180);
    context.drawImage(img,-imageSize.width/2,-imageSize.height/2,
      imageSize.width,imageSize.height);
    try{
      const blob=await new Promise<Blob>((resolve,reject)=>
        canvas.toBlob(value=>value?resolve(value):reject(new Error("Image encoding failed")),mime,0.92));
      if(blob.type!==mime){
        setError("Your browser cannot safely save this picture format.");
        return false;
      }
      await fileStore.writeBytes(new Uint8Array(await blob.arrayBuffer()),filePath);
      setAngle(0);
      return true;
    }catch(cause){
      setError(cause instanceof Error?cause.message:"Unable to save rotated picture");
      return false;
    }
  },[angle,filePath,imageSize]);

  const navigate=useCallback(async (delta:-1|1)=>{
    if(loading)return;
    const next=sourcePhotoNextPath(files,filePath,delta);
    if(!next)return;
    if(!await saveRotation())return;
    await load(next);
  },[files,filePath,loading,saveRotation,load]);

  const requestClose=useCallback(async()=>{
    if(!await saveRotation())return;
    setSlide(false);
    onClose?.();
  },[onClose,saveRotation]);
  useEffect(()=>{
    if(!onRegisterClose)return;
    return onRegisterClose(()=>{void requestClose();});
  },[onRegisterClose,requestClose]);

  useEffect(()=>{
    if(!slide)return;
    const interval=window.setInterval(()=>{void navigate(1);},3000);
    return ()=>window.clearInterval(interval);
  },[slide,navigate]);

  const toggleSlideshow=()=>{
    if(files.length<2)return;
    if(slide){
      setSlide(false);
      if(document.fullscreenElement===frameRef.current) void document.exitFullscreen().catch(()=>{});
    }else{
      setSlide(true);
      void frameRef.current?.requestFullscreen?.().catch(()=>{});
    }
  };

  const canNavigate=sourcePhotoNextPath(files,filePath,1)!==null;
  const hasExceedingSize=Boolean(imageSize && frameSize &&
    (imageSize.width>frameSize.width || imageSize.height>frameSize.height));
  const sideways=Math.abs(angle)%180!==0;
  const unfitWidth=imageSize && !fit
    ? (sideways?imageSize.height:imageSize.width)*zoom/100 : undefined;
  const unfitHeight=imageSize && !fit
    ? (sideways?imageSize.width:imageSize.height)*zoom/100 : undefined;

  return <div className="source-photo" data-test-photo-viewer="">
    <nav className="source-photo__menu" aria-label="Photo Viewer menu">
      {["File","Print","E-mail","Burn","Open"].map(label=>
        <button type="button" disabled key={label}>{label}</button>)}
    </nav>
    <div className={"source-photo__viewport"+(slide?" is-slideshow":"")}
      ref={frameRef} data-test-photo-stage=""
      onClick={()=>{if(slide)toggleSlideshow();}}>
      {loading&&<span className="source-photo__message">Please wait...</span>}
      {!src && !loading && <span className="source-photo__message">
        {error || "Open a picture from Computer to view it."}
      </span>}
      {src && <div className={"source-photo__canvas"+(fit?" is-fit":" is-actual")}>
        <img ref={imageRef} src={src} alt={getFileName(filePath)}
          data-test-photo-image=""
          style={{
            transform:"rotate("+angle+"deg)",
            width:unfitWidth,height:unfitHeight,
            maxWidth:fit?(sideways&&frameSize?frameSize.height:"100%"):undefined,
            maxHeight:fit?(sideways&&frameSize?frameSize.width:"100%"):undefined
          }}
          onLoad={event=>{
            const img=event.currentTarget;
            setImageSize({width:img.naturalWidth,height:img.naturalHeight});
            setLoading(false);
          }}
          onError={()=>{setImageSize(null);setLoading(false);setError("Unable to display picture");}}/>
      </div>}
    </div>
    {error&&src&&<div className="source-photo__error" role="alert">{error}</div>}
    <footer className="source-photo__footer">
      <fieldset className="source-photo__controls" disabled={loading}>
        <label className="source-photo__zoom" title="Zoom">
          <span aria-hidden="true">⌕</span>
          <input type="range" aria-label="Zoom" min={100} max={800} step={20}
            value={zoom} disabled={!src} onChange={event=>{
              setZoom(Number(event.target.value));setFit(false);
            }}/>
        </label>
        <button title={fit?"Actual size":"Fit to window"} aria-label={fit?"Actual size":"Fit to window"}
          disabled={!hasExceedingSize} onClick={()=>setFit(!fit)}>⛶</button>
        <button title="Previous picture" aria-label="Previous picture"
          disabled={!canNavigate} onClick={()=>{void navigate(-1);}}>◀◀</button>
        <button title="Play slide show" aria-label="Play slide show"
          disabled={!canNavigate} onClick={toggleSlideshow}>▣</button>
        <button title="Next picture" aria-label="Next picture"
          disabled={!canNavigate} onClick={()=>{void navigate(1);}}>▶▶</button>
        <button title="Rotate counterclockwise" aria-label="Rotate counterclockwise"
          disabled={!src} onClick={()=>setAngle(a=>sourcePhotoAngle(a,-90))}>↶</button>
        <button title="Rotate clockwise" aria-label="Rotate clockwise"
          disabled={!src} onClick={()=>setAngle(a=>sourcePhotoAngle(a,90))}>↷</button>
      </fieldset>
    </footer>
  </div>;
}

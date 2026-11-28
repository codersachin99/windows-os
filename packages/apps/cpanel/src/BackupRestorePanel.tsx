import {useRef,useState} from "react";
import {
  sourceCreateBackupArchive,sourceRestoreBackupArchive,
  type SourceBackupProgress,type VirtualFileStore
} from "@windows-os/filesystem";

interface LastBackup{
  timestamp:number;
  location:"Downloaded to your device";
  size:number;
  target:"all";
}
const KEY="windows-os:cpanel:last-backup:guest:v1";
function loadLastBackup():LastBackup|null{
  try{
    const raw=window.localStorage.getItem(KEY);
    if(!raw)return null;
    const value=JSON.parse(raw) as LastBackup;
    if(value?.location!=="Downloaded to your device"||value.target!=="all"||
      !Number.isFinite(value.timestamp)||!Number.isFinite(value.size))return null;
    return value;
  }catch{return null;}
}
function bytesLabel(bytes:number):string{
  if(bytes<1024)return bytes+" bytes";
  if(bytes<1048576)return (bytes/1024).toFixed(1)+" KB";
  return (bytes/1048576).toFixed(1)+" MB";
}
export interface BackupRestorePanelProps{
  filesystem:VirtualFileStore;
  onBack():void;
}
/** Original cpanel.js ue/Te and Pe/Ie/je: true browser ZIP interchange.
 * No host-disk or native system image permission is implied. */
export function BackupRestorePanel({filesystem,onBack}:BackupRestorePanelProps){
  const upload=useRef<HTMLInputElement>(null);
  const [lastBackup,setLastBackup]=useState<LastBackup|null>(loadLastBackup);
  const [pending,setPending]=useState(false);
  const [progress,setProgress]=useState<SourceBackupProgress|null>(null);
  const [result,setResult]=useState<{type:"success"|"error";message:string}|null>(null);
  const onProgress=(event:SourceBackupProgress)=>setProgress(event);
  const backup=async()=>{
    if(pending)return;
    setPending(true);setResult(null);setProgress(null);
    try{
      const data=await sourceCreateBackupArchive(filesystem,{onProgress});
      // Copy to a guaranteed ArrayBuffer before making a browser BlobPart.
      const bytes=new Uint8Array(new ArrayBuffer(data.archive.byteLength));
      bytes.set(data.archive);
      const url=URL.createObjectURL(new Blob([bytes.buffer],
        {type:"application/zip"}));
      try{
        const anchor=document.createElement("a");
        anchor.href=url;anchor.download=data.name;anchor.hidden=true;
        document.body.append(anchor);
        try{anchor.click();}finally{anchor.remove();}
      }finally{
        // Revoke after the browser has had an opportunity to start download.
        window.setTimeout(()=>URL.revokeObjectURL(url),60000);
      }
      const saved:LastBackup={
        timestamp:Date.now(),location:"Downloaded to your device",
        size:data.size,target:"all"
      };
      try{window.localStorage.setItem(KEY,JSON.stringify(saved));}
      catch{ /* Download succeeds even when browser blocks metadata storage. */ }
      setLastBackup(saved);
      setResult({type:"success",message:"A backup of your files has been created."});
    }catch(error){
      setResult({type:"error",message:error instanceof Error?error.message:String(error)});
    }finally{setPending(false);}
  };
  const restore=async(file:File)=>{
    if(pending)return;
    setPending(true);setResult(null);setProgress(null);
    try{
      if(!file.name.toLowerCase().endsWith(".zip"))
        throw new Error("Invalid backup file (unsupported type).");
      if(file.size>30*1024*1024)
        throw new Error("Invalid backup file (archive size).");
      const archive=new Uint8Array(await file.arrayBuffer());
      const {restored,skipped}=await sourceRestoreBackupArchive(filesystem,archive,{onProgress});
      setResult({
        type:"success",
        message:"Your files have been restored. ("+restored+" restored, "+skipped+" skipped)"
      });
    }catch(error){
      setResult({type:"error",message:error instanceof Error?error.message:String(error)});
    }finally{setPending(false);}
  };
  return <div className="windows-cpanel__backup" data-test-cpanel-backup="">
    <aside className="windows-cpanel__backup-sidebar">
      <button type="button" onClick={onBack}>Control Panel</button>
      <button type="button" disabled>Create a system image</button>
      <button type="button" disabled>Create a system repair disc</button>
    </aside>
    <div className="windows-cpanel__backup-content">
      <h2>Backup or restore your files</h2>
      {pending||result?<div className="windows-cpanel__backup-status"
        data-test-backup-status={result?.type??"in-progress"}
        role={result?.type==="error"?"alert":"status"}>
        <span>{result?.message??progress?.message??"Preparing backup"}</span>
        {pending?<progress value={progress?.percent??0} max={100}
          aria-label="Backup or restore progress"/>:null}
      </div>:null}
      <section className="windows-cpanel__backup-group">
        <h3>Backup</h3>
        <div className="windows-cpanel__backup-row">
          <div>
            {lastBackup?<div data-test-last-backup="">
              <p>Last backup: {new Date(lastBackup.timestamp).toLocaleString()}</p>
              <p>Location: {lastBackup.location}</p>
              <p>Contents: All files and folders</p>
              <p>Size: {bytesLabel(lastBackup.size)}</p>
            </div>:<p data-test-no-backup="">No backup has been created.</p>}
          </div>
          <button type="button" disabled={pending} data-test-backup-button=""
            onClick={()=>void backup()}>Back up now</button>
        </div>
      </section>
      <section className="windows-cpanel__backup-group">
        <h3>Restore</h3>
        <div className="windows-cpanel__backup-row">
          <p>Restore your files that were backed up on another location.</p>
          <button type="button" disabled={pending} data-test-restore-button=""
            onClick={()=>upload.current?.click()}>Restore files</button>
          <input ref={upload} hidden type="file" accept=".zip,application/zip"
            data-test-restore-upload="" aria-label="Choose backup ZIP"
            onChange={event=>{
              const file=event.currentTarget.files?.[0];
              event.currentTarget.value="";
              if(file)void restore(file);
            }}/>
        </div>
      </section>
    </div>
  </div>;
}

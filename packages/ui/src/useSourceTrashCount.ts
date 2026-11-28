import {useEffect,useState} from "react";
import {fileStore,sourceFilesystemRuntime} from "@windows-os/sdk";

/** Read only the mounted Guest trash, invalidating stale asynchronous reads. */
export function useSourceTrashCount(enabled=true){
  const [count,setCount]=useState(0);
  useEffect(()=>{
    if(!enabled){setCount(0);return;}
    let live=true,revision=0;
    const refresh=()=>{
      const token=++revision;
      const path=sourceFilesystemRuntime.snapshot()?.trashPath;
      if(!path){if(live)setCount(0);return;}
      void fileStore.list(path).then(entries=>{
        if(live&&token===revision)setCount(entries.length);
      }).catch(()=>{if(live&&token===revision)setCount(0);});
    };
    refresh();
    const unsubFiles=fileStore.subscribe(refresh);
    const unsubRuntime=sourceFilesystemRuntime.subscribe(refresh);
    return ()=>{live=false;revision++;unsubFiles();unsubRuntime();};
  },[enabled]);
  return count;
}

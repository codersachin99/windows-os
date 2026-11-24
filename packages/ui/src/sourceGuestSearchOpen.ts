import type {Dispatch} from "react";
import type {DesktopAction} from "@windows-os/contracts";
import {fileStore,appRegistry} from "@windows-os/sdk";
import {parseSourceShortcut,parseSourcePathShortcut,readSourceShortcutText,sourceExecutablePath,matchesSourceKind,sourcePrograms,type FileEntry} from "@windows-os/filesystem";

/** Shared Guest search result association boundary; originally used by Win8 Start. */
export async function openGuestSearchFile(dispatch:Dispatch<DesktopAction>,entry:FileEntry,depth=0):Promise<string|null>{
    if(depth>=8)return "Shortcut target contains too many redirects.";
    try{
      const actual=await fileStore.stat(entry.uri);
      if(!actual||actual.originalPath)return "Search result is no longer available.";
      const launch=(id:string,filePath?:string):string|null=>{
        const app=appRegistry.get(id);
        if(!app)return "The original "+id+" application has not been migrated yet.";
        dispatch({type:"OPEN_APP",app,...(filePath?{file:{path:filePath}}:{})});
        return null;
      };
      if(actual.type==="directory")return launch("computer",actual.uri);
      if(/\.txt$/i.test(actual.name))return launch("notepad",actual.uri);
      if(matchesSourceKind(actual,"picture"))return launch("photo",actual.uri);
      if(/\.(?:mp3|wav|ogg|oga|m4a|aac|flac|mp4|webm|ogv|mov|m4v|avi)$/i.test(actual.name))
        return launch("player",actual.uri);
      if(/\.lnk$/i.test(actual.name)){
        const contents=await readSourceShortcutText(fileStore,actual.uri);
        const target=parseSourcePathShortcut(contents);
        if(target){
          const resolved=await fileStore.stat(target.path);
          if(!resolved||resolved.originalPath)return "Shortcut target no longer exists.";
          return openGuestSearchFile(dispatch,resolved,depth+1);
        }
        const source=parseSourceShortcut(contents);
        return source?launch(source.exe):"The original Windows shortcut data is invalid.";
      }
      const installed=sourcePrograms.find(program=>sourceExecutablePath(program)===actual.uri);
      if(installed)return launch(installed.id);
      return "No original application association has been migrated for this file type.";
    }catch(cause){
      return cause instanceof Error?cause.message:"Could not open Guest search result.";
    }
  }

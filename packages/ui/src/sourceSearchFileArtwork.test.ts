import {expect,it} from "vitest";
import {sourceSearchFileArtwork} from "./sourceSearchFileArtwork";
import {sourceThemeFileIconArtwork} from "@windows-os/assets";
import type {FileEntry} from "@windows-os/filesystem";

const file=(name:string,type:FileEntry["type"]="file"):FileEntry=>({name,type,uri:"/Guest/"+name,size:0,mtime:0});
const store=(text:string,binary=false)=>({
  read:async()=>{if(binary)throw Error("binary");return text;},
  readBytes:async()=>new TextEncoder().encode(text)
});

it("uses the original themed file-type classifier for non-shortcuts",async()=>{
  expect(await sourceSearchFileArtwork(store(""),"win10",file("photo.png"))).toEqual(sourceThemeFileIconArtwork("win10","photo"));
  expect(await sourceSearchFileArtwork(store(""),"win10",file("Note.txt"))).toEqual(sourceThemeFileIconArtwork("win10","text"));
  expect(await sourceSearchFileArtwork(store(""),"win10",file("Folder","directory"))).toEqual(sourceThemeFileIconArtwork("win10","folder"));
});
it("reads a binary-uploaded shortcut's icon independently of its target",async()=>{
  const input=store(JSON.stringify({exe:"notepad",icon:"calc"}),true);
  expect(await sourceSearchFileArtwork(input,"win10",file("Custom.lnk"))).toEqual(sourceThemeFileIconArtwork("win10","file","calc"));
});
it("falls back safely for malformed shortcut JSON and unreadable bytes",async()=>{
  const expected=sourceThemeFileIconArtwork("win10","file","file");
  expect(await sourceSearchFileArtwork(store("{bad"),"win10",file("Broken.lnk"))).toEqual(expected);
  expect(await sourceSearchFileArtwork({read:async()=>{throw Error("missing");},readBytes:async()=>new Uint8Array([255])},"win10",file("Broken.lnk"))).toEqual(expected);
});

import {expect,it} from "vitest";
import type {FileEntry} from "@windows-os/filesystem";
import {sourceModernGroups,type SourceModernEntry} from "./sourceModernSearchGroups";
const entry=(key:string,kind:SourceModernEntry["kind"]="app"):SourceModernEntry=>({key,label:key,kind,icon:"",detail:"",open:()=>{}});
const home="/C/Users/Guest";
const file=(name:string,type:FileEntry["type"]="file",parent=home)=>({file:{uri:parent+"/"+name,name,type,mtime:0,size:0},entry:entry(name,"file")});
it("promotes only the highest-priority source match and retains group order",()=>{
  const groups=sourceModernGroups([entry("a"),entry("b")],[entry("display","setting")],[file("pic.png"),file("note.txt"),file("folder","directory"),file("track.mp3"),file("clip.mp4")],home);
  expect(groups.map(g=>[g.key,g.entries.map(e=>e.key)])).toEqual([["best",["a"]],["apps",["b"]],["settings",["display"]],["documents",["note.txt"]],["folders",["folder"]],["photos",["pic.png"]],["music",["track.mp3"]],["videos",["clip.mp4"]]]);
});
it("promotes a setting before a file and excludes only root library duplicates",()=>{
  const files=[file("Documents","directory"),file("Documents","directory",home+"/Desktop"),file("note.txt")];
  expect(sourceModernGroups([],[entry("display","setting")],files,home).map(g=>[g.key,g.entries.map(e=>e.key)])).toEqual([["best",["display"]],["documents",["note.txt"]],["folders",["Documents"]]]);
  expect(sourceModernGroups([],[],files,home).map(g=>[g.key,g.entries.map(e=>e.key)])).toEqual([["best",["Documents"]],["documents",["note.txt"]]]);
});
it("returns no groups for empty results",()=>expect(sourceModernGroups([],[],[],home)).toEqual([]));

import {describe,it,expect} from "vitest";
import type {DesktopWindow} from "@windows-os/contracts";
import {
  sourceTaskbarGroups,sourceTaskbarPreviewLeft,
  SOURCE_TASKBAR_FINAL_FEATURES,SOURCE_TASKBAR_PEEK_SHOW_DELAY_MS,
  SOURCE_TASKBAR_PEEK_HIDE_DELAY_MS
} from "./sourceTaskbarGroups";
const win=(appId:string,id:string):DesktopWindow=>({
  id,appId,title:id,icon:"",x:0,y:0,width:600,height:400,z:5,
  minimized:false,maximized:false
});
describe("final source taskbar app grouping and thumbnail geometry",()=>{
  it("uses final flags and source hover/hide timing",()=>{
    expect(SOURCE_TASKBAR_FINAL_FEATURES).toEqual({
      showStackedIcons:true,showPeekPreviews:true
    });
    expect(SOURCE_TASKBAR_PEEK_SHOW_DELAY_MS).toBe(200);
    expect(SOURCE_TASKBAR_PEEK_HIDE_DELAY_MS).toBe(450);
  });
  it("preserves pin order, groups unpinned app windows and keeps instances",()=>{
    const groups=sourceTaskbarGroups([
      win("notepad","notepad-1"),win("computer","computer-2"),
      win("notepad","notepad-3"),win("calc","calc-4")
    ],["computer","chrome"]);
    expect(groups.map(g=>[g.key,g.windows.length])).toEqual([
      ["pin:computer",1],["pin:chrome",0],["app:notepad",2],["app:calc",1]
    ]);
    expect(groups[2].windows.map(w=>w.id))
      .toEqual(["notepad-1","notepad-3"]);
  });
  it("supports a future showStackedIcons=false source config",()=>{
    const groups=sourceTaskbarGroups([
      win("notepad","notepad-1"),win("notepad","notepad-2")
    ],[],false);
    expect(groups.map(g=>g.key))
      .toEqual(["window:notepad-1","window:notepad-2"]);
  });
  it("clamps the preview to source desktop and narrow portrait edges",()=>{
    expect(sourceTaskbarPreviewLeft({left:90,width:48},1,1366)).toBe(10);
    expect(sourceTaskbarPreviewLeft({left:1300,width:48},2,1366))
      .toBe(1366-(220*2+8)-10);
    expect(sourceTaskbarPreviewLeft({left:150,width:44},3,320)).toBe(10);
  });
});

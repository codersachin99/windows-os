import { describe,expect,it } from "vitest";
import { appRegistry } from "@windows-os/sdk";
import { sourcePrograms } from "@windows-os/filesystem";
import { desktopReducer,initialDesktopState } from "@windows-os/engine";
import {
  SOURCE_TASK_MANAGER_TABS,SOURCE_TASK_MANAGER_COLUMNS,
  sourceTaskManagerApplications,sourceTaskManagerProcesses,
  sourceTaskManagerCanEndTask,sourceTaskManagerCanEndProcess,
  sourceTaskManagerCanStartProcess
} from "./model";

function desktop() {
  return desktopReducer(desktopReducer(initialDesktopState(),
    {type:"BOOT_COMPLETE"}),{type:"GUEST_LOGIN"});
}
describe("pinned original Task Manager simulator model",()=>{
  it("preserves the source three tabs and four original source column sets",()=>{
    expect(SOURCE_TASK_MANAGER_TABS).toEqual(["apps","procs","services"]);
    expect(SOURCE_TASK_MANAGER_COLUMNS.apps).toEqual(["Task","Status"]);
    expect(SOURCE_TASK_MANAGER_COLUMNS.procs).toEqual(
      ["Image Name","User Name","Status","Memory"]);
    expect(SOURCE_TASK_MANAGER_COLUMNS.services).toEqual(
      ["Name","PID","Description","Status"]);
  });
  it("Applications reflects every live simulator window, including duplicate documents",()=>{
    const note=appRegistry.get("notepad")!;
    let state=desktop();
    state=desktopReducer(state,{type:"OPEN_APP",app:note});
    state=desktopReducer(state,{type:"OPEN_APP",app:note});
    const apps=sourceTaskManagerApplications(state.windows);
    expect(apps).toHaveLength(2);
    expect(apps.map(x=>x.name)).toEqual(["Notepad","Notepad"]);
    expect(apps.map(x=>x.status)).toEqual(["Running","Running"]);
    expect(apps[0].windowId).not.toBe(apps[1].windowId);
    state=desktopReducer(state,{type:"MINIMIZE_WINDOW",id:state.windows[0].id});
    expect(sourceTaskManagerApplications(state.windows)).toHaveLength(2);
  });
  it("original processes are exactly c170 exported non-hidden IDs, not host processes",()=>{
    const proc=sourceTaskManagerProcesses(desktop().windows);
    expect(proc.map(x=>x.id)).toEqual(
      sourcePrograms.filter(program=>!program.hidden).map(program=>program.id));
    expect(proc.find(x=>x.id==="taskmgr")).toBeUndefined();
    expect(proc.find(x=>x.id==="computer")).toBeUndefined();
    expect(proc.find(x=>x.id==="calc")).toMatchObject({
      imageName:"calc.exe",username:"Guest",status:"Stopped",memory:"0 MB"
    });
    expect(proc.find(x=>x.id==="paint")).toMatchObject({
      imageName:"paint.exe",status:"Stopped"
    });
  });
  it("Processes status tracks real registered windows and fixed source memory value",()=>{
    let state=desktop();
    state=desktopReducer(state,{type:"OPEN_APP",app:appRegistry.get("calc")!});
    const list=sourceTaskManagerProcesses(state.windows);
    expect(list.find(x=>x.id==="calc")).toMatchObject({
      username:"Guest",status:"Running",memory:"0 MB"
    });
    expect(list.find(x=>x.id==="notepad")?.status).toBe("Stopped");
    expect(list.every(x=>x.memory==="0 MB")).toBe(true);
  });
  it("End Task only accepts an existing selected window ID",()=>{
    const state=desktopReducer(desktop(),{type:"OPEN_APP",app:appRegistry.get("notepad")!});
    expect(sourceTaskManagerCanEndTask(state.windows,null)).toBe(false);
    expect(sourceTaskManagerCanEndTask(state.windows,"random")).toBe(false);
    expect(sourceTaskManagerCanEndTask(state.windows,state.windows[0].id)).toBe(true);
    const closed=desktopReducer(state,{type:"CLOSE_WINDOW",id:state.windows[0].id});
    expect(sourceTaskManagerCanEndTask(closed.windows,state.windows[0].id)).toBe(false);
  });
  it("Start Process only activates known, migrated, stopped, non-hidden source program IDs",()=>{
    const supported=new Set(appRegistry.list().map(x=>x.id));
    expect(sourceTaskManagerCanStartProcess([],null,supported)).toBe(false);
    expect(sourceTaskManagerCanStartProcess([],"calc",supported)).toBe(true);
    expect(sourceTaskManagerCanStartProcess([],"paint",supported)).toBe(false);
    expect(sourceTaskManagerCanStartProcess([],"taskmgr",supported)).toBe(false);
    expect(sourceTaskManagerCanStartProcess([],"/bin/sh",supported)).toBe(false);
    const running=desktopReducer(desktop(),{type:"OPEN_APP",app:appRegistry.get("calc")!});
    expect(sourceTaskManagerCanStartProcess(running.windows,"calc",supported)).toBe(false);
  });
  it("End Process only allows a real running source process, never invented host PIDs",()=>{
    const state=desktopReducer(desktop(),{type:"OPEN_APP",app:appRegistry.get("calc")!});
    expect(sourceTaskManagerCanEndProcess(state.windows,null)).toBe(false);
    expect(sourceTaskManagerCanEndProcess(state.windows,"calc")).toBe(true);
    expect(sourceTaskManagerCanEndProcess(state.windows,"paint")).toBe(false);
    expect(sourceTaskManagerCanEndProcess(state.windows,"taskmgr")).toBe(false);
    expect(sourceTaskManagerCanEndProcess(state.windows,"kernel32")).toBe(false);
  });
});

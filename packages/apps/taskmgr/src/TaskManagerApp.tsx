import { useState } from "react";
import type { DesktopWindow } from "@windows-os/contracts";
import { appRegistry } from "@windows-os/sdk";
import {
  SOURCE_TASK_MANAGER_COLUMNS, SOURCE_TASK_MANAGER_TABS,
  sourceTaskManagerApplications, sourceTaskManagerProcesses,
  sourceTaskManagerCanEndTask, sourceTaskManagerCanStartProcess,
  sourceTaskManagerCanEndProcess, type SourceTaskManagerTab
} from "./model";
import "./TaskManagerApp.css";

export interface TaskManagerAppProps {
  windows:readonly DesktopWindow[];
  onCloseWindow(windowId:string):void;
  onOpenProgram(programId:string):void;
}

/** Source taskmgr.js renders three tabs from the original simulator state:
 * Applications, Processes, Services. Its End Task / End Process calls are
 * mapped only to live WindowsOS window IDs, never to host OS process APIs.
 * Existing app close interception (e.g. Notepad's unsaved changes dialog)
 * remains in the shared shell onCloseWindow handler.
 */
export function TaskManagerApp({windows,onCloseWindow,onOpenProgram}:TaskManagerAppProps) {
  const [tab,setTab]=useState<SourceTaskManagerTab>("apps");
  const [selectedApp,setSelectedApp]=useState<string|null>(null);
  const [selectedProc,setSelectedProc]=useState<string|null>(null);
  const applications=sourceTaskManagerApplications(windows);
  const processes=sourceTaskManagerProcesses(windows);
  const migratedIds=new Set(appRegistry.list().map(app=>app.id));
  const canEndTask=sourceTaskManagerCanEndTask(windows,selectedApp);
  const canStartProc=sourceTaskManagerCanStartProcess(windows,selectedProc,migratedIds);
  const canEndProc=sourceTaskManagerCanEndProcess(windows,selectedProc);
  const selectedIsPending=selectedProc!==null
    && !migratedIds.has(selectedProc) && !canEndProc;

  const endTask=()=>{
    if(!canEndTask || selectedApp===null)return;
    const id=selectedApp;
    setSelectedApp(null);
    onCloseWindow(id);
  };
  const endProc=()=>{
    if(!canEndProc||selectedProc===null)return;
    // Original source uses fixed program IDs. The React shell can have
    // multiple document windows per program, so close one live instance;
    // process remains Running while another such window is still open.
    const live=windows.find(window=>window.appId===selectedProc);
    if(live)onCloseWindow(live.id);
  };
  const startProc=()=>{
    if(canStartProc && selectedProc!==null)onOpenProgram(selectedProc);
  };
  return <div className="windows-taskmgr" data-test-taskmgr="">
    <div role="tablist" aria-label="Task Manager sections"
      className="windows-taskmgr__tabs">
      {SOURCE_TASK_MANAGER_TABS.map(key=><button key={key} type="button"
        role="tab" aria-controls={"windows-taskmgr-panel-"+key}
        aria-selected={tab===key} tabIndex={tab===key?0:-1}
        data-test-taskmgr-tab={key}
        className={tab===key?"is-selected":""}
        onClick={()=>setTab(key)}>
        {key==="apps"?"Applications":key==="procs"?"Processes":"Services"}
      </button>)}
    </div>
    {tab==="apps"&&<section id="windows-taskmgr-panel-apps"
      role="tabpanel" aria-label="Applications" className="windows-taskmgr__panel">
      <div className="windows-taskmgr__scroll taskmgr__listview">
        <table aria-label="Running applications" className="windows-taskmgr__table">
          <thead><tr>{SOURCE_TASK_MANAGER_COLUMNS.apps.map(c=><th key={c}>{c}</th>)}</tr></thead>
          <tbody>{applications.map(app=><tr key={app.windowId}
            className={selectedApp===app.windowId?"is-active":""}
            data-test-taskmgr-app={app.appId} data-test-taskmgr-window-id={app.windowId}
            aria-selected={selectedApp===app.windowId}
            onClick={()=>setSelectedApp(app.windowId)}>
            <td><button className="windows-taskmgr__row-button"
              type="button" aria-label={"Select "+app.name}
              onClick={()=>setSelectedApp(app.windowId)}>
              <img src={app.icon} alt="" width={16} height={16}/>{app.name}
            </button></td><td>{app.status}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="windows-taskmgr__actions">
        <button type="button" disabled={!canEndTask} onClick={endTask}
          data-test-taskmgr-end-task="">End Task</button>
      </div>
    </section>}
    {tab==="procs"&&<section id="windows-taskmgr-panel-procs"
      role="tabpanel" aria-label="Processes" className="windows-taskmgr__panel">
      <div className="windows-taskmgr__scroll taskmgr__listview">
        <table aria-label="Source programs" className="windows-taskmgr__table">
          <thead><tr>{SOURCE_TASK_MANAGER_COLUMNS.procs.map(c=><th key={c}>{c}</th>)}</tr></thead>
          <tbody>{processes.map(proc=><tr key={proc.id}
            data-test-taskmgr-process={proc.id}
            aria-selected={selectedProc===proc.id}
            className={selectedProc===proc.id?"is-active":""}
            onClick={()=>setSelectedProc(proc.id)}>
            <td><button className="windows-taskmgr__row-button"
              type="button" aria-label={"Select "+proc.imageName}
              onClick={()=>setSelectedProc(proc.id)}>{proc.imageName}</button></td>
            <td>{proc.username}</td><td>{proc.status}</td><td>{proc.memory}</td>
          </tr>)}</tbody>
        </table>
      </div>
      {selectedIsPending&&<p className="windows-taskmgr__pending"
        data-test-taskmgr-pending="">Original program not yet migrated.</p>}
      <div className="windows-taskmgr__actions">
        <button type="button" disabled={!canStartProc} onClick={startProc}
          data-test-taskmgr-start-process="">Start Process</button>
        <button type="button" disabled={!canEndProc} onClick={endProc}
          data-test-taskmgr-end-process="">End Process</button>
      </div>
    </section>}
    {tab==="services"&&<section id="windows-taskmgr-panel-services"
      role="tabpanel" aria-label="Services" className="windows-taskmgr__panel">
      <div className="windows-taskmgr__scroll taskmgr__listview">
        <table aria-label="Services" className="windows-taskmgr__table">
          <thead><tr>{SOURCE_TASK_MANAGER_COLUMNS.services.map(c=><th key={c}>{c}</th>)}</tr></thead>
        </table>
        <p className="windows-taskmgr__empty">None</p>
      </div>
      <div className="windows-taskmgr__actions">
        <button type="button" disabled>Services...</button>
      </div>
    </section>}
  </div>;
}

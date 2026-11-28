import type { DesktopWindow } from "@windows-os/contracts";
import { sourcePrograms, sourceProgramsById } from "@windows-os/filesystem";

export type SourceTaskManagerTab = "apps" | "procs" | "services";
export const SOURCE_TASK_MANAGER_TABS:readonly SourceTaskManagerTab[]=[
  "apps","procs","services"
] as const;
export const SOURCE_TASK_MANAGER_COLUMNS=Object.freeze({
  apps:["Task","Status"] as const,
  procs:["Image Name","User Name","Status","Memory"] as const,
  services:["Name","PID","Description","Status"] as const
});

/** Original pinned taskmgr.js computed appItems maps the live simulator's
 * window list, including minimized/duplicate document windows.
 * There is deliberately no attempt to enumerate host operating-system tasks.
 */
export function sourceTaskManagerApplications(windows:readonly DesktopWindow[]) {
  return windows.map(window=>({
    windowId:window.id,
    appId:window.appId,
    name:sourceProgramsById.get(window.appId)?.name ?? window.title,
    status:"Running" as const,
    icon:window.icon
  }));
}
/** Original module c170 export "d" = source program IDs filtered by !hidden,
 * NOT the entire installed-program registry and not actual host processes.
 * The original Task Manager displays 0 MB as a fixed value in every row.
 */
export function sourceTaskManagerProcesses(windows:readonly DesktopWindow[]) {
  const running=new Set(windows.map(window=>window.appId));
  return sourcePrograms.filter(program=>!program.hidden).map(program=>({
    id:program.id,
    imageName:program.id+".exe",
    username:"Guest" as const,
    status:running.has(program.id)?"Running" as const:"Stopped" as const,
    memory:"0 MB" as const
  }));
}
export function sourceTaskManagerCanEndTask(
  windows:readonly DesktopWindow[],selectedWindowId:string|null
):boolean {
  return selectedWindowId!==null && windows.some(window=>window.id===selectedWindowId);
}
export function sourceTaskManagerCanStartProcess(
  windows:readonly DesktopWindow[],selectedId:string|null,
  migratedIds:ReadonlySet<string>
):boolean {
  return selectedId!==null && migratedIds.has(selectedId)
    && sourcePrograms.some(program=>program.id===selectedId&&!program.hidden)
    && !windows.some(window=>window.appId===selectedId);
}
export function sourceTaskManagerCanEndProcess(
  windows:readonly DesktopWindow[],selectedId:string|null
):boolean {
  return selectedId!==null
    && sourcePrograms.some(program=>program.id===selectedId&&!program.hidden)
    && windows.some(window=>window.appId===selectedId);
}

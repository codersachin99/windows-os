/**
 * Original legacy-win7@4e63290 taskbar-base.js (module "2ae5").
 * Keep its actual taskbar item and background menu order. Unimplemented
 * Properties/arrangement actions remain disabled rather than faked.
 */
export type SourceTaskbarAction =
  "open"|"pin"|"close"|"toolbar"|"cascade"|"stack"|"side"|
  "show-desktop"|"taskmgr"|"properties";
export interface SourceTaskbarMenuItem{
  id:SourceTaskbarAction;label:string;disabled:boolean;
}
export function sourceTaskbarItemMenu(
  pinned:boolean,running:boolean
):SourceTaskbarMenuItem[]{
  return [
    ...(!running?[{id:"open" as const,label:"Open",disabled:false}]:[]),
    {id:"pin",label:pinned?"Unpin from taskbar":"Pin to taskbar",disabled:false},
    ...(running?[{id:"close" as const,label:"Close window",disabled:false}]:[])
  ];
}
export function sourceTaskbarBackgroundMenu():SourceTaskbarMenuItem[]{
  return [
    {id:"toolbar",label:"Toolbars",disabled:true},
    {id:"cascade",label:"Cascade windows",disabled:true},
    {id:"stack",label:"Show windows stacked",disabled:true},
    {id:"side",label:"Show windows side by side",disabled:true},
    {id:"show-desktop",label:"Show desktop",disabled:false},
    {id:"taskmgr",label:"Start Task Manager",disabled:false},
    {id:"properties",label:"Properties",disabled:false}
  ];
}

/** Pinned legacy src/modules/system/main.js we.mounted() shortcuts:
 * alt+d Show desktop, alt+w Start, alt+e Computer, alt+r Run.
 * src/modules/shell/hotkey.js filter x() ignores editable inputs.
 * alt+l Switch view is a separate simulated logon-like screen,
 * preserving user session/windows; shift+tab is a source no-op. */
export type SourceDesktopShortcut="minimize-all"|"toggle-start"|"open-computer"|"open-run"|"switch-user";
export type SourceHotkeyEvent=Pick<KeyboardEvent,
  "key"|"altKey"|"ctrlKey"|"metaKey"|"shiftKey"|"target">;
export function sourceHotkeyAcceptsTarget(target:EventTarget|null):boolean{
  if(!target)return true;
  const node=target as {
    tagName?:string;isContentEditable?:boolean;readOnly?:boolean
  };
  if(node.isContentEditable)return false;
  const tag=node.tagName?.toUpperCase();
  return !((tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT")&&!node.readOnly);
}
export function sourceDesktopShortcut(event:SourceHotkeyEvent):SourceDesktopShortcut|null{
  if(!event.altKey||event.metaKey||event.ctrlKey||event.shiftKey
    ||!sourceHotkeyAcceptsTarget(event.target))return null;
  const key=event.key.toLowerCase();
  if(key==="d")return "minimize-all";
  if(key==="w")return "toggle-start";
  if(key==="e")return "open-computer";
  if(key==="r")return "open-run";
  if(key==="l")return "switch-user";
  return null;
}

/** Frozen window wrapper dcfced3e scope: alt+up/down/left/right/4. */
export type SourceWindowShortcut="maximize"|"minimize-or-restore"|"left"|"right"|"close";
export function sourceWindowShortcut(event:SourceHotkeyEvent):SourceWindowShortcut|null{
  if(!event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||!sourceHotkeyAcceptsTarget(event.target))return null;
  switch(event.key.toLowerCase()){
    case "arrowup":return "maximize";
    case "arrowdown":return "minimize-or-restore";
    case "arrowleft":return "left";
    case "arrowright":return "right";
    case "4":return "close";
    default:return null;
  }
}

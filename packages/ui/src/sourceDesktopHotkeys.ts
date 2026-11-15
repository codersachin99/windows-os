/** Pinned legacy src/modules/system/main.js we.mounted() shortcuts:
 * alt+d Show desktop, alt+w Start, alt+e Computer, alt+r Run.
 * src/modules/shell/hotkey.js filter x() ignores editable inputs.
 * alt+l needs original Switch view (not equivalent to LOG_OFF) and
 * shift+tab is an intentional no-op; neither is hijacked here. */
export type SourceDesktopShortcut="minimize-all"|"toggle-start"|"open-computer"|"open-run";
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
  return null;
}

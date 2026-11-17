/** Shared source DesktopMenu / ExplorerMenu keyboard roving focus.
 * The source menu has nested View/New commands. Disabled or hidden commands
 * must never receive focus. This module does not use the host OS.
 */
export function sourceMenuArrowIndex(
  current:number,count:number,key:"ArrowDown"|"ArrowUp"
):number{
  if(count<=0)return -1;
  if(current<0)return key==="ArrowDown"?0:count-1;
  return (current+(key==="ArrowDown"?1:-1)+count)%count;
}
export function sourceMenuArrowFocus(
  host:HTMLElement|null,target:EventTarget|null,key:string
):boolean{
  if(!host||(key!=="ArrowDown"&&key!=="ArrowUp"))return false;
  const options=Array.from(host.querySelectorAll<HTMLButtonElement>(
    'button[role="menuitem"]:not(:disabled),'+
    'button[role="menuitemradio"]:not(:disabled),'+
    'button[role="menuitemcheckbox"]:not(:disabled)'
  )).filter(button=>button.getClientRects().length>0);
  const active=target instanceof HTMLElement?target.closest("button"):null;
  const next=sourceMenuArrowIndex(options.indexOf(active as HTMLButtonElement),
    options.length,key);
  if(next<0)return false;
  options[next].focus({preventScroll:true});
  return true;
}

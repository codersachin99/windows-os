/**
 * Pinned legacy-win7 webpack 1902 in
 * shared~cpanel~startmenu-base~startmenu-chromeos~startmenu-kubuntu...
 * Source default delay is 300ms for non-empty typing; empty text publishes
 * synchronously. now(text) publishes only when different from last emission.
 *
 * The cancellation method mirrors Vue's destroyed() cleanup so stale timers
 * cannot update a Control Panel view after it unmounts.
 */
export const SOURCE_SEARCH_DEBOUNCE_MS=300;

export interface SourceDelayedSearch{
  type(text:string):void;
  now(text:string):boolean|undefined;
  cancel():void;
}
export function sourceCreateDelayedSearch(
  callback:(text:string)=>void,
  delay=SOURCE_SEARCH_DEBOUNCE_MS
):SourceDelayedSearch{
  let timer:ReturnType<typeof setTimeout>|undefined;
  let last="";
  const publish=(text:string)=>{
    last=text;
    callback(text);
  };
  return {
    type(text){
      if(timer!==undefined)clearTimeout(timer);
      if(text){
        timer=setTimeout(publish,delay,text);
      }else publish(text);
    },
    now(text){
      if(timer!==undefined)clearTimeout(timer);
      if(text!==last){
        publish(text);
        return true;
      }
      return undefined;
    },
    cancel(){
      if(timer!==undefined)clearTimeout(timer);
    }
  };
}

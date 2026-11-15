/** Pinned legacy-win7 src/modules/apps/cpanel.js a259/pa.
 * Source windowLocation/history uses a null root and a typed panel id.
 * Only Display's web behavior is implemented in this first slice. */
export type SourceControlPanelLocation=null|"display";
export interface SourceControlPanelHistory{
  readonly entries:readonly SourceControlPanelLocation[];
  readonly index:number;
}
export const SOURCE_CPANEL_INITIAL_HISTORY:SourceControlPanelHistory={
  entries:[null],index:0
};
export function sourceCpanelOpenLocation(
  previous:SourceControlPanelHistory, location:SourceControlPanelLocation
):SourceControlPanelHistory{
  if(previous.entries[previous.index]===location)return previous;
  return {
    entries:[...previous.entries.slice(0,previous.index+1),location],
    index:previous.index+1
  };
}
export function sourceCpanelStep(
  previous:SourceControlPanelHistory,delta:-1|1
):SourceControlPanelHistory{
  const index=previous.index+delta;
  if(index<0||index>=previous.entries.length)return previous;
  return {...previous,index};
}
export const SOURCE_CPANEL_ZOOM_CHOICES=[
  {value:"0.5",label:"70%"},{value:"0.6",label:"85%"},
  {value:"0.7",label:"100%"},{value:"0.85",label:"125%"},
  {value:"1",label:"150%"},{value:"1.25",label:"175%"},
  {value:"1.5",label:"200%"}
] as const;
export type SourceCpanelResolutionKind="fullscreen"|"4:3"|"16:10"|"16:9"|"21:9";
export const SOURCE_CPANEL_RESOLUTION_KINDS=[
  "fullscreen","4:3","16:10","16:9","21:9"
] as const;
export function sourceCpanelResolutions(width:number,height:number):{
  value:SourceCpanelResolutionKind;label:string
}[]{
  // Original Device2Web returns display as "height x width"; the source
  // Display panel swaps those two numbers before computing aspect ratios.
  const w=Math.max(1,Math.round(width)),h=Math.max(1,Math.round(height));
  return SOURCE_CPANEL_RESOLUTION_KINDS.map(value=>{
    if(value==="fullscreen")return {value,label:w+" x "+h+" (Fullscreen)"};
    const [a,b]=value.split(":").map(Number);
    const ratio=a/b;
    const text=w/ratio>h
      ?Math.round(h*ratio)+" x "+h
      :w+" x "+Math.round(w/ratio);
    return {value,label:text+" ("+value+")"};
  });
}
/** The upstream search uses shared indexing. A verified, narrow matching
 * subset is exposed until the original cross-panel index is ported. */
export function sourceCpanelDisplayMatch(query:string):boolean{
  const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return terms.length>0&&terms.every(term=>
    ["display","resolution","screen","zoom"].some(value=>value.includes(term)));
}

import type {SourceProgram} from "@windows-os/filesystem";

/** Pinned legacy-win7 src/modules/apps/cpanel.js a259/pa.
 * Source windowLocation/history uses a null root and six panel IDs;
 * category/program/setting entries are tracked separately in sourceRegistry. */
export type SourceControlPanelLocation=null|"display"|"programs"|"accounts"|"notification"|"action-center"|"backup";
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

/** Original cpanel.js ra program panel maps appItems/programItems to
 * sorted selectable rows. The current Guest's installed source executable
 * manifest is the only available installation truth; do not fabricate
 * package versions, dates or host-installed Windows applications. */
export interface SourceCpanelInstalledProgram{
  id:string;
  name:string;
  iconKey:string;
  version:string;
  type:string;
}
export function sourceCpanelInstalledPrograms(
  programs:readonly SourceProgram[]
):SourceCpanelInstalledProgram[]{
  return programs.filter(program=>Boolean(program.installPath)&&!program.hidden)
    .map(program=>({
      id:program.id,name:program.name,iconKey:program.id,
      version:"--",type:"Simulation"
    }))
    .sort((a,b)=>a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()));
}
export function sourceCpanelProgramsMatch(query:string):boolean{
  const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return terms.length>0&&terms.every(term=>
    ["programs","install","uninstall"].some(word=>word.includes(term)));
}

/** Source cpanel.js Kt.pageLinks() for user=null (Guest). The authenticated
 * controls are disabled upstream. Account listing depends on the not-yet-
 * migrated backend; it is visibly unavailable rather than fabricated. */
export interface SourceCpanelGuestAccountLink{
  id:"password"|"picture"|"name"|"link"|"delete"|"logoff"|"others";
  label:string;
  disabled:boolean;
}
export const SOURCE_CPANEL_GUEST_ACCOUNT_LINKS:readonly SourceCpanelGuestAccountLink[]=[
  {id:"password",label:"Change your password",disabled:true},
  {id:"picture",label:"Change your picture",disabled:true},
  {id:"name",label:"Change your account name",disabled:true},
  {id:"link",label:"Link your account",disabled:true},
  {id:"delete",label:"Delete your account",disabled:true},
  {id:"logoff",label:"Log off account",disabled:false},
  {id:"others",label:"View other accounts",disabled:true}
];
export function sourceCpanelAccountsMatch(query:string):boolean{
  const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return terms.length>0&&terms.every(term=>
    ["accounts","account","guest","user","password"].some(word=>word.includes(term)));
}

/** Source cpanel.js te/oe reads the Vuex notification history. This
 * migration's Guest session has no source notifications history provider yet,
 * so an empty array is the truthful state, not a fabricated "all clear"
 * security evaluation or invented system alert. */
export interface SourceControlPanelActionMessage{
  id:string;
  type:"success"|"info"|"warning"|"error";
  title:string;
  body:string;
}
export const SOURCE_CPANEL_ACTION_CENTER_TEXT={
  title:"Review recent messages and resolve problems",
  emptyInstruction:"Action Center has nothing to report.",
  hasMessagesInstruction:"Action Center has detected one or more issues for you to review.",
  empty:"No messages",
  changeSettings:"Change Action Center settings",
  archived:"View archived messages"
} as const;
export function sourceCpanelActionCenterMatch(query:string):boolean{
  const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return terms.length>0&&terms.every(term=>
    ["action","center","security","messages","problem"].some(word=>word.includes(term)));
}


/** Original Control Panel Backup & Restore is searchable as its own page. */
export function sourceCpanelBackupMatch(query:string):boolean{
  const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return terms.length>0&&terms.every(term=>
    ["backup","back up","restore","recovery","files"].some(word=>word.includes(term)));
}

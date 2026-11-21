/** Pinned original player.js webpack 9b15: initial state, kinds and controls. */
export const SOURCE_PLAYER_LIBRARIES=["music","videos","pictures"] as const;
export type SourcePlayerLibrary=typeof SOURCE_PLAYER_LIBRARIES[number];
export const SOURCE_PLAYER_STATES={Stop:0,Play:1,Pause:2} as const;
export type SourcePlayerState=typeof SOURCE_PLAYER_STATES[keyof typeof SOURCE_PLAYER_STATES];
export const SOURCE_PLAYER_INITIAL={
  library:"music" as SourcePlayerLibrary,showList:false,current:-1,
  currentTime:-1,duration:null as number|null,isRandom:false,isLoop:false,
  muted:false,volume:100,state:SOURCE_PLAYER_STATES.Stop
};
export type SourcePlayerKind=SourcePlayerLibrary;
const EXTENSIONS:Record<SourcePlayerKind,readonly string[]>={
  music:["mp3","wav","ogg","oga","m4a","aac","flac"],
  videos:["mp4","webm","ogv","mov","m4v","avi"],
  pictures:["png","jpg","jpeg","bmp","gif","webp"]
};
export function sourcePlayerKind(name:string):SourcePlayerKind|null{
  const ext=name.split(".").pop()?.toLowerCase()??"";
  for(const kind of SOURCE_PLAYER_LIBRARIES)if(EXTENSIONS[kind].includes(ext))return kind;
  return null;
}
export function sourcePlayerMime(name:string):string|null{
  const ext=name.split(".").pop()?.toLowerCase();
  if(!ext)return null;
  const mimes:Record<string,string>={
    mp3:"audio/mpeg",wav:"audio/wav",ogg:"audio/ogg",oga:"audio/ogg",m4a:"audio/mp4",
    aac:"audio/aac",flac:"audio/flac",mp4:"video/mp4",webm:"video/webm",
    ogv:"video/ogg",mov:"video/quicktime",m4v:"video/mp4",avi:"video/x-msvideo",
    png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",bmp:"image/bmp",gif:"image/gif",webp:"image/webp"
  };
  return mimes[ext]??null;
}
export function sourcePlayerClock(value:number|null):string|null{
  // Source player.js 9b15 helper g(): null for unset/zero, HH:MM:SS if >=1 hour.
  if(!value||!Number.isFinite(value)||value<0)return null;
  const seconds=Math.floor(value),hours=Math.floor(seconds/3600);
  const minutes=Math.floor((seconds-hours*3600)/60),rest=seconds-hours*3600-minutes*60;
  const pad=(part:number)=>String(part).padStart(2,"0");
  return (hours===0?"":pad(hours)+":")+pad(minutes)+":"+pad(rest);
}
export function sourcePlayerStep(current:number,count:number,delta:-1|1):number{
  if(count<=0)return -1;
  return (current+delta+count)%count;
}
export function sourcePlayerEffectiveVolume(local:number,system=100):number{
  return Math.max(0,Math.min(1,(local/100)*(system/100)));
}
export function sourcePlayerShowsAllControls(width:number):boolean{
  return width>=400;
}

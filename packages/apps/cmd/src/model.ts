import {
  resolveWindowsPath,matchFilePattern,getParentDirectory,getFileName,
  type FileEntry,type LegacyVolumeSession,type VirtualFileStore
} from "@windows-os/filesystem";

/**
 * First runnable vertical slice of original cmd.js Tt shell / te, Te, ot.
 * Source CMD uses a Windows-path working directory and the *real* mounted
 * explorer filesystem. Remaining original commands/pipes/batch files are
 * explicitly pending: never pretend to implement or execute a host shell.
 */
export interface SourceCmdResult {
  prompt:string;
  input:string;
  output:string[];
  clear?:boolean;
  exit?:boolean;
  title?:string;
  echo:boolean;
  errorlevel:number;
  /** Original COLOR host.setStyle: undefined means unchanged; null resets. */
  style?:SourceCmdColorStyle|null;
}
export interface SourceCmdColorStyle{
  backgroundColor:string;
  color:string;
}
type CmdFilesystem=Pick<VirtualFileStore,"stat"|"list"|"read"|"write"|"mkdir"|"remove"|"removeTree"|"move"|"copy">;
type CmdVolume=Pick<LegacyVolumeSession,"toUri"|"toWindowsPath"|"pathConfig">;

/** Original b894 Ht.trim(): 300 visible CMD transcript entries. */
export const SOURCE_CMD_MAX_TRANSCRIPT_ENTRIES=300;
export function sourceCmdTrimEntries<T>(entries:readonly T[]):T[]{
  return entries.length>SOURCE_CMD_MAX_TRANSCRIPT_ENTRIES
    ?entries.slice(-SOURCE_CMD_MAX_TRANSCRIPT_ENTRIES):[...entries];
}

/** Original b894 Ht.interrupt(): idle Ctrl+C prints the current input
 * followed by ^C; an active submission appends ^C to its last output.
 * The transcript mutation is pure and never cancels or rolls back VFS I/O. */
export function sourceCmdInterruptedEntries(
  entries:readonly SourceCmdResult[],
  state:{busy:boolean;prompt:string;input:string;echo:boolean;errorlevel:number}
):SourceCmdResult[]{
  if(state.busy&&entries.length){
    const latest=entries[entries.length-1];
    return sourceCmdTrimEntries([
      ...entries.slice(0,-1),
      {...latest,output:[...latest.output,"^C"]}
    ]);
  }
  return sourceCmdTrimEntries([...entries,{
    prompt:state.prompt,input:state.input+"^C",output:[],
    echo:state.echo,errorlevel:state.errorlevel
  }]);
}

export const SOURCE_CMD_BANNER=[
  "Microsoft Windows [Version 6.1.7600]",
  "Copyright (c) 2009 Microsoft Corporation. All rights reserved."
] as const;

export const SOURCE_CMD_HELP:Readonly<Record<string,string>>={
  cd:"Displays the name of or changes the current directory.",
  color:"Sets the default console foreground and background colors.",
  copy:"Copies one or more files to another location.",
  move:"Moves one or more files from one directory to another directory.",
  cls:"Clears the screen.",
  dir:"Displays a list of files and subdirectories in a directory.",
  date:"Displays the date.",
  time:"Displays the system time.",
  tree:"Graphically displays the directory structure of a drive or path.",
  vol:"Displays a disk volume label and serial number.",
  del:"Deletes one or more files.",
  rd:"Removes a directory.",
  ren:"Renames a file or directory.",
  echo:"Displays messages, or turns command echoing on or off.",
  exit:"Quits the CMD.EXE program (command interpreter).",
  help:"Provides Help information for Windows commands.",
  md:"Creates a directory.",
  popd:"Changes to the directory stored by PUSHD.",
  pushd:"Saves the current directory then changes it.",
  set:"Displays, sets, or removes environment variables.",
  path:"Displays or sets a search path for executable files.",
  pause:"Suspends processing and waits for a key to be pressed.",
  find:"Searches for a text string in a file or files.",
  sort:"Sorts input.",
  more:"Displays output one screen at a time.",
  type:"Displays the contents of a text file.",
  title:"Sets the window title for a CMD.EXE session.",
  ver:"Displays the Windows version."
};
const DRIVE_NOT_FOUND="The system cannot find the drive specified.";
const PATH_NOT_FOUND="The system cannot find the path specified.";
const FILE_NOT_FOUND="The system cannot find the file specified.";
const ACCESS_DENIED="Access is denied.";
const INVALID_SYNTAX="The syntax of the command is incorrect.";
const DIR_NOT_EMPTY="The directory is not empty.";
const NOT_DIRECTORY="The directory name is invalid.";
const FILE_EXISTS="A duplicate file name exists, or the file cannot be found.";
/** Source aliases at.cmd.js: rmdir->rd, erase->del, rename->ren. */
const SOURCE_CMD_ALIASES:Readonly<Record<string,string>>={
  mkdir:"md",rmdir:"rd",erase:"del",rename:"ren"
};
/** Preserve the exact quoted argument boundaries from original cmd ft().
 * This subset rejects arbitrary command-line evaluation / host execution. */
function sourceCmdArguments(value:string):string[]{
  return (value.match(/"[^"]*"|\S+/g)??[]).map(part=>
    part.startsWith('"')&&part.endsWith('"')?part.slice(1,-1):part);
}

/** Original cmd.js F / L Win7 console hexadecimal palette, including
 * the source default rather than contemporary Windows Terminal colors. */
export const SOURCE_CMD_COLORS:Readonly<Record<string,string>>={
  "0":"#0c0c0c","1":"#0037da","2":"#13a10e","3":"#3a96dd",
  "4":"#c50f1f","5":"#881798","6":"#c19c00","7":"#cccccc",
  "8":"#767676","9":"#3b78ff","a":"#16c60c","b":"#61d6d6",
  "c":"#e74856","d":"#b4009e","e":"#f9f1a5","f":"#f2f2f2"
};
/** Original Dt source template seeded from this session's mounted Guest
 * profile. Host/computer-specific values are deliberately not fabricated. */
export function sourceCmdInitialEnvironment(home:string):readonly [string,string][]{
  const drive=home.slice(0,2);
  const windows=drive+"\\Windows";
  const files=drive+"\\Program Files";
  const local=home+"\\AppData\\Local";
  return [
    ["ALLUSERSPROFILE",drive+"\\ProgramData"],
    ["APPDATA",home+"\\AppData\\Roaming"],
    ["CommonProgramFiles",files+"\\Common Files"],
    ["ComSpec",windows+"\\system32\\cmd.exe"],
    ["HOMEDRIVE",drive],["HOMEPATH",home.slice(drive.length)],
    ["LOCALAPPDATA",local],["OS","Windows_NT"],
    ["Path",[windows+"\\system32",windows,windows+"\\System32\\Wbem"].join(";")],
    ["PATHEXT",".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC"],
    ["ProgramData",drive+"\\ProgramData"],["ProgramFiles",files],
    ["PROMPT","$P$G"],["PUBLIC",drive+"\\Users\\Public"],
    ["SystemDrive",drive],["SystemRoot",windows],
    ["TEMP",local+"\\Temp"],["TMP",local+"\\Temp"],
    ["USERNAME",home.split("\\").at(-1)??"Guest"],
    ["USERPROFILE",home],["windir",windows]
  ];
}
const SOURCE_CMD_COLOR_HELP=[
  "Sets the default console foreground and background colors.","","COLOR [attr]","",
  "  attr        Specifies color attribute of console output","",
  "Color attributes are specified by TWO hex digits -- the first",
  "corresponds to the background; the second the foreground.  Each digit",
  "can be any of the following values:","",
  ...Object.keys(SOURCE_CMD_COLORS).map(key=>"    "+key.toUpperCase()),
  "","If no argument is given, this command restores the color to what it",
  "was when CMD.EXE started."
];

/** Pinned cmd.js Ct() substitution. Expansion is nonrecursive, replaces
 * only existing case-insensitive values, and keeps unknown %NAME% verbatim.
 * The original Tt.run() expands once before parsing command operators. */
export function sourceCmdExpandVariables(
  input:string, lookup:(name:string)=>string|undefined
):string{
  return input.replace(/%([^%\s]+)%/g,(match,name:string)=>lookup(name)??match);
}

/** Original CMD ue() deterministic serial of source disk letter+label.
 * This is a simulator serial, not an invented host disk serial. */
export function sourceCmdVolumeSerial(letter:string,label:string):string{
  let value=0;
  for(const char of letter+":"+label)
    value=(31*value+char.charCodeAt(0))%4294967295;
  const hex=value.toString(16).toUpperCase().padStart(8,"0");
  return hex.slice(0,4)+"-"+hex.slice(4);
}
/** Original G/K and Y formatting, with the source's hundredths precision. */
export function sourceCmdDateValue(date:Date):string{
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const pad=(n:number)=>String(n).padStart(2,"0");
  return days[date.getDay()]+" "+pad(date.getMonth()+1)+"/"+
    pad(date.getDate())+"/"+date.getFullYear();
}
export function sourceCmdTimeValue(date:Date):string{
  const pad=(n:number)=>String(n).padStart(2,"0");
  return [date.getHours(),date.getMinutes(),date.getSeconds()]
    .map(pad).join(":")+"."+pad(Math.floor(date.getMilliseconds()/10));
}

const commandNames=Object.keys(SOURCE_CMD_HELP).sort((a,b)=>a.localeCompare(b));


/** Pinned cmd.js Tt.unglue / kt: accept familiar DOS tokens without
 * whitespace (CD.., ECHO., DIR/B), but split only known commands.
 */
export function sourceCmdUnglue(input:string):string{
  const first=/^(\s*)(\S+)([\s\S]*)$/.exec(input);
  if(!first)return input;
  const match=/^([a-z]+)(\.\.?|\/.*)$/i.exec(first[2]);
  if(!match)return input;
  const command=match[1].toLowerCase();
  if(!SOURCE_CMD_HELP[command]&&command!=="chdir"&&
    !Object.prototype.hasOwnProperty.call(SOURCE_CMD_ALIASES,command))return input;
  return first[1]+match[1]+" "+match[2]+first[3];
}

/** Original cmd.js b894 a(): split the final path argument at the last
 * unquoted whitespace, preserving command/argument prefix verbatim. */
export interface SourceCmdCompletionTarget{
  head:string;
  dir:string;
  prefix:string;
}
export function sourceCmdCompletionTarget(raw:string):SourceCmdCompletionTarget{
  const input=String(raw||"");
  let start=0;
  let quoted=false;
  for(let i=0;i<input.length;i++){
    if(input[i]==='"')quoted=!quoted;
    else if(!quoted&&/\s/.test(input[i]))start=i+1;
  }
  const path=input.slice(start).replace(/"/g,"");
  const separator=Math.max(path.lastIndexOf("\\"),path.lastIndexOf("/"));
  return {
    head:input.slice(0,start),
    dir:path.slice(0,separator+1),
    prefix:path.slice(separator+1)
  };
}
/** Original c(): quote only a completed path containing whitespace. */
export function sourceCmdApplyCompletion(
  target:SourceCmdCompletionTarget,name:string
):string{
  const path=target.dir+name;
  return target.head+(/\s/.test(path)?'"'+path+'"':path);
}
export interface SourceCmdCompletion{
  target:SourceCmdCompletionTarget;
  matches:string[];
}

/** Original cmd.js gt()/mt() split &&, || and & only outside quotes.
 * Keep the exact operator on the *following* command for source Tt.run().
 * This is an isolated grammar primitive, not host shell evaluation. */
export interface SourceCmdChainSegment{
  text:string;
  operator:""|"&"|"&&"|"||";
}
export function sourceCmdChainSegments(input:string):SourceCmdChainSegment[]{
  const result:SourceCmdChainSegment[]=[];
  let remaining=String(input??"");
  let operator:SourceCmdChainSegment["operator"]="";
  while(true){
    let quoted=false;
    let index=-1;
    let found:SourceCmdChainSegment["operator"]="";
    for(let i=0;i<remaining.length;i++){
      if(remaining[i]==='"'){quoted=!quoted;continue;}
      if(quoted)continue;
      if(remaining.startsWith("&&",i)){index=i;found="&&";break;}
      if(remaining.startsWith("||",i)){index=i;found="||";break;}
      if(remaining[i]==="&"){index=i;found="&";break;}
    }
    if(index<0){
      result.push({text:remaining,operator});
      return result;
    }
    result.push({text:remaining.slice(0,index),operator});
    operator=found;
    remaining=remaining.slice(index+found.length);
  }
}

/** Pinned cmd.js mt()/wt(): choose the LAST nonquoted > or >> token.
 * Missing file arguments leave source text unchanged. */
export interface SourceCmdRedirect{
  path:string;
  append:boolean;
}
export interface SourceCmdParsedRedirect{
  text:string;
  redirect:SourceCmdRedirect|null;
}
export function sourceCmdParseRedirect(input:string):SourceCmdParsedRedirect{
  const text=String(input||"");
  let quoted=false;
  let at=-1;
  let token="";
  for(let i=0;i<text.length;i++){
    if(text[i]==='"'){quoted=!quoted;continue;}
    if(quoted||text[i]!==">")continue;
    at=i;
    token=text.startsWith(">>",i)?">>":">";
    if(token===">>")i++;
  }
  if(at<0)return {text,redirect:null};
  const [path]=sourceCmdArguments(text.slice(at+token.length));
  if(!path)return {text,redirect:null};
  return {text:text.slice(0,at),redirect:{path,append:token===">>"}};
}

/** Original cmd.js yt(): each unquoted vertical bar divides a pipeline.
 * Quotes and original command spacing are retained in the segments. */
export function sourceCmdPipelineSegments(input:string):string[]{
  const segments:string[]=[];
  const text=String(input||"");
  let start=0;
  let quoted=false;
  for(let i=0;i<text.length;i++){
    if(text[i]==='"'){quoted=!quoted;continue;}
    if(!quoted&&text[i]==="|"){
      segments.push(text.slice(start,i));
      start=i+1;
    }
  }
  segments.push(text.slice(start));
  return segments;
}

/** Original cmd.js vt(): keep the untouched argument separator whitespace.
 * Original ECHO strips just ONE leading ASCII space and retains the rest. */
export function sourceCmdRawRest(value:string):string{
  const text=String(value||"");
  const start=text.search(/\S/);
  if(start<0)return text;
  if(text[start]==='"'){
    const end=text.indexOf('"',start+1);
    return end<0?"":text.slice(end+1);
  }
  const remaining=text.slice(start);
  const index=remaining.search(/\s/);
  return index<0?"":remaining.slice(index);
}

export class SourceCmdSession {
  private cwd:string;
  private echo=true;
  private lastErrorLevel=0;
  private readonly directoryStack:string[]=[];
  private readonly environment=new Map<string,{name:string;value:string}>();
  constructor(
    private readonly fs:CmdFilesystem,
    private readonly volume:CmdVolume,
    startUri:string,
    private readonly now:()=>Date=()=>new Date(),
    /** Source b894 host.waitForKey: injected UI key reader, never host shell. */
    private readonly waitForKey?: (prompt:string)=>Promise<string>
  ){
    const initial=volume.toWindowsPath(startUri);
    if(!initial)throw new Error("CMD starting directory is not mounted");
    this.cwd=initial;
    for(const [name,value] of sourceCmdInitialEnvironment(initial)){
      this.setEnvironment(name,value);
    }
  }
  private setEnvironment(name:string,value:string):void{
    const key=name.toUpperCase();
    this.environment.set(key,{name:this.environment.get(key)?.name??name,value});
  }
  private listEnvironment():{name:string;value:string}[]{
    return [...this.environment.values()].sort((a,b)=>
      a.name.localeCompare(b.name,undefined,{sensitivity:"base"}));
  }
  get prompt():string{return this.cwd+">";}
  get currentDirectory():string{return this.cwd;}
  get echoEnabled():boolean{return this.echo;}
  get errorlevel():number{return this.lastErrorLevel;}
  get environmentVariables():ReadonlyArray<{name:string;value:string}>{
    return this.listEnvironment();
  }

  private resolve(argument:string):{win:string;uri:string|null}{
    const win=resolveWindowsPath(argument,{cwd:this.cwd});
    return {win,uri:this.volume.toUri(win)};
  }
  /** Original b894 l(): complete names from the mounted Guest directory.
   * Never read the host filesystem or execute a candidate. */
  async complete(input:string):Promise<SourceCmdCompletion>{
    const target=sourceCmdCompletionTarget(input);
    try{
      const directory=this.resolve(target.dir||".");
      if(!directory.uri)return {target,matches:[]};
      const entries=await this.fs.list(directory.uri);
      const matches=entries.map(entry=>entry.name)
        .filter(name=>name.toLowerCase().startsWith(target.prefix.toLowerCase()))
        .sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:"base"}));
      return {target,matches};
    }catch{
      return {target,matches:[]};
    }
  }
  async run(raw:string):Promise<SourceCmdResult>{
    const input=String(raw);
    const prompt=this.prompt;
    // Pinned Tt.run() performs Ct variable expansion only once, BEFORE
    // parsing any conditional operators. Later SET commands do not expand
    // variables again in the remaining segments.
    const expanded=sourceCmdExpandVariables(input,name=>{
      const key=name.toUpperCase();
      if(key==="ERRORLEVEL")return String(this.lastErrorLevel);
      if(key==="CD")return this.cwd;
      return this.environment.get(key)?.value;
    });
    const segments=sourceCmdChainSegments(expanded);
    if(segments.length===1)return this.executeRedirectedSegment(input,prompt,expanded);
    let output:string[]=[];
    let clear=false;
    let exit=false;
    let title:string|undefined;
    let style:SourceCmdColorStyle|null|undefined;
    for(const segment of segments){
      if(segment.operator==="&&"&&this.lastErrorLevel!==0)continue;
      if(segment.operator==="||"&&this.lastErrorLevel===0)continue;
      // Original execute() returns the previous ERRORLEVEL for empty input.
      if(!segment.text.trim())continue;
      const result=await this.executeRedirectedSegment(input,prompt,segment.text);
      if(result.clear){clear=true;output=[];}
      output.push(...result.output);
      if(result.title!==undefined)title=result.title;
      if(result.style!==undefined)style=result.style;
      if(result.exit){exit=true;break;}
    }
    return {prompt,input,output,clear,exit,title,style,
      echo:this.echo,errorlevel:this.lastErrorLevel};
  }

  /** Pinned Tt.runPipeline and yt(): intermediate command output is
   * buffered for the next segment, only final output reaches transcript. */
  private async executePipelineSegment(
    input:string,prompt:string,text:string
  ):Promise<SourceCmdResult>{
    const segments=sourceCmdPipelineSegments(text);
    if(segments.length===1)return this.executeSingle(input,prompt,text);
    let piped:string[]=[];
    let last:SourceCmdResult|undefined;
    let clear=false;
    let exit=false;
    let title:string|undefined;
    let style:SourceCmdColorStyle|null|undefined;
    for(const segment of segments){
      const result=await this.executeSingle(input,prompt,segment,piped);
      last=result;
      piped=result.output;
      if(result.clear)clear=true;
      if(result.title!==undefined)title=result.title;
      if(result.style!==undefined)style=result.style;
      if(result.exit){exit=true;break;}
    }
    return {...last!,output:piped,clear,exit,title,style,
      prompt,input,echo:this.echo,errorlevel:this.lastErrorLevel};
  }

  /** Original se(): read named text files from Guest VFS, or consume the
   * upstream pipeline if no explicit file arguments were supplied. */
  private async sourceFilterLines(
    paths:readonly string[],piped:readonly string[]
  ):Promise<string[]|null>{
    if(!paths.length)return [...piped];
    const lines:string[]=[];
    for(const path of paths){
      try{
        const file=this.resolve(path);
        if(!file.uri)return null;
        lines.push(...(await this.fs.read(file.uri)).split(/\r?\n/));
      }catch{return null;}
    }
    return lines;
  }

  /** Source Tt.runPipeline/writeFile: buffer command output, write CRLF
   * into a mounted Guest file. Successful redirect sets ERRORLEVEL=0,
   * even if the redirected command itself failed, matching source Tt. */
  private async executeRedirectedSegment(
    input:string,prompt:string,segment:string
  ):Promise<SourceCmdResult>{
    const {text,redirect}=sourceCmdParseRedirect(segment);
    if(!redirect)return this.executePipelineSegment(input,prompt,text);
    const result=await this.executePipelineSegment(input,prompt,text);
    let output:string[]=[];
    let errorlevel=0;
    try{
      const target=this.resolve(redirect.path);
      if(!target.uri){
        output=[DRIVE_NOT_FOUND];
        errorlevel=1;
      }else{
        // Preserve binary-backed Guest files rather than corrupting them.
        const entry=await this.fs.stat(target.uri);
        if(entry?.type==="directory")throw new Error("Cannot redirect to a directory");
        let prefix="";
        if(redirect.append&&entry)prefix=await this.fs.read(target.uri);
        await this.fs.write(prefix+result.output.join("\r\n")+"\r\n",target.uri);
      }
    }catch{
      output=[ACCESS_DENIED];
      errorlevel=1;
    }
    this.lastErrorLevel=errorlevel;
    return {...result,output,errorlevel};
  }

  /** Single parsed command. Never re-expand variables inside a chain. */
  private async executeSingle(
    input:string,prompt:string,expanded:string,piped:readonly string[]=[]
  ):Promise<SourceCmdResult>{
    if(!expanded.trim())return {
      prompt,input,output:[],echo:this.echo,errorlevel:this.lastErrorLevel
    };
    const match=/^\s*(\S+)(?:\s+([\s\S]*))?$/.exec(sourceCmdUnglue(expanded));
    const sourceName=(match?.[1]??"").toLowerCase();
    const name=SOURCE_CMD_ALIASES[sourceName]??sourceName;
    const rest=match?.[2]??"";
    const args=rest.trim();
    let errorlevel=0;
    let output:string[]=[];
    let clear=false;
    let exit=false;
    let title:string|undefined;
    let style:SourceCmdColorStyle|null|undefined;

    if(name==="cls"){
      clear=true;
    }else if(name==="color"){
      if(!args)style=null;
      else if(/^[0-9a-f]{2}$/i.test(args)){
        const bg=SOURCE_CMD_COLORS[args[0].toLowerCase()];
        const fg=SOURCE_CMD_COLORS[args[1].toLowerCase()];
        if(bg===fg)errorlevel=1;
        else style={backgroundColor:bg,color:fg};
      }else output=[...SOURCE_CMD_COLOR_HELP];
    }else if(name==="set"){
      if(!args){
        output=this.listEnvironment().map(item=>item.name+"="+item.value);
      }else{
        const eq=args.indexOf("=");
        if(eq<0){
          const entries=this.listEnvironment().filter(item=>
            item.name.toUpperCase().startsWith(args.toUpperCase()));
          if(entries.length)output=entries.map(item=>item.name+"="+item.value);
          else{output=["Environment variable "+args+" not defined"];errorlevel=1;}
        }else{
          const key=args.slice(0,eq).trim();
          const value=args.slice(eq+1);
          if(!key){output=[INVALID_SYNTAX];errorlevel=1;}
          else if(!value)this.environment.delete(key.toUpperCase());
          else this.setEnvironment(key,value);
        }
      }
    }else if(name==="path"){
      if(!args)output=["PATH="+(this.environment.get("PATH")?.value||"(null)")];
      else if(args===";")this.environment.delete("PATH");
      else this.setEnvironment("PATH",args);
    }else if(name==="echo"){
      const sourceRest=sourceCmdRawRest(sourceCmdUnglue(expanded));
      const value=sourceRest.trim();
      if(!value)output=["ECHO is "+(this.echo?"on":"off")];
      else if(/^(on|off)$/i.test(value))this.echo=value.toLowerCase()==="on";
      else if(value===".")output=[""];
      else output=[sourceRest.replace(/^ /,"")];
    }else if(name==="find"||name==="sort"||name==="more"){
      const tokens=sourceCmdArguments(args);
      const flags=new Set(tokens.filter(token=>token.startsWith("/"))
        .map(token=>token.slice(1).split(":")[0].toLowerCase()));
      const values=tokens.filter(token=>!token.startsWith("/"));
      const needle=name==="find"?values.shift():undefined;
      if(name==="find"&&needle===undefined){
        output=[INVALID_SYNTAX];errorlevel=1;
      }else{
        const lines=await this.sourceFilterLines(values,piped);
        if(!lines){output=[FILE_NOT_FOUND];errorlevel=1;}
        else if(name==="more")output=lines;
        else if(name==="sort"){
          output=[...lines].sort((a,b)=>a.localeCompare(b,undefined,
            {sensitivity:"base"}));
          if(flags.has("r"))output.reverse();
        }else{
          const fold=flags.has("i");
          const search=fold?needle!.toLowerCase():needle!;
          const matched=lines.filter(line=>{
            const match=(fold?line.toLowerCase():line).includes(search);
            return flags.has("v")?!match:match;
          });
          if(flags.has("c"))output=["---------- : "+matched.length];
          else{output=matched;errorlevel=matched.length?0:1;}
        }
      }
    }else if(name==="date"||name==="time"){
      const value=name==="date"
        ?sourceCmdDateValue(this.now()):sourceCmdTimeValue(this.now());
      output=[args.toLowerCase()==="/t"
        ?value:"The current "+name+" is: "+value];
    }else if(name==="vol"){
      const letter=args?/^([a-z]):?$/i.exec(args)?.[1]:this.cwd.slice(0,1);
      const drive=this.volume.pathConfig.drives.find(d=>
        d.letter.toUpperCase()===letter?.toUpperCase());
      if(!drive){output=[DRIVE_NOT_FOUND];errorlevel=1;}
      else output=[
        " Volume in drive "+drive.letter+" is "+(drive.label??""),
        " Volume Serial Number is "+
          sourceCmdVolumeSerial(drive.letter,drive.label??"")
      ];
    }else if(name==="tree"){
      const tokens=sourceCmdArguments(args);
      const fileFlag=tokens.some(token=>/^\/f$/i.test(token));
      const unsupported=tokens.some(token=>token.startsWith("/")&&!/^\/f$/i.test(token));
      const paths=tokens.filter(token=>!/^\/f$/i.test(token)&&!token.startsWith("/"));
      if(unsupported||paths.length>1){
        output=["The requested TREE option is not yet available in this migration."];
        errorlevel=1;
      }else{
        try{
          const root=this.resolve(paths[0]??".");
          const drive=this.volume.pathConfig.drives.find(d=>
            d.letter.toUpperCase()===root.win.slice(0,1).toUpperCase());
          if(!drive||!root.uri){output=[DRIVE_NOT_FOUND];errorlevel=1;}
          else{
            output=[
              "Folder PATH listing for volume "+(drive.label??""),
              "Volume Serial Number is "+
                sourceCmdVolumeSerial(drive.letter,drive.label??""),
              root.win.toUpperCase()
            ];
            let count=0;
            const visit=async(uri:string,prefix:readonly boolean[]):Promise<void>=>{
              if(prefix.length>12||count>=5000)return;
              let entries:FileEntry[];
              try{entries=await this.fs.list(uri);}
              catch{return;}
              const visible=entries
                .filter(entry=>fileFlag||entry.type==="directory")
                .sort((a,b)=>a.name.localeCompare(b.name,undefined,
                  {sensitivity:"base"}));
              for(let index=0;index<visible.length;index++){
                if(count>=5000)break;
                const entry=visible[index];
                const isLast=index===visible.length-1;
                const leader=prefix.map(flag=>flag?"│   ":"    ").join("");
                output.push(leader+(isLast?"└":"├")+"───"+entry.name);
                count++;
                if(entry.type==="directory")
                  await visit(entry.uri,[...prefix,!isLast]);
              }
            };
            await visit(root.uri,[]);
            if(!count)output.push("No subfolders exist");
          }
        }catch{output=[PATH_NOT_FOUND];errorlevel=1;}
      }
    }else if(name==="ver"){
      output=["",SOURCE_CMD_BANNER[0]];
    }else if(name==="title"){
      title=args;
    }else if(name==="help"){
      if(args){
        const command=args.toLowerCase();
        if(command==="chdir")output=[SOURCE_CMD_HELP.cd,"","CD [/D] [drive:][path]","CD .."];
        else if(SOURCE_CMD_HELP[command])output=[
          SOURCE_CMD_HELP[command],"",command.toUpperCase()
        ];
        else{
          output=['This command is not supported by the help utility.  Try "'+args+' /?".'];
          errorlevel=1;
        }
      }else{
        output=commandNames.map(command=>
          command.toUpperCase().padEnd(9)+SOURCE_CMD_HELP[command]);
      }
    }else if(name==="pause"){
      if(!this.waitForKey){
        output=["PAUSE requires an interactive console."];
        errorlevel=1;
      }else{
        output=["Press any key to continue . . ."];
        await this.waitForKey(output[0]);
      }
    }else if(name==="exit"){
      exit=true;
    }else if(name==="cd"||name==="chdir"){
      let target=args.replace(/^\/d(?:\s+|$)/i,"").trim();
      if(!target)output=[this.cwd];
      else{
        if(target.startsWith('"')&&target.endsWith('"'))target=target.slice(1,-1);
        try{
          const dest=this.resolve(target);
          if(!dest.uri){output=[DRIVE_NOT_FOUND];errorlevel=1;}
          else{
            const stat=await this.fs.stat(dest.uri);
            if(stat?.type==="directory")this.cwd=dest.win;
            else{output=[PATH_NOT_FOUND];errorlevel=1;}
          }
        }catch{output=[PATH_NOT_FOUND];errorlevel=1;}
      }
    }else if(name==="type"){
      // Original cmd.js Te.type reads a single VFS text path. Byte-backed
      // uploads and folders remain AccessDenied instead of being coerced.
      const target=args.startsWith('"')&&args.endsWith('"')?args.slice(1,-1):args;
      if(!target){output=[INVALID_SYNTAX];errorlevel=1;}
      else{
        try{
          const dest=this.resolve(target);
          if(!dest.uri){output=[DRIVE_NOT_FOUND];errorlevel=1;}
          else{
            const entry=await this.fs.stat(dest.uri);
            if(!entry){output=[FILE_NOT_FOUND];errorlevel=1;}
            else if(entry.type==="directory"){output=[ACCESS_DENIED];errorlevel=1;}
            else{
              try{output=(await this.fs.read(dest.uri)).split(/\r?\n/);}
              catch{output=[ACCESS_DENIED];errorlevel=1;}
            }
          }
        }catch{output=[FILE_NOT_FOUND];errorlevel=1;}
      }
    }else if(name==="md"){
      // Original Te.md does not replace or overwrite existing source files.
      const target=args.startsWith('"')&&args.endsWith('"')?args.slice(1,-1):args;
      if(!target){output=[INVALID_SYNTAX];errorlevel=1;}
      else{
        try{
          const dest=this.resolve(target);
          if(!dest.uri){output=[DRIVE_NOT_FOUND];errorlevel=1;}
          else if(await this.fs.stat(dest.uri)){
            output=["A subdirectory or file "+target+" already exists."];
            errorlevel=1;
          }else{
            try{await this.fs.mkdir(dest.uri);}
            catch{output=[PATH_NOT_FOUND];errorlevel=1;}
          }
        }catch{output=[PATH_NOT_FOUND];errorlevel=1;}
      }
    }else if(name==="ren"){
      const tokens=sourceCmdArguments(args);
      const [fromName,toName]=tokens;
      if(tokens.length!==2||!fromName||!toName||
        /[\\/:*?"<>|]/.test(toName)||toName==="."||toName===".."){
        output=[INVALID_SYNTAX];errorlevel=1;
      }else{
        try{
          const source=this.resolve(fromName);
          if(!source.uri){output=[DRIVE_NOT_FOUND];errorlevel=1;}
          else if(!await this.fs.stat(source.uri)){
            output=[FILE_NOT_FOUND];errorlevel=1;
          }else{
            const dest=getParentDirectory(source.uri)+"/"+toName;
            if(await this.fs.stat(dest)){output=[FILE_EXISTS];errorlevel=1;}
            else{
              try{await this.fs.move(source.uri,dest);}
              catch{output=[ACCESS_DENIED];errorlevel=1;}
            }
          }
        }catch{output=[FILE_NOT_FOUND];errorlevel=1;}
      }
    }else if(name==="rd"){
      const tokens=sourceCmdArguments(args);
      const recursive=tokens.some(token=>/^\/s$/i.test(token));
      const target=tokens.find(token=>!/^\/s$/i.test(token));
      if(!target||tokens.length!==(recursive?2:1)){
        output=[INVALID_SYNTAX];errorlevel=1;
      }else{
        try{
          const dest=this.resolve(target);
          if(!dest.uri){output=[DRIVE_NOT_FOUND];errorlevel=1;}
          else{
            const entry=await this.fs.stat(dest.uri);
            if(!entry){output=[PATH_NOT_FOUND];errorlevel=1;}
            else if(entry.type!=="directory"){
              output=[NOT_DIRECTORY];errorlevel=1;
            }else{
              const children=await this.fs.list(dest.uri);
              if(children.length&&!recursive){
                output=[DIR_NOT_EMPTY];errorlevel=1;
              }else if(children.length&&!this.waitForKey){
                output=["RD /S requires interactive confirmation."];
                errorlevel=1;
              }else{
                let confirmed=true;
                if(children.length){
                  const question=dest.win+", Are you sure (Y/N)? ";
                  const answer=await this.waitForKey!(question);
                  // Original ke() accepts a single Y/y key only.
                  output=[question+answer];
                  confirmed=/^y$/i.test(answer);
                }
                if(confirmed){
                  try{
                    if(recursive)await this.fs.removeTree(dest.uri);
                    else await this.fs.remove(dest.uri);
                  }catch{output.push(ACCESS_DENIED);errorlevel=1;}
                }
              }
            }
          }
        }catch{output=[PATH_NOT_FOUND];errorlevel=1;}
      }
    }else if(name==="del"){
      const tokens=sourceCmdArguments(args);
      if(tokens.length!==1||!tokens[0]){
        output=[INVALID_SYNTAX];errorlevel=1;
      }else if(/[*?]/.test(tokens[0])){
        // Source DEL confirms wildcard/all-file operations. Reject until
        // source waitForKey confirmation behavior is implemented.
        output=["DEL wildcard confirmation is not yet available in this migration."];
        errorlevel=1;
      }else{
        try{
          const dest=this.resolve(tokens[0]);
          if(!dest.uri){output=[DRIVE_NOT_FOUND];errorlevel=1;}
          else{
            const entry=await this.fs.stat(dest.uri);
            if(!entry){output=["Could Not Find "+dest.win];errorlevel=1;}
            else if(entry.type==="directory"){
              output=["DEL directory confirmation is not yet available in this migration."];
              errorlevel=1;
            }else{
              try{await this.fs.remove(dest.uri);}
              catch{output=[ACCESS_DENIED];errorlevel=1;}
            }
          }
        }catch{output=[PATH_NOT_FOUND];errorlevel=1;}
      }
    }else if(name==="copy"||name==="move"){
      // Source Pe() filters source directories; a single concrete file can
      // target a directory or an explicit new filename. VFS transfer remains
      // atomic and preserves binary bytes, without touching the host OS.
      const tokens=sourceCmdArguments(args);
      const [sourceName,targetName]=tokens;
      if(!sourceName||tokens.length>2){
        output=[INVALID_SYNTAX];errorlevel=1;
      }else if(/[*?]/.test(sourceName)||targetName&&/[*?]/.test(targetName)){
        // Multiple transfers / overwrite confirmation are not implemented
        // as a fake bulk operation. Nothing is modified.
        output=["COPY/MOVE wildcard transfers are not yet available in this migration."];
        errorlevel=1;
      }else{
        try{
          const source=this.resolve(sourceName);
          const target=this.resolve(targetName??".");
          if(!source.uri||!target.uri){
            output=[DRIVE_NOT_FOUND];errorlevel=1;
          }else{
            const sourceEntry=await this.fs.stat(source.uri);
            if(sourceEntry?.type!=="file"){
              output=[FILE_NOT_FOUND];errorlevel=1;
            }else{
              const destinationEntry=await this.fs.stat(target.uri);
              const destination=destinationEntry?.type==="directory"
                ?target.uri+"/"+getFileName(source.uri):target.uri;
              try{
                if(name==="copy")await this.fs.copy(source.uri,destination);
                else await this.fs.move(source.uri,destination);
                output=[String(1).padStart(9)+" file(s) "+(name==="copy"?"copied.":"moved.")];
              }catch{
                output=[ACCESS_DENIED];errorlevel=1;
              }
            }
          }
        }catch{output=[PATH_NOT_FOUND];errorlevel=1;}
      }
    }else if(name==="pushd"){
      const target=args.startsWith('"')&&args.endsWith('"')?args.slice(1,-1):args;
      if(!target)this.directoryStack.push(this.cwd);
      else{
        try{
          const dest=this.resolve(target);
          const stat=dest.uri?await this.fs.stat(dest.uri):null;
          if(stat?.type==="directory"){
            this.directoryStack.push(this.cwd);
            this.cwd=dest.win;
          }else{output=[dest.uri?PATH_NOT_FOUND:DRIVE_NOT_FOUND];errorlevel=1;}
        }catch{output=[PATH_NOT_FOUND];errorlevel=1;}
      }
    }else if(name==="popd"){
      const previous=this.directoryStack.pop();
      if(previous)this.cwd=previous;
    }else if(name==="dir"){
      const parts=(args.match(/"[^"]*"|\S+/g)??[]).map(t=>
        t.startsWith('"')&&t.endsWith('"')?t.slice(1,-1):t);
      const flags=parts.filter(t=>t.startsWith("/")).map(t=>t.slice(1).toLowerCase());
      const path=parts.filter(t=>!t.startsWith("/")).join(" ").trim()||".";
      if(flags.some(f=>f!=="b")){
        output=["The requested DIR option is not yet available in this migration."];
        errorlevel=1;
      }else{
        try{
          // Source DIR uses actual filesystem metadata and a case-insensitive
          // filename predicate; never fabricate disk entries or host paths.
          let dir=path;
          let pattern="*";
          if(/[*?]/.test(path)){
            const last=Math.max(path.lastIndexOf("/"),path.lastIndexOf("\\"));
            pattern=path.slice(last+1);
            dir=last<0?".":path.slice(0,last+1);
          }
          const dest=this.resolve(dir);
          if(!dest.uri){output=[DRIVE_NOT_FOUND];errorlevel=1;}
          else{
            const stat=await this.fs.stat(dest.uri);
            if(stat?.type!=="directory"){output=[PATH_NOT_FOUND];errorlevel=1;}
            else{
              const entries:(FileEntry[])=(await this.fs.list(dest.uri))
                .filter(item=>matchFilePattern(item.name,pattern))
                .sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:"base"}));
              if(flags.includes("b"))output=entries.map(item=>item.name);
              else{
                output=[""," Directory of "+dest.win,""];
                if(!entries.length)output.push("File Not Found");
                for(const entry of entries){
                  const size=entry.type==="directory"?"<DIR>":String(entry.size);
                  output.push(size.padStart(8)+"  "+entry.name);
                }
                const nFiles=entries.filter(f=>f.type==="file");
                output.push("       "+nFiles.length+" File(s)  "+
                  nFiles.reduce((sum,f)=>sum+f.size,0)+" bytes");
                output.push("       "+(entries.length-nFiles.length)+" Dir(s)");
              }
            }
          }
        }catch{output=[PATH_NOT_FOUND];errorlevel=1;}
      }
    }else if(name){
      output=[
        "'"+(match?.[1]??"")+"' is not recognized as an internal or external command,",
        "operable program or batch file."
      ];
      errorlevel=9009;
    }
    this.lastErrorLevel=errorlevel;
    return {prompt,input,output,clear,exit,title,echo:this.echo,errorlevel,style};
  }
}

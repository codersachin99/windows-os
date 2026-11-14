import {
  resolveWindowsPath,matchFilePattern,
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
}
type CmdFilesystem=Pick<VirtualFileStore,"stat"|"list"|"read"|"mkdir">;
type CmdVolume=Pick<LegacyVolumeSession,"toUri"|"toWindowsPath">;

export const SOURCE_CMD_BANNER=[
  "Microsoft Windows [Version 6.1.7600]",
  "Copyright (c) 2009 Microsoft Corporation. All rights reserved."
] as const;

export const SOURCE_CMD_HELP:Readonly<Record<string,string>>={
  cd:"Displays the name of or changes the current directory.",
  cls:"Clears the screen.",
  dir:"Displays a list of files and subdirectories in a directory.",
  echo:"Displays messages, or turns command echoing on or off.",
  exit:"Quits the CMD.EXE program (command interpreter).",
  help:"Provides Help information for Windows commands.",
  md:"Creates a directory.",
  popd:"Changes to the directory stored by PUSHD.",
  pushd:"Saves the current directory then changes it.",
  type:"Displays the contents of a text file.",
  title:"Sets the window title for a CMD.EXE session.",
  ver:"Displays the Windows version."
};
const DRIVE_NOT_FOUND="The system cannot find the drive specified.";
const PATH_NOT_FOUND="The system cannot find the path specified.";
const FILE_NOT_FOUND="The system cannot find the file specified.";
const ACCESS_DENIED="Access is denied.";
const INVALID_SYNTAX="The syntax of the command is incorrect.";
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
  if(!SOURCE_CMD_HELP[command]&&command!=="chdir"&&command!=="mkdir")return input;
  return first[1]+match[1]+" "+match[2]+first[3];
}

export class SourceCmdSession {
  private cwd:string;
  private echo=true;
  private lastErrorLevel=0;
  private readonly directoryStack:string[]=[];
  constructor(
    private readonly fs:CmdFilesystem,
    private readonly volume:CmdVolume,
    startUri:string
  ){
    const initial=volume.toWindowsPath(startUri);
    if(!initial)throw new Error("CMD starting directory is not mounted");
    this.cwd=initial;
  }
  get prompt():string{return this.cwd+">";}
  get currentDirectory():string{return this.cwd;}
  get echoEnabled():boolean{return this.echo;}
  get errorlevel():number{return this.lastErrorLevel;}

  private resolve(argument:string):{win:string;uri:string|null}{
    const win=resolveWindowsPath(argument,{cwd:this.cwd});
    return {win,uri:this.volume.toUri(win)};
  }
  async run(raw:string):Promise<SourceCmdResult>{
    const input=String(raw);
    const prompt=this.prompt;
    const match=/^\s*(\S+)(?:\s+([\s\S]*))?$/.exec(sourceCmdUnglue(input));
    const sourceName=(match?.[1]??"").toLowerCase();
    const name=sourceName==="mkdir"?"md":sourceName;
    const rest=match?.[2]??"";
    const args=rest.trim();
    let errorlevel=0;
    let output:string[]=[];
    let clear=false;
    let exit=false;
    let title:string|undefined;

    if(name==="cls"){
      clear=true;
    }else if(name==="echo"){
      if(!args)output=["ECHO is "+(this.echo?"on":"off")];
      else if(/^(on|off)$/i.test(args))this.echo=args.toLowerCase()==="on";
      else if(args===".")output=[""];
      else output=[rest];
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
    return {prompt,input,output,clear,exit,title,echo:this.echo,errorlevel};
  }
}

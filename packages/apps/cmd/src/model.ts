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
type CmdFilesystem=Pick<VirtualFileStore,"stat"|"list">;
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
  title:"Sets the window title for a CMD.EXE session.",
  ver:"Displays the Windows version."
};
const DRIVE_NOT_FOUND="The system cannot find the drive specified.";
const PATH_NOT_FOUND="The system cannot find the path specified.";
const commandNames=Object.keys(SOURCE_CMD_HELP).sort((a,b)=>a.localeCompare(b));

export class SourceCmdSession {
  private cwd:string;
  private echo=true;
  private lastErrorLevel=0;
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
    const match=/^\s*(\S+)(?:\s+([\s\S]*))?$/.exec(input);
    const name=(match?.[1]??"").toLowerCase();
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

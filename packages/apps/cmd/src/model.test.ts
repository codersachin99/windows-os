import {describe,it,expect} from "vitest";
import {
  VirtualFileStore,LegacyVolumeSession,sourceGuestMounts,
  ensureSourceGuestDirectories,SOURCE_GUEST_PROFILE
} from "@windows-os/filesystem";
import {SOURCE_CMD_BANNER,SourceCmdSession,sourceCmdUnglue,sourceCmdExpandVariables,
  sourceCmdVolumeSerial,sourceCmdDateValue,sourceCmdTimeValue,
  sourceCmdCompletionTarget,sourceCmdApplyCompletion,
  sourceCmdTrimEntries,SOURCE_CMD_MAX_TRANSCRIPT_ENTRIES,
  sourceCmdChainSegments,sourceCmdParseRedirect,
  sourceCmdPipelineSegments,sourceCmdRawRest,
  sourceCmdDirDetailLine,sourceCmdDirSummary,sourceCmdDirWideLines,
  sourceCmdWhereInstallPath,sourceCmdResolveProgramId,
  sourceCmdTasks,sourceCmdTasklistOutput,sourceCmdIpconfigOutput,
  sourceCmdBrowserDeviceInfo,sourceCmdSystemInfoOutput,
  SOURCE_CMD_DIR_MAX_DEPTH,SOURCE_CMD_DIR_MAX_ENTRIES,
  sourceCmdInterruptedEntries} from "./model";

async function createShell(waitForKey?: (message:string)=>Promise<string>){
  const fs=new VirtualFileStore();
  await ensureSourceGuestDirectories(fs);
  const volume=new LegacyVolumeSession(fs,sourceGuestMounts());
  const session=new SourceCmdSession(fs,volume,SOURCE_GUEST_PROFILE,
    ()=>new Date(),waitForKey);
  return {fs,session};
}
describe("pinned cmd.js Tt prompt and first source command engine slice",()=>{
  it("starts in the actual mounted source C: Guest profile",async()=>{
    const {session}=await createShell();
    expect(session.prompt).toBe("C:\\Users\\Guest>");
    expect(SOURCE_CMD_BANNER).toEqual([
      "Microsoft Windows [Version 6.1.7600]",
      "Copyright (c) 2009 Microsoft Corporation. All rights reserved."
    ]);
  });
  it("implements source echo, CLS, VER, HELP and TITLE without unsafe evaluation",async()=>{
    const {session}=await createShell();
    expect((await session.run("echo Hello World")).output).toEqual(["Hello World"]);
    expect((await session.run("echo off")).echo).toBe(false);
    expect((await session.run("echo")).output).toEqual(["ECHO is off"]);
    expect((await session.run("echo on")).echo).toBe(true);
    expect((await session.run("ver")).output).toContain("Microsoft Windows [Version 6.1.7600]");
    expect((await session.run("title New CMD Title")).title).toBe("New CMD Title");
    expect((await session.run("cls")).clear).toBe(true);
    expect((await session.run("exit")).exit).toBe(true);
    expect((await session.run("help")).output.some(s=>s.includes("DIR"))).toBe(true);
    expect((await session.run("help unknown")).errorlevel).toBe(1);
    expect((await session.run("whoami")).errorlevel).toBe(9009);
  });
  it("CD traverses mounted Guest VFS directories, rejects missing paths/drives",async()=>{
    const {session}=await createShell();
    await session.run("cd Documents");
    expect(session.prompt).toBe("C:\\Users\\Guest\\Documents>");
    expect((await session.run("cd")).output).toEqual(["C:\\Users\\Guest\\Documents"]);
    await session.run("cd ..");
    expect(session.prompt).toBe("C:\\Users\\Guest>");
    expect((await session.run("cd Q:\\Ghost")).output).toEqual([
      "The system cannot find the drive specified."
    ]);
    expect((await session.run("cd NoSuchFolder")).errorlevel).toBe(1);
    expect(session.prompt).toBe("C:\\Users\\Guest>");
  });
  it("DIR traverses the actual VFS, sorts and supports original /B bare listing",async()=>{
    const {fs,session}=await createShell();
    await fs.write("hello","/EXTERNAL/computer/drive0/Users/Guest/Documents/z.txt");
    await fs.write("hello","/EXTERNAL/computer/drive0/Users/Guest/Documents/a.txt");
    const bare=await session.run('dir /b Documents');
    expect(bare.output).toEqual(["a.txt","z.txt"]);
    const full=await session.run("dir Documents");
    expect(full.output).toContain(" Directory of C:\\Users\\Guest\\Documents");
    expect(full.output.some(line=>line.includes("z.txt"))).toBe(true);
    expect((await session.run("dir /b Documents\\*.txt")).output).toEqual(["a.txt","z.txt"]);
    expect((await session.run("dir /s")).errorlevel).toBe(0);
  });
});

describe("pinned cmd.js unglue(source Tt.kt) aliases",()=>{
  it("separates only supported DOS command suffixes without losing input text",()=>{
    expect(sourceCmdUnglue("CD..")).toBe("CD ..");
    expect(sourceCmdUnglue("echo.")).toBe("echo .");
    expect(sourceCmdUnglue("DIR/B")).toBe("DIR /B");
    expect(sourceCmdUnglue("invalid.exe")).toBe("invalid.exe");
  });
  it("runs CD.., ECHO. and DIR/B against the original Guest shell",async()=>{
    const {session}=await createShell();
    await session.run("cd Documents");
    await session.run("cd..");
    expect(session.prompt).toBe("C:\\Users\\Guest>");
    expect((await session.run("ECHO.")).output).toEqual([""]);
    expect((await session.run("DIR/B")).output).toContain("Documents");
  });
});

describe("pinned Te TYPE MD and directory stack PUSHD POPD commands",()=>{
  it("MD/MKDIR changes the real Guest filesystem without overwriting existing directories",async()=>{
    const {fs,session}=await createShell();
    expect((await session.run("md")).output).toEqual([
      "The syntax of the command is incorrect."
    ]);
    expect((await session.run('md "New Folder"')).errorlevel).toBe(0);
    expect(await fs.stat("/EXTERNAL/computer/drive0/Users/Guest/New Folder"))
      .toMatchObject({name:"New Folder",type:"directory"});
    expect((await session.run("mkdir Second")).errorlevel).toBe(0);
    expect((await session.run('md "New Folder"')).output).toEqual([
      "A subdirectory or file New Folder already exists."
    ]);
    expect((await session.run("md Q:\\NoDrive")).errorlevel).toBe(1);
    expect((await session.run("dir /b")).output).toContain("Second");
  });
  it("TYPE reads source text files but not directory or invalid UTF-8 binary payloads",async()=>{
    const {fs,session}=await createShell();
    const root="/EXTERNAL/computer/drive0/Users/Guest";
    await fs.write("Line A\r\nLine B",root+"/Documents/report.txt");
    await fs.writeBytes(new Uint8Array([255,0,1]),root+"/Documents/binary.dat");
    expect((await session.run("type Documents\\report.txt")).output)
      .toEqual(["Line A","Line B"]);
    expect((await session.run("type Documents")).output).toEqual(["Access is denied."]);
    expect((await session.run("type Documents\\missing.txt")).output).toEqual([
      "The system cannot find the file specified."
    ]);
    expect((await session.run("type Documents\\binary.dat")).errorlevel).toBe(1);
    expect((await session.run("type")).output).toEqual([
      "The syntax of the command is incorrect."
    ]);
  });
  it("PUSHD and POPD restore the previous real mounted CWD; failed push does not change stack",async()=>{
    const {session}=await createShell();
    expect((await session.run("pushd Documents")).errorlevel).toBe(0);
    expect(session.prompt).toBe("C:\\Users\\Guest\\Documents>");
    expect((await session.run("pushd Missing")).errorlevel).toBe(1);
    expect(session.prompt).toBe("C:\\Users\\Guest\\Documents>");
    expect((await session.run("popd")).errorlevel).toBe(0);
    expect(session.prompt).toBe("C:\\Users\\Guest>");
    expect((await session.run("popd")).errorlevel).toBe(0);
    expect(session.prompt).toBe("C:\\Users\\Guest>");
  });
});

describe("original cmd.js Te REN RD DEL with safe source VFS semantics",()=>{
  it("REN/RENAME renames actual files and directories without moving them across folders",async()=>{
    const {fs,session}=await createShell();
    const base="/EXTERNAL/computer/drive0/Users/Guest/Documents";
    await fs.write("journal",base+"/old.txt");
    expect((await session.run("ren Documents\\old.txt updated.txt")).errorlevel).toBe(0);
    expect(await fs.stat(base+"/old.txt")).toBeNull();
    expect(await fs.read(base+"/updated.txt")).toBe("journal");
    await fs.mkdir(base+"/Work");
    await fs.write("safe",base+"/keep.txt");
    expect((await session.run("rename Documents\\Work Projects")).errorlevel).toBe(0);
    expect(await fs.stat(base+"/Projects")).toMatchObject({type:"directory"});
    expect((await session.run("ren Documents\\updated.txt keep.txt")).output).toEqual([
      "A duplicate file name exists, or the file cannot be found."
    ]);
    expect((await session.run("ren Documents\\updated.txt ..\\escape.txt")).errorlevel).toBe(1);
    expect(await fs.read(base+"/updated.txt")).toBe("journal");
  });
  it("RD/RMDIR protects nonempty directories without an interactive confirmation reader",async()=>{
    const {fs,session}=await createShell();
    const base="/EXTERNAL/computer/drive0/Users/Guest";
    await session.run("md Scratch");
    expect((await session.run("rmdir Scratch")).errorlevel).toBe(0);
    expect(await fs.stat(base+"/Scratch")).toBeNull();
    await fs.write("preserve",base+"/Documents/safe.txt");
    expect((await session.run("rd Documents")).output).toEqual(["The directory is not empty."]);
    expect((await session.run("rd /s Documents")).errorlevel).toBe(1);
    expect(await fs.read(base+"/Documents/safe.txt")).toBe("preserve");
    expect((await session.run("rd Documents\\safe.txt")).output).toEqual([
      "The directory name is invalid."
    ]);
    expect((await session.run("rd Scratch")).output).toEqual([
      "The system cannot find the path specified."
    ]);
  });
});

describe("original cmd.js Te DEL and ERASE named paths and missing wildcard safeguards",()=>{
  it("deletes a named source VFS file but never deletes a directory or nonexistent wildcard",async()=>{
    const {fs,session}=await createShell();
    const base="/EXTERNAL/computer/drive0/Users/Guest/Documents";
    await fs.write("temporary",base+"/temp.txt");
    await fs.write("permanent",base+"/keep.txt");
    expect((await session.run("erase Documents\\temp.txt")).errorlevel).toBe(0);
    expect(await fs.stat(base+"/temp.txt")).toBeNull();
    expect((await session.run("del Documents\\*.log")).errorlevel).toBe(1);
    expect(await fs.read(base+"/keep.txt")).toBe("permanent");
    expect((await session.run("del Documents")).errorlevel).toBe(1);
    expect(await fs.stat(base)).toMatchObject({type:"directory"});
    expect((await session.run("del Documents\\missing.txt")).output).toEqual([
      "Could Not Find C:\\Users\\Guest\\Documents\\missing.txt"
    ]);
  });
});

describe("original cmd.js Pe COPY/MOVE exact source file transfer",()=>{
  it("COPY leaves the original intact and uses byte-preserving Guest VFS storage",async()=>{
    const {fs,session}=await createShell();
    const base="/EXTERNAL/computer/drive0/Users/Guest";
    await fs.writeBytes(new Uint8Array([0,7,255,80]),base+"/Documents/binary.dat");
    expect((await session.run("copy Documents\\binary.dat Desktop")).output)
      .toEqual(["        1 file(s) copied."]);
    expect(Array.from(await fs.readBytes(base+"/Desktop/binary.dat"))).toEqual([0,7,255,80]);
    expect(Array.from(await fs.readBytes(base+"/Documents/binary.dat"))).toEqual([0,7,255,80]);
    expect((await session.run("copy Documents\\binary.dat Desktop")).output)
      .toEqual(["Access is denied."]);
  });
  it("MOVE accepts source concrete filename and explicit destination, without host access",async()=>{
    const {fs,session}=await createShell();
    const base="/EXTERNAL/computer/drive0/Users/Guest";
    await fs.write("keep content",base+"/Documents/current.txt");
    expect((await session.run("move Documents\\current.txt Documents\\moved.txt")).output)
      .toEqual(["        1 file(s) moved."]);
    expect(await fs.stat(base+"/Documents/current.txt")).toBeNull();
    expect(await fs.read(base+"/Documents/moved.txt")).toBe("keep content");
    expect((await session.run("copy Documents\\missing.txt Desktop")).output)
      .toEqual(["The system cannot find the file specified."]);
    expect((await session.run("copy Documents Desktop")).errorlevel).toBe(1);
  });
  it("does not invent unsafe wildcard/multiple source transfer behavior",async()=>{
    const {fs,session}=await createShell();
    const base="/EXTERNAL/computer/drive0/Users/Guest";
    await fs.write("safe",base+"/Documents/one.txt");
    expect((await session.run("move Documents\\*.txt Desktop")).errorlevel).toBe(1);
    expect(await fs.read(base+"/Documents/one.txt")).toBe("safe");
    expect((await session.run("copy")).output).toEqual([
      "The syntax of the command is incorrect."
    ]);
    expect((await session.run("move Documents\\one.txt Q:\\NoDisk")).errorlevel).toBe(1);
    expect(await fs.read(base+"/Documents/one.txt")).toBe("safe");
  });
});

describe("source cmd.js environment and console COLOR/SET/PATH",()=>{
  it("seeds source Dt variables from mounted Guest C: without exposing host env",async()=>{
    const {session}=await createShell();
    expect(session.environmentVariables).toContainEqual({
      name:"USERPROFILE",value:"C:\\Users\\Guest"
    });
    expect(session.environmentVariables).toContainEqual({name:"OS",value:"Windows_NT"});
    expect(session.environmentVariables.some(item=>item.name==="COMPUTERNAME"))
      .toBe(false);
    expect((await session.run("set userprofile")).output).toEqual([
      "USERPROFILE=C:\\Users\\Guest"
    ]);
  });
  it("SET stores case-insensitive variable keys, preserves original casing and removes empty values",async()=>{
    const {session}=await createShell();
    expect((await session.run("set project=Test = Valid")).errorlevel).toBe(0);
    expect((await session.run("set PROJ")).output).toEqual(["project=Test = Valid"]);
    await session.run("set PROJECT=Updated");
    expect((await session.run("set project")).output).toEqual(["project=Updated"]);
    await session.run("set Project=");
    expect((await session.run("set project")).output).toEqual([
      "Environment variable project not defined"
    ]);
    expect((await session.run("set =bad")).output).toEqual([
      "The syntax of the command is incorrect."
    ]);
    expect((await session.run("set")).output.some(line=>line.startsWith("USERPROFILE=")))
      .toBe(true);
  });
  it("PATH reads, clears and sets simulated source Windows search path, never real shell PATH",async()=>{
    const {session}=await createShell();
    expect((await session.run("path")).output).toContain(
      "PATH=C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem"
    );
    await session.run("path ;");
    expect((await session.run("path")).output).toEqual(["PATH=(null)"]);
    await session.run("path C:\\Tools;C:\\Bin");
    // Original bt stores new spelling PATH after PATH ; clears the old Path;
    // SET prefix listing must also include the separately seeded PATHEXT.
    expect((await session.run("set path")).output).toEqual([
      "PATH=C:\\Tools;C:\\Bin",
      "PATHEXT=.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC"
    ]);
  });
  it("COLOR uses pinned F color palette and rejects identical background/foreground",async()=>{
    const {session}=await createShell();
    expect((await session.run("color fc")).style).toEqual({
      backgroundColor:"#f2f2f2",color:"#e74856"
    });
    const invalid=await session.run("color ff");
    expect(invalid.errorlevel).toBe(1);
    expect(invalid.style).toBeUndefined();
    expect((await session.run("color zz")).output).toContain("COLOR [attr]");
    expect((await session.run("color")).style).toBeNull();
  });
});

describe("pinned cmd.js Ct() percent variable expansion before command parsing",()=>{
  it("substitutes only valid, defined %VAR% references once",()=>{
    const env=new Map([["TEST","123"],["NEST","%TEST%"]]);
    const lookup=(name:string)=>env.get(name.toUpperCase());
    expect(sourceCmdExpandVariables("%test%/%missing%/%NEST%",lookup))
      .toBe("123/%missing%/%TEST%");
    expect(sourceCmdExpandVariables("%BAD NAME%",lookup)).toBe("%BAD NAME%");
    expect(sourceCmdExpandVariables("%%",lookup)).toBe("%%");
  });
  it("integrates SET values and per-command CD and ERRORLEVEL source variables",async()=>{
    const {session}=await createShell();
    await session.run("set Person=Guest");
    const echoed=await session.run("echo Welcome %PERSON%");
    expect(echoed.input).toBe("echo Welcome %PERSON%");
    expect(echoed.output).toEqual(["Welcome Guest"]);
    expect((await session.run("echo %UNKNOWN%")).output).toEqual(["%UNKNOWN%"]);
    await session.run("cd Documents");
    expect((await session.run("echo %CD%")).output)
      .toEqual(["C:\\Users\\Guest\\Documents"]);
    await session.run("notacommand");
    expect((await session.run("echo %errorlevel%")).output).toEqual(["9009"]);
    expect((await session.run("echo %errorlevel%")).output).toEqual(["0"]);
  });
});

describe("source cmd.js TREE, VOL, DATE and TIME output",()=>{
  it("calculates original source serial from mounted volume metadata",async()=>{
    const {session}=await createShell();
    expect(sourceCmdVolumeSerial("C","System")).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect((await session.run("vol")).output).toEqual([
      " Volume in drive C is System",
      " Volume Serial Number is "+sourceCmdVolumeSerial("C","System")
    ]);
    expect((await session.run("vol Q:")).output).toEqual([
      "The system cannot find the drive specified."
    ]);
  });
  it("formats source DATE and TIME from injected clock instead of changing host time",async()=>{
    const fs=new VirtualFileStore();
    await ensureSourceGuestDirectories(fs);
    const volume=new LegacyVolumeSession(fs,sourceGuestMounts());
    const date=new Date(2025,4,4,9,3,2,457);
    const session=new SourceCmdSession(fs,volume,SOURCE_GUEST_PROFILE,()=>date);
    expect(sourceCmdDateValue(date)).toBe("Sun 05/04/2025");
    expect(sourceCmdTimeValue(date)).toBe("09:03:02.45");
    expect((await session.run("date")).output).toEqual([
      "The current date is: Sun 05/04/2025"
    ]);
    expect((await session.run("date /t")).output).toEqual(["Sun 05/04/2025"]);
    expect((await session.run("time")).output).toEqual([
      "The current time is: 09:03:02.45"
    ]);
    expect((await session.run("time /t")).output).toEqual(["09:03:02.45"]);
  });
  it("TREE shows the actual Guest VFS source folders with source branch art and /F files",async()=>{
    const {fs,session}=await createShell();
    const base="/EXTERNAL/computer/drive0/Users/Guest/Documents";
    await fs.mkdir(base+"/Bravo");
    await fs.mkdir(base+"/Alpha");
    await fs.write("notes",base+"/notes.txt");
    const tree=await session.run("tree Documents");
    expect(tree.output.slice(0,3)).toEqual([
      "Folder PATH listing for volume System",
      "Volume Serial Number is "+sourceCmdVolumeSerial("C","System"),
      "C:\\USERS\\GUEST\\DOCUMENTS"
    ]);
    expect(tree.output.slice(3)).toEqual(["├───Alpha","└───Bravo"]);
    const withFiles=await session.run("tree Documents /f");
    expect(withFiles.output.slice(3)).toEqual([
      "├───Alpha","├───Bravo","└───notes.txt"
    ]);
    expect((await session.run("tree Documents /q")).errorlevel).toBe(1);
  });
});

describe("pinned cmd.js b894 Tab completion from actual mounted Guest VFS",()=>{
  it("splits quoted and unquoted paths using original a() and c() rules",()=>{
    expect(sourceCmdCompletionTarget('type "My Files\\Re')).toEqual({
      head:"type ",dir:"My Files\\",prefix:"Re"
    });
    expect(sourceCmdCompletionTarget("copy Documents\\ab Desktop")).toEqual({
      head:"copy Documents\\ab ",dir:"",prefix:"Desktop"
    });
    expect(sourceCmdCompletionTarget("dir /b Documents\\fi")).toEqual({
      head:"dir /b ",dir:"Documents\\",prefix:"fi"
    });
    expect(sourceCmdApplyCompletion(
      {head:"type ",dir:"My Files\\",prefix:"Re"},"Read me.txt"
    )).toBe('type "My Files\\Read me.txt"');
    expect(sourceCmdApplyCompletion(
      {head:"cd ",dir:"",prefix:"Do"},"Documents"
    )).toBe("cd Documents");
  });

  it("filters and sorts actual Guest directory entries without mutating files",async()=>{
    const {fs,session}=await createShell();
    const root="/EXTERNAL/computer/drive0/Users/Guest/Documents";
    await fs.write("safe",root+"/Read Me.txt");
    await fs.write("safe",root+"/readme.txt");
    const found=await session.complete("type Documents\\re");
    expect(found.target).toEqual({
      head:"type ",dir:"Documents\\",prefix:"re"
    });
    expect(found.matches).toEqual(["Read Me.txt","readme.txt"]);
    expect(sourceCmdApplyCompletion(found.target,found.matches[0]))
      .toBe('type "Documents\\Read Me.txt"');
    const quoted=await session.complete('type "Documents\\READ');
    expect(quoted.matches).toEqual(["Read Me.txt","readme.txt"]);
    expect(await session.complete("type Q:\\Unavailable"))
      .toEqual({
        target:{head:"type ",dir:"Q:\\",prefix:"Unavailable"},matches:[]
      });
    expect(await fs.read(root+"/Read Me.txt")).toBe("safe");
  });
});

describe("original cmd.js b894 Ht.trim() transcript retention",()=>{
  it("retains exactly the newest 300 source output entries without discarding live input",()=>{
    expect(SOURCE_CMD_MAX_TRANSCRIPT_ENTRIES).toBe(300);
    const entries=Array.from({length:305},(_,i)=>i);
    expect(sourceCmdTrimEntries(entries)).toEqual(entries.slice(5));
    expect(sourceCmdTrimEntries(entries).length).toBe(300);
    expect(sourceCmdTrimEntries([1,2])).toEqual([1,2]);
    expect(entries.length).toBe(305);
  });
});


describe("source cmd.js gt()/mt() conditional && || and & chain grammar",()=>{
  it("splits only unquoted operators, with the source following-segment annotation",()=>{
    expect(sourceCmdChainSegments('echo "A & B && C | D" & echo done')).toEqual([
      {text:'echo "A & B && C | D" ',operator:""},
      {text:" echo done",operator:"&"}
    ]);
    expect(sourceCmdChainSegments("echo one && echo two || echo three & echo four"))
      .toEqual([
        {text:"echo one ",operator:""},
        {text:" echo two ",operator:"&&"},
        {text:" echo three ",operator:"||"},
        {text:" echo four",operator:"&"}
      ]);
    expect(sourceCmdChainSegments('echo "unclosed && quotes & not split'))
      .toEqual([{text:'echo "unclosed && quotes & not split',operator:""}]);
  });

  it("executes sequential ampersands and conditional success/failure via real CMD status",async()=>{
    const {session}=await createShell();
    expect((await session.run("echo First & echo Second")).output)
      .toEqual(["First ","Second"]);
    expect((await session.run("echo Yes && echo Followed || echo Skipped")).output)
      .toEqual(["Yes ","Followed "]);
    const failure=await session.run("thiscommanddoesnotexist && echo Skipped || echo Recovered");
    expect(failure.output).toEqual([
      "'thiscommanddoesnotexist' is not recognized as an internal or external command,",
      "operable program or batch file.","Recovered"
    ]);
    expect(failure.errorlevel).toBe(0);
    expect((await session.run("thiscommanddoesnotexist & echo After")).output.at(-1))
      .toBe("After");
    expect((await session.run('echo "A & B"')).output)
      .toEqual(['"A & B"']);
  });

  it("runs conditional filesystem changes safely on shared Guest VFS",async()=>{
    const {fs,session}=await createShell();
    const command=await session.run('md ChainWork && cd ChainWork & echo %CD%');
    expect(command.output).toEqual(["C:\\Users\\Guest"]);
    expect(session.currentDirectory).toBe("C:\\Users\\Guest\\ChainWork");
    expect((await fs.stat("/EXTERNAL/computer/drive0/Users/Guest/ChainWork"))
      ?.type).toBe("directory");
    await session.run("rd ChainWork");
    expect((await session.run("cd Nonexistent && md ShouldNotExist")).errorlevel)
      .toBe(1);
    expect(await fs.stat("/EXTERNAL/computer/drive0/Users/Guest/ShouldNotExist"))
      .toBeNull();
  });

  it("expands %vars% once before parsing chains, preserves skip and blank errorlevel",async()=>{
    const {session}=await createShell();
    await session.run("set SAMPLE=before");
    expect((await session.run("echo %SAMPLE% & set SAMPLE=after & echo %SAMPLE%")).output)
      .toEqual(["before ","before"]);
    expect((await session.run("echo %SAMPLE%")).output).toEqual(["after"]);
    await session.run("unknowncommand");
    expect((await session.run(" ")).errorlevel).toBe(9009);
    expect((await session.run("echo ok || echo skipped")).output).toEqual(["ok "]);
  });
});


describe("source cmd.js wt()/Tt.writeFile output redirects",()=>{
  it("honors the last unquoted > or >>, preserving quoted paths and empty-target text",()=>{
    expect(sourceCmdParseRedirect('echo "quoted > text" > "Documents\\my report.txt"'))
      .toEqual({text:'echo "quoted > text" ',redirect:{
        path:"Documents\\my report.txt",append:false
      }});
    expect(sourceCmdParseRedirect("echo one > Documents\\first.txt >> Documents\\next.txt"))
      .toEqual({text:"echo one > Documents\\first.txt ",redirect:{
        path:"Documents\\next.txt",append:true
      }});
    expect(sourceCmdParseRedirect("echo text >"))
      .toEqual({text:"echo text >",redirect:null});
    expect(sourceCmdParseRedirect('echo "literal >>"'))
      .toEqual({text:'echo "literal >>"',redirect:null});
  });
  it("writes overwrite and append source CRLF records into actual mounted Guest files",async()=>{
    const {fs,session}=await createShell();
    const document="/EXTERNAL/computer/drive0/Users/Guest/Documents/report.txt";
    const first=await session.run("echo Alpha > Documents\\report.txt");
    expect(first.output).toEqual([]);
    expect(first.errorlevel).toBe(0);
    expect(await fs.read(document)).toBe("Alpha \r\n");
    expect((await session.run("echo Beta >> Documents\\report.txt")).output)
      .toEqual([]);
    expect(await fs.read(document)).toBe("Alpha \r\nBeta \r\n");
    await session.run("echo Replaced > Documents\\report.txt");
    expect(await fs.read(document)).toBe("Replaced \r\n");
    const quote=await session.run('echo "A > B" > "Documents\\space name.txt"');
    expect(quote.output).toEqual([]);
    expect(await fs.read("/EXTERNAL/computer/drive0/Users/Guest/Documents/space name.txt"))
      .toBe('"A > B" \r\n');
  });
  it("preserves errors for missing drives/directories and protects existing binary data",async()=>{
    const {fs,session}=await createShell();
    expect((await session.run("echo unsafe > Q:\\file.txt")).output)
      .toEqual(["The system cannot find the drive specified."]);
    expect((await session.run("echo unsafe > Documents\\missing\\file.txt")).output)
      .toEqual(["Access is denied."]);
    const binary="/EXTERNAL/computer/drive0/Users/Guest/Documents/immutable.bin";
    await fs.writeBytes(new Uint8Array([0,1,255,77]),binary);
    expect((await session.run("echo corrupt >> Documents\\immutable.bin")).errorlevel)
      .toBe(1);
    expect(Array.from(await fs.readBytes(binary))).toEqual([0,1,255,77]);
    expect((await session.run("echo invalid > Documents")).errorlevel).toBe(1);
  });
  it("composes source conditional chains around redirected commands",async()=>{
    const {fs,session}=await createShell();
    const path="/EXTERNAL/computer/drive0/Users/Guest/Documents/chain.txt";
    const result=await session.run(
      "echo first > Documents\\chain.txt && echo next >> Documents\\chain.txt & type Documents\\chain.txt"
    );
    expect(result.output).toEqual(["first ","next ",""]);
    expect(result.errorlevel).toBe(0);
    expect(await fs.read(path)).toBe("first \r\nnext \r\n");
    const unknown=await session.run("badcommand > Documents\\error.txt");
    expect(unknown.output).toEqual([]);
    expect(unknown.errorlevel).toBe(0);
    expect((await fs.read("/EXTERNAL/computer/drive0/Users/Guest/Documents/error.txt")))
      .toContain("not recognized as an internal or external command");
  });
});


describe("original cmd.js yt()/ie FIND SORT MORE source VFS pipelines",()=>{
  it("splits unquoted pipes but never pipe art inside quotes",()=>{
    expect(sourceCmdPipelineSegments('echo "a | b" | find /i "A" | more'))
      .toEqual(['echo "a | b" ',' find /i "A" ',' more']);
    expect(sourceCmdPipelineSegments("echo intact")).toEqual(["echo intact"]);
  });
  it("filters case-insensitively and counts or inverts original Guest file lines",async()=>{
    const {fs,session}=await createShell();
    const path="/EXTERNAL/computer/drive0/Users/Guest/Documents/pipeline.txt";
    await fs.write("zebra\r\nApple\r\napple\r\n",path);
    expect((await session.run('find /i "apple" Documents\\pipeline.txt')).output)
      .toEqual(["Apple","apple"]);
    expect((await session.run('find /c "apple" Documents\\pipeline.txt')).output)
      .toEqual(["---------- : 1"]);
    expect((await session.run('find /v "apple" Documents\\pipeline.txt')).output)
      .toEqual(["zebra","Apple",""]);
    expect((await session.run('find "missing" Documents\\pipeline.txt')).errorlevel)
      .toBe(1);
    expect((await session.run('find /c "missing" Documents\\pipeline.txt')).errorlevel)
      .toBe(0);
    expect((await session.run("more Documents\\pipeline.txt")).output)
      .toEqual(["zebra","Apple","apple",""]);
    expect((await session.run("more Q:\\not-mounted.txt")).output)
      .toEqual(["The system cannot find the file specified."]);
  });
  it("pipes through actual source SORT/FIND/MORE and redirects only last stage",async()=>{
    const {fs,session}=await createShell();
    await fs.write("zebra\r\nApple\r\napple\r\n",
      "/EXTERNAL/computer/drive0/Users/Guest/Documents/pipeline.txt");
    expect((await session.run("type Documents\\pipeline.txt | sort /r")).output)
      .toEqual(["zebra","apple","Apple",""]);
    const filtered=await session.run('type Documents\\pipeline.txt | find /i "apple" | more');
    expect(filtered.output).toEqual(["Apple","apple"]);
    expect(filtered.errorlevel).toBe(0);
    const count=await session.run('type Documents\\pipeline.txt | find /i /c "apple"');
    expect(count.output).toEqual(["---------- : 2"]);
    const directed=await session.run(
      'type Documents\\pipeline.txt | find /i "apple" > Documents\\filtered.txt'
    );
    expect(directed.output).toEqual([]);
    expect(await fs.read("/EXTERNAL/computer/drive0/Users/Guest/Documents/filtered.txt"))
      .toBe("Apple\r\napple\r\n");
    expect((await session.run('echo "a | b" | more')).output)
      .toEqual(['"a | b" ']);
  });
  it("handles malformed FIND and file errors without native host pipelines",async()=>{
    const {session}=await createShell();
    expect((await session.run("find")).output)
      .toEqual(["The syntax of the command is incorrect."]);
    expect((await session.run('sort Q:\\host-secret.txt')).output)
      .toEqual(["The system cannot find the file specified."]);
    expect((await session.run('echo sample | find missing')).errorlevel).toBe(1);
  });
});


describe("original cmd.js vt()/Te.echo separator whitespace fidelity",()=>{
  it("keeps all untouched separator whitespace before ECHO arguments",()=>{
    expect(sourceCmdRawRest(" echo   padded  ")).toBe("   padded  ");
    expect(sourceCmdRawRest("echo\tpadded")).toBe("\tpadded");
    expect(sourceCmdRawRest('echo "A & B"')).toBe(' "A & B"');
    expect(sourceCmdRawRest("echo")).toBe("");
  });
  it("strips only the first separating ASCII space, not meaningful input",async()=>{
    const {session}=await createShell();
    expect((await session.run("echo   padded  ")).output).toEqual(["  padded  "]);
    expect((await session.run("echo\tpadded")).output).toEqual(["\tpadded"]);
    expect((await session.run("echo   off")).echo).toBe(false);
    expect((await session.run("echo   .")).output).toEqual([""]);
    expect((await session.run("echo   on")).echo).toBe(true);
    expect((await session.run("echo first & echo second")).output)
      .toEqual(["first ","second"]);
  });
});


describe("original cmd.js Ht.interrupt Ctrl+C transcript behavior",()=>{
  it("records idle input with ^C without executing, changing source errorlevel or command history",async()=>{
    const {session}=await createShell();
    const previous=await session.run("notarealcommand");
    const entries=sourceCmdInterruptedEntries([previous],{
      busy:false,prompt:session.prompt,input:"echo unfinished",
      echo:session.echoEnabled,errorlevel:session.errorlevel
    });
    expect(entries).toHaveLength(2);
    expect(entries[1]).toEqual({
      prompt:"C:\\Users\\Guest>",input:"echo unfinished^C",output:[],
      echo:true,errorlevel:9009
    });
    expect(session.errorlevel).toBe(9009);
  });
  it("appends ^C to pending output rather than creating another command line",()=>{
    const previous={prompt:"C:\\Users\\Guest>",input:"tree /f",
      output:["Folder PATH listing"],echo:true,errorlevel:0};
    const entries=sourceCmdInterruptedEntries([previous],{
      busy:true,prompt:previous.prompt,input:"",echo:true,errorlevel:0
    });
    expect(entries).toEqual([{
      ...previous,output:["Folder PATH listing","^C"]
    }]);
    expect(previous.output).toEqual(["Folder PATH listing"]);
  });
  it("retains the original last-300 transcript limit for both interruption paths",()=>{
    const existing=Array.from({length:300},(_,i)=>({
      prompt:"C:\\>",input:"echo "+i,output:[],echo:true,errorlevel:0
    }));
    const entries=sourceCmdInterruptedEntries(existing,{
      busy:false,prompt:"C:\\>",input:"next",echo:true,errorlevel:0
    });
    expect(entries).toHaveLength(300);
    expect(entries[0].input).toBe("echo 1");
    expect(entries[299].input).toBe("next^C");
  });
});

describe("original cmd.js ze.pause and b894 host.waitForKey source interaction",()=>{
  it("displays source pause message and waits for an injected keyboard acknowledgement",async()=>{
    const prompts:string[]=[];
    let resolveKey:((key:string)=>void)|undefined;
    const {session}=await createShell(message=>{
      prompts.push(message);
      return new Promise<string>(resolve=>{resolveKey=resolve;});
    });
    let finished=false;
    const command=session.run("pause").then(result=>{
      finished=true;
      return result;
    });
    await Promise.resolve();
    expect(prompts).toEqual(["Press any key to continue . . ."]);
    expect(finished).toBe(false);
    resolveKey?.("Space");
    expect((await command).output).toEqual(["Press any key to continue . . ."]);
    expect(finished).toBe(true);
    expect(session.errorlevel).toBe(0);
  });
  it("resumes chained commands from the same Guest shell after PAUSE",async()=>{
    const messages:string[]=[];
    const {session}=await createShell(async message=>{
      messages.push(message);
      return "Enter";
    });
    const result=await session.run("echo Before & pause & echo After");
    expect(messages).toEqual(["Press any key to continue . . ."]);
    expect(result.output).toEqual([
      "Before ","Press any key to continue . . .","After"
    ]);
    expect(result.errorlevel).toBe(0);
  });
  it("fails visibly instead of hanging if no user input host exists",async()=>{
    const {session}=await createShell();
    const result=await session.run("pause");
    expect(result.output).toEqual(["PAUSE requires an interactive console."]);
    expect(result.errorlevel).toBe(1);
  });
});


describe("pinned source RD /S confirmation via host.waitForKey on Guest VFS",()=>{
  it("requires Y to atomically remove a nonempty Guest folder and keeps N intact",async()=>{
    const prompts:string[]=[];
    let response="n";
    const {fs,session}=await createShell(async message=>{
      prompts.push(message);
      return response;
    });
    const root="/EXTERNAL/computer/drive0/Users/Guest/Documents/Recursive";
    await fs.mkdir(root);
    await fs.mkdir(root+"/Nested");
    await fs.write("important",root+"/Nested/note.txt");
    expect((await session.run("rd Documents\\Recursive")).output)
      .toEqual(["The directory is not empty."]);
    const denied=await session.run("rmdir /s Documents\\Recursive");
    expect(denied.output).toEqual([
      "C:\\Users\\Guest\\Documents\\Recursive, Are you sure (Y/N)? n"
    ]);
    expect(denied.errorlevel).toBe(0);
    expect(await fs.read(root+"/Nested/note.txt")).toBe("important");
    response="Y";
    const approved=await session.run("rd /s Documents\\Recursive");
    expect(approved.output).toEqual([
      "C:\\Users\\Guest\\Documents\\Recursive, Are you sure (Y/N)? Y"
    ]);
    expect(approved.errorlevel).toBe(0);
    expect(await fs.stat(root)).toBeNull();
    expect(await fs.stat(root+"/Nested/note.txt")).toBeNull();
    expect(prompts).toHaveLength(2);
  });
  it("does not ask confirmation for an empty directory even with /s",async()=>{
    let timesAsked=0;
    const {fs,session}=await createShell(async ()=>{
      timesAsked++;
      return "n";
    });
    const path="/EXTERNAL/computer/drive0/Users/Guest/Documents/EmptyForRD";
    await fs.mkdir(path);
    expect((await session.run("rd /s Documents\\EmptyForRD")).output).toEqual([]);
    expect(await fs.stat(path)).toBeNull();
    expect(timesAsked).toBe(0);
  });
  it("refuses nonempty recursive removal when interactive key reader is missing",async()=>{
    const {fs,session}=await createShell();
    const root="/EXTERNAL/computer/drive0/Users/Guest/Documents/Protected";
    await fs.mkdir(root);
    await fs.write("keep",root+"/file.txt");
    expect((await session.run("rd /s Documents\\Protected")).output)
      .toEqual(["RD /S requires interactive confirmation."]);
    expect(await fs.read(root+"/file.txt")).toBe("keep");
  });
});


describe("pinned Te.del, De(), xe() and ke() Guest wildcard confirmation",()=>{
  it("removes matching files only, case-insensitively, without touching directories",async()=>{
    const {fs,session}=await createShell();
    const root="/EXTERNAL/computer/drive0/Users/Guest/Documents";
    await fs.write("1",root+"/One.TXT");
    await fs.write("2",root+"/Two.txt");
    await fs.write("keep",root+"/Safe.log");
    await fs.mkdir(root+"/KeepFolder");
    expect((await session.run("del Documents\\*.txt")).output).toEqual([]);
    expect(await fs.stat(root+"/One.TXT")).toBeNull();
    expect(await fs.stat(root+"/Two.txt")).toBeNull();
    expect(await fs.read(root+"/Safe.log")).toBe("keep");
    expect((await fs.stat(root+"/KeepFolder"))?.type).toBe("directory");
  });
  it("requires Y for DEL of all files in an existing directory",async()=>{
    const prompts:string[]=[];
    let key="n";
    const {fs,session}=await createShell(async prompt=>{
      prompts.push(prompt);
      return key;
    });
    const root="/EXTERNAL/computer/drive0/Users/Guest/Documents/AllFiles";
    await fs.mkdir(root);
    await fs.mkdir(root+"/SubFolder");
    await fs.write("survives",root+"/a.txt");
    const denied=await session.run("del Documents\\AllFiles");
    expect(denied.output).toEqual([
      "C:\\Users\\Guest\\Documents\\AllFiles\\*, Are you sure (Y/N)? n"
    ]);
    expect(await fs.read(root+"/a.txt")).toBe("survives");
    key="Y";
    const permitted=await session.run("del Documents\\AllFiles\\*");
    expect(permitted.output).toEqual([
      "C:\\Users\\Guest\\Documents\\AllFiles\\*, Are you sure (Y/N)? Y"
    ]);
    expect(await fs.stat(root+"/a.txt")).toBeNull();
    expect((await fs.stat(root+"/SubFolder"))?.type).toBe("directory");
    expect(prompts).toHaveLength(2);
  });
  it("protects all-files deletes without an interactive confirmation reader",async()=>{
    const {fs,session}=await createShell();
    const root="/EXTERNAL/computer/drive0/Users/Guest/Documents/NoHost";
    await fs.mkdir(root);
    await fs.write("keep",root+"/precious.txt");
    expect((await session.run("erase Documents\\NoHost\\*")).output)
      .toEqual(["DEL all-files requires interactive confirmation."]);
    expect(await fs.read(root+"/precious.txt")).toBe("keep");
  });
});


describe("original cmd.js ze.cmd interpreter banner command",()=>{
  it("prints the pinned simulated Win7 banner without opening host processes",async()=>{
    const {session}=await createShell();
    const result=await session.run("cmd");
    expect(result.output).toEqual([...SOURCE_CMD_BANNER]);
    expect(result.errorlevel).toBe(0);
    expect((await session.run("help cmd")).output[0])
      .toContain("Starts a new instance");
    expect((await session.run("cmd && echo still-in-guest")).output)
      .toEqual([...SOURCE_CMD_BANNER,"still-in-guest"]);
  });
});


describe("original cmd.js Te.dir source /B /S /W and formatting",()=>{
  it("formats source pe rows, me totals and 5-column V(j()) in source order",()=>{
    const item={uri:"/Virtual/demo.txt",name:"demo.txt",type:"file" as const,
      size:12345,mtime:new Date(2024,1,3,14,5).getTime()};
    expect(sourceCmdDirDetailLine(item))
      .toBe("02/03/2024  02:05 PM            12,345 demo.txt");
    expect(sourceCmdDirSummary(2,1,12500,300)[0])
      .toContain("2 File(s)");
    expect(sourceCmdDirSummary(2,1,12500,300)[1])
      .toContain("300 bytes free");
    expect(sourceCmdDirWideLines([
      {name:"a",type:"file"},{name:"b",type:"file"},
      {name:"c",type:"directory"},{name:"d",type:"file"},
      {name:"e",type:"file"},{name:"f",type:"file"}
    ])).toEqual(["a  [c]  e","b  d    f"]);
    expect(SOURCE_CMD_DIR_MAX_DEPTH).toBe(12);
    expect(SOURCE_CMD_DIR_MAX_ENTRIES).toBe(5000);
  });
  it("lists case-insensitive wildcard matches across real nested Guest folders",async()=>{
    const {fs,session}=await createShell();
    const root="/EXTERNAL/computer/drive0/Users/Guest/Documents";
    await fs.mkdir(root+"/Nested");
    await fs.mkdir(root+"/Nested/Deep");
    await fs.write("x",root+"/Alpha.TXT");
    await fs.write("y",root+"/Nested/Beta.txt");
    await fs.write("z",root+"/Nested/Deep/Gamma.TXT");
    await fs.write("keep",root+"/Nested/Deep/ignored.log");
    const bare=await session.run("dir /b /s Documents\\*.txt");
    expect(bare.output).toEqual([
      "C:\\Users\\Guest\\Documents\\Alpha.TXT",
      "C:\\Users\\Guest\\Documents\\Nested\\Beta.txt",
      "C:\\Users\\Guest\\Documents\\Nested\\Deep\\Gamma.TXT"
    ]);
    expect((await session.run("dir /b Documents\\Nested\\Deep")).output)
      .toEqual(["Gamma.TXT","ignored.log"]);
    expect((await session.run("dir /b Documents\\Alpha.TXT")).output)
      .toEqual(["Alpha.TXT"]);
  });
  it("shows source volume/header/summary and wide directory brackets",async()=>{
    const {fs,session}=await createShell();
    const root="/EXTERNAL/computer/drive0/Users/Guest/Documents";
    await fs.mkdir(root+"/Nested");
    await fs.write("hello",root+"/Example.txt");
    const wide=await session.run("dir /w Documents");
    expect(wide.errorlevel).toBe(0);
    expect(wide.output).toContain(" Volume in drive C is System");
    expect(wide.output.some(s=>s.includes("Volume Serial Number is"))).toBe(true);
    expect(wide.output).toContain(" Directory of C:\\Users\\Guest\\Documents");
    expect(wide.output.some(s=>s.includes("[Nested]"))).toBe(true);
    expect(wide.output.some(s=>s.includes("Example.txt"))).toBe(true);
    expect(wide.output.some(s=>s.includes("1 File(s)"))).toBe(true);
    expect(wide.output.some(s=>s.includes("1 Dir(s)"))).toBe(true);
    const full=await session.run("dir Documents");
    expect(full.output.some(s=>s.includes("<DIR>")&&s.includes("Nested"))).toBe(true);
    expect(full.output.some(s=>/^\d\d\/\d\d\/\d{4}/.test(s))).toBe(true);
  });
  it("bounds recursive listings at source 12 levels and rejects invalid flags",async()=>{
    const {fs,session}=await createShell();
    let path="/EXTERNAL/computer/drive0/Users/Guest/Documents";
    for(let i=0;i<14;i++){
      path+="/Level"+i;
      await fs.mkdir(path);
      await fs.write(String(i),path+"/log.txt");
    }
    const listing=await session.run("dir /b /s Documents\\*.txt");
    expect(listing.errorlevel).toBe(0);
    expect(listing.output.some(s=>s.includes("Level11\\log.txt"))).toBe(true);
    expect(listing.output.some(s=>s.includes("Level12\\log.txt"))).toBe(false);
    expect((await session.run("dir /z Documents")).errorlevel).toBe(1);
  });
});


describe("original cmd.js ze.where and c170 installed-program paths",()=>{
  it("maps source program IDs aliases and executable names to C: installs",()=>{
    expect(sourceCmdWhereInstallPath("notepad"))
      .toBe("C:\\Windows\\System32\\notepad.exe");
    expect(sourceCmdWhereInstallPath("NOTEPAD.EXE"))
      .toBe("C:\\Windows\\System32\\notepad.exe");
    expect(sourceCmdWhereInstallPath("mspaint"))
      .toBe("C:\\Windows\\System32\\mspaint.exe");
    expect(sourceCmdWhereInstallPath("calculator"))
      .toBe("C:\\Windows\\System32\\calc.exe");
    expect(sourceCmdWhereInstallPath("cmd"))
      .toBe("C:\\Windows\\System32\\cmd.exe");
    expect(sourceCmdWhereInstallPath("unlisted-binary")).toBeNull();
  });
  it("reports installed source paths with original help and errorlevel behavior",async()=>{
    const {session}=await createShell();
    expect((await session.run("where notepad")).output)
      .toEqual(["C:\\Windows\\System32\\notepad.exe"]);
    expect((await session.run("where mspaint.exe")).output)
      .toEqual(["C:\\Windows\\System32\\mspaint.exe"]);
    const missing=await session.run("where unknownprogram");
    expect(missing.output)
      .toEqual(["INFO: Could not find files for the given pattern(s)."]);
    expect(missing.errorlevel).toBe(1);
    const help=await session.run("where");
    expect(help.output).toContain("WHERE program");
    expect(help.errorlevel).toBe(1);
  });
});


describe("pinned original ze.start app launch via source desktop registry",()=>{
  it("resolves original source IDs/aliases, never arbitrary host commands",()=>{
    expect(sourceCmdResolveProgramId("mspaint.exe")).toBe("paint");
    expect(sourceCmdResolveProgramId("calculator")).toBe("calc");
    expect(sourceCmdResolveProgramId("NOTEPAD")).toBe("notepad");
    expect(sourceCmdResolveProgramId("uninstalled-native-program")).toBeNull();
  });
  it("only opens installed source apps through the injected desktop callback",async()=>{
    const fs=new VirtualFileStore();
    const volume=new LegacyVolumeSession(fs,sourceGuestMounts());
    await volume.mount();
    await ensureSourceGuestDirectories(fs);
    const launched:string[]=[];
    const session=new SourceCmdSession(fs,volume,SOURCE_GUEST_PROFILE,
      ()=>new Date(),undefined,id=>{launched.push(id);return id==="notepad";});
    expect((await session.run("start notepad")).output).toEqual([]);
    expect((await session.run("start notepad")).errorlevel).toBe(0);
    expect(launched).toEqual(["notepad","notepad"]);
    const rejected=await session.run("start calculator");
    expect(rejected.output).toEqual(["The system cannot find the file calculator."]);
    expect(rejected.errorlevel).toBe(1);
    expect(launched).toEqual(["notepad","notepad","calc"]);
    const unknown=await session.run("start missing-binary");
    expect(unknown.output).toEqual(["The system cannot find the file missing-binary."]);
    expect(unknown.errorlevel).toBe(1);
    expect((await session.run("start")).errorlevel).toBe(0);
  });
});


describe("pinned Tt.execute only recognizes registered internal commands",()=>{
  it("never evaluates an unrecognized BAT file as a host or Guest script",async()=>{
    const {fs,session}=await createShell();
    const uri="/EXTERNAL/computer/drive0/Users/Guest/Documents/safe.bat";
    await fs.write("echo NEVER_EXECUTED",uri);
    const attempt=await session.run("Documents\\safe.bat");
    expect(attempt.errorlevel).toBe(9009);
    expect(attempt.output[0]).toContain("not recognized");
    expect(await fs.read(uri)).toBe("echo NEVER_EXECUTED");
  });
});


describe("source cmd.js Re/Ne/je TASKLIST and TASKKILL Guest processes",()=>{
  it("derives PIDs from installed Guest windows with original 1000/4 numbering",()=>{
    const tasks=sourceCmdTasks([
      {id:"cmd-window",appId:"cmd"},
      {id:"unrelated-window",appId:"not-in-source"},
      {id:"notepad-window",appId:"notepad"}
    ]);
    expect(tasks).toEqual([
      {windowId:"cmd-window",appId:"cmd",image:"cmd.exe",pid:1000},
      {windowId:"notepad-window",appId:"notepad",image:"notepad.exe",pid:1004}
    ]);
    const lines=sourceCmdTasklistOutput(tasks);
    expect(lines[0]).toBe("");
    expect(lines.some(line=>line.includes("Image Name")&&line.includes("PID")))
      .toBe(true);
    expect(lines.some(line=>line.includes("cmd.exe")&&line.includes("1,000")&&
      line.includes("8,192 K"))).toBe(true);
  });
  it("lists, terminates by PID or image, and rejects absent tasks without host access",async()=>{
    const fs=new VirtualFileStore();
    const volume=new LegacyVolumeSession(fs,sourceGuestMounts());
    await volume.mount();await ensureSourceGuestDirectories(fs);
    const windows=[
      {id:"cmd-window",appId:"cmd"},
      {id:"notepad-window",appId:"notepad"}
    ];
    const terminated:string[]=[];
    const session=new SourceCmdSession(fs,volume,SOURCE_GUEST_PROFILE,
      ()=>new Date(),undefined,undefined,()=>windows,id=>terminated.push(id));
    const listing=await session.run("tasklist");
    expect(listing.output.some(line=>line.includes("notepad.exe"))).toBe(true);
    expect((await session.run("taskkill /IM notepad.exe")).output)
      .toEqual(['SUCCESS: Sent termination signal to the process "notepad.exe" with PID 1004.']);
    expect(terminated).toEqual(["notepad-window"]);
    expect((await session.run("taskkill /pid 1000")).output)
      .toEqual(['SUCCESS: Sent termination signal to the process "cmd.exe" with PID 1000.']);
    expect(terminated).toEqual(["notepad-window","cmd-window"]);
    const missing=await session.run("taskkill /pid 9999");
    expect(missing.output).toEqual(["ERROR: The process 9999 not found."]);
    expect(missing.errorlevel).toBe(1);
    expect((await session.run("taskkill")).errorlevel).toBe(1);
  });
});
 

describe("pinned source Ze.ipconfig uses the simulator adapter, not host networking",()=>{
  it("renders the original fixed virtual TCP/IP configuration with V() alignment",()=>{
    const lines=sourceCmdIpconfigOutput();
    expect(lines.slice(0,6)).toEqual([
      "","Windows IP Configuration","","",
      "Ethernet adapter Local Area Connection:",""
    ]);
    expect(lines).toHaveLength(10);
    expect(lines.find(line=>line.includes("IPv4 Address")))
      .toMatch(/IPv4 Address.*:\s+192\.168\.1\.42$/);
    expect(lines.find(line=>line.includes("Subnet Mask")))
      .toMatch(/Subnet Mask.*:\s+255\.255\.255\.0$/);
    expect(lines.find(line=>line.includes("Default Gateway")))
      .toMatch(/Default Gateway.*:\s+192\.168\.1\.1$/);
  });
  it("IPCONFIG and /ALL output are source-identical without reading a host adapter",async()=>{
    const {session}=await createShell();
    const plain=await session.run("ipconfig");
    const detailed=await session.run("IPCONFIG /ALL");
    expect(plain.errorlevel).toBe(0);
    expect(detailed.errorlevel).toBe(0);
    expect(plain.output).toEqual(sourceCmdIpconfigOutput());
    expect(detailed.output).toEqual(plain.output);
    expect((await session.run("help ipconfig")).output)
      .toContain("Displays all current TCP/IP network configuration values.");
  });
});


describe("source ze.winver opens the already-registered About Windows dialog",()=>{
  it("routes WINVER only through the permissioned simulated application launcher",async()=>{
    const fs=new VirtualFileStore();
    const volume=new LegacyVolumeSession(fs,sourceGuestMounts());
    await volume.mount();
    await ensureSourceGuestDirectories(fs);
    const launched:string[]=[];
    const shell=new SourceCmdSession(fs,volume,SOURCE_GUEST_PROFILE,
      ()=>new Date(),undefined,id=>{launched.push(id);return id==="about";});
    expect((await shell.run("winver")).errorlevel).toBe(0);
    expect(launched).toEqual(["about"]);
    expect((await shell.run("help winver")).output)
      .toContain("Displays the version of Windows.");
    expect((await shell.run("winver")).output).toEqual([]);
    expect(launched).toEqual(["about","about"]);
  });
  it("does not claim a native executable was launched when the host adapter refuses",async()=>{
    const {session}=await createShell();
    const result=await session.run("winver");
    expect(result.errorlevel).toBe(1);
    expect(result.output).toEqual(["The system cannot find the file winver."]);
  });
});


describe("pinned original ot.logoff and ot.shutdown simulator lifecycle bridges",()=>{
  it("routes LOGOFF and SHUTDOWN to the simulated view host, not the native OS",async()=>{
    const fs=new VirtualFileStore();
    const volume=new LegacyVolumeSession(fs,sourceGuestMounts());
    await volume.mount();
    await ensureSourceGuestDirectories(fs);
    const views:string[]=[];
    const shell=new SourceCmdSession(fs,volume,SOURCE_GUEST_PROFILE,
      ()=>new Date(),undefined,undefined,undefined,undefined,
      view=>views.push(view));
    const off=await shell.run("logoff");
    expect(off.errorlevel).toBe(0);
    expect(off.output).toEqual([]);
    expect(views).toEqual(["Logon"]);
    const power=await shell.run("SHUTDOWN");
    expect(power.errorlevel).toBe(0);
    expect(power.output).toEqual([]);
    expect(views).toEqual(["Logon","Shutdown"]);
    expect((await shell.run("help logoff")).output)
      .toContain("Logs the current user off.");
    expect((await shell.run("help shutdown")).output)
      .toContain("Allows proper shutdown of the device.");
  });
  it("refuses fake success without a simulated view adapter",async()=>{
    const {session}=await createShell();
    const result=await session.run("shutdown");
    expect(result.errorlevel).toBe(1);
    expect(result.output).toEqual(["The simulated system view is unavailable."]);
  });
});


describe("original Ze.hostname using pinned browser Device2Web host field",()=>{
  it("prints the original blank browser hostname rather than identifying the host OS",async()=>{
    const {session}=await createShell();
    const result=await session.run("hostname");
    expect(result.errorlevel).toBe(0);
    expect(result.output).toEqual([""]);
    expect((await session.run("help hostname")).output)
      .toContain("Prints the name of the current host.");
    expect((await session.run("echo still-running")).output)
      .toEqual(["still-running"]);
  });
});


describe("pinned cmd.js Ze.systeminfo and browser DeviceWeb/Device2Web adapter",()=>{
  const input={
    userAgent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) "+
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    vendor:"Google Inc.",language:"en-GB",languages:["en-US","en-GB"],
    timezone:"Asia/Kolkata",innerWidth:1440,innerHeight:900,batteryLevel:0.62
  };
  it("parses the original source web device fields without native host access",()=>{
    const info=sourceCmdBrowserDeviceInfo(input);
    expect(info).toMatchObject({
      host:"",model:"Windows NT 10.0",osVersion:"Windows NT 10.0; Win64; x64",
      manufacturer:"Google Inc.",locale:"en-US",timezone:"Asia/Kolkata",
      bootTime:0,display:"900x1440",battery:62,camera:[]
    });
    expect(info.totalMemory).toBe(16*1024**3);
    expect(info.availMemory).toBe(16*1024**3);
    expect(sourceCmdBrowserDeviceInfo({...input,batteryLevel:0}).battery).toBe(100);
    expect(()=>sourceCmdBrowserDeviceInfo({...input,userAgent:""})).toThrow();
  });
  it("formats source Win7 fields with two-column spacing and camera MP rounding",()=>{
    const info=sourceCmdBrowserDeviceInfo(input);
    const output=sourceCmdSystemInfoOutput(info);
    expect(output).toHaveLength(22);
    expect(output.find(x=>x.includes("OS Name:")))
      .toContain("Microsoft Windows 7 Simulator");
    expect(output.find(x=>x.includes("Total Physical Memory:"))).toContain("16 GB");
    expect(output.find(x=>x.includes("Available Physical Memory:"))).toContain("16.0 GB");
    expect(output.find(x=>x.includes("Camera Resolutions:"))).toContain("N/A");
    expect(output.find(x=>x.includes("Actual OS Version:")))
      .toContain("Windows NT 10.0; Win64; x64");
    expect(output.find(x=>x.includes("Battery:"))).toContain("62%");
    expect(output.map(row=>row.indexOf("  ")).every(column=>column>=0)).toBe(true);
    const cameras=sourceCmdSystemInfoOutput({...info,camera:["1920x1080","640x480"]});
    expect(cameras.some(x=>x.includes("Camera 1:")&&x.includes("3 MP"))).toBe(true);
    expect(cameras.some(x=>x.includes("Camera 2:")&&x.includes("1 MP"))).toBe(true);
  });
  it("calls the injected simulator browser adapter, preserving a detached failure",async()=>{
    const fs=new VirtualFileStore();
    const volume=new LegacyVolumeSession(fs,sourceGuestMounts());
    await volume.mount();await ensureSourceGuestDirectories(fs);
    let requests=0;
    const shell=new SourceCmdSession(fs,volume,SOURCE_GUEST_PROFILE,
      ()=>new Date(),undefined,undefined,undefined,undefined,undefined,
      async()=>{requests++;return sourceCmdBrowserDeviceInfo(input);});
    const result=await shell.run("systeminfo");
    expect(result.errorlevel).toBe(0);
    expect(result.output.some(line=>line.includes("OS Version:")&&
      line.includes("6.1.7600 Build 7600"))).toBe(true);
    expect(requests).toBe(1);
    expect((await shell.run("hostname")).output).toEqual([""]);
    expect(requests).toBe(2);
    expect((await shell.run("help systeminfo")).output)
      .toContain("Displays device specific properties and configuration.");
    const disconnected=await createShell();
    expect((await disconnected.session.run("systeminfo")).output)
      .toEqual(["The simulated device information is unavailable."]);
    expect((await disconnected.session.run("systeminfo")).errorlevel).toBe(1);
  });
});

import {describe,it,expect} from "vitest";
import {
  VirtualFileStore,LegacyVolumeSession,sourceGuestMounts,
  ensureSourceGuestDirectories,SOURCE_GUEST_PROFILE
} from "@windows-os/filesystem";
import {SOURCE_CMD_BANNER,SourceCmdSession,sourceCmdUnglue,sourceCmdExpandVariables,
  sourceCmdVolumeSerial,sourceCmdDateValue,sourceCmdTimeValue,
  sourceCmdCompletionTarget,sourceCmdApplyCompletion,
  sourceCmdTrimEntries,SOURCE_CMD_MAX_TRANSCRIPT_ENTRIES,
  sourceCmdChainSegments} from "./model";

async function createShell(){
  const fs=new VirtualFileStore();
  await ensureSourceGuestDirectories(fs);
  const volume=new LegacyVolumeSession(fs,sourceGuestMounts());
  const session=new SourceCmdSession(fs,volume,SOURCE_GUEST_PROFILE);
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
    expect((await session.run("dir /s")).errorlevel).toBe(1);
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
  it("RD/RMDIR removes only empty directories; /S is withheld pending source confirmation",async()=>{
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

describe("original cmd.js Te DEL and ERASE without unchecked wildcard removal",()=>{
  it("deletes a named source VFS file but never deletes a directory or wildcard matches",async()=>{
    const {fs,session}=await createShell();
    const base="/EXTERNAL/computer/drive0/Users/Guest/Documents";
    await fs.write("temporary",base+"/temp.txt");
    await fs.write("permanent",base+"/keep.txt");
    expect((await session.run("erase Documents\\temp.txt")).errorlevel).toBe(0);
    expect(await fs.stat(base+"/temp.txt")).toBeNull();
    expect((await session.run("del Documents\\*.txt")).errorlevel).toBe(1);
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
      .toEqual(["First","Second"]);
    expect((await session.run("echo Yes && echo Followed || echo Skipped")).output)
      .toEqual(["Yes","Followed"]);
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
      .toEqual(["before","before"]);
    expect((await session.run("echo %SAMPLE%")).output).toEqual(["after"]);
    await session.run("unknowncommand");
    expect((await session.run(" ")).errorlevel).toBe(9009);
    expect((await session.run("echo ok || echo skipped")).output).toEqual(["ok"]);
  });
});

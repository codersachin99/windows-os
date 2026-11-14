import {describe,it,expect} from "vitest";
import {
  VirtualFileStore,LegacyVolumeSession,sourceGuestMounts,
  ensureSourceGuestDirectories,SOURCE_GUEST_PROFILE
} from "@windows-os/filesystem";
import {SOURCE_CMD_BANNER,SourceCmdSession,sourceCmdUnglue} from "./model";

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

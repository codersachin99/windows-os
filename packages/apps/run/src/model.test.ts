import { describe, expect, it } from "vitest";
import { resolveSourceRunCommand } from "./model";

describe("original source Run program command lookup", () => {
  it("recognizes pinned program IDs and aliases case-insensitively", () => {
    expect(resolveSourceRunCommand("calc")?.id).toBe("calc");
    expect(resolveSourceRunCommand("  CALCULATOR  ")?.id).toBe("calc");
    expect(resolveSourceRunCommand("MSPAINT")?.id).toBe("paint");
    expect(resolveSourceRunCommand("explorer")?.id).toBe("computer");
    expect(resolveSourceRunCommand("control")?.id).toBe("cpanel");
    expect(resolveSourceRunCommand("WINVER")?.id).toBe("about");
    expect(resolveSourceRunCommand("stickynotes")?.id).toBe("sticky");
    expect(resolveSourceRunCommand("main.cpl")?.id).toBe("mouse");
  });
  it("recognizes actual installed executable filenames including .exe and .cpl", () => {
    expect(resolveSourceRunCommand("notepad.exe")?.id).toBe("notepad");
    expect(resolveSourceRunCommand("Magnify.exe")?.id).toBe("magnifier");
    expect(resolveSourceRunCommand("STIKYNOT.EXE")?.id).toBe("sticky");
    expect(resolveSourceRunCommand("desk.cpl")?.id).toBe("personalize");
    expect(resolveSourceRunCommand("SnippingTool")?.id).toBe("snipping");
  });
  it("only accepts the source manifest's explicit absolute C: installed paths", () => {
    expect(resolveSourceRunCommand(String.raw`C:\Windows\System32\notepad.exe`)?.id).toBe("notepad");
    expect(resolveSourceRunCommand(String.raw`"C:\Program Files\Windows Media Player\wmplayer.exe"`)?.id).toBe("player");
    expect(resolveSourceRunCommand("Windows/System32/calc.exe")?.id).toBe("calc");
    expect(resolveSourceRunCommand("D:/Windows/System32/calc.exe")).toBeNull();
    expect(resolveSourceRunCommand("C:/Windows/System32/../../evil.exe")).toBeNull();
    expect(resolveSourceRunCommand("C:/Program Files/WindowsOS/Cmd.exe")).toBeNull();
  });
  it("rejects arbitrary host programs, URLs, flags and malformed commands", () => {
    for (const command of [
      "", "   ", "\0", "curl https://example.com", "https://example.com",
      "/bin/sh", "powershell", "cmd /c del C:\\data", "C:\\evil.exe",
      "notepad.exe /help", "calc.exe arg", "sudo rm", "javascript:alert(1)"
    ]) expect(resolveSourceRunCommand(command)).toBeNull();
  });
  it("maps known but not-yet-migrated source programs without claiming execution", () => {
    expect(resolveSourceRunCommand("cmd")?.id).toBe("cmd");
    expect(resolveSourceRunCommand("mspaint.exe")?.id).toBe("paint");
    expect(resolveSourceRunCommand("taskmgr.exe")?.id).toBe("taskmgr");
  });
});

import {describe,it,expect} from "vitest";
import {sourceShortcutIconValue,readSourceShortcutText} from "./sourceShortcutIcons";
import {VirtualFileStore} from "./index";

describe("pinned computer.js.describe shortcut icon JSON",()=>{
  it("uses icon field independently of the exe target",()=>{
    expect(sourceShortcutIconValue('{"exe":"notepad","icon":"calc"}')).toBe("calc");
    expect(sourceShortcutIconValue('{"exe":"unknown","icon":"photo"}')).toBe("photo");
    expect(sourceShortcutIconValue('{"icon":"notepad"}')).toBe("notepad");
  });
  it("returns original file fallback for broken JSON, no invented icons for missing fields",()=>{
    expect(sourceShortcutIconValue("{bad")).toBe("file");
    expect(sourceShortcutIconValue('{"exe":"calc"}')).toBeNull();
    expect(sourceShortcutIconValue('{"icon":123}')).toBeNull();
    expect(sourceShortcutIconValue('{"icon":""}')).toBeNull();
    expect(sourceShortcutIconValue("null")).toBeNull();
  });
});

describe("source Guest .lnk UTF-8 text and uploaded binary parity",()=>{
  it("reads both storage representations and returns the original icon",async()=>{
    const fs=new VirtualFileStore();await fs.mkdir("/links");
    const json='{"exe":"notepad","icon":"calc"}';
    await fs.write(json,"/links/Text.lnk");
    await fs.writeBytes(new TextEncoder().encode(json),"/links/Binary.lnk");
    expect(await readSourceShortcutText(fs,"/links/Text.lnk")).toBe(json);
    expect(await readSourceShortcutText(fs,"/links/Binary.lnk")).toBe(json);
    expect(sourceShortcutIconValue(await readSourceShortcutText(fs,"/links/Binary.lnk"))).toBe("calc");
  });
  it("rejects undecodable bytes, never executes a binary .lnk payload",async()=>{
    const fs=new VirtualFileStore();await fs.mkdir("/links");
    await fs.writeBytes(new Uint8Array([255,254,0]),"/links/Corrupt.lnk");
    await expect(readSourceShortcutText(fs,"/links/Corrupt.lnk")).rejects.toThrow();
  });
});

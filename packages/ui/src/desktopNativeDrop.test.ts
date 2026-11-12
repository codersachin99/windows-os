import { describe, expect, it } from "vitest";
import { SHELL_DRAG_TYPE } from "@windows-os/filesystem";
import { nativeDesktopIconDropTarget } from "./desktopNativeDrop";

describe("native Explorer → Desktop folder/Bin drop target model", () => {
  it("maps only actual file-backed folders to their original VFS uri", () => {
    const folder={id:"file:/Guest/Desktop/Projects",
      file:{entry:{type:"directory" as const,uri:"/Guest/Desktop/Projects"}}};
    expect(nativeDesktopIconDropTarget(folder,[SHELL_DRAG_TYPE]))
      .toEqual({kind:"folder",directory:"/Guest/Desktop/Projects"});
    expect(nativeDesktopIconDropTarget(folder,["Files"]))
      .toEqual({kind:"folder",directory:"/Guest/Desktop/Projects"});
  });
  it("requires in-process shell token to recycle, never host File payloads", () => {
    expect(nativeDesktopIconDropTarget({id:"bin"},[SHELL_DRAG_TYPE]))
      .toEqual({kind:"recycle"});
    expect(nativeDesktopIconDropTarget({id:"bin"},["Files"])).toBeNull();
    expect(nativeDesktopIconDropTarget({id:"bin"},[])).toBeNull();
  });
  it("rejects file icons, fabricated system folders, and unrelated MIME drags", () => {
    const file={id:"file:/Guest/Desktop/readme.txt",
      file:{entry:{type:"file" as const,uri:"/Guest/Desktop/readme.txt"}}};
    expect(nativeDesktopIconDropTarget(file,[SHELL_DRAG_TYPE])).toBeNull();
    expect(nativeDesktopIconDropTarget({id:"computer"},[SHELL_DRAG_TYPE])).toBeNull();
    expect(nativeDesktopIconDropTarget({id:"web_contacts"},["Files"])).toBeNull();
    expect(nativeDesktopIconDropTarget({id:"file:/Guest/Desktop/Projects",
      file:{entry:{type:"directory" as const,uri:"/Guest/Desktop/Projects"}}},["text/plain"]))
      .toBeNull();
  });
});

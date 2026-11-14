import { describe, expect, it } from "vitest";
import { VirtualFileStore, FileDragSession } from "@windows-os/filesystem";
import { explorerDropTargetAt } from "./desktopExplorerDrop";

function fakePoint(options: {
  inComputer?: boolean;
  inContent?: boolean;
  path?: string;
} = {}) {
  const folder = {
    dataset: { windowsOsDropDirectory: options.path }
  } as unknown as HTMLElement;
  const top = {
    closest(selector: string) {
      if (selector === '[data-test-window="computer"]') return options.inComputer ? {} : null;
      if (selector === ".explorer-content") return options.inContent ? {} : null;
      if (selector === "[data-windows-os-drop-directory]") return options.path ? folder : null;
      return null;
    }
  } as unknown as Element;
  const surface = { elementFromPoint: () => top } as unknown as Pick<Document, "elementFromPoint">;
  return explorerDropTargetAt({ x: 10, y: 15 }, surface);
}

describe("Desktop -> Explorer topmost folder hit test", () => {
  it("recognizes the current contents area and the folder row", () => {
    expect(fakePoint({inComputer:true,inContent:true,path:"/Guest/Documents"})?.directory)
      .toBe("/Guest/Documents");
    expect(fakePoint({inComputer:true,inContent:true,path:"/Guest/Documents/Sub"})?.directory)
      .toBe("/Guest/Documents/Sub");
  });
  it("rejects Recycle Bin windows, covered icons, unrelated apps, and malformed paths", () => {
    expect(fakePoint({inContent:true,path:"/Guest/Documents"})).toBeNull();
    expect(fakePoint({inComputer:true,path:"/Guest/Documents"})).toBeNull();
    expect(fakePoint({inComputer:true,inContent:true,path:"relative/path"})).toBeNull();
    expect(fakePoint({inComputer:true,inContent:true,path:""})).toBeNull();
    expect(explorerDropTargetAt({x:0,y:0},
      {elementFromPoint: () => null} as Pick<Document,"elementFromPoint">)).toBeNull();
  });
  it("moves selected folders through the existing shell token and guards existing targets", async () => {
    const fs = new VirtualFileStore();
    const drag = new FileDragSession();
    await fs.mkdir("/Guest");
    await fs.mkdir("/Guest/Desktop");
    await fs.mkdir("/Guest/Documents");
    await fs.mkdir("/Guest/Desktop/First");
    await fs.mkdir("/Guest/Desktop/Second");
    await fs.write("one", "/Guest/Desktop/First/readme.txt");
    const token = drag.begin(["/Guest/Desktop/First", "/Guest/Desktop/Second"]);
    const result = await drag.drop(fs, token, "/Guest/Documents", "move");
    expect(result.map(item => item.name)).toEqual(["First", "Second"]);
    expect(await fs.read("/Guest/Documents/First/readme.txt")).toBe("one");
    expect(await fs.stat("/Guest/Desktop/First")).toBeNull();
    drag.end(token);
    const copyToken = drag.begin(["/Guest/Documents/First"]);
    await expect(drag.drop(fs, copyToken, "/Guest/Documents", "copy"))
      .rejects.toMatchObject({ code: "EINVAL" });
    await fs.mkdir("/Guest/Desktop/First");
    await expect(drag.drop(fs, copyToken, "/Guest/Desktop", "copy"))
      .rejects.toMatchObject({ code: "EEXIST" });
    expect(await fs.read("/Guest/Documents/First/readme.txt")).toBe("one");
    drag.end(copyToken);
  });
  it("Ctrl-drop copies without moving and rejects dropping a folder into its descendant", async () => {
    const fs = new VirtualFileStore();
    const drag = new FileDragSession();
    await fs.mkdir("/Desktop");
    await fs.mkdir("/Docs");
    await fs.mkdir("/Desktop/Nested");
    await fs.mkdir("/Desktop/Nested/Child");
    await fs.write("keep", "/Desktop/Nested/item.txt");
    let token = drag.begin(["/Desktop/Nested"]);
    await expect(drag.drop(fs,token,"/Desktop/Nested/Child","move"))
      .rejects.toMatchObject({code:"EINVAL"});
    drag.end(token);
    token=drag.begin(["/Desktop/Nested"]);
    await drag.drop(fs,token,"/Docs","copy");
    expect(await fs.read("/Desktop/Nested/item.txt")).toBe("keep");
    expect(await fs.read("/Docs/Nested/item.txt")).toBe("keep");
    drag.end(token);
  });
});

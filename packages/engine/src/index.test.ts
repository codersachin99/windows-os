import { describe, expect, it } from "vitest";
import { desktopReducer, initialDesktopState, LEGACY_DEFAULTS, sourceWindowPlacement } from "./index";
import { appRegistry } from "@windows-os/sdk";

describe("legacy state transitions", () => {
  it("does not skip boot or fake a signed-in account", () => {
    const initial = initialDesktopState();
    expect(LEGACY_DEFAULTS.skipBoot).toBe(false);
    expect(LEGACY_DEFAULTS.nativeCursor).toBe(false);
    expect(initial.phase).toBe("boot");
    expect(initial.session).toBeNull();
    expect(desktopReducer(initial, { type: "GUEST_LOGIN" }).phase).toBe("boot");
  });
  it("runs boot -> Guest login -> desktop -> logoff", () => {
    const boot = initialDesktopState();
    const logon = desktopReducer(boot, { type: "BOOT_COMPLETE" });
    expect(logon.phase).toBe("logon");
    const desktop = desktopReducer(logon, { type: "GUEST_LOGIN" });
    expect(desktop.session?.kind).toBe("guest");
    expect(desktop.phase).toBe("desktop");
    const signedOut = desktopReducer(desktop, { type: "LOG_OFF" });
    expect(signedOut.phase).toBe("logon");
    expect(signedOut.session).toBeNull();
  });
  it("opens multiple app windows, focuses and closes without losing another app", () => {
    const app = appRegistry.get("computer")!;
    const desktop = desktopReducer(desktopReducer(initialDesktopState(), { type: "BOOT_COMPLETE" }), { type: "GUEST_LOGIN" });
    const once = desktopReducer(desktop, { type: "OPEN_APP", app });
    const twice = desktopReducer(once, { type: "OPEN_APP", app });
    expect(twice.windows).toHaveLength(2);
    expect(twice.windows[1].z).toBeGreaterThan(twice.windows[0].z);
    const focused = desktopReducer(twice, { type: "FOCUS_WINDOW", id: twice.windows[0].id });
    expect(focused.windows[0].z).toBeGreaterThan(focused.windows[1].z);
    const closed = desktopReducer(focused, { type: "CLOSE_WINDOW", id: twice.windows[0].id });
    expect(closed.windows.map(window => window.id)).toEqual([twice.windows[1].id]);
  });
  it("updates only the intended running window title for document dirty state", () => {
    const app = appRegistry.get("computer")!;
    const desktop = desktopReducer(desktopReducer(initialDesktopState(), { type: "BOOT_COMPLETE" }), { type: "GUEST_LOGIN" });
    const twice = desktopReducer(desktopReducer(desktop, { type: "OPEN_APP", app }), { type: "OPEN_APP", app });
    const changed = desktopReducer(twice, { type: "SET_WINDOW_TITLE", id: twice.windows[0].id, title: "*Note.txt - Notepad" });
    expect(changed.windows[0].title).toBe("*Note.txt - Notepad");
    expect(changed.windows[1].title).toBe("Computer");
    expect(desktopReducer(changed, { type: "SET_WINDOW_TITLE", id: "missing", title: "x" })).toBe(changed);
  });
  it("does not create windows before entering a desktop session", () => {
    const app = appRegistry.get("computer")!;
    expect(desktopReducer(initialDesktopState(), { type: "OPEN_APP", app }).windows).toHaveLength(0);
  });
});

describe("responsive native window cascade", () => {
  it("preserves the original Computer window size and position on spacious desktops", () => {
    expect(sourceWindowPlacement({width:760,height:490},1,{width:1920,height:1080}))
      .toEqual({x:70,y:58,width:760,height:490});
  });
  it("keeps a mobile Explorer fully within viewport instead of horizontally scrolling the desktop", () => {
    const result=sourceWindowPlacement({width:760,height:490},1,{width:393,height:915});
    expect(result).toEqual({x:70,y:58,width:323,height:490});
    expect(result.x+result.width).toBe(393);
    const compact=sourceWindowPlacement({width:760,height:490},1,{width:320,height:680});
    expect(compact.x+compact.width).toBe(320);
    expect(compact.x).toBe(50);
    expect(compact.width).toBe(270);
  });
  it("centers the dedicated Shortcut Wizard and clamps tiny viewports", () => {
    expect(sourceWindowPlacement({width:550,height:400,centered:true},1,
      {width:393,height:915})).toEqual({x:0,y:237,width:393,height:400});
    const tiny=sourceWindowPlacement({width:550,height:400,centered:true},1,
      {width:240,height:320});
    expect(tiny.x+tiny.width).toBe(240);
    expect(tiny.y+tiny.height).toBe(280);
  });
});

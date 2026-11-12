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
  it("anchors original Run dialog to bottom-left taskbar edge and keeps mobile viewport safe", () => {
    const run = appRegistry.get("run")!;
    expect(run.window).toMatchObject({
      width:450,height:220,resizable:false,location:"bottom-left"
    });
    expect(sourceWindowPlacement(run.window,1,{width:1280,height:720}))
      .toEqual({x:0,y:460,width:450,height:220});
    expect(sourceWindowPlacement(run.window,7,{width:393,height:915}))
      .toEqual({x:0,y:655,width:393,height:220});
    expect(sourceWindowPlacement(run.window,1,{width:240,height:200}))
      .toEqual({x:0,y:0,width:240,height:160});
  });
  it("keeps one original Sticky Notes taskbar app when launched repeatedly and restores on reopen",()=>{
    const app=appRegistry.get("sticky")!;
    expect(app.icon).toContain("sticky.e63cea5a.webp");
    const desktop=desktopReducer(desktopReducer(initialDesktopState(),
      {type:"BOOT_COMPLETE"}),{type:"GUEST_LOGIN"});
    const opened=desktopReducer(desktop,{type:"OPEN_APP",app});
    expect(opened.windows).toHaveLength(1);
    const minimized=desktopReducer(opened,{type:"MINIMIZE_WINDOW",id:opened.windows[0].id});
    expect(minimized.windows[0].minimized).toBe(true);
    const reopened=desktopReducer(minimized,{type:"OPEN_APP",app});
    expect(reopened.windows).toHaveLength(1);
    expect(reopened.windows[0].minimized).toBe(false);
    expect(reopened.windows[0].z).toBeGreaterThan(opened.windows[0].z);
  });
  it("registers original non-resizable 260px source Magnifier and limits mobile placement", () => {
    const magnifier = appRegistry.get("magnifier")!;
    expect(magnifier).toMatchObject({id:"magnifier", label:"Magnifier"});
    expect(magnifier.window).toMatchObject({
      width:260, resizable:false
    });
    expect(magnifier.icon).toContain("magnifier.66b65661.webp");
    const wide=sourceWindowPlacement(magnifier.window,1,{width:1920,height:1080});
    expect(wide.width).toBe(260);
    expect(wide.height).toBeLessThan(110);
    const tiny=sourceWindowPlacement(magnifier.window,1,{width:240,height:320});
    expect(tiny.x+tiny.width).toBeLessThanOrEqual(240);
    expect(tiny.width).toBeGreaterThan(0);
  });
  it("reuses one source Magnifier window on repeated Start/Run launch and restores if minimized",()=>{
    const app=appRegistry.get("magnifier")!;
    const desktop=desktopReducer(desktopReducer(initialDesktopState(),
      {type:"BOOT_COMPLETE"}),{type:"GUEST_LOGIN"});
    const opened=desktopReducer(desktop,{type:"OPEN_APP",app});
    const again=desktopReducer(opened,{type:"OPEN_APP",app});
    expect(again.windows).toHaveLength(1);
    expect(again.windows[0].id).toBe(opened.windows[0].id);
    const minimized=desktopReducer(again,{type:"MINIMIZE_WINDOW",id:again.windows[0].id});
    const restored=desktopReducer(minimized,{type:"OPEN_APP",app});
    expect(restored.windows).toHaveLength(1);
    expect(restored.windows[0].minimized).toBe(false);
    expect(restored.windows[0].z).toBeGreaterThan(minimized.windows[0].z);
  });
  it("preserves original centered close-only 520x400 About window without titlebar icon",()=>{
    const about=appRegistry.get("about")!;
    expect(about.window).toMatchObject({
      width:520,height:400,resizable:false,centered:true,titlebarIcon:false
    });
    expect(about.showInStart).toBe(false);
    expect(sourceWindowPlacement(about.window,1,{width:1920,height:1080}))
      .toEqual({x:700,y:320,width:520,height:400});
    const mobile=sourceWindowPlacement(about.window,1,{width:393,height:915});
    expect(mobile).toEqual({x:0,y:238,width:393,height:400});
  });
  it("reuses About program singleton and refocuses after repeated winver invocation",()=>{
    const about=appRegistry.get("about")!;
    const boot=initialDesktopState();
    const desktop=desktopReducer(desktopReducer(boot,{type:"BOOT_COMPLETE"}),{type:"GUEST_LOGIN"});
    const once=desktopReducer(desktop,{type:"OPEN_APP",app:about});
    const twice=desktopReducer(once,{type:"OPEN_APP",app:about});
    expect(twice.windows).toHaveLength(1);
    expect(twice.windows[0].id).toBe(once.windows[0].id);
    const closed=desktopReducer(twice,{type:"CLOSE_WINDOW",id:twice.windows[0].id});
    expect(closed.windows).toHaveLength(0);
  });
  it("centers the dedicated Shortcut Wizard and clamps tiny viewports", () => {
    expect(sourceWindowPlacement({width:550,height:400,centered:true},1,
      {width:393,height:915})).toEqual({x:0,y:238,width:393,height:400});
    const tiny=sourceWindowPlacement({width:550,height:400,centered:true},1,
      {width:240,height:320});
    expect(tiny.x+tiny.width).toBe(240);
    expect(tiny.y+tiny.height).toBe(280);
  });
});

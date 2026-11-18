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
  it("registers pinned Task Manager height 450 with source Minimize and disabled Maximize",()=>{
    const app=appRegistry.get("taskmgr")!;
    expect(app.icon).toContain("taskmgr.af82f08f.webp");
    expect(app.showInStart).toBe(false);
    expect(app.window).toMatchObject({height:450,resizable:false,minimizable:true});
    const mobile=sourceWindowPlacement(app.window,1,{width:393,height:915});
    expect(mobile.x+mobile.width).toBeLessThanOrEqual(393);
    expect(mobile.y+mobile.height).toBeLessThanOrEqual(875);
  });
  it("relaunching Task Manager through the source process ID restores its singleton",()=>{
    const app=appRegistry.get("taskmgr")!;
    const boot=desktopReducer(desktopReducer(initialDesktopState(),
      {type:"BOOT_COMPLETE"}),{type:"GUEST_LOGIN"});
    const first=desktopReducer(boot,{type:"OPEN_APP",app});
    const repeat=desktopReducer(first,{type:"OPEN_APP",app});
    expect(repeat.windows).toHaveLength(1);
    expect(repeat.windows[0].id).toBe(first.windows[0].id);
    const min=desktopReducer(repeat,{type:"MINIMIZE_WINDOW",id:repeat.windows[0].id});
    const restored=desktopReducer(min,{type:"OPEN_APP",app});
    expect(restored.windows).toHaveLength(1);
    expect(restored.windows[0].minimized).toBe(false);
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


describe("source Win7 shell BSOD virtual view transition",()=>{
  it("enters a simulated BSOD from desktop and restarts via existing boot flow",()=>{
    const boot=initialDesktopState();
    expect(desktopReducer(boot,{type:"BSOD",code:"DUMMY_BSOD"})).toBe(boot);
    const logon=desktopReducer(boot,{type:"BOOT_COMPLETE"});
    const desktop=desktopReducer(logon,{type:"GUEST_LOGIN"});
    const opened=desktopReducer(desktop,{type:"OPEN_APP",app:appRegistry.get("cmd")!});
    const bsod=desktopReducer(opened,{type:"BSOD",code:"DUMMY_BSOD"});
    expect(bsod.phase).toBe("bsod");
    expect(bsod.bsodCode).toBe("DUMMY_BSOD");
    expect(bsod.windows).toHaveLength(0);
    expect(bsod.startOpen).toBe(false);
    const restarted=desktopReducer(bsod,{type:"RESTART"});
    expect(restarted.phase).toBe("boot");
    expect(restarted.bsodCode).toBeUndefined();
    expect(restarted.windows).toHaveLength(0);
  });
});


describe("pinned hotkey Alt+L Switch view preserves existing user session",()=>{
  it("switches to a distinct logon-like view, resumes same Guest windows and still permits actual LOG_OFF",()=>{
    const boot=initialDesktopState();
    expect(desktopReducer(boot,{type:"SWITCH_USER"})).toBe(boot);
    expect(desktopReducer(boot,{type:"RESUME_SESSION"})).toBe(boot);
    const signedIn=desktopReducer(desktopReducer(boot,{type:"BOOT_COMPLETE"}),{type:"GUEST_LOGIN"});
    const open=desktopReducer(signedIn,{type:"OPEN_APP",app:appRegistry.get("computer")!});
    const switched=desktopReducer(open,{type:"SWITCH_USER"});
    expect(switched.phase).toBe("switch");
    expect(switched.session).toEqual(open.session);
    expect(switched.windows).toEqual(open.windows);
    expect(switched.startOpen).toBe(false);
    expect(desktopReducer(switched,{type:"OPEN_APP",app:appRegistry.get("notepad")!}))
      .toEqual(switched);
    const resumed=desktopReducer(switched,{type:"RESUME_SESSION"});
    expect(resumed.phase).toBe("desktop");
    expect(resumed.windows).toEqual(open.windows);
    const signedOut=desktopReducer(resumed,{type:"LOG_OFF"});
    expect(signedOut.phase).toBe("logon");
    expect(signedOut.session).toBeNull();
    expect(signedOut.windows).toHaveLength(0);
  });
});

describe("source 245c Advanced level requests fullscreen on a non-resizable game",()=>{
  it("maximizes only the intended Minesweeper and restores normal dimensions",()=>{
    const desktop=desktopReducer(desktopReducer(initialDesktopState(),
      {type:"BOOT_COMPLETE"}),{type:"GUEST_LOGIN"});
    const game=appRegistry.get("minesweeper")!;
    const other=appRegistry.get("taskmgr")!;
    const openGame=desktopReducer(desktop,{type:"OPEN_APP",app:game});
    const openBoth=desktopReducer(openGame,{type:"OPEN_APP",app:other});
    const gameId=openBoth.windows[0].id,otherId=openBoth.windows[1].id;
    expect(openBoth.windows[0].resizable).toBe(false);
    expect(desktopReducer(openBoth,{type:"TOGGLE_MAXIMIZE",id:gameId})
      .windows[0].maximized).toBe(false);
    expect(desktopReducer(openBoth,{type:"SET_MINESWEEPER_FULLSCREEN",
      id:otherId,fullscreen:true})).toBe(openBoth);
    expect(desktopReducer(openBoth,{type:"SET_MINESWEEPER_FULLSCREEN",
      id:"missing",fullscreen:true})).toBe(openBoth);
    const advanced=desktopReducer(openBoth,{type:"SET_MINESWEEPER_FULLSCREEN",
      id:gameId,fullscreen:true});
    expect(advanced.windows[0]).toMatchObject({
      appId:"minesweeper",maximized:true,resizable:false
    });
    expect(advanced.windows[1].maximized).toBe(false);
    expect(desktopReducer(advanced,{type:"SET_MINESWEEPER_FULLSCREEN",
      id:gameId,fullscreen:true})).toBe(advanced);
    const beginner=desktopReducer(advanced,{type:"SET_MINESWEEPER_FULLSCREEN",
      id:gameId,fullscreen:false});
    expect(beginner.windows[0]).toMatchObject({
      maximized:false,width:openBoth.windows[0].width,
      height:openBoth.windows[0].height
    });
  });
});

describe("pinned Tetris fullscreen but non-resizable WindowMain contract",()=>{
  it("opens the original fixed game maximized without enabling manual maximize",()=>{
    const guest=desktopReducer(desktopReducer(initialDesktopState(),
      {type:"BOOT_COMPLETE"}),{type:"GUEST_LOGIN"});
    const app=appRegistry.get("tetris")!;
    expect(app.window).toMatchObject({resizable:false,fullscreen:true});
    const state=desktopReducer(guest,{type:"OPEN_APP",app});
    const win=state.windows[0];
    expect(win.maximized).toBe(true);
    expect(win.resizable).toBe(false);
    expect(desktopReducer(state,{type:"TOGGLE_MAXIMIZE",id:win.id})
      .windows[0].maximized).toBe(true);
  });
});

describe("final source global and per-app multi-window limits",()=>{
  it("allows three windows, then focuses an existing one and shows original error",()=>{
    const logged=desktopReducer(desktopReducer(initialDesktopState(),
      {type:"BOOT_COMPLETE"}),{type:"GUEST_LOGIN"});
    const app=appRegistry.get("computer")!;
    const first=desktopReducer(logged,{type:"OPEN_APP",app});
    const second=desktopReducer(first,{type:"OPEN_APP",app});
    const third=desktopReducer(second,{type:"OPEN_APP",app});
    expect(third.windows).toHaveLength(3);
    const capped=desktopReducer(third,{type:"OPEN_APP",app});
    expect(capped.windows).toHaveLength(3);
    expect(capped.windowLimitError).toBe("You have already opened too many windows");
    expect(capped.topZ).toBe(third.topZ+1);
    const cleared=desktopReducer(capped,{type:"CLEAR_WINDOW_LIMIT_ERROR"});
    expect(cleared.windowLimitError).toBeNull();
    const closed=desktopReducer(cleared,{type:"CLOSE_WINDOW",id:first.windows[0].id});
    expect(desktopReducer(closed,{type:"OPEN_APP",app}).windows).toHaveLength(3);
  });
  it("honors source overrides for unlimited and single-window applications",()=>{
    const logged=desktopReducer(desktopReducer(initialDesktopState(),
      {type:"BOOT_COMPLETE"}),{type:"GUEST_LOGIN"});
    const base=appRegistry.get("computer")!;
    let state=logged;
    for(let i=0;i<5;i++)
      state=desktopReducer(state,{type:"OPEN_APP",app:{...base,maxWindowsPerApp:0}});
    expect(state.windows).toHaveLength(5);
    const singleton={...base,id:"single-view",allowMultipleWindows:false};
    const one=desktopReducer(logged,{type:"OPEN_APP",app:singleton});
    const again=desktopReducer(one,{type:"OPEN_APP",app:singleton});
    expect(again.windows).toHaveLength(1);
    expect(again.windowLimitError).toBeUndefined();
  });
});

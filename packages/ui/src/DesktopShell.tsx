import {useCallback,useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type Dispatch} from "react";
import {sourceIsAeroFamily,sourceWin7ThemeChromeColors,sourceAeroAppearanceRead,
  sourceAeroAppearanceSave,type SourceAeroAppearance,type DesktopAction,type DesktopState,type DesktopWindow} from "@windows-os/contracts";
import {legacyArt,sourceIsSolidThemeWallpaper,sourceShellAsset,sourceThemeProgramArt,sourceThemeTrayArtwork} from "@windows-os/assets";
import { appRegistry,fileStore,sourceTaskbarPreferences } from "@windows-os/sdk";
import { ContactsApp } from "@windows-os/apps/contacts";
import { NotepadApp } from "@windows-os/apps/notepad";
import { CalculatorApp } from "@windows-os/apps/calculator";
import { CmdApp } from "@windows-os/apps/cmd";
import {
  ControlPanelApp,SystemPropertiesApp,SOURCE_TRAY_ITEMS,sourceTrayVisible,sourceTrayHidden,
  type SourceTrayPreferences,type SourceVisualEffects
} from "@windows-os/apps/cpanel";
import {GamesApp,MinesweeperApp,TetrisApp,SolitaireApp} from "@windows-os/apps/games";
import { RunApp } from "@windows-os/apps/run";
import { StickyNotesApp } from "@windows-os/apps/sticky";
import { MagnifierApp, sourceMagnifierOrigin, sourceMagnifierTransform } from "@windows-os/apps/magnifier";
import { AboutApp } from "@windows-os/apps/about";
import {PersonalizeApp} from "@windows-os/apps/personalize";
import {TaskbarSettingsApp} from "@windows-os/apps/taskbar-settings";
import { PhotoApp } from "@windows-os/apps/photo";
import { RecorderApp } from "@windows-os/apps/recorder";
import { CameraApp } from "@windows-os/apps/camera";
import { InternetExplorerApp } from "@windows-os/apps/ie";
import { ChromeApp } from "@windows-os/apps/chrome";
import { SnippingApp } from "@windows-os/apps/snipping";
import { PlayerApp } from "@windows-os/apps/player";
import { WebAppViewer } from "@windows-os/apps/webapp";
import { SourceEmbedBridge } from "./SourceEmbedBridge";
import { TaskManagerApp } from "@windows-os/apps/taskmgr";
import { FindApp } from "@windows-os/apps/find";
import { ExplorerApp, RecycleBinApp } from "@windows-os/apps/explorer";
import { WindowFrame } from "./WindowFrame";
import {SourceMessageDialog} from "./sourceMessage";
import { sourceDesktopShortcut } from "./sourceDesktopHotkeys";
import { StartMenu } from "./StartMenu";
import { DesktopIcons } from "./DesktopIcons";
import {SourceTaskbarMenu,type SourceTaskbarContext} from "./SourceTaskbarMenu";
import {SourceTaskbarLivePreview} from "./SourceTaskbarLivePreview";
import {sourceTaskbarGroups,sourceTaskbarPreviewLeft,SOURCE_TASKBAR_FINAL_FEATURES,
  SOURCE_TASKBAR_PEEK_SHOW_DELAY_MS,SOURCE_TASKBAR_PEEK_HIDE_DELAY_MS} from "./sourceTaskbarGroups";
import {taskbarPins} from "./sourceTaskbarPins";
import { ShortcutWizard } from "./ShortcutWizard";
import "./sourceTray.css";
import "./sourceWin9xShell.css";

interface DesktopShellProps {
  state: DesktopState;
  dispatch: Dispatch<DesktopAction>;
  trayPreferences:SourceTrayPreferences;
  onTrayPreferencesChange(value:SourceTrayPreferences):void;
  visualEffects:SourceVisualEffects;
  onVisualEffectsChange(value:SourceVisualEffects):void;
}

interface ApplicationContentProps {
  appId: string;
  filePath?: string;
  windowId: string;
  dispatch: Dispatch<DesktopAction>;
  registerClose(id: string, handler: () => void): () => void;
  onMagnifierScale(scale: number): void;
  theme: DesktopState["theme"];
  wallpaper:DesktopState["wallpaper"];
  windows: DesktopState["windows"];
  onRequestCloseWindow(id: string): void;
  trayPreferences:SourceTrayPreferences;
  onTrayPreferencesChange(value:SourceTrayPreferences):void;
  visualEffects:SourceVisualEffects;
  onVisualEffectsChange(value:SourceVisualEffects):void;
  aeroAppearance:SourceAeroAppearance;
  onAeroAppearancePreview(value:SourceAeroAppearance):void;
  onAeroAppearanceSave(value:SourceAeroAppearance):void;
  onAeroAppearanceDiscard():void;
}
function ApplicationContent({
  appId, filePath, windowId, dispatch, registerClose, onMagnifierScale,
  windows, onRequestCloseWindow, theme,wallpaper,
  trayPreferences,onTrayPreferencesChange,visualEffects,onVisualEffectsChange,
  aeroAppearance,onAeroAppearancePreview,onAeroAppearanceSave,onAeroAppearanceDiscard
}: ApplicationContentProps) {
  if (appId === "shortcut") return <ShortcutWizard
    onClose={() => dispatch({ type: "CLOSE_WINDOW", id: windowId })}
    onRegisterClose={handler => registerClose(windowId, handler)} />;
  if (appId === "cmd") return <CmdApp
    onClose={() => dispatch({ type: "CLOSE_WINDOW", id: windowId })}
    onTitleChange={title => dispatch({ type: "SET_WINDOW_TITLE", id: windowId, title })}
    onLaunchProgram={programId=>{
      const app=appRegistry.get(programId);
      if(!app)return false;
      dispatch({type:"OPEN_APP",app});
      return true;
    }}
    onListWindows={()=>windows.map(window=>({id:window.id,appId:window.appId}))}
    onTerminateWindow={id=>onRequestCloseWindow(id)}
    onChangeView={view=>{
      if(view==="Logon")dispatch({type:"LOG_OFF"});
      else if(view==="Shutdown")dispatch({type:"SHUTDOWN"});
      else dispatch({type:"BSOD",code:"DUMMY_BSOD"});
    }} />;
  if (appId === "system") return <SystemPropertiesApp
    visualEffects={visualEffects} onVisualEffectsChange={onVisualEffectsChange}
    onClose={()=>dispatch({type:"CLOSE_WINDOW",id:windowId})}/>;
  if (appId === "cpanel") return <ControlPanelApp
    filesystem={fileStore} theme={theme}
    initialLocation={filePath==="display"?"display":
      filePath==="notification"?"notification":null}
    onClose={() => dispatch({type:"CLOSE_WINDOW",id:windowId})}
    onSwitchUser={() => dispatch({type:"SWITCH_USER"})}
    onOpenProgram={(id,view)=>{
      const program=appRegistry.get(id);
      if(program)dispatch({type:"OPEN_APP",app:program,
        file:view==="background"?{path:"background"}:undefined});
    }}
    trayPreferences={trayPreferences}
    onTrayPreferencesChange={onTrayPreferencesChange}/>;
  if (appId === "personalize") return <PersonalizeApp
    initialView={filePath==="background"?"background":"theme"}
    theme={theme} wallpaper={wallpaper}
    aeroAppearance={aeroAppearance}
    onAeroAppearancePreview={onAeroAppearancePreview}
    onAeroAppearanceSave={onAeroAppearanceSave}
    onAeroAppearanceDiscard={onAeroAppearanceDiscard}
    onSelectTheme={next=>dispatch({type:"SET_THEME",theme:next})}
    onSelectWallpaper={path=>dispatch({type:"SET_WALLPAPER",path})}/>;
  if (appId==="taskbar") return <TaskbarSettingsApp theme={theme}
    onClose={()=>onRequestCloseWindow(windowId)}
    onCustomizeNotificationArea={()=>{
      const panel=appRegistry.get("cpanel");
      if(panel)dispatch({type:"OPEN_APP",app:panel,file:{path:"notification"}});
    }}/>;
  if (appId === "calc") return <CalculatorApp />;
  if (appId === "about") return <AboutApp />;
  if (appId === "find") return <FindApp initialScope={filePath} onFind={path => {
    const computer = appRegistry.get("computer");
    if (computer) dispatch({ type: "OPEN_APP", app: computer, file: { path } });
  }} />;
  if (appId === "taskmgr") return <TaskManagerApp
    windows={windows}
    onCloseWindow={onRequestCloseWindow}
    onOpenProgram={programId => {
      const app = appRegistry.get(programId);
      if (app) dispatch({ type: "OPEN_APP", app });
    }} />;
  if (appId === "magnifier") return <MagnifierApp onScaleChange={onMagnifierScale} />;
  if (appId === "run") return <RunApp
    onClose={() => dispatch({ type: "CLOSE_WINDOW", id: windowId })}
    onLaunchProgram={programId => {
      const app = appRegistry.get(programId);
      if (!app) return false;
      dispatch({ type: "OPEN_APP", app });
      return true;
    }} />;
  if (appId === "notepad") return <NotepadApp initialFilePath={filePath}
    onClose={() => dispatch({ type: "CLOSE_WINDOW", id: windowId })}
    onTitleChange={title => dispatch({ type: "SET_WINDOW_TITLE", id: windowId, title })}
    onRegisterClose={handler => registerClose(windowId, handler)} />;
  if (appId === "ie") return <InternetExplorerApp />;
  if (appId === "chrome") return <ChromeApp onClose={() => dispatch({type:"CLOSE_WINDOW",id:windowId})} />;
  if (appId === "player") return <PlayerApp initialFilePath={filePath}
    onClose={() => dispatch({ type:"CLOSE_WINDOW", id:windowId })}
    onRegisterClose={handler => registerClose(windowId,handler)} />;
  if (appId === "snipping") return <SnippingApp
    onClose={() => dispatch({type:"CLOSE_WINDOW",id:windowId})}
    onRegisterClose={handler => registerClose(windowId,handler)} />;
  if (appId === "camera") return <CameraApp
    onClose={() => dispatch({ type: "CLOSE_WINDOW", id: windowId })}
    onRegisterClose={handler => registerClose(windowId, handler)} />;
  if (appId === "recorder") return <RecorderApp
    onClose={() => dispatch({ type: "CLOSE_WINDOW", id: windowId })}
    onRegisterClose={handler => registerClose(windowId, handler)} />;
  if (appId === "photo") return <PhotoApp initialFilePath={filePath}
    onClose={() => dispatch({ type: "CLOSE_WINDOW", id: windowId })}
    onTitleChange={title => dispatch({ type: "SET_WINDOW_TITLE", id: windowId, title })}
    onRegisterClose={handler => registerClose(windowId, handler)} />;

  if (appId.startsWith("web_") && appId !== "web_contacts") return <WebAppViewer
    url={filePath} onClose={() => dispatch({ type:"CLOSE_WINDOW", id:windowId })}/>;
  if (appId === "web_contacts") {
    return <ContactsApp />;
  }
  if (appId === "solitaire") return <SolitaireApp
    parentWindowId={windowId}
    parentMinimized={Boolean(windows.find(win=>win.id===windowId)?.minimized)}
    onClose={()=>dispatch({type:"CLOSE_WINDOW",id:windowId})}/>;
  if (appId === "tetris") return <TetrisApp
    parentWindowId={windowId}
    parentMinimized={Boolean(windows.find(win=>win.id===windowId)?.minimized)}
    onClose={()=>dispatch({type:"CLOSE_WINDOW",id:windowId})}/>;
  if (appId === "minesweeper") return <MinesweeperApp
    parentWindowId={windowId}
    parentMinimized={Boolean(windows.find(win=>win.id===windowId)?.minimized)}
    fullscreen={Boolean(windows.find(win=>win.id===windowId)?.maximized)}
    onFullscreenChange={fullscreen=>dispatch({
      type:"SET_MINESWEEPER_FULLSCREEN",id:windowId,fullscreen
    })}
    onClose={()=>dispatch({type:"CLOSE_WINDOW",id:windowId})}/>;
  if (appId === "games") return <GamesApp theme={theme}
    isPlayable={gameId=>Boolean(appRegistry.get(gameId))}
    onLaunchGame={gameId=>{
      const game=appRegistry.get(gameId);
      if(game) dispatch({type:"OPEN_APP",app:game});
    }}/>;
  if (appId === "bin") return <RecycleBinApp theme={theme}
    onClose={() => onRequestCloseWindow(windowId)} />;
  if (appId === "computer") return <ExplorerApp theme={theme} initialPath={filePath}
    onClose={() => onRequestCloseWindow(windowId)}
    onOpenFind={scope => {
      const app = appRegistry.get("find");
      if (app) dispatch({ type: "OPEN_APP", app, file: { path: scope } });
    }}
    onOpenTextFile={path => {
      const app = appRegistry.get("notepad");
      if (app) dispatch({ type: "OPEN_APP", app, file: { path } });
    }}
    onOpenPhotoFile={path => {
      const app = appRegistry.get("photo");
      if (app) dispatch({ type: "OPEN_APP", app, file: { path } });
    }}
    onOpenMediaFile={path => {
      const app = appRegistry.get("player");
      if (app) dispatch({ type: "OPEN_APP", app, file: { path } });
    }}
    onLaunchSourceProgram={programId => {
      const app = appRegistry.get(programId);
      if (!app) return false;
      dispatch({ type: "OPEN_APP", app });
      return true;
    }} />;
  return null;
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const handle = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(handle);
  }, []);
  return <time className="windows-taskbar__clock" dateTime={now.toISOString()}>
    <span>{now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}</span>
    <span>{now.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })}</span>
  </time>;
}

export function DesktopShell({
  state,dispatch,trayPreferences,onTrayPreferencesChange,
  visualEffects,onVisualEffectsChange
}:DesktopShellProps) {
  const desktop = appRegistry.desktop();
  // Original ChangeAppearance previews immediately but saves only on Save.
  const [aeroAppearance,setAeroAppearance]=useState<SourceAeroAppearance>(()=>{
    try{return sourceAeroAppearanceRead(window.localStorage);}
    catch{return sourceAeroAppearanceRead(undefined);}
  });
  const [aeroAppearancePreview,setAeroAppearancePreview]=
    useState<SourceAeroAppearance|null>(null);
  const onAeroAppearanceDiscard=useCallback(()=>setAeroAppearancePreview(null),[]);
  const onAeroAppearanceSave=useCallback((value:SourceAeroAppearance)=>{
    setAeroAppearance(value);
    setAeroAppearancePreview(null);
    try{sourceAeroAppearanceSave(window.localStorage,value);}
    catch{/* Guest session selection still works when storage is blocked. */}
  },[]);
  // Pinned ChangeTheme reapplies the new theme's source default accent.
  // Preserve the global transparency setting, but reset custom color.
  const previousAppearanceTheme=useRef(state.theme);
  useEffect(()=>{
    if(previousAppearanceTheme.current===state.theme)return;
    previousAppearanceTheme.current=state.theme;
    setAeroAppearancePreview(null);
    setAeroAppearance(previous=>{
      const next={color:null,transparent:previous.transparent};
      try{sourceAeroAppearanceSave(window.localStorage,next);}
      catch{/* Restricted storage: keep this Guest session change. */}
      return next;
    });
  },[state.theme]);
  // Pinned source window__main.active follows the topmost nonminimized
  // desktop window; z-order is the single Guest focus authority.
  const highestVisibleWindowZ=state.windows.reduce((highest,win)=>
    win.minimized?highest:Math.max(highest,win.z),-Infinity);
  const [magnifierScale, setMagnifierScale] = useState(1);
  const [showHiddenTray,setShowHiddenTray]=useState(false);
  const [pinnedPrograms,setPinnedPrograms]=useState(()=>taskbarPins.snapshot());
  const [taskbarConfig,setTaskbarConfig]=useState(()=>sourceTaskbarPreferences.snapshot());
  const [aeroPeeking,setAeroPeeking]=useState(false);
  const [livePreview,setLivePreview]=useState<{appId:string;left:number}|null>(null);
  const [peekWindowId,setPeekWindowId]=useState<string|null>(null);
  const previewShowTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const previewHideTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const taskbarGroups=sourceTaskbarGroups(state.windows,pinnedPrograms);
  const buttonMode=taskbarConfig.type;
  const canAeroPeek=(state.theme==="win7"||sourceIsAeroFamily(state.theme))&&taskbarConfig.useAeroPeek;
  const previewDesktop=canAeroPeek&&aeroPeeking;
  const [taskbarContext,setTaskbarContext]=useState<SourceTaskbarContext|null>(null);
  const taskbarContextReturnFocus=useRef<HTMLElement|null>(null);
  const closeTaskbarContext=useCallback(()=>setTaskbarContext(null),[]);
  const cancelPreviewShow=()=>{
    if(previewShowTimer.current!==null){
      clearTimeout(previewShowTimer.current);previewShowTimer.current=null;
    }
  };
  const cancelPreviewHide=()=>{
    if(previewHideTimer.current!==null){
      clearTimeout(previewHideTimer.current);previewHideTimer.current=null;
    }
  };
  const dismissLivePreview=()=>{
    cancelPreviewShow();cancelPreviewHide();
    setLivePreview(null);setPeekWindowId(null);
  };
  const schedulePreviewHide=()=>{
    cancelPreviewShow();cancelPreviewHide();
    previewHideTimer.current=setTimeout(()=>{
      setLivePreview(null);setPeekWindowId(null);
      previewHideTimer.current=null;
    },SOURCE_TASKBAR_PEEK_HIDE_DELAY_MS);
  };
  const showTaskbarPreview=(appId:string,button:HTMLElement)=>{
    if(!SOURCE_TASKBAR_FINAL_FEATURES.showPeekPreviews||
      window.matchMedia?.("(hover: none)").matches)return;
    const running=state.windows.filter(win=>win.appId===appId);
    if(!running.length)return;
    cancelPreviewShow();cancelPreviewHide();
    const box=button.getBoundingClientRect();
    const left=sourceTaskbarPreviewLeft(box,running.length,window.innerWidth);
    previewShowTimer.current=setTimeout(()=>{
      setPeekWindowId(null);
      setLivePreview({appId,left});
      previewShowTimer.current=null;
    },SOURCE_TASKBAR_PEEK_SHOW_DELAY_MS);
  };
  const activateTaskbarGroup=(group:readonly DesktopWindow[])=>{
    dismissLivePreview();
    if(!group.length)return;
    if(group.length===1){
      const win=group[0];
      dispatch({type:win.minimized||win.z!==highestVisibleWindowZ
        ?"FOCUS_WINDOW":"MINIMIZE_WINDOW",id:win.id});
      return;
    }
    // Source taskbar-base.toggle: front group window -> minimize all;
    // otherwise restore all instances (retaining their relative order).
    const frontInGroup=group.some(win=>!win.minimized&&win.z===highestVisibleWindowZ);
    for(const win of [...group].sort((a,b)=>a.z-b.z)){
      if(frontInGroup){
        if(!win.minimized)dispatch({type:"MINIMIZE_WINDOW",id:win.id});
      }else dispatch({type:"FOCUS_WINDOW",id:win.id});
    }
  };
  useEffect(()=>{
    return ()=>{
      if(previewShowTimer.current!==null)clearTimeout(previewShowTimer.current);
      if(previewHideTimer.current!==null)clearTimeout(previewHideTimer.current);
    };
  },[]);
  useEffect(()=>{
    if(livePreview&&!state.windows.some(win=>win.appId===livePreview.appId)){
      setLivePreview(null);setPeekWindowId(null);
    }
  },[state.windows,livePreview]);
  const restoreStartFocus=useRef(false);
  const closeStartOnEscape=useCallback(()=>{
    restoreStartFocus.current=true;
    dispatch({type:"CLOSE_START"});
  },[dispatch]);
  useLayoutEffect(()=>{
    if(state.startOpen||!restoreStartFocus.current)return;
    restoreStartFocus.current=false;
    document.querySelector<HTMLButtonElement>(
      '[data-test-start-button]')?.focus({preventScroll:true});
  },[state.startOpen]);
  useEffect(()=>taskbarPins.subscribe(setPinnedPrograms),[]);
  useEffect(()=>sourceTaskbarPreferences.subscribe(setTaskbarConfig),[]);
  const [magnifierOrigin, setMagnifierOrigin] = useState({x: 0, y: 0});
  const magnifierActive = state.windows.some(win => win.appId === "magnifier");
  // Original magnifier follows document mousemove while mounted, even at 1x,
  // so the first Zoom In uses the position of the last pointer movement.
  useEffect(() => {
    if (!magnifierActive) { setMagnifierScale(1); return; }
    const onMove = (event: MouseEvent) => setMagnifierOrigin(
      sourceMagnifierOrigin(event.clientX, event.clientY,
        {width: window.innerWidth, height: window.innerHeight},
        navigator.maxTouchPoints > 0)
    );
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [magnifierActive]);
  const closeHandlers = useRef(new Map<string, () => void>());
  const registerClose = useCallback((id: string, handler: () => void) => {
    closeHandlers.current.set(id, handler);
    return () => { if (closeHandlers.current.get(id) === handler) closeHandlers.current.delete(id); };
  }, []);
  const requestClose = useCallback((id: string) => {
    const handler = closeHandlers.current.get(id);
    if (handler) handler();
    else dispatch({ type: "CLOSE_WINDOW", id });
  }, [dispatch]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (state.phase !== "desktop" || event.repeat) return;
      const sourceShortcut=sourceDesktopShortcut(event);
      if(sourceShortcut){
        event.preventDefault();
        if(sourceShortcut==="minimize-all"){
          // Source MinimizeAll is a taskbar action, not a close/remove.
          for(const win of state.windows){
            if(!win.minimized)dispatch({type:"MINIMIZE_WINDOW",id:win.id});
          }
        }else if(sourceShortcut==="toggle-start"){
          dispatch({type:"TOGGLE_START"});
        }else if(sourceShortcut==="switch-user"){
          dispatch({type:"SWITCH_USER"});
        }else{
          const app=appRegistry.get(sourceShortcut==="open-computer"?"computer":"run");
          if(app)dispatch({type:"OPEN_APP",app});
        }
        return;
      }
      // Windows+R is the original Win7 quick launcher. It is a shell command
      // palette only: RunApp opens registered applications, never host programs.
      if (event.metaKey && !event.ctrlKey && !event.altKey
        && event.key.toLowerCase() === "r") {
        const run = appRegistry.get("run");
        if (run) {
          event.preventDefault();
          dispatch({ type: "OPEN_APP", app: run });
        }
        return;
      }
      if (event.metaKey && !event.ctrlKey && !event.altKey
        && event.key.toLowerCase() === "f") {
        const find = appRegistry.get("find");
        if (find) { event.preventDefault(); dispatch({ type: "OPEN_APP", app: find }); }
        return;
      }
      if (!event.altKey || event.key !== "F4") return;
      const focused = [...state.windows].filter(win => !win.minimized)
        .sort((a, b) => b.z - a.z)[0];
      if (focused) {
        event.preventDefault();
        requestClose(focused.id);
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [state.windows, state.phase, requestClose, dispatch]);

  const win7Colors=sourceWin7ThemeChromeColors(
    state.theme,aeroAppearancePreview??aeroAppearance,visualEffects.enableGlass);
  const isSolidBackground=sourceIsSolidThemeWallpaper(state.wallpaper);
  return (
    <main className="windows-desktop" data-test-main-screen="" data-theme={state.theme}
      style={win7Colors?{
        "--theme-color":win7Colors.active,
        "--theme-color--inactive":win7Colors.inactive??undefined
      } as CSSProperties:undefined}
      data-effect-enable-glass={visualEffects.enableGlass?"":undefined}
      data-effect-show-window-shadows={visualEffects.showWindowShadows?"":undefined}
      data-source-aero-peeking={previewDesktop?"true":undefined}
      data-source-taskbar-peeking={peekWindowId?"true":undefined}>
      <SourceEmbedBridge windows={state.windows} dispatch={dispatch}/>
      {/* In the legacy build the magnifier transforms the desktop container.
          Keep taskbar and Magnifier toolbar outside the scaled canvas so they
          stay accessible at the original source maximum of 16x. */}
      <div className="windows-desktop__magnify-target"
        data-test-magnify-target="" data-test-magnification={magnifierScale}
        style={{
          transform: sourceMagnifierTransform(magnifierScale) || undefined,
          transformOrigin: magnifierScale > 1
            ? magnifierOrigin.x + "% " + magnifierOrigin.y + "%" : undefined,
          transition: magnifierActive ? "transform 0.1s ease-out" : undefined
        }}>
      <div className="desktop-background is-static windows-desktop__wallpaper"
        data-test-desktop-background={state.wallpaper}
        style={{
          backgroundImage:isSolidBackground?"none":`url("${state.wallpaper}")`,
          backgroundColor:isSolidBackground?state.wallpaper:undefined
        }} />
      <div id="desktop" className="desktop__wrapper windows-desktop__workspace"
        onClick={() => dispatch({ type: "SELECT_ICON", id: null })}>
        <DesktopIcons apps={desktop} dispatch={dispatch} theme={state.theme} />
      </div>
      {state.windows.filter(win => win.appId !== "magnifier").map(win => win.appId === "sticky" ? (
        // The pinned source renders sticky notes as multiple floating panels,
        // not inside a single WindowMain/WindowFrame. The shell still owns the
        // taskbar app, z-order and minimize/restore lifecycle.
        <StickyNotesApp key={win.id} zIndex={win.z} minimized={win.minimized}
          onClose={() => dispatch({ type: "CLOSE_WINDOW", id: win.id })}
          onFocus={() => dispatch({ type: "FOCUS_WINDOW", id: win.id })} />
      ) : (
        <WindowFrame key={win.id} theme={state.theme}
          peekTarget={peekWindowId===win.id}
          window={{...win,icon:sourceThemeProgramArt(state.theme,win.appId)??win.icon}}
          active={!win.minimized&&win.z===highestVisibleWindowZ}
          dispatch={dispatch}
          onRequestClose={() => requestClose(win.id)}>
          <ApplicationContent appId={win.appId} filePath={win.file?.path} windowId={win.id} dispatch={dispatch}
            registerClose={registerClose} onMagnifierScale={setMagnifierScale} theme={state.theme}
            wallpaper={state.wallpaper} windows={state.windows} onRequestCloseWindow={requestClose}
            trayPreferences={trayPreferences}
            onTrayPreferencesChange={onTrayPreferencesChange}
            visualEffects={visualEffects}
            onVisualEffectsChange={onVisualEffectsChange}
            aeroAppearance={aeroAppearance}
            onAeroAppearancePreview={setAeroAppearancePreview}
            onAeroAppearanceSave={onAeroAppearanceSave}
            onAeroAppearanceDiscard={onAeroAppearanceDiscard} />
        </WindowFrame>
      ))}
      {state.startOpen && <StartMenu dispatch={dispatch}
        onEscapeClose={closeStartOnEscape} theme={state.theme}
        wallpaper={state.wallpaper} />}
      </div>
      {/* The control surface remains independent of the transformed canvas;
          other programs and their windows zoom together with the desktop. */}
      {state.windows.filter(win => win.appId === "magnifier").map(win => (
        <WindowFrame key={win.id} theme={state.theme}
          peekTarget={peekWindowId===win.id}
          window={{...win,icon:sourceThemeProgramArt(state.theme,win.appId)??win.icon}}
          active={!win.minimized&&win.z===highestVisibleWindowZ}
          dispatch={dispatch}
          onRequestClose={() => requestClose(win.id)}>
          <ApplicationContent appId={win.appId} windowId={win.id} dispatch={dispatch}
            registerClose={registerClose} onMagnifierScale={setMagnifierScale} theme={state.theme}
            wallpaper={state.wallpaper} windows={state.windows} onRequestCloseWindow={requestClose}
            trayPreferences={trayPreferences}
            onTrayPreferencesChange={onTrayPreferencesChange}
            visualEffects={visualEffects}
            onVisualEffectsChange={onVisualEffectsChange}
            aeroAppearance={aeroAppearance}
            onAeroAppearancePreview={setAeroAppearancePreview}
            onAeroAppearanceSave={onAeroAppearanceSave}
            onAeroAppearanceDiscard={onAeroAppearanceDiscard} />
        </WindowFrame>
      ))}
      <footer className="windows-taskbar" data-test-taskbar="base"
        data-taskbar-button-type={buttonMode} tabIndex={-1}
        onContextMenu={event=>{
          if((event.target as HTMLElement).closest("button,[data-test-tray-icon]"))
            return;
          event.preventDefault();
          taskbarContextReturnFocus.current=event.currentTarget;
          setTaskbarContext({
            kind:"background",x:event.clientX,y:event.clientY
          });
        }}>
        <button className={"windows-taskbar__start"+(state.startOpen?" is-active":"")}
          data-test-start-button="" aria-label="Open Start menu"
          aria-expanded={state.startOpen}
          onClick={() => dispatch({ type: "TOGGLE_START" })}>
          <img src={sourceShellAsset(state.theme,"start") ?? legacyArt.startOrb} alt="" draggable={false} />
        </button>
        <div className="windows-taskbar__running">
          {pinnedPrograms.map(programId=>{
            const app=appRegistry.get(programId);
            if(!app)return null;
            const group=taskbarGroups.find(item=>item.appId===programId);
            const instances=group?.windows??[];
            const running=instances.find(win=>!win.minimized)??instances[0];
            return <button key={"pin:"+programId}
              className={"windows-taskbar__application is-pinned"+
                (running?" is-running":"")+
                (instances.some(win=>!win.minimized&&win.z===highestVisibleWindowZ)?" is-active":"")+
                (instances.length>1?" is-stacked":"")+
                (buttonMode!=="combine"?" is-full-size":"")}
              data-test-taskbar-pin={programId}
              data-test-taskbar-pin-running={Boolean(running)}
              data-test-taskbar-group-size={instances.length}
              onMouseEnter={event=>showTaskbarPreview(programId,event.currentTarget)}
              onMouseLeave={schedulePreviewHide}
              onContextMenu={event=>{
                event.preventDefault();event.stopPropagation();
                taskbarContextReturnFocus.current=event.currentTarget;
                const rect=event.currentTarget.getBoundingClientRect();
                setTaskbarContext({
                  kind:"item",id:programId,
                  x:rect.left+rect.width/2,y:rect.top
                });
              }}
              title={app.label}
              aria-label={"Open or switch to "+app.label}
              onClick={()=>{
                if(instances.length)activateTaskbarGroup(instances);
                else {dismissLivePreview();dispatch({type:"OPEN_APP",app});}
              }}>
              <img src={sourceThemeProgramArt(state.theme,programId)??(
                programId==="computer"?sourceShellAsset(state.theme,"computer"):
                programId==="bin"?sourceShellAsset(state.theme,"bin"):null)??app.icon}
                alt="" width={26} height={26} />
              {buttonMode!=="combine"&&<span className="windows-taskbar__item-label"
                aria-hidden="true">{app.label}</span>}
            </button>;
          })}
          {taskbarGroups.filter(group=>!group.pinned).map(group=>{
            const windows=group.windows;
            const win=windows.find(item=>!item.minimized)??windows[0];
            if(!win)return null;
            const app=appRegistry.get(win.appId);
            return <button key={group.key}
              data-test-taskbar-running-group={group.appId}
              data-test-taskbar-group-size={windows.length}
              className={"windows-taskbar__application"+
                (windows.every(item=>item.minimized)?" is-minimized":"")+
                (windows.some(item=>!item.minimized&&item.z===highestVisibleWindowZ)?" is-active":"")+
                (windows.length>1?" is-stacked":"")+
                (buttonMode!=="combine"?" is-full-size":"")}
              title={windows.length>1?(app?.label??win.appId):win.title}
              aria-label={"Switch to "+(windows.length===1?win.title:(app?.label??win.appId))}
              onMouseEnter={event=>showTaskbarPreview(group.appId,event.currentTarget)}
              onMouseLeave={schedulePreviewHide}
              onContextMenu={event=>{
                dismissLivePreview();
                event.preventDefault();event.stopPropagation();
                taskbarContextReturnFocus.current=event.currentTarget;
                const rect=event.currentTarget.getBoundingClientRect();
                setTaskbarContext({
                  kind:"item",id:group.appId,
                  x:rect.left+rect.width/2,y:rect.top
                });
              }}
              onClick={()=>activateTaskbarGroup(windows)}>
              <img src={sourceThemeProgramArt(state.theme,group.appId)??win.icon}
                alt="" width={26} height={26}/>
              {buttonMode!=="combine"&&<span className="windows-taskbar__item-label"
                aria-hidden="true">{app?.label??win.title}</span>}
            </button>;
          })}
        </div>
        <div className="windows-taskbar__tray">
          <button title="Show hidden icons" aria-label="Show hidden icons"
            data-test-tray-hidden-toggle="" onClick={()=>setShowHiddenTray(v=>!v)}>▴</button>
          {showHiddenTray&&sourceTrayHidden(trayPreferences).length>0&&
            <div className="windows-taskbar__hidden-items" data-test-tray-hidden-items=""
              role="group" aria-label="Hidden notification area icons">
              {SOURCE_TRAY_ITEMS.filter(item=>sourceTrayHidden(trayPreferences).includes(item.id))
                .map(item=><img key={item.id} src={sourceThemeTrayArtwork(state.theme,item.id)??legacyArt[item.asset]}
                  width={16} height={16} title={item.label}
                  data-test-tray-hidden-icon={item.id} alt={item.label}/>)}
            </div>}
          {SOURCE_TRAY_ITEMS.filter(item=>sourceTrayVisible(trayPreferences).includes(item.id))
            .map(item=><span key={item.id} title={item.label}
              data-test-tray-icon={item.id} className="windows-taskbar__tray-icon">
              <img src={sourceThemeTrayArtwork(state.theme,item.id)??legacyArt[item.asset]} width={16} height={16}
                alt={item.label}/></span>)}
          {trayPreferences.showClockIcon&&<div data-test-tray-clock=""><Clock/></div>}
        </div>
        <button className="windows-taskbar__show-desktop" aria-label="Show desktop"
          data-test-show-desktop=""
          onPointerEnter={event=>{
            if(event.pointerType!=="touch"&&canAeroPeek)setAeroPeeking(true);
          }}
          onPointerLeave={()=>setAeroPeeking(false)}
          onPointerDown={event=>{
            // The legacy taskbar also supports a touch long-press preview.
            if(event.pointerType==="touch"&&canAeroPeek)setAeroPeeking(true);
          }}
          onPointerUp={()=>setAeroPeeking(false)}
          onPointerCancel={()=>setAeroPeeking(false)}
          onClick={()=>{
            setAeroPeeking(false);
            // Source MinimizeAll is irreversible by hovering: only explicit
            // click minimizes, while preview leaves all windows mounted.
            for(const win of state.windows){
              if(!win.minimized)dispatch({type:"MINIMIZE_WINDOW",id:win.id});
            }
          }} />
      </footer>
      {livePreview&&state.windows.some(win=>win.appId===livePreview.appId)&&
        <SourceTaskbarLivePreview appId={livePreview.appId}
          windows={state.windows.filter(win=>win.appId===livePreview.appId)}
          left={livePreview.left} theme={state.theme}
          onStay={cancelPreviewHide} onLeave={schedulePreviewHide}
          onPeek={setPeekWindowId}
          onActivate={id=>{
            dismissLivePreview();
            dispatch({type:"FOCUS_WINDOW",id});
          }}
          onClose={id=>{
            dismissLivePreview();
            requestClose(id);
          }}/>}
      {taskbarContext&&<SourceTaskbarMenu context={taskbarContext}
        windows={state.windows} pinned={pinnedPrograms} dispatch={dispatch}
        onRequestCloseWindow={requestClose} onClose={closeTaskbarContext}
        returnFocusTarget={taskbarContextReturnFocus.current}/>}
      {state.windowLimitError&&
        <div className="windows-desktop__limit-alert" data-test-window-limit-alert="">
          <SourceMessageDialog data={{type:"error",message:state.windowLimitError}}
            onClose={()=>dispatch({type:"CLEAR_WINDOW_LIMIT_ERROR"})}/>
        </div>}
    </main>
  );
}

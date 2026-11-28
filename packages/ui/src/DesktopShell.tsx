import {useCallback,useEffect,useLayoutEffect,useRef,useState,useSyncExternalStore,type CSSProperties,type Dispatch} from "react";
import {sourceIsAeroFamily,sourceWin7ThemeChromeColors,sourceAeroAppearanceRead,
  sourceAeroAppearanceSave,type SourceAeroAppearance,type DesktopAction,type DesktopState,type DesktopWindow} from "@windows-os/contracts";
import {legacyArt,sourceIsSolidThemeWallpaper,sourceShellAsset,sourceThemeProgramArt,sourceThemeTrayArtwork} from "@windows-os/assets";
import { appRegistry,fileStore,sourceTaskbarPreferences,sourceTaskbarCanCenter,sourceRecentPrograms,sourceNotifications,sourceNotificationCurrent,type SourceNotificationSnapshot } from "@windows-os/sdk";
import {useSourceTrashCount} from "./useSourceTrashCount";
import {SourceTaskbarSearchIcon} from "./SourceTaskbarSearchIcon";
import {SourceMacOSDockTooltip} from "./SourceMacOSDockTooltip";
import {sourceMacOSDockGroups} from "./sourceMacOSDockGroups";
import {sourceUbuntuDockItems} from "./sourceUbuntuDockItems";
import {sourceMacOSPopupTransition,type SourceMacOSPopupId} from "./sourceMacOSPopup";
import {SourceMacOSAppleMenu} from "./SourceMacOSAppleMenu";
import {SourceMacOSVolume} from "./SourceMacOSVolume";
import {SOURCE_GUEST_AUDIO_INITIAL,type SourceGuestAudio} from "./sourceGuestAudio";
import {SourceMacOSBattery} from "./SourceMacOSBattery";
import {SourceMacOSNotificationToast} from "./SourceMacOSNotificationToast";
import {SourceMacOSActionCenter} from "./SourceMacOSActionCenter";
import {SourceMacOSNetwork} from "./SourceMacOSNetwork";
import {SourceMacOSDateTime} from "./SourceMacOSDateTime";
import {SourceMacOSSpotlight} from "./SourceMacOSSpotlight";
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
import {sourceTaskbarGroups,sourceTaskbarPreviewLeft,sourceTaskbarCapacity,sourceTaskbarMaxRow,sourceTaskbarActiveRow,sourceTaskbarCenteredWidth,sourceTaskbarIsCentered,SOURCE_TASKBAR_FINAL_FEATURES,
  SOURCE_TASKBAR_PEEK_SHOW_DELAY_MS,SOURCE_TASKBAR_PEEK_HIDE_DELAY_MS} from "./sourceTaskbarGroups";
import {taskbarPins} from "./sourceTaskbarPins";
import { ShortcutWizard } from "./ShortcutWizard";
import "./sourceTray.css";
import "./sourceTaskbarPagination.css";
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
  guestAudio:SourceGuestAudio;
  notifications:SourceNotificationSnapshot;
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
  appId, filePath, windowId, dispatch, registerClose, onMagnifierScale,guestAudio,notifications,
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
    filesystem={fileStore} theme={theme} messages={notifications.history}
    onReadMessages={()=>sourceNotifications.markAllRead()}
    initialLocation={filePath==="display"?"display":
      filePath==="notification"?"notification":filePath==="accounts"?"accounts":
      filePath==="action-center"?"action-center":filePath==="programs"?"programs":filePath==="backup"?"backup":null}
    onClose={() => dispatch({type:"CLOSE_WINDOW",id:windowId})}
    onSwitchUser={() => dispatch({type:"SWITCH_USER"})}
    onOpenProgram={(id,view)=>{
      const program=appRegistry.get(id);
      if(!program)return;
      // A direct Control Panel Background launch bypasses the existing
      // Personalize sidebar's ChangeAppearance.back() rollback. Restore
      // committed Aero chrome before opening the separate Background window.
      if(id==="personalize"&&view==="background")onAeroAppearanceDiscard();
      dispatch({type:"OPEN_APP",app:program,
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
  if (appId === "player") return <PlayerApp initialFilePath={filePath} systemVolume={guestAudio.volume} systemMuted={guestAudio.muted}
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
  const classicTray=["basic-2","basic-3","basic-4"].includes(state.theme);
  const win7Tray=classicTray||["win7","aero-1","aero-2","aero-3","aero-4","basic-1"].includes(state.theme);
  const vistaTray=state.theme==="winvista";
  const xpTray=["winxp","winxpE","winxpG","winxpN","winxpR","winxpS","winxpZ"].includes(state.theme);
  const win8Tray=state.theme==="win8"||state.theme==="win81";
  const modernTray=["win10","win11","win11dark"].includes(state.theme);
  const retroTray=["win31","win95","win98","win2k"].includes(state.theme);
  const prototypeTray=["winW","winLP","winLS"].includes(state.theme);
  const xpTrayArtwork=xpTray||retroTray||prototypeTray;
  const onebitTray=state.theme==="onebit";
  const sharedTray=onebitTray||retroTray||prototypeTray||win8Tray||modernTray||xpTray||vistaTray||win7Tray||state.theme==="macos"||state.theme==="chromeos"||state.theme==="ubuntu"||state.theme==="kubuntu"||state.theme==="oxygen"||state.theme==="aeroNoir";
  // Original taskbar-macos and taskbar-ubuntu render fixed tray items;
  // taskbar-base owns the hidden-items component.
  const fixedTray=state.theme==="macos"||state.theme==="ubuntu";
  const interactiveHiddenTray=sharedTray&&!fixedTray;
  const [macPopup,setMacPopup]=useState<SourceMacOSPopupId|null>(null);
  const [macBrightness,setMacBrightness]=useState(1);
  const [guestAudio,setGuestAudio]=useState<SourceGuestAudio>(SOURCE_GUEST_AUDIO_INITIAL);
  const notifications=useSyncExternalStore(sourceNotifications.subscribe,sourceNotifications.snapshot,sourceNotifications.snapshot);
  const currentNotification=sourceNotificationCurrent(notifications);
  const dismissNotification=useCallback((id:string)=>sourceNotifications.dismiss(id),[]);
  useEffect(()=>()=>sourceNotifications.reset(),[]);
  const hiddenTrayIds=fixedTray?[]:sourceTrayHidden(trayPreferences);
  const visibleTrayIds=fixedTray?SOURCE_TRAY_ITEMS.filter(item=>trayPreferences.icons[item.id]!=="off").map(item=>item.id):sourceTrayVisible(trayPreferences);
  const hiddenTrayRef=useRef<HTMLDivElement>(null);
  const hiddenToggleRef=useRef<HTMLButtonElement>(null);
  // Nested flyouts are anchored to the actual hidden panel, not an
  // assumed taskbar height. Measure both axes after layout/resize.
  useLayoutEffect(()=>{
    const panel=hiddenTrayRef.current;
    if(!showHiddenTray||!interactiveHiddenTray||!panel)return;
    const measure=()=>{
      const rect=panel.getBoundingClientRect();
      const rtl=getComputedStyle(panel).direction==="rtl";
      const width=rtl?window.innerWidth-rect.left:rect.right;
      panel.style.setProperty("--source-hidden-popup-width",Math.max(0,Math.floor(width-8))+"px");
      panel.style.setProperty("--source-hidden-popup-height",Math.max(0,Math.floor(rect.top-8))+"px");
    };
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(panel);
    window.addEventListener("resize",measure);
    return()=>{observer.disconnect();window.removeEventListener("resize",measure);};
  },[showHiddenTray,interactiveHiddenTray,state.theme,trayPreferences]);
  const setMacPopupOpen=(id:SourceMacOSPopupId,open:boolean,hidden=false)=>{
    setMacPopup(current=>sourceMacOSPopupTransition(current,id,open));
    if(open&&!hidden)setShowHiddenTray(false);
  };
  useEffect(()=>{
    if(!showHiddenTray||!interactiveHiddenTray)return;
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node&&
        !hiddenTrayRef.current?.contains(event.target)&&
        !hiddenToggleRef.current?.contains(event.target)){
        setShowHiddenTray(false);
      }
    };
    // Child dialogs stop Escape themselves. If focus has moved outside
    // the group with Tab, Escape must still close the remaining flyout.
    const escape=(event:KeyboardEvent)=>{
      if(event.key!=="Escape"||event.defaultPrevented)return;
      event.preventDefault();event.stopPropagation();
      setShowHiddenTray(false);setMacPopup(null);
      hiddenToggleRef.current?.focus({preventScroll:true});
    };
    document.addEventListener("pointerdown",outside);
    document.addEventListener("keydown",escape);
    return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);};
  },[showHiddenTray,interactiveHiddenTray]);
  useEffect(()=>{
    setMacPopup(null);
    setShowHiddenTray(false);
    if(!sharedTray)setMacBrightness(1);
  },[state.theme]);
  useEffect(()=>{if(state.startOpen){setMacPopup(null);setShowHiddenTray(false);}},[state.startOpen]);
  useEffect(()=>{
    const accessible=(id:typeof SOURCE_TRAY_ITEMS[number]["id"])=>
      visibleTrayIds.includes(id)||(interactiveHiddenTray&&showHiddenTray&&hiddenTrayIds.includes(id));
    if(macPopup==="action-center"&&!accessible("TaskbarActionCenter"))setMacPopup(null);
    if(macPopup==="network"&&!accessible("TaskbarNetwork"))setMacPopup(null);
    if(macPopup==="battery"&&!accessible("TaskbarBattery"))setMacPopup(null);
    if(macPopup==="volume"&&!accessible("TaskbarVolume"))setMacPopup(null);
    if(macPopup==="datetime"&&!trayPreferences.showClockIcon)setMacPopup(null);
    if(interactiveHiddenTray&&showHiddenTray&&!hiddenTrayIds.length)setShowHiddenTray(false);
  },[macPopup,trayPreferences,showHiddenTray,interactiveHiddenTray,fixedTray]);
  const [pinnedPrograms,setPinnedPrograms]=useState(()=>taskbarPins.snapshot());
  const [dockRecent,setDockRecent]=useState(()=>sourceRecentPrograms.snapshot());
  useEffect(()=>sourceRecentPrograms.subscribe(setDockRecent),[]);
  const [taskbarConfig,setTaskbarConfig]=useState(()=>sourceTaskbarPreferences.snapshot());
  // Frozen 5aea shares searchText with the Win10 Start menu; no other
  // base theme registers a standalone taskbar search component.
  const [taskbarSearch,setTaskbarSearch]=useState("");
  const taskbarSearchRef=useRef<HTMLInputElement>(null);
  useLayoutEffect(()=>{
    if(!state.startOpen||state.theme!=="win10"){
      taskbarSearchRef.current?.blur();
      setTaskbarSearch("");
    }
  },[state.startOpen,state.theme]);
  const [aeroPeeking,setAeroPeeking]=useState(false);
  const [livePreview,setLivePreview]=useState<{appId:string;left:number}|null>(null);
  const [peekWindowId,setPeekWindowId]=useState<string|null>(null);
  const previewShowTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const previewHideTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const taskbarGroups=sourceTaskbarGroups(state.windows,pinnedPrograms);
  const macDockRef=useRef<HTMLDivElement>(null);
  const dockTrashCount=useSourceTrashCount(state.theme==="macos"||state.theme==="ubuntu");
  const macDockGroups=sourceMacOSDockGroups(pinnedPrograms,dockRecent,state.windows.map(win=>win.appId));
  const buttonMode=taskbarConfig.type;
  const paginateTaskbar=state.theme!=="macos"&&state.theme!=="ubuntu";
  const taskbarRef=useRef<HTMLElement>(null);
  const [taskbarCapacity,setTaskbarCapacity]=useState(10);
  const [centeredWidth,setCenteredWidth]=useState<number|null>(null);
  const wantsCentered=taskbarConfig.centered&&sourceTaskbarCanCenter(state.theme);
  const centeredTaskbar=wantsCentered&&centeredWidth!==null;
  const [taskbarRow,setTaskbarRow]=useState(0);
  const taskbarGroupKeys=JSON.stringify(taskbarGroups.map(group=>group.key));
  const activeTaskbarIndex=taskbarGroups.findIndex(group=>group.windows.some(win=>!win.minimized&&win.z===highestVisibleWindowZ));
  const taskbarMaxRow=sourceTaskbarMaxRow(taskbarGroups.length,taskbarCapacity);
  const visibleTaskbarGroups=paginateTaskbar?taskbarGroups.slice(
    Math.min(taskbarRow,taskbarMaxRow)*taskbarCapacity,
    (Math.min(taskbarRow,taskbarMaxRow)+1)*taskbarCapacity):taskbarGroups;
  useLayoutEffect(()=>{
    const bar=taskbarRef.current,lane=macDockRef.current;
    if(!paginateTaskbar||!bar||!lane)return;
    const measure=()=>{
      const css=getComputedStyle(bar);
      const gap=parseFloat(css.columnGap)||0;
      const start=bar.querySelector<HTMLElement>(".windows-taskbar__start");
      const tray=bar.querySelector<HTMLElement>(".windows-taskbar__tray");
      const desktop=bar.querySelector<HTMLElement>(".windows-taskbar__show-desktop");
      const outer=(element:HTMLElement|null)=>{
        if(!element)return 0;
        const style=getComputedStyle(element);
        return element.offsetWidth+(parseFloat(style.marginLeft)||0)+(parseFloat(style.marginRight)||0);
      };
      const barWidth=bar.clientWidth-(parseFloat(css.paddingLeft)||0)-(parseFloat(css.paddingRight)||0);
      const trayWidth=outer(tray)+outer(desktop)+gap;
      const search=bar.querySelector<HTMLElement>(".source-taskbar-search");
      const startWidth=outer(start)+gap+(search?outer(search)+gap:0);
      const available=barWidth-trayWidth-startWidth-gap;
      const item=lane.querySelector<HTMLElement>(".windows-taskbar__application");
      const itemGap=parseFloat(getComputedStyle(lane).columnGap)||0;
      const pitch=buttonMode==="combine"?55:Math.max(55,(item?.offsetWidth??(window.innerWidth<=530?112:156))+itemGap);
      const centered=sourceTaskbarCenteredWidth(barWidth,trayWidth,startWidth);
      const fits=wantsCentered&&sourceTaskbarIsCentered(centered,taskbarGroups.length,pitch);
      setCenteredWidth(fits?centered:null);
      setTaskbarCapacity(sourceTaskbarCapacity(fits?centered:available,taskbarGroups.length,pitch));
    };
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(bar);
    const tray=bar.querySelector(".windows-taskbar__tray");
    if(tray)observer.observe(tray);
    if(taskbarSearchRef.current?.parentElement)observer.observe(taskbarSearchRef.current.parentElement);
    window.addEventListener("resize",measure);
    return()=>{observer.disconnect();window.removeEventListener("resize",measure);};
  },[paginateTaskbar,state.theme,buttonMode,taskbarGroupKeys,taskbarGroups.length,wantsCentered]);
  useLayoutEffect(()=>{
    setTaskbarRow(sourceTaskbarActiveRow(activeTaskbarIndex,taskbarCapacity));
  },[taskbarCapacity,taskbarGroupKeys,activeTaskbarIndex,state.theme]);

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
    if(taskbarContext||!SOURCE_TASKBAR_FINAL_FEATURES.showPeekPreviews||
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
    }else if(peekWindowId&&!state.windows.some(win=>win.id===peekWindowId)){
      // A different close route can remove one instance while the group
      // survives. Never leave the remaining windows invisible.
      setPeekWindowId(null);
    }
  },[state.windows,livePreview,peekWindowId]);
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
    // A source ChangeAppearance color chip previews immediately, but the
    // selection is committed only by Save. React passive effect cleanup
    // happens *after* the window DOM disappears: that leaves a visible
    // unsaved tint when the titlebar Close/Alt+F4 completes. Discard in the
    // same close event before removing this specific Personalize window.
    // Keep the PersonalizeApp unmount cleanup for other removal routes.
    if (state.windows.some(win=>win.id===id&&win.appId==="personalize"))
      onAeroAppearanceDiscard();
    const handler = closeHandlers.current.get(id);
    if (handler) handler();
    else dispatch({ type: "CLOSE_WINDOW", id });
  }, [dispatch,state.windows,onAeroAppearanceDiscard]);
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
  const renderTrayItem=(item:typeof SOURCE_TRAY_ITEMS[number],hidden=false)=>sharedTray&&item.id==="TaskbarActionCenter"?
              <SourceMacOSActionCenter onebitArtwork={onebitTray} xpArtwork={xpTrayArtwork} key={item.id} dispatch={dispatch} notifications={notifications} onSeen={()=>sourceNotifications.markAllSeen()} open={macPopup==="action-center"} setOpen={open=>setMacPopupOpen("action-center",open,hidden)}/>:sharedTray&&item.id==="TaskbarNetwork"?
              <SourceMacOSNetwork onebitArtwork={onebitTray} retroArtwork={retroTray} xpArtwork={xpTrayArtwork} key={item.id} theme={state.theme} open={macPopup==="network"} setOpen={open=>setMacPopupOpen("network",open,hidden)} onOpen={()=>{dispatch({type:"CLOSE_START"});if(!hidden)setShowHiddenTray(false);}}/>:
              sharedTray&&item.id==="TaskbarBattery"?
              <SourceMacOSBattery theme={state.theme} xpArtwork={xpTrayArtwork} key={item.id} open={macPopup==="battery"} setOpen={open=>setMacPopupOpen("battery",open,hidden)} onOpen={()=>dispatch({type:"CLOSE_START"})} brightness={macBrightness} onBrightness={setMacBrightness}/>:
              sharedTray&&item.id==="TaskbarVolume"?
              <SourceMacOSVolume theme={state.theme} key={item.id} audio={guestAudio} onAudio={setGuestAudio} open={macPopup==="volume"} setOpen={open=>setMacPopupOpen("volume",open,hidden)} onOpen={()=>dispatch({type:"CLOSE_START"})}/>:
              <span key={item.id} title={item.label}
              data-test-tray-icon={item.id} className="windows-taskbar__tray-icon">
              <img src={sourceThemeTrayArtwork(state.theme,item.id)??legacyArt[item.asset]} width={16} height={16}
                alt={item.label}/></span>;

  return (
    <main className="windows-desktop" data-test-main-screen="" data-theme={state.theme}
      data-source-start-centered={wantsCentered?"true":"false"}
      data-source-win7-tray={win7Tray?"":undefined}
      data-source-vista-tray={vistaTray?"":undefined}
      data-source-xp-tray={xpTray?"":undefined}
      data-source-retro-tray={retroTray?"":undefined}
      data-source-onebit-tray={onebitTray?"":undefined}
      data-source-prototype-tray={prototypeTray?"":undefined}
      data-source-win8-tray={win8Tray?"":undefined}
      data-source-modern-tray={modernTray?"":undefined}
      data-source-interactive-hidden-tray={interactiveHiddenTray?"":undefined}
      data-source-classic-tray={classicTray?"":undefined}
      data-source-display-brightness={sharedTray?macBrightness:undefined}
      style={{...(win7Colors?{
        "--theme-color":win7Colors.active,
        "--theme-color--inactive":win7Colors.inactive??undefined
      }:{}),filter:sharedTray&&macBrightness!==1?`brightness(${macBrightness})`:undefined} as CSSProperties}
      data-effect-animate-taskbar={visualEffects.animateTaskbar?"":undefined}
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
            registerClose={registerClose} onMagnifierScale={setMagnifierScale} theme={state.theme} guestAudio={guestAudio} notifications={notifications}
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
        wallpaper={state.wallpaper}
        taskbarSearch={state.theme==="win10"?taskbarSearch:undefined}
        onTaskbarSearchChange={setTaskbarSearch}
        onTaskbarSearchFocus={()=>taskbarSearchRef.current?.focus({preventScroll:true})} />}
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
            registerClose={registerClose} onMagnifierScale={setMagnifierScale} theme={state.theme} guestAudio={guestAudio} notifications={notifications}
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
      <footer ref={taskbarRef} className="windows-taskbar" data-test-taskbar={state.theme==="ubuntu"?"ubuntu":"base"}
        data-source-chromeos-maximized={state.theme==="chromeos"?state.windows.some(win=>win.maximized&&!win.minimized):undefined}
        data-taskbar-button-type={buttonMode} data-taskbar-centered={centeredTaskbar?"true":"false"}
        style={centeredTaskbar?{"--source-centered-taskbar-width":centeredWidth+"px"} as CSSProperties:undefined} tabIndex={-1}
        onContextMenu={event=>{
          if((event.target as HTMLElement).closest("button,[data-test-tray-icon]"))
            return;
          event.preventDefault();
          dismissLivePreview();
          taskbarContextReturnFocus.current=event.currentTarget;
          setTaskbarContext({
            kind:"background",x:event.clientX,y:event.clientY
          });
        }}>
        {state.theme==="macos"?<><SourceMacOSAppleMenu dispatch={dispatch} open={macPopup==="apple"} setOpen={open=>setMacPopupOpen("apple",open)}/><span className="source-macos-menubar-title" data-test-macos-active-title="">
          {state.windows.find(win=>!win.minimized&&win.z===highestVisibleWindowZ)?.title??"Finder"}
        </span></>:state.theme==="ubuntu"?<div className="source-ubuntu-activities">
          <button type="button" data-test-activities-button="" aria-expanded={state.startOpen}
            onClick={()=>dispatch({type:"TOGGLE_START"})}>Activities</button>
          <strong data-test-ubuntu-active-title="">{state.windows.find(win=>!win.minimized&&win.z===highestVisibleWindowZ)?.title??""}</strong>
        </div>:<button className={"windows-taskbar__start"+(state.startOpen?" is-active":"")}
          data-test-start-button="" aria-label="Open Start menu"
          aria-expanded={state.startOpen}
          onClick={() => dispatch({ type: "TOGGLE_START" })}>
          {(state.theme==="aeroNoir"||state.theme==="oxygen"||state.theme==="win7"||state.theme==="aero-1"||state.theme==="aero-2"||state.theme==="aero-3"||state.theme==="aero-4"||state.theme==="basic-1")?
            <span aria-hidden="true" className="source-startbutton-sprite" data-test-source-start-sprite=""
              style={{backgroundImage:`url("${legacyArt.startOrb}")`,"--source-start-sprite":`url("${legacyArt.startOrb}")`} as CSSProperties}/>:
            <img src={sourceShellAsset(state.theme,"start") ?? legacyArt.startOrb} alt="" draggable={false} />}
        </button>}
        {state.theme==="win10"&&<label className="source-taskbar-search" data-test-taskbar-search=""
          onContextMenu={event=>event.stopPropagation()}>
          <SourceTaskbarSearchIcon/>
          <input ref={taskbarSearchRef} value={taskbarSearch} placeholder="Type here to search"
            aria-label="Type here to search" data-test-taskbar-search-input=""
            onFocus={()=>{
              setMacPopup(null);setShowHiddenTray(false);closeTaskbarContext();
              if(!state.startOpen)dispatch({type:"TOGGLE_START"});
            }}
            onChange={event=>setTaskbarSearch(event.target.value)}/>
        </label>}
        {state.theme==="ubuntu"?<nav className="source-ubuntu-dock" data-test-dock="" aria-label="Application dock">
          <div className="source-ubuntu-dock-list">
            {sourceUbuntuDockItems(dockRecent,state.windows.map(win=>win.appId)).map(id=>{
              const app=appRegistry.get(id);
              if(!app)return null;
              const running=state.windows.filter(win=>win.appId===id).sort((a,b)=>b.z-a.z);
              return <div key={id} className={"source-ubuntu-dock-item"+(id==="bin"?" has-separator":"")}>
                <button type="button" data-test-dock-item="" data-source-ubuntu-dock-id={id}
                  className={"source-ubuntu-dock-button"+(running.length?" is-running":"")}
                  aria-label={"Open or switch to "+app.label} title={app.label}
                  onClick={()=>{dispatch({type:"CLOSE_START"});if(running[0])dispatch({type:"FOCUS_WINDOW",id:running[0].id});else dispatch({type:"OPEN_APP",app});}}>
                  <img src={(id==="bin"?sourceShellAsset(state.theme,dockTrashCount>0?"binFull":"bin"):sourceThemeProgramArt(state.theme,id))??app.icon} alt="" width={36} height={36}/>
                </button>
              </div>;
            })}
          </div>
          <button type="button" className={"source-ubuntu-dock-button"+(state.startOpen?" is-running":"")}
            data-test-start-button="" aria-label="Open Start menu" aria-expanded={state.startOpen}
            onClick={()=>dispatch({type:"TOGGLE_START"})}>
            <img src={sourceShellAsset(state.theme,"start")??legacyArt.startOrb} alt="" width={36} height={36}/>
          </button>
        </nav>:<div ref={macDockRef} className="windows-taskbar__running" data-source-taskbar-paged={paginateTaskbar?"":undefined}
          data-test-taskbar-row={paginateTaskbar?Math.min(taskbarRow,taskbarMaxRow):undefined}
          data-test-taskbar-capacity={paginateTaskbar?taskbarCapacity:undefined} data-test-macos-dock={state.theme==="macos"?"":undefined}>
          {state.theme==="macos"?macDockGroups.map((ids,index)=>
            <div key={index} className="source-macos-dock-group" data-test-macos-dock-group={index}>
              {index>0&&<span className="source-macos-dock-divider" aria-hidden="true"/>}
              {ids.map(id=>{
                if(id==="launchpad")return <button key={id}
                  className={"windows-taskbar__start"+(state.startOpen?" is-active":"")}
                  data-test-start-button="" data-test-macos-dock-item={id}
                  aria-label="Open Start menu" aria-expanded={state.startOpen} data-source-dock-label="Launchpad"
                  onClick={()=>dispatch({type:"TOGGLE_START"})}>
                  <img src={sourceShellAsset(state.theme,"start")??legacyArt.startOrb} alt="" draggable={false}/>
                </button>;
                const app=appRegistry.get(id);
                if(!app)return null;
                const instances=state.windows.filter(win=>win.appId===id);
                const pinned=pinnedPrograms.includes(id);
                return <button key={id} type="button"
                  className={"windows-taskbar__application"+(pinned?" is-pinned":"")+
                    (instances.length?" is-running":"")+(instances.length>1?" is-stacked":"")+
                    (instances.some(win=>!win.minimized&&win.z===highestVisibleWindowZ)?" is-active":"")}
                  data-test-macos-dock-item={id}
                  data-test-taskbar-pin={pinned?id:undefined}
                  data-test-taskbar-pin-running={pinned?Boolean(instances.length):undefined}
                  data-test-taskbar-running-group={!pinned&&instances.length?id:undefined}
                  data-test-taskbar-group-size={instances.length}
                  data-source-dock-label={app.label} aria-label={"Open or switch to "+app.label}
                  onMouseEnter={event=>showTaskbarPreview(id,event.currentTarget)}
                  onMouseLeave={schedulePreviewHide}
                  onContextMenu={event=>{
                    event.preventDefault();event.stopPropagation();
                    dismissLivePreview();
                    taskbarContextReturnFocus.current=event.currentTarget;
                    const rect=event.currentTarget.getBoundingClientRect();
                    setTaskbarContext({kind:"item",id,x:rect.left+rect.width/2,y:rect.top});
                  }}
                  onClick={()=>{
                    if(instances.length)activateTaskbarGroup(instances);
                    else{dismissLivePreview();dispatch({type:"OPEN_APP",app});}
                  }}>
                  <img src={(id==="bin"?sourceShellAsset(state.theme,dockTrashCount>0?"binFull":"bin"):sourceThemeProgramArt(state.theme,id))??app.icon} alt="" width={48} height={48}/>
                </button>;
              })}
            </div>):<>
          {visibleTaskbarGroups.filter(group=>group.pinned).map(({appId:programId})=>{
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
                dismissLivePreview();
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
          {visibleTaskbarGroups.filter(group=>!group.pinned).map(group=>{
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
          {taskbarMaxRow>0&&<div className="source-taskbar-scrollbar" data-test-taskbar-scrollbar=""
            role="group" aria-label="Taskbar pages">
            <button type="button" data-test-taskbar-scroll-prev="" aria-label="Previous taskbar page"
              disabled={taskbarRow<=0} onClick={()=>{dismissLivePreview();closeTaskbarContext();setTaskbarRow(row=>Math.max(0,row-1));}}/>
            <button type="button" data-test-taskbar-scroll-next="" aria-label="Next taskbar page"
              disabled={taskbarRow>=taskbarMaxRow} onClick={()=>{dismissLivePreview();closeTaskbarContext();setTaskbarRow(row=>Math.min(taskbarMaxRow,row+1));}}/>
          </div>}
          </>}
        </div>}
        {state.theme==="macos"&&<SourceMacOSDockTooltip dockRef={macDockRef} hidden={state.startOpen||Boolean(taskbarContext)||macPopup!==null}/>}
        <div className="windows-taskbar__tray" data-test-taskbar-tray={sharedTray||state.theme==="ubuntu"?state.theme:undefined}>
          {(!fixedTray&&(interactiveHiddenTray?hiddenTrayIds.length>0:true))&&
            <button ref={hiddenToggleRef} title="Show hidden icons" aria-label="Show hidden icons"
              aria-expanded={showHiddenTray} data-test-tray-hidden-toggle=""
              onKeyDown={event=>{if(event.key==="Escape"&&showHiddenTray){event.preventDefault();event.stopPropagation();setShowHiddenTray(false);setMacPopup(null);}}}
              onClick={()=>{setMacPopup(null);if(!showHiddenTray)dispatch({type:"CLOSE_START"});setShowHiddenTray(v=>!v);}}>▴</button>}
          {showHiddenTray&&hiddenTrayIds.length>0&&
            <div ref={hiddenTrayRef} className="windows-taskbar__hidden-items" data-test-tray-hidden-items=""
              role="group" aria-label="Hidden notification area icons"
              onKeyDown={event=>{
                if(event.key==="Escape"&&interactiveHiddenTray){
                  event.preventDefault();event.stopPropagation();
                  setShowHiddenTray(false);setMacPopup(null);
                  hiddenToggleRef.current?.focus({preventScroll:true});
                }
              }}>
              {interactiveHiddenTray?<><div className="source-hidden-tray-grid">
                {SOURCE_TRAY_ITEMS.filter(item=>hiddenTrayIds.includes(item.id)).map(item=>
                  <div key={item.id} data-test-tray-hidden-icon={item.id}>{renderTrayItem(item,true)}</div>)}
              </div>
              <button type="button" className="source-hidden-tray-customize" data-test-tray-customize=""
                onClick={()=>{
                  setShowHiddenTray(false);setMacPopup(null);
                  const app=appRegistry.get("cpanel");
                  if(app)dispatch({type:"OPEN_APP",app,file:{path:"notification"}});
                }}>Customize...</button></>:SOURCE_TRAY_ITEMS.filter(item=>hiddenTrayIds.includes(item.id))
                .map(item=><img key={item.id} src={sourceThemeTrayArtwork(state.theme,item.id)??legacyArt[item.asset]}
                  width={16} height={16} title={item.label}
                  data-test-tray-hidden-icon={item.id} alt={item.label}/>)}
            </div>}
          {SOURCE_TRAY_ITEMS.filter(item=>visibleTrayIds.includes(item.id)).map(item=>renderTrayItem(item))}
          {state.theme==="macos"&&<SourceMacOSSpotlight dispatch={dispatch} open={macPopup==="spotlight"} setOpen={open=>setMacPopupOpen("spotlight",open)}/>}
          {trayPreferences.showClockIcon&&(sharedTray?<SourceMacOSDateTime xpLayout={xpTray||retroTray} modernLayout={modernTray} numericDate={onebitTray||retroTray||prototypeTray||win8Tray||modernTray||xpTray||vistaTray||win7Tray||state.theme==="ubuntu"||state.theme==="kubuntu"||state.theme==="oxygen"||state.theme==="aeroNoir"} baseLayout={state.theme!=="macos"} open={macPopup==="datetime"} setOpen={open=>setMacPopupOpen("datetime",open)} onOpen={()=>{dispatch({type:"CLOSE_START"});setShowHiddenTray(false);}}/>:<div data-test-tray-clock=""><Clock/></div>)}
          {state.theme==="ubuntu"&&<SourceMacOSAppleMenu ubuntu dispatch={dispatch} open={macPopup==="apple"} setOpen={open=>setMacPopupOpen("apple",open)}/>}
        </div>
        {state.theme!=="macos"&&state.theme!=="ubuntu"&&<button className="windows-taskbar__show-desktop" aria-label="Show desktop"
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
          }} />}
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
      {taskbarContext&&<SourceTaskbarMenu context={taskbarContext} theme={state.theme}
        windows={state.windows} pinned={pinnedPrograms} dispatch={dispatch}
        onRequestCloseWindow={requestClose} onClose={closeTaskbarContext}
        returnFocusTarget={taskbarContextReturnFocus.current}/>}
      {sharedTray&&trayPreferences.icons.TaskbarActionCenter!=="off"&&currentNotification&&
        <SourceMacOSNotificationToast theme={state.theme} key={currentNotification.id} message={currentNotification} onDismiss={dismissNotification} onRead={id=>sourceNotifications.markRead(id)}
          anchorRevision={JSON.stringify([showHiddenTray,visibleTrayIds,hiddenTrayIds,trayPreferences.showClockIcon])}/>}
      {state.windowLimitError&&
        <div className="windows-desktop__limit-alert" data-test-window-limit-alert="">
          <SourceMessageDialog data={{type:"error",message:state.windowLimitError}}
            onClose={()=>dispatch({type:"CLEAR_WINDOW_LIMIT_ERROR"})}/>
        </div>}
    </main>
  );
}

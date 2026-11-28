import {sourceWindowPlacementKey,sourceRemembersPlacement,sourceReadWindowPlacements,sourceCaptureWindowPlacement,sourceApplyWindowPlacement,sourceWindowWorkAreaForTheme} from "./sourceWindowPlacement";
export {SOURCE_WINDOW_PLACEMENTS_KEY} from "./sourceWindowPlacement";
import {sourceIsKnownTheme} from "@windows-os/contracts";
import type { AppDefinition, DesktopAction, DesktopState } from "@windows-os/contracts";
import {sourceShellWallpaper,sourceIsSystemWallpaper} from "@windows-os/assets";

/** Final pinned legacy-win7 app.config.json defaults. skipBoot skips only
 * the animated boot view: source boot.js bootup() still routes to Logon and
 * never authenticates the Guest automatically. */
export const LEGACY_DEFAULTS = Object.freeze({
  skipBoot: true,
  nativeCursor: true,
  theme: "win7" as const,
  soundVolume: 1
});

/** Legacy testmode.js supports a query-string theme override; never accept unknown skin IDs. */
export function sourceTestTheme(search: string): DesktopState["theme"] | null {
  const theme = new URLSearchParams(search).get("theme");
  // Source catalog contains 36 config entries plus the canonical Win7
  // shell ID. Only permit literal known IDs; never treat a query as an
  // import path. Pending visual skins use the existing Win7 fallback.
  return theme&&sourceIsKnownTheme(theme)?theme:null;
}

export const SOURCE_ACTIVE_THEME_KEY="windows-os:guest:active-theme:v1";
export const SOURCE_ACTIVE_WALLPAPER_KEY="windows-os:guest:wallpaper:v1";
/** The original Background selection is profile-scoped, independent of theme.
 * A subsequent ChangeTheme replaces it with that theme's original wallpaper. */
export function sourceSavedWallpaper(
  storage:Pick<Storage,"getItem">|undefined,theme:DesktopState["theme"]
):string|null{
  try{
    const raw=storage?.getItem(SOURCE_ACTIVE_WALLPAPER_KEY);
    if(!raw)return null;
    const data:unknown=JSON.parse(raw);
    if(!data||typeof data!=="object")return null;
    const saved=data as {theme?:unknown;path?:unknown};
    return saved.theme===theme&&typeof saved.path==="string"&&
      sourceIsSystemWallpaper(saved.path)?saved.path:null;
  }catch{return null;}
}

export function sourceSavedTheme(
  storage:Pick<Storage,"getItem">|undefined
):DesktopState["theme"]|null{
  try{
    const theme=storage?.getItem(SOURCE_ACTIVE_THEME_KEY);
    return theme&&sourceIsKnownTheme(theme)?theme:null;
  }catch{return null;}
}
/** Keep the optional animated boot path for source config overrides and
 * acceptance tests; skipping it must NOT bypass Guest authentication. */
export function sourceInitialPhase(skipBoot:boolean):DesktopState["phase"]{
  return skipBoot?"logon":"boot";
}
export function initialDesktopState(config?:{skipBoot?:boolean}): DesktopState {
  const theme=typeof window!=="undefined"
    ?sourceTestTheme(window.location.search)
      ??sourceSavedTheme(window.localStorage)
      ??LEGACY_DEFAULTS.theme
    :LEGACY_DEFAULTS.theme;
  return {
    phase: sourceInitialPhase(config?.skipBoot??LEGACY_DEFAULTS.skipBoot),
    theme,
    session: null,
    windows: [],
    windowPlacements:sourceReadWindowPlacements(typeof globalThis.window==="undefined"?undefined:globalThis.window.localStorage),
    nextWindowId: 1,
    topZ: 10,
    startOpen: false,
    selectedIcon: null,
    wallpaper: typeof window!=="undefined"
      ?sourceSavedWallpaper(window.localStorage,theme)??sourceShellWallpaper(theme)
      :sourceShellWallpaper(theme)
  };
}

/**
 * Existing desktop window cascade, constrained only when the viewport is
 * smaller than the source's preferred window. Mobile must keep the desktop
 * itself at document.scrollX=0: otherwise tapping a horizontally overflowing
 * Explorer shortcut scrolls the entire page and hides desktop icons.
 * Minimum width tracks the native WindowFrame's normal 270px threshold.
 */
export function sourceWindowPlacement(
  config: AppDefinition["window"], ordinal: number,
  viewport: { width: number; height: number }
): { x: number; y: number; width: number; height: number } {
  const vw = Math.max(1, viewport.width);
  const vh = Math.max(1, viewport.height - 40);
  const availableMinWidth = Math.min(vw, 270);
  const defaultX = 70 + ((ordinal - 1) % 7) * 26;
  const defaultY = 58 + ((ordinal - 1) % 7) * 26;
  const x = config.location === "bottom-left" ? 0 : config.centered
    ? Math.max(0, Math.round((vw - Math.min(config.width, vw)) / 2))
    : Math.max(0, Math.min(defaultX, vw - availableMinWidth));
  const width = Math.min(config.width, Math.max(1, vw - x));
  const y = config.location === "bottom-left"
    ? Math.max(0, vh - Math.min(config.height, vh)) : config.centered
    ? Math.max(0, Math.round((vh - Math.min(config.height, vh)) / 2))
    : Math.max(0, Math.min(defaultY, Math.max(0, vh - Math.min(vh, 170))));
  const height = Math.min(config.height, Math.max(1, vh - y));
  return { x, y, width, height };
}

/** Final source app.config.json maxWindowsPerApp=3; zero disables cap. */
export const SOURCE_FINAL_MAX_WINDOWS_PER_APP=3;
export function sourceWindowLimit(app:AppDefinition):number{
  const cap=app.maxWindowsPerApp;
  return cap===undefined?SOURCE_FINAL_MAX_WINDOWS_PER_APP:
    Number.isInteger(cap)&&cap>=0?cap:SOURCE_FINAL_MAX_WINDOWS_PER_APP;
}
function openWindow(state: DesktopState, app: AppDefinition, file?: { path: string }): DesktopState {
  if (state.phase !== "desktop") return state;
  // Source Sticky Notes and Magnifier each address a single shell window
  // by their original fixed program IDs, even across repeated Start/Run opens.
  const singleton = app.allowMultipleWindows===false
    || app.id === "sticky" || app.id === "magnifier"
    || app.id === "about" || app.id === "taskmgr" || app.id === "find";
  const alreadyOpen = singleton
    ? state.windows.find(window => window.appId === app.id) : undefined;
  if (alreadyOpen) return {
    ...state, topZ: state.topZ + 1, startOpen: false,
    windows: state.windows.map(window => window.id === alreadyOpen.id
      ? { ...window, z: state.topZ + 1, minimized: false } : window)
  };
  const instances=state.windows.filter(win=>win.appId===app.id);
  const cap=sourceWindowLimit(app);
  if(cap>0&&instances.length>=cap){
    const front=instances.reduce((a,b)=>a.z>b.z?a:b);
    return {...state,startOpen:false,topZ:state.topZ+1,
      windowLimitError:"You have already opened too many windows",
      windows:state.windows.map(win=>win.id===front.id
        ?{...win,minimized:false,z:state.topZ+1}:win)};
  }
  const ordinal = state.nextWindowId;
  const viewport={width:typeof globalThis.window==="undefined"?960:globalThis.window.innerWidth,
    height:typeof globalThis.window==="undefined"?700:globalThis.window.innerHeight};
  const defaults=sourceWindowPlacement(app.window,ordinal,viewport);
  const remembersPlacement=sourceRemembersPlacement(app);
  const saved=remembersPlacement?state.windowPlacements?.[sourceWindowPlacementKey(app.id)]:undefined;
  const area=sourceWindowWorkAreaForTheme(state.theme,viewport);
  const placement=saved?sourceApplyWindowPlacement(saved,app.window,app.window.resizable!==false,area):
    sourceApplyWindowPlacement({...defaults,maximized:false},defaults,true,area);
  const window = {
    id: `${app.id}-${ordinal}`,
    appId: app.id,
    file,
    title: app.label,
    icon: app.icon,
    ...placement,
    z: state.topZ + 1,
    minimized: false,
    maximized: app.window.fullscreen===true||placement.maximized,
    remembersPlacement,
    resizable: app.window.resizable,
    minimizable: app.window.minimizable,
    titlebarIcon: app.window.titlebarIcon
  };
  return {
    ...state,
    windows: [...state.windows, window],
    nextWindowId: ordinal + 1,
    topZ: state.topZ + 1,
    startOpen: false
  };
}

function savePlacement(state:DesktopState,id:string):DesktopState{
  const win=state.windows.find(w=>w.id===id);
  if(!win?.remembersPlacement)return state;
  const key=sourceWindowPlacementKey(win.appId),next=sourceCaptureWindowPlacement(win);
  const previous=state.windowPlacements?.[key];
  if(previous&&previous.x===next.x&&previous.y===next.y&&previous.width===next.width&&previous.height===next.height&&previous.maximized===next.maximized)return state;
  return {...state,windowPlacements:{...state.windowPlacements,[key]:next}};
}
export function desktopReducer(state: DesktopState, action: DesktopAction): DesktopState {
  const next=reduceDesktop(state,action);
  return action.type==="TOGGLE_MAXIMIZE"||action.type==="SAVE_WINDOW_PLACEMENT"
    ?savePlacement(next,action.id):next;
}
function reduceDesktop(state: DesktopState, action: DesktopAction): DesktopState {
  switch (action.type) {
    case "SAVE_WINDOW_PLACEMENT":return state;
    case "BOOT_COMPLETE":
      return state.phase === "boot" ? { ...state, phase: "logon" } : state;
    case "GUEST_LOGIN":
      return state.phase === "logon"
        ? { ...state, phase: "desktop", session: { kind: "guest", label: "Guest" }, startOpen: false }
        : state;
    case "LOG_OFF":
      return { ...state, phase: "logon", session: null, windows: [], startOpen: false, selectedIcon: null };
    case "SWITCH_USER":
      // The original Switch view reuses logon UI, but does NOT log off or
      // close the current user's running desktop windows.
      return state.phase==="desktop"&&state.session
        ?{...state,phase:"switch",startOpen:false,selectedIcon:null}:state;
    case "RESUME_SESSION":
      return state.phase==="switch"&&state.session
        ?{...state,phase:"desktop",startOpen:false}:state;
    case "SHUTDOWN":
      return { ...state, phase: "shutdown", startOpen: false, windows: [] };
    case "BSOD":
      return state.phase==="desktop"
        ?{...state,phase:"bsod",bsodCode:action.code,startOpen:false,windows:[]}
        :state;
    case "RESTART": {
      const restored = initialDesktopState();
      return { ...restored, theme: state.theme, wallpaper: state.wallpaper,windowPlacements:state.windowPlacements };
    }
    case "OPEN_APP":
      return openWindow(state, action.app, action.file);
    case "CLEAR_WINDOW_LIMIT_ERROR":
      return state.windowLimitError?{...state,windowLimitError:null}:state;
    case "FOCUS_WINDOW": {
      if (!state.windows.some(window => window.id === action.id)) return state;
      return {
        ...state,
        topZ: state.topZ + 1,
        windows: state.windows.map(window => window.id === action.id
          ? { ...window, z: state.topZ + 1, minimized: false }
          : window),
        startOpen: false
      };
    }
    case "MOVE_WINDOW": {
      const viewport={width:typeof globalThis.window==="undefined"?960:globalThis.window.innerWidth,
        height:typeof globalThis.window==="undefined"?700:globalThis.window.innerHeight};
      const area=sourceWindowWorkAreaForTheme(state.theme,viewport);
      return {...state,windows:state.windows.map(win=>win.id===action.id
        ? {...win,x:Math.max(area.x,Math.min(action.x,area.x+area.width-win.width)),
          y:Math.max(area.y,Math.min(action.y,area.y+area.height-win.height))}
        :win)};
    }
    case "RESIZE_WINDOW": {
      if (![action.x,action.y,action.width,action.height].every(Number.isFinite) ||
          action.width<=0||action.height<=0||action.x<0||action.y<0) return state;
      return {...state,windows:state.windows.map(win=>win.id===action.id &&
        win.resizable!==false&&!win.maximized&&!win.minimized
        ? {...win,x:action.x,y:action.y,width:action.width,height:action.height,snapped:undefined,restoreBounds:undefined}:win)};
    }
    case "ARRANGE_WINDOW":
    case "RESTORE_WINDOW_FOR_DRAG": {
      const bounds=action.bounds;
      if(![bounds.x,bounds.y,bounds.width,bounds.height].every(Number.isFinite)||bounds.width<=0||bounds.height<=0||bounds.x<0||bounds.y<0)return state;
      return {...state,windows:state.windows.map(win=>{
        if(win.id!==action.id||win.resizable===false||win.minimized)return win;
        if(action.type==="RESTORE_WINDOW_FOR_DRAG")return {...win,...bounds,maximized:false,snapped:undefined,restoreBounds:undefined};
        if(action.mode===null)return {...win,...(win.restoreBounds??bounds),maximized:false,snapped:undefined,restoreBounds:undefined};
        return {...win,...bounds,maximized:false,snapped:action.mode,
          restoreBounds:win.restoreBounds??action.restoreBounds??{x:win.x,y:win.y,width:win.width,height:win.height}};
      })};
    }
    case "MINIMIZE_WINDOW":
      return { ...state, windows: state.windows.map(window => window.id === action.id
        ? { ...window, minimized: true }
        : window) };
    case "TOGGLE_MAXIMIZE":
      return { ...state, windows: state.windows.map(window => window.id === action.id
        ? window.resizable === false ? window
          : { ...window, maximized: !window.maximized, minimized: false }
        : window) };
    case "SET_MINESWEEPER_FULLSCREEN": {
      // Only the pinned game's level watcher may force its fixed-size window
      // into fullscreen; generic non-resizable windows stay protected.
      const target=state.windows.find(win=>win.id===action.id);
      if(!target||target.appId!=="minesweeper"||
         target.maximized===action.fullscreen)return state;
      return {...state,windows:state.windows.map(win=>win.id===action.id
        ? {...win,maximized:action.fullscreen,minimized:false} : win)};
    }
    case "CLOSE_WINDOW":
      return { ...state, windows: state.windows.filter(window => window.id !== action.id) };
    case "SET_WINDOW_TITLE":
      if (!state.windows.some(window => window.id === action.id && window.title !== action.title)) return state;
      return { ...state, windows: state.windows.map(window => window.id === action.id
        ? { ...window, title: action.title } : window) };
    case "TOGGLE_START":
      return state.phase === "desktop"
        ? { ...state, startOpen: !state.startOpen, selectedIcon: null }
        : state;
    case "CLOSE_START":
      return { ...state, startOpen: false };
    case "SELECT_ICON":
      return { ...state, selectedIcon: action.id, startOpen: false };
    case "SET_THEME":
      return { ...state, theme: action.theme,
        wallpaper:sourceShellWallpaper(action.theme) };
    case "SET_WALLPAPER":
      return { ...state, wallpaper: action.path };
  }
}

export {
  SOURCE_SEARCH_WEIGHT,sourceNormalizeSearch,sourceParseSearch,
  sourceFindSearchTerm,sourceScoreSearch,
  type SourceSearchQuery,type SourceSearchField
} from "./sourceSearch";

export {
  SOURCE_SEARCH_DEBOUNCE_MS,sourceCreateDelayedSearch,
  type SourceDelayedSearch
} from "./sourceDelayedSearch";

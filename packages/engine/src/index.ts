import type { AppDefinition, DesktopAction, DesktopState } from "@windows-os/contracts";
import {sourceShellWallpaper,sourceIsSystemWallpaper} from "@windows-os/assets";

export const LEGACY_DEFAULTS = Object.freeze({
  skipBoot: false,
  nativeCursor: false,
  theme: "win7" as const,
  soundVolume: 1
});

/** Legacy testmode.js supports a query-string theme override; never accept unknown skin IDs. */
export function sourceTestTheme(search: string): DesktopState["theme"] | null {
  const theme = new URLSearchParams(search).get("theme");
  return theme && ["win7", "winxp", "win11", "win10", "winvista",
    "win31", "win95", "win98"].includes(theme)
    ? theme as DesktopState["theme"] : null;
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
    return theme==="win7"||theme==="winxp"||theme==="win11"?theme:null;
  }catch{return null;}
}
export function initialDesktopState(): DesktopState {
  const theme=typeof window!=="undefined"
    ?sourceTestTheme(window.location.search)
      ??sourceSavedTheme(window.localStorage)
      ??LEGACY_DEFAULTS.theme
    :LEGACY_DEFAULTS.theme;
  return {
    phase: LEGACY_DEFAULTS.skipBoot ? "desktop" : "boot",
    theme,
    session: null,
    windows: [],
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
  const window = {
    id: `${app.id}-${ordinal}`,
    appId: app.id,
    file,
    title: app.label,
    icon: app.icon,
    ...sourceWindowPlacement(app.window, ordinal, {
      width: typeof globalThis.window === "undefined" ? 960 : globalThis.window.innerWidth,
      height: typeof globalThis.window === "undefined" ? 700 : globalThis.window.innerHeight
    }),
    z: state.topZ + 1,
    minimized: false,
    maximized: app.window.fullscreen===true,
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

export function desktopReducer(state: DesktopState, action: DesktopAction): DesktopState {
  switch (action.type) {
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
      return { ...restored, theme: state.theme, wallpaper: state.wallpaper };
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
    case "MOVE_WINDOW":
      return { ...state, windows: state.windows.map(window => window.id === action.id
        ? {
          ...window,
          x: Math.max(0, Math.min(action.x,
            Math.max(0, (typeof globalThis.window === "undefined" ? 960
              : globalThis.window.innerWidth) - window.width))),
          y: Math.max(0, Math.min(action.y,
            Math.max(0, (typeof globalThis.window === "undefined" ? 700
              : globalThis.window.innerHeight) - 40 - window.height)))
        }
        : window) };
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

import type { AppDefinition, DesktopAction, DesktopState } from "@windows-os/contracts";
import { legacyArt } from "@windows-os/assets";

export const LEGACY_DEFAULTS = Object.freeze({
  skipBoot: false,
  nativeCursor: false,
  theme: "win7" as const,
  soundVolume: 1
});

export function initialDesktopState(): DesktopState {
  return {
    phase: LEGACY_DEFAULTS.skipBoot ? "desktop" : "boot",
    theme: LEGACY_DEFAULTS.theme,
    session: null,
    windows: [],
    nextWindowId: 1,
    topZ: 10,
    startOpen: false,
    selectedIcon: null,
    wallpaper: legacyArt.wallpaperWin7
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

function openWindow(state: DesktopState, app: AppDefinition, file?: { path: string }): DesktopState {
  if (state.phase !== "desktop") return state;
  // Source Sticky Notes and Magnifier each address a single shell window
  // by their original fixed program IDs, even across repeated Start/Run opens.
  const singleton = app.id === "sticky" || app.id === "magnifier"
    || app.id === "about" || app.id === "taskmgr";
  const alreadyOpen = singleton
    ? state.windows.find(window => window.appId === app.id) : undefined;
  if (alreadyOpen) return {
    ...state, topZ: state.topZ + 1, startOpen: false,
    windows: state.windows.map(window => window.id === alreadyOpen.id
      ? { ...window, z: state.topZ + 1, minimized: false } : window)
  };
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
    maximized: false,
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
    case "SHUTDOWN":
      return { ...state, phase: "shutdown", startOpen: false, windows: [] };
    case "RESTART": {
      const restored = initialDesktopState();
      return { ...restored, theme: state.theme, wallpaper: state.wallpaper };
    }
    case "OPEN_APP":
      return openWindow(state, action.app, action.file);
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
      return { ...state, theme: action.theme };
    case "SET_WALLPAPER":
      return { ...state, wallpaper: action.path };
  }
}

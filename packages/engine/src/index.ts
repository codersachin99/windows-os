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

function openWindow(state: DesktopState, app: AppDefinition, file?: { path: string }): DesktopState {
  if (state.phase !== "desktop") return state;
  const ordinal = state.nextWindowId;
  const window = {
    id: `${app.id}-${ordinal}`,
    appId: app.id,
    file,
    title: app.label,
    icon: app.icon,
    width: app.window.width,
    height: app.window.height,
    x: 70 + ((ordinal - 1) % 7) * 26,
    y: 58 + ((ordinal - 1) % 7) * 26,
    z: state.topZ + 1,
    minimized: false,
    maximized: false
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
        ? { ...window, x: Math.max(0, action.x), y: Math.max(0, action.y) }
        : window) };
    case "MINIMIZE_WINDOW":
      return { ...state, windows: state.windows.map(window => window.id === action.id
        ? { ...window, minimized: true }
        : window) };
    case "TOGGLE_MAXIMIZE":
      return { ...state, windows: state.windows.map(window => window.id === action.id
        ? { ...window, maximized: !window.maximized, minimized: false }
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

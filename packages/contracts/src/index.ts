import type {SourceThemeId} from "./sourceThemeCatalog";
export type ThemeId = SourceThemeId;
export {SOURCE_THEME_SCREENS,SOURCE_THEME_CATALOG_IDS,SOURCE_THEME_SCREEN_DEFAULTS,
  sourceIsKnownTheme,sourceThemeScreens,sourceThemeShellStatus,
  SOURCE_XP_THEME_IDS,sourceIsXpFamily,
  SOURCE_AERO_THEME_IDS,sourceIsAeroFamily,
  type SourceThemeConfigId,type SourceThemeScreenId,type SourceThemeScreens}
  from "./sourceThemeCatalog";
export type SessionPhase = "boot" | "logon" | "switch" | "desktop" | "shutdown" | "bsod";
export type AppKind = "system" | "utility" | "media" | "game" | "web";

export interface AppDefinition {
  id: string;
  label: string;
  icon: string;
  kind: AppKind;
  /** Original registry/shortcut per-app multiwindow override. */
  allowMultipleWindows?:boolean;
  /** 0 means unlimited; undefined inherits source global cap 3. */
  maxWindowsPerApp?:number;
  /** Original src/config/app.registry.json command aliases for known apps. */
  aliases?:readonly string[];
  window: { width: number; height: number; resizable?: boolean; centered?: boolean;
    /** Pinned fullscreen WindowMain can be fixed-size while maximized. */
    fullscreen?:boolean;
    location?: "bottom-left"; minimizable?: boolean; titlebarIcon?: boolean };
  desktop?: boolean;
  showInStart?: boolean;
}

export interface DesktopWindow {
  id: string;
  appId: string;
  file?: { path: string };
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  titlebarIcon?: boolean;
}

export interface DesktopState {
  phase: SessionPhase;
  /** Original simulated BSOD reason, never a real host failure. */
  bsodCode?:string;
  theme: ThemeId;
  session: { kind: "guest"; label: "Guest" } | null;
  windows: DesktopWindow[];
  nextWindowId: number;
  topZ: number;
  startOpen: boolean;
  selectedIcon: string | null;
  wallpaper: string;
  windowLimitError?:string|null;
}

export type DesktopAction =
  | { type: "BOOT_COMPLETE" }
  | { type: "GUEST_LOGIN" }
  | { type: "LOG_OFF" }
  | { type: "SWITCH_USER" }
  | { type: "RESUME_SESSION" }
  | { type: "SHUTDOWN" }
  | { type: "BSOD"; code: string }
  | { type: "RESTART" }
  | { type: "OPEN_APP"; app: AppDefinition; file?: { path: string } }
  | { type: "CLEAR_WINDOW_LIMIT_ERROR" }
  | { type: "FOCUS_WINDOW"; id: string }
  | { type: "MOVE_WINDOW"; id: string; x: number; y: number }
  | { type: "MINIMIZE_WINDOW"; id: string }
  | { type: "TOGGLE_MAXIMIZE"; id: string }
  /** Source 245c fullscreen=true for Advanced, despite resizable=false. */
  | { type: "SET_MINESWEEPER_FULLSCREEN"; id: string; fullscreen: boolean }
  | { type: "CLOSE_WINDOW"; id: string }
  | { type: "SET_WINDOW_TITLE"; id: string; title: string }
  | { type: "TOGGLE_START" }
  | { type: "CLOSE_START" }
  | { type: "SELECT_ICON"; id: string | null }
  | { type: "SET_THEME"; theme: ThemeId }
  | { type: "SET_WALLPAPER"; path: string };

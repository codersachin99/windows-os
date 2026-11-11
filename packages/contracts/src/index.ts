export type ThemeId = "win7" | "winxp" | "win11" | "win10" | "winvista";
export type SessionPhase = "boot" | "logon" | "desktop" | "shutdown";
export type AppKind = "system" | "utility" | "media" | "game" | "web";

export interface AppDefinition {
  id: string;
  label: string;
  icon: string;
  kind: AppKind;
  window: { width: number; height: number };
  desktop?: boolean;
  showInStart?: boolean;
}

export interface DesktopWindow {
  id: string;
  appId: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

export interface DesktopState {
  phase: SessionPhase;
  theme: ThemeId;
  session: { kind: "guest"; label: "Guest" } | null;
  windows: DesktopWindow[];
  nextWindowId: number;
  topZ: number;
  startOpen: boolean;
  selectedIcon: string | null;
  wallpaper: string;
}

export type DesktopAction =
  | { type: "BOOT_COMPLETE" }
  | { type: "GUEST_LOGIN" }
  | { type: "LOG_OFF" }
  | { type: "SHUTDOWN" }
  | { type: "RESTART" }
  | { type: "OPEN_APP"; app: AppDefinition }
  | { type: "FOCUS_WINDOW"; id: string }
  | { type: "MOVE_WINDOW"; id: string; x: number; y: number }
  | { type: "MINIMIZE_WINDOW"; id: string }
  | { type: "TOGGLE_MAXIMIZE"; id: string }
  | { type: "CLOSE_WINDOW"; id: string }
  | { type: "TOGGLE_START" }
  | { type: "CLOSE_START" }
  | { type: "SELECT_ICON"; id: string | null }
  | { type: "SET_THEME"; theme: ThemeId }
  | { type: "SET_WALLPAPER"; path: string };

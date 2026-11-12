import { useCallback, useEffect, useRef, useState, type Dispatch } from "react";
import type { DesktopAction, DesktopState } from "@windows-os/contracts";
import { legacyArt } from "@windows-os/assets";
import { appRegistry } from "@windows-os/sdk";
import { ContactsApp } from "@windows-os/apps/contacts";
import { NotepadApp } from "@windows-os/apps/notepad";
import { CalculatorApp } from "@windows-os/apps/calculator";
import { ExplorerApp, RecycleBinApp } from "@windows-os/apps/explorer";
import { WindowFrame } from "./WindowFrame";
import { StartMenu } from "./StartMenu";
import { DesktopIcons } from "./DesktopIcons";

interface DesktopShellProps {
  state: DesktopState;
  dispatch: Dispatch<DesktopAction>;
}

interface ApplicationContentProps {
  appId: string;
  filePath?: string;
  windowId: string;
  dispatch: Dispatch<DesktopAction>;
  registerClose(id: string, handler: () => void): () => void;
}
function ApplicationContent({ appId, filePath, windowId, dispatch, registerClose }: ApplicationContentProps) {
  if (appId === "calc") return <CalculatorApp />;
  if (appId === "notepad") return <NotepadApp initialFilePath={filePath}
    onClose={() => dispatch({ type: "CLOSE_WINDOW", id: windowId })}
    onTitleChange={title => dispatch({ type: "SET_WINDOW_TITLE", id: windowId, title })}
    onRegisterClose={handler => registerClose(windowId, handler)} />;

  if (appId === "web_contacts") {
    return <ContactsApp />;
  }
  if (appId === "bin") return <RecycleBinApp />;
  if (appId === "computer") return <ExplorerApp initialPath={filePath}
    onOpenTextFile={path => {
      const app = appRegistry.get("notepad");
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

export function DesktopShell({ state, dispatch }: DesktopShellProps) {
  const desktop = appRegistry.desktop();
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
      if (!event.altKey || event.key !== "F4" || event.repeat || state.phase !== "desktop") return;
      const focused = [...state.windows].filter(win => !win.minimized)
        .sort((a, b) => b.z - a.z)[0];
      if (focused) {
        event.preventDefault();
        requestClose(focused.id);
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [state.windows, state.phase, requestClose]);

  return (
    <main className="windows-desktop" data-test-main-screen="" data-theme={state.theme}>
      <div className="desktop-background is-static windows-desktop__wallpaper"
        data-test-desktop-background={state.wallpaper}
        style={{ backgroundImage: `url("${state.wallpaper}")` }} />
      <div id="desktop" className="desktop__wrapper windows-desktop__workspace"
        onClick={() => dispatch({ type: "SELECT_ICON", id: null })}>
        <DesktopIcons apps={desktop} dispatch={dispatch} />
      </div>
      {state.windows.map(win => (
        <WindowFrame key={win.id} window={win} dispatch={dispatch}
          onRequestClose={() => requestClose(win.id)}>
          <ApplicationContent appId={win.appId} filePath={win.file?.path} windowId={win.id} dispatch={dispatch}
            registerClose={registerClose} />
        </WindowFrame>
      ))}
      {state.startOpen && <StartMenu dispatch={dispatch} />}
      <footer className="windows-taskbar" data-test-taskbar="base">
        <button className="windows-taskbar__start" data-test-start-button="" aria-label="Open Start menu"
          onClick={() => dispatch({ type: "TOGGLE_START" })}>
          <img src={legacyArt.startOrb} alt="" draggable={false} />
        </button>
        <div className="windows-taskbar__running">
          {state.windows.map(win => (
            <button key={win.id} className={`windows-taskbar__application ${win.minimized ? "is-minimized" : ""}`}
              title={win.title} aria-label={`Switch to ${win.title}`} onClick={() => dispatch({
                type: win.minimized ? "FOCUS_WINDOW" : "MINIMIZE_WINDOW", id: win.id
              })}>
              <img src={win.icon} alt="" width={26} height={26} />
            </button>
          ))}
        </div>
        <div className="windows-taskbar__tray">
          <button title="Show hidden icons" aria-label="Show hidden icons">▴</button>
          <span role="img" aria-label="Sound">◖))</span>
          <Clock />
        </div>
        <button className="windows-taskbar__show-desktop" aria-label="Show desktop"
          onClick={() => state.windows.forEach(win => dispatch({ type: "MINIMIZE_WINDOW", id: win.id }))} />
      </footer>
    </main>
  );
}

import { useCallback, useEffect, useRef, useState, type Dispatch } from "react";
import type { DesktopAction, DesktopState } from "@windows-os/contracts";
import { legacyArt } from "@windows-os/assets";
import { appRegistry } from "@windows-os/sdk";
import { ContactsApp } from "@windows-os/apps/contacts";
import { NotepadApp } from "@windows-os/apps/notepad";
import { CalculatorApp } from "@windows-os/apps/calculator";
import { RunApp } from "@windows-os/apps/run";
import { StickyNotesApp } from "@windows-os/apps/sticky";
import { MagnifierApp, sourceMagnifierOrigin, sourceMagnifierTransform } from "@windows-os/apps/magnifier";
import { AboutApp } from "@windows-os/apps/about";
import { TaskManagerApp } from "@windows-os/apps/taskmgr";
import { FindApp } from "@windows-os/apps/find";
import { ExplorerApp, RecycleBinApp } from "@windows-os/apps/explorer";
import { WindowFrame } from "./WindowFrame";
import { StartMenu } from "./StartMenu";
import { DesktopIcons } from "./DesktopIcons";
import { ShortcutWizard } from "./ShortcutWizard";

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
  onMagnifierScale(scale: number): void;
  theme: DesktopState["theme"];
  windows: DesktopState["windows"];
  onRequestCloseWindow(id: string): void;
}
function ApplicationContent({
  appId, filePath, windowId, dispatch, registerClose, onMagnifierScale,
  windows, onRequestCloseWindow, theme
}: ApplicationContentProps) {
  if (appId === "shortcut") return <ShortcutWizard
    onClose={() => dispatch({ type: "CLOSE_WINDOW", id: windowId })}
    onRegisterClose={handler => registerClose(windowId, handler)} />;
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

  if (appId === "web_contacts") {
    return <ContactsApp />;
  }
  if (appId === "bin") return <RecycleBinApp />;
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
  const [magnifierScale, setMagnifierScale] = useState(1);
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

  return (
    <main className="windows-desktop" data-test-main-screen="" data-theme={state.theme}>
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
        style={{ backgroundImage: `url("${state.wallpaper}")` }} />
      <div id="desktop" className="desktop__wrapper windows-desktop__workspace"
        onClick={() => dispatch({ type: "SELECT_ICON", id: null })}>
        <DesktopIcons apps={desktop} dispatch={dispatch} />
      </div>
      {state.windows.filter(win => win.appId !== "magnifier").map(win => win.appId === "sticky" ? (
        // The pinned source renders sticky notes as multiple floating panels,
        // not inside a single WindowMain/WindowFrame. The shell still owns the
        // taskbar app, z-order and minimize/restore lifecycle.
        <StickyNotesApp key={win.id} zIndex={win.z} minimized={win.minimized}
          onClose={() => dispatch({ type: "CLOSE_WINDOW", id: win.id })}
          onFocus={() => dispatch({ type: "FOCUS_WINDOW", id: win.id })} />
      ) : (
        <WindowFrame key={win.id} window={win} dispatch={dispatch}
          onRequestClose={() => requestClose(win.id)}>
          <ApplicationContent appId={win.appId} filePath={win.file?.path} windowId={win.id} dispatch={dispatch}
            registerClose={registerClose} onMagnifierScale={setMagnifierScale} theme={state.theme}
            windows={state.windows} onRequestCloseWindow={requestClose} />
        </WindowFrame>
      ))}
      {state.startOpen && <StartMenu dispatch={dispatch} />}
      </div>
      {/* The control surface remains independent of the transformed canvas;
          other programs and their windows zoom together with the desktop. */}
      {state.windows.filter(win => win.appId === "magnifier").map(win => (
        <WindowFrame key={win.id} window={win} dispatch={dispatch}
          onRequestClose={() => requestClose(win.id)}>
          <ApplicationContent appId={win.appId} windowId={win.id} dispatch={dispatch}
            registerClose={registerClose} onMagnifierScale={setMagnifierScale} theme={state.theme}
            windows={state.windows} onRequestCloseWindow={requestClose} />
        </WindowFrame>
      ))}
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

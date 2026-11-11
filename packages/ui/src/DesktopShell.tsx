import { useEffect, useState, type Dispatch } from "react";
import type { DesktopAction, DesktopState } from "@windows-os/contracts";
import { legacyArt } from "@windows-os/assets";
import { appRegistry } from "@windows-os/sdk";
import { WindowFrame } from "./WindowFrame";
import { StartMenu } from "./StartMenu";

interface DesktopShellProps {
  state: DesktopState;
  dispatch: Dispatch<DesktopAction>;
}

function ApplicationContent({ appId }: { appId: string }) {
  if (appId === "contacts") {
    return <iframe className="windows-window__iframe" src="/apps/contacts/index.html" title="Contacts" />;
  }
  if (appId === "bin") {
    return <div className="windows-explorer">
      <div className="windows-explorer__toolbar">Organize　　Empty the Recycle Bin</div>
      <div className="windows-explorer__crumb">Recycle Bin</div>
      <div className="windows-explorer__empty">Recycle Bin is empty.</div>
    </div>;
  }
  if (appId === "computer") {
    return <div className="windows-explorer">
      <div className="windows-explorer__toolbar">Organize　　System properties</div>
      <div className="windows-explorer__crumb">Computer</div>
      <div className="windows-explorer__empty">
        This browser-based computer view does not expose host drives.
        Source-equivalent simulated files and devices are pending migration.
      </div>
    </div>;
  }
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
  return (
    <main className="windows-desktop" data-test-main-screen="" data-theme={state.theme}>
      <div className="desktop-background is-static windows-desktop__wallpaper"
        data-test-desktop-background={state.wallpaper}
        style={{ backgroundImage: `url("${state.wallpaper}")` }} />
      <div id="desktop" className="desktop__wrapper windows-desktop__workspace"
        onClick={() => dispatch({ type: "SELECT_ICON", id: null })}>
        <div id="desktop-icons" className="desktop__icon-list windows-desktop__icons">
          {desktop.map(app => (
            <button key={app.id} data-test-desktop-icon={app.id}
              className={`desktop__icon-item windows-desktop__shortcut ${state.selectedIcon === app.id ? "is-active" : ""}`}
              onClick={event => { event.stopPropagation(); dispatch({ type: "SELECT_ICON", id: app.id }); }}
              onDoubleClick={event => { event.stopPropagation(); dispatch({ type: "OPEN_APP", app }); }}
              aria-label={app.label} title={app.label}>
              <span className="desktop__icon-box"><img className="desktop__icon-icon" src={app.icon} draggable={false} alt="" /></span>
              <span className="desktop__icon-name">{app.label}</span>
            </button>
          ))}
        </div>
      </div>
      {state.windows.map(win => (
        <WindowFrame key={win.id} window={win} dispatch={dispatch}>
          <ApplicationContent appId={win.appId} />
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

import { useCallback, useEffect, useReducer, useRef } from "react";
import { desktopReducer, initialDesktopState } from "@windows-os/engine";
import { BootScreen, DesktopShell, LogonScreen, SourceBsodScreen } from "@windows-os/ui";
import { sourceFilesystemRuntime } from "@windows-os/sdk";
import {sourceDefaultTrayPreferences} from "@windows-os/apps/cpanel";
import {useState} from "react";

export default function App() {
  const [state, dispatch] = useReducer(desktopReducer, undefined, initialDesktopState);
  const [trayPreferences,setTrayPreferences]=useState(sourceDefaultTrayPreferences);
  const guestLoginPending = useRef(false);
  const finishBoot = useCallback(() => dispatch({ type: "BOOT_COMPLETE" }), []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (state.phase !== "desktop") return;
      // Do not close Start globally on Escape. Original shell popups own
      // Escape dismissal in z-order (Start program context first, then Start).
      // StartMenu delegates focus restoration to DesktopShell after unmount.
      if ((event.key === "Meta" || (event.ctrlKey && event.key === "Escape")) && !event.repeat) {
        event.preventDefault();
        dispatch({ type: "TOGGLE_START" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.phase]);
  if (state.phase === "boot") return <BootScreen onComplete={finishBoot} />;
  if (state.phase === "logon") return <LogonScreen onGuest={() => {
    if (guestLoginPending.current) return;
    guestLoginPending.current = true;
    // Source g.init() creates drive0/System C: and g.ensureUser(null) creates
    // the Guest profile. Prefer any previously supplied runtime metadata.
    void sourceFilesystemRuntime.startGuest()
      .catch(error => console.warn("Legacy Guest filesystem could not initialize", error))
      .finally(() => {
        guestLoginPending.current = false;
        dispatch({ type: "GUEST_LOGIN" });
      });
  }}
    onShutdown={() => dispatch({ type: "SHUTDOWN" })} onRestart={() => dispatch({ type: "RESTART" })} />;
  if (state.phase === "bsod") return <SourceBsodScreen
    code={state.bsodCode??"DUMMY_BSOD"} onRestart={() => dispatch({type:"RESTART"})}/>;
  if (state.phase === "switch") return <LogonScreen
    onGuest={() => dispatch({type:"RESUME_SESSION"})}
    onShutdown={() => dispatch({type:"SHUTDOWN"})}
    onRestart={() => dispatch({type:"RESTART"})}/>;
  if (state.phase === "shutdown") return <main className="windows-shutdown">
    <img src="/assets/images/start-button-classic.ec7b0b9f.webp" width={64} height={64} alt="" />
    <p>Windows is shutting down</p>
    <button onClick={() => dispatch({ type: "RESTART" })}>Restart WindowsOS</button>
  </main>;
  return <DesktopShell state={state} dispatch={dispatch}
    trayPreferences={trayPreferences}
    onTrayPreferencesChange={setTrayPreferences}/>;
}

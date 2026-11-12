import { useCallback, useEffect, useReducer } from "react";
import { desktopReducer, initialDesktopState } from "@windows-os/engine";
import { BootScreen, DesktopShell, LogonScreen } from "@windows-os/ui";
import { sourceFilesystemRuntime } from "@windows-os/sdk";

export default function App() {
  const [state, dispatch] = useReducer(desktopReducer, undefined, initialDesktopState);
  const finishBoot = useCallback(() => dispatch({ type: "BOOT_COMPLETE" }), []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (state.phase !== "desktop") return;
      if (event.key === "Escape") dispatch({ type: "CLOSE_START" });
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
    // Mount only previously supplied source metadata, if available.
    void sourceFilesystemRuntime.restorePersisted().catch(error => {
      console.warn("Legacy source filesystem was not restored", error);
    });
    dispatch({ type: "GUEST_LOGIN" });
  }}
    onShutdown={() => dispatch({ type: "SHUTDOWN" })} onRestart={() => dispatch({ type: "RESTART" })} />;
  if (state.phase === "shutdown") return <main className="windows-shutdown">
    <img src="/assets/images/start-button-classic.ec7b0b9f.webp" width={64} height={64} alt="" />
    <p>Windows is shutting down</p>
    <button onClick={() => dispatch({ type: "RESTART" })}>Restart WindowsOS</button>
  </main>;
  return <DesktopShell state={state} dispatch={dispatch} />;
}

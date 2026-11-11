import { useState, type Dispatch } from "react";
import type { DesktopAction } from "@windows-os/contracts";
import { legacyArt } from "@windows-os/assets";
import { appRegistry } from "@windows-os/sdk";

interface StartMenuProps {
  dispatch: Dispatch<DesktopAction>;
}

export function StartMenu({ dispatch }: StartMenuProps) {
  const [query, setQuery] = useState("");
  const programs = appRegistry.startMenu().filter(app => app.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <nav className="windows-startmenu" id="start-menu" data-test-start-menu="" aria-label="Start menu">
      <div className="windows-startmenu__left">
        <div className="windows-startmenu__programs">
          {programs.map(app => (
            <button key={app.id} data-test-program={app.id}
              className="windows-startmenu__program" onClick={() => dispatch({ type: "OPEN_APP", app })}>
              <img src={app.icon} width={30} height={30} alt="" />
              <span>{app.label}</span>
            </button>
          ))}
          {!programs.length && <p className="windows-startmenu__empty">No items match your search.</p>}
        </div>
        <label className="windows-startmenu__search">
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search programs and files" aria-label="Search programs and files" autoFocus />
          <span>⌕</span>
        </label>
      </div>
      <div className="windows-startmenu__right">
        <img src={legacyArt.guestAvatar} alt="Guest" className="windows-startmenu__avatar" />
        <strong>Guest</strong>
        <hr />
        <button onClick={() => dispatch({ type: "OPEN_APP", app: appRegistry.get("computer")! })}>Computer</button>
        <button onClick={() => dispatch({ type: "OPEN_APP", app: appRegistry.get("web_contacts")! })}>Contacts</button>
        <hr />
        <button onClick={() => dispatch({ type: "LOG_OFF" })}>Log off</button>
        <button className="windows-startmenu__power" onClick={() => dispatch({ type: "SHUTDOWN" })}>Shut down</button>
      </div>
    </nav>
  );
}

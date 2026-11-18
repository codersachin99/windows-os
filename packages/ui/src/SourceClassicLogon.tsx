import {useState} from "react";
import {legacyArt} from "@windows-os/assets";
import type {ThemeId} from "@windows-os/contracts";
import "./sourceClassicLogon.css";

/** Source logon-win31.js and logon-win9x.js both mount logon-window.
 * This Guest-only adapter preserves their different classic-window positions
 * and form entry points. Real account authentication is not yet migrated. */
export type SourceClassicLogonFamily="win31"|"win95"|"win98";

export interface SourceClassicLogonProps{
  theme:ThemeId;
  family:SourceClassicLogonFamily;
  shellStatus:"partial"|"pending";
  onGuest:()=>void;
  onShutdown:()=>void;
  onRestart:()=>void;
}

export function SourceClassicLogon({
  theme,family,shellStatus,onGuest,onShutdown,onRestart
}:SourceClassicLogonProps){
  const [showAccount,setShowAccount]=useState(false);
  const [showPower,setShowPower]=useState(false);
  const [showOptions,setShowOptions]=useState(false);
  const nameId="source-classic-"+family+"-username";
  const passwordId="source-classic-"+family+"-password";
  const win31=family==="win31";
  return (
    <main className={"windows-logon source-classic-logon is-"+family}
      data-test-logon-screen data-source-theme-id={theme}
      data-source-logon-theme={family}
      data-source-shell-status={shellStatus}
      data-source-logon-renderer={family}>
      <section className="source-classic-logon__window" role="dialog"
        aria-label="Logon Windows">
        <header className="source-classic-logon__titlebar">Logon Windows</header>
        <div className="source-classic-logon__section">
          <img className="source-classic-logon__avatar"
            src={legacyArt.guestAvatar} alt="" width={64} height={64}/>
          <form className="source-classic-logon__form" onSubmit={event=>{
            event.preventDefault();
            setShowAccount(true);
          }}>
            {!win31&&<p className="source-classic-logon__instruction">
              Type a user name and password to log on to Windows.
            </p>}
            <label htmlFor={nameId}>User name:</label>
            <input id={nameId} name="username" type="text"
              autoComplete="username" aria-label="User name"/>
            <label htmlFor={passwordId}>Password:</label>
            <input id={passwordId} name="password" type="password"
              autoComplete="current-password" aria-label="Password"/>
            <div className="source-classic-logon__buttons">
              <button type="submit">Logon</button>
              <button type="button" data-test-avatar="win7"
                data-test-source-logon-avatar={family}
                aria-label="Log in as Guest" onClick={onGuest}>Guest Logon</button>
              <button type="button" aria-expanded={showOptions}
                onClick={()=>setShowOptions(!showOptions)}>Options</button>
            </div>
            {showOptions&&<div className="source-classic-logon__options">
              <button type="button" onClick={()=>setShowAccount(true)}>
                Create an account
              </button>
            </div>}
          </form>
        </div>
      </section>
      <div className="source-classic-logon__power">
        <button type="button" data-test-logon-shutdown
          aria-label="Shut down" onClick={onShutdown}>Shut down</button>
        <button type="button" aria-label="Power options"
          aria-expanded={showPower} onClick={()=>setShowPower(!showPower)}>▴</button>
        {showPower&&<div className="source-classic-logon__power-menu" role="menu">
          <button type="button" role="menuitem" data-test-logon-restart
            onClick={onRestart}>Restart</button>
          <button type="button" role="menuitem"
            onClick={onShutdown}>Shut down</button>
        </div>}
      </div>
      {showAccount&&<div className="source-classic-logon__unavailable"
        role="dialog" aria-label="Account login">
        <p>Account sign-in requires the original authentication backend.</p>
        <button type="button" onClick={()=>setShowAccount(false)}>Back</button>
      </div>}
    </main>
  );
}

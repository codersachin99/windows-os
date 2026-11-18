import {useState} from "react";
import type {ThemeId} from "@windows-os/contracts";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import "./sourceWin8Logon.css";

export interface SourceWin8LogonProps{
  theme:ThemeId;
  onGuest:()=>void;
  onShutdown:()=>void;
  onRestart:()=>void;
}

/**
 * Final-source logon-win8.js and logon-win8.css share this view for
 * theme IDs win8 and win81. It is NOT a finished shell or original account
 * backend; Guest entry and the source user-form shape are retained.
 */
export function SourceWin8Logon({theme,onGuest,onShutdown,onRestart}:SourceWin8LogonProps){
  const [showAccount,setShowAccount]=useState(false);
  const [showPower,setShowPower]=useState(false);
  return <main className="windows-logon source-win8-logon"
    data-test-logon-screen data-source-theme-id={theme}
    data-source-logon-theme="win8"
    data-source-logon-renderer="win8" data-source-shell-status="pending">
    <section className="source-win8-logon__pane" aria-label="Guest account">
      <button className="source-win8-logon__avatar avatar-button can-click"
        data-test-avatar="win7" data-test-source-logon-avatar="win8"
        aria-label="Log in as Guest" onClick={onGuest}>
        <img src={sourceThemeLogonArtwork.win8.guest} alt="Guest avatar"
          width={150} height={150}/>
      </button>
      <div className="source-win8-logon__details">
        <h1>Guest</h1>
        <button className="source-win8-logon__signin" type="button"
          onClick={onGuest} aria-label="Sign in as Guest">
          <span>Sign in</span>
          <span className="source-win8-logon__arrow" aria-hidden="true"/>
        </button>
        <button className="source-win8-logon__switch" type="button"
          onClick={()=>setShowAccount(true)}>Switch user</button>
      </div>
    </section>
    <div className="source-win8-logon__power">
      <button type="button" data-test-logon-shutdown
        aria-label="Shut down" onClick={onShutdown}>⏻</button>
      <button type="button" aria-label="Power options"
        aria-expanded={showPower} onClick={()=>setShowPower(!showPower)}>▴</button>
      {showPower&&<div className="source-win8-logon__power-menu" role="menu">
        <button type="button" role="menuitem" data-test-logon-restart
          onClick={onRestart}>Restart</button>
        <button type="button" role="menuitem" onClick={onShutdown}>Shut down</button>
      </div>}
    </div>
    {showAccount&&<div role="dialog" className="source-win8-logon__unavailable"
      aria-label="Account login">
      <p>Account sign-in requires the original authentication backend.</p>
      <button type="button" onClick={()=>setShowAccount(false)}>Back</button>
    </div>}
  </main>;
}

import {useState} from "react";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import type {ThemeId} from "@windows-os/contracts";
import "./sourceAeroNoirLogon.css";

export interface SourceAeroNoirLogonProps{
  theme:ThemeId;
  shellStatus:"partial"|"pending";
  onGuest:()=>void;
  onShutdown:()=>void;
  onRestart:()=>void;
}

/** Frozen legacy-win7 src/modules/themes/logon-aeronoir.js module 089e
 * with the original src/styles/themes/logon-aeronoir.css.
 * Only the Guest and source power lifecycle is represented; the
 * original logon-base account authentication and spinner remain pending.
 */
export function SourceAeroNoirLogon({
  theme,shellStatus,onGuest,onShutdown,onRestart
}:SourceAeroNoirLogonProps){
  const [showAccount,setShowAccount]=useState(false);
  const art=sourceThemeLogonArtwork.aeroNoir;
  return <main className="windows-logon source-aeronoir-logon is-aeronoir"
    data-test-logon-screen=""
    data-source-theme-id={theme}
    data-source-logon-theme="aeroNoir"
    data-source-logon-renderer="aeroNoir"
    data-source-shell-status={shellStatus}
    style={{backgroundImage:`url("${art.background}")`}}>
    <div className="source-aeronoir-logon__overlay" aria-hidden="true"/>
    <section className="source-aeronoir-logon__account" aria-label="Guest account">
      <button className="source-aeronoir-logon__avatar avatar-button can-click"
        type="button" onClick={onGuest}
        data-test-avatar="win7" data-test-source-logon-avatar="aeroNoir"
        aria-label="Log in as Guest">
        <img src={art.guest} width={150} height={150} alt="Guest avatar"/>
      </button>
      <h1>Guest</h1>
      <button className="source-aeronoir-logon__signin" type="button"
        onClick={onGuest}>Sign in</button>
      <button className="source-aeronoir-logon__switch" type="button"
        onClick={()=>setShowAccount(true)}>Other user</button>
    </section>
    <footer className="source-aeronoir-logon__power" aria-label="Power controls">
      <button className="source-aeronoir-logon__power-item" type="button"
        data-test-logon-restart="" onClick={onRestart}>
        <img src={art.restart} alt="" width={36} height={36}/><span>Restart</span>
      </button>
      <button className="source-aeronoir-logon__power-item" type="button"
        data-test-logon-shutdown="" onClick={onShutdown}>
        <img src={art.shutdown} alt="" width={36} height={36}/><span>Shutdown</span>
      </button>
    </footer>
    {showAccount&&<div className="source-aeronoir-logon__unavailable"
      role="dialog" aria-label="Account login">
      <p>Account sign-in requires the original authentication backend.</p>
      <button type="button" onClick={()=>setShowAccount(false)}>Back</button>
    </div>}
  </main>;
}

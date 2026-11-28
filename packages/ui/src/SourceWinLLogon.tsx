import {useState} from "react";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import type {ThemeId} from "@windows-os/contracts";
import "./sourceWinLLogon.css";

export interface SourceWinLLogonProps{
  theme:ThemeId;
  shellStatus:"partial"|"pending";
  onGuest:()=>void;
  onShutdown:()=>void;
  onRestart:()=>void;
}

/** Frozen legacy-win7@26b9f0ce7 src/modules/themes/logon-winl.js
 * module c17d + src/styles/themes/logon-winl.css. Both winLS and winLP
 * select this one original logon family. Guest-only session lifecycle;
 * account authentication, login-form and service are not simulated.
 */
export function SourceWinLLogon({
  theme,shellStatus,onGuest,onShutdown,onRestart
}:SourceWinLLogonProps){
  const [showAccount,setShowAccount]=useState(false);
  const art=sourceThemeLogonArtwork.winLS;
  return <main className="windows-logon source-winl-logon is-winl"
    data-test-logon-screen
    data-source-theme-id={theme}
    data-source-logon-theme="winLS"
    data-source-logon-renderer="winLS"
    data-source-shell-status={shellStatus}
    style={{backgroundImage:`url("${art.background}")`}}>
    <section className="source-winl-logon__container" aria-label="Guest login">
      <img className="source-winl-logon__brand" src={art.brand}
        width={50} height={50} alt="" data-test-source-logon-logo="winLS"/>
      <div className="source-winl-logon__pane">
        <button type="button" className="source-winl-logon__avatar avatar-button can-click"
          aria-label="Log in as Guest" onClick={onGuest}
          data-test-avatar="win7" data-test-source-logon-avatar="winLS">
          <img src={art.guest} width={100} height={100} alt="Guest avatar"/>
        </button>
        <div className="source-winl-logon__account">
          <strong>Guest</strong>
          <span>To log on as a guest, click the Guest icon</span>
          <button type="button" onClick={()=>setShowAccount(true)}>Switch User</button>
        </div>
      </div>
      <footer className="source-winl-logon__power">
        <button type="button" onClick={onRestart}
          aria-label="Restart" data-test-logon-restart="">Restart</button>
        <button type="button" onClick={onShutdown}
          aria-label="Shut down" data-test-logon-shutdown="">Shutdown</button>
      </footer>
    </section>
    {showAccount&&<div className="source-winl-logon__unavailable"
      role="dialog" aria-label="Account login">
      <p>Account sign-in requires the original authentication backend.</p>
      <button type="button" onClick={()=>setShowAccount(false)}>Back</button>
    </div>}
  </main>;
}

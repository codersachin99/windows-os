import {useState} from "react";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import type {ThemeId} from "@windows-os/contracts";
import "./sourceKubuntuLogon.css";

/** Frozen logon-kubuntu.js 17bf + logon-base.js eb37 Guest adapter.
 * Original account authentication and loading/error lifecycle remain pending. */
export function SourceKubuntuLogon({theme,shellStatus,onGuest,onShutdown,onRestart}:{
  theme:ThemeId;shellStatus:"partial"|"pending";
  onGuest:()=>void;onShutdown:()=>void;onRestart:()=>void;
}){
  const [showAccount,setShowAccount]=useState(false);
  const art=sourceThemeLogonArtwork.kubuntu;
  return <main className="windows-logon source-kubuntu-logon is-kubuntu"
    data-test-logon-screen="" data-source-theme-id={theme}
    data-source-logon-theme="kubuntu" data-source-logon-renderer="kubuntu"
    data-source-shell-status={shellStatus}
    style={{backgroundImage:`url("${art.background}")`}}>
    <div className="source-kubuntu-logon__overlay" aria-hidden="true"/>
    <section className="source-kubuntu-logon__account" aria-label="Guest account">
      <button type="button" className="source-kubuntu-logon__avatar avatar-button can-click"
        data-test-avatar="win7" data-test-source-logon-avatar="kubuntu"
        aria-label="Log in as Guest" onClick={onGuest}>
        <img src={art.guest} width={150} height={150} alt="Guest avatar"/>
      </button>
      <h1>Guest</h1>
      <button type="button" className="source-kubuntu-logon__form-button"
        onClick={()=>setShowAccount(true)}>Switch User</button>
    </section>
    <footer className="source-kubuntu-logon__power" aria-label="Power controls">
      <button type="button" data-test-logon-restart="" onClick={onRestart}>
        <img src={art.restart} width={48} height={48} alt=""/><span>Restart</span>
      </button>
      <button type="button" data-test-logon-shutdown="" onClick={onShutdown}>
        <img src={art.shutdown} width={48} height={48} alt=""/><span>Shutdown</span>
      </button>
    </footer>
    {showAccount&&<div className="source-kubuntu-logon__unavailable"
      role="dialog" aria-label="Account login">
      <p>Account sign-in requires the original authentication backend.</p>
      <button className="source-kubuntu-logon__form-button" type="button"
        onClick={()=>setShowAccount(false)}>Back</button>
    </div>}
  </main>;
}

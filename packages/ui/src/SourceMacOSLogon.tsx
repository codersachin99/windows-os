import {useState} from "react";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import type {ThemeId} from "@windows-os/contracts";
import "./sourceMacOSLogon.css";

function ActionGlyph({kind}:{kind:"shutdown"|"switch"|"restart"}){
  return <span className="source-macos-logon__action-icon" data-source-action={kind} aria-hidden="true">
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {kind==="shutdown"&&<path d="M12 2v10M6 5a9 9 0 1 0 12 0"/>}
      {kind==="switch"&&<path d="M20 5v6h-6M4 19v-6h6M4.5 9A8 8 0 0 1 18 5l2 3M4 16l2 3a8 8 0 0 0 13.5-4"/>}
      {kind==="restart"&&<><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z" fill="currentColor" stroke="none"/></>}
    </svg>
  </span>;
}
/** Pinned logon-macos.js ff91 and matching CSS. Guest-only local session;
 * original account authentication and loading/error states remain pending. */
export function SourceMacOSLogon({theme,shellStatus,onGuest,onShutdown,onRestart}:{
  theme:ThemeId;shellStatus:"partial"|"pending";
  onGuest:()=>void;onShutdown:()=>void;onRestart:()=>void;
}){
  const [showAccount,setShowAccount]=useState(false);
  const art=sourceThemeLogonArtwork.macos;
  return <main className="windows-logon source-macos-logon is-macos"
    data-test-logon-screen="" data-source-theme-id={theme}
    data-source-logon-theme="macos" data-source-logon-renderer="macos"
    data-source-shell-status={shellStatus}
    style={{backgroundImage:`url("${art.background}")`}}>
    <div className="source-macos-logon__overlay" aria-hidden="true"/>
    <section className="source-macos-logon__account" aria-label="Guest account">
      <button type="button" className="source-macos-logon__avatar avatar-button can-click"
        data-test-avatar="win7" data-test-source-logon-avatar="macos"
        aria-label="Log in as Guest" onClick={onGuest}>
        <img src={art.guest} width={150} height={150} alt="Guest avatar"/>
      </button>
      <h1>Guest</h1>
    </section>
    <footer className="source-macos-logon__actions" aria-label="Session controls">
      <button type="button" data-test-logon-shutdown="" onClick={onShutdown}>
        <ActionGlyph kind="shutdown"/>Shutdown
      </button>
      <button type="button" data-test-logon-switch="" onClick={()=>setShowAccount(open=>!open)}>
        <ActionGlyph kind="switch"/>Switch User
      </button>
      <button type="button" data-test-logon-restart="" onClick={onRestart}>
        <ActionGlyph kind="restart"/>Restart
      </button>
    </footer>
    {showAccount&&<div className="source-macos-logon__unavailable" role="dialog" aria-label="Account login">
      <p>Account sign-in requires the original authentication backend.</p>
      <button type="button" onClick={()=>setShowAccount(false)}>Back</button>
    </div>}
  </main>;
}

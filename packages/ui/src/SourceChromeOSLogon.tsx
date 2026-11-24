import {useEffect,useState} from "react";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import type {ThemeId} from "@windows-os/contracts";
import "./sourceChromeOSLogon.css";

function clockText(){
  const now=new Date();
  return [now.getHours(),now.getMinutes()].map(n=>String(n).padStart(2,"0")).join(":");
}
function StatusClock(){
  const [time,setTime]=useState(clockText);
  useEffect(()=>{
    const interval=setInterval(()=>setTime(clockText()),1000);
    return ()=>clearInterval(interval);
  },[]);
  return <span data-test-source-chromeos-clock="">{time}</span>;
}
function Glyph({kind}:{kind:"power"|"restart"|"user"|"wifi"|"battery"}){
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind==="power"&&<path d="M12 2v10M6 5a9 9 0 1 0 12 0"/>}
    {kind==="restart"&&<path d="M20 5v6h-6M4 19v-6h6M4.5 9A8 8 0 0 1 18 5l2 3M4 16l2 3a8 8 0 0 0 13.5-4"/>}
    {kind==="user"&&<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="9" r="3"/><path d="M5 19a7 7 0 0 1 14 0"/></>}
    {kind==="wifi"&&<path d="M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0M9 16a4 4 0 0 1 6 0M12 20h.01"/>}
    {kind==="battery"&&<><rect x="2" y="6" width="18" height="12" rx="2"/><path d="M22 10v4"/><rect x="5" y="9" width="12" height="6" fill="currentColor" stroke="none"/></>}
  </svg>;
}
/** Pinned logon-chromeos.js 5af3: avatar-only Guest and footer actions.
 * Status glyphs are source-shaped display-only indicators, not host readings. */
export function SourceChromeOSLogon({theme,shellStatus,onGuest,onShutdown,onRestart}:{
  theme:ThemeId;shellStatus:"partial"|"pending";
  onGuest:()=>void;onShutdown:()=>void;onRestart:()=>void;
}){
  const [showAccount,setShowAccount]=useState(false);
  const art=sourceThemeLogonArtwork.chromeos;
  return <main className="windows-logon source-chromeos-logon is-chromeos"
    data-test-logon-screen="" data-source-theme-id={theme}
    data-source-logon-theme="chromeos" data-source-logon-renderer="chromeos"
    data-source-shell-status={shellStatus}>
    <div className="source-chromeos-logon__overlay-top" aria-hidden="true"
      style={{backgroundImage:`url("${art.background}")`}}/>
    <div className="source-chromeos-logon__overlay-bottom" aria-hidden="true"/>
    <section className="source-chromeos-logon__account" aria-label="Guest account">
      <button type="button" className="source-chromeos-logon__avatar avatar-button can-click"
        data-test-avatar="win7" data-test-source-logon-avatar="chromeos"
        aria-label="Log in as Guest" onClick={onGuest}>
        <img src={art.guest} width={100} height={100} alt="Guest avatar"/>
      </button>
      <h1>Guest</h1>
    </section>
    <footer className="source-chromeos-logon__footer">
      <div className="source-chromeos-logon__actions" aria-label="Session controls">
        <button type="button" data-test-logon-shutdown="" onClick={onShutdown}><Glyph kind="power"/>Shutdown</button>
        <button type="button" data-test-logon-restart="" onClick={onRestart}><Glyph kind="restart"/>Restart</button>
        <button type="button" data-test-logon-switch="" onClick={()=>setShowAccount(true)}><Glyph kind="user"/>Switch User</button>
      </div>
      <div className="source-chromeos-logon__status" aria-label="Simulator status and clock">
        <span>EN-US</span><Glyph kind="wifi"/><Glyph kind="battery"/><StatusClock/>
      </div>
    </footer>
    {showAccount&&<div className="source-chromeos-logon__unavailable" role="dialog" aria-label="Account login">
      <p>Account sign-in requires the original authentication backend.</p>
      <button type="button" onClick={()=>setShowAccount(false)}>Back</button>
    </div>}
  </main>;
}

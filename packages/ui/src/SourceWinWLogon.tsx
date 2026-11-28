import {useState} from "react";
import {legacyArt,sourceThemeLogonArtwork} from "@windows-os/assets";
import type {ThemeId} from "@windows-os/contracts";
import "./sourceWinWLogon.css";

export interface SourceWinWLogonProps{
  theme:ThemeId;
  shellStatus:"partial"|"pending";
  onGuest:()=>void;
  onShutdown:()=>void;
  onRestart:()=>void;
}

/** Frozen src/modules/themes/logon-winw.js (module 994d) and
 * src/styles/themes/logon-winw.css. Independent Whistler source logon
 * family: original logo, blue vertical Windows rail, Welcome header,
 * Guest avatar and source Restart/Shutdown footer. The real account
 * provider / spinner state have not migrated, never fabricate sign-in.
 */
export function SourceWinWLogon({
  theme,shellStatus,onGuest,onShutdown,onRestart
}:SourceWinWLogonProps){
  const [showAccount,setShowAccount]=useState(false);
  return <main className="windows-logon source-winw-logon is-winw"
    data-test-logon-screen=""
    data-source-theme-id={theme}
    data-source-logon-theme="winW"
    data-source-logon-renderer="winW"
    data-source-shell-status={shellStatus}>
    <aside className="source-winw-logon__rail" aria-hidden="true">Windows</aside>
    <section className="source-winw-logon__main" aria-label="Guest account">
      <header className="source-winw-logon__header">
        <img src={sourceThemeLogonArtwork.winW.logo}
          alt="" width={144} data-test-source-logon-logo="winW"/>
        <h1>Welcome</h1>
        <p>To log on as a guest, click the Guest icon</p>
      </header>
      <div className="source-winw-logon__account">
        <button type="button" className="source-winw-logon__avatar avatar-button can-click"
          aria-label="Log in as Guest"
          data-test-avatar="win7" data-test-source-logon-avatar="winW"
          onClick={onGuest}>
          <img src={legacyArt.guestAvatar} alt="" width={64} height={64}/>
        </button>
        <strong>Guest</strong>
        <button type="button" className="source-winw-logon__switch"
          onClick={()=>setShowAccount(true)}>Switch User</button>
      </div>
    </section>
    <footer className="source-winw-logon__footer">
      <div className="source-winw-logon__power">
        <button type="button" data-test-logon-restart="" onClick={onRestart}>Restart</button>
        <button type="button" data-test-logon-shutdown="" onClick={onShutdown}>Shutdown</button>
      </div>
      <p>To manage or change user accounts, go to Control Panel</p>
    </footer>
    {showAccount&&<div className="source-winw-logon__unavailable"
      role="dialog" aria-label="Account login">
      <p>Account sign-in requires the original authentication backend.</p>
      <button type="button" onClick={()=>setShowAccount(false)}>Back</button>
    </div>}
  </main>;
}

import {useRef,useState} from "react";
import {legacyArt} from "@windows-os/assets";
import type {ThemeId} from "@windows-os/contracts";
import "./sourceOnebitLogon.css";
import {sourceOnebitPixelateAvatar} from "./sourceOnebitAvatarPixelate";

export interface SourceOnebitLogonProps{
  theme:ThemeId;
  shellStatus:"partial"|"pending";
  onGuest:()=>void;
  onShutdown:()=>void;
  onRestart:()=>void;
}

/** Frozen legacy-win7@26b9f0ce7, src/modules/themes/logon-onebit.js
 * and src/styles/themes/logon-onebit.css. This is the onebit BaseLogon
 * Guest/power view, not a simulated password or captcha service. The
 * original avatarComponent pixelation is ported; captcha/authentication
 * backend and full desktop shell remain explicitly pending.
 */
export function SourceOnebitLogon({
  theme,shellStatus,onGuest,onShutdown,onRestart
}:SourceOnebitLogonProps){
  const [showAccount,setShowAccount]=useState(false);
  const avatarCanvas=useRef<HTMLCanvasElement>(null);
  const [pixelated,setPixelated]=useState(false);
  return <main className="windows-logon source-onebit-logon is-onebit"
    data-test-logon-screen
    data-source-theme-id={theme}
    data-source-logon-theme="onebit"
    data-source-logon-renderer="onebit"
    data-source-shell-status={shellStatus}>
    <section className="source-onebit-logon__pane" aria-label="Guest account">
      <p className="source-onebit-logon__instruction">Click here to login as Guest</p>
      <button type="button" className="source-onebit-logon__avatar avatar-button can-click"
        aria-label="Log in as Guest"
        data-test-avatar="win7" data-test-source-logon-avatar="onebit"
        onClick={onGuest}>
        <img src={legacyArt.guestAvatar} alt="" width={64} height={64}
          style={pixelated?{visibility:"hidden"}:undefined}
          onLoad={event=>{
            const target=avatarCanvas.current;
            if(target&&sourceOnebitPixelateAvatar(event.currentTarget,target,64))
              setPixelated(true);
          }}/>
        <canvas ref={avatarCanvas} width={64} height={64}
          className="source-onebit-logon__pixel-avatar"
          data-test-source-onebit-avatar-canvas="" aria-hidden="true"
          style={{display:pixelated?"block":"none"}}/>
      </button>
      <strong className="source-onebit-logon__name">Guest</strong>
      <button type="button" className="source-onebit-logon__account-button"
        onClick={()=>setShowAccount(true)}>Switch User</button>
    </section>
    <footer className="source-onebit-logon__power" aria-label="Power controls">
      <button type="button" data-test-logon-shutdown=""
        aria-label="Shut down" onClick={onShutdown}>
        <span aria-hidden="true">☼</span><span>Shut down</span>
      </button>
      <button type="button" data-test-logon-restart=""
        aria-label="Restart" onClick={onRestart}>
        <span aria-hidden="true">↻</span><span>Restart</span>
      </button>
    </footer>
    {showAccount&&<section className="source-onebit-logon__unavailable"
      role="dialog" aria-label="Account login">
      <p>Account sign-in requires the original authentication backend.</p>
      <button type="button" onClick={()=>setShowAccount(false)}>Back</button>
    </section>}
  </main>;
}

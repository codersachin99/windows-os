import {useRef,useState,type KeyboardEvent} from "react";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import type {ThemeId} from "@windows-os/contracts";
import "./sourceUbuntuLogon.css";

/** Frozen logon-ubuntu.js 94a5 + taskbar-ubuntu.js c56e logon-only menu.
 * Guest session and simulator power lifecycle only; account backend pending. */
export function SourceUbuntuLogon({theme,shellStatus,onGuest,onShutdown,onRestart}:{
  theme:ThemeId;shellStatus:"partial"|"pending";
  onGuest:()=>void;onShutdown:()=>void;onRestart:()=>void;
}){
  const [showAccount,setShowAccount]=useState(false);
  const [powerOpen,setPowerOpen]=useState(false);
  const trigger=useRef<HTMLButtonElement>(null);
  const restart=useRef<HTMLButtonElement>(null);
  const shutdown=useRef<HTMLButtonElement>(null);
  const art=sourceThemeLogonArtwork.ubuntu;
  const closePower=(restore=false)=>{
    setPowerOpen(false);
    if(restore)trigger.current?.focus();
  };
  function onMenuKey(event:KeyboardEvent<HTMLElement>){
    if(event.key==="Escape"&&powerOpen){
      event.preventDefault();event.stopPropagation();closePower(true);
    }else if(powerOpen&&(event.key==="ArrowDown"||event.key==="ArrowUp")){
      event.preventDefault();
      if(document.activeElement===restart.current)shutdown.current?.focus();
      else restart.current?.focus();
    }
  }
  return <main className="windows-logon source-ubuntu-logon is-ubuntu"
    data-test-logon-screen="" data-source-theme-id={theme}
    data-source-logon-theme="ubuntu" data-source-logon-renderer="ubuntu"
    data-source-shell-status={shellStatus}
    onClick={()=>closePower()}>
    <header id="menubar" className="source-ubuntu-logon__menubar taskbar__wrapper is-logon"
      data-test-taskbar="ubuntu" onClick={event=>event.stopPropagation()}
      onKeyDown={onMenuKey}>
      <div className="source-ubuntu-logon__tray" data-test-taskbar-tray="ubuntu">
        <button type="button" ref={trigger} aria-label="System menu"
          aria-haspopup="menu" aria-expanded={powerOpen} data-test-menu-button=""
          onClick={()=>setPowerOpen(open=>!open)}>
          <svg width="14" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 1v7M4 3a6 6 0 1 0 8 0" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        {powerOpen&&<div className="source-ubuntu-logon__power" role="menu" data-test-menu-popup="">
          <button type="button" role="menuitem" ref={restart} data-test-logon-restart=""
            onClick={()=>{closePower();onRestart();}}>Restart</button>
          <button type="button" role="menuitem" ref={shutdown} data-test-logon-shutdown=""
            onClick={()=>{closePower();onShutdown();}}>Shutdown</button>
        </div>}
      </div>
    </header>
    <section className="source-ubuntu-logon__account" aria-label="Guest account">
      <button type="button" className="source-ubuntu-logon__avatar avatar-button can-click"
        data-test-avatar="win7" data-test-source-logon-avatar="ubuntu"
        aria-label="Log in as Guest" onClick={onGuest}>
        <img src={art.guest} width={88} height={88} alt="Guest avatar"/>
      </button>
      <h1>Guest</h1>
      <button type="button" className="source-ubuntu-logon__form-button"
        data-test-logon-switch="" onClick={()=>setShowAccount(true)}>Switch User</button>
    </section>
    <footer className="source-ubuntu-logon__brand">
      <img src={art.logo} alt="Ubuntu" width={192}/>
    </footer>
    {showAccount&&<div className="source-ubuntu-logon__unavailable"
      role="dialog" aria-label="Account login">
      <p>Account sign-in requires the original authentication backend.</p>
      <button type="button" className="source-ubuntu-logon__form-button"
        onClick={()=>setShowAccount(false)}>Back</button>
    </div>}
  </main>;
}

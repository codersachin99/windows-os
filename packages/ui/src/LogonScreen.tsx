import { useState } from "react";
import {sourceThemeScreens,sourceThemeShellStatus,type ThemeId} from "@windows-os/contracts";
import { legacyArt,sourceThemeLogonArtwork,sourceWin11DarkArtwork } from "@windows-os/assets";
import "./sourceThemeLogon.css";
import {SourceClassicLogon} from "./SourceClassicLogon";
import {SourceWin8Logon} from "./SourceWin8Logon";
import {SourceOnebitLogon} from "./SourceOnebitLogon";
import {SourceWinLLogon} from "./SourceWinLLogon";

interface LogonScreenProps {
  theme?:ThemeId;
  onGuest: () => void;
  onShutdown: () => void;
  onRestart: () => void;
}

export function LogonScreen({ theme="win7",onGuest, onShutdown, onRestart }: LogonScreenProps) {
  const sourceScreens=sourceThemeScreens(theme);
  const status=sourceThemeShellStatus(theme);
  const [showAccount, setShowAccount] = useState(false);
  const [showPower, setShowPower] = useState(false);
  // The source Win31 and Win9x screens share the classic logon-window.
  // The shell skin remains pending; this is a source-shaped Guest adapter.
  if(sourceScreens.logon==="win31"||sourceScreens.logon==="win95"||
    sourceScreens.logon==="win98"||sourceScreens.logon==="win2k")return <SourceClassicLogon
      theme={theme} family={sourceScreens.logon} shellStatus={status}
      onGuest={onGuest} onShutdown={onShutdown} onRestart={onRestart}/>;

  // Both win8 and win81 select the pinned Windows 8 screen family.
  if(sourceScreens.logon==="win8")return <SourceWin8Logon
    theme={theme} shellStatus={status} onGuest={onGuest} onShutdown={onShutdown}
    onRestart={onRestart}/>;

  // Onebit is a distinct source BaseLogon theme. Preserve Guest and
  // power actions with its original dark/sand palette, without inventing
  // the source account/captcha backend or claiming shell parity.
  if(sourceScreens.logon==="onebit")return <SourceOnebitLogon
    theme={theme} shellStatus={status} onGuest={onGuest}
    onShutdown={onShutdown} onRestart={onRestart}/>;

  // Both source theme IDs winLS and winLP map to one shared WinL logon.
  // Preserve the original Guest and power actions; the shell is pending.
  if(sourceScreens.logon==="winLS")return <SourceWinLLogon
    theme={theme} shellStatus={status} onGuest={onGuest}
    onShutdown={onShutdown} onRestart={onRestart}/>;

  // The original WinXP source uses a three-region blue login screen,
  // 150×89 XP logo and a Guest row. Only the guest/account backend behavior
  // is adapted here; unavailable account auth is never faked.
  if(sourceScreens.logon==="winxp")return (
    <main className="windows-logon source-xp-logon" data-test-logon-screen
      data-source-theme-id={theme} data-source-logon-theme="winxp"
      data-source-shell-status={status} data-source-logon-renderer="winxp">
      <div className="source-xp-logon__top" aria-hidden="true"/>
      <div className="source-xp-logon__body">
        <section className="source-xp-logon__intro" aria-label="Windows XP">
          <img src={sourceThemeLogonArtwork.winxp.logo} width={150} height={89}
            alt="Windows XP" data-test-source-logon-logo="winxp"/>
          <span>To begin, click your user name</span>
        </section>
        <div className="source-xp-logon__divider" aria-hidden="true"/>
        <section className="source-xp-logon__accounts" aria-label="User accounts">
          <button className="source-xp-logon__guest avatar-button can-click"
            onClick={onGuest} data-test-avatar="win7"
            data-test-source-logon-avatar="winxp" aria-label="Log in as Guest">
            <img src={sourceThemeLogonArtwork.winxp.guest} alt="" width={48} height={48}/>
            <span>Guest</span>
          </button>
        </section>
      </div>
      <footer className="source-xp-logon__bottom">
        <div className="source-theme-logon__power">
          <button data-test-logon-shutdown="" onClick={onShutdown}
            aria-label="Shut down">⏻ <span>Turn off computer</span></button>
          <button aria-label="Power options" onClick={()=>setShowPower(!showPower)}
            aria-expanded={showPower}>▴</button>
          {showPower&&<div className="source-theme-logon__power-menu" role="menu">
            <button role="menuitem" data-test-logon-restart="" onClick={onRestart}>Restart</button>
            <button role="menuitem" onClick={onShutdown}>Shut down</button>
          </div>}
        </div>
        <button className="source-xp-logon__create" onClick={()=>setShowAccount(true)}>
          Create a new account
        </button>
      </footer>
      {showAccount&&<div className="source-theme-logon__unavailable"
        role="dialog" aria-label="Account login">
        <p>Account sign-in requires the original authentication backend.</p>
        <button onClick={()=>setShowAccount(false)}>Back</button>
      </div>}
    </main>
  );

  // Pinned logon-win10.js and logon-win11.js share source logon-base,
  // the 150px guest-win10 avatar and black overlay. Their *backgrounds*
  // and button treatments remain distinct. The Win10 shell is not ported.
  if(sourceScreens.logon==="win10"||sourceScreens.logon==="win11"){
    const modernFamily=sourceScreens.logon;
    return (
    <main className={"windows-logon source-win11-logon"+(modernFamily==="win10"?" source-win10-logon":"")} data-test-logon-screen
      data-source-theme-id={theme} data-source-logon-theme={modernFamily}
      data-source-shell-status={status} data-source-logon-renderer={modernFamily}
      style={{backgroundImage:`url("${theme==="win11dark"?sourceWin11DarkArtwork.wallpaper:sourceThemeLogonArtwork[modernFamily].background}")`}}>
      <div className="source-win11-logon__overlay" aria-hidden="true"/>
      <section className="source-win11-logon__account" aria-label="Guest account">
        <button className="source-win11-logon__avatar avatar-button can-click"
          onClick={onGuest} data-test-avatar="win7"
          data-test-source-logon-avatar={modernFamily} aria-label="Log in as Guest">
          <img src={sourceThemeLogonArtwork[modernFamily].guest}
            width={150} height={150} alt="Guest avatar"/>
        </button>
        <h1>Guest</h1>
        <button className="source-win11-logon__signin" onClick={onGuest}>
          Sign in
        </button>
        <button className="source-win11-logon__other" onClick={()=>setShowAccount(true)}>
          Other user
        </button>
      </section>
      <div className="source-win11-logon__power">
        <button data-test-logon-shutdown="" aria-label="Shut down"
          onClick={onShutdown}>⏻</button>
        <button aria-label="Power options" aria-expanded={showPower}
          onClick={()=>setShowPower(!showPower)}>▴</button>
        {showPower&&<div className="source-theme-logon__power-menu" role="menu">
          <button role="menuitem" data-test-logon-restart="" onClick={onRestart}>Restart</button>
          <button role="menuitem" onClick={onShutdown}>Shut down</button>
        </div>}
      </div>
      {showAccount&&<div className="source-theme-logon__unavailable"
        role="dialog" aria-label="Account login">
        <p>Account sign-in requires the original authentication backend.</p>
        <button onClick={()=>setShowAccount(false)}>Back</button>
      </div>}
    </main>
    );
  }

  return (
    <main className="windows-logon is-win7" data-test-logon-screen
      data-source-theme-id={theme} data-source-logon-theme={sourceScreens.logon}
      data-source-shell-status={status}
      data-source-logon-renderer={sourceScreens.logon==="win7"?"win7":"win7-fallback"}
      style={{ backgroundImage: `url("${legacyArt.logonBackground}")` }}>
      <div className="windows-logon__centre logon__pane">
        <div className="windows-logon__guest-area">
          <span className="windows-logon__hint windows-logon__hint--guest logon__instruction is-guest">
            Click here to login as<br />Guest
            <svg className="windows-logon__hint-arrow" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M8 4 Q14 49 49 49 M37 40 L49 49 L36 54" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          <button className="windows-logon__avatar is-win7 avatar-button has-frame can-click" onClick={onGuest}
            data-test-avatar="win7" aria-label="Log in as Guest"
            style={{ backgroundImage: `url("${legacyArt.accountFrame}")` }}>
            <span className="avatar-mask"><img className="avatar-image" src={legacyArt.guestAvatar} alt="Guest avatar" /></span>
          </button>
          <strong className="windows-logon__guest-name logon__name">Guest</strong>
          <button className="windows-logon__switch logon__form-button" onClick={() => setShowAccount(!showAccount)}>
            Switch User
          </button>
          <span className="windows-logon__hint windows-logon__hint--account logon__instruction is-account">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <path d="M52 62 Q47 21 12 21 M22 13 L12 21 L23 31" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Click here to login with an<br />account
          </span>
          {showAccount && (
            <div className="windows-logon__account" role="dialog" aria-label="Account login">
              <p>Account sign-in requires the original authentication backend.</p>
              <button onClick={() => setShowAccount(false)}>Back</button>
            </div>
          )}
        </div>
      </div>
      <footer className="windows-logon__footer logon__brand">
        <img className="logon__brand-icon" src={legacyArt.win7Brand} alt="" width={26} height={26} />
        <span>Windows<sup>®</sup> 7</span>
        <span className="windows-logon__simulator">Simulator</span>
      </footer>
      <div className="windows-logon__power shutdown-group">
        <button className="windows-logon__shutdown shutdown-button" title="Shut down"
          data-test-logon-shutdown="" aria-label="Shut down" onClick={onShutdown}>⏻</button>
        <button className="windows-logon__power-arrow shutdown-dropdown" aria-label="Power options"
          onClick={() => setShowPower(!showPower)}>▴</button>
        {showPower && (
          <div className="windows-logon__power-menu winui-menu">
            <button data-test-logon-restart="" onClick={onRestart}>Restart</button>
            <button onClick={onShutdown}>Shut down</button>
          </div>
        )}
      </div>
    </main>
  );
}

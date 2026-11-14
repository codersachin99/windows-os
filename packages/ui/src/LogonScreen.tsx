import { useState } from "react";
import { legacyArt } from "@windows-os/assets";

interface LogonScreenProps {
  onGuest: () => void;
  onShutdown: () => void;
  onRestart: () => void;
}

export function LogonScreen({ onGuest, onShutdown, onRestart }: LogonScreenProps) {
  const [showAccount, setShowAccount] = useState(false);
  const [showPower, setShowPower] = useState(false);

  return (
    <main className="windows-logon is-win7" data-test-logon-screen style={{ backgroundImage: `url("${legacyArt.logonBackground}")` }}>
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

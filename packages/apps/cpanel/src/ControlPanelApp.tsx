import {useState} from "react";
import {legacyArt,legacySourceIconArtwork} from "@windows-os/assets";
import {sourcePrograms} from "@windows-os/filesystem";
import {
  SOURCE_CPANEL_INITIAL_HISTORY,SOURCE_CPANEL_ZOOM_CHOICES,
  sourceCpanelDisplayMatch,sourceCpanelOpenLocation,sourceCpanelResolutions,
  sourceCpanelStep,sourceCpanelInstalledPrograms,sourceCpanelProgramsMatch,
  sourceCpanelAccountsMatch,SOURCE_CPANEL_GUEST_ACCOUNT_LINKS,
  type SourceControlPanelHistory, type SourceControlPanelLocation
} from "./model";
import {
  SOURCE_TRAY_ITEMS,sourceTrayRestoreDefaults,sourceTraySetBehavior,
  type SourceTrayIconId,type SourceTrayBehavior,type SourceTrayPreferences
} from "./notification";
import "./ControlPanelApp.css";

export interface ControlPanelAppProps{
  onClose():void;
  onSwitchUser():void;
  trayPreferences:SourceTrayPreferences;
  onTrayPreferencesChange(value:SourceTrayPreferences):void;
}
/** Source cpanel.js a259: address breadcrumbs, back/forward history,
 * instant search, tiles root and navigated panel body. The first real panel
 * is the original Display view; remaining panels are tracked, not invented. */
export function ControlPanelApp({
  onClose,onSwitchUser,trayPreferences,onTrayPreferencesChange
}:ControlPanelAppProps){
  const [history,setHistory]=useState<SourceControlPanelHistory>(
    SOURCE_CPANEL_INITIAL_HISTORY);
  const [query,setQuery]=useState("");
  const [selectedProgram,setSelectedProgram]=useState<string|null>(null);
  const [showSystemIcons,setShowSystemIcons]=useState(false);
  const location=history.entries[history.index];
  const results=query.trim().length>0;
  const matchingDisplay=sourceCpanelDisplayMatch(query);
  const matchingPrograms=sourceCpanelProgramsMatch(query);
  const matchingAccounts=sourceCpanelAccountsMatch(query);
  const matchingNotification=query.trim().toLocaleLowerCase()
    .split(/\s+/).filter(Boolean).every(term=>
      ["notification","notifications","icons","taskbar","system"].some(x=>x.includes(term)));
  const programs=sourceCpanelInstalledPrograms(sourcePrograms);
  const open=(value:SourceControlPanelLocation)=>{
    setHistory(previous=>sourceCpanelOpenLocation(previous,value));
    setQuery("");
    setShowSystemIcons(false);
  };
  const changeSearch=(value:string)=>{
    setQuery(value);
    if(value.trim())setHistory(previous=>sourceCpanelOpenLocation(previous,null));
  };
  return <section className="windows-cpanel is-cpanel" data-test-cpanel="">
    <header className="windows-cpanel__addressbar">
      <div className="windows-cpanel__navigation">
        <button type="button" aria-label="Back" disabled={history.index===0}
          data-test-cpanel-back="" onClick={()=>setHistory(previous=>sourceCpanelStep(previous,-1))}>‹</button>
        <button type="button" aria-label="Forward"
          disabled={history.index>=history.entries.length-1}
          data-test-cpanel-forward="" onClick={()=>setHistory(previous=>sourceCpanelStep(previous,1))}>›</button>
      </div>
      <nav className="windows-cpanel__breadcrumb" aria-label="Control Panel location">
        <button type="button" onClick={()=>open(null)}>Control Panel</button>
        {location!==null&&<span data-test-cpanel-location="">
          <span aria-hidden="true"> › </span>
          {location==="display"?"Display":location==="programs"?
            "Programs and Features":location==="accounts"?
            "User Accounts":"Notification Area Icons"}
        </span>}
      </nav>
      <input type="search" value={query} onChange={event=>changeSearch(event.target.value)}
        aria-label="Search Control Panel" placeholder="Search Control Panel"
        data-test-cpanel-search=""/>
    </header>
    <div className="windows-cpanel__content">
      {results?<div className="windows-cpanel__results"
        data-test-cpanel-results="">
        {matchingDisplay?<article className="windows-cpanel__result"
          data-test-cpanel-result="display">
          <img src={legacyArt.display} alt="" width={40} height={40}/>
          <div><button type="button" className="windows-cpanel__link"
            onClick={()=>open("display")}>Display</button>
            <button type="button" className="windows-cpanel__task"
              data-test-cpanel-task="" onClick={()=>open("display")}>
              Change display settings
            </button></div>
        </article>:null}
        {matchingPrograms?<article className="windows-cpanel__result"
          data-test-cpanel-result="programs">
          <img src={legacyArt.programs} alt="" width={40} height={40}/>
          <div><button type="button" className="windows-cpanel__link"
            onClick={()=>open("programs")}>Programs and Features</button>
            <button type="button" className="windows-cpanel__task"
              onClick={()=>open("programs")}>Uninstall or change a program</button></div>
        </article>:null}
        {matchingAccounts?<article className="windows-cpanel__result"
          data-test-cpanel-result="accounts">
          <img src={legacyArt.accounts} alt="" width={40} height={40}/>
          <div><button type="button" className="windows-cpanel__link"
            onClick={()=>open("accounts")}>User Accounts</button>
            <button type="button" className="windows-cpanel__task"
              onClick={()=>open("accounts")}>Change your account</button></div>
        </article>:null}
        {matchingNotification?<article className="windows-cpanel__result"
          data-test-cpanel-result="notification">
          <img src={legacyArt.trayActionCenter} alt="" width={40} height={40}/>
          <div><button type="button" className="windows-cpanel__link"
            onClick={()=>open("notification")}>Notification Area Icons</button>
            <button type="button" className="windows-cpanel__task"
              onClick={()=>open("notification")}>Customize notification icons</button></div>
        </article>:null}
        {!matchingDisplay&&!matchingPrograms&&!matchingAccounts&&!matchingNotification&&
          <p>No items match your search.</p>}
      </div>:location==="notification"?<div className="windows-cpanel__notification"
        data-test-cpanel-notification="">
        <div className="windows-cpanel__notification-body">
          <h2>{showSystemIcons?"Turn system icons on or off":"Select which icons and notifications appear on the taskbar"}</h2>
          <p>{showSystemIcons?
            "Turn individual system icons on or off.":
            "You can choose which icons and notifications appear in the notification area."}
          </p>
          <div className="windows-cpanel__notification-list">
            <div className="windows-cpanel__notification-head">
              <strong>{showSystemIcons?"System Icons":"Icons"}</strong>
              <strong>Behaviors</strong>
            </div>
            {showSystemIcons?<div className="windows-cpanel__notification-row"
              data-test-cpanel-system-icon="clock">
              <span><img src={legacyArt.trayClock} width={16} height={16} alt=""/>Clock</span>
              <select aria-label="Clock system icon"
                value={trayPreferences.showClockIcon?"shown":"off"}
                onChange={event=>onTrayPreferencesChange({...trayPreferences,
                  showClockIcon:event.target.value!=="off"})}>
                <option value="shown">On</option><option value="off">Off</option>
              </select>
            </div>:null}
            {SOURCE_TRAY_ITEMS.filter(item=>showSystemIcons||
              trayPreferences.icons[item.id]!=="off").map(item=>
              <div key={item.id} className="windows-cpanel__notification-row"
                data-test-cpanel-notification-icon={item.id}>
                <span><img src={legacyArt[item.asset]} width={16} height={16}
                  alt=""/>{item.label}</span>
                <select aria-label={item.label+" behavior"}
                  disabled={!showSystemIcons&&trayPreferences.alwaysShowIcons}
                  value={showSystemIcons?
                    (trayPreferences.icons[item.id]==="off"?"off":"shown"):
                    trayPreferences.icons[item.id]}
                  onChange={event=>{
                    const value=event.target.value;
                    // Source system-icon dropdown uses On/Off; the main
                    // list uses shown, hidden and notifications-only.
                    const next:SourceTrayBehavior=showSystemIcons?
                      (value==="off"?"off":"shown"):
                      value as SourceTrayBehavior;
                    onTrayPreferencesChange(sourceTraySetBehavior(
                      trayPreferences,item.id as SourceTrayIconId,next));
                  }}>
                  {showSystemIcons?<><option value="shown">On</option>
                    <option value="off">Off</option></>:<>
                    <option value="shown">Show icon and notifications</option>
                    <option value="hidden">Hide icon and notifications</option>
                    <option value="notifications-only">Only show notifications</option>
                  </>}
                </select>
              </div>
            )}
          </div>
          <button type="button" className="windows-cpanel__notification-link"
            onClick={()=>setShowSystemIcons(value=>!value)}
            data-test-cpanel-system-icons-link="">
            {showSystemIcons?"Customize notification icons":
              "Turn system icons on or off"}
          </button>
          <button type="button" className="windows-cpanel__notification-link"
            disabled={!showSystemIcons&&trayPreferences.alwaysShowIcons}
            data-test-cpanel-restore-tray=""
            onClick={()=>onTrayPreferencesChange(
              sourceTrayRestoreDefaults(trayPreferences))}>
            Restore default icon behaviors
          </button>
          {!showSystemIcons&&<label className="windows-cpanel__notification-check">
            <input type="checkbox" data-test-cpanel-always-show=""
              checked={trayPreferences.alwaysShowIcons}
              onChange={event=>onTrayPreferencesChange({...trayPreferences,
                alwaysShowIcons:event.target.checked})}/>
            Always show all icons and notifications on the taskbar
          </label>}
        </div>
        <footer className="windows-cpanel__notification-footer">
          <button type="button" onClick={()=>{
            if(showSystemIcons)setShowSystemIcons(false);else onClose();
          }}>OK</button>
          <button type="button" onClick={()=>{
            if(showSystemIcons)setShowSystemIcons(false);else onClose();
          }}>Cancel</button>
        </footer>
      </div>:location==="accounts"?<div className="windows-cpanel__accounts"
        data-test-cpanel-accounts="">
        <h2>Make changes to your user account</h2>
        <div className="windows-cpanel__account-layout">
          <nav aria-label="Account actions" className="windows-cpanel__account-links">
            {SOURCE_CPANEL_GUEST_ACCOUNT_LINKS.map(link=>
              <button type="button" key={link.id}
                data-test-account-action={link.id}
                disabled={link.disabled}
                onClick={link.id==="logoff"?onSwitchUser:undefined}
                title={link.disabled?"Requires the original account backend":undefined}>
                {link.label}
              </button>
            )}
          </nav>
          <div className="windows-cpanel__account-card" data-test-cpanel-guest-account="">
            <img src={legacyArt.guestAvatar} alt="" width={87} height={87}/>
            <div><strong>Guest</strong><span>Guest account</span></div>
          </div>
        </div>
      </div>:location==="programs"?<div className="windows-cpanel__programs"
        data-test-cpanel-programs="">
        <div className="windows-cpanel__programs-heading">
          <h2>Uninstall or change a program</h2>
          <p>Select a program to uninstall or change it.</p>
        </div>
        <div className="windows-cpanel__programs-menu">
          <button type="button" disabled>Organize</button>
        </div>
        <div className="windows-cpanel__programs-table">
          <table aria-label="Installed simulated programs">
            <thead><tr><th>Name</th><th>Date installed</th>
              <th>Version</th><th>Type</th></tr></thead>
            <tbody>{programs.map(program=><tr key={program.id}
              data-test-cpanel-program={program.id}
              aria-selected={selectedProgram===program.id}
              className={selectedProgram===program.id?"is-selected":""}>
              <td><button type="button" className="windows-cpanel__program-select"
                onClick={()=>setSelectedProgram(program.id)}>
                <img src={legacySourceIconArtwork(program.iconKey).src}
                  width={16} height={16} alt=""/>{program.name}
              </button></td>
              <td>—</td><td>{program.version}</td><td>{program.type}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>:location==="display"?<div className="windows-cpanel__display"
        data-test-cpanel-display="">
        <h2>Change display settings</h2>
        <div className="windows-cpanel__display-preview">
          <img src={legacyArt.resolutionPreview} alt="Display settings preview"/>
        </div>
        <fieldset disabled data-test-cpanel-device-settings="">
          <label>Display:
            <select aria-label="Display" defaultValue="internal">
              <option value="internal">1. Internal Display</option>
            </select>
          </label>
          <label>Resolution:
            <select aria-label="Resolution" defaultValue="fullscreen">
              {sourceCpanelResolutions(window.innerWidth,window.innerHeight).map(option=>
                <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>Orientation:
            <select aria-label="Orientation" defaultValue="landscape">
              <option value="landscape">Landscape</option>
              <option value="portrait" disabled>Portrait</option>
              <option value="landscape-flipped" disabled>Landscape (flipped)</option>
              <option value="portrait-flipped" disabled>Portrait (flipped)</option>
            </select>
          </label>
          <label>Zoom:
            <select aria-label="Zoom" defaultValue="0.7">
              {SOURCE_CPANEL_ZOOM_CHOICES.map(option=>
                <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </fieldset>
        <footer className="windows-cpanel__footer">
          <button type="button" disabled title="Browser device settings cannot be changed">
            OK
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </footer>
      </div>:<div className="windows-cpanel__home"
        data-test-cpanel-items="">
        <h2>Adjust your computer's settings</h2>
        <button type="button" data-test-cpanel-item="display"
          className="windows-cpanel__tile" onClick={()=>open("display")}>
          <img src={legacyArt.display} alt="" width={44} height={44}/>
          <span>Display</span>
        </button>
        <button type="button" data-test-cpanel-item="programs"
          className="windows-cpanel__tile" onClick={()=>open("programs")}>
          <img src={legacyArt.programs} alt="" width={44} height={44}/>
          <span>Programs and Features</span>
        </button>
        <button type="button" data-test-cpanel-item="accounts"
          className="windows-cpanel__tile" onClick={()=>open("accounts")}>
          <img src={legacyArt.accounts} alt="" width={44} height={44}/>
          <span>User Accounts</span>
        </button>
        <button type="button" data-test-cpanel-item="notification"
          className="windows-cpanel__tile" onClick={()=>open("notification")}>
          <img src={legacyArt.trayActionCenter} alt="" width={44} height={44}/>
          <span>Notification Area Icons</span>
        </button>
      </div>}
    </div>
  </section>;
}

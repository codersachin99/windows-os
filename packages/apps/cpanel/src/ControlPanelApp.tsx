import {useEffect,useState} from "react";
import {legacyArt,legacySourceIconArtwork,legacyCpanelTileArtwork} from "@windows-os/assets";
import {sourcePrograms,sourceProgramsById,type VirtualFileStore} from "@windows-os/filesystem";
import {SOURCE_CPANEL_REGISTRY,sourceCpanelSearchRegistry,sourceCpanelIsSupported,
  type SourceCpanelRegistryItem} from "./sourceRegistry";
import {BackupRestorePanel} from "./BackupRestorePanel";
import {sourceParseSearch,sourceCreateDelayedSearch} from "@windows-os/engine";
import {SourceListView} from "@windows-os/ui/listview";
import {SourceWin7HistoryNav} from "@windows-os/ui/navigation";
import type {ThemeId} from "@windows-os/contracts";
import {
  SOURCE_CPANEL_INITIAL_HISTORY,SOURCE_CPANEL_ZOOM_CHOICES,
  sourceCpanelOpenLocation,sourceCpanelResolutions,
  sourceCpanelStep,sourceCpanelInstalledPrograms,
  SOURCE_CPANEL_GUEST_ACCOUNT_LINKS,SOURCE_CPANEL_ACTION_CENTER_TEXT,
  type SourceControlPanelActionMessage,
  type SourceControlPanelHistory, type SourceControlPanelLocation
} from "./model";
import {
  SOURCE_TRAY_ITEMS,sourceTrayRestoreDefaults,sourceTraySetBehavior,
  type SourceTrayIconId,type SourceTrayBehavior,type SourceTrayPreferences
} from "./notification";
import "./ControlPanelApp.css";

/** Win7 exact sprite is source-verified; never impose that artwork on
 * unverified WinXP, Win11 or other legacy theme skins. */
export function sourceCpanelUseWin7Nav(theme:ThemeId):boolean{
  return theme==="win7";
}

export interface ControlPanelAppProps{
  filesystem:VirtualFileStore;
  theme?:ThemeId;
  onClose():void;
  onSwitchUser():void;
  trayPreferences:SourceTrayPreferences;
  onTrayPreferencesChange(value:SourceTrayPreferences):void;
  /** Original Vuex Action Center history when available; no fabricated alerts. */
  messages?:readonly SourceControlPanelActionMessage[];
}
/** Source cpanel.js a259 and pinned 3097 registry: breadcrumb/history,
 * original 24-tile root, indexed task search and six genuinely migrated
 * destinations. Other setting/program targets stay visibly disabled. */
export function ControlPanelApp({
  onClose,onSwitchUser,trayPreferences,onTrayPreferencesChange,
  filesystem,theme="win7",messages=[]
}:ControlPanelAppProps){
  const [history,setHistory]=useState<SourceControlPanelHistory>(
    SOURCE_CPANEL_INITIAL_HISTORY);
  const [query,setQuery]=useState("");
  const [searchedQuery,setSearchedQuery]=useState("");
  const [delayedSearch]=useState(()=>sourceCreateDelayedSearch(setSearchedQuery));
  useEffect(()=>()=>delayedSearch.cancel(),[delayedSearch]);
  const [selectedProgram,setSelectedProgram]=useState<string|null>(null);
  const [showSystemIcons,setShowSystemIcons]=useState(false);
  const location=history.entries[history.index];
  // Source a259 displays the home tiles for filter-only queries: webpack
  // 5985 records filters separately and a682 requires at least one term.
  const results=location===null&&sourceParseSearch(searchedQuery).terms.length>0;
  // Pinned 3097: preserve all original registry entries; omit only program
  // items absent from the pinned c170 source manifest (not arbitrary shell apps).
  const sourceItems=SOURCE_CPANEL_REGISTRY.filter(item=>
    item.target!=="program"||sourceProgramsById.has(item.id));
  const searchResults=sourceCpanelSearchRegistry(searchedQuery,sourceItems);
  const sourceIcon=(item:SourceCpanelRegistryItem)=>
    legacyCpanelTileArtwork[item.iconKey]??legacySourceIconArtwork(item.iconKey).src;
  const openSourceItem=(item:SourceCpanelRegistryItem)=>{
    if(!sourceCpanelIsSupported(item.id))return;
    open(item.id as SourceControlPanelLocation);
  };
  const programs=sourceCpanelInstalledPrograms(sourcePrograms);
  const open=(value:SourceControlPanelLocation)=>{
    // Source a259 openLocation does not clear either searchText or
    // searchedText: returning to the root via Back re-shows prior results.
    // Only an explicit empty search input resets the indexed results.
    setHistory(previous=>sourceCpanelOpenLocation(previous,value));
    setShowSystemIcons(false);
  };
  const changeSearch=(value:string)=>{
    setQuery(value);
    if(value) setHistory(previous=>sourceCpanelOpenLocation(previous,null));
    // Original webpack 1902: type(nonempty) publishes in 300ms, but
    // clearing publishes immediately and cancels the previous timer.
    delayedSearch.type(value);
  };
  return <section className="windows-cpanel is-cpanel" data-test-cpanel="">
    <header className="windows-cpanel__addressbar">
      {sourceCpanelUseWin7Nav(theme)?
        <SourceWin7HistoryNav className="windows-cpanel__navigation"
          ariaLabel="Control Panel history"
          canGoBack={history.index>0}
          canGoForward={history.index<history.entries.length-1}
          backTestId="data-test-cpanel-back" forwardTestId="data-test-cpanel-forward"
          onBack={()=>setHistory(previous=>sourceCpanelStep(previous,-1))}
          onForward={()=>setHistory(previous=>sourceCpanelStep(previous,1))}/>:
        <nav className="windows-cpanel__navigation windows-cpanel__navigation--fallback"
          aria-label="Control Panel history">
          <button type="button" aria-label="Back" disabled={history.index===0}
            data-test-cpanel-back="" onClick={()=>setHistory(previous=>sourceCpanelStep(previous,-1))}>‹</button>
          <button type="button" aria-label="Forward"
            disabled={history.index>=history.entries.length-1}
            data-test-cpanel-forward="" onClick={()=>setHistory(previous=>sourceCpanelStep(previous,1))}>›</button>
        </nav>}
      <nav className="windows-cpanel__breadcrumb" aria-label="Control Panel location">
        <button type="button" onClick={()=>open(null)}>Control Panel</button>
        {location!==null&&<span data-test-cpanel-location="">
          <span aria-hidden="true"> › </span>
          {location==="display"?"Display":location==="programs"?
            "Programs and Features":location==="accounts"?
            "User Accounts":location==="notification"?
            "Notification Area Icons":location==="action-center"?"Action Center":
            "Backup and Restore"}
        </span>}
      </nav>
      <input type="search" value={query} onChange={event=>changeSearch(event.target.value)}
        aria-label="Search Control Panel" placeholder="Search Control Panel"
        data-test-cpanel-search=""/>
    </header>
    <div className="windows-cpanel__content">
      {results?<div className="windows-cpanel__results"
        data-test-cpanel-results="">
        {searchResults.map(({item,tasks})=><article key={item.id}
          className="windows-cpanel__result" data-test-cpanel-result={item.id}>
          <img src={sourceIcon(item)} alt="" width={40} height={40}/>
          <div>
            <button type="button" className="windows-cpanel__link"
              disabled={!sourceCpanelIsSupported(item.id)}
              title={!sourceCpanelIsSupported(item.id)?
                "Original target adapter is not migrated":undefined}
              onClick={()=>openSourceItem(item)}>{item.label}</button>
            {tasks.map((task,index)=>{
              const target=sourceItems.find(candidate=>candidate.id===task.id);
              const enabled=Boolean(target&&sourceCpanelIsSupported(target.id));
              return <button key={index} type="button"
                className="windows-cpanel__task" data-test-cpanel-task=""
                disabled={!enabled}
                title={!enabled?"Original target adapter is not migrated":undefined}
                onClick={()=>{if(target)openSourceItem(target);}}>{task.label}</button>;
            })}
          </div>
        </article>)}
        {!searchResults.length?<p>No items match your search.</p>:null}
      </div>:location==="backup"?<BackupRestorePanel filesystem={filesystem}
        onBack={()=>open(null)}/>:location==="action-center"?<div className="windows-cpanel__action"
        data-test-cpanel-action-center="">
        <aside className="windows-cpanel__action-sidebar">
          <button type="button" onClick={()=>open(null)}>Control Panel</button>
          <button type="button" disabled>{SOURCE_CPANEL_ACTION_CENTER_TEXT.changeSettings}</button>
          <button type="button" disabled>{SOURCE_CPANEL_ACTION_CENTER_TEXT.archived}</button>
        </aside>
        <div className="windows-cpanel__action-content">
          <h2>{SOURCE_CPANEL_ACTION_CENTER_TEXT.title}</h2>
          <p>{messages.length?
            SOURCE_CPANEL_ACTION_CENTER_TEXT.hasMessagesInstruction:
            SOURCE_CPANEL_ACTION_CENTER_TEXT.emptyInstruction}</p>
          {!messages.length?<p className="windows-cpanel__action-empty"
            data-test-no-messages="">{SOURCE_CPANEL_ACTION_CENTER_TEXT.empty}</p>:
            messages.map(message=><article key={message.id}
              data-test-cpanel-action-message={message.id}
              className={"windows-cpanel__action-message is-"+message.type}>
              <strong>{message.title}</strong>
              <p>{message.body}</p>
            </article>)}
        </div>
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
        <h2>Adjust your device's settings</h2>
        <SourceListView variant="tiles" className="windows-cpanel__source-list">
          {sourceItems.map(item=><button type="button" key={item.id}
            data-test-cpanel-item={item.id}
            className="windows-cpanel__tile"
            disabled={!sourceCpanelIsSupported(item.id)}
            title={!sourceCpanelIsSupported(item.id)?
              "Original target adapter is not migrated":undefined}
            onClick={()=>openSourceItem(item)}>
            <img src={sourceIcon(item)} alt="" width={44} height={44}/>
            <span>{item.label}</span>
          </button>)}
        </SourceListView>
      </div>}
    </div>
  </section>;
}

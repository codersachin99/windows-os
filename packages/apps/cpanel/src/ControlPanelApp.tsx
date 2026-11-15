import {useState} from "react";
import {legacyArt} from "@windows-os/assets";
import {
  SOURCE_CPANEL_INITIAL_HISTORY,SOURCE_CPANEL_ZOOM_CHOICES,
  sourceCpanelDisplayMatch,sourceCpanelOpenLocation,sourceCpanelResolutions,
  sourceCpanelStep,type SourceControlPanelHistory
} from "./model";
import "./ControlPanelApp.css";

export interface ControlPanelAppProps{
  onClose():void;
}
/** Source cpanel.js a259: address breadcrumbs, back/forward history,
 * instant search, tiles root and navigated panel body. The first real panel
 * is the original Display view; remaining panels are tracked, not invented. */
export function ControlPanelApp({onClose}:ControlPanelAppProps){
  const [history,setHistory]=useState<SourceControlPanelHistory>(
    SOURCE_CPANEL_INITIAL_HISTORY);
  const [query,setQuery]=useState("");
  const location=history.entries[history.index];
  const results=query.trim().length>0;
  const matchingDisplay=sourceCpanelDisplayMatch(query);
  const open=(value:null|"display")=>{
    setHistory(previous=>sourceCpanelOpenLocation(previous,value));
    setQuery("");
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
        {location==="display"&&<span data-test-cpanel-location="">
          <span aria-hidden="true"> › </span> Display
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
        </article>:<p>No items match your search.</p>}
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
      </div>}
    </div>
  </section>;
}

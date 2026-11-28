import {useState} from "react";
import type {SourceVisualEffects,SourceVisualEffectsPreset} from "./sourceVisualEffects";
import {
  sourceVisualEffectsPreset,sourceVisualEffectsToggle
} from "./sourceVisualEffects";
import "./SystemPropertiesApp.css";

type SourceSystemTab="computerName"|"hardware"|"advanced"|"systemProtection"|"remote";
const SOURCE_SYSTEM_TABS:ReadonlyArray<readonly [SourceSystemTab,string]>=[
  ["computerName","Computer Name"],
  ["hardware","Hardware"],
  ["advanced","Advanced"],
  ["systemProtection","System Protection"],
  ["remote","Remote"]
];

interface SystemPropertiesAppProps{
  visualEffects:SourceVisualEffects;
  onVisualEffectsChange(effects:SourceVisualEffects):void;
  onClose():void;
}

/** Source src/modules/shell/system.js: SystemProperties advanced tab and its
 * nonresizable SystemPerformance (420x500) Visual Effects child.
 * Host CPU/memory/DEP values and unsupported system setting pages are not
 * fabricated. Only the migrated source CSS effects are editable. */
export function SystemPropertiesApp({
  visualEffects,onVisualEffectsChange,onClose
}:SystemPropertiesAppProps){
  const [systemTab,setSystemTab]=useState<SourceSystemTab>("advanced");
  const [performanceOpen,setPerformanceOpen]=useState(false);
  const [draft,setDraft]=useState<SourceVisualEffects>(visualEffects);
  const [tab,setTab]=useState<"visualEffects"|"advanced"|"dataExecutionPrevention">(
    "visualEffects");
  const dirty=JSON.stringify(draft)!==JSON.stringify(visualEffects);
  const openPerformance=()=>{
    setDraft(visualEffects);
    setTab("visualEffects");
    setPerformanceOpen(true);
  };
  const cancel=()=>{
    setDraft(visualEffects);
    setPerformanceOpen(false);
  };
  const apply=()=>{if(dirty)onVisualEffectsChange(draft);};
  const ok=()=>{apply();setPerformanceOpen(false);};
  const changePreset=(preset:SourceVisualEffectsPreset)=>{
    setDraft(previous=>sourceVisualEffectsPreset(previous,preset));
  };
  const toggle=(key:"enableGlass"|"showWindowShadows"|"animateTaskbar",checked:boolean)=>{
    setDraft(previous=>sourceVisualEffectsToggle(previous,key,checked));
  };

  return <section className="windows-system-properties"
    data-test-system-properties="">
    <nav className="windows-system-properties__tabs" aria-label="System Properties tabs">
      {SOURCE_SYSTEM_TABS.map(([id,label])=>
        <button type="button" key={id} data-test-system-tab={id}
          aria-current={systemTab===id?"page":undefined}
          onClick={()=>setSystemTab(id)}>{label}</button>)}
    </nav>
    <div className="windows-system-properties__body" data-test-system-page={systemTab}>
      {systemTab==="computerName"?<div className="windows-system-properties__page">
        <p>Windows uses the following information to identify your computer on the network.</p>
        <div className="windows-system-properties__row">
          <label htmlFor="windows-guest-description">Computer description:</label>
          <div>
            <input id="windows-guest-description" type="text" disabled/>
            <small>For example: "Kitchen Computer" or "Mary's Computer".</small>
          </div>
        </div>
        <div className="windows-system-properties__row">
          <span>Full computer name:</span><span>WindowsOS Guest</span>
        </div>
        <div className="windows-system-properties__row">
          <span>Workgroup:</span><span>WORKGROUP</span>
        </div>
        <div className="windows-system-properties__row">
          <span>To use a wizard to join a domain or workgroup, click Network ID.</span>
          <button type="button" disabled>Network ID...</button>
        </div>
        <div className="windows-system-properties__row">
          <span>To rename this computer or change its domain or workgroup, click Change.</span>
          <button type="button" disabled>Change...</button>
        </div>
      </div>:systemTab==="hardware"?<div className="windows-system-properties__page">
        <fieldset disabled>
          <legend>Device Manager</legend>
          <p>The Device Manager lists all the hardware devices installed on your computer. Use the Device Manager to change the properties of any device.</p>
          <button type="button">Device Manager</button>
        </fieldset>
        <fieldset disabled>
          <legend>Device Installation Settings</legend>
          <p>Choose whether Windows downloads drivers software for your devices and detailed information about them.</p>
          <button type="button">Device Installation Settings</button>
        </fieldset>
      </div>:systemTab==="advanced"?<div className="windows-system-properties__page">
        <p>You must be logged on as an Administrator to make most of these changes.</p>
        <fieldset>
          <legend>Performance</legend>
          <p>Visual effects, processor scheduling, memory usage, and virtual memory.</p>
          <button type="button" data-test-system-performance-open=""
            onClick={openPerformance}>Settings...</button>
        </fieldset>
        <fieldset disabled>
          <legend>User Profiles</legend>
          <p>Desktop settings related to your sign-in</p>
          <button type="button">Settings...</button>
        </fieldset>
        <fieldset disabled>
          <legend>Startup and Recovery</legend>
          <p>System startup and debugging information</p>
          <button type="button">Settings...</button>
        </fieldset>
        <div className="windows-system-properties__row windows-system-properties__row--end">
          <button type="button" disabled>Environment Variables...</button>
        </div>
      </div>:systemTab==="systemProtection"?<div className="windows-system-properties__page">
        <p>Use system protection to undo unwanted system changes and restore previous versions of files.</p>
        <h3>System Restore</h3>
        <div className="windows-system-properties__row">
          <span>You can undo system changes by reverting your computer to a previous restore point.</span>
          <button type="button" disabled>System Restore...</button>
        </div>
        <h3>Protection Settings</h3>
        <div className="windows-system-properties__drives" role="table"
          aria-label="Protection Settings">
          <div role="row"><span role="columnheader">Available Drives</span>
            <span role="columnheader">Protection</span></div>
        </div>
        <div className="windows-system-properties__row">
          <span>Configure restore settings, manage disk space, and delete restore points.</span>
          <button type="button" disabled>Configure...</button>
        </div>
        <div className="windows-system-properties__row">
          <span>To create a restore point, first enable protection by selecting a drive and clicking Configure.</span>
          <button type="button" disabled>Create...</button>
        </div>
      </div>:<div className="windows-system-properties__page">
        <fieldset disabled>
          <legend>Remote Assistance</legend>
          <label><input type="checkbox"/>
            Allow Remote Assistance connections to this computer</label>
          <button type="button">Advanced...</button>
        </fieldset>
        <fieldset disabled>
          <legend>Remote Desktop</legend>
          <p>Click an option, and then specify who can connect, if needed.</p>
          <label><input type="radio" name="system-remote" defaultChecked/>
            Don't allow connections to this computer</label>
          <label><input type="radio" name="system-remote"/>
            Allow connections from computers running any version of Remote Desktop (less secure)</label>
          <label><input type="radio" name="system-remote"/>
            Allow connections only from computers running Remote Desktop with Network Level Authentication (more secure)</label>
          <button type="button">Select Users...</button>
        </fieldset>
      </div>}
    </div>
    <footer className="windows-system-properties__actions">
      <button type="button" onClick={onClose}>OK</button>
      <button type="button" onClick={onClose}>Cancel</button>
      <button type="button" disabled>Apply</button>
    </footer>
    {performanceOpen&&<div className="windows-system-performance__backdrop">
      <section className="windows-system-performance" role="dialog"
        aria-modal="true" aria-label="Performance Options"
        data-test-performance-options="">
        <header className="windows-system-performance__title">
          <strong>Performance Options</strong>
          <button type="button" aria-label="Close Performance Options"
            onClick={cancel}>×</button>
        </header>
        <nav className="windows-system-performance__tabs"
          aria-label="Performance Options tabs">
          <button type="button" aria-current={tab==="visualEffects"?"page":undefined}
            onClick={()=>setTab("visualEffects")}>Visual Effects</button>
          <button type="button" aria-current={tab==="advanced"?"page":undefined}
            onClick={()=>setTab("advanced")}>Advanced</button>
          <button type="button"
            aria-current={tab==="dataExecutionPrevention"?"page":undefined}
            onClick={()=>setTab("dataExecutionPrevention")}>
            Data Execution Prevention
          </button>
        </nav>
        <div className="windows-system-performance__content">
          {tab==="visualEffects"?<>
            <p>Select the settings you want to use for the appearance and
              performance of this computer.</p>
            <fieldset className="windows-system-performance__presets">
              <legend>Visual Effects preset</legend>
              {([
                ["auto","Let Windows choose what's best for my computer"],
                ["appearance","Adjust for best appearance"],
                ["performance","Adjust for best performance"],
                ["custom","Custom"]
              ] as const).map(([preset,label])=>
                <label key={preset}>
                  <input type="radio" name="vfx"
                    data-test-vfx-preset={preset}
                    checked={draft.preset===preset}
                    onChange={()=>changePreset(preset)}/>
                  <span>{label}</span>
                </label>)}
            </fieldset>
            <fieldset className="windows-system-performance__options">
              <legend>Visual effects</legend>
              <label>
                <input type="checkbox" data-test-vfx-animateTaskbar=""
                  checked={draft.animateTaskbar}
                  onChange={event=>toggle("animateTaskbar",event.target.checked)}/>
                <span>Animations in the taskbar and Start menu</span>
              </label>
              <label>
                <input type="checkbox" data-test-vfx-enableGlass=""
                  checked={draft.enableGlass}
                  onChange={event=>toggle("enableGlass",event.target.checked)}/>
                <span>Enable transparent glass</span>
              </label>
              <label>
                <input type="checkbox" data-test-vfx-showWindowShadows=""
                  checked={draft.showWindowShadows}
                  onChange={event=>toggle(
                    "showWindowShadows",event.target.checked)}/>
                <span>Show shadows under windows</span>
              </label>
              <p className="windows-system-performance__note">
                Other original visual effects are not yet available in this
                browser-hosted desktop.
              </p>
            </fieldset>
          </>:tab==="advanced"?<>
            <fieldset disabled>
              <legend>Processor scheduling</legend>
              <p>Adjust for best performance of</p>
              <label><input type="radio" defaultChecked name="proc-sched"/>Programs</label>
              <label><input type="radio" name="proc-sched"/>Background services</label>
            </fieldset>
            <fieldset disabled>
              <legend>Virtual memory</legend>
              <p>Changing host virtual memory is unavailable.</p>
              <button type="button">Change...</button>
            </fieldset>
          </>:<fieldset disabled>
            <legend>Data Execution Prevention</legend>
            <p>Host device DEP settings are not accessible from the
              browser-hosted desktop.</p>
          </fieldset>}
        </div>
        <footer className="windows-system-performance__actions">
          <button type="button" data-test-vfx-ok="" onClick={ok}>OK</button>
          <button type="button" data-test-vfx-cancel="" onClick={cancel}>
            Cancel
          </button>
          <button type="button" data-test-vfx-apply="" disabled={!dirty}
            onClick={apply}>Apply</button>
        </footer>
      </section>
    </div>}
  </section>;
}

import {useState} from "react";
import type {SourceVisualEffects,SourceVisualEffectsPreset} from "./sourceVisualEffects";
import {
  sourceVisualEffectsPreset,sourceVisualEffectsToggle
} from "./sourceVisualEffects";
import "./SystemPropertiesApp.css";

interface SystemPropertiesAppProps{
  visualEffects:SourceVisualEffects;
  onVisualEffectsChange(effects:SourceVisualEffects):void;
  onClose():void;
}

/** Source src/modules/shell/system.js: SystemProperties advanced tab and its
 * nonresizable SystemPerformance (420x500) Visual Effects child.
 * Host CPU/memory/DEP values and unsupported system setting pages are not
 * fabricated. Only the two migrated source CSS effects are editable. */
export function SystemPropertiesApp({
  visualEffects,onVisualEffectsChange,onClose
}:SystemPropertiesAppProps){
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
  const toggle=(key:"enableGlass"|"showWindowShadows",checked:boolean)=>{
    setDraft(previous=>sourceVisualEffectsToggle(previous,key,checked));
  };

  return <section className="windows-system-properties"
    data-test-system-properties="">
    <nav className="windows-system-properties__tabs" aria-label="System Properties tabs">
      <button type="button" disabled>Computer Name</button>
      <button type="button" disabled>Hardware</button>
      <button type="button" aria-current="page">Advanced</button>
      <button type="button" disabled>System Protection</button>
      <button type="button" disabled>Remote</button>
    </nav>
    <div className="windows-system-properties__body">
      <p>You must be logged on as an Administrator to make most of these changes.</p>
      <fieldset>
        <legend>Performance</legend>
        <p>Visual effects, processor scheduling, memory usage, and virtual memory</p>
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

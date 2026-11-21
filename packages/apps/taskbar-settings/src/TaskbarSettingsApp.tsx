import {useState} from "react";
import type {SourceStartPreferences} from "@windows-os/sdk";
import {sourceStartPreferences,sourceTaskbarPreferences,
  isSourceTaskbarButtonMode} from "@windows-os/sdk";
import "./TaskbarSettingsApp.css";

export type SourceTaskbarTab="taskbar"|"start"|"toolbars";
interface Props{
  onClose():void;
  onCustomizeNotificationArea():void;
  theme:string;
}
/** Original src/modules/shell/taskbar.js window-taskbar: three tabs,
 * Start power/recent privacy and source taskbarDraft.type use transactional
 * OK/Cancel/Apply. The original taskbar-base.js checks type !== "combine"
 * to render full-size labeled buttons; it does not regroup window ids.
 * Source-disabled auto-hide, lock and small-icon settings remain disabled.
 * Win7 exposes the original default-off taskbarDraft.useAeroPeek; themes
 * without a verified Aero Peek rendering adapter keep this disabled.
 */
export function TaskbarSettingsApp({
  onClose,onCustomizeNotificationArea,theme
}:Props){
  const [tab,setTab]=useState<SourceTaskbarTab>("taskbar");
  const [draft,setDraft]=useState(()=>sourceStartPreferences.snapshot());
  const [saved,setSaved]=useState(()=>sourceStartPreferences.snapshot());
  const [taskbarDraft,setTaskbarDraft]=useState(()=>sourceTaskbarPreferences.snapshot());
  const [taskbarSaved,setTaskbarSaved]=useState(()=>sourceTaskbarPreferences.snapshot());
  const dirty=draft.powerButtonAction!==saved.powerButtonAction||
    draft.storeRecentApps!==saved.storeRecentApps||
    taskbarDraft.type!==taskbarSaved.type||
    taskbarDraft.useAeroPeek!==taskbarSaved.useAeroPeek;
  const apply=()=>{
    sourceStartPreferences.apply(draft);
    sourceTaskbarPreferences.apply(taskbarDraft);
    setSaved({...draft});
    setTaskbarSaved({...taskbarDraft});
  };
  const pick=(field:keyof SourceStartPreferences,value:string|boolean)=>{
    setDraft(previous=>({
      ...previous,[field]:value
    }));
  };
  return <section className="windows-taskbar-settings"
    data-test-taskbar-settings="" data-theme={theme}>
    <div className="windows-taskbar-settings__tabs"
      role="tablist" aria-label="Taskbar and Start Menu Properties">
      {([
        ["taskbar","Taskbar"],["start","Start Menu"],["toolbars","Toolbars"]
      ] as const).map(([id,label])=>
        <button key={id} type="button" role="tab" id={"taskbar-tab-"+id}
          data-test-taskbar-settings-tab={id}
          aria-selected={tab===id} aria-controls={"taskbar-panel-"+id}
          onClick={()=>setTab(id)}>{label}</button>)}
    </div>
    <div role="tabpanel" id={"taskbar-panel-"+tab}
      aria-labelledby={"taskbar-tab-"+tab}
      className="windows-taskbar-settings__panel"
      data-test-taskbar-settings-panel={tab}>
      {tab==="taskbar"?<>
        <fieldset>
          <legend>Taskbar appearance</legend>
          <div className="windows-taskbar-settings__checks">
            <label><input type="checkbox" checked readOnly disabled/>
              Lock the taskbar</label>
            <label><input type="checkbox" disabled/>
              Auto-hide the taskbar</label>
            <label><input type="checkbox" disabled/>
              Use small icons</label>
            <label><input type="checkbox" disabled/>
              Center taskbar buttons</label>
          </div>
          <label>Taskbar location on screen:
            <select disabled value="bottom" onChange={()=>{}}>
              <option value="bottom">Bottom</option>
            </select>
          </label>
          <label>Taskbar buttons:
            <select value={taskbarDraft.type} data-test-taskbar-settings-buttons=""
              onChange={event=>{
                const value=event.currentTarget.value;
                if(isSourceTaskbarButtonMode(value))
                  setTaskbarDraft(previous=>({...previous,type:value}));
              }}>
              <option value="combine">Always combine, hide labels</option>
              <option value="combine-when-full">Combine when taskbar is full</option>
              <option value="no-combine">Never combine</option>
            </select>
          </label>
        </fieldset>
        <fieldset>
          <legend>Notification area</legend>
          <p>Choose which icons and notifications appear on the taskbar.</p>
          <button type="button" onClick={onCustomizeNotificationArea}
            data-test-taskbar-settings-customize="">Customize...</button>
        </fieldset>
        <fieldset>
          <legend>Preview desktop with Aero Peek</legend>
          <p>Temporarily view the desktop when you move your mouse to the Show desktop button at the end of the taskbar.</p>
          <label><input type="checkbox" data-test-taskbar-settings-aero-peek=""
            disabled={theme!=="win7"} checked={taskbarDraft.useAeroPeek}
            onChange={event=>{
              const checked=event.currentTarget.checked;
              setTaskbarDraft(previous=>({...previous,useAeroPeek:checked}));
            }}/> Use Aero Peek to preview the desktop</label>
        </fieldset>
      </>:tab==="start"?<>
        <p>To customize how links, icons and menus look and behave in the Start menu, click Customize.</p>
        <button type="button" disabled>Customize...</button>
        <label className="windows-taskbar-settings__select">Power button action:
          <select value={draft.powerButtonAction}
            data-test-taskbar-settings-power=""
            onChange={event=>pick("powerButtonAction",event.currentTarget.value)}>
            <option value="switchuser">Switch user</option>
            <option value="logoff">Log off</option>
            <option value="restart">Restart</option>
            <option value="shutdown">Shut down</option>
          </select>
        </label>
        <fieldset>
          <legend>Privacy</legend>
          <label><input type="checkbox"
            data-test-taskbar-settings-recent=""
            checked={draft.storeRecentApps}
            onChange={event=>pick("storeRecentApps",event.currentTarget.checked)}/>
            Store and display recently opened programs in the Start menu</label>
          <label><input type="checkbox" disabled/>
            Store and display recently opened items in the Start menu and taskbar</label>
        </fieldset>
      </>:<>
        <p>Select the toolbars you want to add to the taskbar.</p>
        <fieldset>
          {["Address","Links","Tablet PC Input Panel","Desktop"].map(label=>
            <label key={label}><input type="checkbox" disabled/>{label}</label>)}
        </fieldset>
      </>}
    </div>
    <footer className="windows-taskbar-settings__footer">
      <button type="button" onClick={()=>{apply();onClose();}}
        data-test-taskbar-settings-ok="">OK</button>
      <button type="button" onClick={onClose}>Cancel</button>
      <button type="button" disabled={!dirty} onClick={apply}
        data-test-taskbar-settings-apply="">Apply</button>
    </footer>
  </section>;
}

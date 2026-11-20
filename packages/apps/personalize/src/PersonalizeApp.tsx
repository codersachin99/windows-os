import {useEffect,useState,type CSSProperties} from "react";
import {SOURCE_AERO_COLORS,sourceIsAeroFamily,sourceIsXpFamily,
  sourceWin7ThemeColor,type SourceAeroAppearance,type ThemeId} from "@windows-os/contracts";
import {
  SOURCE_PERSONALIZE_THEMES,SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS,
  sourcePersonalizeGroup,type SourcePersonalizeTheme
} from "./model";
import "./PersonalizeApp.css";

interface PersonalizeAppProps{
  /** Search from the original Control Panel can enter Background directly. */
  initialView?:"theme"|"background";
  theme:ThemeId;
  wallpaper:string;
  onSelectTheme(theme:SourcePersonalizeTheme["id"]):void;
  onSelectWallpaper(path:string):void;
  aeroAppearance:SourceAeroAppearance;
  onAeroAppearancePreview(value:SourceAeroAppearance):void;
  onAeroAppearanceSave(value:SourceAeroAppearance):void;
  onAeroAppearanceDiscard():void;
}
/** Source personalize.js ChangeTheme and first ChangeBackground system gallery.
 * The source saves ChangeTheme immediately, but ChangeBackground only on Save;
 * Cancel must discard its draft. User image/video uploads, animations, ads,
 * cursor and sounds pages are not yet implemented.
 */
export function PersonalizeApp({
  theme,wallpaper,onSelectTheme,onSelectWallpaper,initialView="theme",
  aeroAppearance,onAeroAppearancePreview,onAeroAppearanceSave,
  onAeroAppearanceDiscard
}:PersonalizeAppProps){
  const [view,setView]=useState<"theme"|"background"|"appearance">(initialView);
  const [selectedBg,setSelectedBg]=useState(wallpaper);
  const [selectedColor,setSelectedColor]=useState(
    aeroAppearance.color??sourceWin7ThemeColor(theme)??SOURCE_AERO_COLORS[0]);
  const [enableTransparency,setEnableTransparency]=useState(aeroAppearance.transparent);
  useEffect(()=>()=>onAeroAppearanceDiscard(),[onAeroAppearanceDiscard]);
  const openAppearance=()=>{
    if(!sourceIsAeroFamily(theme))return;
    setSelectedColor(aeroAppearance.color??sourceWin7ThemeColor(theme)??SOURCE_AERO_COLORS[0]);
    setEnableTransparency(aeroAppearance.transparent);
    setView("appearance");
  };
  const cancelAppearance=()=>{
    onAeroAppearanceDiscard();
    setView("theme");
  };
  const saveAppearance=()=>{
    onAeroAppearanceSave({color:selectedColor,transparent:enableTransparency});
    setView("theme");
  };
  const openBackground=()=>{
    setSelectedBg(wallpaper);
    setView("background");
  };
  const saveBackground=()=>{
    if(SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS.includes(selectedBg))
      onSelectWallpaper(selectedBg);
    setView("theme");
  };
  const gallery=(group:SourcePersonalizeTheme["group"],label:string)=>{
    const list=sourcePersonalizeGroup(group);
    return <section className="windows-personalize__group"
      data-test-personalize-group={group} aria-label={label}>
      <h3>{label} ({list.length})</h3>
      <div className="windows-personalize__tiles">
        {list.map(item=><button key={item.id} type="button"
          data-test-personalize-theme={item.id}
          aria-pressed={theme===item.id}
          className={"windows-personalize__theme"+
            (theme===item.id?" is-selected":"")}
          onClick={()=>{if(item.id!==theme)onSelectTheme(item.id);}}>
          <div className={"windows-personalize__theme-preview"+
            (sourceIsXpFamily(item.id)?" is-xp":/^aero-[1-4]$|^basic-[1-4]$/.test(item.id)?" is-win7-family":"")}>
            {item.preview.startsWith("#")
              ?<span className="windows-personalize__theme-solid"
                style={{backgroundColor:item.preview}} aria-hidden="true"/>
              :<img src={item.preview} alt="" draggable={false}/>}
            {(sourceIsXpFamily(item.id)||/^aero-[1-4]$|^basic-[1-4]$/.test(item.id))&&<span aria-hidden="true"
              data-test-personalize-color={item.id}
              className="windows-personalize__theme-color"
              style={sourceWin7ThemeColor(item.id)
                ?{"--preview-color":sourceWin7ThemeColor(item.id)} as CSSProperties
                :undefined}/>}
          </div>
          <span>{item.label}</span>
        </button>)}
      </div>
    </section>;
  };
  return <div className="windows-personalize" data-test-personalize=""
    data-active-theme={theme} data-personalize-view={view}>
    <aside className="windows-personalize__sidebar">
      <strong>Personalize</strong>
      <span>Change the visuals and sounds on your computer</span>
      <button type="button" className="windows-personalize__navigation"
        data-test-personalize-open-background=""
        onClick={openBackground}>Desktop Background</button>
    </aside>
    <div className="windows-personalize__main">
      {view==="appearance"?<>
        <h2>Window Color and Appearance</h2>
        <p>Change the color of your window borders, Start menu and taskbar.</p>
        <ul className="windows-personalize__color-list"
          data-test-color-list="" aria-label="Window colors">
          {SOURCE_AERO_COLORS.map(color=>
            <li key={color} className={selectedColor===color?"is-selected":""}>
              <button type="button" data-test-color-item={color}
                aria-label={`Color ${color}`} aria-pressed={selectedColor===color}
                className="windows-personalize__color-chip"
                style={{"--preview-color":color} as CSSProperties}
                onClick={()=>{
                  setSelectedColor(color);
                  onAeroAppearancePreview({color,transparent:enableTransparency});
                }}/>
            </li>)}
        </ul>
        <label className="windows-personalize__transparency">
          <input id="enableTransparency" data-test-color-transparency=""
            type="checkbox" checked={enableTransparency}
            onChange={event=>{
              setEnableTransparency(event.target.checked);
              onAeroAppearancePreview({color:selectedColor,transparent:event.target.checked});
            }}/>
          Enable transparency
        </label>
        <div className="windows-personalize__actions">
          <button type="button" data-test-color-save=""
            onClick={saveAppearance}>Save</button>
          <button type="button" data-test-color-cancel=""
            onClick={cancelAppearance}>Cancel</button>
        </div>
      </>:view==="background"?<>
        <h2>Desktop Background</h2>
        <p>Choose a background for your desktop.</p>
        <section className="windows-personalize__group"
          aria-label="System backgrounds">
          <h3>System ({SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS.length})</h3>
          <div className="windows-personalize__backgrounds"
            data-test-bg-list="system">
            {SOURCE_PERSONALIZE_SYSTEM_BACKGROUNDS.map((path,index)=>
              <button type="button" key={path}
                className={"windows-personalize__background"+
                  (selectedBg===path?" is-selected":"")}
                data-test-bg-item={path}
                aria-label={`System background ${index+1}`}
                aria-pressed={selectedBg===path}
                onClick={()=>setSelectedBg(path)}>
                <img src={path} alt="" draggable={false} loading="lazy"/>
              </button>)}
          </div>
        </section>
        <div className="windows-personalize__actions">
          <button type="button" data-test-button="save"
            onClick={saveBackground}>Save</button>
          <button type="button" data-test-button="cancel"
            onClick={()=>setView("theme")}>Cancel</button>
        </div>
      </>:<>
        <h2>Change the visuals and sounds on your computer</h2>
        <p>Click a theme to change the desktop visuals.</p>
        {gallery("aero","Aero Themes")}
        {gallery("basic","Basic and High Contrast Themes")}
        {gallery("wins","Other Windows Themes")}
        <div className="windows-personalize__preview">
          <span>Selected theme</span>
          <strong>{SOURCE_PERSONALIZE_THEMES.find(item=>item.id===theme)?.label
            ??(theme==="win7"?"Windows 7":"Another original theme")}</strong>
          <button type="button" className="windows-personalize__navigation"
            data-test-personalize-background-link=""
            onClick={openBackground}>Desktop Background</button>
          {sourceIsAeroFamily(theme)&&
            <button type="button" className="windows-personalize__navigation"
              data-test-personalize-appearance-link=""
              onClick={openAppearance}>Window Color</button>}
        </div>
      </>}
    </div>
  </div>;
}

import type {ThemeId} from "@windows-os/contracts";
import {SOURCE_PERSONALIZE_THEMES,sourcePersonalizeGroup,type SourcePersonalizeTheme} from "./model";
import "./PersonalizeApp.css";

interface PersonalizeAppProps{
  theme:ThemeId;
  onSelectTheme(theme:SourcePersonalizeTheme["id"]):void;
}
/** Source personalize.js first ChangeTheme screen: click theme -> save
 * directly; desktop shell and wallpaper both respond. Premium, ad-gates,
 * Theme Studio, cursor/sound, color and wallpaper customizers are separate
 * original sections, not fabricated here.
 */
export function PersonalizeApp({theme,onSelectTheme}:PersonalizeAppProps){
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
          onClick={()=>onSelectTheme(item.id)}>
          <img src={item.preview} alt="" draggable={false}/>
          <span>{item.label}</span>
        </button>)}
      </div>
    </section>;
  };
  return <div className="windows-personalize" data-test-personalize=""
    data-active-theme={theme}>
    <aside className="windows-personalize__sidebar">
      <strong>Personalize</strong>
      <span>Change the visuals and sounds on your computer</span>
    </aside>
    <div className="windows-personalize__main">
      <h2>Change the visuals and sounds on your computer</h2>
      <p>Click a theme to change the desktop visuals.</p>
      {gallery("aero","Aero Themes")}
      {gallery("wins","Other Windows Themes")}
      <div className="windows-personalize__preview">
        <span>Selected theme</span>
        <strong>{SOURCE_PERSONALIZE_THEMES.find(item=>item.id===theme)?.label
          ??"Another original theme"}</strong>
      </div>
    </div>
  </div>;
}

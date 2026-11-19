import {useState,type MouseEvent as ReactMouseEvent,type RefObject} from "react";
import type {AppDefinition} from "@windows-os/contracts";
import {legacySourceIconArtwork,sourceThemeProgramArt} from "@windows-os/assets";
import "./sourceWin9xStartMenu.css";

export type SourceWin9xTheme="win95"|"win98"|"win2k";
type SourceWin9xPower="SHUTDOWN"|"RESTART"|"LOG_OFF"|"SWITCH_USER";
type MenuBranch="programs"|"shutdown"|null;

interface SourceWin9xStartMenuProps{
  theme:SourceWin9xTheme;
  rootRef:RefObject<HTMLElement|null>;
  programs:readonly AppDefinition[];
  onLaunch(id:string):void;
  onSearch():void;
  onPower(action:SourceWin9xPower):void;
  onContext(event:ReactMouseEvent<HTMLButtonElement>,id:string):void;
}

/**
 * Original legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * src/modules/shell/startmenu-win9x.js (source module 015b) and
 * src/styles/shell/startmenu-win9x.css. The same source component
 * serves Win95/98/2k; the 2k theme's Find entry is called Search
 * and opens Computer search, not the separate Win9x Find app.
 *
 * The source has a 208px winui-menu, 224px nested Programs and
 * Shutdown menus, 24px row icons, a vertical blue-black banner,
 * separators and a bottom-anchored layout. Installed program
 * launches and right-click actions delegate to the existing shell.
 */
export function SourceWin9xStartMenu({
  theme,rootRef,programs,onLaunch,onSearch,onPower,onContext
}:SourceWin9xStartMenuProps){
  const [branch,setBranch]=useState<MenuBranch>(null);
  const is2k=theme==="win2k";
  const icon=(key:string)=>
    sourceThemeProgramArt(theme,key)??legacySourceIconArtwork(key).src;
  const choose=(id:string)=>{setBranch(null);onLaunch(id);};
  const mainItem=(key:string,label:string,id:string,attr?:string)=>
    <button type="button" role="menuitem"
      className="source-win9x-startmenu__item"
      data-test-win9x-command={key}
      data-test-startmenu-link={attr}
      onPointerEnter={()=>setBranch(null)}
      onClick={()=>choose(id)}>
      <img src={icon(key)} width={24} height={24} alt=""/>
      <span>{label}</span>
    </button>;
  return <nav id="start-menu" ref={rootRef}
    className={"source-win9x-startmenu"+(is2k?" is-win2k":"")}
    data-test-start-menu="" data-test-win9x-start-menu=""
    data-source-start-theme={theme} aria-label="Start menu">
    <div className="source-win9x-startmenu__banner" aria-hidden="true">
      <b>Windows</b> 7 <b>Simulator</b>
    </div>
    <div className="source-win9x-startmenu__main" role="menu" aria-label="Windows Start commands">
      {mainItem("about","About","about")}
      <div className="source-win9x-startmenu__separator" role="separator"/>
      <div className="source-win9x-startmenu__branch"
        onPointerEnter={()=>setBranch("programs")}>
        <button type="button" role="menuitem" aria-haspopup="menu"
          aria-expanded={branch==="programs"}
          data-test-win9x-branch="programs"
          onClick={()=>setBranch("programs")}
          onKeyDown={event=>{
            if(event.key==="ArrowRight"){
              event.preventDefault();setBranch("programs");
            }
          }}>
          <img src={icon("programs")} width={24} height={24} alt=""/>
          <span>Programs</span><span aria-hidden="true" className="source-win9x-startmenu__arrow">▶</span>
        </button>
        {branch==="programs"&&<div className="source-win9x-startmenu__submenu"
          role="menu" aria-label="Programs" data-test-win9x-submenu="programs">
          {[...programs].sort((a,b)=>a.label.localeCompare(b.label)).map(app=>
            <button type="button" role="menuitem" key={app.id}
              data-test-win9x-program={app.id}
              onContextMenu={event=>onContext(event,app.id)}
              onClick={()=>choose(app.id)}>
              <img width={16} height={16} alt=""
                src={sourceThemeProgramArt(theme,app.id)??app.icon}/>
              <span>{app.label}</span>
            </button>)}
        </div>}
      </div>
      {mainItem("folder-docs","Documents","computer")}
      {mainItem("games","Games","games","games")}
      {mainItem("cpanel","Control Panel","cpanel")}
      <button type="button" role="menuitem"
        className="source-win9x-startmenu__item"
        data-test-win9x-command="find"
        data-test-startmenu-link="find"
        onPointerEnter={()=>setBranch(null)}
        onClick={()=>{setBranch(null);onSearch();}}>
        <img src={icon("search")} width={24} height={24} alt=""/>
        <span>{is2k?"Search":"Find"}...</span>
      </button>
      <button type="button" role="menuitem"
        className="source-win9x-startmenu__item"
        title="The original source Help service has not been migrated"
        disabled data-test-win9x-command="help"
        onPointerEnter={()=>setBranch(null)}>
        <img src={icon("about")} width={24} height={24} alt=""/>
        <span>Help</span>
      </button>
      {mainItem("run","Run...","run")}
      <div className="source-win9x-startmenu__separator" role="separator"/>
      <button type="button" role="menuitem"
        className="source-win9x-startmenu__item"
        data-test-win9x-command="switchuser"
        onPointerEnter={()=>setBranch(null)}
        onClick={()=>onPower("SWITCH_USER")}>
        <img src={icon("accounts")} width={24} height={24} alt=""/>
        <span>Switch user</span>
      </button>
      <div className="source-win9x-startmenu__branch"
        onPointerEnter={()=>setBranch("shutdown")}>
        <button type="button" role="menuitem" aria-haspopup="menu"
          data-test-win9x-branch="shutdown"
          aria-expanded={branch==="shutdown"}
          onClick={()=>setBranch("shutdown")}
          onKeyDown={event=>{
            if(event.key==="ArrowRight"){
              event.preventDefault();setBranch("shutdown");
            }
          }}>
          <img src={icon("shutdown")} width={24} height={24} alt=""/>
          <span>Shut down...</span><span aria-hidden="true" className="source-win9x-startmenu__arrow">▶</span>
        </button>
        {branch==="shutdown"&&<div className="source-win9x-startmenu__submenu is-shutdown"
          role="menu" aria-label="Power options" data-test-win9x-submenu="shutdown">
          {([
            ["SHUTDOWN","Shut down"],["RESTART","Restart"],["LOG_OFF","Log off"]
          ] as const).map(([action,label])=>
            <button type="button" role="menuitem" key={action}
              data-test-win9x-power={action.toLowerCase()}
              onClick={()=>{setBranch(null);onPower(action);}}>{label}</button>)}
        </div>}
      </div>
    </div>
  </nav>;
}

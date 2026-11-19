import {useState,type MouseEvent as ReactMouseEvent,type RefObject} from "react";
import type {AppDefinition} from "@windows-os/contracts";
import {legacySourceIconArtwork,sourceThemeProgramArt} from "@windows-os/assets";
import {sourceProgramsById} from "@windows-os/filesystem";
import "./sourceWin31ProgramManager.css";

type Win31Group="recently-opened"|"simu-programs"|"games";
type Win31PowerAction="LOG_OFF"|"RESTART"|"SHUTDOWN";
interface SourceWin31ProgramManagerProps{
  rootRef:RefObject<HTMLElement|null>;
  programs:readonly AppDefinition[];
  recent:readonly AppDefinition[];
  onLaunch(id:string):void;
  onClose():void;
  onPower(action:Win31PowerAction):void;
  onContext(event:ReactMouseEvent<HTMLButtonElement>,id:string):void;
}

const GROUPS:readonly {id:Win31Group;label:string}[]=[
  {id:"recently-opened",label:"Recently Opened"},
  {id:"simu-programs",label:"Windows Programs"},
  {id:"games",label:"Games"}
];

/** Original legacy-win7@26b9f0c src/modules/shell/startmenu-win31.js
 * renders a 600×400 non-draggable Program Manager containing separate
 * 250px group windows (Recent, Simu Programs, Games, optional Android).
 * Browser builds do not expose the Android-only source runtime group.
 * Keep group windows local to this source-specific Start UI; application
 * launches, recent programs, taskbar actions and power go through the
 * existing permissioned shell engine.
 */
export function SourceWin31ProgramManager({
  rootRef,programs,recent,onLaunch,onClose,onPower,onContext
}:SourceWin31ProgramManagerProps){
  const [opened,setOpened]=useState<Win31Group[]>([]);
  const [maximized,setMaximized]=useState(false);
  const [maximizedGroups,setMaximizedGroups]=useState<Win31Group[]>([]);
  const [activeMenu,setActiveMenu]=useState<"window"|"help"|null>(null);
  const groupEntries=(group:Win31Group):AppDefinition[]=>{
    if(group==="recently-opened")return [...recent];
    return programs.filter(app=>{
      const source=sourceProgramsById.get(app.id);
      if(!source||source.hidden)return false;
      const isGame=source.kind==="game"||app.kind==="game";
      return group==="games"?isGame:!isGame;
    });
  };
  const toggleGroup=(id:Win31Group)=>{
    setActiveMenu(null);
    setOpened(items=>items.includes(id)?items.filter(entry=>entry!==id):[...items,id]);
  };
  const closeGroup=(id:Win31Group)=>{
    setOpened(items=>items.filter(entry=>entry!==id));
    setMaximizedGroups(items=>items.filter(entry=>entry!==id));
  };
  const bringFront=(id:Win31Group)=>
    setOpened(items=>items.includes(id)?[...items.filter(entry=>entry!==id),id]:items);
  const toggleGroupMax=(id:Win31Group)=>{
    bringFront(id);
    setMaximizedGroups(items=>items.includes(id)?items.filter(entry=>entry!==id):[...items,id]);
  };
  const activate=(id:string)=>{setActiveMenu(null);onLaunch(id);};
  return <section ref={rootRef} id="start-menu"
    className={"source-win31-program-manager"+(maximized?" is-maximized":"")}
    aria-label="Program Manager" data-test-start-menu=""
    data-test-win31-program-manager="" data-source-start-theme="win31">
    <header className="source-win31-program-manager__titlebar">
      <strong>Program Manager</strong>
      <div className="source-win31-program-manager__controls">
        <button type="button" aria-label={maximized?"Restore Program Manager":"Maximize Program Manager"}
          data-test-win31-manager-maximize=""
          onClick={()=>setMaximized(value=>!value)}>{maximized?"❐":"□"}</button>
        <button type="button" aria-label="Close Program Manager"
          data-test-win31-manager-close="" onClick={onClose}>×</button>
      </div>
    </header>
    <nav className="source-win31-program-manager__menubar" aria-label="Program Manager menus">
      {(["window","help"] as const).map(menu=><div key={menu}
        className="source-win31-program-manager__menu">
        <button type="button" aria-expanded={activeMenu===menu}
          data-test-win31-menu={menu}
          onClick={()=>setActiveMenu(current=>current===menu?null:menu)}>
          {menu==="window"?"Window":"Help"}
        </button>
        {activeMenu===menu&&<div role="menu" data-test-win31-menu-open={menu}
          className="source-win31-program-manager__dropdown">
          {menu==="window"?<>
            <button role="menuitem" type="button" onClick={()=>activate("computer")}>Computer</button>
            <button role="menuitem" type="button" onClick={()=>activate("games")}>Games</button>
            <button role="menuitem" type="button" onClick={()=>activate("cpanel")}>Control Panel</button>
            <hr/>
            <button role="menuitem" type="button" onClick={()=>onPower("LOG_OFF")}>Log off</button>
            <button role="menuitem" type="button" onClick={()=>onPower("RESTART")}>Restart</button>
            <button role="menuitem" type="button" onClick={()=>onPower("SHUTDOWN")}>Shut down</button>
          </>:<>
            <button role="menuitem" type="button" disabled title="Source Support integration pending">Support</button>
            <button role="menuitem" type="button" onClick={()=>activate("about")}>About</button>
          </>}
        </div>}
      </div>)}
    </nav>
    <div className="source-win31-program-manager__body"
      data-test-win31-manager-body=""
      onClick={()=>{if(activeMenu)setActiveMenu(null);}}>
      <div className="source-win31-program-manager__groups">
        {GROUPS.map(group=><button key={group.id} type="button"
          className="source-win31-program-manager__group-button"
          data-test-win31-group={group.id}
          aria-expanded={opened.includes(group.id)}
          onClick={()=>toggleGroup(group.id)}>
          <img width={32} height={32} alt="" src={legacySourceIconArtwork("programs").src}/>
          <span className="source-win31-program-manager__group-label">{group.label}</span>
        </button>)}
      </div>
      {opened.map((id,index)=>{
        const group=GROUPS.find(entry=>entry.id===id)!;
        const max=maximizedGroups.includes(id);
        return <section key={id}
          className={"source-win31-program-manager__child"+(max?" is-maximized":"")}
          data-test-win31-group-window={id}
          style={{zIndex:10+index,
            ...(max?{}:{left:12+(index%3)*26,top:83+(index%3)*20})}}
          aria-label={group.label}
          onPointerDown={()=>bringFront(id)}>
          <header className="source-win31-program-manager__child-title">
            <strong>{group.label}</strong>
            <div className="source-win31-program-manager__controls">
              <button type="button" data-test-win31-group-maximize={id}
                aria-label={(max?"Restore ":"Maximize ")+group.label}
                onClick={()=>toggleGroupMax(id)}>{max?"❐":"□"}</button>
              <button type="button" data-test-win31-group-close={id}
                aria-label={"Close "+group.label} onClick={()=>closeGroup(id)}>×</button>
            </div>
          </header>
          <div className="source-win31-program-manager__child-body">
            {groupEntries(id).map(app=><button type="button" key={app.id}
              className="source-win31-program-manager__group-button"
              data-test-win31-program={app.id}
              onClick={()=>activate(app.id)}
              onContextMenu={event=>onContext(event,app.id)}>
              <img src={sourceThemeProgramArt("win31",app.id)??app.icon}
                width={32} height={32} alt=""/>
              <span className="source-win31-program-manager__group-label">{app.label}</span>
            </button>)}
            {groupEntries(id).length===0&&
              <p className="source-win31-program-manager__empty">No recently opened programs.</p>}
          </div>
        </section>;
      })}
    </div>
  </section>;
}

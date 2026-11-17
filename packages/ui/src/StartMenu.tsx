import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type MouseEvent as ReactMouseEvent } from "react";
import {createPortal} from "react-dom";
import type { DesktopAction, ThemeId } from "@windows-os/contracts";
import "./sourceStartMenuThemes.css";
import {legacyArt,legacySourceIconArtwork,legacySourceCustomIconURL,sourceShellAsset,legacyXpPowerArtwork,sourceThemeProgramArt} from "@windows-os/assets";
import {
  parseSourceShortcut, readSourceShortcutText, SOURCE_START_MENU_PROGRAMS,
  sourceProgramsById, type FileEntry
} from "@windows-os/filesystem";
import {appRegistry,fileStore,sourceFilesystemRuntime,sourceRecentPrograms} from "@windows-os/sdk";
import {createSourceDesktopShortcut} from "./desktopCreate";
import {sourceDesktopItemMenu,type SourceDesktopItemMenuAction} from "./sourceDesktopItemMenu";
import {sourceDesktopMenuPosition} from "./sourceDesktopMenuPosition";
import {sourceMenuArrowFocus} from "./sourceMenuKeyboard";
import {taskbarPins} from "./sourceTaskbarPins";
import {sourceWin11PageCount,sourceWin11StartPage,sourceWin11NextStartPage} from "./sourceWin11StartPaging";

interface StartMenuProps {
  dispatch: Dispatch<DesktopAction>;
  onEscapeClose():void;
  theme?:ThemeId;
}
interface StartProgramContext{
  id:string;x:number;y:number;
}
interface InstalledShortcut {
  path: string;
  programId: string;
  name: string;
  icon: string;
  iconKey: string;
  artwork: "original" | "fallback" | "custom";
}
async function readShortcuts(entries: FileEntry[]): Promise<InstalledShortcut[]> {
  const files = entries.filter(entry => entry.type === "file" && /\.lnk$/i.test(entry.name));
  const shortcuts = await Promise.all(files.map(async entry => {
    try {
      const data=parseSourceShortcut(await readSourceShortcutText(fileStore,entry.uri));
      const source=data&&sourceProgramsById.get(data.exe);
      if(!data||!source)return null;
      const artwork=legacySourceIconArtwork(data.icon);
      return {
        path:entry.uri,programId:data.exe,name:source.name,
        iconKey:data.icon,icon:artwork.src,
        artwork:artwork.exactSourceArtwork?"original":
          legacySourceCustomIconURL(data.icon)?"custom":"fallback"
      };
    } catch { return null; }
  }));
  return shortcuts.filter((x): x is InstalledShortcut => x !== null);
}

/** The original All Programs tree is populated from installed .lnk files. */
export function StartMenu({dispatch,onEscapeClose,theme="win7"}:StartMenuProps){
  const menuRef=useRef<HTMLElement>(null);
  const contextRef=useRef<HTMLDivElement>(null);
  const [programContext,setProgramContext]=useState<StartProgramContext|null>(null);
  const [contextPosition,setContextPosition]=useState({x:0,y:0});
  const [contextError,setContextError]=useState("");
  const [pins,setPins]=useState(()=>taskbarPins.snapshot());
  const [recentIds,setRecentIds]=useState(()=>sourceRecentPrograms.snapshot());
  useEffect(()=>taskbarPins.subscribe(setPins),[]);
  useEffect(()=>sourceRecentPrograms.subscribe(setRecentIds),[]);
  const [query, setQuery] = useState("");
  const [allPrograms, setAllPrograms] = useState(false);
  const [win11Page,setWin11Page]=useState(1);
  const win11TouchY=useRef<number|null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<FileEntry[]>([]);
  const [installed, setInstalled] = useState<InstalledShortcut[]>([]);
  const [loadError, setLoadError] = useState("");
  const programs = appRegistry.startMenu().filter(app =>
    app.label.toLowerCase().includes(query.toLowerCase())
  );
  const win11PageCount=sourceWin11PageCount(programs.length);
  const win11Paged=theme==="win11"&&!query&&!allPrograms;
  const visiblePrograms=win11Paged?sourceWin11StartPage(programs,win11Page):programs;
  const changeWin11Page=(delta:number)=>{
    setWin11Page(page=>sourceWin11NextStartPage(page,win11PageCount,delta));
  };
  const recentApps=recentIds.flatMap(id=>{
    const app=appRegistry.get(id);
    return app?[app]:[];
  }).slice(0,theme==="winxp"?7:6);
  useEffect(() => {
    if (!allPrograms) return;
    let active = true;
    const load = async () => {
      try {
        const path = activeFolder ?? SOURCE_START_MENU_PROGRAMS;
        const entries = await fileStore.list(path);
        const shortcuts = await readShortcuts(entries);
        if (!active) return;
        setFolders(entries.filter(entry => entry.type === "directory"));
        setInstalled(shortcuts);
        setLoadError("");
      } catch (error) {
        if (!active) return;
        setFolders([]);
        setInstalled([]);
        setLoadError(error instanceof Error ? error.message : "Cannot list programs");
      }
    };
    void load();
    const unsubscribe = fileStore.subscribe(() => { void load(); });
    return () => { active = false; unsubscribe(); };
  }, [allPrograms, activeFolder]);

  useLayoutEffect(()=>{
    if(!programContext||!contextRef.current)return;
    const element=contextRef.current;
    const align=()=>setContextPosition(sourceDesktopMenuPosition(
      {x:programContext.x,y:programContext.y},
      {width:element.offsetWidth,height:element.offsetHeight},
      {width:window.innerWidth,height:window.innerHeight}));
    align();
    window.addEventListener("resize",align);
    return ()=>window.removeEventListener("resize",align);
  },[programContext]);
  const openProgramContext=(event:ReactMouseEvent<HTMLButtonElement>,id:string)=>{
    if(!appRegistry.get(id))return;
    event.preventDefault();event.stopPropagation();
    setContextError("");
    setProgramContext({id,x:event.clientX,y:event.clientY});
  };
  const contextProgram=programContext?appRegistry.get(programContext.id):null;
  const programActions=contextProgram?sourceDesktopItemMenu({
    id:contextProgram.id,isFile:false,multiple:false,
    canPin:true,pinned:pins.includes(contextProgram.id),
    programInstalled:Boolean(sourceProgramsById.get(contextProgram.id)?.installPath)
  }):[];
  const actOnProgram=(action:SourceDesktopItemMenuAction)=>{
    const app=contextProgram;
    if(!app){setProgramContext(null);return;}
    setProgramContext(null);
    if(action==="open"){dispatch({type:"OPEN_APP",app});return;}
    if(action==="pin"){taskbarPins.toggle(app.id);return;}
    if(action==="send-desktop"){
      const desktop=sourceFilesystemRuntime.snapshot()?.desktopPath;
      if(!desktop){setContextError("Guest Desktop is not mounted.");return;}
      void createSourceDesktopShortcut(fileStore,desktop,app.id,app.label)
        .then(()=>setContextError(""))
        .catch(error=>setContextError(error instanceof Error
          ?error.message:"Could not create original Desktop shortcut"));
    }
  };
  useEffect(()=>{
    const outside=(event:PointerEvent)=>{
      if(!(event.target instanceof Node))return;
      if(menuRef.current?.contains(event.target))return;
      if(event.target instanceof Element
        &&event.target.closest("[data-test-start-program-context]"))return;
      const start=document.querySelector('[data-test-start-button]');
      if(start?.contains(event.target))return;
      dispatch({type:"CLOSE_START"});
    };
    const escape=(event:KeyboardEvent)=>{
      if(event.key!=="Escape")return;
      event.preventDefault();
      if(programContext){
        const id=programContext.id;
        setProgramContext(null);
        window.requestAnimationFrame(()=>{
          const escaped=typeof CSS!=="undefined"&&CSS.escape?CSS.escape(id):id;
          menuRef.current?.querySelector<HTMLButtonElement>(
            '[data-test-program="'+escaped+'"],[data-test-source-program="'+escaped+'"]'
          )?.focus({preventScroll:true});
        });
        return;
      }
      // DesktopShell restores taskbar focus after the Start input has
      // actually unmounted, using a commit-time layout effect.
      onEscapeClose();
    };
    window.addEventListener("pointerdown",outside);
    window.addEventListener("keydown",escape);
    return ()=>{
      window.removeEventListener("pointerdown",outside);
      window.removeEventListener("keydown",escape);
    };
  },[dispatch,programContext,onEscapeClose]);
  const openApp = (appId: string) => {
    const app = appRegistry.get(appId);
    if (app) dispatch({ type: "OPEN_APP", app });
  };
  const recentSection=(theme==="winxp"||theme==="win11")&&
    !allPrograms&&!query&&recentApps.length>0&&
    <section className="windows-startmenu__recent"
      aria-label="Recently opened programs" data-test-list-recent="">
      {theme==="win11"&&<strong>Recently opened</strong>}
      <div className="windows-startmenu__recent-grid">
        {recentApps.map(app=><button key={app.id} type="button"
          data-test-recent-program={app.id}
          aria-label={"Recently opened "+app.label}
          onClick={()=>openApp(app.id)}
          onContextMenu={event=>openProgramContext(event,app.id)}>
          <img src={sourceThemeProgramArt(theme,app.id)??app.icon}
            width={28} height={28} alt=""/>
          <span>{app.label}</span>
        </button>)}
      </div>
    </section>;
  return (<>
    <nav className={"windows-startmenu" +
      (theme==="winxp"?" windows-startmenu--winxp":
      theme==="win11"?" windows-startmenu--win11":"") +
      (allPrograms&&!query?" is-all-programs":"")}
      data-source-start-theme={theme}
      id="start-menu" ref={menuRef} data-test-start-menu="" aria-label="Start menu">
      {theme==="winxp"&&<header className="windows-startmenu__xp-header"
        data-test-startmenu-xp-header="">
        <img src={legacyArt.guestAvatar} alt="" width={48} height={48}/>
        <strong>Guest</strong>
      </header>}
      <div className="windows-startmenu__left">
        {theme==="winxp"&&recentSection}
        <div className="windows-startmenu__programs"
          onWheel={event=>{
            if(!win11Paged||event.deltaY===0)return;
            event.preventDefault();
            changeWin11Page(event.deltaY>0?1:-1);
          }}
          onTouchStart={event=>{
            if(!win11Paged)return;
            win11TouchY.current=event.touches[0]?.clientY??null;
          }}
          onTouchEnd={event=>{
            if(!win11Paged||win11TouchY.current===null)return;
            const delta=win11TouchY.current-(event.changedTouches[0]?.clientY??win11TouchY.current);
            win11TouchY.current=null;
            if(Math.abs(delta)>45)changeWin11Page(delta>0?1:-1);
          }}>
          {allPrograms && !query ? <>
            <button type="button" className="windows-startmenu__program"
              onClick={() => activeFolder ? setActiveFolder(null) : setAllPrograms(false)}
              data-test-all-programs-back="">
              <span aria-hidden="true">◀</span>
              {activeFolder ? "Back to All Programs" : "Back"}
            </button>
            {folders.map(folder => <button key={folder.uri}
              type="button" data-test-source-program-folder={folder.name}
              className="windows-startmenu__program"
              onClick={() => setActiveFolder(folder.uri)}>
              <img src={sourceShellAsset(theme,"folder") ?? legacyArt.folder} width={30} height={30} alt="" />
              <span>{folder.name}</span>
              <span className="windows-startmenu__chevron" aria-hidden="true">▸</span>
            </button>)}
            {installed.map(shortcut => {
              const app = appRegistry.get(shortcut.programId);
              return <button type="button" key={shortcut.path}
                data-test-source-program={shortcut.programId}
                data-source-shortcut-path={shortcut.path}
                data-source-program-icon-key={shortcut.iconKey}
                data-source-program-artwork={sourceThemeProgramArt(theme,shortcut.iconKey)?"original":shortcut.artwork}
                className="windows-startmenu__program"
                disabled={!app}
                title={app ? shortcut.name : shortcut.name + " — migration pending"}
                onClick={() => openApp(shortcut.programId)}
                onContextMenu={event=>openProgramContext(event,shortcut.programId)}>
                <img src={sourceThemeProgramArt(theme,shortcut.iconKey)??shortcut.icon}
                  width={30} height={30} alt="" />
                <span>{shortcut.name}</span>
              </button>;
            })}
            {loadError && <p role="alert" className="windows-startmenu__empty">{loadError}</p>}
            {!loadError && !folders.length && !installed.length &&
              <p className="windows-startmenu__empty">No installed programs in this folder.</p>}
          </> : <>
            {visiblePrograms.map(app => (
              <button key={app.id} data-test-program={app.id}
                className="windows-startmenu__program"
                onClick={() => dispatch({ type: "OPEN_APP", app })}
                onContextMenu={event=>openProgramContext(event,app.id)}>
                <img src={sourceThemeProgramArt(theme,app.id)??app.icon}
                  width={30} height={30} alt="" />
                <span>{app.label}</span>
              </button>
            ))}
            {!programs.length && <p className="windows-startmenu__empty">No items match your search.</p>}
          </>}
        </div>
        {win11Paged&&win11PageCount>1&&
          <nav className="windows-startmenu__win11-pages"
            data-test-win11-start-pages="" aria-label="Program pages">
            {Array.from({length:win11PageCount},(_,index)=>index+1)
              .map(page=><button key={page} type="button"
                aria-label={"Program page "+page}
                aria-current={page===win11Page?"page":undefined}
                data-test-win11-start-page={page}
                onClick={()=>setWin11Page(page)}>
                <span aria-hidden="true"/>
              </button>)}
          </nav>}
        {theme==="win11"&&recentSection}
        {contextError&&<p role="alert" data-test-start-context-error=""
          className="windows-startmenu__empty">{contextError}</p>}
        {!query && <button type="button" className="windows-startmenu__all-programs"
          data-test-all-programs=""
          onClick={() => { setAllPrograms(!allPrograms); setActiveFolder(null);setWin11Page(1); }}>
          {allPrograms ? "‹ Back" : "All Programs ▸"}
        </button>}
        {theme!=="winxp"&&<label className="windows-startmenu__search">
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search programs and files" aria-label="Search programs and files"
            data-test-startmenu-search="" autoFocus
            onKeyDown={event=>{
              if(event.key!=="Enter"||!programs.length)return;
              event.preventDefault();
              dispatch({type:"OPEN_APP",app:programs[0]});
            }}/>
          <span>⌕</span>
        </label>}
      </div>
      <div className="windows-startmenu__right">
        {theme!=="winxp"&&<img src={legacyArt.guestAvatar}
          alt="Guest" className="windows-startmenu__avatar" />}
        {theme!=="winxp"&&<strong>Guest</strong>}
        <hr />
        <button data-test-open-games="" onClick={() => {
          const games=appRegistry.get("games");
          if(games)dispatch({type:"OPEN_APP",app:games});
        }}>Games</button>
        <button onClick={() => dispatch({ type: "OPEN_APP", app: appRegistry.get("computer")! })}>Computer</button>
        <button data-test-open-cpanel="" onClick={() => {
          const panel=appRegistry.get("cpanel");
          if(panel)dispatch({type:"OPEN_APP",app:panel});
        }}>Control Panel</button>
        <button onClick={() => dispatch({ type: "OPEN_APP", app: appRegistry.get("web_contacts")! })}>Contacts</button>
        <hr />
        {theme!=="winxp"&&<button onClick={() => dispatch({ type: "LOG_OFF" })}>
          Log off</button>}
        {theme!=="winxp"&&<button className="windows-startmenu__power"
          onClick={() => dispatch({ type: "SHUTDOWN" })}>Shut down</button>}
      </div>
      {theme==="winxp"&&<footer className="windows-startmenu__xp-footer"
        data-test-startmenu-xp-footer="">
        <button type="button" onClick={() => dispatch({type:"LOG_OFF"})}>
          <img src={legacyXpPowerArtwork.logoff} width={20} height={20} alt="" />Log off</button>
        <button type="button" onClick={() => dispatch({type:"SHUTDOWN"})}>
          <img src={legacyXpPowerArtwork.shutdown} width={20} height={20} alt="" />Turn off computer</button>
      </footer>}
    </nav>
    {programContext&&contextProgram&&createPortal(
      <div ref={contextRef} role="menu" aria-label={"Program actions for "+contextProgram.label}
        data-test-start-program-context={contextProgram.id}
        data-source-start-context-theme={theme}
        className="windows-startmenu__context"
        style={{left:contextPosition.x,top:contextPosition.y}}
        onKeyDown={event=>{
          if(sourceMenuArrowFocus(contextRef.current,event.target,event.key))
            event.preventDefault();
        }}>
        {programActions.map(action=><button type="button" key={action.id}
          role="menuitem" disabled={action.disabled}
          data-test-start-context-action={action.id}
          title={action.disabled?"Original action not yet migrated":undefined}
          onClick={()=>actOnProgram(action.id)}>{action.label}</button>)}
      </div>,document.body)}
  </>);
}

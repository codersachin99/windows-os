import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type MouseEvent as ReactMouseEvent } from "react";
import {createPortal} from "react-dom";
import {sourceIsXpFamily,sourceIsAeroFamily,type DesktopAction,type ThemeId} from "@windows-os/contracts";
import "./sourceStartMenuThemes.css";
import "./sourceStartContextThemes.css";
import {legacyArt,legacySourceIconArtwork,legacySourceCustomIconURL,sourceShellAsset,legacyXpPowerArtwork,sourceThemeProgramArt,sourceWin7StartLibraryIcon,type SourceWin7LibraryKey} from "@windows-os/assets";
import {
  parseSourceShortcut,readSourceShortcutText,
  SOURCE_START_MENU_PROGRAMS,sourcePrograms,
  sourceProgramsById, SOURCE_WIN2K_START_SEARCH_PATH, getParentDirectory, type FileEntry
} from "@windows-os/filesystem";
import {appRegistry,fileStore,sourceFilesystemRuntime,sourceRecentPrograms,sourceStartPreferences} from "@windows-os/sdk";
import {createSourceDesktopShortcut} from "./desktopCreate";
import {sourceDesktopItemMenu,type SourceDesktopItemMenuAction} from "./sourceDesktopItemMenu";
import {sourceDesktopMenuPosition} from "./sourceDesktopMenuPosition";
import {sourceMenuArrowFocus} from "./sourceMenuKeyboard";
import {taskbarPins} from "./sourceTaskbarPins";
import {sourceWin11PageCount,sourceWin11StartPage,sourceWin11NextStartPage} from "./sourceWin11StartPaging";
import {sourceWin11AllAppItems} from "./sourceWin11AllApps";
import {SourceWin8StartScreen} from "./SourceWin8StartScreen";
import {SourceWin31ProgramManager} from "./SourceWin31ProgramManager";
import {SourceWin9xStartMenu} from "./SourceWin9xStartMenu";
import {SourceChromeOSLauncher} from "./SourceChromeOSLauncher";
import {SourceMacOSLaunchpad} from "./SourceMacOSLaunchpad";
import {SourceUbuntuLaunchpad} from "./SourceUbuntuLaunchpad";
import {SourceKubuntuStartMenu} from "./SourceKubuntuStartMenu";
import {SourceHistoricalProgramsFlyout} from "./SourceHistoricalProgramsFlyout";
import {openGuestSearchFile} from "./sourceGuestSearchOpen";

interface StartMenuProps {
  dispatch: Dispatch<DesktopAction>;
  onEscapeClose():void;
  theme?:ThemeId;
  wallpaper?:string;
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
export function StartMenu({dispatch,onEscapeClose,theme="win7",wallpaper}:StartMenuProps){
  const isLonghornWhistler=theme==="winLS"||theme==="winLP"||theme==="winW";
  const isXpTheme=sourceIsXpFamily(theme)||isLonghornWhistler;
  // Pinned startmenu-base.js supplies recent programs and configured
  // power actions to the shared Win7 renderer, including Vista's
  // isVista/searchStyle variant and all Aero/Basic skins.
  const isWin7StartFamily=theme==="win7"||theme==="winvista"||
    sourceIsAeroFamily(theme)||theme==="basic-1"||theme==="basic-2"||
    theme==="basic-3"||theme==="basic-4";
  const isWin11Theme=theme==="win11"||theme==="win11dark";
  const menuRef=useRef<HTMLElement>(null);
  const startSearchRef=useRef<HTMLInputElement>(null);
  const libraryHoverTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [libraryPreview,setLibraryPreview]=useState<SourceWin7LibraryKey|null>(null);
  // Frozen startmenu-base.js showLinkIcon(key) waits 400 ms before
  // replacing the Guest avatar with a real source "start-docs/pics/music"
  // preview; isBaseTheme disables this avatar preview region entirely.
  const previewWin7Library=(key:SourceWin7LibraryKey|null)=>{
    if(libraryHoverTimer.current!==null)clearTimeout(libraryHoverTimer.current);
    libraryHoverTimer.current=null;
    if(!isWin7StartFamily||theme.startsWith("basic-"))return;
    libraryHoverTimer.current=setTimeout(()=>{
      setLibraryPreview(key);
      libraryHoverTimer.current=null;
    },400);
  };
  useEffect(()=>()=>{if(libraryHoverTimer.current!==null)
    clearTimeout(libraryHoverTimer.current);},[]);
  const contextRef=useRef<HTMLDivElement>(null);
  // The same popup is opened by Win31, Win9x, Win8 and modern Start
  // program buttons. Keep the actual button, not a Win7-only selector.
  const contextTriggerRef=useRef<HTMLButtonElement|null>(null);
  const win11PowerRef=useRef<HTMLDivElement>(null);
  const [win11PowerOpen,setWin11PowerOpen]=useState(false);
  const [win10SidebarExpanded,setWin10SidebarExpanded]=useState(false);
  const [win10PowerOpen,setWin10PowerOpen]=useState(false);
  const [win10AccountOpen,setWin10AccountOpen]=useState(false);
  const [programContext,setProgramContext]=useState<StartProgramContext|null>(null);
  const [contextPosition,setContextPosition]=useState({x:0,y:0});
  const [contextError,setContextError]=useState("");
  const [pins,setPins]=useState(()=>taskbarPins.snapshot());
  const [recentIds,setRecentIds]=useState(()=>sourceRecentPrograms.snapshot());
  const [startPreferences,setStartPreferences]=useState(()=>sourceStartPreferences.snapshot());
  useEffect(()=>taskbarPins.subscribe(setPins),[]);
  useEffect(()=>sourceRecentPrograms.subscribe(setRecentIds),[]);
  useEffect(()=>sourceStartPreferences.subscribe(setStartPreferences),[]);
  const [query, setQuery] = useState("");
  // Frozen startmenu-base.js Win7/Vista watcher: when Start opens, call
  // focusSearch ONLY on non-touch devices. Avoid virtual keyboard popups
  // on touch and preserve existing focus rules in the other Start families.
  useLayoutEffect(()=>{
    if(!isWin7StartFamily)return;
    const touch=navigator.maxTouchPoints>0||
      window.matchMedia("(pointer: coarse)").matches;
    if(!touch)startSearchRef.current?.focus({preventScroll:true});
  },[isWin7StartFamily]);
  const [allPrograms, setAllPrograms] = useState(false);
  const [historicalFlyoutOpen,setHistoricalFlyoutOpen]=useState(false);
  const historicalTriggerRef=useRef<HTMLButtonElement>(null);
  const [win11Page,setWin11Page]=useState(1);
  const win11TouchY=useRef<number|null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<FileEntry[]>([]);
  const [installed, setInstalled] = useState<InstalledShortcut[]>([]);
  const [loadError, setLoadError] = useState("");
  const win11AllApps=sourceWin11AllAppItems(sourcePrograms,appRegistry.list());
  const programs = appRegistry.startMenu().filter(app =>
    app.label.toLowerCase().includes(query.toLowerCase())
  );
  const win11PageCount=sourceWin11PageCount(programs.length);
  const win11Paged=isWin11Theme&&!query&&!allPrograms;
  const visiblePrograms=win11Paged?sourceWin11StartPage(programs,win11Page):programs;
  const changeWin11Page=(delta:number)=>{
    setWin11Page(page=>sourceWin11NextStartPage(page,win11PageCount,delta));
  };
  const recentApps=recentIds.flatMap(id=>{
    const app=appRegistry.get(id);
    return app?[app]:[];
  }).slice(0,isXpTheme?7:6);
  useEffect(() => {
    if (!allPrograms||isWin11Theme) return;
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
  }, [allPrograms, activeFolder, theme]);

  useLayoutEffect(()=>{
    if(!programContext||!contextRef.current)return;
    const element=contextRef.current;
    // Original winui-menu is keyboard-navigable: focus its first enabled
    // action so ArrowUp/Down and Escape work after pointer right-click.
    element.querySelector<HTMLButtonElement>(
      'button[role="menuitem"]:not(:disabled)'
    )?.focus({preventScroll:true});
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
    setWin11PowerOpen(false);
    contextTriggerRef.current=event.currentTarget;
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
    if(!win11PowerOpen)return;
    const outside=(event:PointerEvent)=>{
      if(!(event.target instanceof Node)||!win11PowerRef.current?.contains(event.target))
        setWin11PowerOpen(false);
    };
    window.addEventListener("pointerdown",outside);
    return ()=>window.removeEventListener("pointerdown",outside);
  },[win11PowerOpen]);
  useEffect(()=>{
    const outside=(event:PointerEvent)=>{
      if(!(event.target instanceof Node))return;
      if(menuRef.current?.contains(event.target))return;
      if(event.target instanceof Element
        &&event.target.closest("[data-test-start-program-context],[data-test-historical-programs-flyout]"))return;
      const start=document.querySelector('[data-test-start-button]');
      if(start?.contains(event.target)||event.target instanceof Element&&event.target.closest("[data-test-activities-button]"))return;
      dispatch({type:"CLOSE_START"});
    };
    const escape=(event:KeyboardEvent)=>{
      if(event.key!=="Escape")return;
      event.preventDefault();
      if(programContext){
        const id=programContext.id;
        setProgramContext(null);
        window.requestAnimationFrame(()=>{
          // Portaled menus live under document.body and buttons differ
          // across Win31 groups, Win9x cascades, Win8 tiles, Win10
          // recents and Win7/XP/11 program grids.
          const trigger=contextTriggerRef.current;
          if(trigger?.isConnected){
            trigger.focus({preventScroll:true});
            return;
          }
          const escaped=typeof CSS!=="undefined"&&CSS.escape?CSS.escape(id):id;
          menuRef.current?.querySelector<HTMLButtonElement>(
            '[data-test-program="'+escaped+'"],[data-test-source-program="'+escaped+'"]'
          )?.focus({preventScroll:true});
        });
        return;
      }
      if(historicalFlyoutOpen){
        setHistoricalFlyoutOpen(false);
        historicalTriggerRef.current?.focus({preventScroll:true});
        return;
      }
      if(win11PowerOpen){
        setWin11PowerOpen(false);
        return;
      }
      if(win10PowerOpen||win10AccountOpen){
        setWin10PowerOpen(false);
        setWin10AccountOpen(false);
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
  },[dispatch,programContext,historicalFlyoutOpen,win11PowerOpen,win10PowerOpen,win10AccountOpen,onEscapeClose]);
  const openApp = (appId: string) => {
    const app = appRegistry.get(appId);
    if (app) dispatch({ type: "OPEN_APP", app });
  };
  /**
   * Frozen startmenu-base.js shortcuts(): Documents, Pictures and Music
   * each open Computer at this.userPath/<folder>, not Computer home.
   * Derive Guest's home from the permissioned Desktop mount; never route
   * a Start link to an unmounted or host filesystem path.
   */
  const openWin7StartLibrary=(folder:"Documents"|"Pictures"|"Music")=>{
    const desktop=sourceFilesystemRuntime.snapshot()?.desktopPath;
    const app=appRegistry.get("computer");
    if(!desktop||!app){
      setContextError("Guest Computer or home folder is not mounted.");
      return;
    }
    setContextError("");
    dispatch({type:"OPEN_APP",app,file:{path:getParentDirectory(desktop)+"/"+folder}});
  };
  /** Win8 Search uses the same Guest association boundary as Computer.
   * Shortcut links are resolved only against the Guest VFS, with a depth
   * limit so self-referential or cyclic links cannot hang Start.
   */
  const openSearchFile=(entry:FileEntry)=>openGuestSearchFile(dispatch,entry);
  // Source startmenu-base.js also renders a recent-program list on Win7.
  // Preserve the existing launch grid pending complete Win7 structural parity.
  const recentSection=startPreferences.storeRecentApps&&
    (isWin7StartFamily||isXpTheme||isWin11Theme)&&
    !allPrograms&&!query&&recentApps.length>0&&
    <section className="windows-startmenu__recent"
      aria-label="Recently opened programs" data-test-list-recent="">
      {isWin11Theme&&<strong>Recently opened</strong>}
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
    {theme==="chromeos"?
      <SourceChromeOSLauncher rootRef={menuRef} items={win11AllApps} recentIds={startPreferences.storeRecentApps?recentIds:[]}
        dispatch={dispatch} onLaunch={openApp} onOpenFile={openSearchFile} onContext={openProgramContext}/>:
    theme==="kubuntu"?
      <SourceKubuntuStartMenu rootRef={menuRef} items={win11AllApps} recentIds={startPreferences.storeRecentApps?recentIds:[]}
        dispatch={dispatch} onLaunch={openApp} onOpenFile={openSearchFile} onContext={openProgramContext}/>:
    theme==="ubuntu"?
      <SourceUbuntuLaunchpad rootRef={menuRef} items={win11AllApps} dispatch={dispatch}
        onLaunch={openApp} onOpenFile={openSearchFile} onContext={openProgramContext}
        onClose={()=>dispatch({type:"CLOSE_START"})}/>:
    theme==="macos"?
      <SourceMacOSLaunchpad rootRef={menuRef} wallpaper={wallpaper}
        items={win11AllApps} onLaunch={openApp} onContext={openProgramContext}
        onClose={()=>dispatch({type:"CLOSE_START"})}/>:
    (theme==="win8"||theme==="win81")?
      <SourceWin8StartScreen theme={theme} rootRef={menuRef}
        wallpaper={wallpaper} programs={appRegistry.startMenu()}
        onLaunch={openApp} onOpenFile={openSearchFile}
        onContext={openProgramContext}
        onClose={()=>dispatch({type:"CLOSE_START"})}
        onPower={type=>dispatch({type})}/>:
    theme==="win31"?
      <SourceWin31ProgramManager rootRef={menuRef}
        programs={appRegistry.list()} recent={recentApps}
        onLaunch={openApp} onContext={openProgramContext}
        onClose={()=>dispatch({type:"CLOSE_START"})}
        onPower={type=>dispatch({type})}/>:
    (theme==="win95"||theme==="win98"||theme==="win2k")?
      <SourceWin9xStartMenu theme={theme} rootRef={menuRef}
        programs={appRegistry.startMenu()} onLaunch={openApp}
        onSearch={()=>{
          if(theme!=="win2k"){openApp("find");return;}
          // Frozen startmenu-win9x.js: OpenWindow computer with
          // file:{path:null,search:true}, not ordinary Computer.
          const app=appRegistry.get("computer");
          if(app)dispatch({type:"OPEN_APP",app,file:{path:SOURCE_WIN2K_START_SEARCH_PATH}});
          dispatch({type:"CLOSE_START"});
        }}
        onPower={type=>dispatch({type})}
        onContext={openProgramContext}/>:
    <nav className={"windows-startmenu" +
      (isXpTheme?" windows-startmenu--winxp":
      isWin11Theme?" windows-startmenu--win11":
      theme==="win10"?" windows-startmenu--win10":"") +
      (allPrograms&&!query?" is-all-programs":"")+
      (theme==="win10"&&win10SidebarExpanded?" is-win10-sidebar-expanded":"")}
      data-source-start-theme={theme}
      id="start-menu" ref={menuRef} data-test-start-menu="" aria-label="Start menu">
      {isXpTheme&&<header className="windows-startmenu__xp-header"
        data-test-startmenu-xp-header="">
        {theme!=="winW"&&<img src={legacyArt.guestAvatar} alt="" width={48} height={48}/> }
        <strong>Guest</strong>
      </header>}
      {theme==="win10"&&<aside className="windows-startmenu__win10-sidebar"
        data-test-win10-start-sidebar=""
        data-expanded={win10SidebarExpanded?"true":"false"}
        onPointerEnter={event=>{
          if(event.pointerType!=="touch")setWin10SidebarExpanded(true);
        }}
        onPointerLeave={()=>setWin10SidebarExpanded(false)}>
        <button type="button" className="windows-startmenu__win10-hamburger"
          data-test-win10-start-expand=""
          aria-label="Toggle Start sidebar"
          aria-expanded={win10SidebarExpanded}
          onClick={()=>setWin10SidebarExpanded(v=>!v)}>
          <span className="windows-startmenu__win10-rail-icon" aria-hidden="true">☰</span>
          <strong>START</strong>
        </button>
        <div className="windows-startmenu__win10-sidebar-bottom">
          <div className="windows-startmenu__win10-rail-group">
            <button type="button" aria-label="Guest account options"
              data-test-win10-start-account-toggle=""
              aria-expanded={win10AccountOpen}
              onClick={()=>{
                setWin10PowerOpen(false);setWin10AccountOpen(v=>!v);
              }}>
              <img src={legacyArt.guestAvatar} alt="" width={20} height={20}/>
              <span>Guest</span>
            </button>
            {win10AccountOpen&&<div className="windows-startmenu__win10-flyout"
              role="menu" data-test-win10-start-account-menu=""
              aria-label="Guest account options">
              <button type="button" role="menuitem"
                onClick={()=>dispatch({type:"SWITCH_USER"})}>Switch user</button>
              <button type="button" role="menuitem"
                onClick={()=>dispatch({type:"LOG_OFF"})}>Log off</button>
            </div>}
          </div>
          <button type="button" data-test-win10-start-documents=""
            aria-label="Open Documents" onClick={()=>openApp("computer")}>
            <img src={sourceShellAsset(theme,"computer")??legacyArt.computer}
              width={20} height={20} alt=""/><span>Documents</span>
          </button>
          <button type="button" data-test-win10-start-games=""
            aria-label="Open Games" onClick={()=>openApp("games")}>
            <img src={sourceThemeProgramArt(theme,"games")??legacyArt.games}
              width={20} height={20} alt=""/><span>Games</span>
          </button>
          <button type="button" data-test-win10-start-settings=""
            aria-label="Open Settings" onClick={()=>openApp("cpanel")}>
            <img src={sourceThemeProgramArt(theme,"cpanel")??legacyArt.cpanel}
              width={20} height={20} alt=""/><span>Settings</span>
          </button>
          <div className="windows-startmenu__win10-rail-group">
            <button type="button" data-test-win10-start-power-toggle=""
              aria-label="Power options" aria-expanded={win10PowerOpen}
              onClick={()=>{
                setWin10AccountOpen(false);setWin10PowerOpen(v=>!v);
              }}>
              <span className="windows-startmenu__win10-rail-icon" aria-hidden="true">⏻</span>
              <span>Power</span>
            </button>
            {win10PowerOpen&&<div className="windows-startmenu__win10-flyout"
              role="menu" data-test-win10-start-power-menu=""
              aria-label="Power options">
              <button role="menuitem" type="button" data-test-win10-start-power="logoff"
                onClick={()=>dispatch({type:"LOG_OFF"})}>Log off</button>
              <button role="menuitem" type="button" data-test-win10-start-power="shutdown"
                onClick={()=>dispatch({type:"SHUTDOWN"})}>Shut down</button>
              <button role="menuitem" type="button" data-test-win10-start-power="restart"
                onClick={()=>dispatch({type:"RESTART"})}>Restart</button>
            </div>}
          </div>
        </div>
      </aside>}
      <div className="windows-startmenu__left">
        {(isXpTheme||isWin7StartFamily)&&recentSection}
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
            {isWin11Theme? win11AllApps.map(app=>{
              const registered=appRegistry.get(app.id);
              return <button key={app.id} type="button"
                className="windows-startmenu__program"
                data-test-win11-all-app={app.id}
                disabled={!app.available||!registered}
                title={app.available?app.label:app.label+" — migration pending"}
                onClick={()=>openApp(app.id)}
                onContextMenu={event=>openProgramContext(event,app.id)}>
                <img src={sourceThemeProgramArt(theme,app.id)
                  ??(registered?.icon ?? legacySourceIconArtwork(app.id).src)}
                  width={30} height={30} alt="" />
                <span className="windows-startmenu__program-name">{app.label}</span>
              </button>;
            }):<>
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
            </>}
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
        </div>
        {isWin11Theme&&recentSection}
        {contextError&&<p role="alert" data-test-start-context-error=""
          className="windows-startmenu__empty">{contextError}</p>}
        {!query && (isLonghornWhistler?<SourceHistoricalProgramsFlyout
          theme={theme} triggerRef={historicalTriggerRef} menuRef={menuRef}
          open={historicalFlyoutOpen} onOpenChange={setHistoricalFlyoutOpen}
          items={win11AllApps} contextOpen={Boolean(programContext)}
          onLaunch={openApp} onContext={openProgramContext}/>:<button type="button" className="windows-startmenu__all-programs"
          data-test-all-programs=""
          onClick={() => { setAllPrograms(!allPrograms); setActiveFolder(null);setWin11Page(1); }}>
          {allPrograms ? "‹ Back" : "All Programs ▸"}
        </button>)}
        {!isXpTheme&&<label className="windows-startmenu__search">
          <input ref={startSearchRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search programs and files" aria-label="Search programs and files"
            data-test-startmenu-search="" autoFocus={!isWin7StartFamily}
            onKeyDown={event=>{
              if(event.key!=="Enter"||!programs.length)return;
              event.preventDefault();
              dispatch({type:"OPEN_APP",app:programs[0]});
            }}/>
          <span>⌕</span>
        </label>}
      </div>
      <div className="windows-startmenu__right">
        {theme==="win10"&&<section className="windows-startmenu__win10-tiles"
          data-test-win10-start-tiles="" aria-label="Recently opened apps">
          {recentApps.map(app=><button type="button" key={app.id}
            data-test-win10-start-tile={app.id}
            onClick={()=>openApp(app.id)}
            onContextMenu={event=>openProgramContext(event,app.id)}
            title={app.label} aria-label={"Open recent "+app.label}>
            <img src={sourceThemeProgramArt(theme,app.id)??app.icon}
              width={32} height={32} alt=""/>
            <span>{app.label}</span>
          </button>)}
        </section>}
        {!isXpTheme&&(libraryPreview&&isWin7StartFamily&&!theme.startsWith("basic-")
          ?<img src={sourceWin7StartLibraryIcon(theme,libraryPreview)}
            alt="" aria-hidden="true" className="windows-startmenu__avatar windows-startmenu__source-preview"
            data-test-startmenu-library-preview={libraryPreview}
            data-source-artwork="original"/>
          :<img src={legacyArt.guestAvatar}
            alt="Guest" className="windows-startmenu__avatar" />)}
        {!isXpTheme&&<strong>Guest</strong>}
        {isWin11Theme&&<div className="windows-startmenu__win11-actions"
          data-test-win11-start-actions="">
          <button type="button" aria-label="Open Computer"
            title="Computer" data-test-win11-start-computer=""
            onClick={()=>openApp("computer")}>
            <img src={sourceShellAsset(theme,"computer")??legacyArt.computer}
              alt="" width={24} height={24} />
          </button>
          <button type="button" aria-label="Open Games"
            title="Games" data-test-startmenu-link="games"
            onClick={()=>openApp("games")}>
            <img src={sourceThemeProgramArt(theme,"games")??legacyArt.games}
              alt="" width={24} height={24}/>
          </button>
          <button type="button" aria-label="Open Control Panel"
            title="Control Panel" data-test-win11-start-cpanel=""
            onClick={()=>openApp("cpanel")}>
            <img src={sourceThemeProgramArt(theme,"cpanel")??legacyArt.cpanel}
              alt="" width={24} height={24}/>
          </button>
          <div className="windows-startmenu__win11-power" ref={win11PowerRef}>
            <button type="button" aria-label="Power Options"
              title="Power Options" aria-expanded={win11PowerOpen}
              aria-controls="win11-start-power-menu"
              data-test-win11-start-power-toggle=""
              onClick={()=>setWin11PowerOpen(v=>!v)}>
              <span aria-hidden="true" className="windows-startmenu__power-glyph">⏻</span>
            </button>
            {win11PowerOpen&&<div id="win11-start-power-menu" role="menu"
              className="windows-startmenu__win11-power-menu"
              data-test-win11-start-power-menu=""
              aria-label="Power Options">
              <button type="button" role="menuitem" onClick={()=>dispatch({type:"LOG_OFF"})}
                data-test-win11-start-power="logoff">Log off</button>
              <button type="button" role="menuitem" onClick={()=>dispatch({type:"SHUTDOWN"})}
                data-test-win11-start-power="shutdown">Shut down</button>
              <button type="button" role="menuitem" onClick={()=>dispatch({type:"RESTART"})}
                data-test-win11-start-power="restart">Restart</button>
            </div>}
          </div>
        </div>}
        <hr />
        {isWin7StartFamily&&(["Documents","Pictures","Music"] as const)
          .map(folder=><button type="button" key={folder}
            className="windows-startmenu__source-library-link"
            data-test-startmenu-link={folder.toLowerCase()}
            data-source-library-icon={sourceWin7StartLibraryIcon(theme,folder.toLowerCase() as SourceWin7LibraryKey)}
            onMouseEnter={()=>previewWin7Library(folder.toLowerCase() as SourceWin7LibraryKey)}
            onMouseLeave={()=>previewWin7Library(null)}
            onClick={()=>openWin7StartLibrary(folder)}>
            {folder}
          </button>)}
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
        {!isXpTheme&&<button onClick={() => dispatch({ type: "LOG_OFF" })}>
          Log off</button>}
        {isWin7StartFamily&&<button className="windows-startmenu__power"
          data-test-startmenu-power-action={startPreferences.powerButtonAction}
          onClick={() => {
            const actions={
              switchuser:"SWITCH_USER",logoff:"LOG_OFF",
              restart:"RESTART",shutdown:"SHUTDOWN"
            } as const;
            dispatch({type:actions[startPreferences.powerButtonAction]});
          }}>{({
            switchuser:"Switch user",logoff:"Log off",
            restart:"Restart",shutdown:"Shut down"
          } as const)[startPreferences.powerButtonAction]}</button>}
      </div>
      {isXpTheme&&<footer className="windows-startmenu__xp-footer"
        data-test-startmenu-xp-footer="">
        {isLonghornWhistler&&<button type="button" onClick={() => dispatch({type:"RESTART"})}>
          <img src={sourceThemeProgramArt(theme,"restart")??legacyXpPowerArtwork.shutdown} width={24} height={24} alt=""/>Restart</button>}
        <button type="button" onClick={() => dispatch({type:"LOG_OFF"})}>
          <img src={legacyXpPowerArtwork.logoff} width={20} height={20} alt="" />Log off</button>
        <button type="button" onClick={() => dispatch({type:"SHUTDOWN"})}>
          <img src={legacyXpPowerArtwork.shutdown} width={20} height={20} alt="" />Turn off computer</button>
      </footer>}
    </nav>}
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

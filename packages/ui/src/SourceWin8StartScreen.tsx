import {useEffect,useRef,useState,type MouseEvent as ReactMouseEvent,type RefObject} from "react";
import type {AppDefinition} from "@windows-os/contracts";
import {
  legacyArt,sourceShellWallpaper,sourceThemeLogonArtwork,sourceThemeProgramArt,
  sourceWin8ShellArtwork
} from "@windows-os/assets";
import "./sourceWin8StartScreen.css";

export type SourceWin8StartTheme="win8"|"win81";
type Win8PowerAction="LOG_OFF"|"RESTART"|"SHUTDOWN";
interface SourceWin8StartScreenProps{
  theme:SourceWin8StartTheme;
  rootRef:RefObject<HTMLElement|null>;
  wallpaper?:string;
  programs:readonly AppDefinition[];
  onLaunch(id:string):void;
  onContext:(event:ReactMouseEvent<HTMLButtonElement>,id:string)=>void;
  onClose():void;
  onPower(action:Win8PowerAction):void;
}

const sourceCoreTiles=[
  {id:"computer",label:"Computer"},
  {id:"games",label:"Games"},
  {id:"cpanel",label:"Control Panel"}
] as const;
const sourceCoreIds=new Set<string>(sourceCoreTiles.map(x=>x.id));

/** Pinned legacy-win7@26b9f0c src/modules/shell/startmenu-win8.js:
 * fullscreen Start heading, account menu, right search flyout, desktop
 * double-width tile, Computer/Games/Control Panel tiles and 6-item
 * groups of 120px/three-row program tiles.
 * App backend stays the same permissioned Guest desktop engine.
 */
export function SourceWin8StartScreen({
  theme,rootRef,wallpaper,programs,onLaunch,onContext,onClose,onPower
}:SourceWin8StartScreenProps){
  const [accountOpen,setAccountOpen]=useState(false);
  const [searching,setSearching]=useState(false);
  const [query,setQuery]=useState("");
  const inputRef=useRef<HTMLInputElement>(null);
  const accountRef=useRef<HTMLDivElement>(null);
  const startWallpaper=wallpaper??sourceShellWallpaper(theme);
  const matches=programs.filter(app=>app.label.toLowerCase()
    .includes(query.toLowerCase()));
  const tiles=programs.filter(app=>!sourceCoreIds.has(app.id));
  const groups=Array.from({length:Math.ceil(tiles.length/6)},(_,index)=>
    tiles.slice(index*6,index*6+6));
  useEffect(()=>{rootRef.current?.focus({preventScroll:true});},[rootRef]);
  useEffect(()=>{
    if(searching)inputRef.current?.focus({preventScroll:true});
  },[searching]);
  useEffect(()=>{
    if(!accountOpen)return;
    const outside=(event:PointerEvent)=>{
      if(!(event.target instanceof Node)||!accountRef.current?.contains(event.target))
        setAccountOpen(false);
    };
    document.addEventListener("pointerdown",outside);
    return ()=>document.removeEventListener("pointerdown",outside);
  },[accountOpen]);

  return <nav ref={rootRef} id="start-screen" tabIndex={-1}
    className="windows-startmenu windows-startmenu--win8"
    aria-label="Start menu" data-test-start-menu=""
    data-test-win8-start-screen="" data-source-start-theme={theme}
    style={{backgroundImage:"url("+JSON.stringify(sourceWin8ShellArtwork.startScreen)+")"}}
    onKeyDown={event=>{
      if(event.key==="Escape"&&(searching||accountOpen)){
        event.preventDefault();event.stopPropagation();
        if(searching){setSearching(false);setQuery("");}
        else setAccountOpen(false);
        rootRef.current?.focus({preventScroll:true});
        return;
      }
      if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey
        &&!(event.target instanceof HTMLInputElement)){
        event.preventDefault();setQuery(text=>text+event.key);
        setSearching(true);
      }
    }}>
    <header className="win8-start__header">
      <h2>Start</h2>
      <div className="win8-start__account" ref={accountRef}>
        <button type="button" className="win8-start__account-button"
          data-test-win8-start-account-toggle="" aria-expanded={accountOpen}
          onClick={()=>setAccountOpen(open=>!open)}>
          <span>Guest</span>
          <img src={sourceThemeLogonArtwork.win8.guest} width={40} height={40} alt=""/>
        </button>
        {accountOpen&&<div className="win8-start__account-menu" role="menu"
          data-test-win8-start-account-menu="" aria-label="Guest account options">
          <button role="menuitem" type="button" disabled
            title="Original account management is not yet migrated">
            Manage accounts</button>
          <button role="menuitem" type="button"
            data-test-win8-start-power="logoff"
            onClick={()=>onPower("LOG_OFF")}>Log off</button>
          <button role="menuitem" type="button"
            data-test-win8-start-power="restart"
            onClick={()=>onPower("RESTART")}>Restart</button>
          <button role="menuitem" type="button"
            data-test-win8-start-power="shutdown"
            onClick={()=>onPower("SHUTDOWN")}>Shut down</button>
        </div>}
      </div>
      <button type="button" className="win8-start__search-button"
        aria-label="Search" data-test-start-search-button=""
        aria-expanded={searching}
        onClick={()=>{
          setSearching(open=>!open);
          setAccountOpen(false);
        }}>
        <span aria-hidden="true">⌕</span>
      </button>
    </header>
    <div className="win8-start__groups" data-test-win8-start-groups=""
      onWheel={event=>{
        if(event.deltaY!==0&&event.currentTarget.scrollWidth>event.currentTarget.clientWidth)
          event.currentTarget.scrollLeft+=event.deltaY;
      }}>
      <section className="win8-start__group win8-start__group--core"
        aria-label="System tiles" data-test-win8-start-core="">
        <button type="button" className="win8-start__tile win8-start__tile--desktop"
          data-test-win8-start-desktop="" onClick={onClose}>
          <span className="win8-start__desktop-background"
            style={{backgroundImage:"url("+JSON.stringify(startWallpaper)+")"}}/>
          <span className="win8-start__tile-label">Desktop</span>
        </button>
        {sourceCoreTiles.map(tile=><button type="button" key={tile.id}
          className={"win8-start__tile win8-start__tile--"+tile.id}
          data-test-win8-start-core-tile={tile.id}
          onClick={()=>onLaunch(tile.id)}>
          <img src={sourceThemeProgramArt(theme,tile.id)
            ??programs.find(app=>app.id===tile.id)?.icon
            ??({computer:legacyArt.computer,games:legacyArt.games,cpanel:legacyArt.cpanel} as const)[tile.id]}
            width={44} height={44} alt=""/>
          <span className="win8-start__tile-label">{tile.label}</span>
        </button>)}
      </section>
      {groups.map((group,index)=><section className="win8-start__group"
        key={index} aria-label={"Programs group "+(index+1)}
        data-test-win8-start-group={index+1}>
        {group.map(app=><button type="button"
          className="win8-start__tile win8-start__tile--app"
          key={app.id} data-test-program={app.id}
          onClick={()=>onLaunch(app.id)}
          onContextMenu={event=>onContext(event,app.id)}>
          <img src={sourceThemeProgramArt(theme,app.id)??app.icon}
            width={44} height={44} alt=""/>
          <span className="win8-start__tile-label">{app.label}</span>
        </button>)}
      </section>)}
    </div>
    {searching&&<aside className="win8-start__flyout"
      role="search" data-test-win8-start-flyout="">
      <h3>Search</h3>
      <label htmlFor="win8-start-query">Everywhere</label>
      <input id="win8-start-query" type="search" ref={inputRef}
        aria-label="Search programs and files" data-test-startmenu-search=""
        placeholder="Search apps" value={query}
        onChange={event=>setQuery(event.target.value)}
        onKeyDown={event=>{
          if(event.key==="Enter"&&matches.length){
            event.preventDefault();onLaunch(matches[0]!.id);
          }
        }}/>
      <div className="win8-start__results">
        {query?matches.map(app=><button key={app.id} type="button"
          data-test-win8-start-result={app.id}
          onClick={()=>onLaunch(app.id)}
          onContextMenu={event=>onContext(event,app.id)}>
          <img src={sourceThemeProgramArt(theme,app.id)??app.icon}
            width={32} height={32} alt=""/>
          <span>{app.label}</span>
        </button>):<p>Type to search apps.</p>}
        {query&&!matches.length&&<p>No items match your search.</p>}
      </div>
    </aside>}
  </nav>;
}

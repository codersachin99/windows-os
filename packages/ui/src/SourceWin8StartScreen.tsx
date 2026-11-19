import {useEffect,useRef,useState,type MouseEvent as ReactMouseEvent,type RefObject} from "react";
import type {AppDefinition} from "@windows-os/contracts";
import {searchFiles,sourceMountedSearchRoots,type FileEntry} from "@windows-os/filesystem";
import {fileStore,sourceFilesystemRuntime} from "@windows-os/sdk";
import {sourceProgramsById} from "@windows-os/filesystem";
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
  /** Open only actual mounted Guest VFS results; report unavailable associations. */
  onOpenFile(file:FileEntry):Promise<string|null>;
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
  theme,rootRef,wallpaper,programs,onLaunch,onOpenFile,onContext,onClose,onPower
}:SourceWin8StartScreenProps){
  const [accountOpen,setAccountOpen]=useState(false);
  const [searching,setSearching]=useState(false);
  const [query,setQuery]=useState("");
  const [selectedResult,setSelectedResult]=useState(-1);
  const [fileHits,setFileHits]=useState<{text:string;files:FileEntry[]}>({text:"",files:[]});
  const [fileSearching,setFileSearching]=useState(false);
  const [fileError,setFileError]=useState("");
  const [fileOpenError,setFileOpenError]=useState("");
  const [searchRevision,setSearchRevision]=useState(0);
  const inputRef=useRef<HTMLInputElement>(null);
  const accountRef=useRef<HTMLDivElement>(null);
  const groupsRef=useRef<HTMLDivElement>(null);
  const searchRef=useRef<HTMLElement>(null);
  const searchButtonRef=useRef<HTMLButtonElement>(null);
  const startWallpaper=wallpaper??sourceShellWallpaper(theme);
  const matches=programs.filter(app=>app.label.toLowerCase()
    .includes(query.toLowerCase()));
  const matchedFiles=fileHits.text===query.trim()?fileHits.files:[];
  const resultCount=matches.length+matchedFiles.length;
  // The original fullscreen Win8 start-search-results also shows real files.
  // Scan only mounted Guest virtual disks. Do not touch host files or create
  // a guessed drive root. Changes invalidate the active search.
  useEffect(()=>{
    if(!searching)return;
    return fileStore.subscribe(()=>setSearchRevision(value=>value+1));
  },[searching]);
  useEffect(()=>{
    const text=query.trim();
    if(!searching||!text){
      setFileHits({text:"",files:[]});
      setFileSearching(false);
      setFileError("");
      return;
    }
    const volume=sourceFilesystemRuntime.snapshot();
    const roots=sourceMountedSearchRoots(volume);
    if(!roots.length){
      setFileHits({text,files:[]});
      setFileSearching(false);
      setFileError("");
      return;
    }
    const controller=new AbortController();
    let active=true;
    setFileSearching(true);
    setFileError("");
    const timer=window.setTimeout(()=>{
      void searchFiles(fileStore,{
        scope:roots[0]!,rootScopes:roots,text,subfolders:true,maxResults:40,
        skipPaths:volume?.trashPath?[volume.trashPath]:[]
      },{signal:controller.signal}).then(found=>{
        if(!active)return;
        setFileHits({text,files:found.files.filter(entry=>!entry.originalPath)});
        setFileSearching(false);
      }).catch(cause=>{
        if(!active||controller.signal.aborted)return;
        setFileHits({text,files:[]});
        setFileError(cause instanceof Error?cause.message:"Guest search failed.");
        setFileSearching(false);
      });
    },120);
    return ()=>{
      active=false;
      window.clearTimeout(timer);
      controller.abort();
    };
  },[query,searching,searchRevision]);
  const tiles=programs.filter(app=>!sourceCoreIds.has(app.id));
  // Source has separate programItems and appItems pose-lists. The former
  // are installed executables; the latter are external app shortcuts.
  // Never mix an external app into the final installed-program group.
  const isInstalled=(app:AppDefinition)=>Boolean(sourceProgramsById.get(app.id)?.installPath);
  const makeGroups=(items:AppDefinition[],kind:"programs"|"apps")=>
    Array.from({length:Math.ceil(items.length/6)},(_,index)=>({
      kind,apps:items.slice(index*6,index*6+6)
    }));
  const groups=[
    ...makeGroups(tiles.filter(isInstalled),"programs"),
    ...makeGroups(tiles.filter(app=>!isInstalled(app)),"apps")
  ];
  useEffect(()=>{rootRef.current?.focus({preventScroll:true});},[rootRef]);
  // Source startmenu-win8 mounts a native wheel listener on the pose grid:
  // prevent vertical page scroll and move horizontally by deltaY + deltaX.
  // A native non-passive listener is required: React wheel listeners are
  // delegated/passive in supported browsers and cannot cancel page scrolling.
  useEffect(()=>{
    const grid=groupsRef.current;
    if(!grid)return;
    const wheel=(event:WheelEvent)=>{
      if(event.deltaX===0&&event.deltaY===0)return;
      event.preventDefault();
      grid.scrollBy({left:event.deltaY+event.deltaX});
    };
    grid.addEventListener("wheel",wheel,{passive:false});
    return ()=>grid.removeEventListener("wheel",wheel);
  },[]);
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
  // The pinned Win8 flyout uses v-clickout + closeSearch(): clicking the
  // screen outside the search pane clears its query and restores Start focus.
  // The Search trigger is exempt: source openSearch() is idempotent.
  useEffect(()=>{
    if(!searching)return;
    const outside=(event:PointerEvent)=>{
      if(!(event.target instanceof Node))return;
      if(searchRef.current?.contains(event.target)||
        searchButtonRef.current?.contains(event.target))return;
      setSearching(false);
      setQuery("");
      rootRef.current?.focus({preventScroll:true});
    };
    document.addEventListener("pointerdown",outside);
    return ()=>document.removeEventListener("pointerdown",outside);
  },[searching,rootRef]);

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
        &&!(event.target instanceof Element&&event.target.closest("input, textarea"))){
        event.preventDefault();setQuery(text=>text+event.key);
        setSelectedResult(-1);setFileOpenError("");
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
        ref={searchButtonRef} aria-label="Search" data-test-start-search-button=""
        aria-expanded={searching}
        onClick={()=>{
          setSearching(true);
          setAccountOpen(false);
        }}>
        <span aria-hidden="true">⌕</span>
      </button>
    </header>
    <div ref={groupsRef} className="win8-start__groups" data-test-win8-start-groups="">
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
        key={index} aria-label={(group.kind==="programs"?"Programs":"Apps")+" group "+(index+1)}
        data-test-win8-start-group={index+1}
        data-test-win8-start-group-kind={group.kind}>
        {group.apps.map(app=><button type="button"
          className="win8-start__tile win8-start__tile--app"
          key={app.id} data-test-program={app.id}
          onClick={()=>onLaunch(app.id)}
          onContextMenu={group.kind==="programs"?event=>onContext(event,app.id):undefined}>
          <img src={sourceThemeProgramArt(theme,app.id)??app.icon}
            width={44} height={44} alt=""/>
          <span className="win8-start__tile-label">{app.label}</span>
        </button>)}
      </section>)}
    </div>
    {searching&&<aside ref={searchRef} className="win8-start__flyout"
      role="search" data-test-win8-start-flyout=""
      data-test-win8-start-query-state={fileSearching?"pending":
        fileHits.text===query.trim()?"ready":"idle"}>
      <h3>Search</h3>
      <label htmlFor="win8-start-query">Everywhere</label>
      <input id="win8-start-query" type="search" ref={inputRef}
        aria-label="Search programs and files" data-test-startmenu-search=""
        placeholder="Search apps" value={query}
        onChange={event=>{
          setQuery(event.target.value);
          setSelectedResult(-1);
          setFileOpenError("");
        }}
        onKeyDown={event=>{
          if((event.key==="ArrowDown"||event.key==="ArrowUp")&&resultCount){
            event.preventDefault();
            setSelectedResult(index=>event.key==="ArrowDown"
              ?(index+1)%resultCount
              :index<=0?resultCount-1:index-1);
          }else if(event.key==="Enter"&&resultCount){
            event.preventDefault();
            const index=selectedResult>=0&&selectedResult<resultCount?selectedResult:0;
            if(index<matches.length)onLaunch(matches[index]!.id);
            else void onOpenFile(matchedFiles[index-matches.length]!)
              .then(message=>setFileOpenError(message??""));
          }
        }}/>
      <div className="win8-start__results">
        {query&&matches.length>0&&<h4>Programs</h4>}
        {query?matches.map((app,index)=><button key={app.id} type="button"
          data-test-win8-start-result={app.id}
          data-test-win8-start-result-selected={selectedResult===index?"":undefined}
          className={selectedResult===index?"is-selected":undefined}
          onMouseEnter={()=>setSelectedResult(index)}
          onClick={()=>onLaunch(app.id)}
          onContextMenu={event=>onContext(event,app.id)}>
          <img src={sourceThemeProgramArt(theme,app.id)??app.icon}
            width={32} height={32} alt=""/>
          <span>{app.label}</span>
        </button>):<p>Type to search programs and files.</p>}
        {query&&matchedFiles.length>0&&<h4>Files and folders</h4>}
        {query&&matchedFiles.map((entry,index)=><button key={entry.uri} type="button"
          data-test-win8-start-file-result={entry.uri}
          data-test-win8-start-result-selected={selectedResult===matches.length+index?"":undefined}
          className={selectedResult===matches.length+index?"is-selected":undefined}
          onMouseEnter={()=>setSelectedResult(matches.length+index)}
          onClick={()=>{void onOpenFile(entry).then(message=>setFileOpenError(message??""));}}>
          <img src={entry.type==="directory"?legacyArt.folder:legacyArt.file}
            width={32} height={32} alt=""/>
          <span className="win8-start__file-label">
            <strong>{entry.name}</strong><small>{entry.uri}</small>
          </span>
        </button>)}
        {query&&fileSearching&&<p role="status">Searching Guest files…</p>}
        {query&&!fileSearching&&!matches.length&&!matchedFiles.length&&!fileError&&
          <p>No items match your search.</p>}
        {fileError&&<p role="alert">{fileError}</p>}
        {fileOpenError&&<p role="alert">{fileOpenError}</p>}
      </div>
    </aside>}
  </nav>;
}

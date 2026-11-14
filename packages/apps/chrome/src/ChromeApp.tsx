import {useEffect,useRef,useState,type FormEvent} from "react";
import {
  CHROME_SEARCH_ENGINES,CHROME_MENU,initialChromeState,addChromeTab,closeChromeTab,
  pushChromeHistory,stepChromeHistory,resolveChromeInput,titleForChromeUrl,
  type ChromeTab,type ChromeSearchEngine
} from "./model";
import "./ChromeApp.css";
const KEY="windows-os:chrome:guest:v1";
const LOGO="/assets/images/google.d3503fb1.svg";
const MIC="/assets/images/google-mic.2a2ca1d4.svg";
function initialEngine():ChromeSearchEngine{
  try{const saved=localStorage.getItem(KEY);
    if(CHROME_SEARCH_ENGINES.some(x=>x.value===saved))return saved as ChromeSearchEngine;
  }catch{/* Guest storage unavailable. */}
  return "google";
}
function Settings({engine,onChange}:{engine:ChromeSearchEngine;onChange:(value:ChromeSearchEngine)=>void}){
  return <div className="source-chrome__internal" data-test-chrome-settings="">
    <aside><h2>Chrome</h2><nav>
      <button disabled>History</button><button disabled>Extensions</button>
      <button className="selected">Settings</button>
      <a href="https://legacy.windows-os.com/help" rel="noopener noreferrer" target="_blank">Help</a>
    </nav></aside>
    <div className="source-chrome__internal-main"><h2>Settings</h2>
      <section><h3>On startup</h3>
        <label><input name="chrome-startup" type="radio" checked readOnly/> Open the New Tab page</label>
        <label><input name="chrome-startup" type="radio" disabled/> Continue where you left off</label>
        <label><input name="chrome-startup" type="radio" disabled/> Open a specific page or set of pages</label>
      </section>
      <section><h3>Appearance</h3>
        <button disabled>Get themes</button> <button disabled>Reset to default theme</button>
        <label><input type="checkbox" checked readOnly disabled/> Show Home button</label>
        <label><input type="checkbox" disabled/> Show bookmarks bar</label>
      </section>
      <section><h3>Search</h3>
        <p>Search engine used in the address bar</p>
        <select aria-label="Search engine" data-test-chrome-search-engine=""
          value={engine} onChange={event=>onChange(event.target.value as ChromeSearchEngine)}>
          {CHROME_SEARCH_ENGINES.map(item=><option key={item.value}
            value={item.value}>{item.label}</option>)}
        </select> <button disabled>Manage search engines</button>
      </section>
    </div>
  </div>;
}

/** Source Google Chrome's window body. Shared WindowFrame owns titlebar/drag. */
export function ChromeApp({onClose}:{onClose:()=>void}){
  const [state,setState]=useState(initialChromeState);
  const [address,setAddress]=useState("");
  const [blankSearch,setBlankSearch]=useState("");
  const [engine,setEngine]=useState(initialEngine);
  const [menuOpen,setMenuOpen]=useState(false);
  const [error,setError]=useState("");
  const [reload,setReload]=useState(0);
  const menuRef=useRef<HTMLDivElement|null>(null);
  const current=state.tabs.find(t=>t.id===state.activeId)??state.tabs[0];
  useEffect(()=>{setAddress(current.url);setError("");},[current.id,current.url]);
  useEffect(()=>{
    if(!menuOpen)return;
    const outside=(e:PointerEvent)=>{
      if(!menuRef.current?.contains(e.target as Node))setMenuOpen(false);
    };
    document.addEventListener("pointerdown",outside);
    return()=>document.removeEventListener("pointerdown",outside);
  },[menuOpen]);
  const update=(fn:(tab:ChromeTab)=>ChromeTab)=>{
    setState(s=>({...s,tabs:s.tabs.map(t=>t.id===s.activeId?fn(t):t)}));
  };
  const open=(text:string)=>{
    const url=resolveChromeInput(text,engine);
    if(!url){setError("This address cannot be opened in Chrome.");return;}
    setError("");setReload(0);update(t=>pushChromeHistory(t,url));
  };
  const add=(url="")=>{
    setMenuOpen(false);setError("");setReload(0);setBlankSearch("");
    setState(s=>addChromeTab(s,url));
  };
  const close=(id:number)=>{
    const next=closeChromeTab(state,id);
    if(!next){onClose();return;}
    setState(next);
  };
  const changeEngine=(v:ChromeSearchEngine)=>{
    setEngine(v);try{localStorage.setItem(KEY,v);}catch{/* no storage */}
  };
  const menuAction=(label:string)=>{
    setMenuOpen(false);
    if(label==="New Tab")add();
    if(label==="Settings")add("chrome://chrome/settings");
    if(label==="Help")window.open("https://legacy.windows-os.com/help","_blank","noopener,noreferrer");
    if(label==="Exit")onClose();
  };
  const submit=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();open(address);};
  const submitSearch=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();open(blankSearch);};
  const blank=current.url==="",settings=current.url==="chrome://chrome/settings";
  const online=/^https?:\/\//i.test(current.url);
  return <div className="source-chrome" data-test-chrome=""
    onKeyDownCapture={e=>{if(e.altKey&&e.key.toLowerCase()==="t"){e.preventDefault();add();}}}>
    <nav className="source-chrome__tabs" aria-label="Chrome tabs">
      {state.tabs.map(tab=><div key={tab.id}
        className={"source-chrome__tab"+(tab.id===current.id?" selected":"")}
        data-test-chrome-tab={tab.id}>
        <button type="button" className="source-chrome__tab-select"
          aria-current={tab.id===current.id?"page":undefined}
          onClick={()=>{setState(s=>({...s,activeId:tab.id}));setMenuOpen(false);}}>
          <span aria-hidden="true">◉</span><span>{tab.loading?"Loading...":tab.title}</span>
        </button>
        <button type="button" aria-label={"Close tab "+tab.id}
          onClick={()=>close(tab.id)}>×</button>
      </div>)}
      <button type="button" className="source-chrome__add"
        aria-label="New tab" data-test-chrome-add-tab="" onClick={()=>add()}>+</button>
    </nav>
    <div className="source-chrome__addressbar">
      <button type="button" aria-label="Back" disabled={current.historyIndex<=0}
        onClick={()=>update(t=>stepChromeHistory(t,"back"))}>‹</button>
      <button type="button" aria-label="Forward"
        disabled={current.historyIndex>=current.history.length-1}
        onClick={()=>update(t=>stepChromeHistory(t,"next"))}>›</button>
      <button type="button" aria-label="Reload" data-test-reload-button=""
        onClick={()=>{setReload(n=>n+1);update(t=>({...t,loading:!!t.url}));}}>⟳</button>
      <button type="button" aria-label="Home" data-test-home-button=""
        onClick={()=>update(t=>pushChromeHistory(t,""))}>⌂</button>
      <form className="source-chrome__location" onSubmit={submit}>
        <input aria-label="Web address" data-test-input-web-address="" value={address}
          onChange={e=>setAddress(e.target.value)}
          onFocus={e=>e.currentTarget.select()}/>
      </form>
      <div className="source-chrome__menu-host" ref={menuRef}>
        <button type="button" aria-label="Chrome menu" aria-expanded={menuOpen}
          data-test-menu-button="" onClick={()=>setMenuOpen(v=>!v)}>☰</button>
        {menuOpen&&<div className="source-chrome__menu" role="menu">
          {CHROME_MENU.map(item=><button key={item.label} type="button" role="menuitem"
            disabled={!item.enabled} onClick={()=>menuAction(item.label)}>{item.label}</button>)}
        </div>}
      </div>
    </div>
    {error&&<p className="source-chrome__error" role="alert">{error}</p>}
    <main className="source-chrome__body">
      {blank&&<div className="source-chrome__blank" data-test-chrome-new-tab="">
        <img className="source-chrome__google" src={LOGO} alt="Google"/>
        <form className="source-chrome__blank-search" onSubmit={submitSearch}>
          <input type="search" placeholder="Google" aria-label="Search Google"
            value={blankSearch} onChange={e=>setBlankSearch(e.target.value)}/>
          <button type="submit" aria-label="Submit search"><img src={MIC} alt=""/></button>
        </form>
      </div>}
      {settings&&<Settings engine={engine} onChange={changeEngine}/>}
      {current.url==="chrome://chrome"&&<div className="source-chrome__unported">
        <h2>About Chrome</h2><p>Source About Chrome details remain pending.</p></div>}
      {current.url==="chrome://dino"&&<div className="source-chrome__unported" role="status">
        T-Rex Dino Game requires the original source game engine, which is not yet ported.</div>}
      {online&&<iframe key={current.id+"-"+current.revision+"-"+reload}
        title="Chrome webpage" data-test-web-iframe="" src={current.url}
        sandbox="allow-forms allow-scripts allow-popups" referrerPolicy="no-referrer"
        onLoad={()=>update(t=>({...t,loading:false,title:titleForChromeUrl(t.url)}))}/>}
    </main>
  </div>;
}

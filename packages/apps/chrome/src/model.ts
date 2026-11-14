/** Source-pinned legacy-win7 Chrome webpack 7839a and 90b3. */
export const CHROME_SEARCH_ENGINES=[
  {value:"google",label:"Google",url:"google.com/search?igu=1&q="},
  {value:"bing",label:"Bing",url:"bing.com/search?q="},
  {value:"yahoo",label:"Yahoo",url:"search.yahoo.com/search?p="},
  {value:"baidu",label:"Baidu",url:"baidu.com/s?wd="},
  {value:"yandex",label:"Yandex",url:"yandex.com/search/?text="},
  {value:"duckduckgo",label:"DuckDuckGo",url:"duckduckgo.com/?q="}
] as const;
export type ChromeSearchEngine=typeof CHROME_SEARCH_ENGINES[number]["value"];
export const CHROME_MENU=[
  {label:"New Tab",enabled:true},
  {label:"New incognito window",enabled:false},
  {label:"Bookmarks",enabled:false},
  {label:"Save page as",enabled:false},
  {label:"Find",enabled:false},
  {label:"History",enabled:false},
  {label:"Settings",enabled:true},
  {label:"About Chrome",enabled:false},
  {label:"Help",enabled:true},
  {label:"Exit",enabled:true}
] as const;
export type ChromeTab={
  id:number; url:string; title:string; history:readonly string[];
  historyIndex:number; loading:boolean; error:boolean; revision:number;
};
export type ChromeState={tabs:readonly ChromeTab[];activeId:number;nextId:number};
export function titleForChromeUrl(url:string){
  if(!url)return "New Tab";
  if(url==="chrome://dino")return "T-Rex Dino Game";
  if(url==="chrome://chrome/settings")return "Settings";
  if(url==="chrome://chrome")return "About";
  try{return new URL(url).hostname;}catch{return "New Tab";}
}
export function newChromeTab(id:number,url=""):ChromeTab{
  return {id,url,title:titleForChromeUrl(url),history:[],historyIndex:-1,loading:!!url,error:false,revision:0};
}
export function initialChromeState():ChromeState{
  return {tabs:[newChromeTab(1)],activeId:1,nextId:2};
}
export function addChromeTab(s:ChromeState,url=""):ChromeState{
  return {...s,tabs:[...s.tabs,newChromeTab(s.nextId,url)],activeId:s.nextId,nextId:s.nextId+1};
}
export function closeChromeTab(s:ChromeState,id:number):ChromeState|null{
  const at=s.tabs.findIndex(t=>t.id===id);
  if(at<0)return s;
  if(s.tabs.length===1)return null;
  const tabs=s.tabs.filter(t=>t.id!==id);
  return {...s,tabs,activeId:s.activeId===id?tabs[Math.max(at-1,0)].id:s.activeId};
}
export function pushChromeHistory(t:ChromeTab,url:string):ChromeTab{
  const history=[...t.history.slice(0,t.historyIndex+1),url];
  return {...t,url,title:titleForChromeUrl(url),history,historyIndex:history.length-1,
    loading:!!url,error:false,revision:t.revision+1};
}
export function stepChromeHistory(t:ChromeTab,direction:"back"|"next"):ChromeTab{
  const index=t.historyIndex+(direction==="back"?-1:1);
  if(index<0||index>=t.history.length)return t;
  const url=t.history[index];
  return {...t,url,title:titleForChromeUrl(url),historyIndex:index,loading:!!url,error:false,revision:t.revision+1};
}
/** Resolve search/default URL; never execute host files or active URL schemes. */
export function resolveChromeInput(raw:string,engine:ChromeSearchEngine):string|null{
  const original=raw.trim();
  if(!original)return null;
  const lower=original.toLowerCase();
  if(lower==="dino"||lower==="chrome://dino")return "chrome://dino";
  if(lower==="chrome://chrome/settings"||lower==="chrome://chrome")return lower;
  if(original.startsWith("//"))return null;
  if(/^[a-z][a-z0-9+.-]*:/i.test(original)&&!/^https?:\/\//i.test(original))return null;
  // Fully-qualified URL credentials must be rejected *before* search fallback.
  // Otherwise https://user:pass@host is mistaken for a search string.
  if(/^https?:\/\//i.test(original)){
    try{
      const supplied=new URL(original);
      if(supplied.username||supplied.password||!supplied.hostname)return null;
    }catch{return null;}
  }
  const host=/^(?:https?:\/\/)?(?:localhost|(?:[\w-]+\.)+[\w-]{2,}|(?:\d{1,3}\.){3}\d{1,3})(?::\d+)?(?:[/?#]|$)/i.test(original);
  const provider=CHROME_SEARCH_ENGINES.find(x=>x.value===engine)??CHROME_SEARCH_ENGINES[0];
  const path=host?original:provider.url+lower.replace(/ /g,"+");
  if(/\s/.test(path))return null;
  try{
    const url=new URL(/^https?:\/\//i.test(path)?path:"https://"+path);
    if(!["http:","https:"].includes(url.protocol)||!url.hostname||url.username||url.password)return null;
    if(url.hostname.endsWith("google.com")&&url.pathname==="/search"&&!url.searchParams.has("igu"))
      url.searchParams.append("igu","1");
    return url.href;
  }catch{return null;}
}

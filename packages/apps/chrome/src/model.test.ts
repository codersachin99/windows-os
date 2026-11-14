import {describe,it,expect} from "vitest";
import {
  CHROME_SEARCH_ENGINES,CHROME_MENU,initialChromeState,addChromeTab,closeChromeTab,
  resolveChromeInput,newChromeTab,pushChromeHistory,stepChromeHistory,titleForChromeUrl
} from "./model";
describe("pinned legacy Chrome",()=>{
  it("starts with one blank tab and no history",()=>{
    expect(initialChromeState().tabs[0]).toMatchObject({url:"",title:"New Tab",history:[],historyIndex:-1});
  });
  it("retains the six source providers and disabled menu entries",()=>{
    expect(CHROME_SEARCH_ENGINES.map(e=>e.value)).toEqual(["google","bing","yahoo","baidu","yandex","duckduckgo"]);
    expect(CHROME_SEARCH_ENGINES[0].url).toBe("google.com/search?igu=1&q=");
    expect(CHROME_MENU.filter(m=>!m.enabled).map(m=>m.label))
      .toEqual(["New incognito window","Bookmarks","Save page as","Find","History","About Chrome"]);
  });
  it("uses source search, known internal routes and safe web URLs",()=>{
    expect(resolveChromeInput("WIN 7 search","google")).toBe("https://google.com/search?igu=1&q=win+7+search");
    expect(resolveChromeInput("win 7","bing")).toBe("https://bing.com/search?q=win+7");
    expect(resolveChromeInput("dino","google")).toBe("chrome://dino");
    expect(resolveChromeInput("chrome://chrome/settings","google")).toBe("chrome://chrome/settings");
    expect(resolveChromeInput("example.com/a","google")).toBe("https://example.com/a");
    expect(resolveChromeInput("https://google.com/search?q=foo","google"))
      .toBe("https://google.com/search?q=foo&igu=1");
    for(const bad of ["javascript:alert(1)","file:///etc/passwd","data:text/html,x",
      "blob:https://example.com/foo","https://user:pass@example.com","//example.com"])
      expect(resolveChromeInput(bad,"google")).toBeNull();
  });
  it("adds/activates tabs, closes active and exits on final tab",()=>{
    const a=initialChromeState(),b=addChromeTab(a);
    expect(b.activeId).toBe(2);
    expect(b.tabs).toHaveLength(2);
    expect(closeChromeTab(b,2)?.activeId).toBe(1);
    expect(closeChromeTab(a,1)).toBeNull();
    expect(titleForChromeUrl("chrome://dino")).toBe("T-Rex Dino Game");
  });
  it("preserves source Back/Next and removes forward history after branching",()=>{
    const a=pushChromeHistory(newChromeTab(1),"https://a.example/");
    const b=pushChromeHistory(a,"https://b.example/");
    expect(stepChromeHistory(b,"next")).toBe(b);
    const back=stepChromeHistory(b,"back");
    expect(back.url).toBe("https://a.example/");
    expect(stepChromeHistory(back,"next").url).toBe("https://b.example/");
    const branch=pushChromeHistory(back,"https://c.example/");
    expect(branch.history).toEqual(["https://a.example/","https://c.example/"]);
  });
});

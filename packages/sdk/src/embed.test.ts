import {describe,expect,it} from "vitest";
import {
  SOURCE_EMBED_VERSION,SOURCE_EMBED_PREFIX,sourceEmbedOrigins,sourceEmbedUrl,
  sourceEmbedAppId,sourceEmbedCommand,sourceWebAppWindow
} from "./embed";
describe("pinned original plugin-embed bcdb",()=>{
  it("is disabled with empty configuration and allows exact HTTP(S) origins only",()=>{
    expect(sourceEmbedOrigins(undefined)).toEqual([]);
    expect(sourceEmbedOrigins("")).toEqual([]);
    expect(sourceEmbedOrigins("https://host.example, http://localhost:1420,https://host.example"))
      .toEqual(["https://host.example","http://localhost:1420"]);
    expect(sourceEmbedOrigins("*,null,https://x.test/path,https://user:pass@x.test,http://x.test/"))
      .toEqual([]);
  });
  it("retains source ready version, web prefix and slugged titles",()=>{
    expect(SOURCE_EMBED_VERSION).toBe("4.8.0");
    expect(SOURCE_EMBED_PREFIX).toBe("web_");
    expect(sourceEmbedAppId("Windows 7 Portal.html")).toBe("web_windows-7-portal");
    expect(sourceEmbedAppId("*")).toBe("web_untitled");
  });
  it("opens only safe HTTP(S) pages and defaults title to URL hostname",()=>{
    expect(sourceEmbedCommand({type:"open",url:"https://example.org/page"}))
      .toEqual({type:"open",url:"https://example.org/page",label:"example.org",id:"web_example-org"});
    expect(sourceEmbedCommand({type:"open",url:"https://example.org",title:"  Docs Portal  "}))
      .toEqual({type:"open",url:"https://example.org/",label:"Docs Portal",id:"web_docs-portal"});
    for(const candidate of ["javascript:alert(1)","data:text/html,x","file:///secret",
      "http://user:pass@host.test","https://bad.test/a b","//example.org"]){
      expect(sourceEmbedUrl(candidate)).toBeNull();
      expect(sourceEmbedCommand({type:"open",url:candidate})).toBeNull();
    }
  });
  it("does not accept arbitrary close actions for system programs",()=>{
    expect(sourceEmbedCommand({type:"close",id:"web_docs-portal"}))
      .toEqual({type:"close",id:"web_docs-portal"});
    for(const bad of ["computer","../web_docs",1,"web_","web_evil/another"]){
      expect(sourceEmbedCommand({type:"close",id:bad})).toBeNull();
    }
    expect(sourceEmbedCommand(null)).toBeNull();
    expect(sourceEmbedCommand({type:"restart"})).toBeNull();
  });
  it("preserves original 99c7 shorthand-window precedence",()=>{
    expect(sourceWebAppWindow({w:510,h:320,window:{width:900,height:900,resizable:false}}))
      .toEqual({width:510,height:320,resizable:false});
    expect(sourceWebAppWindow({width:720,height:430,resizable:true}))
      .toEqual({width:720,height:430,resizable:true});
    expect(sourceWebAppWindow({})).toEqual({width:760,height:520,resizable:true});
  });
});

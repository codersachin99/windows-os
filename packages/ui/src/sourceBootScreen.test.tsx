import {describe,expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {sourceBootOriginalArt,sourceBootOriginalArtwork} from "@windows-os/assets";
import {sourceThemeScreens} from "@windows-os/contracts";
import {BootScreen} from "./BootScreen";

const noop=()=>{};
const art=[
  ["win31","win31","boot-win31.7bac4ac4.webp"],
  ["win95","win9x","boot-win95.9bf06d7a.gif"],
  ["win98","win9x","boot-win98.36ae413e.gif"],
  ["win2k","win9x","boot-win2k.2870262d.gif"],
  ["winxp","win9x","boot-winxp.c42ee019.gif"],
  ["winvista","win-mixed","boot-winvista.f7526b81.gif"],
  ["win8","win-x","boot-win8.1a6acdfd.webp"],
  ["win10","win-x","boot-win8.1a6acdfd.webp"],
  ["win11","win-x","boot-win11.120bb3b3.webp"],
  ["winLS","win-mixed","boot-winL.934ea74a.gif"],
  ["winW","win-mixed","boot-winW.052f504e.webp"]
] as const;

describe("pinned original boot-screen artwork and React renderer families",()=>{
  it("registers source exact artwork only for supported boot families",()=>{
    expect(Object.keys(sourceBootOriginalArtwork)).toHaveLength(11);
    for(const [theme,renderer,name] of art){
      expect(sourceBootOriginalArt(theme)).toEqual({
        renderer,src:"/assets/images/"+name
      });
    }
    for(const theme of ["win7","kubuntu","onebit","__proto__","unknown"]){
      expect(sourceBootOriginalArt(theme)).toBeNull();
    }
  });
  it("follows original themeScreens aliases instead of manufacturing filenames",()=>{
    for(const [theme,screen] of [
      ["win81","win8"],["winxpG","winxp"],["winxpE","winxp"],
      ["win11dark","win11"],["winLP","winLS"]
    ] as const){
      expect(sourceBootOriginalArt(sourceThemeScreens(theme).boot))
        .toEqual(sourceBootOriginalArt(screen));
    }
  });
  it.each(art)("uses original %s %s boot component with %s artwork",
    (theme,renderer,name)=>{
      const html=renderToStaticMarkup(<BootScreen theme={theme}
        onComplete={noop}/>);
      expect(html).toContain('data-source-boot-theme="'+theme+'"');
      expect(html).toContain('data-source-boot-renderer="'+renderer+'"');
      expect(html).toContain('/assets/images/'+name);
      expect(html).not.toContain("Starting Windows");
      if(renderer==="win-x"){
        expect(html).toContain('data-test-boot-theme="winx"');
        expect(html).toContain("source-boot__spinner");
        expect((html.match(/class="source-boot__spinner-ball"/g)||[])).toHaveLength(5);
      }else{
        expect(html).toContain('data-test-boot-theme="'+theme+'"');
        expect(html).toContain("source-boot__image--"+renderer);
      }
    });
  it("leaves canonical Win7 and unported variants on explicit fallback",()=>{
    const base=renderToStaticMarkup(<BootScreen onComplete={noop}/>);
    expect(base).toContain('data-source-boot-renderer="win7"');
    expect(base).toContain("Starting Windows");
    const pending=renderToStaticMarkup(<BootScreen theme="kubuntu" onComplete={noop}/>);
    expect(pending).toContain('data-source-boot-renderer="win7-fallback"');
    expect(pending).toContain('data-source-boot-theme="kubuntu"');
    expect(pending).toContain("Starting Windows");
    expect(pending).not.toContain("source-boot__spinner");
  });
  it("renders mapped variants as original Win8, XP, Win11, and winL art",()=>{
    for(const [theme,original,renderer] of [
      ["win81","boot-win8.1a6acdfd.webp","win-x"],
      ["winxpG","boot-winxp.c42ee019.gif","win9x"],
      ["win11dark","boot-win11.120bb3b3.webp","win-x"],
      ["winLP","boot-winL.934ea74a.gif","win-mixed"]
    ] as const){
      const html=renderToStaticMarkup(<BootScreen theme={theme}
        onComplete={noop}/>);
      expect(html).toContain(original);
      expect(html).toContain('data-source-theme-id="'+theme+'"');
      expect(html).toContain('data-source-boot-renderer="'+renderer+'"');
    }
  });
});

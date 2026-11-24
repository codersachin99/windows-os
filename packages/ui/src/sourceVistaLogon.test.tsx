import {expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {SOURCE_THEME_CATALOG_IDS,sourceThemeScreens} from "@windows-os/contracts";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import {LogonScreen} from "./LogonScreen";

const noop=()=>{};
it("Vista adapts the pinned shared Win7 renderer with its original art and branding",()=>{
  const html=renderToStaticMarkup(<LogonScreen theme="winvista" onGuest={noop}
    onShutdown={noop} onRestart={noop}/>);
  expect(html).toContain('data-source-logon-renderer="winvista"');
  expect(html).toContain('data-source-shell-status="partial"');
  expect(html).toContain("Windows Vista");
  expect(html).toContain("Professional");
  expect(html).not.toContain("Simulator");
  for(const art of Object.values(sourceThemeLogonArtwork.winvista))expect(html).toContain(art);
});
it("all original catalog IDs select their pinned logon family without a Win7 fallback",()=>{
  expect(SOURCE_THEME_CATALOG_IDS).toHaveLength(37);
  const families=new Set<string>();
  for(const theme of SOURCE_THEME_CATALOG_IDS){
    const family=sourceThemeScreens(theme).logon;
    families.add(family);
    const html=renderToStaticMarkup(<LogonScreen theme={theme} onGuest={noop}
      onShutdown={noop} onRestart={noop}/>);
    expect(html,theme).toContain('data-source-logon-renderer="'+family+'"');
    expect(html,theme).not.toContain('data-source-logon-renderer="win7-fallback"');
  }
  expect(families.size).toBe(19);
});

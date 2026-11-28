import {expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {sourceThemeShellStatus} from "@windows-os/contracts";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import {LogonScreen} from "./LogonScreen";

it("renders the original Kubuntu screen family and power assets without marking its shell complete",()=>{
  const noop=()=>{};
  const html=renderToStaticMarkup(<LogonScreen theme="kubuntu" onGuest={noop}
    onShutdown={noop} onRestart={noop}/>);
  expect(sourceThemeShellStatus("kubuntu")).toBe("pending");
  expect(html).toContain('data-source-logon-renderer="kubuntu"');
  expect(html).toContain('data-source-shell-status="pending"');
  expect(html).toContain('data-test-source-logon-avatar="kubuntu"');
  expect(html).toContain('data-test-logon-restart=""');
  expect(html).toContain('data-test-logon-shutdown=""');
  for(const art of Object.values(sourceThemeLogonArtwork.kubuntu))expect(html).toContain(art);
  expect(html).toContain('width="150"');
  expect(html).toContain('width="48"');
  expect(html).not.toContain('data-source-logon-renderer="win7-fallback"');
});

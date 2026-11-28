import {expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {sourceThemeShellStatus} from "@windows-os/contracts";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import {LogonScreen} from "./LogonScreen";

it("renders the pinned Ubuntu Guest avatar, logo and logon-only system menu",()=>{
  const noop=()=>{};
  const html=renderToStaticMarkup(<LogonScreen theme="ubuntu" onGuest={noop}
    onShutdown={noop} onRestart={noop}/>);
  expect(sourceThemeShellStatus("ubuntu")).toBe("pending");
  expect(html).toContain('data-source-logon-renderer="ubuntu"');
  expect(html).toContain('data-source-shell-status="pending"');
  expect(html).toContain('data-test-taskbar="ubuntu"');
  expect(html).toContain('data-test-source-logon-avatar="ubuntu"');
  expect(html).toContain('aria-label="System menu"');
  expect(html).not.toContain('data-test-activities-button');
  expect(html).not.toContain('data-source-logon-renderer="win7-fallback"');
  for(const art of Object.values(sourceThemeLogonArtwork.ubuntu))expect(html).toContain(art);
  expect(html).toContain('width="88"');
});

import {expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {sourceThemeShellStatus} from "@windows-os/contracts";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import {LogonScreen} from "./LogonScreen";

it("renders original macOS avatar-only Guest and source-order footer controls",()=>{
  const noop=()=>{};
  const html=renderToStaticMarkup(<LogonScreen theme="macos" onGuest={noop}
    onShutdown={noop} onRestart={noop}/>);
  expect(sourceThemeShellStatus("macos")).toBe("pending");
  expect(html).toContain('data-source-logon-renderer="macos"');
  expect(html).toContain('data-source-shell-status="pending"');
  expect(html).toContain('data-test-source-logon-avatar="macos"');
  const shutdown=html.indexOf('data-test-logon-shutdown=""');
  const switchUser=html.indexOf('data-test-logon-switch=""');
  const restart=html.indexOf('data-test-logon-restart=""');
  expect(shutdown).toBeGreaterThan(-1);
  expect(switchUser).toBeGreaterThan(shutdown);
  expect(restart).toBeGreaterThan(switchUser);
  for(const art of Object.values(sourceThemeLogonArtwork.macos))expect(html).toContain(art);
  expect(html).toContain('width="150"');
  expect(html).not.toContain('Sign in');
  expect(html).not.toContain('data-source-logon-renderer="win7-fallback"');
});

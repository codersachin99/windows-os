import {expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {sourceThemeShellStatus} from "@windows-os/contracts";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import {LogonScreen} from "./LogonScreen";

it("renders original ChromeOS avatar-only Guest and footer actions",()=>{
  const noop=()=>{};
  const html=renderToStaticMarkup(<LogonScreen theme="chromeos" onGuest={noop}
    onShutdown={noop} onRestart={noop}/>);
  expect(sourceThemeShellStatus("chromeos")).toBe("pending");
  expect(html).toContain('data-source-logon-renderer="chromeos"');
  expect(html).toContain('data-source-shell-status="pending"');
  expect(html).toContain('data-test-source-logon-avatar="chromeos"');
  expect(html).toContain('data-test-logon-switch=""');
  expect(html).toContain('data-test-logon-restart=""');
  expect(html).toContain('data-test-logon-shutdown=""');
  expect(html).toContain('data-test-source-chromeos-clock=""');
  for(const art of Object.values(sourceThemeLogonArtwork.chromeos))expect(html).toContain(art);
  expect(html).toContain('width="100"');
  expect(html).not.toContain('Sign in');
  expect(html).not.toContain('data-source-logon-renderer="win7-fallback"');
});

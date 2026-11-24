import {expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {sourceThemeShellStatus} from "@windows-os/contracts";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import {LogonScreen} from "./LogonScreen";

it("renders pinned Oxygen Guest and power art without claiming shell parity",()=>{
  const noop=()=>{};
  const html=renderToStaticMarkup(<LogonScreen theme="oxygen" onGuest={noop}
    onShutdown={noop} onRestart={noop}/>);
  expect(sourceThemeShellStatus("oxygen")).toBe("pending");
  expect(html).toContain('data-source-logon-renderer="oxygen"');
  expect(html).toContain('data-source-shell-status="pending"');
  expect(html).toContain('data-test-source-logon-avatar="oxygen"');
  expect(html).toContain('data-test-logon-restart=""');
  expect(html).toContain('data-test-logon-shutdown=""');
  for(const path of Object.values(sourceThemeLogonArtwork.oxygen))expect(html).toContain(path);
  expect(html).toContain('width="128"');
  expect(html).not.toContain('data-source-logon-renderer="win7-fallback"');
});

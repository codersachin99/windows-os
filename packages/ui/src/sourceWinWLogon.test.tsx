import {describe,expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {sourceThemeScreens,sourceThemeShellStatus} from "@windows-os/contracts";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import {LogonScreen} from "./LogonScreen";

const noop=()=>{};

describe("pinned WinW Whistler source Guest logon",()=>{
  it("uses a distinct source renderer instead of the Win7 fallback",()=>{
    expect(sourceThemeScreens("winW").logon).toBe("winW");
    expect(sourceThemeShellStatus("winW")).toBe("pending");
    const html=renderToStaticMarkup(<LogonScreen theme="winW"
      onGuest={noop} onShutdown={noop} onRestart={noop}/>);
    expect(html).toContain('data-source-theme-id="winW"');
    expect(html).toContain('data-source-logon-theme="winW"');
    expect(html).toContain('data-source-logon-renderer="winW"');
    expect(html).toContain('data-source-shell-status="pending"');
    expect(html).toContain('data-test-source-logon-logo="winW"');
    expect(html).toContain('data-test-source-logon-avatar="winW"');
    expect(html).toContain('data-test-logon-restart=""');
    expect(html).toContain('data-test-logon-shutdown=""');
    expect(html).toContain("To manage or change user accounts, go to Control Panel");
    expect(html).not.toContain('data-source-logon-renderer="win7-fallback"');
  });
  it("references only the verified original Whistler logo path",()=>{
    expect(sourceThemeLogonArtwork.winW).toEqual({
      logo:"/assets/images/logowhistler.73c9045c.webp"
    });
  });
});

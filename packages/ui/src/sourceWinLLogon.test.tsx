import {describe,expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {LogonScreen} from "./LogonScreen";
import {sourceThemeScreens,sourceThemeShellStatus} from "@windows-os/contracts";
import {sourceThemeLogonArtwork} from "@windows-os/assets";

const noop=()=>{};
describe("frozen WinL source aliases and Guest logon",()=>{
  it("maps winLS and winLP to the exact same original logon family",()=>{
    for(const theme of ["winLS","winLP"] as const){
      expect(sourceThemeScreens(theme).logon).toBe("winLS");
      expect(sourceThemeShellStatus(theme)).toBe("pending");
      const html=renderToStaticMarkup(<LogonScreen theme={theme}
        onGuest={noop} onShutdown={noop} onRestart={noop}/>);
      expect(html).toContain('data-source-theme-id="'+theme+'"');
      expect(html).toContain('data-source-logon-theme="winLS"');
      expect(html).toContain('data-source-logon-renderer="winLS"');
      expect(html).toContain('data-source-shell-status="pending"');
      expect(html).toContain('data-test-source-logon-avatar="winLS"');
      expect(html).toContain('data-test-source-logon-logo="winLS"');
      expect(html).toContain('data-test-logon-shutdown=""');
      expect(html).toContain('data-test-logon-restart=""');
      expect(html).not.toContain('data-source-logon-renderer="win7-fallback"');
    }
  });
  it("uses the pinned original WinL background, Guest and source brand",()=>{
    expect(sourceThemeLogonArtwork.winLS).toEqual({
      background:"/assets/images/login-winL.d27b081a.webp",
      brand:"/assets/images/start-button-winxp.a3485adf.webp",
      guest:"/assets/images/guest-win10.a110df5a.webp"
    });
  });
});

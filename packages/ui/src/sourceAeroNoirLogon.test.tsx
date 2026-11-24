import {describe,expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {sourceThemeScreens,sourceThemeShellStatus} from "@windows-os/contracts";
import {sourceThemeLogonArtwork} from "@windows-os/assets";
import {LogonScreen} from "./LogonScreen";

const noop=()=>{};

describe("pinned Aero Noir source Guest logon",()=>{
  it("preserves the source family and pending shell status",()=>{
    expect(sourceThemeScreens("aeroNoir").logon).toBe("aeroNoir");
    expect(sourceThemeShellStatus("aeroNoir")).toBe("pending");
    const html=renderToStaticMarkup(<LogonScreen theme="aeroNoir"
      onGuest={noop} onShutdown={noop} onRestart={noop}/>);
    expect(html).toContain('data-source-theme-id="aeroNoir"');
    expect(html).toContain('data-source-logon-theme="aeroNoir"');
    expect(html).toContain('data-source-logon-renderer="aeroNoir"');
    expect(html).toContain('data-source-shell-status="pending"');
    expect(html).toContain('data-test-source-logon-avatar="aeroNoir"');
    expect(html).toContain('data-test-logon-restart=""');
    expect(html).toContain('data-test-logon-shutdown=""');
    expect(html).toContain('aeroNoir.237e6377.webp');
    expect(html).not.toContain('data-source-logon-renderer="win7-fallback"');
  });
  it("uses original wallpaper, source Guest and 36px KDE power images",()=>{
    expect(sourceThemeLogonArtwork.aeroNoir).toEqual({
      background:"/assets/images/aeroNoir.237e6377.webp",
      guest:"/assets/images/guest-win10.a110df5a.webp",
      restart:"/assets/images/restart-kubuntu.5c766c73.svg",
      shutdown:"/assets/images/shutdown-kubuntu.146c3ea3.svg"
    });
  });
});

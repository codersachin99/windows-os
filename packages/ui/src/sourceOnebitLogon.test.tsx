import {describe,expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {LogonScreen} from "./LogonScreen";

const noop=()=>{};

describe("frozen Onebit BaseLogon Guest/power renderer",()=>{
  it("routes Onebit to its own source theme and keeps shell pending",()=>{
    const html=renderToStaticMarkup(<LogonScreen theme="onebit"
      onGuest={noop} onShutdown={noop} onRestart={noop}/>);
    expect(html).toContain('data-source-logon-theme="onebit"');
    expect(html).toContain('data-source-theme-id="onebit"');
    expect(html).toContain('data-source-logon-renderer="onebit"');
    expect(html).toContain('data-source-shell-status="pending"');
    expect(html).toContain('data-test-source-logon-avatar="onebit"');
    expect(html).toContain('data-test-source-onebit-avatar-canvas=""');
    expect(html).toContain('data-test-logon-shutdown=""');
    expect(html).toContain('data-test-logon-restart=""');
    expect(html).toContain("Guest");
    expect(html).not.toContain('data-source-logon-renderer="win7-fallback"');
  });
  it("does not mislabel unported Ubuntu logon as the Onebit adaptation",()=>{
    const html=renderToStaticMarkup(<LogonScreen theme="ubuntu"
      onGuest={noop} onShutdown={noop} onRestart={noop}/>);
    expect(html).toContain('data-source-logon-renderer="win7-fallback"');
    expect(html).toContain('data-source-logon-theme="ubuntu"');
    expect(html).not.toContain('source-onebit-logon__pane');
  });
});

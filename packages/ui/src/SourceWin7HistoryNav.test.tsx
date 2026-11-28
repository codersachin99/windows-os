import {describe,expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {SourceWin7HistoryNav} from "./SourceWin7HistoryNav";

const noop=()=>{};
describe("shared pinned Win7 back/forward sprite control",()=>{
  it("uses source Back/Forward roles with four-row sprite classes",()=>{
    const html=renderToStaticMarkup(<SourceWin7HistoryNav
      canGoBack={false} canGoForward={true}
      onBack={noop} onForward={noop} ariaLabel="Control Panel history"/>);
    expect(html).toContain('aria-label="Control Panel history"');
    expect(html).toContain("source-win7-history");
    expect(html).toContain("explorer-address__source-nav");
    expect(html).toContain("source-win7-history__back");
    expect(html).toContain("source-win7-history__forward");
    expect(html).toMatch(/aria-label="Back"[^>]*disabled=""/);
    expect(html).not.toMatch(/aria-label="Forward"[^>]*disabled=""/);
  });
  it("keeps application testing hooks without inventing separate icon markup",()=>{
    const html=renderToStaticMarkup(<SourceWin7HistoryNav
      canGoBack={true} canGoForward={false}
      onBack={noop} onForward={noop}
      backTestId="data-test-cpanel-back"
      forwardTestId="data-test-cpanel-forward"/>);
    expect(html).toContain('data-test-cpanel-back=""');
    expect(html).toContain('data-test-cpanel-forward=""');
    expect((html.match(/type="button"/g)||[])).toHaveLength(2);
    expect((html.match(/aria-hidden="true"/g)||[])).toHaveLength(2);
  });
});

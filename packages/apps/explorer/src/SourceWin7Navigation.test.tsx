import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SourceWin7Navigation } from "./SourceWin7Navigation";

describe("source Win7 27px Explorer history navigation", () => {
  const noop = () => {};
  it("retains accessible Back/Forward names without showing text above original sprite", () => {
    const html = renderToStaticMarkup(<SourceWin7Navigation
      canGoBack={true} canGoForward={false} onBack={noop} onForward={noop} />);
    expect(html).toContain('aria-label="Folder history"');
    expect(html).toContain('aria-label="Back"');
    expect(html).toContain('aria-label="Forward"');
    expect(html).toContain('explorer-address__source-prev');
    expect(html).toContain('explorer-address__source-next');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toMatch(/aria-label="Forward"[^>]*disabled=""/);
    expect(html).not.toMatch(/aria-label="Back"[^>]*disabled=""/);
  });
  it("uses both disabled states at a fresh Explorer history root", () => {
    const html = renderToStaticMarkup(<SourceWin7Navigation
      canGoBack={false} canGoForward={false} onBack={noop} onForward={noop} />);
    expect((html.match(/disabled=""/g) || [])).toHaveLength(2);
    expect((html.match(/type="button"/g) || [])).toHaveLength(2);
  });
});

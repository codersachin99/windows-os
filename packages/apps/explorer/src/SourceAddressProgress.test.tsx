import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SourceAddressProgress, sourceAddressProgressPercent } from "./SourceAddressProgress";

describe("pinned Win7 addressbar search progress", () => {
  it("maps fractional source discovered-folder progress to integer percentage", () => {
    expect(sourceAddressProgressPercent(0)).toBe(0);
    expect(sourceAddressProgressPercent(1/3)).toBe(33);
    expect(sourceAddressProgressPercent(.795)).toBe(80);
    expect(sourceAddressProgressPercent(1)).toBe(100);
  });
  it("clamps invalid values without drawing outside the location field", () => {
    expect(sourceAddressProgressPercent(-1)).toBe(0);
    expect(sourceAddressProgressPercent(10)).toBe(100);
    expect(sourceAddressProgressPercent(Infinity)).toBe(0);
    expect(sourceAddressProgressPercent(Number.NaN)).toBe(0);
  });
  it("is absent when original Computer passes progress=null", () => {
    expect(renderToStaticMarkup(<SourceAddressProgress fraction={null} />)).toBe("");
  });
  it("renders accessible numeric progress without adding a separate toolbar", () => {
    const html = renderToStaticMarkup(<SourceAddressProgress fraction={1/3} />);
    expect(html).toContain('class="explorer-address__progress"');
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-label="Search progress"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('aria-valuenow="33"');
    expect(html).toContain('style="width:33%"');
    expect(renderToStaticMarkup(<SourceAddressProgress fraction={1} />))
      .toContain('style="width:100%"');
  });
});

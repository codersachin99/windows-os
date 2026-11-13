import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SourceViewMenu } from "./SourceViewMenu";
import { SOURCE_VIEW_MODES, sourceViewModeAt, sourceViewModeIndex } from "./sourceViewModes";

describe("original Computer View popup and slider model", () => {
  it("has eight original locale-backed choices for the source 0-7 slider", () => {
    expect(SOURCE_VIEW_MODES.map(mode => mode.sourceKey)).toEqual([
      "xl-icons", "lg-icons", "md-icons", "sm-icons",
      "list", "details", "tiles", "content"
    ]);
    expect(SOURCE_VIEW_MODES.map(mode => mode.label)).toEqual([
      "Extra large icons", "Large icons", "Medium icons", "Small icons",
      "List", "Details", "Tiles", "Content"
    ]);
    SOURCE_VIEW_MODES.forEach((mode, i) => {
      expect(sourceViewModeIndex(mode.value)).toBe(i);
      expect(sourceViewModeAt(i)).toBe(mode.value);
    });
    expect(sourceViewModeAt(-5)).toBe("extra-large-icons");
    expect(sourceViewModeAt(13)).toBe("content");
  });

  it("exposes an accessible View trigger for both Computer and Bin", () => {
    const html=renderToStaticMarkup(<SourceViewMenu value="details" onChange={() => {}} />);
    expect(html).toContain('aria-label="View"');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("View: Details");
  });
});

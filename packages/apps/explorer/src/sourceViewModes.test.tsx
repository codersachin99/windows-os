import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SourceViewMenu } from "./SourceViewMenu";
import { SOURCE_VIEW_MODES, sourceViewModeAt, sourceViewModeIndex } from "./sourceViewModes";
import { legacyArt } from "@windows-os/assets";

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
    expect(SOURCE_VIEW_MODES.map(mode => legacyArt.viewModeIcon[mode.value])).toEqual([
      "/assets/images/view-xl-icons.98501d90.webp",
      "/assets/images/view-lg-icons.5eeaf0f2.webp",
      "/assets/images/view-md-icons.13e6ed1c.webp",
      "/assets/images/view-sm-icons.198c1e08.webp",
      "/assets/images/view-list.daaaa500.webp",
      "/assets/images/view-details.6c230237.webp",
      "/assets/images/view-tiles.c4008351.webp",
      "/assets/images/view-content.fe756cda.webp"
    ]);
  });

  it("exposes an accessible View trigger for both Computer and Bin", () => {
    const html=renderToStaticMarkup(<SourceViewMenu value="details" onChange={() => {}} />);
    expect(html).toContain('aria-label="View"');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("View: Details");
    expect(html).toContain('src="/assets/images/view-details.6c230237.webp"');
  });
});

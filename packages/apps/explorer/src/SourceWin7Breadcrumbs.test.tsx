import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { sourceComputerBreadcrumbs, SourceWin7Breadcrumbs } from "./SourceWin7Breadcrumbs";

const root = "/EXTERNAL/computer";
const disk = root + "/drive0";
const trash = disk + "/Users/Guest/AppData/Roaming/WindowsOS/Windows/RecycleBin";
const config = { root, drives: [{ path: "drive0", letter: "C", label: "System" }] };

describe("pinned Computer.getLocation breadcrumb semantics", () => {
  it("shows the Computer root for a root, or an unknown source path", () => {
    expect(sourceComputerBreadcrumbs("/", config)).toEqual([{label:"Computer",path:"/"}]);
    expect(sourceComputerBreadcrumbs(root, config)).toEqual([{label:"Computer",path:root}]);
    expect(sourceComputerBreadcrumbs("/other/unmounted", config))
      .toEqual([{label:"Computer",path:root}]);
  });
  it("creates clickable disk and folder segment targets using source mounted paths", () => {
    expect(sourceComputerBreadcrumbs(disk + "/Users/Guest/Documents", config)).toEqual([
      { label:"Computer", path:root },
      { label:"System (C:)", path:disk },
      { label:"Users", path:disk+"/Users" },
      { label:"Guest", path:disk+"/Users/Guest" },
      { label:"Documents", path:disk+"/Users/Guest/Documents" }
    ]);
  });
  it("keeps encoded folder path bytes but decodes displayed labels", () => {
    expect(sourceComputerBreadcrumbs(disk + "/My%20Folder", config).at(-1))
      .toEqual({ label:"My Folder", path:disk + "/My%20Folder" });
    expect(sourceComputerBreadcrumbs(disk + "/broken%Q", config).at(-1))
      .toEqual({ label:"broken%Q", path:disk + "/broken%Q" });
  });
  it("maps the Recycle Bin and its descendants to one Bin segment, as source does", () => {
    expect(sourceComputerBreadcrumbs(trash + "/Old.txt", config, trash))
      .toEqual([{label:"Recycle Bin",path:trash}]);
    expect(sourceComputerBreadcrumbs(trash, config, trash))
      .toEqual([{label:"Recycle Bin",path:trash}]);
  });
  it("renders clickable source segments, location state, and 18px icon without HTML injection", () => {
    const items = sourceComputerBreadcrumbs(disk + "/Users/Guest", config);
    const html = renderToStaticMarkup(
      <SourceWin7Breadcrumbs items={items} icon="/computer.png" onNavigate={() => {}} />
    );
    expect(html).toContain('aria-label="Folder path"');
    expect(html).toContain('class="explorer-address__source-icon"');
    expect(html).toContain('aria-current="location"');
    // One source icon button + four clickable labels + four inert disclosures.
    expect((html.match(/type="button"/g) ?? [])).toHaveLength(9);
    expect((html.match(/aria-label="Show sibling folders"/g) ?? [])).toHaveLength(4);
    expect(html).toContain('class="explorer-address__source-item"');
    expect(html).toContain('class="explorer-address__source-disclosure"');
    expect(html).toContain("System (C:)");
    expect(html).toContain("Guest");
  });
});

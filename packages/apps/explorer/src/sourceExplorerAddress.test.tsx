import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { sourceExplorerAddressBreadcrumbs } from "./sourceExplorerAddress";
import { SourceWin7Breadcrumbs } from "./SourceWin7Breadcrumbs";

const root="/EXTERNAL/computer";
const disk=root+"/drive0";
const cfg={root,drives:[{path:"drive0",letter:"C",label:"System"}]};
const bin=disk+"/Users/Guest/AppData/Roaming/WindowsOS/Windows/RecycleBin";

describe("original Computer addressbar search-results location", () => {
  it("retains clickable mounted hierarchy outside a virtual source search", () => {
    const result=sourceExplorerAddressBreadcrumbs(disk+"/Users",cfg,bin,false);
    expect(result.map(x=>x.label)).toEqual(["Computer","System (C:)","Users"]);
    expect(result.at(-1)).toEqual({label:"Users",path:disk+"/Users"});
  });
  it("displays scoped search results for normal shell:search, without a fake URI", () => {
    expect(sourceExplorerAddressBreadcrumbs(disk+"/Users/Guest/Documents",cfg,bin,true))
      .toEqual([{label:"Search Results in Documents",path:null}]);
    expect(sourceExplorerAddressBreadcrumbs(disk,cfg,bin,true))
      .toEqual([{label:"Search Results in System (C:)",path:null}]);
  });
  it("matches the original classic Find's unscoped result label", () => {
    expect(sourceExplorerAddressBreadcrumbs(disk,cfg,bin,true,true))
      .toEqual([{label:"Search Results",path:null}]);
  });
  it("uses original Computer/Bin fallbacks instead of a virtual disk", () => {
    expect(sourceExplorerAddressBreadcrumbs(root,cfg,bin,true))
      .toEqual([{label:"Search Results in Computer",path:null}]);
    expect(sourceExplorerAddressBreadcrumbs(bin,cfg,bin,true))
      .toEqual([{label:"Search Results in Recycle Bin",path:null}]);
  });
  it("renders result location as text, never as a navigable folder button", () => {
    const html=renderToStaticMarkup(<SourceWin7Breadcrumbs
      items={sourceExplorerAddressBreadcrumbs(disk,cfg,bin,true,true)}
      icon="/search.png" onNavigate={() => { throw Error("should not navigate"); }} />);
    expect(html).toContain("Search Results");
    expect(html).toContain('aria-current="location"');
    expect(html).toContain("explorer-address__source-static");
    expect(html).not.toContain('type="button"');
  });
});

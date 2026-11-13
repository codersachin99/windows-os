import { describe, expect, it } from "vitest";
import { createSourceFindQuery, decodeSourceSearchPath, encodeSourceFindPath,
  parseSourceSearchText, sourceFindSearchRequest, matchesSourceKind } from "./index";
import { sourceSearchLocations } from "./sourceSearchLocations";

describe("original shared search kinds and scopes", () => {
  it("offers source 2e2c kinds without replacing the existing query contract", () => {
    for (const kind of ["folder", "document", "picture", "music", "video",
      "playlist", "program", "link", "webpage"] as const) {
      const q = { ...createSourceFindQuery("/"), kind };
      const searchPath = decodeSourceSearchPath(encodeSourceFindPath(q));
      expect(searchPath?.text).toBe("kind:" + kind);
      expect(parseSourceSearchText(searchPath?.text || "").filters.kind).toBe(kind);
      expect(sourceFindSearchRequest(q).kind).toBe(kind);
    }
    expect(matchesSourceKind({ uri:"/a.lnk", name:"a.lnk", type:"file", size:1, mtime:0 }, "link")).toBe(true);
    expect(matchesSourceKind({ uri:"/a.png", name:"a.png", type:"file", size:1, mtime:0 }, "picture")).toBe(true);
  });
  it("lists source Documents and Computer even before disk metadata is available", () => {
    expect(sourceSearchLocations(null)).toEqual([
      expect.objectContaining({ label:"Documents" }), { value:"", label:"Computer" }
    ]);
    expect(sourceSearchLocations(null,"/Custom")[0]).toEqual({ value:"/Custom", label:"Custom" });
  });
});

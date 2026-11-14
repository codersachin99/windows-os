import { describe, expect, it } from "vitest";
import { createSourceFindQuery, decodeSourceSearchPath, encodeSourceFindPath,
  parseSourceSearchText, sourceFindSearchRequest, matchesSourceKind } from "./index";
import { sourceComputerSearchLocation, sourceSearchLocations } from "./sourceSearchLocations";
import { LegacyVolumeSession, VirtualFileStore, sourceGuestMounts, SOURCE_SYSTEM_DISK } from "./index";

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
 
describe("original 4cca disk-aware Computer search-result locations",()=>{
  it("converts a validated mounted drive parent into a Windows path",()=>{
    const volume=new LegacyVolumeSession(new VirtualFileStore(),sourceGuestMounts());
    expect(sourceComputerSearchLocation(
      SOURCE_SYSTEM_DISK+"/Users/Guest/Documents/example.txt",volume))
      .toBe("C:\\Users\\Guest\\Documents");
    expect(sourceComputerSearchLocation(SOURCE_SYSTEM_DISK+"/file.txt",volume))
      .toBe("C:\\");
    expect(sourceComputerSearchLocation(
      "/EXTERNAL/computer/drive01/not-a-real-mount.txt",volume))
      .toBe("/EXTERNAL/computer/drive01");
  });
  it("retains source raw parent when metadata is missing or unmounted",()=>{
    const uri=SOURCE_SYSTEM_DISK+"/Users/Guest/Documents/example.txt";
    expect(sourceComputerSearchLocation(uri,null))
      .toBe(SOURCE_SYSTEM_DISK+"/Users/Guest/Documents");
    const volume=new LegacyVolumeSession(new VirtualFileStore(),{
      ...sourceGuestMounts(),disks:[]
    });
    expect(sourceComputerSearchLocation(uri,volume))
      .toBe(SOURCE_SYSTEM_DISK+"/Users/Guest/Documents");
  });
});

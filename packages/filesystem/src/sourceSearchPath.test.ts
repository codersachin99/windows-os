import { describe, expect, it } from "vitest";
import { decodeSourceSearchPath, encodeSourceSearchPath, isSourceSearchPath } from "./sourceSearchPath";

describe("pinned 5401.k shell:search and 2e2c.f/d URI contract",()=>{
  it("serializes q then in then optional name and sub with URLSearchParams",()=>{
    const path=encodeSourceSearchPath({
      text:"kind:document size:>=1kb",scope:"/Guest/Documents",
      namePattern:"*.txt; Report",subfolders:false
    });
    expect(path).toBe(
      "shell:search?q=kind%3Adocument+size%3A%3E%3D1kb&in=%2FGuest%2FDocuments&name=*.txt%3B+Report&sub=0");
    expect(decodeSourceSearchPath(path)).toEqual({
      text:"kind:document size:>=1kb",scope:"/Guest/Documents",
      namePattern:"*.txt; Report",subfolders:false
    });
    expect(isSourceSearchPath(path)).toBe(true);
  });
  it("keeps the source distinction between missing name and empty name",()=>{
    expect(encodeSourceSearchPath({text:"report",scope:null,namePattern:null,subfolders:true}))
      .toBe("shell:search?q=report&in=");
    expect(encodeSourceSearchPath({text:"",scope:null,namePattern:"",subfolders:true}))
      .toBe("shell:search?q=&in=&name=");
    expect(decodeSourceSearchPath("shell:search?q=report&in=")).toEqual({
      text:"report",scope:null,namePattern:null,subfolders:true
    });
  });
  it("never treats shell paths or non-canonical scopes as physical VFS paths",()=>{
    expect(isSourceSearchPath("/guest")).toBe(false);
    expect(decodeSourceSearchPath("shell:search?q=x&in=..%2Fhost")).toBeNull();
    expect(decodeSourceSearchPath("shell:search?q=x&in=%2Fguest%2F..%2F..%2Fhost")).toBeNull();
    expect(decodeSourceSearchPath("shell:search?q=x&in=%2Fguest%2FDocs")).toMatchObject({
      scope:"/guest/Docs",text:"x",namePattern:null,subfolders:true
    });
    expect(decodeSourceSearchPath("shell:search?q=x&in=%2Fguest&sub=0")?.subfolders).toBe(false);
  });
});

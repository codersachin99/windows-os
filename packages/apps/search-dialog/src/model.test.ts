import { describe, expect, it } from "vitest";
import { createSourceFindQuery } from "@windows-os/filesystem";

describe("original Search Dialog fbbb source contract", () => {
  it("initial '*.*' search is scoped to the original parent Computer folder", () => {
    expect({ ...createSourceFindQuery("/drive/Docs"),
      namePattern:"*.*",subfolders:true }).toEqual({
      scope:"/drive/Docs",namePattern:"*.*",subfolders:true,kind:"",date:null,size:null
    });
  });
  it("does not require a separate Find window to search the parent folder", () => {
    expect({ ...createSourceFindQuery("/drive"), namePattern:"invoice",subfolders:false })
      .toMatchObject({scope:"/drive",namePattern:"invoice",subfolders:false});
  });
});

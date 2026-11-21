import { describe, expect, it } from "vitest";
import { companionDefaults, companionQuery } from "./model";

describe("legacy Search Companion 7a5f form",()=>{
  it("retains source initial fields and blank filters",()=>{
    const form=companionDefaults("/guest/Documents","report");
    expect(form).toMatchObject({namePattern:"report",scope:"/guest/Documents",
      subfolders:true,kind:"",dateChoice:"none",sizeChoice:"none",
      sizeBound:"at-least",sizeKb:0});
    expect(companionQuery(form,"/")).toEqual({scope:"/guest/Documents",
      namePattern:"report",subfolders:true,kind:"",date:null,size:null});
  });
  it("maps exact source date and size presets",()=>{
    const f=companionDefaults("");
    expect(companionQuery({...f,dateChoice:"week",sizeChoice:"small"},"/root"))
      .toMatchObject({scope:"/root",date:{days:7},size:{atLeast:false,kb:100}});
    expect(companionQuery({...f,dateChoice:"year",sizeChoice:"large"},"/root"))
      .toMatchObject({date:{months:12},size:{atLeast:true,kb:1024}});
    expect(companionQuery({...f,dateChoice:"month",sizeChoice:"medium"},"/root"))
      .toMatchObject({date:{months:1},size:{atLeast:false,kb:1024}});
  });
  it("maps between/custom size and keeps source subfolder/type fields",()=>{
    const f={...companionDefaults("/docs"),dateChoice:"between" as const,
      dateFrom:"2026-11-01",dateTo:"2026-11-13",sizeChoice:"specify" as const,
      sizeBound:"at-most" as const,sizeKb:72,subfolders:false,kind:"picture" as const};
    expect(companionQuery(f,"/")).toMatchObject({scope:"/docs",subfolders:false,
      kind:"picture",date:{from:"2026-11-01",to:"2026-11-13"},
      size:{atLeast:false,kb:72}});
  });
});

import {describe,it,expect} from "vitest";
import {
  SOURCE_CPANEL_INITIAL_HISTORY,SOURCE_CPANEL_ZOOM_CHOICES,
  sourceCpanelOpenLocation,sourceCpanelStep,sourceCpanelResolutions,
  sourceCpanelDisplayMatch,sourceCpanelInstalledPrograms,
  sourceCpanelProgramsMatch
} from "./model";

describe("pinned a259 cpanel location history",()=>{
  it("keeps root, back/forward and discards the forward branch after new navigation",()=>{
    const initial=SOURCE_CPANEL_INITIAL_HISTORY;
    expect(sourceCpanelStep(initial,-1)).toBe(initial);
    const display=sourceCpanelOpenLocation(initial,"display");
    expect(display).toEqual({entries:[null,"display"],index:1});
    expect(sourceCpanelOpenLocation(display,"display")).toBe(display);
    const back=sourceCpanelStep(display,-1);
    expect(back.index).toBe(0);
    expect(sourceCpanelStep(back,1)).toEqual(display);
    expect(sourceCpanelStep(display,1)).toBe(display);
    expect(sourceCpanelOpenLocation(back,null)).toBe(back);
    expect(sourceCpanelOpenLocation(back,"display").entries)
      .toEqual([null,"display"]);
  });
  it("retains exact original Display aspect-ratio options and zoom labels",()=>{
    expect(sourceCpanelResolutions(1920,1080)).toEqual([
      {value:"fullscreen",label:"1920 x 1080 (Fullscreen)"},
      {value:"4:3",label:"1440 x 1080 (4:3)"},
      {value:"16:10",label:"1728 x 1080 (16:10)"},
      {value:"16:9",label:"1920 x 1080 (16:9)"},
      {value:"21:9",label:"1920 x 823 (21:9)"}
    ]);
    expect(SOURCE_CPANEL_ZOOM_CHOICES.map(x=>x.label))
      .toEqual(["70%","85%","100%","125%","150%","175%","200%"]);
  });
  it("searches only the verified Display subset until source index is ported",()=>{
    expect(sourceCpanelDisplayMatch("display")).toBe(true);
    expect(sourceCpanelDisplayMatch("RESOLUTION")).toBe(true);
    expect(sourceCpanelDisplayMatch("screen zoom")).toBe(true);
    expect(sourceCpanelDisplayMatch("sound")).toBe(false);
    expect(sourceCpanelDisplayMatch("")).toBe(false);
  });
});


describe("source cpanel.js ra Programs list from the actual source install manifest",()=>{
  it("sorts and filters installed visible source packages without invented metadata",()=>{
    const programs=[
      {id:"zeta",name:"Zeta",category:"accessories",installPath:"Windows/zeta.exe"},
      {id:"alpha",name:"Alpha",category:"games",installPath:"Windows/alpha.exe"},
      {id:"hidden",name:"Hidden",category:"system",installPath:"Windows/hidden.exe",hidden:true},
      {id:"missing",name:"Missing",category:"system"}
    ];
    const rows=sourceCpanelInstalledPrograms(programs);
    expect(rows.map(p=>p.id)).toEqual(["alpha","zeta"]);
    expect(rows[0]).toMatchObject({
      name:"Alpha",version:"--",type:"Simulation",iconKey:"alpha"
    });
    expect(sourceCpanelProgramsMatch("uninstall")).toBe(true);
    expect(sourceCpanelProgramsMatch("PROGRAM")).toBe(true);
    expect(sourceCpanelProgramsMatch("sound")).toBe(false);
  });
});

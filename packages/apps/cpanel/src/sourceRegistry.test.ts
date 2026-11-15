import {describe,it,expect} from "vitest";
import {sourceProgramsById} from "@windows-os/filesystem";
import {legacyCpanelTileArtwork} from "@windows-os/assets";
import {
  SOURCE_CPANEL_REGISTRY,sourceCpanelIsSupported,sourceCpanelSearchRegistry
} from "./sourceRegistry";

const sourceOrder=[
  "data","datetime","default","storage","display","action-center","backup",
  "access","gadgets","keyboard","mouse","notification","personalize",
  "power","programs","region","sound","speech","sync","system","taskbar",
  "accounts","defender","update"
];
describe("pinned source 3097/a97a Control Panel registry",()=>{
  it("preserves all 24 original items in their exact source order",()=>{
    expect(SOURCE_CPANEL_REGISTRY.map(x=>x.id)).toEqual(sourceOrder);
    expect(new Set(sourceOrder).size).toBe(24);
    expect(SOURCE_CPANEL_REGISTRY.filter(x=>x.target==="panel")
      .map(x=>x.id)).toEqual([
        "display","action-center","backup","notification","programs","accounts"
      ]);
    expect(SOURCE_CPANEL_REGISTRY.filter(x=>x.target==="program")
      .every(x=>sourceProgramsById.has(x.id))).toBe(true);
  });
  it("retains exact source translations, category, targets and task redirections",()=>{
    expect(SOURCE_CPANEL_REGISTRY.find(x=>x.id==="display")).toMatchObject({
      label:"Display",category:"appearance",target:"panel",iconKey:"display"
    });
    expect(SOURCE_CPANEL_REGISTRY.find(x=>x.id==="backup")).toMatchObject({
      label:"Backup and Restore",category:"system-security",target:"panel",
      tasks:[{label:"Back up your computer"}]
    });
    expect(SOURCE_CPANEL_REGISTRY.find(x=>x.id==="sound")?.label).toBe("Sounds");
    expect(SOURCE_CPANEL_REGISTRY.find(x=>x.id==="taskbar")?.tasks)
      .toContainEqual(expect.objectContaining({
        label:"Customize icons on the taskbar",id:"notification"
      }));
    expect(SOURCE_CPANEL_REGISTRY.reduce((a,x)=>a+x.tasks.length,0)).toBe(66);
  });
  it("has a pinned original artwork path for every root icon key",()=>{
    const icons=SOURCE_CPANEL_REGISTRY.map(item=>legacyCpanelTileArtwork[item.iconKey]);
    expect(icons).toHaveLength(24);
    expect(icons.every(path=>path?.endsWith(".webp"))).toBe(true);
    expect(legacyCpanelTileArtwork.backup).toContain("backup.5e4eb80c.webp");
    expect(legacyCpanelTileArtwork["action-center-headline"])
      .toContain("action-center-headline.27cc6d83.webp");
  });
  it("keeps unavailable program/settings visible, but not falsely executable",()=>{
    expect(sourceCpanelIsSupported("display")).toBe(true);
    expect(sourceCpanelIsSupported("backup")).toBe(true);
    expect(sourceCpanelIsSupported("notification")).toBe(true);
    expect(sourceCpanelIsSupported("defender")).toBe(false);
    expect(sourceCpanelIsSupported("taskbar")).toBe(false);
    expect(sourceCpanelIsSupported("gadgets")).toBe(false);
  });
});
describe("pinned a682 + 5985 weighted search across original tasks",()=>{
  it("returns real task labels and keyword searches for all source entries",()=>{
    const result=sourceCpanelSearchRegistry("resolution");
    expect(result[0].item.id).toBe("display");
    expect(result[0].tasks.map(x=>x.label)).toContain("Adjust screen resolution");
    expect(sourceCpanelSearchRegistry("uninstall")[0].item.id).toBe("programs");
    expect(sourceCpanelSearchRegistry("spyware")[0].item.id).toBe("defender");
    expect(sourceCpanelSearchRegistry("recovery")[0].item.id).toBe("backup");
    expect(sourceCpanelSearchRegistry("change the time zone")[0].item.id).toBe("datetime");
  });
  it("prefers exact heading and source redirect for a supported task",()=>{
    expect(sourceCpanelSearchRegistry("Display")[0].item.id).toBe("display");
    const taskbar=sourceCpanelSearchRegistry("customize icons").find(
      item=>item.item.id==="taskbar");
    expect(taskbar?.tasks.map(x=>x.id)).toContain("notification");
  });
  it("does not silently match middle-of-word or unknown labels",()=>{
    expect(sourceCpanelSearchRegistry("solution")).toEqual([]);
    expect(sourceCpanelSearchRegistry("unavailable-widget")).toEqual([]);
    expect(sourceCpanelSearchRegistry("")).toEqual([]);
  });
});

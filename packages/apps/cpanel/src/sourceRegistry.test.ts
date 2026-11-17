import {describe,it,expect} from "vitest";
import {sourceProgramsById} from "@windows-os/filesystem";
import {legacyCpanelTileArtwork} from "@windows-os/assets";
import {
  SOURCE_CPANEL_REGISTRY,sourceCpanelIsSupported,sourceCpanelIsMigratedProgram,
  SOURCE_CPANEL_MIGRATED_PROGRAMS,sourceCpanelSearchRegistry,
  sourceCpanelCanOpenTask,sourceCpanelProgramTaskView,
  sourceCpanelAddressIconKey
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
    const backup=SOURCE_CPANEL_REGISTRY.find(x=>x.id==="backup");
    expect(backup).toMatchObject({
      label:"Backup and Restore",category:"system-security",target:"panel"
    });
    expect(backup?.tasks.map(task=>task.label)).toEqual([
      "Back up your computer","Restore data, files, or computers from backup"
    ]);
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
  it("distinguishes the two migrated program windows from Control Panel pages",()=>{
    expect(SOURCE_CPANEL_MIGRATED_PROGRAMS).toEqual(["personalize","taskbar"]);
    for(const id of SOURCE_CPANEL_MIGRATED_PROGRAMS){
      expect(sourceCpanelIsMigratedProgram(id)).toBe(true);
      expect(SOURCE_CPANEL_REGISTRY.find(item=>item.id===id)?.target).toBe("program");
      // These must not be misclassified as in-panel history destinations.
      expect(sourceCpanelIsSupported(id)).toBe(false);
    }
    for(const id of ["defender","gadgets","display","notification"]){
      expect(sourceCpanelIsMigratedProgram(id)).toBe(false);
    }
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
  it("uses original quoted phrases, filter grammar, and weighted task ranking",()=>{
    expect(sourceCpanelSearchRegistry('"screen resolution"')[0].item.id)
      .toBe("display");
    expect(sourceCpanelSearchRegistry('"screen resolution"')[0].tasks
      .map(x=>x.label)).toContain("Adjust screen resolution");
    expect(sourceCpanelSearchRegistry("recovery kind:zip")[0].item.id)
      .toBe("backup");
    expect(sourceCpanelSearchRegistry('kind:"screen resolution"')).toEqual([]);
    expect(sourceCpanelSearchRegistry('"backup restore nonsense"')).toEqual([]);
    expect(sourceCpanelSearchRegistry("display")[0].score).toBe(1010);
    expect(sourceCpanelSearchRegistry("disp")[0].score).toBe(110);
  });
  it("does not silently match middle-of-word or unknown labels",()=>{
    expect(sourceCpanelSearchRegistry("solution")).toEqual([]);
    expect(sourceCpanelSearchRegistry("unavailable-widget")).toEqual([]);
    expect(sourceCpanelSearchRegistry("")).toEqual([]);
  });
});

describe("source a259 addressIcon and a97a current-location art",()=>{
  it("uses Control Panel art at root and registry artwork at a child",()=>{
    expect(sourceCpanelAddressIconKey(null)).toBe("cpanel");
    for(const location of ["display","programs","accounts","notification",
      "action-center","backup"]){
      const registry=SOURCE_CPANEL_REGISTRY.find(item=>item.id===location);
      expect(registry).toBeDefined();
      expect(sourceCpanelAddressIconKey(location)).toBe(registry?.iconKey);
      expect(legacyCpanelTileArtwork[sourceCpanelAddressIconKey(location)])
        .toMatch(/\.webp$/);
    }
    expect(sourceCpanelAddressIconKey("action-center"))
      .toBe("action-center-headline");
  });
  it("falls back to root artwork for unknown/corrupt historical locations",()=>{
    expect(sourceCpanelAddressIconKey("missing-panel")).toBe("cpanel");
  });
});

describe("source Control Panel program task fidelity",()=>{
  const personalize=SOURCE_CPANEL_REGISTRY.find(item=>item.id==="personalize")!;
  const taskbar=SOURCE_CPANEL_REGISTRY.find(item=>item.id==="taskbar")!;
  const task=(item:typeof personalize,label:string)=>{
    const result=item.tasks.find(value=>value.label===label);
    expect(result).toBeDefined();
    return result!;
  };
  it("deep-links the only implemented original Personalize tasks",()=>{
    expect(sourceCpanelProgramTaskView(task(personalize,"Change the theme")))
      .toBe("theme");
    expect(sourceCpanelProgramTaskView(task(personalize,"Change desktop background")))
      .toBe("background");
    for(const label of ["Change the theme","Change desktop background"])
      expect(sourceCpanelCanOpenTask(task(personalize,label))).toBe(true);
  });
  it("does not enable unimplemented color, screen saver or source-disabled taskbar controls",()=>{
    for(const label of ["Change window glass colors","Change screen saver",
      "Change sound effects","Change mouse pointers"]){
      const original=task(personalize,label);
      expect(sourceCpanelProgramTaskView(original)).toBeNull();
      expect(sourceCpanelCanOpenTask(original)).toBe(false);
    }
    for(const label of ["Customize the Start menu","Auto-hide the taskbar",
      "Lock or unlock the taskbar"]){
      const original=task(taskbar,label);
      expect(sourceCpanelProgramTaskView(original)).toBeNull();
      expect(sourceCpanelCanOpenTask(original)).toBe(false);
    }
  });
  it("preserves pinned source task redirect to implemented Notification Area",()=>{
    const notification=task(taskbar,"Customize icons on the taskbar");
    expect(notification.id).toBe("notification");
    expect(sourceCpanelCanOpenTask(notification)).toBe(true);
    expect(sourceCpanelProgramTaskView(notification)).toBeNull();
  });
});

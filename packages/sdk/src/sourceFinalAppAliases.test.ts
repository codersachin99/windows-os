import {describe,expect,it} from "vitest";
import type {AppDefinition} from "@windows-os/contracts";
import {AppRegistry,appRegistry} from "./index";
import {SOURCE_FINAL_APP_ALIASES,sourceRegisteredAliases} from "./sourceFinalAppAliases";

const fake=(id:string,aliases?:readonly string[]):AppDefinition=>({
  id,label:id,icon:"/test.svg",kind:"utility",
  window:{width:200,height:160},aliases
});

describe("final locked source application aliases",()=>{
  it("preserves exact pinned aliases without inventing unported programs",()=>{
    expect(SOURCE_FINAL_APP_ALIASES.calc).toEqual(["calculator"]);
    expect(SOURCE_FINAL_APP_ALIASES.sticky).toEqual(["notes","stickynotes"]);
    expect(SOURCE_FINAL_APP_ALIASES.computer)
      .toEqual(["explorer","documents","music","pictures"]);
    expect(sourceRegisteredAliases("computer")).toEqual(["explorer"]);
    expect(sourceRegisteredAliases("mouse")).toEqual([]);
    expect(appRegistry.get("calculator")?.id).toBe("calc");
    expect(appRegistry.get("CALCULATOR")?.id).toBe("calc");
    expect(appRegistry.get("explorer")?.id).toBe("computer");
    expect(appRegistry.get("control")?.id).toBe("cpanel");
    expect(appRegistry.get("winver")?.id).toBe("about");
    expect(appRegistry.get("sysdm.cpl")?.id).toBe("system");
    expect(appRegistry.get("desk.cpl")?.id).toBe("personalize");
    expect(appRegistry.get("wmplayer")?.id).toBe("player");
    expect(appRegistry.get("notes")?.id).toBe("sticky");
    expect(appRegistry.get("stickynotes")?.id).toBe("sticky");
    expect(appRegistry.get("mspaint")).toBeUndefined();
    expect(appRegistry.get("documents")).toBeUndefined();
    expect(appRegistry.get("main.cpl")).toBeUndefined();
    expect(appRegistry.get("C:/Windows/System32/calc.exe")).toBeUndefined();
    expect(appRegistry.get("powershell")).toBeUndefined();
    expect(appRegistry.get("sticky")?.allowMultipleWindows).toBe(false);
  });

  it("does not increase installed app count or expose aliases as desktop icons",()=>{
    const apps=appRegistry.list();
    expect(apps.filter(app=>app.id==="calc")).toHaveLength(1);
    expect(apps.some(app=>app.id==="calculator")).toBe(false);
    expect(appRegistry.startMenu().some(app=>app.id==="calculator")).toBe(false);
  });

  it("supports safe extension aliases but rejects paths and collisions atomically",()=>{
    const registry=new AppRegistry([fake("app",["doit","name.cpl"])]);
    expect(registry.get("name.cpl")?.id).toBe("app");
    expect(()=>registry.register(fake("doit"))).toThrow(/Duplicate app id/);
    expect(()=>registry.register(fake("next",["name.cpl"])))
      .toThrow(/duplicate app alias/);
    expect(()=>registry.register(fake("unsafe",["../evil"])))
      .toThrow(/Invalid or duplicate app alias/);
    expect(()=>registry.register(fake("unsafe",["https://test"])))
      .toThrow(/Invalid or duplicate app alias/);
    expect(()=>registry.register(fake("twice",["a","a"])))
      .toThrow(/Duplicate app alias/);
    expect(registry.list().map(app=>app.id)).toEqual(["app"]);
  });
});

import { describe, expect, it } from "vitest";
import {
  DesktopPositionStore, SOURCE_DESKTOP_DRAG_THRESHOLD,
  SOURCE_DESKTOP_ICON_SIZES, boundedIconDrag, positionForIcon
} from "./desktopPositions";

class Storage {
  data = new Map<string,string>();
  getItem(k:string) { return this.data.get(k)??null; }
  setItem(k:string, v:string) { this.data.set(k,v); }
}
const area={width:800,height:600};
describe("legacy source desktop icon layout and persisted positions",()=>{
  it("reproduces source icon sizes, 4px threshold and column-first layout",()=>{
    const layout=new DesktopPositionStore();
    expect(SOURCE_DESKTOP_ICON_SIZES).toEqual({sm:50,md:80,lg:120});
    expect(SOURCE_DESKTOP_DRAG_THRESHOLD).toBe(4);
    expect(layout.snapshot()).toMatchObject({
      iconSize:"md",autoArrange:false,showIcons:true
    });
    expect(layout.placement("bin",0,area)).toEqual({x:0,y:0});
    expect(layout.placement("computer",1,area)).toEqual({x:0,y:80});
    expect(layout.placement("seventh",6,area)).toEqual({x:80,y:0});
  });
  it("persists manually moved shortcuts but does not change other icon positions",()=>{
    const storage=new Storage(), store=new DesktopPositionStore(storage);
    expect(store.move([{id:"computer",index:1}],area,{x:125,y:37}))
      .toEqual({x:125,y:37});
    expect(store.placement("computer",1,area)).toEqual({x:125,y:117});
    expect(store.placement("bin",0,area)).toEqual({x:0,y:0});
    const copy=new DesktopPositionStore(storage);
    expect(copy.placement("computer",1,area)).toEqual({x:125,y:117});
  });
  it("moves selected groups together and keeps them inside the available viewport",()=>{
    const layout=new DesktopPositionStore();
    const offset=layout.move([
      {id:"bin",index:0},{id:"computer",index:1}
    ],{width:190,height:230},{x:500,y:500});
    expect(offset).toEqual({x:110,y:70});
    expect(layout.placement("bin",0,{width:190,height:230})).toEqual({x:110,y:70});
    expect(layout.placement("computer",1,{width:190,height:230})).toEqual({x:110,y:150});
    expect(boundedIconDrag([{x:20,y:40}],area,80,{x:-400,y:-400}))
      .toEqual({x:-20,y:-40});
  });
  it("auto arrange shows source order without deleting stored free-position coordinates",()=>{
    const storage=new Storage(),layout=new DesktopPositionStore(storage);
    layout.move([{id:"computer",index:1}],area,{x:100,y:30});
    layout.setAutoArrange(true);
    expect(layout.placement("computer",1,area)).toEqual({x:0,y:80});
    expect(layout.move([{id:"computer",index:1}],area,{x:50,y:50}))
      .toEqual({x:0,y:0});
    layout.setAutoArrange(false);
    expect(new DesktopPositionStore(storage).placement("computer",1,area))
      .toEqual({x:100,y:110});
  });
  it("saves source size and visibility settings and clamps display on narrow screens",()=>{
    const storage=new Storage(),layout=new DesktopPositionStore(storage);
    layout.move([{id:"bin",index:0}],area,{x:500,y:300});
    layout.setIconSize("sm");
    layout.setShowIcons(false);
    const restored=new DesktopPositionStore(storage);
    expect(restored.snapshot()).toMatchObject({iconSize:"sm",showIcons:false});
    expect(restored.placement("bin",0,{width:120,height:130})).toEqual({x:70,y:80});
    expect(restored.placement("bin",0,area)).toEqual({x:500,y:300});
  });
  it("ignores malformed persisted snapshots and avoids overwriting on storage failure",()=>{
    const storage=new Storage();
    storage.setItem("windows-os:desktop-layout:guest:v1",'{"version":1,"positions":{"bin":{"x":-4,"y":0}}}');
    expect(new DesktopPositionStore(storage).snapshot().positions).toEqual({});
    const broken=new DesktopPositionStore({
      getItem:()=>null,
      setItem:()=>{throw new Error("quota exhausted");}
    });
    expect(()=>broken.move([{id:"bin",index:0}],area,{x:20,y:20}))
      .toThrow("quota exhausted");
    expect(broken.snapshot().positions).toEqual({});
  });
  it("honors saved pixel coordinates unless source auto mode is selected",()=>{
    const cfg=new DesktopPositionStore().snapshot();
    expect(positionForIcon(1,{x:250,y:260},cfg,area)).toEqual({x:250,y:260});
    expect(positionForIcon(1,{x:250,y:260},{...cfg,autoArrange:true},area))
      .toEqual({x:0,y:80});
  });
});

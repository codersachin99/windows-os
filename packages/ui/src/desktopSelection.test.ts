import {describe,it,expect} from "vitest";
import {
  desktopBand, desktopBandHits, desktopBandSelection
} from "./desktopSelection";
import {DesktopPositionStore} from "./desktopPositions";

const area={width:800,height:600};
const store=new DesktopPositionStore();
const items=[
  {id:"bin",index:0},{id:"computer",index:1},{id:"contacts",index:2}
];
describe("source desktop background rubber band selection",()=>{
  it("normalizes any corner and clamps band to icon area",()=>{
    expect(desktopBand({x:130,y:175},{x:2,y:5},area))
      .toEqual({left:2,top:5,width:128,height:170});
    expect(desktopBand({x:-50,y:-10},{x:2000,y:700},area))
      .toEqual({left:0,top:0,width:800,height:600});
  });
  it("selects icons with overlapping rectangles without moving their saved positions",()=>{
    const original=store.snapshot();
    const band=desktopBand({x:120,y:8},{x:8,y:151},area);
    expect(desktopBandHits(items,band,original,area)).toEqual(["bin","computer"]);
    expect(desktopBandHits(items,desktopBand({x:200,y:200},{x:250,y:250},area),original,area))
      .toEqual([]);
    expect(store.snapshot()).toEqual(original);
  });
  it("uses persisted free coordinates and recalculates automatically arranged hit boxes",()=>{
    const layout=new DesktopPositionStore();
    layout.move([{id:"computer",index:1}],area,{x:300,y:100});
    const free=layout.snapshot();
    const band=desktopBand({x:310,y:180},{x:320,y:195},area);
    expect(desktopBandHits(items,band,free,area)).toEqual(["computer"]);
    layout.setAutoArrange(true);
    expect(desktopBandHits(items,band,layout.snapshot(),area)).toEqual([]);
  });
  it("preserves baseline for Ctrl toggle and Shift additive band",()=>{
    expect(desktopBandSelection(["bin"],["bin","computer"],"replace"))
      .toEqual(["bin","computer"]);
    expect(desktopBandSelection(["contacts"],["bin","computer"],"add"))
      .toEqual(["contacts","bin","computer"]);
    expect(desktopBandSelection(["bin","contacts"],["bin","computer"],"toggle"))
      .toEqual(["contacts","computer"]);
    expect(desktopBandSelection(["bin"],["bin"],"toggle")).toEqual([]);
  });
  it("does not select when icons are hidden or rectangle is empty",()=>{
    const hidden={...store.snapshot(),showIcons:false};
    expect(desktopBandHits(items,{left:0,top:0,width:200,height:200},hidden,area)).toEqual([]);
    expect(desktopBandHits(items,{left:0,top:0,width:0,height:30},store.snapshot(),area))
      .toEqual([]);
  });
});

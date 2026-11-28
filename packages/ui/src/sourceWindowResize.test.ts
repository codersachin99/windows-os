import {describe,it,expect} from "vitest";
import {sourceResizeBounds,SOURCE_WINDOW_RESIZE_EDGES} from "./sourceWindowResize";
describe("frozen source window resize geometry",()=>{
  const origin={x:100,y:80,width:500,height:400},area={x:0,y:0,width:1000,height:660};
  it("provides eight directions",()=>expect(SOURCE_WINDOW_RESIZE_EDGES).toHaveLength(8));
  it("resizes southeast without moving top-left",()=>expect(sourceResizeBounds(origin,"se",80,50,area)).toEqual({x:100,y:80,width:580,height:450}));
  it("resizes northwest while preserving opposite edges",()=>expect(sourceResizeBounds(origin,"nw",40,20,area)).toEqual({x:140,y:100,width:460,height:380}));
  it("enforces source minimum dimensions",()=>expect(sourceResizeBounds(origin,"nw",900,900,area)).toEqual({x:280,y:240,width:320,height:240}));
  it("clamps within Guest work area",()=>expect(sourceResizeBounds(origin,"se",1000,1000,area)).toEqual({x:100,y:80,width:900,height:580}));
  it("respects a smaller mobile work area and reserved dock",()=>expect(sourceResizeBounds(origin,"se",1000,1000,{x:64,y:32,width:256,height:200})).toEqual({x:64,y:32,width:256,height:200}));
});

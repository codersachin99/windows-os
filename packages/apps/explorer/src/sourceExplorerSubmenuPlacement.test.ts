import {describe,it,expect} from "vitest";
import {sourceExplorerSubmenuPlacement} from "./sourceExplorerSubmenuPlacement";
const submenu={width:205,height:60};
const viewport={width:1280,height:720};
describe("pinned ExplorerMenu source submenu side/vertical clipping",()=>{
  it("opens to the right of the parent row on a wide desktop",()=>{
    expect(sourceExplorerSubmenuPlacement(
      {left:300,top:200,width:205,height:205},{top:248},submenu,viewport
    )).toEqual({left:203,top:48,side:"right"});
  });
  it("flips left when a Win7 context menu is near the right edge",()=>{
    expect(sourceExplorerSubmenuPlacement(
      {left:1070,top:150,width:205,height:205},{top:180},submenu,viewport
    )).toEqual({left:-203,top:30,side:"left"});
  });
  it("moves an opened child upward when its last item crosses the bottom",()=>{
    expect(sourceExplorerSubmenuPlacement(
      {left:200,top:674,width:205,height:80},{top:710},submenu,viewport
    )).toEqual({left:203,top:-18,side:"right"});
  });
  it("stays inside a narrow mobile viewport when neither side fits",()=>{
    const output=sourceExplorerSubmenuPlacement(
      {left:10,top:80,width:205,height:220},{top:105},submenu,
      {width:320,height:480}
    );
    // With no horizontal space, place the child below the parent instead
    // of covering the "Send to" trigger with an interactive submenu.
    expect(output).toEqual({left:0,top:222,side:"right"});
    expect(10+output.left+submenu.width).toBeLessThanOrEqual(320);
    expect(80+output.top+submenu.height).toBeLessThanOrEqual(480);
  });
  it("stacks a narrow mobile child above the parent when below is clipped",()=>{
    const parent={left:110,top:340,width:205,height:225};
    const child={width:205,height:64};
    const viewport={width:390,height:600};
    const placement=sourceExplorerSubmenuPlacement(
      parent,{top:400},child,viewport
    );
    expect(placement).toEqual({left:0,top:-66,side:"right"});
    expect(parent.top+placement.top+child.height)
      .toBeLessThan(parent.top);
    expect(parent.left+placement.left).toBeGreaterThanOrEqual(4);
  });
  it("preserves source adjacent side flipping on desktop for available space",()=>{
    const child={width:205,height:64};
    expect(sourceExplorerSubmenuPlacement(
      {left:100,top:100,width:205,height:240},{top:170},child,
      {width:1024,height:768}
    )).toEqual({left:203,top:70,side:"right"});
    expect(sourceExplorerSubmenuPlacement(
      {left:750,top:100,width:205,height:240},{top:170},child,
      {width:1024,height:768}
    )).toEqual({left:-203,top:70,side:"left"});
  });
  it("clamps negative overflow without propagating measured geometry changes",()=>{
    const placement=sourceExplorerSubmenuPlacement(
      {left:40,top:10,width:205,height:220},{top:20},
      {width:400,height:600},{width:320,height:480}
    );
    expect(placement.side).toBe("right");
    expect(placement.left).toBe(-36);
    expect(placement.top).toBe(-6);
  });
});

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
    expect(output).toEqual({left:101,top:25,side:"right"});
    expect(10+output.left+submenu.width).toBeLessThanOrEqual(320);
    expect(80+output.top+submenu.height).toBeLessThanOrEqual(480);
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

import {describe,it,expect} from "vitest";
import {
  SOURCE_CARD_DRAG_THRESHOLD,sourceCardDragShouldBegin,
  sourceCardRectOverlap,sourceCardBestDropTarget,sourceCardBoardPoint
} from "./sourceCardDrag";
describe("original shared 0510/5ea1 card drag and drop geometry",()=>{
  it("starts drag on a four-pixel axis delta, not radial distance",()=>{
    expect(SOURCE_CARD_DRAG_THRESHOLD).toBe(4);
    expect(sourceCardDragShouldBegin(10,20,13.9,20)).toBe(false);
    expect(sourceCardDragShouldBegin(10,20,14,20)).toBe(true);
    expect(sourceCardDragShouldBegin(10,20,10,16)).toBe(true);
    expect(sourceCardDragShouldBegin(10,20,13,23)).toBe(false);
  });
  it("uses positive bounding-box intersection area and first maximum",()=>{
    const dragged={x:50,y:50,width:80,height:100};
    const a={key:"foundation-0",x:51,y:49,width:80,height:100};
    const b={key:"tableau-1",x:60,y:60,width:80,height:100};
    const out={key:"tableau-2",x:250,y:250,width:80,height:100};
    expect(sourceCardRectOverlap(dragged,out)).toBe(0);
    expect(sourceCardRectOverlap(dragged,a)).toBe(79*99);
    expect(sourceCardBestDropTarget(dragged,[out,b,a])).toBe("foundation-0");
    expect(sourceCardBestDropTarget(dragged,[out])).toBeNull();
    expect(sourceCardBestDropTarget(dragged,[a,{...a,key:"other"}]))
      .toBe("foundation-0");
  });
  it("converts CSS-scaled board pointer coordinates as original 0510",()=>{
    const bounds={left:100,top:40,width:330};
    expect(sourceCardBoardPoint(265,90,bounds,660)).toEqual({x:330,y:100});
    expect(sourceCardBoardPoint(110,50,{...bounds,width:0},660))
      .toEqual({x:10,y:10});
  });
});

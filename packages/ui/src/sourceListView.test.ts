import {describe,it,expect} from "vitest";
import {sourceListViewExtraWidth} from "./sourceListView";
describe("pinned listview-details and listview-tiles extra contract",()=>{
  it("accepts pixel and percentage widths as safe CSS",()=>{
    expect(sourceListViewExtraWidth(140,3)).toBe("140px");
    expect(sourceListViewExtraWidth("25%",4)).toBe("25%");
    expect(sourceListViewExtraWidth(" 20px ",4)).toBe("20px");
    expect(sourceListViewExtraWidth(undefined,4)).toBe("25%");
  });
  it("does not inject arbitrary width expressions",()=>{
    expect(sourceListViewExtraWidth("calc(100vw)",2)).toBeUndefined();
    expect(sourceListViewExtraWidth("url(javascript:evil)",2)).toBeUndefined();
    expect(sourceListViewExtraWidth(-10,2)).toBeUndefined();
    expect(sourceListViewExtraWidth(Infinity,2)).toBeUndefined();
    expect(sourceListViewExtraWidth(undefined,0)).toBeUndefined();
  });
});

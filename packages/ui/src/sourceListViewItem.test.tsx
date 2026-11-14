import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {
 SourceListViewItem,sourceListItemHighlightParts,
 sourceListItemIsDoubleTap,SOURCE_LIST_ITEM_DOUBLE_TAP_MS
} from "./sourceListViewItem";

describe("pinned listview-item webpack 0616",()=>{
  it("preserves root source button class, selected state, key and type",()=>{
    const active=renderToStaticMarkup(
      <SourceListViewItem itemKey="/Documents/report.txt" itemType="file"
        itemLabel="report.txt" active className="explorer-item"
        aria-label="report.txt"><span>report.txt</span></SourceListViewItem>);
    expect(active).toContain("listview__item is-active explorer-item");
    expect(active).toContain('data-key="/Documents/report.txt"');
    expect(active).toContain('data-test-listview-item="file"');
    expect(active).toContain('title="report.txt"');
    expect(active).toContain('type="button"');
    const plain=renderToStaticMarkup(<SourceListViewItem
      itemKey="/a" itemType="directory" itemLabel="a">a</SourceListViewItem>);
    expect(plain).not.toContain("is-active");
    expect(plain).toContain('data-test-listview-item="directory"');
  });
  it("follows exact v-tap:400 source click-helper window",()=>{
    expect(SOURCE_LIST_ITEM_DOUBLE_TAP_MS).toBe(400);
    expect(sourceListItemIsDoubleTap(null,100)).toBe(false);
    expect(sourceListItemIsDoubleTap(100,499)).toBe(true);
    expect(sourceListItemIsDoubleTap(100,500)).toBe(false);
    expect(sourceListItemIsDoubleTap(100,99)).toBe(false);
    expect(sourceListItemIsDoubleTap(100,Number.NaN)).toBe(false);
  });
  it("matches source labelParts for ordered highlight ranges",()=>{
    expect(sourceListItemHighlightParts("Windows Explorer",[[0,3],[8,11]])).toEqual([
      {text:"Win",marked:true},{text:"dows ",marked:false},
      {text:"Exp",marked:true},{text:"lorer",marked:false}
    ]);
    expect(sourceListItemHighlightParts("ABC",[])).toEqual([{text:"ABC",marked:false}]);
    expect(sourceListItemHighlightParts("File",[[1,1],[-1,2],[1,3]])).toEqual([
      {text:"F",marked:false},{text:"il",marked:true},{text:"e",marked:false}
    ]);
  });
});

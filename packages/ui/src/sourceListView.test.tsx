import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {
 SourceListView,SourceListViewExtra,SourceListViewHeader,
 sourceNormalizeListWidth,sourceListColumnIsFixedWidth,sourceListViewExtraWidth
} from "./sourceListView";

describe("pinned source listview a321 contracts",()=>{
  it("matches original normalizeWidth truthiness and extra Details label column",()=>{
    expect(sourceNormalizeListWidth(undefined,3,true)).toBe("25%");
    expect(sourceNormalizeListWidth(null,3,true)).toBe("25%");
    expect(sourceNormalizeListWidth(0,3,true)).toBe("25%");
    expect(sourceNormalizeListWidth("",3,true)).toBe("25%");
    expect(sourceNormalizeListWidth(undefined,3)).toBe("33.333333333333336%");
    expect(sourceNormalizeListWidth(72,3,true)).toBe("72px");
    expect(sourceNormalizeListWidth("calc(100% - 4px)",3,true)).toBe("calc(100% - 4px)");
    expect(sourceNormalizeListWidth(-10,2,true)).toBe("-10px");
    expect(sourceListColumnIsFixedWidth(0)).toBe(true);
    expect(sourceListColumnIsFixedWidth("12px")).toBe(false);
  });
  it("renders source header buttons and their original widths",()=>{
    const html=renderToStaticMarkup(<SourceListViewHeader
      columns={[{key:"name",label:"Name",width:160},{key:"type",label:"Type"}]}/>);
    expect(html).toContain('data-test-listview-columnheader=""');
    expect(html).toContain("listview__header-column");
    expect(html).toContain('width:160px');
    expect(html).toContain('width:50%');
    expect(html).toContain(">Name</button>");
    expect(html).toContain(">Type</button>");
  });
  it("renders source Details extra with one reserved label column",()=>{
    const html=renderToStaticMarkup(<SourceListViewExtra count={3} details>File folder</SourceListViewExtra>);
    expect(html).toContain('width:25%');
    expect(html).toContain("listview__item-extra");
    expect(sourceListViewExtraWidth(undefined,3,true)).toBe("25%");
    expect(sourceListViewExtraWidth(140,3,true)).toBe("140px");
    expect(sourceListViewExtraWidth("25%",3,true)).toBe("25%");
    expect(sourceListViewExtraWidth(" 20px ",3,true)).toBe("20px");
  });
  it("keeps external CSS injection guarded while preserving the pure source helper",()=>{
    expect(sourceListViewExtraWidth("calc(100vw)",2,true)).toBeUndefined();
    expect(sourceListViewExtraWidth("url(javascript:evil)",2,true)).toBeUndefined();
    expect(sourceListViewExtraWidth(-10,2,true)).toBeUndefined();
    expect(sourceListViewExtraWidth(Infinity,2,true)).toBeUndefined();
    expect(sourceListViewExtraWidth(undefined,0,true)).toBeUndefined();
    expect(sourceListViewExtraWidth("auto",3,true)).toBe("auto");
  });
});

describe("source shell listview-list 00d7 and listview-content 27b9",()=>{
  it("keeps the original structural list and content class contracts",()=>{
    const list=renderToStaticMarkup(<SourceListView variant="list"><button>File A</button></SourceListView>);
    const content=renderToStaticMarkup(<SourceListView variant="content"><button>File B</button></SourceListView>);
    expect(list).toContain('data-test-source-listview="list"');
    expect(list).toContain("listview__view has-list");
    expect(content).toContain('data-test-source-listview="content"');
    expect(content).toContain("listview__view has-content");
  });
});

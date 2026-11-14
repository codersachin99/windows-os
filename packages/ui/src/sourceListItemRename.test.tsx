import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {SourceListItemRename,SOURCE_LIST_RENAME_LIMIT} from "./sourceListItemRename";
describe("pinned webpack 0616 inline rename",()=>{
  it("renders original input style and 30-character maximum",()=>{
    const markup=renderToStaticMarkup(<SourceListItemRename
      originalName="A folder" onCommit={()=>{}} onCancel={()=>{}}/>);
    expect(SOURCE_LIST_RENAME_LIMIT).toBe(30);
    expect(markup).toContain('maxLength="30"');
    expect(markup).toContain('class="listview__item-label is-input"');
    expect(markup).toContain('data-test-source-listview-rename=""');
    expect(markup).toContain('value="A folder"');
  });
  it("keeps filename text escaped, not executable markup",()=>{
    const markup=renderToStaticMarkup(<SourceListItemRename
      originalName={'<svg onload="alert(1)"/>'} onCommit={()=>{}} onCancel={()=>{}}/>);
    expect(markup).toContain('&lt;svg');
    expect(markup).not.toContain('<svg');
  });
});

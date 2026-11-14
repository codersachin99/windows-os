import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {SourceListItemRename,SOURCE_LIST_RENAME_LIMIT,sourceRenameParts,sourceRenameFileName} from "./sourceListItemRename";
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
  it("uses original 0e9a stem/extension when inline renaming a file",()=>{
    expect(sourceRenameParts("Before.txt")).toEqual({name:"Before",ext:"txt"});
    expect(sourceRenameParts("archive.backup.zip")).toEqual({name:"archive.backup",ext:"zip"});
    expect(sourceRenameParts("Folder")).toEqual({name:"Folder",ext:null});
    expect(sourceRenameParts("dot.file.")).toEqual({name:"dot.file",ext:""});
    expect(sourceRenameParts(".gitignore")).toEqual({name:"",ext:"gitignore"});
    expect(sourceRenameFileName(sourceRenameParts("Before.txt"),"After")).toBe("After.txt");
    const html=renderToStaticMarkup(<SourceListItemRename
      originalName="Before.txt" onCommit={()=>{}} onCancel={()=>{}}/>);
    expect(html).toContain('value="Before"');
    expect(html).not.toContain('value="Before.txt"');
  });
  it("keeps filename text escaped, not executable markup",()=>{
    const markup=renderToStaticMarkup(<SourceListItemRename
      originalName={'<svg onload="alert(1)"/>'} onCommit={()=>{}} onCancel={()=>{}}/>);
    expect(markup).toContain('&lt;svg');
    expect(markup).not.toContain('<svg');
  });
});

import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {SourceItemCheckbox} from "./sourceItemCheckbox";
describe("pinned fa65 source item checkbox",()=>{
  it("exposes the exact checkbox role, classes and underlying input",()=>{
    const html=renderToStaticMarkup(<SourceItemCheckbox checked label="Folder A" onToggle={()=>{}}/>);
    expect(html).toContain('role="checkbox"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('aria-label="Folder A"');
    expect(html).toContain('data-test-item-checkbox=""');
    expect(html).toContain("winui-checkbox item-checkbox");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('checked=""');
  });
  it("does not claim a nonselected item is checked",()=>{
    const html=renderToStaticMarkup(<SourceItemCheckbox checked={false}
      label="Folder B" onToggle={()=>{}}/>);
    expect(html).toContain('aria-checked="false"');
    expect(html).not.toContain('checked=""');
  });
});

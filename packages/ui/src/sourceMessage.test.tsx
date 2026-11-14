import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {SourceMessageDialog,sourceMessageProgressPercent,SOURCE_MESSAGE_TYPES} from "./sourceMessage";
describe("pinned source messages.js variants",()=>{
  it("retains error, confirm, progress; source confirm has yes/no IDs",()=>{
    expect(SOURCE_MESSAGE_TYPES).toEqual(["error","confirm","progress"]);
    const html=renderToStaticMarkup(<SourceMessageDialog
      data={{type:"confirm",header:"Delete files",message:"Permanently delete?"}}/>);
    expect(html).toContain('role="alertdialog"');
    expect(html).toContain('data-test-confirm-answer="yes"');
    expect(html).toContain('data-test-confirm-answer="no"');
    expect(html).toContain("Delete files");
    expect(html).toContain("Permanently delete?");
  });
  it("keeps source progress Stop disabled and indeterminate",()=>{
    const html=renderToStaticMarkup(<SourceMessageDialog
      data={{type:"progress",message:"Working...",header:"Saving",progress:"indeterminate"}}/>);
    expect(html).toContain("Operation progress");
    expect(html).toContain("Saving");
    expect(html).toContain('disabled=""');
    expect(html).toContain("Stop");
    expect(html).not.toContain('data-test-confirm-answer');
    expect(sourceMessageProgressPercent(140)).toBe(100);
    expect(sourceMessageProgressPercent(-20)).toBe(0);
    expect(sourceMessageProgressPercent(Infinity)).toBeUndefined();
  });
  it("escapes untrusted original inline markup rather than injecting scripts",()=>{
    const html=renderToStaticMarkup(<SourceMessageDialog
      data={{type:"error",message:'<img src=x onerror="alert(1)">',title:"Blocked"}}/>);
    expect(html).toContain("&lt;img");
    expect(html).not.toContain("<img");
    expect(html).toContain("OK");
  });
});

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { sourceOrganizeItems, SOURCE_ORGANIZE_DEFINITIONS } from "./sourceOrganizeMenu";
import { SourceOrganizeMenu } from "./SourceOrganizeMenu";

const baseline = {
  selectedPaths: [] as string[],
  protectedRoots: ["/EXTERNAL/computer", "/EXTERNAL/computer/drive0"],
  clipboardHasPaths:false, canMoveToTrash:true,
  isRecycleBin:false, canCloseWindow:true
};

describe("legacy Computer toolbar Organize menu", () => {
  it("preserves the pinned source labels, order and divider locations", () => {
    expect(SOURCE_ORGANIZE_DEFINITIONS.map(x=>x.label)).toEqual([
      "Cut","Copy","Paste","Undo","Redo","Select all","Layout",
      "Folder and search options","Delete","Rename","Remove properties","Properties","Close"
    ]);
    expect(SOURCE_ORGANIZE_DEFINITIONS.filter(x=>x.dividerAfter).map(x=>x.id))
      .toEqual(["redo","folder-and-search-options","properties"]);
  });
  it("disables source selection actions and unsupported commands without selection", () => {
    const items=sourceOrganizeItems(baseline);
    expect(items.filter(x=>x.enabled).map(x=>x.id)).toEqual(["close"]);
    expect(items.find(x=>x.id==="paste")?.enabled).toBe(false);
  });
  it("enables only migrated selection commands for a regular selected file", () => {
    const items=sourceOrganizeItems({...baseline,selectedPaths:["/EXTERNAL/computer/drive0/notes.txt"],
      clipboardHasPaths:true});
    expect(items.filter(x=>x.enabled).map(x=>x.id))
      .toEqual(["cut","copy","paste","delete","rename","close"]);
  });
  it("protects source disk roots and any selection including a protected root", () => {
    for(const selectedPaths of [
      ["/EXTERNAL/computer/drive0"],
      ["/EXTERNAL/computer/drive0","/EXTERNAL/computer/drive0/notes.txt"]
    ]) {
      const items=sourceOrganizeItems({...baseline,selectedPaths,clipboardHasPaths:true});
      expect(items.filter(x=>x.enabled).map(x=>x.id)).toEqual(["close"]);
    }
  });
  it("keeps Paste safe without a clipboard and Delete safe without the trash mount", () => {
    const items=sourceOrganizeItems({...baseline,selectedPaths:["/Documents/x"],canMoveToTrash:false});
    expect(items.find(x=>x.id==="paste")?.enabled).toBe(false);
    expect(items.find(x=>x.id==="delete")?.enabled).toBe(false);
    expect(items.find(x=>x.id==="copy")?.enabled).toBe(true);
  });
  it("permits selection commands with several files but only one Rename", () => {
    const items=sourceOrganizeItems({...baseline,selectedPaths:["/Documents/a","/Documents/b"]});
    expect(items.find(x=>x.id==="rename")?.enabled).toBe(false);
    expect(items.find(x=>x.id==="copy")?.enabled).toBe(true);
    expect(items.find(x=>x.id==="delete")?.enabled).toBe(true);
  });
  it("does not reuse Computer actions for the Recycle Bin or invent Close without a host", () => {
    const items=sourceOrganizeItems({...baseline,selectedPaths:["/trash/x"],
      isRecycleBin:true,canCloseWindow:false});
    expect(items.some(item=>item.enabled)).toBe(false);
  });
  it("renders a menu trigger without opening a popup during server rendering", () => {
    const html=renderToStaticMarkup(<SourceOrganizeMenu
      items={sourceOrganizeItems(baseline)} onCommand={()=>{}} />);
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Organize");
    expect(html).not.toContain('role="menu"');
  });
});

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
  it("inherits Computer's 13 Organize entries for Bin but protects trash metadata", () => {
    const trash="/EXTERNAL/computer/drive0/Users/Guest/RecycleBin";
    const empty=sourceOrganizeItems({...baseline,selectedPaths:[],
      isRecycleBin:true,recycleBinPath:trash});
    expect(empty.map(x=>x.id)).toEqual(SOURCE_ORGANIZE_DEFINITIONS.map(x=>x.id));
    expect(empty.filter(x=>x.enabled).map(x=>x.id)).toEqual(["close"]);
    const selected=sourceOrganizeItems({...baseline,
      selectedPaths:[trash+"/removed.txt"],isRecycleBin:true,recycleBinPath:trash,
      clipboardHasPaths:true,canMoveToTrash:false});
    expect(selected.filter(x=>x.enabled).map(x=>x.id)).toEqual(["delete","close"]);
    for(const id of ["cut","copy","paste","rename","select-all","properties"]) {
      expect(selected.find(x=>x.id===id)?.enabled).toBe(false);
    }
  });
  it("prevents permanent Delete on the Bin root, out-of-scope, or mixed selection", () => {
    const trash="/EXTERNAL/computer/drive0/Trash";
    for(const selectedPaths of [
      [trash], ["/Documents/file.txt"], [trash+"/a",trash], [trash+"-fake/evil"]
    ]) {
      const items=sourceOrganizeItems({...baseline,selectedPaths,
        isRecycleBin:true,recycleBinPath:trash});
      expect(items.filter(x=>x.enabled).map(x=>x.id)).toEqual(["close"]);
    }
  });
  it("does not allow trash mutations without a source mount or shell Close without host", () => {
    const items=sourceOrganizeItems({...baseline,selectedPaths:["/trash/x"],
      isRecycleBin:true,recycleBinPath:null,canCloseWindow:false});
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

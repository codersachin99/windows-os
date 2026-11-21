import { describe, expect, it } from "vitest";
import { sourcePrograms } from "@windows-os/filesystem";
import {
  canFinishSourceShortcut, sourceWizardChoice, sourceWizardPrograms
} from "./shortcutWizardModel";

describe("pinned source Shortcut Wizard target model", () => {
  it("lists installed legacy targets even when React implementation is still pending", () => {
    expect(sourceWizardPrograms.map(item => item.id)).toContain("calc");
    expect(sourceWizardPrograms.map(item => item.id)).toContain("paint");
    expect(sourceWizardPrograms.map(item => item.id)).toContain("cpanel");
    expect(sourceWizardPrograms.map(item => item.id)).not.toContain("bin");
    expect(sourceWizardPrograms.every(item =>
      Boolean(sourcePrograms.find(source => source.id === item.id && source.installPath))))
      .toBe(true);
  });
  it("cannot finish with an unselected, empty or unknown target", () => {
    expect(canFinishSourceShortcut(null, "Named")).toBe(false);
    expect(canFinishSourceShortcut("calc", "  ")).toBe(false);
    expect(canFinishSourceShortcut("bin", "Recycle Bin")).toBe(false);
    expect(canFinishSourceShortcut("../calc", "Calculator")).toBe(false);
    expect(canFinishSourceShortcut("calc", "Calculator")).toBe(true);
  });
  it("maps selected IDs only to pinned programs, not arbitrary shell commands", () => {
    expect(sourceWizardChoice("notepad")?.name).toBe("Notepad");
    expect(sourceWizardChoice("paint")?.id).toBe("paint");
    expect(sourceWizardChoice("foo")).toBeNull();
    expect(sourceWizardChoice("bin")).toBeNull();
  });
});

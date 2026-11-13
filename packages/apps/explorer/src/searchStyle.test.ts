import { describe, expect, it } from "vitest";
import { sourceExplorerSearchStyle, sourceWin7InstantSearch } from "./searchStyle";

describe("pinned vue-app.js f3ad theme search dispatch", () => {
  it("does NOT show classic Find or Companion in default Win7", () => {
    for (const theme of ["win7","win10","win11","winvista","random"]) {
      expect(sourceExplorerSearchStyle(theme)).toBeNull();
    }
  });
  it("migrates instant search only on the source Win7 Computer surface", () => {
    expect(sourceWin7InstantSearch("win7", false)).toBe(true);
    expect(sourceWin7InstantSearch("win7", true)).toBe(false);
    for (const theme of ["winxp","win10","win11","winvista","win95","win98","win31"]) {
      expect(sourceWin7InstantSearch(theme, false)).toBe(false);
    }
  });
  it("maps legacy XP, 95/98 and 3.1 into their original distinct search surfaces", () => {
    expect(sourceExplorerSearchStyle("winxp")).toBe("companion");
    expect(sourceExplorerSearchStyle("win2k")).toBe("companion");
    expect(sourceExplorerSearchStyle("winL")).toBe("companion");
    expect(sourceExplorerSearchStyle("winW")).toBe("companion");
    expect(sourceExplorerSearchStyle("win95")).toBe("find");
    expect(sourceExplorerSearchStyle("win98")).toBe("find");
    expect(sourceExplorerSearchStyle("win31")).toBe("dialog");
  });
});

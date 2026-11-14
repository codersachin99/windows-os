import { describe, expect, it } from "vitest";
import {
  SOURCE_IE_HOME, SOURCE_IE_SEARCH, SOURCE_IE_MENUS, emptySourceIEHistory,
  normalizeSourceIEAddress, sourceIESearchUrl, pushSourceIEHistory, stepSourceIEHistory
} from "./model";
describe("source Internet Explorer model", () => {
  it("preserves original configuration and menu labels", () => {
    expect(SOURCE_IE_HOME).toBe("https://msn.com");
    expect(SOURCE_IE_SEARCH).toBe("https://bing.com/search?q=");
    expect(SOURCE_IE_MENUS).toEqual(["Favorites", "Bookmarks"]);
  });
  it("normalizes web URLs but refuses executable and local schemes", () => {
    expect(normalizeSourceIEAddress(" example.com/a ")).toBe("https://example.com/a");
    expect(normalizeSourceIEAddress("http://example.org")).toBe("http://example.org/");
    for (const url of ["javascript:alert(1)", "data:text/html,a", "file:///etc/passwd",
      "blob:https://example.com/123", "//example.com", "https://x:y@example.com",
      "https://example.com bad", ""]) expect(normalizeSourceIEAddress(url)).toBeNull();
  });
  it("encodes the pinned Bing search endpoint", () => {
    expect(sourceIESearchUrl("  Windows 7 & XP  "))
      .toBe("https://bing.com/search?q=Windows%207%20%26%20XP");
    expect(sourceIESearchUrl("  ")).toBeNull();
  });
  it("navigates back/forward and truncates forward history on new navigation", () => {
    expect(stepSourceIEHistory(emptySourceIEHistory, "back")).toBeNull();
    const a = pushSourceIEHistory(emptySourceIEHistory, "https://a.example/");
    const b = pushSourceIEHistory(a, "https://b.example/");
    expect(stepSourceIEHistory(b, "next")).toBeNull();
    const back = stepSourceIEHistory(b, "back")!;
    expect(back.url).toBe("https://a.example/");
    expect(stepSourceIEHistory(back.history, "next")?.url).toBe("https://b.example/");
    expect(pushSourceIEHistory(back.history, "https://c.example/")).toEqual({
      urls: ["https://a.example/", "https://c.example/"], index: 1
    });
  });
});

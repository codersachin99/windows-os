import { describe, expect, it } from "vitest";
import { initialDesktopState, sourceTestTheme, LEGACY_DEFAULTS } from "./index";

describe("legacy testmode.js validated theme query", () => {
  it("retains Win7 without a supported explicit theme parameter", () => {
    expect(sourceTestTheme("")).toBeNull();
    expect(sourceTestTheme("?theme=unknown")).toBeNull();
    expect(sourceTestTheme("?theme=../winxp")).toBeNull();
    expect(initialDesktopState().theme).toBe(LEGACY_DEFAULTS.theme);
  });
  it("maps source theme names used by the three original search surfaces", () => {
    expect(sourceTestTheme("?theme=winxp")).toBe("winxp");
    expect(sourceTestTheme("?theme=win31")).toBe("win31");
    expect(sourceTestTheme("?theme=win95")).toBe("win95");
    expect(sourceTestTheme("?theme=win98")).toBe("win98");
  });
});

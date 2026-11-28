import { describe, expect, it } from "vitest";
import { initialDesktopState, sourceTestTheme, LEGACY_DEFAULTS } from "./index";

describe("legacy testmode.js validated theme query", () => {
  it("retains Win7 without a supported explicit theme parameter", () => {
    expect(sourceTestTheme("")).toBeNull();
    expect(sourceTestTheme("?theme=unknown")).toBeNull();
    expect(sourceTestTheme("?theme=../winxp")).toBeNull();
    expect(initialDesktopState().theme).toBe(LEGACY_DEFAULTS.theme);
  });
  it("accepts every final-source catalog theme ID without executing unknown names", () => {
    expect(sourceTestTheme("?theme=winxp")).toBe("winxp");
    expect(sourceTestTheme("?theme=win31")).toBe("win31");
    expect(sourceTestTheme("?theme=win95")).toBe("win95");
    expect(sourceTestTheme("?theme=win98")).toBe("win98");
    expect(sourceTestTheme("?theme=base")).toBe("base");
    expect(sourceTestTheme("?theme=aero-3")).toBe("aero-3");
    expect(sourceTestTheme("?theme=basic-4")).toBe("basic-4");
    expect(sourceTestTheme("?theme=winxpZ")).toBe("winxpZ");
    expect(sourceTestTheme("?theme=win81")).toBe("win81");
    expect(sourceTestTheme("?theme=win11dark")).toBe("win11dark");
    expect(sourceTestTheme("?theme=macos")).toBe("macos");
    expect(sourceTestTheme("?theme=chromeos")).toBe("chromeos");
    expect(sourceTestTheme("?theme=ubuntu")).toBe("ubuntu");
    expect(sourceTestTheme("?theme=kubuntu")).toBe("kubuntu");
    expect(sourceTestTheme("?theme=winLP")).toBe("winLP");
    expect(sourceTestTheme("?theme=aeroNoir")).toBe("aeroNoir");
    expect(sourceTestTheme("?theme=onebit")).toBe("onebit");
    expect(sourceTestTheme("?theme=__proto__")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { desktopReducer, initialDesktopState, LEGACY_DEFAULTS } from "./index";
import { appRegistry } from "@windows-os/sdk";

describe("legacy state transitions", () => {
  it("does not skip boot or fake a signed-in account", () => {
    const initial = initialDesktopState();
    expect(LEGACY_DEFAULTS.skipBoot).toBe(false);
    expect(LEGACY_DEFAULTS.nativeCursor).toBe(false);
    expect(initial.phase).toBe("boot");
    expect(initial.session).toBeNull();
    expect(desktopReducer(initial, { type: "GUEST_LOGIN" }).phase).toBe("boot");
  });
  it("runs boot -> Guest login -> desktop -> logoff", () => {
    const boot = initialDesktopState();
    const logon = desktopReducer(boot, { type: "BOOT_COMPLETE" });
    expect(logon.phase).toBe("logon");
    const desktop = desktopReducer(logon, { type: "GUEST_LOGIN" });
    expect(desktop.session?.kind).toBe("guest");
    expect(desktop.phase).toBe("desktop");
    const signedOut = desktopReducer(desktop, { type: "LOG_OFF" });
    expect(signedOut.phase).toBe("logon");
    expect(signedOut.session).toBeNull();
  });
  it("opens multiple app windows, focuses and closes without losing another app", () => {
    const app = appRegistry.get("computer")!;
    const desktop = desktopReducer(desktopReducer(initialDesktopState(), { type: "BOOT_COMPLETE" }), { type: "GUEST_LOGIN" });
    const once = desktopReducer(desktop, { type: "OPEN_APP", app });
    const twice = desktopReducer(once, { type: "OPEN_APP", app });
    expect(twice.windows).toHaveLength(2);
    expect(twice.windows[1].z).toBeGreaterThan(twice.windows[0].z);
    const focused = desktopReducer(twice, { type: "FOCUS_WINDOW", id: twice.windows[0].id });
    expect(focused.windows[0].z).toBeGreaterThan(focused.windows[1].z);
    const closed = desktopReducer(focused, { type: "CLOSE_WINDOW", id: twice.windows[0].id });
    expect(closed.windows.map(window => window.id)).toEqual([twice.windows[1].id]);
  });
  it("does not create windows before entering a desktop session", () => {
    const app = appRegistry.get("computer")!;
    expect(desktopReducer(initialDesktopState(), { type: "OPEN_APP", app }).windows).toHaveLength(0);
  });
});

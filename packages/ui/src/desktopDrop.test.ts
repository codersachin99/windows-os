import { describe, expect, it } from "vitest";
import { hitDesktopRecycleBin } from "./desktopDrop";

const bounds = { left: 20, top: 12, right: 100, bottom: 92 };
describe("desktop source Bin drop geometry", () => {
  it("only accepts pointer release over the Bin icon rectangle", () => {
    expect(hitDesktopRecycleBin({ x: 50, y: 50 }, bounds)).toBe(true);
    expect(hitDesktopRecycleBin({ x: 20, y: 12 }, bounds)).toBe(true);
    expect(hitDesktopRecycleBin({ x: 100, y: 92 }, bounds)).toBe(true);
    expect(hitDesktopRecycleBin({ x: 101, y: 50 }, bounds)).toBe(false);
    expect(hitDesktopRecycleBin({ x: -5, y: 50 }, bounds)).toBe(false);
    expect(hitDesktopRecycleBin({ x: Number.NaN, y: 50 }, bounds)).toBe(false);
  });
});

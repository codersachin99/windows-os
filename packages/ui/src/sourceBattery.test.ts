import {describe,it,expect} from "vitest";
import {sourceBatteryPercent,sourceBrightness} from "./sourceBattery";
describe("source battery and guest display",()=>{
  it("rounds measured level and rejects missing/invalid values",()=>{
    expect(sourceBatteryPercent(.735)).toBe(74);
    expect(sourceBatteryPercent(0)).toBe(0);
    expect(sourceBatteryPercent(NaN)).toBeNull();
    expect(sourceBatteryPercent(-1)).toBeNull();
    expect(sourceBatteryPercent(1.1)).toBeNull();
  });
  it("preserves source range and radio preset values",()=>{
    expect(sourceBrightness(.1)).toBe(.6);
    expect(sourceBrightness(1.16)).toBe(1.2);
    expect(sourceBrightness(1)).toBe(1);
    expect(sourceBrightness(NaN)).toBe(1);
  });
});

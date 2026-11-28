import {describe,it,expect} from "vitest";
import {sourceBatteryPercent,sourceBrightness,sourceBatteryMeterOffset} from "./sourceBattery";
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

it("selects original 32px meter frames at raw battery thresholds",()=>{
  for(const [level,offset] of [[0,-640],[.099,-640],[.1,-352],[.199,-352],[.2,-64],[.73,-224],[1,-288]])
    expect(sourceBatteryMeterOffset(level)).toBe(offset);
  expect(sourceBatteryMeterOffset(NaN)).toBeNull();
  expect(sourceBatteryMeterOffset(1.1)).toBeNull();
});

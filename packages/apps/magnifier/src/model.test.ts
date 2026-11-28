import { describe, expect, it } from "vitest";
import {
  MAGNIFIER_MAX_SCALE, MAGNIFIER_MIN_SCALE, MAGNIFIER_STEP,
  sourceMagnifierChangeScale, sourceMagnifierOrigin, sourceMagnifierPercent,
  sourceMagnifierTransform
} from "./model";

describe("original Win7 Magnifier model", () => {
  it("starts at 100% with 0.5x step, minimum 1x, maximum 16x", () => {
    expect(MAGNIFIER_MIN_SCALE).toBe(1);
    expect(MAGNIFIER_MAX_SCALE).toBe(16);
    expect(MAGNIFIER_STEP).toBe(0.5);
    expect(sourceMagnifierChangeScale(1,0.5)).toBe(1.5);
    expect(sourceMagnifierChangeScale(1.5,0.5)).toBe(2);
    expect(sourceMagnifierChangeScale(2,-0.5)).toBe(1.5);
    expect(sourceMagnifierChangeScale(1.5,-0.5)).toBe(1);
    expect(sourceMagnifierPercent(1)).toBe("100%");
    expect(sourceMagnifierPercent(1.5)).toBe("150%");
    expect(sourceMagnifierPercent(16)).toBe("1600%");
  });
  it("never goes below 1x or above 16x, even with exaggerated commands", () => {
    expect(sourceMagnifierChangeScale(1,-0.5)).toBe(1);
    expect(sourceMagnifierChangeScale(1,-40)).toBe(1);
    expect(sourceMagnifierChangeScale(15.5,0.5)).toBe(16);
    expect(sourceMagnifierChangeScale(16,0.5)).toBe(16);
    expect(sourceMagnifierChangeScale(16,40)).toBe(16);
    let value=1;
    for(let i=0;i<100;i++)value=sourceMagnifierChangeScale(value,MAGNIFIER_STEP);
    expect(value).toBe(16);
    for(let i=0;i<100;i++)value=sourceMagnifierChangeScale(value,-MAGNIFIER_STEP);
    expect(value).toBe(1);
  });
  it("matches source cursor-percent transform origin on desktop", () => {
    expect(sourceMagnifierOrigin(960,540,{width:1920,height:1080}))
      .toEqual({x:50,y:50});
    expect(sourceMagnifierOrigin(320,120,{width:1280,height:800}))
      .toEqual({x:25,y:15});
    expect(sourceMagnifierOrigin(0,0,{width:320,height:640}))
      .toEqual({x:0,y:0});
  });
  it("keeps 0% 0% origin on touch devices, per source isTouchDevice guard", () => {
    expect(sourceMagnifierOrigin(180,360,{width:360,height:720},true))
      .toEqual({x:0,y:0});
    expect(sourceMagnifierOrigin(0,0,{width:0,height:0}))
      .toEqual({x:0,y:0});
  });
  it("clears transform at 1x, applies exact CSS scaling above 1x", () => {
    expect(sourceMagnifierTransform(1)).toBe("");
    expect(sourceMagnifierTransform(0.5)).toBe("");
    expect(sourceMagnifierTransform(1.5)).toBe("scale(1.5)");
    expect(sourceMagnifierTransform(16)).toBe("scale(16)");
  });
});

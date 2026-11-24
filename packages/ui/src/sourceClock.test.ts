import {describe,it,expect} from "vitest";
import {sourceClockHands,sourceClockDigital} from "./sourceClock";
describe("source analog and digital clocks",()=>{
  it("matches ada7 hand rotations at local time",()=>{
    expect(sourceClockHands(new Date(2026,10,24,15,30,45))).toEqual({hour:105,minute:180,second:270});
    expect(sourceClockHands(new Date(2026,10,24,0,0,0))).toEqual({hour:0,minute:0,second:0});
  });
  it("matches aa42 zero-padded 24-hour text",()=>{
    expect(sourceClockDigital(new Date(2026,10,24,3,5,9))).toBe("03:05");
    expect(sourceClockDigital(new Date(2026,10,24,23,59,1),true)).toBe("23:59:01");
  });
});

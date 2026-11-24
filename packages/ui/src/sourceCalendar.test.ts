import {describe,it,expect} from "vitest";
import {sourceCalendarMonth,sourceCalendarDays,sourceCalendarSameDay} from "./sourceCalendar";
describe("source Sunday-first 42-day calendar",()=>{
  it("crosses year boundaries with local calendar arithmetic",()=>{
    expect(sourceCalendarMonth(new Date(2026,11,31),1)).toEqual(new Date(2027,0,1));
    expect(sourceCalendarMonth(new Date(2026,0,31),-1)).toEqual(new Date(2025,11,1));
  });
  it("includes adjacent months and leap day",()=>{
    const days=sourceCalendarDays(new Date(2024,1,15));
    expect(days).toHaveLength(42);
    expect(days[0]).toEqual(new Date(2024,0,28));
    expect(days[41]).toEqual(new Date(2024,2,9));
    expect(days.some(day=>sourceCalendarSameDay(day,new Date(2024,1,29)))).toBe(true);
  });
});

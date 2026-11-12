import { describe, expect, it } from "vitest";
import { sourceFindDefaults, sourceFindFormQuery } from "./FindApp";

describe("legacy Find 709f form", () => {
  it("restores source values including subfolder toggle, selected date mode and size", () => {
    const defaults = sourceFindDefaults();
    expect(defaults).toMatchObject({
      namePattern: "", subfolders: true, kind: "", dateChoice: "all",
      dateRange: "days", months: 1, days: 1, sizeBound: "", sizeKb: 0
    });
    expect(sourceFindFormQuery(defaults, "/System")).toMatchObject({
      namePattern: "", scope: "/System", subfolders: true, kind: "", size: null, date: null
    });
  });
  it("maps modified date and source advanced size filters without changing scope", () => {
    const fields = { ...sourceFindDefaults(), namePattern: "*.txt", dateChoice: "modified" as const,
      dateRange: "months" as const, months: 3, kind: "text" as const,
      sizeBound: "at-least" as const, sizeKb: 10 };
    expect(sourceFindFormQuery(fields, "/drive0")).toEqual({
      scope: "/drive0", namePattern: "*.txt", subfolders: true, kind: "text",
      date: { months: 3 }, size: { atLeast: true, kb: 10 }
    });
  });
});

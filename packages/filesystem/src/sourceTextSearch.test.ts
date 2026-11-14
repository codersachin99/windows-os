import { describe, expect, it } from "vitest";
import {
  compileSourceSearch, findSourceWordStart, normalizeSourceSearchText,
  parseSourceSearchText, scoreSourceFileName, sourceModifiedRange,
  sourceSearchHighlights, sourceSearchMatch, sourceSizeRange
} from "./sourceTextSearch";
import { matchesSourceKind, type FileEntry } from "./index";

const file = (name: string, size = 1000, mtime = new Date(2026,10,13,11).getTime()): FileEntry =>
  ({ uri: "/"+name, name, size, mtime, type: "file" });

describe("pinned 5985 lexer and ranked filename matching", () => {
  it("normalizes Unicode accents and captures quoted, last-wins and unknown field tokens", () => {
    expect(normalizeSourceSearchText("CAFÉ")).toBe("cafe");
    expect(parseSourceSearchText('REPORT "Quarter One" kind:picture kind:document name:"Annual Résumé"'))
      .toEqual({ terms: ["report", "quarter one"],
        filters: { kind: "document", name: "annual resume" } });
    expect(compileSourceSearch("tag:random").terms).toEqual(["tag:random"]);
    expect(parseSourceSearchText('kind:picture type:".JPG"')).toEqual({
      terms: [], filters: { kind: "picture", type: ".jpg" }
    });
  });
  it("matches source word boundaries instead of arbitrary substrings", () => {
    expect(findSourceWordStart("latest report.pdf", "report")).toBe(7);
    expect(findSourceWordStart("prereport.pdf", "report")).toBe(-1);
    expect(findSourceWordStart("alpha-beta", "beta")).toBe(6);
    expect(scoreSourceFileName("report", ["report"])).toBe(1010);
    expect(scoreSourceFileName("report-final.txt", ["report"])).toBe(110);
    expect(scoreSourceFileName("my report.txt", ["report"])).toBe(15);
    expect(scoreSourceFileName("prereport.txt", ["report"])).toBe(0);
    expect(scoreSourceFileName("alpha beta", ["alpha", "beta"])).toBe(1020);
    expect(scoreSourceFileName("beta alpha", ["alpha", "beta"])).toBe(20);
  });
  it("merges highlight ranges and drops them when accent decomposition changes offsets", () => {
    expect(sourceSearchHighlights("monthly-report.txt", ["report"])).toEqual([{start:8,end:14}]);
    expect(sourceSearchHighlights("re\u0301sume\u0301.txt", ["resume"])).toEqual([]);
    expect(sourceSearchHighlights("hello world", ["hello", "world"]))
      .toEqual([{start:0,end:5},{start:6,end:11}]);
  });
});

describe("pinned 2e2c metadata predicates", () => {
  it("parses named size bins and exact inclusive numeric boundary operators", () => {
    expect(sourceSizeRange("empty")).toEqual([-1,0]);
    expect(sourceSizeRange("small")).toEqual([10240,102400]);
    expect(sourceSizeRange(">=1kb")).toEqual([1023,Infinity]);
    expect(sourceSizeRange("<=1mb")).toEqual([-1,1048576]);
    expect(sourceSizeRange("<10b")).toEqual([-1,9]);
    expect(sourceSizeRange("=300b")).toEqual([299,300]);
    expect(sourceSizeRange("1tb")).toBeNull();
    const q=compileSourceSearch("size:>=1kb");
    expect(sourceSearchMatch(file("a.txt",1024),q,matchesSourceKind)).toBeTruthy();
    expect(sourceSearchMatch(file("a.txt",1023),q,matchesSourceKind)).toBeNull();
  });
  it("uses local calendar day/week/month/year boundaries", () => {
    const now = new Date(2026,10,13,16).getTime();
    expect(sourceModifiedRange("today",now)).toEqual([
      new Date(2026,10,13).getTime(),new Date(2026,10,14).getTime()]);
    expect(sourceModifiedRange("this month",now)).toEqual([
      new Date(2026,10,1).getTime(),new Date(2026,11,1).getTime()]);
    expect(sourceModifiedRange("2026-11-02..2026-11-04",now)).toEqual([
      new Date(2026,10,2).getTime(),new Date(2026,10,5).getTime()]);
    expect(sourceModifiedRange("invalid day",now)).toBeNull();
  });
  it("treats invalid known metadata filters as empty results, unknown fields as terms", () => {
    expect(compileSourceSearch("kind:unknown").valid).toBe(false);
    expect(compileSourceSearch("size:bad").valid).toBe(false);
    expect(compileSourceSearch("datemodified:never").valid).toBe(false);
    expect(sourceSearchMatch(file("photo.jpg",1000),compileSourceSearch("type:jpg kind:picture"),
      matchesSourceKind)?.score).toBe(1);
    expect(sourceSearchMatch(file("photo.jpg",1000),compileSourceSearch("type:png"),
      matchesSourceKind)).toBeNull();
    expect(sourceSearchMatch({ ...file("dir",0),type:"directory" },
      compileSourceSearch("size:empty"),matchesSourceKind)).toBeNull();
  });
});

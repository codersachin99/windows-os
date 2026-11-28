import {describe,expect,it} from "vitest";
import {
  sourceNormalizeSearch,sourceParseSearch,sourceFindSearchTerm,
  sourceScoreSearch,SOURCE_SEARCH_WEIGHT
} from "./sourceSearch";

describe("pinned legacy 5985 query parser",()=>{
  it("normalizes case/accents and retains quoted phrases as one term",()=>{
    expect(sourceParseSearch('  RéSoluTion "screen brightness" ')).toEqual({
      terms:["resolution","screen brightness"],filters:{}
    });
    expect(sourceNormalizeSearch("CAFÉ")).toBe("cafe");
    expect(sourceParseSearch('"" "   "')).toEqual({terms:[],filters:{}});
  });
  it("separates key:value and quoted key:\"value with spaces\" filters",()=>{
    expect(sourceParseSearch('alpha kind:screen id:"Backup Restore" beta')).toEqual({
      terms:["alpha","beta"],filters:{kind:"screen",id:"backup restore"}
    });
    expect(sourceParseSearch('id:old id:new id:" final name "')).toEqual({
      terms:[],filters:{id:"final name"}
    });
    expect(sourceParseSearch("kind:")).toEqual({terms:["kind:"],filters:{}});
  });
  it("does not mistake punctuation and single-letter search for a filter",()=>{
    expect(sourceParseSearch("Windows-Defender x:y serial:123")).toEqual({
      terms:["windows-defender"],filters:{x:"y",serial:"123"}
    });
    expect(sourceParseSearch("  ")).toEqual({terms:[],filters:{}});
  });
});

describe("pinned legacy 5985 word starts and rank",()=>{
  const name=(text:string)=>[{text,weight:SOURCE_SEARCH_WEIGHT.Name}];
  it("prefers exact name 1010, name prefix 110 and ordered words 25",()=>{
    expect(sourceScoreSearch(name("Display"),sourceParseSearch("display"))).toBe(1010);
    expect(sourceScoreSearch(name("Display"),sourceParseSearch("disp"))).toBe(110);
    expect(sourceScoreSearch(name("Change system icons"),sourceParseSearch("change icons")))
      .toBe(25);
    expect(sourceScoreSearch(name("Change system icons"),sourceParseSearch("icons change")))
      .toBe(20);
  });
  it("does not match the middle of Latin words",()=>{
    expect(sourceFindSearchTerm("resolution","solution")).toBe(-1);
    expect(sourceFindSearchTerm("Display window","window")).toBe(8);
    expect(sourceFindSearchTerm("display.window","window")).toBe(8);
    expect(sourceScoreSearch(name("Resolution"),sourceParseSearch("solution"))).toBe(0);
  });
  it("matches names and keywords with exact source weights",()=>{
    const fields=[{text:"Windows Update",weight:10},{text:"security malware",weight:1}];
    expect(sourceScoreSearch(fields,sourceParseSearch("windows malware"))).toBe(11);
    expect(sourceScoreSearch(fields,sourceParseSearch("unknown malware"))).toBe(0);
    expect(sourceScoreSearch(fields,sourceParseSearch("kind:update"))).toBe(0);
  });
  it("recognizes source East Asian internal word boundaries",()=>{
    expect(sourceFindSearchTerm("日本語検索","検索")).toBe(3);
    expect(sourceScoreSearch(name("日本語検索"),sourceParseSearch("検索"))).toBe(15);
  });
  it("matches accent-normalized and quoted multi-word phrases",()=>{
    expect(sourceScoreSearch(name("Café Experience"),sourceParseSearch("CAFE"))).toBe(110);
    expect(sourceScoreSearch(name("Restore data files"),sourceParseSearch('"data files"'))).toBe(15);
    expect(sourceScoreSearch(name("Restore data files"),sourceParseSearch('"data existing"'))).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { VirtualFileStore } from "./index";
import { searchFiles, matchSourceNamePattern } from "./search";

async function fixture() {
  const fs = new VirtualFileStore();
  await fs.mkdir("/results");
  for (const name of ["Prereport", "Annual-Report", "Report-archive", "Report"]) {
    await fs.write("x", "/results/" + name);
  }
  return fs;
}
describe("source 2e2c ranked searchFiles Guest VFS integration", () => {
  it("sorts exact name above prefix above word-boundary hit and rejects infix", async () => {
    const fs = await fixture();
    const found = await searchFiles(fs, { scope:"/results", text:"report" });
    expect(found.files.map(file=>file.name)).toEqual([
      "Report","Report-archive","Annual-Report"
    ]);
    expect(found.highlights?.["/results/Report"]).toEqual([{start:0,end:6}]);
    expect(found.highlights?.["/results/Annual-Report"]).toEqual([{start:7,end:13}]);
    expect(found.progress.matches).toBe(3);
    expect(found.truncated).toBe(false);
  });
  it("ranks before the cap rather than keeping only the alphabetically first matches", async () => {
    const fs = await fixture();
    const found = await searchFiles(fs, { scope:"/results", text:"report", maxResults:1 });
    expect(found.files.map(file=>file.name)).toEqual(["Report"]);
    expect(found.truncated).toBe(true);
    expect(found.progress.matches).toBe(3);
  });
  it("supports source name, quoted type, kind and size operators together", async () => {
    const fs = new VirtualFileStore();
    await fs.mkdir("/results");
    await fs.write("x".repeat(2048),"/results/Quarter Report.txt");
    await fs.write("x","/results/Quarter Report.jpg");
    const found = await searchFiles(fs, {
      scope:"/results", text:'"quarter report" kind:document type:txt size:>=1kb'
    });
    expect(found.files.map(file=>file.name)).toEqual(["Quarter Report.txt"]);
    const empty = await searchFiles(fs,{scope:"/results",text:"size:wrong"});
    expect(empty.files).toEqual([]);
    const q=await searchFiles(fs,{scope:"/results",text:"name:report kind:document"});
    expect(q.files.map(f=>f.name)).toEqual(["Quarter Report.txt"]);
  });
  it("normalizes accented filenames with source 16d5 matcher",()=>{
    expect(matchSourceNamePattern("résumé.txt","resume")).toBe(true);
    expect(matchSourceNamePattern("RÉSUMÉ.txt","*.TXT")).toBe(true);
  });
});

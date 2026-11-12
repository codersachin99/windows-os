import { describe, expect, it } from "vitest";
import { decodeSourceFindPath, encodeSourceFindPath, createSourceFindQuery,
  sourceFindSearchRequest } from "./findQuery";
import { matchSourceNamePattern, matchesSourceKind, searchFiles, VirtualFileStore } from "./index";

describe("original Find (16d5) query adapter", () => {
  it("preserves source defaults and all query options in the virtual Computer path", () => {
    const q = { ...createSourceFindQuery("/guest"), namePattern: "*.txt; Report",
      kind: "document" as const, date: { days: 7 }, size: { atLeast: true, kb: 1 } };
    expect(decodeSourceFindPath(encodeSourceFindPath(q))).toEqual(q);
    expect(decodeSourceFindPath("/guest")).toBeNull();
    expect(decodeSourceFindPath("win7-find:%7Bbad")).toBeNull();
    expect(decodeSourceFindPath("win7-find:" + encodeURIComponent(JSON.stringify({
      ...q, scope: "../../host" })))).toBeNull();
  });
  it("matches source substring, semicolon/comma options, wildcards and extensionless .*", () => {
    expect(matchSourceNamePattern("Meeting-Report.txt", "report")).toBe(true);
    expect(matchSourceNamePattern("Meeting-Report.txt", "*.pdf; *.TXT")).toBe(true);
    expect(matchSourceNamePattern("report", "report.*")).toBe(true);
    expect(matchSourceNamePattern("report.doc", "report.*")).toBe(true);
    expect(matchSourceNamePattern("reporting.doc", "report.*")).toBe(false);
    expect(matchSourceNamePattern("notes", "a*,report")).toBe(false);
    expect(matchSourceNamePattern("notes", "")).toBe(true);
  });
  it("converts source KB and relative/absolute local date bounds", () => {
    const q = { ...createSourceFindQuery("/"), date: { months: 1 }, size: { atLeast: false, kb: 2 } };
    const request = sourceFindSearchRequest(q, new Date(2026, 10, 13, 10).getTime());
    expect(request.modifiedAfter).toBe(new Date(2026, 9, 13).getTime());
    expect(request.modifiedBefore).toBe(new Date(2026, 10, 14).getTime() - 1);
    expect(request.maxSizeBytes).toBe(2048);
    const dates = sourceFindSearchRequest({ ...q, date: { from: "2026-11-01", to: "2026-11-02" } });
    expect(dates.modifiedAfter).toBe(new Date(2026, 10, 1).getTime());
    expect(dates.modifiedBefore).toBe(new Date(2026, 10, 3).getTime() - 1);
  });
  it("filters real nested VFS entries without affecting recursive traversal", async () => {
    const store = new VirtualFileStore();
    await store.mkdir("/Documents");
    await store.write("abc", "/Documents/Report.txt");
    await store.write("x".repeat(3000), "/Documents/Photo.png");
    await store.write("abc", "/Documents/Notes.txt");
    const q = { ...createSourceFindQuery("/"), namePattern: "*.TXT",
      kind: "text" as const, size: { atLeast: false, kb: 1 } };
    const res = await searchFiles(store, { ...sourceFindSearchRequest(q), maxResults: 20 });
    expect(res.files.map(file => file.name)).toEqual(["Notes.txt", "Report.txt"]);
    expect(matchesSourceKind({ uri: "/Documents", name: "Documents", type: "directory",
      size: 0, mtime: 0 }, "folder")).toBe(true);
    expect((await searchFiles(store, { ...sourceFindSearchRequest(q), subfolders: false })).files)
      .toHaveLength(0);
  });
});

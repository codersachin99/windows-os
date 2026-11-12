import { describe, expect, it } from "vitest";
import { ABOUT_LINK_KEYS, readSourceAboutLinks, safeAboutUrl } from "./model";

describe("source About APP_CONFIG link contract", () => {
  it("reads exactly the five dynamic APP_CONFIG keys from pinned source", () => {
    expect(ABOUT_LINK_KEYS).toEqual([
      "url", "privacyUrl", "changelogUrl", "reportIssue", "creditsUrl"
    ]);
    const queries: string[]=[];
    const urls=readSourceAboutLinks({ getUrl(name) {
      queries.push(name);
      return "https://example.org/" + name;
    } });
    expect(queries).toEqual(ABOUT_LINK_KEYS);
    expect(urls).toEqual({
      url:"https://example.org/url",
      privacyUrl:"https://example.org/privacyUrl",
      changelogUrl:"https://example.org/changelogUrl",
      reportIssue:"https://example.org/reportIssue",
      creditsUrl:"https://example.org/creditsUrl"
    });
  });
  it("never invents destinations when source APP_CONFIG is missing", () => {
    expect(readSourceAboutLinks(null)).toEqual({
      url:null,privacyUrl:null,changelogUrl:null,reportIssue:null,creditsUrl:null
    });
  });
  it("rejects non-HTTPS, script, file, relative and credential-bearing URLs", () => {
    for(const value of [
      null,undefined,"","#","/privacy","http://example.org",
      "javascript:alert(1)","data:text/html,abc","file:///etc/passwd",
      "https://user:pass@example.org", "ftp://example.org",
      "https://", {}
    ]) expect(safeAboutUrl(value)).toBeNull();
    expect(safeAboutUrl("https://example.org/privacy"))
      .toBe("https://example.org/privacy");
  });
  it("keeps configured values when another APP_CONFIG key errors or is missing", () => {
    const urls=readSourceAboutLinks({getUrl(key) {
      if(key==="privacyUrl")throw new Error("Unavailable");
      if(key==="creditsUrl")return "#";
      return "https://example.org/"+key;
    }});
    expect(urls.url).toBe("https://example.org/url");
    expect(urls.privacyUrl).toBeNull();
    expect(urls.creditsUrl).toBeNull();
    expect(urls.changelogUrl).toBe("https://example.org/changelogUrl");
  });
});

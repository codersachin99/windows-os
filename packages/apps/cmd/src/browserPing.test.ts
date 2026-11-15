import {describe,it,expect} from "vitest";
import {sourceCmdPingImageUrl} from "./browserPing";

describe("original source a3be Ping.js favicon URL",()=>{
  it("uses the source pathname and bare timestamp cache-buster",()=>{
    expect(sourceCmdPingImageUrl("example.com",1234))
      .toBe("https://example.com/favicon.ico?1234");
    expect(sourceCmdPingImageUrl("https://example.com/something",444))
      .toBe("https://example.com/favicon.ico?444");
    expect(sourceCmdPingImageUrl("http://localhost:8000",7))
      .toBe("http://localhost:8000/favicon.ico?7");
  });
  it("rejects non-http(s), credentials and malformed source targets",()=>{
    expect(()=>sourceCmdPingImageUrl("javascript://evil",1)).toThrow();
    expect(()=>sourceCmdPingImageUrl("data://payload",1)).toThrow();
    expect(()=>sourceCmdPingImageUrl("https://user:pass@example.com",1)).toThrow();
    expect(()=>sourceCmdPingImageUrl("bad target name",1)).toThrow();
    expect(()=>sourceCmdPingImageUrl("",1)).toThrow();
  });
});

import {describe,it,expect} from "vitest";
import {sourceNotificationInline,sourceNotificationLinkUrl} from "./sourceNotificationLinks";
describe("safe source notification inline links",()=>{
  it("parses the original localized changelog form and preserves line breaks",()=>{
    expect(sourceNotificationInline("New updates.\nCheck [changelog](https://visnalize.com/win7simu/changelog).")).toEqual([
      {kind:"text",text:"New updates.\nCheck "},{kind:"link",text:"changelog",href:"https://visnalize.com/win7simu/changelog"},{kind:"text",text:"."}
    ]);
  });
  it("preserves ordinary HTML and refuses unsafe or ambiguous destinations",()=>{
    for(const url of ["javascript:alert(1)","data:text/html,test","file:///tmp/file","//example.com","https://user:password@example.com","https://example.com\\test","https://example.com/a b"]){
      expect(sourceNotificationLinkUrl(url)).toBeUndefined();
      const source="[link]("+url+")";
      expect(sourceNotificationInline(source)).toEqual([{kind:"text",text:source}]);
    }
    expect(sourceNotificationInline("<img src=x onerror=alert(1)>")).toEqual([{kind:"text",text:"<img src=x onerror=alert(1)>"}]);
  });
  it("supports multiple HTTP(S) links without interpreting their labels as HTML",()=>{
    expect(sourceNotificationInline("[<b>A</b>](https://example.com) [B](http://example.org/path)")).toEqual([
      {kind:"link",text:"<b>A</b>",href:"https://example.com/"},{kind:"text",text:" "},{kind:"link",text:"B",href:"http://example.org/path"}
    ]);
  });
});

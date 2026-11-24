import {describe,it,expect} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import {SourceMacOSNotificationToast} from "./SourceMacOSNotificationToast";
describe("macOS notification markup",()=>{
  it("renders the source close hook and escapes message content",()=>{
    const html=renderToStaticMarkup(<SourceMacOSNotificationToast message={{
      id:"sample",type:"warning",title:"Warning",body:"<script>bad()</script>",seen:false,read:false
    }} onDismiss={()=>{}}/>);
    expect(html).toContain("data-test-system-notification");
    expect(html).toContain("data-test-notification-close");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
